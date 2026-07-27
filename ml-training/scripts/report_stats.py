import json
from collections import Counter
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent

def main():
    manifest_path = ROOT / "data" / "raw" / "wlasl100_manifest.json"
    if not manifest_path.exists():
        print("Manifest not found.")
        sys.exit(1)
        
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    instances = manifest.get("instances", [])
    labels = manifest.get("labels", [])
    expected = len(instances)
    
    videos_dir = ROOT / "data" / "videos"
    downloaded = len(list(videos_dir.glob("*.mp4"))) if videos_dir.exists() else 0
    
    index_path = ROOT / "data" / "landmarks" / "index.json"
    extracted = 0
    counts = Counter()
    if index_path.exists():
        index_data = json.loads(index_path.read_text(encoding="utf-8"))
        extracted = len(index_data)
        for vid, class_idx in index_data.items():
            counts[class_idx] += 1
            
    print(f"=== Dataset Completeness ===")
    print(f"Expected Videos: {expected}")
    print(f"Downloaded Videos: {downloaded}")
    print(f"Successfully Extracted: {extracted}")
    print(f"Overall Extraction Success Rate: {(extracted/expected*100) if expected else 0:.1f}%")
    
    print("\n=== Per-Sign Breakdown (Signs with < 5 samples) ===")
    low_count_signs = []
    for idx, label in enumerate(labels):
        c = counts.get(idx, 0)
        if c < 5:
            low_count_signs.append(f"{label} ({c} samples)")
            
    if low_count_signs:
        for s in low_count_signs:
            print(f" - {s}")
    else:
        print("All 100 signs have at least 5 samples! Looking healthy.")

if __name__ == "__main__":
    main()
