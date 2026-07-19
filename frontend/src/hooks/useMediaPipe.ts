import { useCallback, useEffect, useRef, useState } from "react";
import {
  HandLandmarker,
  PoseLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import type { LandmarkFrame } from "../lib/inferenceApi";

const HAND_LANDMARKER_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const POSE_LANDMARKER_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export interface MediaPipeState {
  isReady: boolean;
  error: string | null;
  latestFrame: LandmarkFrame | null;
}

function flattenHandLandmarks(
  landmarks: { x: number; y: number; z: number }[][] | undefined,
): number[][][] {
  if (!landmarks?.length) return [];
  return landmarks.map((hand) =>
    hand.map((lm) => [lm.x, lm.y, lm.z]),
  );
}

function flattenPoseLandmarks(
  landmarks: { x: number; y: number; z: number; visibility?: number }[] | undefined,
): number[][] {
  if (!landmarks?.length) return [];
  return landmarks.map((lm) => [lm.x, lm.y, lm.z, lm.visibility ?? 1]);
}

export function useMediaPipe() {
  const [state, setState] = useState<MediaPipeState>({
    isReady: false,
    error: null,
    latestFrame: null,
  });

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const showOverlayRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm",
        );

        const [handLandmarker, poseLandmarker] = await Promise.all([
          HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: HAND_LANDMARKER_URL, delegate: "GPU" },
            runningMode: "VIDEO",
            numHands: 2,
          }),
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: POSE_LANDMARKER_URL, delegate: "GPU" },
            runningMode: "VIDEO",
            numPoses: 1,
          }),
        ]);

        if (cancelled) return;
        handLandmarkerRef.current = handLandmarker;
        poseLandmarkerRef.current = poseLandmarker;
        setState((s) => ({ ...s, isReady: true, error: null }));
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          isReady: false,
          error: err instanceof Error ? err.message : "Failed to load MediaPipe",
        }));
      }
    }

    init();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      handLandmarkerRef.current?.close();
      poseLandmarkerRef.current?.close();
    };
  }, []);

  const drawOverlay = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      handResult: ReturnType<HandLandmarker["detectForVideo"]>,
      poseResult: ReturnType<PoseLandmarker["detectForVideo"]>,
    ) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (poseResult.landmarks?.[0]) {
        ctx.fillStyle = "#22c55e";
        for (const lm of poseResult.landmarks[0]) {
          ctx.beginPath();
          ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      if (handResult.landmarks) {
        ctx.fillStyle = "#3b82f6";
        for (const hand of handResult.landmarks) {
          for (const lm of hand) {
            ctx.beginPath();
            ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
    },
    [],
  );

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const handLm = handLandmarkerRef.current;
    const poseLm = poseLandmarkerRef.current;
    if (!video || video.readyState < 2 || !handLm || !poseLm) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const timestamp = performance.now();
    const handResult = handLm.detectForVideo(video, timestamp);
    const poseResult = poseLm.detectForVideo(video, timestamp);

    const frame: LandmarkFrame = {
      hands: flattenHandLandmarks(handResult.landmarks),
      pose: flattenPoseLandmarks(poseResult.landmarks[0]),
    };

    setState((s) => ({ ...s, latestFrame: frame }));

    if (showOverlayRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        drawOverlay(ctx, handResult, poseResult);
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [drawOverlay]);

  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });

    if (!videoRef.current) throw new Error("Video element not mounted");
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    animFrameRef.current = requestAnimationFrame(processFrame);
    return stream;
  }, [processFrame]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const setShowOverlay = useCallback((show: boolean) => {
    showOverlayRef.current = show;
    if (!show && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    ...state,
    startCamera,
    stopCamera,
    setShowOverlay,
  };
}
