import { useCallback, useEffect, useRef, useState } from "react";
import type { LandmarkFrame, InferenceResponse } from "../lib/inferenceApi";
import { predictAlphabet } from "../lib/inferenceApi";

// --- Tuned constants for Alphabet recognition ---
const WINDOW_SIZE = 30;
const INFERENCE_INTERVAL_MS = 300;   // Run inference more frequently (was 500ms)
const STABLE_FRAMES_REQUIRED = 2;    // Less frames required (was 3)
const COMMIT_COOLDOWN_MS = 1500;     // Shorter cooldown (was 2000ms)
const ALPHABET_CONFIDENCE_THRESHOLD = 0.40; // Lower threshold for alphabet (was 0.60)

export interface RecognitionState {
  text: string;
  lastCommittedSign: string | null;
  currentPrediction: InferenceResponse | null;
  isInferring: boolean;
  error: string | null;
  confidenceThreshold: number;
  modelLoaded: boolean;
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
    confidenceThreshold: ALPHABET_CONFIDENCE_THRESHOLD,
    modelLoaded: false,
  });

  const bufferRef = useRef<LandmarkFrame[]>([]);
  const lastInferenceRef = useRef(0);
  const stableCountRef = useRef(0);
  const lastLabelRef = useRef<string | null>(null);
  const lastCommitTimeRef = useRef(0);
  const thresholdRef = useRef(ALPHABET_CONFIDENCE_THRESHOLD);

  // Keep ref in sync with state for use inside async callbacks
  useEffect(() => {
    thresholdRef.current = state.confidenceThreshold;
  }, [state.confidenceThreshold]);

  useEffect(() => {
    if (!isActive) return;
    if (!latestFrame) return;

    // Only add frames that actually have hand data
    const hasHand = latestFrame.hands && latestFrame.hands.length > 0;
    if (hasHand) {
      bufferRef.current.push(latestFrame);
      if (bufferRef.current.length > WINDOW_SIZE) {
        bufferRef.current.shift();
      }
    }

    const now = Date.now();
    if (now - lastInferenceRef.current < INFERENCE_INTERVAL_MS) return;
    if (bufferRef.current.length === 0) return;

    lastInferenceRef.current = now;

    (async () => {
      setState((s) => ({ ...s, isInferring: true, error: null }));
      try {
        const result = await predictAlphabet([...bufferRef.current]);

        setState((s) => ({
          ...s,
          currentPrediction: result,
          isInferring: false,
          modelLoaded: result.model_loaded,
        }));

        const { label, confidence } = result.top_prediction;
        if (!label) return;

        const threshold = thresholdRef.current;

        if (confidence >= threshold) {
          if (label === lastLabelRef.current) {
            stableCountRef.current += 1;
          } else {
            stableCountRef.current = 1;
            lastLabelRef.current = label;
          }

          if (
            stableCountRef.current >= STABLE_FRAMES_REQUIRED &&
            now - lastCommitTimeRef.current > COMMIT_COOLDOWN_MS
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
  }, [latestFrame, isActive]);

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
