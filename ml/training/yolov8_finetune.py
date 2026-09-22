import argparse
from pathlib import Path
import sys
import yaml

try:
    from ultralytics import YOLO
except ImportError as exc:
    raise ImportError(
        "ultralytics is required to run this script. "
        "Install it with `pip install -r requirements.txt`."
    ) from exc


def build_data_config(data_root: Path, yaml_path: Path):
    data_root = data_root.resolve()
    if yaml_path.exists():
        return str(yaml_path)

    train_images = None
    val_images = None
    test_images = None

    candidates = [
        ("train/images", "val/images", "test/images"),
        ("images/train", "images/val", "images/test"),
        ("train/images", "valid/images", "test/images"),
    ]
    for train_rel, val_rel, test_rel in candidates:
        train_path = data_root / train_rel
        val_path = data_root / val_rel
        if train_path.exists() and val_path.exists():
            train_images = train_path
            val_images = val_path
            test_images = data_root / test_rel
            break

    if not train_images or not val_images:
        raise FileNotFoundError(
            "Could not locate YOLO train/val folders under the provided data root. "
            "Expected structure like `train/images` and `val/images`."
        )

    names_file = next((data_root / name for name in ["classes.txt", "names.txt", "data.names"] if (data_root / name).exists()), None)
    names = []
    if names_file:
        names = [line.strip() for line in names_file.read_text(encoding="utf-8").splitlines() if line.strip()]

    config = {
        "train": str(train_images.resolve()),
        "val": str(val_images.resolve()),
        "nc": len(names),
        "names": names,
    }
    if test_images.exists():
        config["test"] = str(test_images.resolve())

    yaml_path.parent.mkdir(parents=True, exist_ok=True)
    yaml.safe_dump(config, yaml_path, sort_keys=False)
    return str(yaml_path)


def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune YOLOv8 on a custom defect dataset.")
    parser.add_argument("--data-root", default="./data", help="Root folder for the dataset.")
    parser.add_argument("--data-yaml", default="./data/data.yaml", help="Optional existing YOLO data config file.")
    parser.add_argument("--pretrained", default="yolo8n.pt", help="Pre-trained YOLOv8 weights to fine-tune.")
    parser.add_argument("--epochs", type=int, default=30, help="Number of training epochs.")
    parser.add_argument("--batch", type=int, default=16, help="Training batch size.")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size for training.")
    parser.add_argument("--project", default="./runs/train", help="Save results to this project folder.")
    parser.add_argument("--name", default="sentinel-defects", help="Name of the training run.")
    parser.add_argument("--device", default="0", help="Device to train on, e.g. 0 or cpu.")
    parser.add_argument("--patience", type=int, default=10, help="Early stopping patience.")
    return parser.parse_args()


def main():
    args = parse_args()
    data_root = Path(args.data_root)
    yaml_path = Path(args.data_yaml)

    if not data_root.exists():
        print(f"ERROR: data root does not exist: {data_root}", file=sys.stderr)
        sys.exit(1)

    if not yaml_path.exists():
        print("No data.yaml found, creating one from dataset layout...")
        yaml_path = Path(build_data_config(data_root, yaml_path))
        print(f"Generated data config at {yaml_path}")

    print("Starting YOLOv8 fine-tuning")
    print(f"  dataset: {yaml_path}")
    print(f"  pretrained weights: {args.pretrained}")
    print(f"  epochs: {args.epochs}")
    print(f"  batch: {args.batch}")
    print(f"  img size: {args.imgsz}")
    print(f"  project: {args.project}/{args.name}")

    model = YOLO(args.pretrained)
    model.train(
        data=str(yaml_path),
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        project=args.project,
        name=args.name,
        device=args.device,
        patience=args.patience,
    )

    print("Training complete. Check the model outputs in the project folder.")


if __name__ == "__main__":
    main()
