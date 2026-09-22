import argparse
from pathlib import Path
import sys
import yaml


def find_dir(root: Path, candidate_names):
    for name in candidate_names:
        candidate = root / name
        if candidate.exists() and candidate.is_dir():
            return candidate
    return None


def locate_dataset(root: Path):
    root = root.resolve()
    if not root.exists():
        raise FileNotFoundError(f"Dataset root not found: {root}")

    train_images = find_dir(root, ["train/images", "images/train", "train_imgs", "images/train_images"])
    val_images = find_dir(root, ["val/images", "images/val", "valid/images", "images/valid"])
    test_images = find_dir(root, ["test/images", "images/test"])

    if train_images and val_images:
        train_labels = train_images.parent / "labels"
        val_labels = val_images.parent / "labels"
        test_labels = test_images.parent / "labels" if test_images else None
    else:
        raise FileNotFoundError(
            "Unable to detect YOLO dataset layout. "
            "Expected `train/images` and `val/images` under the dataset root."
        )

    for path in [train_images, train_labels, val_images, val_labels]:
        if not path or not path.exists():
            raise FileNotFoundError(f"Missing dataset folder: {path}")

    if test_images and not (test_images.parent / "labels").exists():
        raise FileNotFoundError(f"Missing labels folder for test set: {test_images.parent / 'labels'}")

    return {
        "train_images": train_images,
        "train_labels": train_labels,
        "val_images": val_images,
        "val_labels": val_labels,
        "test_images": test_images,
        "test_labels": test_images.parent / "labels" if test_images else None,
    }


def load_names(root: Path):
    for name_file in ["classes.txt", "names.txt", "data.names", "labels.names"]:
        path = root / name_file
        if path.exists():
            return [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    return []


def create_data_yaml(data_root: Path, output_file: Path, names):
    data = {
        "path": str(data_root.resolve()),
        "train": str((data_root / locate_dataset(data_root)["train_images"]).resolve()),
        "val": str((data_root / locate_dataset(data_root)["val_images"]).resolve()),
    }

    if (data_root / "test").exists() or locate_dataset(data_root)["test_images"]:
        data["test"] = str(locate_dataset(data_root)["test_images"].resolve())

    data["names"] = names or []
    data["nc"] = len(names)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with output_file.open("w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False)

    return data


def main():
    parser = argparse.ArgumentParser(description="Prepare YOLO dataset config for Sentinel AI model training.")
    parser.add_argument("--data-root", default="./data", help="Root folder of the dataset.")
    parser.add_argument("--output", default="./data/data.yaml", help="Output path for the generated YAML file.")
    args = parser.parse_args()

    data_root = Path(args.data_root)
    output_path = Path(args.output)

    try:
        layout = locate_dataset(data_root)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

    names = load_names(data_root)
    if not names:
        print("WARNING: No class names file found. The generated data.yaml will use an empty names list.")
        print("If you know your class names, create a `classes.txt` file in the dataset root with one class per line.")

    data = {
        "train": str(layout["train_images"].resolve()),
        "val": str(layout["val_images"].resolve()),
    }
    if layout["test_images"]:
        data["test"] = str(layout["test_images"].resolve())
    data["nc"] = len(names)
    data["names"] = names

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False)

    print(f"Generated YOLO data config at: {output_path}")
    print(f"  train: {data['train']}")
    print(f"  val:   {data['val']}")
    if data.get("test"):
        print(f"  test:  {data['test']}")
    print(f"  nc:    {data['nc']}")
    print(f"  names: {len(data['names'])} classes")


if __name__ == "__main__":
    main()
