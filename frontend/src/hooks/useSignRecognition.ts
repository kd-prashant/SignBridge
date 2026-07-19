import { useCallback, useEffect, useRef, useState } from "react";
import type { LandmarkFrame, InferenceResponse } from "../lib/inferenceApi";
import { predictSign } from "../lib/inferenceApi";

const WINDOW_SIZE = 30;
const INFERENCE_INTERVAL_MS = 500;
const STABLE_FRAMES_REQUIRED = 3;
const DEFAULT_CONFIDENCE_THRESHOLD = 0.6;

export interface RecognitionState {
  text: string;
  lastCommittedSign: string | null;
  currentPrediction: InferenceResponse | null;
  isInferring: boolean;
  error: string | null;
  confidenceThreshold: number;
}

export function useSignRecognition(
  latestFrame: LandmarkFrame | null,
  isActive: boolean,
) {
  const [state, setState] = useState<RecognitionState>({
    text: "",
    lastCommittedSign: null,
    currentPrediction: null,
    isInferring: false,
    error: null,
    confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
  });

  const bufferRef = useRef<LandmarkFrame[]>([]);
  const lastInferenceRef = useRef(0);
  const stableCountRef = useRef(0);
  const lastLabelRef = useRef<string | null>(null);
  const lastCommitTimeRef = useRef(0);

  useEffect(() => {
    if (!isActive || !latestFrame) return;

    bufferRef.current.push(latestFrame);
    if (bufferRef.current.length > WINDOW_SIZE) {
      bufferRef.current.shift();
    }

    const now = Date.now();
    if (
      bufferRef.current.length < WINDOW_SIZE ||
      now - lastInferenceRef.current < INFERENCE_INTERVAL_MS
    ) {
      return;
    }

    lastInferenceRef.current = now;

    (async () => {
      setState((s) => ({ ...s, isInferring: true, error: null }));
      try {
        const result = await predictSign([...bufferRef.current]);
        setState((s) => ({ ...s, currentPrediction: result, isInferring: false }));

        const { label, confidence } = result.top_prediction;
        const threshold = state.confidenceThreshold;

        if (confidence >= threshold) {
          if (label === lastLabelRef.current) {
            stableCountRef.current += 1;
          } else {
            stableCountRef.current = 1;
            lastLabelRef.current = label;
          }

          const cooldownMs = 2000;
          if (
            stableCountRef.current >= STABLE_FRAMES_REQUIRED &&
            now - lastCommitTimeRef.current > cooldownMs
          ) {
            lastCommitTimeRef.current = now;
            stableCountRef.current = 0;
            lastLabelRef.current = null;
            setState((s) => ({
              ...s,
              text: s.text ? `${s.text} ${label}` : label,
              lastCommittedSign: label,
            }));
          }
        } else {
          stableCountRef.current = 0;
          lastLabelRef.current = null;
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          isInferring: false,
          error: err instanceof Error ? err.message : "Inference error",
        }));
      }
    })();
  }, [latestFrame, isActive, state.confidenceThreshold]);

  const clearText = useCallback(() => {
    setState((s) => ({ ...s, text: "", lastCommittedSign: null }));
    bufferRef.current = [];
    stableCountRef.current = 0;
    lastLabelRef.current = null;
  }, []);

  const setText = useCallback((text: string) => {
    setState((s) => ({ ...s, text }));
  }, []);

  const setConfidenceThreshold = useCallback((threshold: number) => {
    setState((s) => ({ ...s, confidenceThreshold: threshold }));
  }, []);

  const copyText = useCallback(async () => {
    if (state.text) await navigator.clipboard.writeText(state.text);
  }, [state.text]);

  return {
    ...state,
    clearText,
    setText,
    setConfidenceThreshold,
    copyText,
  };
}
