# Sentinel AI

## AI-Powered Early Risk Prediction System for Public Infrastructure

Sentinel AI is a React and FastAPI application for infrastructure inspection. It is designed to detect visible road or structural defects from images, combine those signals with infrastructure metadata, and support maintenance prioritization.

## Overview

The repository contains three implementation areas:

- `frontend/`: React/Vite inspection interface and dashboard
- `backend/`: FastAPI API, persistence, and inference integration
- `ml/`: dataset preparation, YOLO training utilities, and notebook workflows

The project is organized for development and experimentation. Model training and evaluation are not represented as complete or verified unless explicitly documented in the source.

## Problem

Manual infrastructure inspections are time-consuming, difficult to scale, and expose inspectors to roadside and structural hazards. Small defects can progress without consistent documentation or prioritization.

## Proposed Solution

The planned pipeline is:

```text
Infrastructure image
    -> YOLO-based defect detection
    -> Feature extraction
    -> Infrastructure/context metadata
    -> XGBoost risk prediction
    -> Risk assessment
    -> Maintenance priority
    -> Dashboard
```

## Key Features

- Image upload workflow in the React frontend
- FastAPI health, asset, analysis, and dashboard endpoints
- YOLO inference integration with a development fallback
- XGBoost integration point with a development fallback
- SQLite persistence for local development
- Dataset preparation utilities for YOLO-format data
- Colab-oriented training notebook
- API documentation through FastAPI Swagger UI

## System Architecture

```text
frontend/  ->  backend/app/main.py  ->  inference services
                         |
                         ->  SQLAlchemy database

ml/ and data/ provide local training preparation and inputs.
```

## ML Pipeline

### Computer vision

The intended computer-vision workflow uses a pretrained Ultralytics YOLO detector, fine-tuned on road-damage data. It should produce defect type, confidence, bounding-box, count, and area features.

### Risk prediction

XGBoost is the planned primary tabular model. Its inputs should combine detector features with infrastructure and context metadata. A Random Forest model may be added as a baseline comparison.

Training, validation, inference, and evaluation should be treated as separate reproducible steps. This repository does not claim trained models or performance metrics that have not been generated and verified.

## Dataset

The planned dataset is RDD2022. It is hosted externally and must be downloaded manually or through an approved access method.

Dataset link:

https://drive.google.com/drive/folders/14Z6DaVJEDst1coa-kA6V1tM0qEfTqoH8?usp=sharing

See [`data/README.md`](data/README.md) for placement instructions. Dataset files are excluded from GitHub because of size and distribution considerations.

## Technology Stack

- Python
- FastAPI and Uvicorn
- SQLAlchemy and SQLite for local development
- Ultralytics YOLO and PyTorch
- OpenCV
- XGBoost and scikit-learn
- React 18 and Vite
- Tailwind CSS
- Recharts and Lucide React

PostgreSQL/PostGIS, Leaflet/OpenStreetMap, and Docker are not currently implemented in this repository.

## Project Structure

```text
sentinel-ai/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   ├── package.json
│   └── README.md
├── ml/
│   ├── notebooks/
│   ├── preprocessing/
│   ├── training/
│   ├── requirements.txt
│   └── README.md
├── data/
│   └── README.md
├── scripts/
├── .env.example
├── .gitignore
└── README.md
```

## Installation

### Frontend

```powershell
cd frontend
npm install
```

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### ML environment

Use a separate environment when running training workflows:

```powershell
cd ml
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Existing local environments are ignored and must be recreated by each developer.

## Environment Variables

Copy `.env.example` to a local `.env` or `.env.local` as appropriate. Do not commit those files.

Important variables include:

- `VITE_API_URL`
- `DATABASE_URL`
- `YOLO_MODEL_PATH`
- `XGBOOST_MODEL_PATH`
- `UPLOAD_DIR`
- `SECRET_KEY` and `API_KEY` placeholders for future protected deployments

## Running the Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m app.main
```

Open `http://localhost:8000/docs` for the API documentation.

## Running the Frontend

In another terminal:

```powershell
cd frontend
npm run dev
```

The Vite development server will print the local URL.

## ML Training Instructions

1. Obtain RDD2022 using the external link.
2. Place it under `data/RDD2022/`.
3. Generate and inspect the YOLO configuration:

```powershell
python ml/preprocessing/prepare_dataset.py --data-root ./data/RDD2022 --output ./data/RDD2022/data.yaml
```

4. Run the existing YOLO training script after checking its arguments and dataset paths.
5. Build the XGBoost feature table from detector outputs and infrastructure metadata.
6. Train, validate, and save the risk model only after the feature schema and labels are defined.

See [`ml/README.md`](ml/README.md) for the current workflow.

## Model Evaluation

Evaluation is pending. No accuracy, precision, recall, F1, mAP, ROC-AUC, or other performance values are reported until reproducible training and evaluation runs produce them.

Future evaluation should use held-out data and document the split, classes, thresholds, and command used to generate each metric.

## Current Project Status

- Project architecture: implemented
- React frontend: implemented
- FastAPI backend: implemented
- Local SQLite persistence: implemented
- Dataset preparation utilities: implemented
- YOLO training utility: implemented
- Dataset download: external/manual workflow
- YOLO fine-tuning on RDD2022: pending verification
- XGBoost risk-model training: pending
- Model evaluation: pending
- Production deployment: pending

## Future Scope

- Complete RDD2022 preparation and reproducible YOLO training
- Implement the XGBoost feature-generation and evaluation pipeline
- Add authenticated users and role-based access
- Add PostgreSQL/PostGIS for production asset storage
- Add map visualization with Leaflet/OpenStreetMap
- Add Docker and CI checks
- Add model registry and versioned inference artifacts

## Limitations

- Development fallbacks are not evidence of trained-model performance.
- SQLite and local file uploads are intended for development.
- Dataset access and licensing must be verified by the project team.
- Production authentication, monitoring, and deployment configuration are pending.

## Team

Project team information should be added by the authors.

## License

No license has been selected because the intended licensing terms were not specified. Add a license after the project authors agree on one.
