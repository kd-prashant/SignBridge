import json
import os
import random
from pathlib import Path

import cv2
import joblib
import mediapipe as mp
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT / "archive" / "asl_alphabet_train" / "asl_alphabet_train"

if not DATA_DIR.exists():
    DATA_DIR = ROOT / "archive" / "asl_alphabet_train"

HAND_DIM = 63  # 21 landmarks * 3 coords

def normalize_landmarks(vec):
    """
    Normalizes a 63-dim flat vector (21 landmarks * 3 coords [x,y,z])
    so it is translation and scale invariant.
    """
    # The wrist is the first landmark (indices 0, 1, 2)
    base_x, base_y, base_z = vec[0], vec[1], vec[2]
    
    normalized = []
    for i in range(0, len(vec), 3):
        nx = vec[i] - base_x
        ny = vec[i+1] - base_y
        nz = vec[i+2] - base_z
        normalized.extend([nx, ny, nz])
        
    # Scale normalization (divide by max absolute value to make it scale invariant)
    max_val = max(abs(v) for v in normalized)
    if max_val > 0:
        normalized = [v / max_val for v in normalized]
        
    return normalized

def extract_landmarks(image_path, hands_detector):
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands_detector.process(img_rgb)
    
    if results.multi_hand_landmarks:
        hand = results.multi_hand_landmarks[0]
        vec = []
        for lm in hand.landmark:
            vec.extend([lm.x, lm.y, lm.z])
            
        # NORMALIZE before returning
        return normalize_landmarks(vec)
    return None

def main():
    print(f"Scanning ASL Alphabet dataset at {DATA_DIR}...")
    
    mp_hands = mp.solutions.hands
    hands_detector = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5
    )
    
    labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    
    X = []
    y = []
    
    SAMPLES_PER_CLASS = 250
    
    for label in labels:
        folder = DATA_DIR / label
        if not folder.exists():
            continue
            
        images = list(folder.glob("*.jpg"))
        random.shuffle(images)
        
        extracted_count = 0
        for img_path in images:
            vec = extract_landmarks(img_path, hands_detector)
            if vec is not None:
                X.append(vec)
                y.append(labels.index(label))
                extracted_count += 1
                
            if extracted_count >= SAMPLES_PER_CLASS:
                break
                
        print(f"Extracted {extracted_count} samples for {label}")

    hands_detector.close()
    
    if len(X) == 0:
        print("Error: No landmarks were extracted.")
        return

    X = np.array(X)
    y = np.array(y)
    
    print(f"\nTotal extracted samples: {len(X)}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier on NORMALIZED hand landmarks...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)
    
    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Validation Accuracy: {acc * 100:.2f}%")
    
    models_dir = ROOT / "ml-service" / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    model_path = models_dir / "rf_alphabet.joblib"
    joblib.dump(clf, model_path)
    print(f"Saved alphabet model -> {model_path}")
    
    labels_path = models_dir / "alphabet_labels.json"
    labels_path.write_text(json.dumps(labels, indent=2))
    print(f"Saved alphabet labels -> {labels_path}")

if __name__ == "__main__":
    main()
