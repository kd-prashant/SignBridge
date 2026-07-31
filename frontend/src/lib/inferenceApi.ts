export interface InferenceCandidate {
  label: string;
  confidence: number;
}

export interface InferenceResponse {
  top_prediction: InferenceCandidate;
  top_3: InferenceCandidate[];
  model_loaded: boolean;
  vocabulary_size: number;
  mode?: string;
}

export interface LandmarkFrame {
  hands: number[][][];
  pose: number[][];
}

const ML_BASE_URL = "http://localhost:8001";

export async function predictSign(
  frames: LandmarkFrame[],
): Promise<InferenceResponse> {
  const res = await fetch(`${ML_BASE_URL}/predict`, {
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

export async function predictAlphabet(
  frames: LandmarkFrame[],
): Promise<InferenceResponse> {
  const res = await fetch(`${ML_BASE_URL}/predict/alphabet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frames }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Alphabet inference failed (${res.status}): ${detail}`);
  }

  return res.json();
}

export async function checkInferenceHealth(): Promise<{
  status: string;
  model_loaded: boolean;
  vocabulary_size: number;
}> {
  const res = await fetch(`${ML_BASE_URL}/health`);
  if (!res.ok) throw new Error("Inference service unreachable");
  return res.json();
}
