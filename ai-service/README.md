# AITS Rajampet ERP — AI Predictive Analytics & Chatbot Microservice

Python FastAPI microservice implementing Machine Learning models and OpenAI assistant chatbot integration for the Annamacharya Institute of Technology & Sciences (AITS), Rajampet College ERP system.

## 🚀 Key Modules
* **Attendance Predictions**: Traces past records and forecasts attendance percentage.
* **Placement Predictions**: Predicts recruitment probabilities based on academic stats and hackathons.
* **Performance Forecasting**: Predicts fail risk and maps skill gap recomendations.
* **OpenAI ERP Support Chatbot**: Leverages OpenAI API with fallback rule-based matching.

## 🛠️ Installation & Setup

### Option 1: Run via Docker Compose (Recommended)
1. Run from the root directory of the workspace:
   ```bash
   docker-compose up --build -d
   ```
2. The AI Service Swagger interface will be active at `http://localhost:8000/docs`.

### Option 2: Local Development
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
2. Install Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
