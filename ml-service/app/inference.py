"""Inference engine — loads trained LSTM model and Alphabet model, and routes smartly."""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

import numpy as np
import joblib

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


class AlphabetEngine:
    def __init__(self, model_dir: Path):
        self.model_dir = model_dir
        self.model = None
        self.labels = []
        self.is_loaded = False

    def load(self):
        labels_path = self.model_dir / "alphabet_labels.json"
        model_path = self.model_dir / "rf_alphabet.joblib"
        
        if labels_path.exists() and model_path.exists():
            self.labels = json.loads(labels_path.read_text(encoding="utf-8"))
            self.model = joblib.load(model_path)
            self.is_loaded = True
            print("AlphabetEngine loaded successfully.")
        else:
            print("AlphabetEngine could not load models.")
            self.labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
            self.is_loaded = False

    def _normalize_landmarks(self, vec: list[float]) -> list[float]:
        if len(vec) < 3:
            return vec
        base_x, base_y, base_z = vec[0], vec[1], vec[2]
        
        normalized = []
        for i in range(0, len(vec), 3):
            nx = vec[i] - base_x
            ny = vec[i+1] - base_y
            nz = vec[i+2] - base_z
            normalized.extend([nx, ny, nz])
            
        max_val = max(abs(v) for v in normalized)
        if max_val > 0:
            normalized = [v / max_val for v in normalized]
            
        return normalized

    def _frame_to_tensor(self, frame: dict[str, Any]) -> np.ndarray:
        vec = []
        hands = frame.get("hands", [])
        if len(hands) > 0:
            for lm in hands[0]:
                vec.extend(lm[:HAND_DIM])
        
        while len(vec) < NUM_HAND_LANDMARKS * HAND_DIM:
            vec.append(0.0)
            
        vec = self._normalize_landmarks(vec)
        return np.array([vec], dtype=np.float32)

    def predict(self, frame: dict[str, Any]) -> dict[str, Any]:
        if not self.is_loaded or not self.model:
            return self._mock_response()
            
        tensor = self._frame_to_tensor(frame)
        probs = self.model.predict_proba(tensor)[0]
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
            "mode": "Alphabet",
        }

    def _mock_response(self) -> dict[str, Any]:
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
            "mode": "Alphabet",
        }


class InferenceEngine:
    def __init__(self, model_dir: Path):
        self.model_dir = model_dir
        self.model = None
        self.labels: list[str] = []
        self.window_size = 30
        self.is_loaded = False

        self.alphabet_engine = AlphabetEngine(model_dir)

    @property
    def vocabulary_size(self) -> int:
        return len(self.labels)

    def load(self) -> None:
        self.alphabet_engine.load()
        
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

    def _is_stationary(self, frames: list[dict[str, Any]]) -> bool:
        if len(frames) < 10:
            return True
            
        recent = frames[-10:]
        hand_centers = []
        for frame in recent:
            hands = frame.get("hands", [])
            if len(hands) > 0 and len(hands[0]) > 0:
                # Use wrist (0) as center
                hand_centers.append(np.array(hands[0][0][:2]))
        
        if len(hand_centers) < 2:
            return True
            
        # Calculate max displacement
        variances = np.var(hand_centers, axis=0)
        movement = np.sum(variances)
        
        # Threshold for stillness (if movement is very small)
        return movement < 0.005

    def predict(self, frames: list[dict[str, Any]]) -> dict[str, Any]:
        if not frames:
            return self._empty_response()

        # SMART ROUTER
        if self._is_stationary(frames):
            return self.alphabet_engine.predict(frames[-1])

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
                "mode": "Word",
            }

        return self._mock_response()

    def _mock_response(self) -> dict[str, Any]:
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
            "mode": "Word",
        }

    def _empty_response(self) -> dict[str, Any]:
        return {
            "top_prediction": {"label": "", "confidence": 0.0},
            "top_3": [],
            "model_loaded": self.is_loaded,
            "vocabulary_size": len(self.labels),
            "mode": "Unknown",
        }
