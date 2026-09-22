import os
import logging
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil
from datetime import datetime

from app.core.config import settings
from app.database.session import get_db, init_db, InfrastructureAsset, AnalysisResult
from app.services.ml_inference import YOLOInference, XGBoostInference
from app.schemas.responses import (
    ImageUploadRequest, AnalysisResponse, AssetResponse, 
    DashboardDataResponse, DashboardStatsResponse
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    debug=settings.API_DEBUG,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Global ML model instances
yolo_model = None
xgboost_model = None

@app.on_event("startup")
async def startup_event():
    """Initialize database and load ML models on startup"""
    global yolo_model, xgboost_model
    
    logger.info("Initializing Sentinel AI Backend...")
    
    # Initialize database
    init_db()
    logger.info("Database initialized")
    
    # Load YOLO model
    yolo_model = YOLOInference(settings.YOLO_MODEL_PATH)
    
    # Load XGBoost model
    xgboost_model = XGBoostInference(settings.XGBOOST_MODEL_PATH)
    
    logger.info("ML models loaded successfully")

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Sentinel AI Backend",
        "version": settings.API_VERSION,
    }

@app.post("/api/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_image(
    file: UploadFile = File(...),
    asset_id: str = Form(...),
    asset_type: str = Form(...),
    location: str = Form(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    db: Session = Depends(get_db),
):
    """
    Upload and analyze an infrastructure image.
    Returns YOLO detections and risk prediction.
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file
        upload_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Image saved to {upload_path}")
        
        # Get or create asset
        asset = db.query(InfrastructureAsset).filter_by(asset_id=asset_id).first()
        if not asset:
            asset = InfrastructureAsset(
                asset_id=asset_id,
                asset_type=asset_type,
                location=location,
                latitude=latitude,
                longitude=longitude,
            )
            db.add(asset)
            db.commit()
            db.refresh(asset)
            logger.info(f"Created new asset: {asset_id}")
        
        # Run YOLO inference
        inference_result = yolo_model.predict(upload_path, conf_threshold=settings.YOLO_CONF_THRESHOLD)
        
        if inference_result.get("status") != "success":
            raise HTTPException(status_code=500, detail="YOLO inference failed")
        
        detections = inference_result.get("detections", [])
        
        # Run risk prediction
        risk_result = xgboost_model.predict_risk(detections, image_width=640, image_height=640)
        
        if risk_result.get("status") != "success":
            logger.warning("Risk prediction failed, using fallback")
        
        risk_score = risk_result.get("risk_score", 0.0)
        severity = risk_result.get("severity", "Low")
        features = risk_result.get("features", {})
        
        # Store analysis result in database
        analysis = AnalysisResult(
            asset_id=asset.id,
            image_filename=file.filename,
            image_path=upload_path,
            detections=detections,
            num_detections=len(detections),
            risk_score=risk_score,
            severity=severity,
            defect_count=features.get("defect_count", 0),
            mean_confidence=features.get("mean_confidence", 0.0),
            mean_area=features.get("mean_area_norm", 0.0),
            max_area=features.get("max_area_norm", 0.0),
            status="completed",
            completed_at=datetime.utcnow(),
        )
        db.add(analysis)
        
        # Update asset with latest metrics
        asset.risk_score = risk_score
        asset.severity = severity
        asset.defects_count = len(detections)
        asset.last_inspection = datetime.utcnow()
        
        db.commit()
        db.refresh(analysis)
        
        logger.info(f"Analysis completed: {asset_id}, risk={risk_score}, severity={severity}")
        
        return AnalysisResponse(
            id=analysis.id,
            asset_id=asset.asset_id,
            image_filename=analysis.image_filename,
            detections=analysis.detections,
            num_detections=analysis.num_detections,
            risk_score=analysis.risk_score,
            severity=analysis.severity,
            defect_count=analysis.defect_count,
            mean_confidence=analysis.mean_confidence,
            created_at=analysis.created_at,
            status=analysis.status,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard", response_model=DashboardDataResponse, tags=["Dashboard"])
async def get_dashboard_data(db: Session = Depends(get_db)):
    """Get full dashboard data: stats and assets"""
    try:
        # Get all assets
        assets = db.query(InfrastructureAsset).all()
        
        # Calculate stats
        total_assets = len(assets)
        critical = sum(1 for a in assets if a.severity == "Critical")
        high = sum(1 for a in assets if a.severity == "High")
        medium = sum(1 for a in assets if a.severity == "Medium")
        low = sum(1 for a in assets if a.severity == "Low")
        total_defects = sum(a.defects_count for a in assets)
        
        stats = DashboardStatsResponse(
            total_assets=total_assets,
            critical_issues=critical,
            high_risk_assets=high,
            medium_risk_assets=medium,
            low_risk_assets=low,
            total_defects=total_defects,
        )
        
        asset_responses = [AssetResponse.model_validate(a) for a in assets]
        
        # Get recent analyses
        recent_analyses = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(10).all()
        analysis_responses = [
            AnalysisResponse(
                id=a.id,
                asset_id=a.asset.asset_id if a.asset else "Unknown",
                image_filename=a.image_filename,
                detections=a.detections,
                num_detections=a.num_detections,
                risk_score=a.risk_score,
                severity=a.severity,
                defect_count=a.defect_count,
                mean_confidence=a.mean_confidence,
                created_at=a.created_at,
                status=a.status,
            )
            for a in recent_analyses
        ]
        
        return DashboardDataResponse(
            stats=stats,
            assets=asset_responses,
            recent_analyses=analysis_responses,
        )
    
    except Exception as e:
        logger.error(f"Dashboard data fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assets", response_model=list[AssetResponse], tags=["Assets"])
async def get_assets(db: Session = Depends(get_db)):
    """Get all infrastructure assets"""
    try:
        assets = db.query(InfrastructureAsset).all()
        return [AssetResponse.model_validate(a) for a in assets]
    except Exception as e:
        logger.error(f"Assets fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assets/{asset_id}", response_model=AssetResponse, tags=["Assets"])
async def get_asset(asset_id: str, db: Session = Depends(get_db)):
    """Get a specific asset by asset_id"""
    try:
        asset = db.query(InfrastructureAsset).filter_by(asset_id=asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
        return AssetResponse.model_validate(asset)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Asset fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analyses", tags=["Analysis"])
async def get_analyses(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent analysis results"""
    try:
        analyses = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(limit).all()
        return [
            {
                "id": a.id,
                "asset_id": a.asset.asset_id if a.asset else "Unknown",
                "risk_score": a.risk_score,
                "severity": a.severity,
                "num_detections": a.num_detections,
                "created_at": a.created_at.isoformat(),
                "status": a.status,
            }
            for a in analyses
        ]
    except Exception as e:
        logger.error(f"Analyses fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
