"""Download WLASL video files listed in the wlasl100 manifest."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import yaml
from tqdm import tqdm

ROOT = Path(__file__).resolve().parent.parent


def load_config() -> dict:
    with open(ROOT / "config" / "wlasl100.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def download_with_ytdlp(url: str, output_path: Path) -> bool:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists() and output_path.stat().st_size > 0:
        return True

    cmd = [
        "yt-dlp",
        "-f", "best[ext=mp4]/best",
        "-o", str(output_path),
        "--no-playlist",
        "--quiet",
        url,
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=120)
        return output_path.exists()
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
        return False


def main():
    parser = argparse.ArgumentParser(description="Download WLASL100 videos")
    parser.add_argument("--limit", type=int, default=None, help="Max videos to download")
    args = parser.parse_args()

    cfg = load_config()
    manifest_path = ROOT / cfg["paths"]["raw_dir"] / "wlasl100_manifest.json"
    if not manifest_path.exists():
        print("Run scripts/download_wlasl.py first.", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    videos_dir = ROOT / cfg["paths"]["videos_dir"]
    instances = manifest["instances"]
    if args.limit:
        instances = instances[: args.limit]

    ok, fail = 0, 0
    for inst in tqdm(instances, desc="Downloading videos"):
        vid = inst["video_id"]
        url = inst.get("url", "")
        if not url:
            fail += 1
            continue

        out = videos_dir / f"{vid}.mp4"
        if download_with_ytdlp(url, out):
            ok += 1
        else:
            fail += 1

    print(f"\nDone: {ok} downloaded, {fail} failed/skipped")
    print(f"Videos in {videos_dir}")
    if fail:
        print("Some videos failed — install yt-dlp: pip install yt-dlp")


if __name__ == "__main__":
    main()
