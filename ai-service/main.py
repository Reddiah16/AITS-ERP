from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import prediction, chatbot
from services.ml_service import init_models
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-Service")

app = FastAPI(
    title="AITS Rajampet ERP AI Predictive Analytics & Chatbot Engine",
    description="Python FastAPI Microservice featuring ML predictors and support chatbot assistant",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Models on Startup
@app.on_event("startup")
def startup_event():
    logger.info("Initializing Machine Learning models...")
    init_models()
    logger.info("Machine Learning models loaded successfully")

# Include Routers
app.include_router(prediction.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "AITS Rajampet ERP AI Predictive Engine",
        "documentation": "/docs"
    }
