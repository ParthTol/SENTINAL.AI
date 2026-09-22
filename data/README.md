# Dataset

## RDD2022

Sentinel AI is planned to use the RDD2022 road damage dataset for YOLO-based road-defect detection. The dataset is external and is not included in this repository.

Source: https://drive.google.com/drive/folders/14Z6DaVJEDst1coa-kA6V1tM0qEfTqoH8?usp=sharing

## Download and placement

1. Obtain the dataset from the external source.
2. Place the extracted dataset outside Git-tracked source files, for example:

```text
SENTINAL.AI/
└── data/
    └── RDD2022/
        ├── train/
        │   ├── images/
        │   └── labels/
        ├── val/
        │   ├── images/
        │   └── labels/
        └── test/
            ├── images/
            └── labels/
```

3. Run the preparation script:

```powershell
python ml/preprocessing/prepare_dataset.py --data-root ./data/RDD2022 --output ./data/RDD2022/data.yaml
```

The exact class names and directory layout should be verified against the downloaded copy before training.

## Why it is not committed

The dataset is large, externally hosted, and subject to its own distribution terms. Only this documentation is committed; image files, labels, generated YAML files, and local dataset folders are ignored by Git.
