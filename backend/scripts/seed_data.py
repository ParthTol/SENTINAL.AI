"""
Populate sample data for testing
Run with: python seed_data.py
"""

from app.database.session import SessionLocal, init_db, InfrastructureAsset, AnalysisResult
from datetime import datetime, timedelta
import random

def seed_database():
    """Add sample infrastructure assets and analysis results"""
    
    # Initialize database
    init_db()
    
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(InfrastructureAsset).count() > 0:
        print("Database already has data. Skipping seed.")
        db.close()
        return
    
    print("Seeding database with sample data...")
    
    # Sample assets
    assets_data = [
        {
            "asset_id": "ROAD-001",
            "asset_type": "Road",
            "location": "Baner Road, Pune",
            "latitude": 18.5644,
            "longitude": 73.7997,
        },
        {
            "asset_id": "ROAD-002",
            "asset_type": "Road",
            "location": "Katraj-Kondhwa Road, Pune",
            "latitude": 18.4981,
            "longitude": 73.8520,
        },
        {
            "asset_id": "BRIDGE-001",
            "asset_type": "Bridge",
            "location": "Navi Pul, Pune",
            "latitude": 18.5195,
            "longitude": 73.8567,
        },
        {
            "asset_id": "BRIDGE-002",
            "asset_type": "Bridge",
            "location": "Mula-Mutha Confluence Bridge",
            "latitude": 18.5250,
            "longitude": 73.8497,
        },
        {
            "asset_id": "FLYOVER-001",
            "asset_type": "Flyover",
            "location": "Nal Stop Flyover, Pune",
            "latitude": 18.5432,
            "longitude": 73.8134,
        },
        {
            "asset_id": "BUILDING-001",
            "asset_type": "Building",
            "location": "Municipal Office, Pune",
            "latitude": 18.5204,
            "longitude": 73.8567,
        },
    ]
    
    # Create assets
    created_assets = []
    for asset_data in assets_data:
        asset = InfrastructureAsset(
            **asset_data,
            severity=random.choice(["Critical", "High", "Medium", "Low"]),
            risk_score=random.uniform(10, 95),
            defects_count=random.randint(0, 8),
            last_inspection=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        )
        db.add(asset)
        created_assets.append(asset)
    
    db.commit()
    
    print(f"Created {len(created_assets)} assets")
    
    # Create sample analyses
    for asset in created_assets:
        num_analyses = random.randint(1, 3)
        for i in range(num_analyses):
            num_detections = random.randint(0, 5)
            detections = [
                {
                    "class": random.randint(0, 5),
                    "confidence": random.uniform(0.6, 0.99),
                    "xyxy": [random.randint(0, 600) for _ in range(4)],
                    "xywh": [random.randint(0, 600) for _ in range(4)],
                }
                for _ in range(num_detections)
            ]
            
            confidences = [d["confidence"] for d in detections] if detections else [0]
            mean_conf = sum(confidences) / len(confidences)
            
            analysis = AnalysisResult(
                asset_id=asset.id,
                image_filename=f"{asset.asset_id}_sample_{i}.jpg",
                image_path=f"./uploads/{asset.asset_id}_sample_{i}.jpg",
                detections=detections,
                num_detections=num_detections,
                risk_score=random.uniform(10, 95),
                severity=random.choice(["Critical", "High", "Medium", "Low"]),
                defect_count=num_detections,
                mean_confidence=mean_conf,
                mean_area=random.uniform(0.05, 0.4),
                max_area=random.uniform(0.1, 0.5),
                status="completed",
                completed_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            )
            db.add(analysis)
    
    db.commit()
    
    print(f"Created sample analysis results")
    print("\nDatabase seeded successfully!")
    print(f"- Assets: {db.query(InfrastructureAsset).count()}")
    print(f"- Analyses: {db.query(AnalysisResult).count()}")
    
    db.close()

if __name__ == "__main__":
    seed_database()
