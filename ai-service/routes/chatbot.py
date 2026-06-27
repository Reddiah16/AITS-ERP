from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import os

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatMessage(BaseModel):
    message: str
    role: str = "student" # student or faculty

# ERP rule-based support answers fallback if OpenAI API key is not supplied
ERP_HELP_DATABASE = {
    "attendance": "You can check your attendance percentage in the Attendance module of the sidebar. You need to maintain at least 75% attendance to be eligible for examinations.",
    "exams": "Internal marks can be checked in the 'Internal Marks' section. Hall tickets will be issued under the 'Hall Tickets' menu after semester fees clearance.",
    "results": "Semester grades and SGPA/CGPA calculations are published in the 'Results & GPA' page once verified by the registrar.",
    "placement": "Placement drives are listed under 'Placements'. Students can upload resumes and apply to active recruitment drives directly from there.",
    "library": "Books can be borrowed from the college library for up to 14 days. Overdue issues are subject to a late fee fine of ₹2 per day.",
}

@router.post("/query")
def process_chat_message(data: ChatMessage):
    msg = data.message.lower()
    
    # Check if OpenAI key is present
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            openai.api_key = api_key
            system_prompt = f"You are a helpful AITS Rajampet ERP Support Assistant answering a {data.role}."
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": data.message}
                ]
            )
            return {"reply": response.choices[0].message.content}
        except Exception:
            pass # Fall back to rule-based answers if API call fails
            
    # Rule-based fallback answers
    for key, answer in ERP_HELP_DATABASE.items():
        if key in msg:
            return {"reply": answer}
            
    return {"reply": "I am the AITS Rajampet ERP support assistant. How can I help you check your attendance, grades, placement drives, or library book records today?"}
