"""Inference engine — loads trained LSTM model or falls back to mock predictions."""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

import numpy as np

try:
    import torch
    import torch.nn as nn
except ImportError:
    torch = None  # type: ignore
    nn = None  # type: ignore


# Feature dimensions matching ml-training pipeline
NUM_HAND_LANDMARKS = 21
NUM_POSE_LANDMARKS = 33
HAND_DIM = 3  # x, y, z
POSE_DIM = 4  # x, y, z, visibility
MAX_HANDS = 2
FEATURES_PER_FRAME = MAX_HANDS * NUM_HAND_LANDMARKS * HAND_DIM + NUM_POSE_LANDMARKS * POSE_DIM


class SignLSTM(nn.Module if nn else object):  # type: ignore
    def __init__(self, input_size: int, hidden_size: int, num_layers: int, num_classes: int):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.3)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


class InferenceEngine:
    def __init__(self, model_dir: Path):
        self.model_dir = model_dir
        self.model = None
        self.labels: list[str] = []
        self.window_size = 30
        self.is_loaded = False

    @property
    def vocabulary_size(self) -> int:
        return len(self.labels)

    def load(self) -> None:
        labels_path = self.model_dir / "labels.json"
        model_path = self.model_dir / "lstm_wlasl100.pt"

        if labels_path.exists():
            self.labels = json.loads(labels_path.read_text(encoding="utf-8"))

        if torch and model_path.exists() and self.labels:
            checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
            hidden_size = checkpoint.get("hidden_size", 128)
            num_layers = checkpoint.get("num_layers", 2)
            self.window_size = checkpoint.get("window_size", 30)

            self.model = SignLSTM(
                FEATURES_PER_FRAME, hidden_size, num_layers, len(self.labels)
            )
            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.model.eval()
            self.is_loaded = True
        else:
            self.is_loaded = False
            if not self.labels:
                self.labels = self._placeholder_labels()

    @staticmethod
    def _placeholder_labels() -> list[str]:
        return [
            "hello", "thank you", "please", "sorry", "learn", "understand", "help", "water",
            "mother", "father", "brother", "sister", "eat", "drink", "apple", "bread",
            "time", "day", "night", "week", "rain", "sun", "cold", "hot",
            "happy", "sad", "angry", "tired", "school", "teacher", "student", "book",
            "work", "boss", "job", "money", "hurt", "doctor", "hospital", "medicine",
            "where", "car", "drive", "stop", "name", "friend", "yes", "no",
            "good", "bad", "love"
        ]

    def _frames_to_tensor(self, frames: list[dict[str, Any]]) -> np.ndarray:
        """Convert landmark frames to fixed-size feature vector per frame."""
        seq = []
        for frame in frames[-self.window_size :]:
            vec: list[float] = []

            hands = frame.get("hands", [])
            for h in range(MAX_HANDS):
                if h < len(hands):
                    for lm in hands[h]:
                        vec.extend(lm[:HAND_DIM])
                else:
                    vec.extend([0.0] * NUM_HAND_LANDMARKS * HAND_DIM)

            pose = frame.get("pose", [])
            for i in range(NUM_POSE_LANDMARKS):
                if i < len(pose):
                    vec.extend(pose[i][:POSE_DIM])
                else:
                    vec.extend([0.0] * POSE_DIM)

            seq.append(vec)

        while len(seq) < self.window_size:
            seq.insert(0, [0.0] * FEATURES_PER_FRAME)

        return np.array(seq, dtype=np.float32)

    def predict(self, frames: list[dict[str, Any]]) -> dict[str, Any]:
        if not frames:
            return self._empty_response()

        if self.is_loaded and self.model and torch:
            tensor = self._frames_to_tensor(frames)
            x = torch.from_numpy(tensor).unsqueeze(0)
            with torch.no_grad():
                logits = self.model(x)
                probs = torch.softmax(logits, dim=1).squeeze().tolist()

            indexed = sorted(enumerate(probs), key=lambda x: x[1], reverse=True)
            top_3 = [
                {"label": self.labels[i], "confidence": float(p)}
                for i, p in indexed[:3]
            ]
            return {
                "top_prediction": top_3[0],
                "top_3": top_3,
                "model_loaded": True,
                "vocabulary_size": len(self.labels),
            }

        return self._mock_response()

    def _mock_response(self) -> dict[str, Any]:
        """Fallback when no trained model is present — for frontend dev/testing."""
        weights = [random.random() for _ in self.labels]
        total = sum(weights)
        probs = [w / total for w in weights]
        indexed = sorted(enumerate(probs), key=lambda x: x[1], reverse=True)
        top_3 = [
            {"label": self.labels[i], "confidence": round(float(p), 4)}
            for i, p in indexed[:3]
        ]
        return {
            "top_prediction": top_3[0],
            "top_3": top_3,
            "model_loaded": False,
            "vocabulary_size": len(self.labels),
        }

    def _empty_response(self) -> dict[str, Any]:
        return {
            "top_prediction": {"label": "", "confidence": 0.0},
            "top_3": [],
            "model_loaded": self.is_loaded,
            "vocabulary_size": len(self.labels),
        }
