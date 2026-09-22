import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Backend configuration"""
    # API
    API_TITLE: str = "Sentinel AI Backend"
    API_VERSION: str = "1.0.0"
    API_DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "*"]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db")
    
    # ML Models
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "../ml/artifacts/best.pt")
    XGBOOST_MODEL_PATH: str = os.getenv("XGBOOST_MODEL_PATH", "../ml/artifacts/risk_model.json")
    
    # Upload settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50 MB
    
    # Inference
    YOLO_CONF_THRESHOLD: float = 0.25
    YOLO_IOU_THRESHOLD: float = 0.45
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
