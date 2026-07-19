"""Download WLASL metadata and video URLs for the WLASL100 subset."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import requests
import yaml

ROOT = Path(__file__).resolve().parent.parent


def load_config() -> dict:
    with open(ROOT / "config" / "wlasl100.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def download_json(url: str, dest: Path) -> list[dict]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading WLASL metadata from {url} …")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    dest.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Saved {len(data)} gloss entries -> {dest}")
    return data


def build_wlasl100_subset(all_glosses: list[dict], subset_size: int) -> dict:
    """Take the first N glosses and collect all their video instances."""
    subset = all_glosses[:subset_size]
    labels = [g["gloss"] for g in subset]

    instances = []
    for class_idx, gloss_entry in enumerate(subset):
        gloss = gloss_entry["gloss"]
        for inst in gloss_entry.get("instances", []):
            instances.append(
                {
                    "gloss": gloss,
                    "class_idx": class_idx,
                    "video_id": inst["video_id"],
                    "split": inst.get("split", "train"),
                    "url": inst.get("url", ""),
                }
            )

    return {"labels": labels, "instances": instances}


def main():
    parser = argparse.ArgumentParser(description="Download WLASL100 metadata")
    parser.add_argument("--subset-size", type=int, default=None)
    args = parser.parse_args()

    cfg = load_config()
    subset_size = args.subset_size or cfg["dataset"]["subset_size"]
    raw_dir = ROOT / cfg["paths"]["raw_dir"]
    raw_dir.mkdir(parents=True, exist_ok=True)

    json_path = raw_dir / "WLASL_v0.3.json"
    if json_path.exists():
        all_glosses = json.loads(json_path.read_text(encoding="utf-8"))
        print(f"Using cached metadata ({len(all_glosses)} glosses)")
    else:
        all_glosses = download_json(cfg["dataset"]["json_url"], json_path)

    subset = build_wlasl100_subset(all_glosses, subset_size)
    out_path = raw_dir / "wlasl100_manifest.json"
    out_path.write_text(json.dumps(subset, indent=2), encoding="utf-8")

    print(f"\nWLASL{subset_size} manifest:")
    print(f"  Labels:  {len(subset['labels'])}")
    print(f"  Videos:  {len(subset['instances'])}")
    print(f"  Saved ->  {out_path}")

    # Write labels for inference service
    models_dir = ROOT / cfg["paths"]["models_dir"]
    models_dir.mkdir(parents=True, exist_ok=True)
    labels_path = models_dir / "labels.json"
    labels_path.write_text(json.dumps(subset["labels"], indent=2), encoding="utf-8")
    print(f"  Labels -> {labels_path}")

    print(
        "\nNext: download videos with scripts/download_videos.py, "
        "then run scripts/extract_landmarks.py"
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
