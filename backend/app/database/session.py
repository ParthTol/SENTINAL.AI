from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
from app.core.config import settings

Base = declarative_base()

class InfrastructureAsset(Base):
    """Infrastructure asset (road, bridge, flyover, etc.)"""
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, unique=True, index=True)  # e.g., ROAD-0234
    asset_type = Column(String)  # Road, Bridge, Flyover, Building
    location = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    severity = Column(String, default="Low")  # Critical, High, Medium, Low
    risk_score = Column(Float, default=0.0)
    defects_count = Column(Integer, default=0)
    last_inspection = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    analyses = relationship("AnalysisResult", back_populates="asset")

class AnalysisResult(Base):
    """Stored result from a single infrastructure inspection"""
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    
    # Image metadata
    image_filename = Column(String)
    image_path = Column(String)
    
    # YOLO detection output
    detections = Column(JSON)  # Stores list of bounding boxes, classes, confidences
    num_detections = Column(Integer)
    
    # Risk metrics
    risk_score = Column(Float)
    severity = Column(String)  # Critical, High, Medium, Low
    
    # Defect metadata for XGBoost input
    defect_count = Column(Integer)
    mean_confidence = Column(Float)
    mean_area = Column(Float)
    max_area = Column(Float)
    
    # Status
    status = Column(String, default="pending")  # pending, completed, failed
    error_message = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    asset = relationship("InfrastructureAsset", back_populates="analyses")

# Database setup
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
