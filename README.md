# SignBridge

Real-time ASL sign recognition, structured learning, and Deaf culture awareness — built as a phased MVP.

## Project structure

```
SignBridge/
├── frontend/       React + Vite + Tailwind — web UI (Recognize, Learn, Understand)
├── ml-service/     Python FastAPI — landmark-sequence inference (PyTorch/ONNX)
├── ml-training/    Offline training pipeline — WLASL data, landmarks, LSTM/ST-GCN
└── backend/        Node.js + Express + JSON DB — auth & progress (Phase 4)
```

## Current Status: Phase 5 (Polish & Pre-Deployment)
The web application is fully built and polished! We have completed:
- **Phase 2:** Learn Course (Fingerspelling, Basics, Verbs, Food, Family)
- **Phase 3:** Understand Section (Deaf culture and etiquette)
- **Phase 4:** Accounts & Progress (JWT Auth and JSON mock DB)
- **Phase 5:** UI Polish and Demo preparation.

*Note: The ML service is currently running in **Mock Mode**. We have skipped the compute-heavy Phase 1 training step for now to focus on the web app. You can run the ML training offline later to unlock real predictions!*

## Quick start

To run the full mock-stack locally, you need three terminal windows:

### 1. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`

### 2. Backend (Node API)

```bash
cd backend
npm install
npm run dev
```
Runs at `http://localhost:3001` (provides `/api/auth` and `/api/progress`).

### 3. ML inference service (Mock Mode)

```bash
cd ml-service
python -m venv .venv
# Activate venv:
# .venv\Scripts\activate (Windows) or source .venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
Runs at `http://localhost:8001`. Since there is no `.pt` model file, it will automatically return randomized mock predictions for testing the UI.

## Training the actual ML Model (Phase 1)
When you are ready to dedicate the compute time to train the actual ASL recognizer, run these offline scripts:

```bash
cd ml-training
python -m venv .venv
# Activate venv
pip install -r requirements.txt

# 1. Download WLASL100 video dataset
python scripts/download_wlasl.py

# 2. Extract MediaPipe landmarks (CPU intensive)
python scripts/extract_landmarks.py

# 3. Train the PyTorch LSTM model
python scripts/train_lstm.py
```
Once `train_lstm.py` finishes, it will save the model weights to `ml-service/models/`. Simply restart the `ml-service` (uvicorn) and it will automatically detect the real model and stop using mock mode!

## License & attribution

Training data from the [WLASL dataset](https://github.com/dxli94/WLASL). Course sign references reuse WLASL media with attribution.
