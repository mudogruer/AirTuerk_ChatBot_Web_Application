from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import MessagesPlaceholder, ChatPromptTemplate
from langchain.chains import create_history_aware_retriever
from langchain_core.messages import HumanMessage, AIMessage
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.document_loaders import TextLoader
from flight_data_extractor import FlightDataExtractor
import os
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

load_dotenv()

chat_histories = {}
flight_data = {}
vector = None
retriever_chain = None
flight_extractor = FlightDataExtractor()
flight_data_df = None
llm = None

def initialize_rag():
    global vector, retriever_chain, flight_data_df, llm
    
    try:
        llm = ChatOpenAI(
            model_name="gpt-4o-mini-2024-07-18",
            temperature=0.7
        )
        
        loader = TextLoader("rag_file.txt")
        docs = loader.load()
        
        embeddings = OpenAIEmbeddings()
        text_splitter = RecursiveCharacterTextSplitter()
        documents = text_splitter.split_documents(docs)

<<<<<<< HEAD
=======
        # faiss_file = "faiss_index"
        # # Eğer FAISS indexi zaten varsa, belleğe yüklemek yerine diskten kullan
        # if os.path.exists(faiss_file):
        #     vector.index = faiss.read_index(faiss_file)
        #     print("Loaded FAISS index from disk.")
        # else:
        #     vector = FAISS.from_documents(documents, embeddings)
        #     faiss.write_index(vector.index, faiss_file)
        #     print("Created FAISS index and saved to disk.")
>>>>>>> 4850b87 (pushing the project)
        vector = FAISS.from_documents(documents, embeddings)
        retriever = vector.as_retriever()
        
        retriever_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are Airtuerk's AI bot. Follow these rules strictly:
                      1. Always maintain the conversation in the specified language
                      2. Be consistent with your responses
                      3. Check previous chat history before asking questions
                      4. If flight information is already provided, don't ask for it again
                      
                      Current flight information: {flight_info}"""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            ("user", "Respond naturally in {language}. Use appropriate cultural context and formality for the language.")
        ])

        document_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are Airtuerk's AI bot. Follow these rules strictly:
                      1. Always maintain the conversation in the specified language
                      2. Be consistent with your responses
                      3. Check previous chat history before asking questions
                      4. If flight information is already provided, don't ask for it again
                      
                      Current flight information: {flight_info}"""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            ("user", "Use this context to help answer: {context}"),
            ("user", "Respond naturally in {language}. Use appropriate cultural context and formality for the language.")
        ])
        
        retriever_chain_temp = create_history_aware_retriever(llm, retriever, retriever_prompt)
        document_chain = create_stuff_documents_chain(llm, document_prompt)
        retriever_chain = create_retrieval_chain(retriever_chain_temp, document_chain)
        
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            excel_path = os.path.join(current_dir, 'flight_with_headers.xlsx')
            print(f"Trying to load Excel file from: {excel_path}")
            
            if not os.path.exists(excel_path):
                print(f"Excel file not found at: {excel_path}")
                flight_data_df = pd.DataFrame()
                return True

            flight_data_df = pd.read_excel(excel_path)
            print(f"Flight data loaded successfully! Found {len(flight_data_df)} rows")
            print("Columns:", flight_data_df.columns.tolist())
        except Exception as e:
            print(f"Error loading flight data: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            flight_data_df = pd.DataFrame()
            return True
        
        print("RAG system initialized successfully!")
        return True
        
    except Exception as e:
        print(f"Error initializing RAG system: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'message': 'OK'})

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        global retriever_chain
        if retriever_chain is None:
            success = initialize_rag()
            if not success:
                return jsonify({'error': 'Failed to initialize RAG system'}), 500

        data = request.json
        user_input = data.get('message')
        session_id = data.get('sessionId')
        language = data.get('language', 'English')
        
        if not user_input:
            return jsonify({'error': 'No message provided'}), 400
            
        if session_id not in chat_histories:
            chat_histories[session_id] = []
            flight_data[session_id] = flight_extractor.default_response.copy()
        
        updated_flight_data = flight_extractor.extract_flight_data(
            user_input, 
            flight_data[session_id]
        )
        flight_data[session_id] = updated_flight_data
        
        chat_history = chat_histories[session_id]
        
        response = retriever_chain.invoke({
            "language": language,
            "flight_info": str(flight_data[session_id]),
            "input": user_input,
            "chat_history": chat_history
        })
        
        chat_history.extend([
            HumanMessage(content=user_input),
            AIMessage(content=response["answer"])
        ])
        
        return jsonify({
            'response': response["answer"],
            'sessionId': session_id,
            'flightData': flight_data[session_id]
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/reset', methods=['POST'])
def reset_chat():
    try:
        data = request.json
        session_id = data.get('sessionId')
        
        if session_id in chat_histories:
            chat_histories[session_id] = []
            flight_data[session_id] = flight_extractor.default_response.copy()
        
        return jsonify({
            'message': 'Chat history reset successfully',
            'sessionId': session_id,
            'flightData': flight_data[session_id]
        })
        
    except Exception as e:
        print(f"Error in reset endpoint: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/search', methods=['POST'])
def search():
    try:
        data = request.json
        departure = data.get('departure')
        destination = data.get('destination')
        start_date = data.get('startDate')
        return_date = data.get('returnDate')
        one_way = data.get('oneWay', 'true').lower() == 'true'
        
        if not departure or not destination:
            return jsonify({
                'error': 'Incomplete flight information',
                'message': 'Both departure and destination are required'
            }), 400

        try:
            start_date = datetime.strptime(start_date, '%d/%m/%Y') if start_date else None
            return_date = datetime.strptime(return_date, '%d/%m/%Y') if return_date else None
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

        outbound_flights = flight_data_df[
            (flight_data_df['departure_iata'] == departure) &
            (flight_data_df['arrival_iata'] == destination)
        ]

        if start_date:
            outbound_flights = outbound_flights[
                pd.to_datetime(flight_data_df['departure_date'], format='%d/%m/%y').dt.date == start_date.date()
            ]

        return_flights = None
        if not one_way and return_date:
            return_flights = flight_data_df[
                (flight_data_df['departure_iata'] == destination) &
                (flight_data_df['arrival_iata'] == departure)
            ]
            
            if return_date:
                return_flights = return_flights[
                    pd.to_datetime(flight_data_df['departure_date'], format='%d/%m/%y').dt.date == return_date.date()
                ]

        print("Available columns:", flight_data_df.columns.tolist())

        columns_mapping = {
            'flight_key': 'flightNumber',
            'airline_code': 'airlineCode',
            'departure_iata': 'departureAirport',
            'arrival_iata': 'arrivalAirport',
            'departure_date': 'departureDate',
            'departure_time': 'departureTime',
            'arrival_date': 'arrivalDate',
            'arrival_time': 'arrivalTime',
            'fare_desc': 'fareClass',
            'price_adt': 'price',
            'baggage': 'baggage'
        }

        available_columns = set(flight_data_df.columns)
        required_columns = set(columns_mapping.keys())
        missing_columns = required_columns - available_columns
        
        if missing_columns:
            return jsonify({
                'error': f'Missing columns in Excel file: {missing_columns}'
            }), 500

        outbound_flights = outbound_flights[columns_mapping.keys()].rename(columns=columns_mapping)
        if return_flights is not None:
            return_flights = return_flights[columns_mapping.keys()].rename(columns=columns_mapping)

        def format_flight_data(df):
            if df.empty:
                return []
            
            records = df.to_dict('records')
            
            for record in records:
                try:
                    if record['departureTime']:
                        record['departureTime'] = str(record['departureTime'])[:5]
                    if record['arrivalTime']:
                        record['arrivalTime'] = str(record['arrivalTime'])[:5]
                except:
                    pass

                try:
                    if record['departureDate']:
                        if isinstance(record['departureDate'], str):
                            record['departureDate'] = datetime.strptime(record['departureDate'], '%d/%m/%y').strftime('%d/%m/%Y')
                        else:
                            record['departureDate'] = pd.to_datetime(record['departureDate']).strftime('%d/%m/%Y')
                            
                    if record['arrivalDate']:
                        if isinstance(record['arrivalDate'], str):
                            record['arrivalDate'] = datetime.strptime(record['arrivalDate'], '%d/%m/%y').strftime('%d/%m/%Y')
                        else:
                            record['arrivalDate'] = pd.to_datetime(record['arrivalDate']).strftime('%d/%m/%Y')
                except:
                    pass
            
            return records

        outbound_list = format_flight_data(outbound_flights)
        return_list = format_flight_data(return_flights) if return_flights is not None else []

        return jsonify({
            'outboundFlights': outbound_list,
            'returnFlights': return_list,
            'searchParams': {
                'departure': departure,
                'destination': destination,
                'startDate': start_date.strftime('%d/%m/%Y') if start_date else None,
                'returnDate': return_date.strftime('%d/%m/%Y') if return_date else None,
                'oneWay': one_way
            }
        })

    except Exception as e:
        print(f"Error searching flights: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Initializing RAG system...")
    initialize_rag()
    app.run(debug=True, port=5050, host='0.0.0.0')
