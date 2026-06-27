from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ml_service import predict_attendance, predict_placement

router = APIRouter(prefix="/predictions", tags=["Predictions"])

class AttendanceInput(BaseModel):
    pastSemesters: list[float]

class PlacementInput(BaseModel):
    gpa: float
    attendance: float
    hackathons: int
    backlogs: int

class PerformanceInput(BaseModel):
    gpa: float
    attendance: float

@router.post("/attendance")
def get_attendance_prediction(data: AttendanceInput):
    if len(data.pastSemesters) < 1:
        raise HTTPException(status_code=400, detail="Must provide past attendance rates")
    # Pad to 3 semesters if less
    rates = data.pastSemesters
    while len(rates) < 3:
        rates.append(rates[-1])
    rates = rates[:3]
    
    pred = predict_attendance(rates)
    trend = "Improving" if pred > rates[-1] else ("Stable" if pred == rates[-1] else "Declining")
    
    return {
        "predictedAttendance": round(pred, 2),
        "trend": trend
    }

@router.post("/placement")
def get_placement_prediction(data: PlacementInput):
    prob = predict_placement(data.gpa, data.attendance, data.hackathons, data.backlogs)
    
    # Skill Gap Recommendations based on stats
    skills = ["Data Structures", "Algorithms"]
    if data.gpa < 7.5:
        skills.append("Aptitude Preparation")
    if data.hackathons < 2:
        skills.append("Fullstack Development Projects")
    
    return {
        "placementProbability": round(prob, 2),
        "recommendedSkills": ", ".join(skills),
        "resumeTips": "Include links to GitHub and mention completed projects."
    }

@router.post("/performance")
def get_performance_prediction(data: PerformanceInput):
    # Calculate performance failure risk
    risk = 0.0
    if data.gpa < 6.0:
        risk += 40.0
    if data.attendance < 75.0:
        risk += 40.0
        
    gpa_forecast = min(10.0, max(0.0, data.gpa + (0.5 if data.attendance >= 85.0 else -0.5)))
    
    status = "Risk" if risk >= 50.0 else ("Average" if risk >= 20.0 else "Excellent")
    
    return {
        "performanceStatus": status,
        "failureRiskPercent": round(risk, 2),
        "gpaForecast": round(gpa_forecast, 2)
    }
