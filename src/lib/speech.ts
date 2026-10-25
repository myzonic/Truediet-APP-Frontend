/**
 * Voice meal-note speech-to-text.
 *
 * Uses sherpa-onnx (Whisper base.en) running on-device / in the browser via
 * WebAssembly. No audio leaves the device. The first transcription downloads
 * the model once (~160 MB int8) and it is then cached by the browser / app.
 *
 * Web: microphone is captured with the Web Audio API and transcribed locally.
 * Native: the same sherpa-onnx engine is used after `expo prebuild` + a dev
 * client / store build is produced; until that build exists, native devices
 * fall back to typed entry (see isSpeechSupported()).
 */
import { Platform } from 'react-native';

const MODEL_BASE_URL =
  'https://huggingface.co/csukuangfj/sherpa-onnx-whisper-base.en/resolve/main';

let SHERPA_VERSION = '1.3.1';
try {
  SHERPA_VERSION = require('@siteed/sherpa-onnx.rn/package.json').version;
} catch {
  // keep the pinned fallback
}

const WASM_BASE_PATH =
  process.env.EXPO_PUBLIC_SHERPA_WASM_BASE ||
  `https://cdn.jsdelivr.net/npm/@siteed/sherpa-onnx.rn@${SHERPA_VERSION}/wasm/`;

const ASR_CONFIG: any = {
  modelDir: '/wasm/whisper-base-en',
  modelType: 'whisper',
  streaming: false,
  language: 'en',
  task: 'transcribe',
  numThreads: 2,
  decodingMethod: 'greedy_search',
  modelBaseUrl: MODEL_BASE_URL,
  modelFiles: {
    encoder: 'base.en-encoder.int8.onnx',
    decoder: 'base.en-decoder.int8.onnx',
    tokens: 'base.en-tokens.txt',
  },
};

export type ModelProgress = { loaded: number; total: number; filename: string };

let modPromise: Promise<any> | null = null;
let asrPromise: Promise<any> | null = null;

let audioContext: any = null;
let mediaStream: any = null;
let sourceNode: any = null;
let processor: any = null;
let sink: any = null;
let chunks: Float32Array[] = [];
let captureRate = 16000;

function loadModule(): Promise<any> {
  if (!modPromise) {
    modPromise = import('@siteed/sherpa-onnx.rn').then((m: any) => m);
  }
  return modPromise;
}

function getASR(mod: any): any {
  return mod?.ASR || mod?.default?.ASR;
}

export function isSpeechSupported(): boolean {
  if (Platform.OS !== 'web') return false;
  const g: any = globalThis as any;
  return !!(
    g.navigator &&
    g.navigator.mediaDevices &&
    typeof g.navigator.mediaDevices.getUserMedia === 'function' &&
    (g.AudioContext || g.webkitAudioContext)
  );
}

function ensureASR(onProgress?: (p: ModelProgress) => void): Promise<any> {
  if (!asrPromise) {
    asrPromise = (async () => {
      const mod = await loadModule();
      const ASR = getASR(mod);
      if (!ASR) throw new Error('Speech engine could not be loaded.');
      if (Platform.OS === 'web' && typeof mod.configureSherpaOnnx === 'function') {
        mod.configureSherpaOnnx({ wasmBasePath: WASM_BASE_PATH });
      }
      const result = await ASR.initialize({
        ...ASR_CONFIG,
        onProgress: onProgress
          ? (info: any) =>
              onProgress({
                loaded: info?.loaded ?? 0,
                total: info?.total ?? 0,
                filename: info?.filename ?? '',
              })
          : undefined,
      });
      if (result && result.success === false) {
        throw new Error(result.error || 'The speech model could not be loaded.');
      }
      return ASR;
    })().catch((err) => {
      asrPromise = null;
      throw err;
    });
  }
  return asrPromise;
}

export async function prepareSpeech(onProgress?: (p: ModelProgress) => void): Promise<void> {
  await ensureASR(onProgress);
}

function resampleTo16k(input: Float32Array, inRate: number): Float32Array {
  if (inRate === 16000) return input;
  const ratio = inRate / 16000;
  const outLen = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio;
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = idx - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

export async function startSpeechRecording(): Promise<void> {
  if (!isSpeechSupported()) {
    throw new Error(
      'On-device microphone capture needs the native app build. You can type your meal note instead.'
    );
  }
  const g: any = globalThis as any;
  mediaStream = await g.navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });
  const Ctx = g.AudioContext || g.webkitAudioContext;
  try {
    audioContext = new Ctx({ sampleRate: 16000 });
  } catch {
    audioContext = new Ctx();
  }
  captureRate = audioContext.sampleRate || 16000;
  sourceNode = audioContext.createMediaStreamSource(mediaStream);
  processor = audioContext.createScriptProcessor(4096, 1, 1);
  sink = audioContext.createGain();
  sink.gain.value = 0;
  chunks = [];
  processor.onaudioprocess = (event: any) => {
    const data = event.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(data));
  };
  sourceNode.connect(processor);
  processor.connect(sink);
  sink.connect(audioContext.destination);
}

function teardown(): void {
  try {
    processor?.disconnect();
    sourceNode?.disconnect();
    sink?.disconnect();
  } catch {
    // already torn down
  }
  try {
    mediaStream?.getTracks?.().forEach((track: any) => track.stop());
  } catch {
    // ignore
  }
  try {
    audioContext?.close?.();
  } catch {
    // ignore
  }
  audioContext = null;
  mediaStream = null;
  sourceNode = null;
  processor = null;
  sink = null;
}

function trimSilence(input: Float32Array, rate: number, threshold = 0.008): Float32Array {
  let start = 0;
  let end = input.length;
  while (start < end && Math.abs(input[start]) < threshold) start++;
  while (end > start && Math.abs(input[end - 1]) < threshold) end--;
  if (start >= end) return input;
  const margin = Math.round(rate * 0.12);
  start = Math.max(0, start - margin);
  end = Math.min(input.length, end + margin);
  return input.subarray(start, end);
}

export async function stopSpeechAndTranscribe(): Promise<string> {
  const rate = captureRate;
  const captured = chunks;
  chunks = [];
  teardown();

  const total = captured.reduce((sum, part) => sum + part.length, 0);
  if (total < rate * 0.2) {
    throw new Error('That was too short. Tap record and speak for a moment.');
  }
  const merged = new Float32Array(total);
  let offset = 0;
  for (const part of captured) {
    merged.set(part, offset);
    offset += part.length;
  }
  const trimmed = trimSilence(merged, rate);
  if (trimmed.length < rate * 0.2) {
    throw new Error('We could not hear speech. Try again and speak a little closer to the mic.');
  }
  const samples = resampleTo16k(trimmed, rate);

  const ASR = await ensureASR();
  const result = await ASR.recognizeFromSamples(16000, Array.from(samples));
  if (result && result.success === false) {
    throw new Error(result.error || 'Could not transcribe your note.');
  }
  return String(result?.text || '').trim();
}

export async function cancelSpeech(): Promise<void> {
  chunks = [];
  teardown();
}
