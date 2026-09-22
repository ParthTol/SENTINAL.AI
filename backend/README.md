# Sentinel AI Backend

FastAPI service for infrastructure image analysis, asset records, and dashboard data.

## Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy the root `.env.example` to a local `.env` only when configuration overrides are needed.

## Run

From the repository root:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m app.main
```

The API is available at `http://localhost:8000`.

Interactive documentation:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Endpoints

- `GET /health`
- `POST /api/analyze`
- `GET /api/dashboard`
- `GET /api/assets`
- `GET /api/assets/{asset_id}`
- `GET /api/analyses`

## Seed and test data

The seed utility is optional and creates local SQLite data only:

```powershell
python -m scripts.seed_data
```

Run the API smoke tests while the server is running:

```powershell
python tests/test_backend.py
```

## Models

The service can load trained YOLO and XGBoost artifacts when paths are configured. If those artifacts are absent, the existing development fallbacks are used. This repository does not claim that either model has been trained or evaluated.
