from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
import datetime

router = APIRouter()

class VitalsAI(BaseModel):
    heart_rate: float
    hrv: float
    breathing_rate: float
    blood_pressure: str
    stress_index: float

class EmpathicAI(BaseModel):
    dominant_emotion: str
    vocal_tone_stress: float
    sentiment_score: float
    trust_index: float

class DermalHealth(BaseModel):
    skin_tone_hex: str
    fitzpatrick_type: str
    melanin_index: float

class Metrics(BaseModel):
    vitals_ai: VitalsAI
    empathic_ai: EmpathicAI
    dermal_health: DermalHealth

class AnalysisResponse(BaseModel):
    status: str
    timestamp: str
    analysis_id: str
    metrics: Metrics

from api.ml_engine import process_image, validate_face_fast
import traceback
from database import insert_scan, get_all_scans, get_scan_by_user_id

class ValidationResponse(BaseModel):
    face_detected: bool
    face_centered: bool
    forehead_visible: bool

@router.post("/analyze/validate_face", response_model=ValidationResponse)
async def validate_face(
    image_payload: UploadFile = File(...)
):
    try:
        image_bytes = await image_payload.read()
        res = validate_face_fast(image_bytes)
        return ValidationResponse(**res)
    except Exception as e:
        return ValidationResponse(face_detected=False, face_centered=False, forehead_visible=False)

@router.post("/analyze/facial_feature_set", response_model=AnalysisResponse)
async def analyze_facial_features(
    user_id: str = Form(...),
    full_name: str = Form("Unknown"),
    age: str = Form("Unknown"),
    gender: str = Form("Unknown"),
    ambient_lux: float = Form(...),
    calibration_index: int = Form(...),
    image_payload: UploadFile = File(...)
):
    try:
        # Read uploaded image bytes
        image_bytes = await image_payload.read()
        
        # Process the image with MediaPipe 100-Point mapping
        ml_results = process_image(image_bytes)
        
        # Save to database for Admin Portal
        insert_scan(user_id, full_name, age, gender, image_bytes, ml_results)
        
        return AnalysisResponse(
            status="success",
            timestamp=datetime.datetime.utcnow().isoformat() + "Z",
            analysis_id=f"req-{user_id[:5]}-ml",
            metrics=Metrics(**ml_results)
        )
    except ValueError as ve:
        # Catch specific ML engine validation errors (NO_FACE_DETECTED, etc.)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"ML Engine Error: {e}")
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail="Internal AI Engine Error")

@router.get("/admin/records")
async def fetch_admin_records():
    try:
        records = get_all_scans()
        return {"status": "success", "count": len(records), "data": records}
    except Exception as e:
        print(f"DB Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch records")

@router.get("/admin/record/{user_id}")
async def fetch_single_record(user_id: str):
    try:
        record = get_scan_by_user_id(user_id)
        if not record:
            raise HTTPException(status_code=404, detail="Scan not found")
        return {"status": "success", "data": record}
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch record")
