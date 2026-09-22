# Sentinel AI ML Pipeline

This directory contains dataset preparation and planned model-training workflows. Training data and model artifacts are local-only.

## YOLO computer vision workflow

1. Obtain RDD2022 and place it under `data/RDD2022/`.
2. Validate the YOLO directory layout and generate `data.yaml`:

```powershell
python ml/preprocessing/prepare_dataset.py --data-root ./data/RDD2022 --output ./data/RDD2022/data.yaml
```

3. Fine-tune a pretrained Ultralytics detector. The existing script currently supports a pretrained YOLO checkpoint and can be adapted to YOLO11 after verifying the installed Ultralytics version:

```powershell
python ml/training/yolov8_finetune.py --data-root ./data/RDD2022 --data-yaml ./data/RDD2022/data.yaml --pretrained yolo8n.pt --project ./runs/train --name sentinel-defects
```

4. Validate the trained detector with the validation/test split.
5. Use inference to produce defect classes, confidence values, bounding boxes, counts, and area features.

The existing notebook at `ml/notebooks/train_yolov8_colab.ipynb` is a Colab-oriented workflow. It should be run only after its dataset paths are checked.

## XGBoost risk workflow

The planned risk model will use detector outputs plus infrastructure/context metadata, such as:

- defect type and count
- confidence statistics
- bounding-box size or normalized area
- asset type and age
- inspection or environmental metadata when available

The workflow should include preprocessing, a documented train/validation split, XGBoost training, optional Random Forest baseline comparison, prediction, and evaluation. No trained XGBoost artifact or verified evaluation metrics are currently claimed by this repository.

## Current status

- Dataset preparation utilities: present
- YOLO training script: present
- Colab notebook: present
- XGBoost training pipeline: pending
- Reproducible evaluation scripts: pending
- Verified model metrics: pending
