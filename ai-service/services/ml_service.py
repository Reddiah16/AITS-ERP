import os
import joblib
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestClassifier

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# 1. Train Attendance Trend Model
def train_attendance_model():
    # Features: past attendance rates (e.g. 3 semesters) -> Output: predicted attendance %
    X = np.array([[70, 75, 72], [85, 90, 88], [95, 98, 97], [60, 58, 62], [75, 80, 82]])
    y = np.array([74.0, 89.0, 97.5, 60.5, 81.0])
    
    model = LinearRegression()
    model.fit(X, y)
    
    joblib.dump(model, os.path.join(MODEL_DIR, "attendance_model.pkl"))
    print("✓ Attendance Linear Regression model trained and saved successfully")

# 2. Train Placement Probability Model
def train_placement_model():
    # Features: [GPA, attendance%, hackathons_attended, active_backlogs] -> Output: placed (1) or not (0)
    X = np.array([
        [9.2, 95.0, 4, 0],
        [7.5, 85.0, 2, 0],
        [6.1, 75.0, 1, 1],
        [8.5, 90.0, 3, 0],
        [5.5, 65.0, 0, 2],
        [8.0, 88.0, 2, 0]
    ])
    y = np.array([1, 1, 0, 1, 0, 1])
    
    model = RandomForestClassifier(n_estimators=10)
    model.fit(X, y)
    
    joblib.dump(model, os.path.join(MODEL_DIR, "placement_model.pkl"))
    print("✓ Placement RandomForestClassifier model trained and saved successfully")

# Initialize models
def init_models():
    train_attendance_model()
    train_placement_model()

# Load and Predict Helpers
def predict_attendance(past_rates: list) -> float:
    try:
        model_path = os.path.join(MODEL_DIR, "attendance_model.pkl")
        if not os.path.exists(model_path):
            train_attendance_model()
        model = joblib.load(model_path)
        pred = model.predict([past_rates])[0]
        return float(np.clip(pred, 0, 100))
    except Exception as e:
        print(f"Error predicting attendance: {e}")
        return sum(past_rates) / len(past_rates) if past_rates else 75.0

def predict_placement(gpa: float, attendance: float, hackathons: int, backlogs: int) -> float:
    try:
        model_path = os.path.join(MODEL_DIR, "placement_model.pkl")
        if not os.path.exists(model_path):
            train_placement_model()
        model = joblib.load(model_path)
        probs = model.predict_proba([[gpa, attendance, hackathons, backlogs]])[0]
        return float(probs[1] * 100) # Placement probability %
    except Exception as e:
        print(f"Error predicting placement: {e}")
        return 50.0
