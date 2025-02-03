from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import re
import ast
from datetime import datetime
from typing import Dict, Any

class FlightDataExtractor:
    def __init__(self):
        # IATA airport codes and their corresponding names
        self.iata_airports = {
            'IST': 'Istanbul Airport',
            'LHR': 'London Heathrow Airport',
            'HRG': 'Hurghada International Airport',
            'AYT': 'Antalya Airport',
            'BJV': 'Milas-Bodrum Airport',
            'SSH': 'Sharm El Sheikh International Airport',
            'RZV': 'Rize-Artvin Airport',
            'DNZ': 'Denizli Çardak Airport',
            'DLM': 'Dalaman Airport',
            'ECN': 'Ercan International Airport',
            'EBL': 'Erbil International Airport',
            'GZT': 'Gaziantep Oğuzeli Airport',
            'ASR': 'Kayseri Erkilet Airport',
            'VKO': 'Vnukovo International Airport',
            'OGU': 'Ordu-Giresun Airport',
            'MQM': 'Mardin Airport',
            'ADB': 'Izmir Adnan Menderes Airport',
            'TIA': 'Tirana International Airport',
            'AMM': 'Queen Alia International Airport',
            'SCO': 'Aktau Airport',
            'SAW': 'Sabiha Gökçen International Airport',
            'KHI': 'Jinnah International Airport',
            'COV': 'Coventry Airport',
            'KWI': 'Kuwait International Airport',
            'RUH': 'King Khalid International Airport',
            'KUT': 'David the Builder Kutaisi International Airport',
            'NQZ': 'Nursultan Nazarbayev International Airport',
            'DXB': 'Dubai International Airport',
            'SHJ': 'Sharjah International Airport',
            'GYD': 'Heydar Aliyev International Airport',
            'HBE': 'Borg El Arab Airport',
            'TBZ': 'Tabriz International Airport',
            'ERZ': 'Erzurum Airport',
            'DOH': 'Hamad International Airport',
            'BEY': 'Beirut-Rafic Hariri International Airport',
            'TZX': 'Trabzon Airport',
            'ESB': 'Ankara Esenboğa Airport',
            'TBS': 'Tbilisi International Airport',
            'IKA': 'Imam Khomeini International Airport',
            'SPX': 'Sphinx International Airport',
            'PRN': 'Pristina International Airport',
            'CMN': 'Casablanca Mohammed V International Airport',
            'KYA': 'Konya Airport',
            'ATH': 'Athens International Airport',
            'ALA': 'Almaty International Airport',
            'SZF': 'Samsun Çarşamba Airport',
            'EDO': 'Balıkesir Koca Seyit Airport',
            'JED': 'King Abdulaziz International Airport',
            'ADF': 'Adıyaman Airport',
            'EVN': 'Zvartnots International Airport',
            'MED': 'Prince Mohammad bin Abdulaziz Airport',
            'BGW': 'Baghdad International Airport',
            'RMO': 'Rome Fiumicino Airport',
            'SKP': 'Skopje International Airport',
            'DIY': 'Diyarbakır Airport',
            'MCT': 'Muscat International Airport',
            'KCM': 'Kahramanmaraş Airport',
            'MLX': 'Malatya Erhaç Airport',
            'CIT': 'Shymkent International Airport',
            'DMM': 'King Fahd International Airport',
            'BAH': 'Bahrain International Airport',
            'AUH': 'Abu Dhabi International Airport',
            'BGG': 'Bingöl Airport',
            'SJJ': 'Sarajevo International Airport',
            'MSR': 'Muş Airport',
            'KSY': 'Kars Harakani Airport',
            'GNY': 'Şanlıurfa GAP Airport',
            'TZL': 'Tuzla International Airport',
            'IFN': 'Isfahan International Airport',
            'NOP': 'Sinop Airport',
            'EZS': 'Elazığ Airport',
            'BAL': 'Batman Airport',
            'FRU': 'Bishkek Manas International Airport',
            'LED': 'Pulkovo Airport (St. Petersburg)',
            'IGD': 'Iğdır Airport',
            'SOF': 'Sofia Airport',
            'VAN': 'Van Ferit Melen Airport',
            'ERC': 'Erzincan Airport',
            'MHD': 'Mashhad International Airport',
            'BSR': 'Basra International Airport',
            'OSS': 'Osh Airport',
            'MZH': 'Amasya Merzifon Airport',
            'GZP': 'Gazipaşa-Alanya Airport',
            'VAS': 'Sivas Nuri Demirağ Airport',
            'OTP': 'Bucharest Henri Coandă International Airport',
            'SYZ': 'Shiraz International Airport',
            'BER': 'Berlin Brandenburg Airport',
            'MUC': 'Munich Airport',
            'FRA': 'Frankfurt Airport',
        }

        # Default user response template
        self.default_response = {
            "departure": "",
            "destination": "",
            "start_date": "",
            "end_date": "",
            "return_start_date": "",
            "return_end_date": "",
            "one_way": True,
        }

        # Initialize the model and chain
        self.model = ChatOpenAI(
            model_name="gpt-4o-mini-2024-07-18",
            temperature=0.1
        )
        
        # Base prompt for data collection
        self.base_prompt = """
        You are an AI assistant designed to extract key information from user responses and update the corresponding fields in a dictionary.

        ### **Instructions:**
        - Identify if the user mentions **departure airport, destination airport, travel dates, or ticket type (one-way/round-trip).**
        - If the user provides a **city**, find the corresponding **major airport's IATA code**.
        - If the user provides an **IATA airport code**, use it directly.
        - Use the provided **airport mapping table** to ensure correct IATA codes.
        - If a value is already set and the new information contradicts it, replace the old value with the new one.
        - If user says return date, update relevant filed and also set one_way to False.
        ---
        - Extract travel dates and store them in **DD/MM/YYYY format**.
        - If the user mentions **one-way**, set `"one_way": true` and clear return dates.
        - If the user provides a **date without a year**, assume the current year 2025.
        - Update only the relevant field. Leave the other information unchanged.
        """

        # Template for list generation
        self.prompt_template = ChatPromptTemplate.from_template(
            """{base_prompt}

            Current dictionary state: {user_responses}

            Analyze this user message and update the dictionary:
            {conversation}

            Airport Mapping (Names → IATA):
            {iata_airports}

            Return a Python dictionary (not JSON) with this structure:
            {{
                "departure": "",
                "destination": "",
                "start_date": "",
                "end_date": "",
                "return_start_date": "",
                "return_end_date": "",
                "one_way": True
            }}
            """
        )

        # Create the chain
        self.chain = self.prompt_template | self.model | StrOutputParser()

    def extract_flight_data(self, conversation: str, current_responses: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Extract flight information from user conversation and update the response dictionary.
        
        Args:
            conversation (str): The user's message
            current_responses (Dict[str, Any], optional): Current state of responses
            
        Returns:
            Dict[str, Any]: Updated flight information dictionary
        """
        try:
            if current_responses is None:
                current_responses = self.default_response.copy()

            # Get model response
            raw_response = self.chain.invoke({
                "base_prompt": self.base_prompt,
                "conversation": conversation,
                "iata_airports": self.iata_airports,
                "user_responses": str(current_responses)
            })

            # Convert string response to dictionary
            return self._convert_to_dict(raw_response)

        except Exception as e:
            print(f"Error extracting flight data: {str(e)}")
            return self.default_response.copy()

    def _convert_to_dict(self, raw_string: str) -> Dict[str, Any]:
        """
        Convert the model's string output to a Python dictionary.
        
        Args:
            raw_string (str): The raw string output from the model
            
        Returns:
            Dict[str, Any]: Converted dictionary
        """
        try:
            # Clean the string
            cleaned = re.sub(r"^```python", "", raw_string.strip())
            cleaned = re.sub(r"```$", "", cleaned.strip(), flags=re.MULTILINE).strip()
            
            # Convert to dictionary
            return ast.literal_eval(cleaned)
        except Exception as e:
            print(f"Error converting to dictionary: {str(e)}")
            return self.default_response.copy()

    def get_airport_name(self, iata_code: str) -> str:
        """
        Get airport name from IATA code.
        
        Args:
            iata_code (str): IATA airport code
            
        Returns:
            str: Airport name or empty string if not found
        """
        return self.iata_airports.get(iata_code.upper(), "")

    def validate_dates(self, flight_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and format dates in the flight data.
        
        Args:
            flight_data (Dict[str, Any]): Flight data dictionary
            
        Returns:
            Dict[str, Any]: Validated flight data
        """
        date_fields = ['start_date', 'end_date', 'return_start_date', 'return_end_date']
        
        for field in date_fields:
            if flight_data.get(field):
                try:
                    # Parse and reformat date
                    date = datetime.strptime(flight_data[field], '%d/%m/%Y')
                    flight_data[field] = date.strftime('%d/%m/%Y')
                except ValueError:
                    flight_data[field] = ""

        return flight_data
