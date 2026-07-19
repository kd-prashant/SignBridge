"""Extract MediaPipe hand + pose landmarks from WLASL100 videos."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
import yaml
from tqdm import tqdm

ROOT = Path(__file__).resolve().parent.parent

NUM_HANDS = 2
HAND_LM = 21
POSE_LM = 33
HAND_DIM = 3
POSE_DIM = 4
FEATURES = NUM_HANDS * HAND_LM * HAND_DIM + POSE_LM * POSE_DIM


def load_config() -> dict:
    with open(ROOT / "config" / "wlasl100.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def frame_to_features(hand_result, pose_result) -> np.ndarray:
    vec: list[float] = []

    hands = hand_result.hand_landmarks or []
    for h in range(NUM_HANDS):
        if h < len(hands):
            for lm in hands[h].landmark:
                vec.extend([lm.x, lm.y, lm.z])
        else:
            vec.extend([0.0] * HAND_LM * HAND_DIM)

    pose = pose_result.pose_landmarks
    if pose:
        for lm in pose.landmark[:POSE_LM]:
            vec.extend([lm.x, lm.y, lm.z, lm.visibility])
    else:
        vec.extend([0.0] * POSE_LM * POSE_DIM)

    return np.array(vec, dtype=np.float32)


def extract_video(
    video_path: Path,
    hands: mp.solutions.hands.Hands,
    pose: mp.solutions.pose.Pose,
    max_frames: int,
) -> np.ndarray | None:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return None

    frames = []
    while cap.isOpened() and len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        hand_result = hands.process(rgb)
        pose_result = pose.process(rgb)
        frames.append(frame_to_features(hand_result, pose_result))

    cap.release()
    if not frames:
        return None

    arr = np.stack(frames)
    if len(arr) < max_frames:
        pad = np.zeros((max_frames - len(arr), FEATURES), dtype=np.float32)
        arr = np.vstack([arr, pad])

    return arr


def main():
    parser = argparse.ArgumentParser(description="Extract landmarks from WLASL100 videos")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    cfg = load_config()
    manifest_path = ROOT / cfg["paths"]["raw_dir"] / "wlasl100_manifest.json"
    if not manifest_path.exists():
        print("Run scripts/download_wlasl.py first.", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    videos_dir = ROOT / cfg["paths"]["videos_dir"]
    landmarks_dir = ROOT / cfg["paths"]["landmarks_dir"]
    landmarks_dir.mkdir(parents=True, exist_ok=True)
    max_frames = cfg["landmarks"]["max_frames"]

    mp_hands = mp.solutions.hands
    mp_pose = mp.solutions.pose

    instances = manifest["instances"]
    if args.limit:
        instances = instances[: args.limit]

    ok, skip = 0, 0
    with mp_hands.Hands(static_image_mode=False, max_num_hands=2) as hands, mp_pose.Pose(
        static_image_mode=False
    ) as pose:
        for inst in tqdm(instances, desc="Extracting landmarks"):
            vid = inst["video_id"]
            out = landmarks_dir / f"{vid}.npy"
            if out.exists():
                ok += 1
                continue

            video_path = videos_dir / f"{vid}.mp4"
            if not video_path.exists():
                skip += 1
                continue

            arr = extract_video(video_path, hands, pose, max_frames)
            if arr is None:
                skip += 1
                continue

            np.save(out, arr)
            ok += 1

    # Save index mapping video_id → class_idx for training
    index = {
        inst["video_id"]: inst["class_idx"]
        for inst in manifest["instances"]
        if (landmarks_dir / f"{inst['video_id']}.npy").exists()
    }
    index_path = landmarks_dir / "index.json"
    index_path.write_text(json.dumps(index, indent=2), encoding="utf-8")

    print(f"\nExtracted: {ok}, skipped: {skip}")
    print(f"Index → {index_path} ({len(index)} samples)")


if __name__ == "__main__":
    main()
