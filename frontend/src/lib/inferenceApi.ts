export interface InferenceCandidate {
  label: string;
  confidence: number;
}

export interface InferenceResponse {
  top_prediction: InferenceCandidate;
  top_3: InferenceCandidate[];
  model_loaded: boolean;
  vocabulary_size: number;
}

export interface LandmarkFrame {
  hands: number[][][];
  pose: number[][];
}

const INFERENCE_URL =
  import.meta.env.VITE_INFERENCE_URL ?? "/predict";

export async function predictSign(
  frames: LandmarkFrame[],
): Promise<InferenceResponse> {
  const res = await fetch(INFERENCE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frames }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Inference failed (${res.status}): ${detail}`);
  }

  return res.json();
}

export async function checkInferenceHealth(): Promise<{
  status: string;
  model_loaded: boolean;
  vocabulary_size: number;
}> {
  const base = INFERENCE_URL.replace(/\/predict$/, "");
  const res = await fetch(`${base}/health`);
  if (!res.ok) throw new Error("Inference service unreachable");
  return res.json();
}
