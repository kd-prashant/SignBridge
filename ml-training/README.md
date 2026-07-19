# SignBridge training pipeline — WLASL100 Stage 1

## Steps

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
pip install yt-dlp              # for video downloads

# 1. Download WLASL metadata + build WLASL100 manifest
python scripts/download_wlasl.py

# 2. Download video files (requires yt-dlp + network)
python scripts/download_videos.py

# 3. Extract MediaPipe landmarks from videos
python scripts/extract_landmarks.py

# 4. Train LSTM and export model to ml-service/models/
python scripts/train_lstm.py
```

## Output

After training, these files land in `../ml-service/models/`:

- `labels.json` — gloss label list (written during step 1)
- `lstm_wlasl100.pt` — trained PyTorch checkpoint

Restart the FastAPI service to load the real model.

## Dev shortcuts

Test with a small batch first:

```bash
python scripts/download_videos.py --limit 20
python scripts/extract_landmarks.py --limit 20
python scripts/train_lstm.py --epochs 5
```

## Notes

- WLASL videos are sourced from YouTube; some URLs may be dead.
- Expect ~60–70% top-1 accuracy ceiling at full WLASL2000 scale; WLASL100 should be higher.
- Stage 2+ migrates to ST-GCN — see PRD Section 4.4.
