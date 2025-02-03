# ✈️ AirTuerk AI Chatbot Web Application

This project is a **flight search chatbot application** developed using a **Flask API (Backend)** and **React (Frontend)**. By integrating OpenAI's **GPT-4o Mini** model via the LangChain framework, it allows users to search for flights using natural language.

---

## 📂 **Project Structure**
    AirTuerk_ChatBot_Web_Implementation/ 
        ├── client/ # React-based frontend 
        ├── server/ # Flask-based backend (API) 
        ├── .gitignore 
        └── README.md


- **`client/`** → **React Frontend**  
  - Provides the user interface.
  - Enables interaction with the chatbot.
  - Displays flight information retrieved from the API.

- **`server/`** → **Flask Backend (API)**  
  - Processes user messages.
  - Generates responses using the OpenAI LLM model.
  - Filters flight data and returns appropriate options.

---

## 🚀 **Installation and Running**

### **Clone the Repository**

Clone the repository from GitHub using the following command:

```bash
git clone https://github.com/mudogruer/AirTuerk_ChatBot_Web_Implementation.git
```

### **1️⃣ Install Required Dependencies**
First, install the dependencies for both the **server** and the **client**.

#### **🔹 Backend (Flask API)**
```bash
cd server
pip install -r requirements.txt
```
#### **🔹 Frontend (React)**
```bash
cd client
npm install
```
#### **2️⃣ Start the Backend**
```bash
cd server
python app.py
```
#### **3️⃣ Run the Frontend**
```bash
cd client
npm start
```


Happy coding! ☺️

LG Mustafa.
