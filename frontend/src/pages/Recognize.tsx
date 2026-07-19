import { useCallback, useEffect, useState } from "react";
import { useMediaPipe } from "../hooks/useMediaPipe";
import { useSignRecognition } from "../hooks/useSignRecognition";
import { checkInferenceHealth } from "../lib/inferenceApi";

type CameraState = "idle" | "starting" | "active" | "denied" | "unavailable";

export default function Recognize() {
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [showOverlay, setShowOverlay] = useState(true);
  const [serviceOk, setServiceOk] = useState<boolean | null>(null);

  const {
    videoRef,
    canvasRef,
    isReady,
    error: mpError,
    latestFrame,
    startCamera,
    stopCamera,
    setShowOverlay: setMpOverlay,
  } = useMediaPipe();

  const isActive = cameraState === "active";
  const recognition = useSignRecognition(latestFrame, isActive);

  useEffect(() => {
    checkInferenceHealth()
      .then(() => setServiceOk(true))
      .catch(() => setServiceOk(false));
  }, []);

  useEffect(() => {
    setMpOverlay(showOverlay);
  }, [showOverlay, setMpOverlay]);

  const handleStart = useCallback(async () => {
    setCameraState("starting");
    try {
      await startCamera();
      setCameraState("active");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") setCameraState("denied");
      else setCameraState("unavailable");
    }
  }, [startCamera]);

  const handleStop = useCallback(() => {
    stopCamera();
    setCameraState("idle");
  }, [stopCamera]);

  const top3 = recognition.currentPrediction?.top_3 ?? [];
  const topConfidence = recognition.currentPrediction?.top_prediction.confidence ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Recognize Signs</h1>
        <p className="mt-2 text-slate-600">
          Position your hand clearly in frame, sign slowly, and pause briefly between signs.
          Recognizes <strong>ASL</strong> from the WLASL100 vocabulary.
        </p>
      </div>

      {serviceOk === false && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Inference service is not reachable. Start the ML service on port 8001, or predictions
          will fail once the camera is active.
        </div>
      )}

      {mpError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          MediaPipe error: {mpError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Camera panel */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black aspect-video">
            <video
              ref={videoRef}
              className="h-full w-full object-cover mirror"
              playsInline
              muted
              aria-label="Webcam feed for sign recognition"
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover mirror"
            />
            {cameraState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm text-white">
                Camera off — click Start to begin
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {cameraState !== "active" ? (
              <button
                onClick={handleStart}
                disabled={!isReady || cameraState === "starting"}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {cameraState === "starting" ? "Starting…" : "Start Camera"}
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Stop Camera
              </button>
            )}
            <button
              onClick={() => setShowOverlay((v) => !v)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {showOverlay ? "Hide" : "Show"} Landmarks
            </button>
          </div>

          {(cameraState === "denied" || cameraState === "unavailable") && (
            <p className="text-sm text-red-600">
              {cameraState === "denied"
                ? "Camera permission denied. Allow camera access in your browser settings."
                : "No camera found or camera is in use by another application."}
            </p>
          )}
        </div>

        {/* Output panel */}
        <div className="space-y-4">
          {recognition.lastCommittedSign && (
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
              Last sign: {recognition.lastCommittedSign}
            </div>
          )}

          <div>
            <label htmlFor="output-text" className="mb-1 block text-sm font-medium text-slate-700">
              Recognized text
            </label>
            <textarea
              id="output-text"
              value={recognition.text}
              onChange={(e) => recognition.setText(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Recognized signs will appear here…"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={recognition.clearText}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              onClick={recognition.copyText}
              disabled={!recognition.text}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Copy
            </button>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Top prediction confidence</span>
              <span>{Math.round(topConfidence * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${topConfidence * 100}%` }}
              />
            </div>
          </div>

          {/* Top-3 candidates */}
          {top3.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Top 3 candidates</p>
              <div className="space-y-1">
                {top3.map(({ label, confidence }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{label}</span>
                    <span className="text-slate-500">{Math.round(confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sensitivity slider */}
          <div>
            <label htmlFor="threshold" className="mb-1 block text-xs font-medium text-slate-500">
              Detection sensitivity ({Math.round(recognition.confidenceThreshold * 100)}%)
            </label>
            <input
              id="threshold"
              type="range"
              min={0.3}
              max={0.95}
              step={0.05}
              value={recognition.confidenceThreshold}
              onChange={(e) => recognition.setConfidenceThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {recognition.isInferring && (
            <p className="text-xs text-slate-400">Inferring…</p>
          )}
          {recognition.error && (
            <p className="text-xs text-red-600">{recognition.error}</p>
          )}
        </div>
      </div>

      <style>{`.mirror { transform: scaleX(-1); }`}</style>
    </div>
  );
}
