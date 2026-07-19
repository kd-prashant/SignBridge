"""Train baseline LSTM classifier on WLASL100 landmark sequences."""

from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset
import yaml

ROOT = Path(__file__).resolve().parent.parent

FEATURES = 2 * 21 * 3 + 33 * 4  # hands + pose


class SignLSTM(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, num_layers: int, num_classes: int):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers, batch_first=True, dropout=0.3
        )
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


class LandmarkDataset(Dataset):
    def __init__(self, samples: list[tuple[np.ndarray, int]], window_size: int):
        self.samples = samples
        self.window_size = window_size

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        arr, label = self.samples[idx]
        seq = arr[-self.window_size :]
        if len(seq) < self.window_size:
            pad = np.zeros((self.window_size - len(seq), arr.shape[1]), dtype=np.float32)
            seq = np.vstack([pad, seq])
        return torch.from_numpy(seq), label


def load_config() -> dict:
    with open(ROOT / "config" / "wlasl100.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_samples(cfg: dict) -> tuple[list[tuple[np.ndarray, int]], list[str]]:
    landmarks_dir = ROOT / cfg["paths"]["landmarks_dir"]
    index_path = landmarks_dir / "index.json"
    labels_path = ROOT / cfg["paths"]["models_dir"] / "labels.json"

    if not index_path.exists():
        print("Run extract_landmarks.py first.", file=sys.stderr)
        sys.exit(1)

    index = json.loads(index_path.read_text(encoding="utf-8"))
    labels = json.loads(labels_path.read_text(encoding="utf-8"))

    samples = []
    for video_id, class_idx in index.items():
        npy_path = landmarks_dir / f"{video_id}.npy"
        if npy_path.exists():
            samples.append((np.load(npy_path), class_idx))

    return samples, labels


def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss, correct, total = 0.0, 0, 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        logits = model(x)
        loss = criterion(logits, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * x.size(0)
        correct += (logits.argmax(1) == y).sum().item()
        total += x.size(0)
    return total_loss / total, correct / total


@torch.no_grad()
def eval_epoch(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        logits = model(x)
        loss = criterion(logits, y)
        total_loss += loss.item() * x.size(0)
        correct += (logits.argmax(1) == y).sum().item()
        total += x.size(0)
    return total_loss / total, correct / total


def main():
    parser = argparse.ArgumentParser(description="Train LSTM on WLASL100 landmarks")
    parser.add_argument("--epochs", type=int, default=None)
    args = parser.parse_args()

    cfg = load_config()
    seed = cfg["training"]["seed"]
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    samples, labels = load_samples(cfg)
    if len(samples) < 10:
        print(f"Only {len(samples)} samples — download more videos first.", file=sys.stderr)
        sys.exit(1)

    y = [s[1] for s in samples]
    train_samples, val_samples = train_test_split(
        samples, test_size=cfg["training"]["val_split"], random_state=seed, stratify=y
    )

    window_size = cfg["model"]["window_size"]
    train_ds = LandmarkDataset(train_samples, window_size)
    val_ds = LandmarkDataset(val_samples, window_size)

    batch_size = cfg["training"]["batch_size"]
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SignLSTM(
        FEATURES,
        cfg["model"]["hidden_size"],
        cfg["model"]["num_layers"],
        len(labels),
    ).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=cfg["training"]["learning_rate"])

    epochs = args.epochs or cfg["training"]["epochs"]
    best_acc = 0.0
    models_dir = ROOT / cfg["paths"]["models_dir"]
    models_dir.mkdir(parents=True, exist_ok=True)
    out_path = models_dir / "lstm_wlasl100.pt"

    print(f"Training on {len(train_samples)} samples, validating on {len(val_samples)}")
    print(f"Device: {device}, Classes: {len(labels)}")

    for epoch in range(1, epochs + 1):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = eval_epoch(model, val_loader, criterion, device)
        print(
            f"Epoch {epoch:3d} | train loss {train_loss:.4f} acc {train_acc:.3f} | "
            f"val loss {val_loss:.4f} acc {val_acc:.3f}"
        )
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "hidden_size": cfg["model"]["hidden_size"],
                    "num_layers": cfg["model"]["num_layers"],
                    "window_size": window_size,
                    "num_classes": len(labels),
                    "val_accuracy": val_acc,
                },
                out_path,
            )

    print(f"\nBest val accuracy: {best_acc:.3f}")
    print(f"Model saved → {out_path}")


if __name__ == "__main__":
    main()
