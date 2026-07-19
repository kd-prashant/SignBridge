"""SignBridge ML inference service."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.inference import InferenceEngine

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
engine = InferenceEngine(MODEL_DIR)


@asynccontextmanager
async def lifespan(app: FastAPI):
    engine.load()
    yield


app = FastAPI(
    title="SignBridge Inference",
    description="Landmark-sequence ASL sign classifier (WLASL100 LSTM baseline)",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": engine.is_loaded,
        "vocabulary_size": engine.vocabulary_size,
    }


@app.post("/predict")
def predict(body: dict):
    frames = body.get("frames", [])
    result = engine.predict(frames)
    return result
