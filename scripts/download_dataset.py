import argparse
import sys
from pathlib import Path

try:
    import gdown
except ImportError:
    print("ERROR: gdown is required. Install it with: pip install gdown")
    sys.exit(1)


def extract_folder_id(url):
    """Extract Google Drive folder ID from a share link."""
    if "folders/" in url:
        return url.split("folders/")[1].split("?")[0]
    if "id=" in url:
        return url.split("id=")[1].split("&")[0]
    return None


def download_dataset(drive_url, output_dir):
    """Download dataset from Google Drive folder."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Downloading dataset from Google Drive...")
    print(f"  Source: {drive_url}")
    print(f"  Destination: {output_dir}")

    try:
        gdown.download_folder(drive_url, output=str(output_dir), quiet=False, use_cookies=False)
        print(f"✓ Dataset downloaded to {output_dir}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to download dataset: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Download Sentinel AI dataset from Google Drive.")
    parser.add_argument(
        "--url",
        default="https://drive.google.com/drive/folders/14Z6DaVJEDst1coa-kA6V1tM0qEfTqoH8?usp=sharing",
        help="Google Drive folder share link",
    )
    parser.add_argument("--output", default="./data", help="Where to save the dataset")
    args = parser.parse_args()

    if not download_dataset(args.url, args.output):
        sys.exit(1)


if __name__ == "__main__":
    main()
