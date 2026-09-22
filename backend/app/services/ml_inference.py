import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Any
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

# Human-readable class names for the fine-tuned model.
# Index matches the class ID returned by YOLO.
# Update this list once you train on your custom dataset.
CLASS_NAMES = [
    "Crack", "Pothole", "Corrosion", "Exposed Steel",
    "Concrete Damage", "Bridge Crack", "Surface Fatigue",
    "Spalling", "Leakage",
]

def _conf_to_severity(conf: float) -> str:
    """Map confidence score to a qualitative severity label."""
    if conf >= 0.85:  return "Critical"
    if conf >= 0.70:  return "High"
    if conf >= 0.50:  return "Medium"
    return "Low"


class YOLOInference:
    """Wrapper for YOLO inference"""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load YOLO model"""
        try:
            from ultralytics import YOLO
            if self.model_path and os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                logger.info(f"Loaded YOLO model from {self.model_path}")
            else:
                # Fallback to default YOLOv8n
                self.model = YOLO('yolov8n.pt')
                logger.warning("Using default YOLOv8n model")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self.model = None
    
    def predict(self, image_path: str, conf_threshold: float = 0.25) -> Dict[str, Any]:
        """Run YOLO inference on an image"""
        if self.model is None:
            return {"error": "Model not loaded", "detections": []}
        
        try:
            results = self.model.predict(image_path, conf=conf_threshold, imgsz=640)
            
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls_id  = int(box.cls[0].item()) if hasattr(box.cls, 'item') else int(box.cls[0])
                    conf    = float(box.conf[0].item()) if hasattr(box.conf, 'item') else float(box.conf[0])
                    # Use model's own class names if available, fallback to our map
                    if result.names and cls_id in result.names:
                        label = result.names[cls_id]
                    else:
                        label = CLASS_NAMES[cls_id] if cls_id < len(CLASS_NAMES) else f"Class-{cls_id}"
                    det = {
                        "class":      cls_id,
                        "label":      label,
                        "confidence": conf,
                        "severity":   _conf_to_severity(conf),
                        "xyxy":       [float(x) for x in box.xyxy[0].tolist()],
                        "xywh":       [float(x) for x in box.xywh[0].tolist()],
                    }
                    detections.append(det)
            
            return {
                "status": "success",
                "detections": detections,
                "num_detections": len(detections),
            }
        except Exception as e:
            logger.error(f"YOLO inference failed: {e}")
            return {"status": "error", "error": str(e), "detections": []}


class XGBoostInference:
    """Wrapper for XGBoost risk prediction"""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load XGBoost model"""
        try:
            import xgboost as xgb
            if self.model_path and os.path.exists(self.model_path):
                self.model = xgb.Booster()
                self.model.load_model(self.model_path)
                logger.info(f"Loaded XGBoost model from {self.model_path}")
            else:
                logger.warning("XGBoost model not found; risk prediction will use fallback")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to load XGBoost model: {e}")
            self.model = None
    
    def predict_risk(self, detections: List[Dict], image_width: int = 640, image_height: int = 640) -> Dict[str, Any]:
        """
        Predict risk score from detection metadata.
        
        Features:
        - defect_count: number of detected defects
        - mean_confidence: average confidence of detections
        - mean_area: average area of bounding boxes (normalized)
        """
        try:
            if not detections:
                return {"risk_score": 0.0, "severity": "Low", "features": {}}
            
            # Feature engineering
            num_defects = len(detections)
            confidences = [d.get("confidence", 0) for d in detections]
            mean_conf = np.mean(confidences) if confidences else 0.0
            
            # Calculate areas (from xywh: x, y, width, height)
            areas = []
            for d in detections:
                xywh = d.get("xywh", [0, 0, 0, 0])
                if len(xywh) >= 4:
                    area = xywh[2] * xywh[3]  # width * height
                    areas.append(area)
            
            max_area = max(areas) if areas else 0.0
            mean_area = np.mean(areas) if areas else 0.0
            
            # Normalize
            norm_max_area = max_area / (image_width * image_height) if (image_width * image_height) > 0 else 0.0
            norm_mean_area = mean_area / (image_width * image_height) if (image_width * image_height) > 0 else 0.0
            
            features = {
                "defect_count": num_defects,
                "mean_confidence": mean_conf,
                "max_area_norm": norm_max_area,
                "mean_area_norm": norm_mean_area,
            }
            
            # Use XGBoost if loaded, otherwise use fallback formula
            if self.model:
                try:
                    import xgboost as xgb
                    X = np.array([[mean_conf, norm_mean_area]], dtype=np.float32)
                    dmatrix = xgb.DMatrix(X)
                    risk_pred = self.model.predict(dmatrix)[0]
                    risk_score = float(risk_pred)
                except Exception as e:
                    logger.warning(f"XGBoost prediction failed, using fallback: {e}")
                    risk_score = self._fallback_risk_calculation(features)
            else:
                # Fallback: simple weighted formula
                risk_score = self._fallback_risk_calculation(features)
            
            # Clamp to [0, 100]
            risk_score = max(0.0, min(100.0, risk_score))
            
            # Determine severity
            if risk_score >= 80:
                severity = "Critical"
            elif risk_score >= 60:
                severity = "High"
            elif risk_score >= 40:
                severity = "Medium"
            else:
                severity = "Low"
            
            return {
                "status": "success",
                "risk_score": risk_score,
                "severity": severity,
                "features": features,
            }
        except Exception as e:
            logger.error(f"Risk prediction failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "risk_score": 0.0,
                "severity": "Low",
                "features": {},
            }
    
    def _fallback_risk_calculation(self, features: Dict[str, float]) -> float:
        """Fallback risk calculation using a simple weighted formula"""
        defect_weight = min(features.get("defect_count", 0) * 10, 50)
        conf_weight = features.get("mean_confidence", 0) * 40
        area_weight = features.get("max_area_norm", 0) * 20
        risk = defect_weight + conf_weight + area_weight
        return risk
