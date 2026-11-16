/**
 * Voice Food Log speech recording & Groq server-side transcription client.
 *
 * Security & architecture:
 * - No Groq API key is ever stored or referenced in the mobile client.
 * - Audio is recorded locally with `expo-av` on native iOS/Android (or
 *   MediaRecorder on web) and uploaded to `POST /api/voice/transcribe`,
 *   which authenticates the user and forwards the audio to Groq's
 *   `whisper-large-v3-turbo` model using the server-side `GROQ_API_KEY`.
 * - Temporary recording files on the device are deleted immediately after
 *   upload or cancellation.
 */
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { apiFetch } from './api-client';

export interface ProposedFoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  rawText: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  uncertain?: boolean;
}

export interface VoiceTranscriptionResponse {
  text: string;
  model: string;
  language: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: ProposedFoodItem[];
}

export type ModelProgress = { loaded: number; total: number; filename: string };

let activeRecording: Audio.Recording | null = null;
let webMediaRecorder: any = null;
let webChunks: Blob[] = [];
let webStream: any = null;

export function isSpeechSupported(): boolean {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return true;
  }
  const g: any = globalThis as any;
  return !!(g.navigator?.mediaDevices?.getUserMedia);
}

export async function prepareSpeech(_onProgress?: (p: ModelProgress) => void): Promise<void> {
  // Server-side Groq transcription requires no local 160MB model download.
  return;
}

export async function startSpeechRecording(): Promise<void> {
  if (Platform.OS === 'web') {
    const g: any = globalThis as any;
    if (!g.navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Microphone capture is not supported in this browser.');
    }
    webStream = await g.navigator.mediaDevices.getUserMedia({ audio: true });
    webChunks = [];
    const MR = g.MediaRecorder;
    webMediaRecorder = new MR(webStream);
    webMediaRecorder.ondataavailable = (e: any) => {
      if (e.data && e.data.size > 0) webChunks.push(e.data);
    };
    webMediaRecorder.start();
    return;
  }

  // Clean up any leftover recording first
  if (activeRecording) {
    try {
      await activeRecording.stopAndUnloadAsync();
    } catch {
      // ignore
    }
    activeRecording = null;
  }

  const perm = await Audio.requestPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Microphone permission was denied. Enable microphone access in your device settings to use Voice Food Log.');
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  activeRecording = recording;
}

export async function pauseSpeechRecording(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (webMediaRecorder && webMediaRecorder.state === 'recording') {
      webMediaRecorder.pause();
      return true;
    }
    return false;
  }
  if (activeRecording) {
    await activeRecording.pauseAsync();
    return true;
  }
  return false;
}

export async function resumeSpeechRecording(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (webMediaRecorder && webMediaRecorder.state === 'paused') {
      webMediaRecorder.resume();
      return true;
    }
    return false;
  }
  if (activeRecording) {
    await activeRecording.startAsync();
    return true;
  }
  return false;
}

export async function stopSpeechAndTranscribeFull(language = 'en'): Promise<VoiceTranscriptionResponse> {
  if (Platform.OS === 'web') {
    if (!webMediaRecorder) {
      throw new Error('No active recording found.');
    }
    const blob: Blob = await new Promise((resolve, reject) => {
      webMediaRecorder.onstop = () => {
        const b = new Blob(webChunks, { type: webMediaRecorder.mimeType || 'audio/webm' });
        resolve(b);
      };
      webMediaRecorder.onerror = (err: any) => reject(err);
      webMediaRecorder.stop();
    });
    try {
      webStream?.getTracks?.().forEach((t: any) => t.stop());
    } catch {}
    webMediaRecorder = null;
    webStream = null;
    webChunks = [];

    if (blob.size < 256) {
      throw new Error('That recording was too short or silent. Tap record and speak clearly.');
    }

    const base64: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return apiFetch<VoiceTranscriptionResponse>('/api/voice/transcribe', {
      method: 'POST',
      body: {
        audioBase64: base64,
        mimeType: blob.type || 'audio/webm',
        filename: 'recording.webm',
        language,
      },
    });
  }

  if (!activeRecording) {
    throw new Error('No active recording found.');
  }

  const recording = activeRecording;
  activeRecording = null;

  let uri: string | null = null;
  try {
    const status = await recording.getStatusAsync();
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => undefined);

    if ((status.durationMillis ?? 0) < 400) {
      throw new Error('That recording was too short. Tap record and speak for at least a second.');
    }

    uri = recording.getURI();
    if (!uri) {
      throw new Error('Could not read the recorded audio file.');
    }

    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists || (info.size && info.size > 20 * 1024 * 1024)) {
      throw new Error('Recording file is invalid or exceeds the 20 MB limit.');
    }

    const audioBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await apiFetch<VoiceTranscriptionResponse>('/api/voice/transcribe', {
      method: 'POST',
      body: {
        audioBase64,
        mimeType: 'audio/m4a',
        filename: 'recording.m4a',
        language,
      },
    });

    return response;
  } finally {
    if (uri) {
      FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
    }
  }
}

export async function stopSpeechAndTranscribe(language = 'en'): Promise<string> {
  const res = await stopSpeechAndTranscribeFull(language);
  return res.text;
}

export async function parseFoodTranscript(text: string): Promise<{
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: ProposedFoodItem[];
}> {
  return apiFetch('/api/voice/parse', {
    method: 'POST',
    body: { text },
  });
}

export async function cancelSpeech(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      webMediaRecorder?.stop?.();
    } catch {}
    try {
      webStream?.getTracks?.().forEach((t: any) => t.stop());
    } catch {}
    webMediaRecorder = null;
    webStream = null;
    webChunks = [];
    return;
  }

  if (activeRecording) {
    const rec = activeRecording;
    activeRecording = null;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch {
      // ignore cleanup failure
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => undefined);
  }
}
