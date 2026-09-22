from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

# Request schemas
class ImageUploadRequest(BaseModel):
    """Request for uploading and analyzing an image"""
    asset_id: str
    asset_type: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class InferenceResponse(BaseModel):
    """Response from YOLO inference"""
    status: str
    detections: List[Dict[str, Any]]
    num_detections: int
    error: Optional[str] = None

class RiskPredictionResponse(BaseModel):
    """Response from risk prediction"""
    status: str
    risk_score: float
    severity: str
    features: Dict[str, float]
    error: Optional[str] = None

class AnalysisResponse(BaseModel):
    """Full analysis response (image upload + inference + risk)"""
    id: int
    asset_id: str
    image_filename: str
    detections: List[Dict[str, Any]]
    num_detections: int
    risk_score: float
    severity: str
    defect_count: int
    mean_confidence: float
    created_at: datetime
    status: str

class AssetResponse(BaseModel):
    """Infrastructure asset response"""
    id: int
    asset_id: str
    asset_type: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    severity: str
    risk_score: float
    defects_count: int
    last_inspection: datetime
    
    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    """Dashboard statistics"""
    total_assets: int
    critical_issues: int
    high_risk_assets: int
    medium_risk_assets: int
    low_risk_assets: int
    total_defects: int

class DashboardDataResponse(BaseModel):
    """Full dashboard data"""
    stats: DashboardStatsResponse
    assets: List[AssetResponse]
    recent_analyses: List[AnalysisResponse]
