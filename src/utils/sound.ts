/**
 * Synthesizer efek suara ringan menggunakan Web Audio API
 * Tanpa ketergantungan file audio eksternal.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

function getContext(): AudioContext | null {
  if (!soundEnabled || typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delay = 0
): void {
  const ctx = getContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    // Abaikan error audio agar tidak mengganggu gameplay
  }
}

export function playClick(): void {
  playTone(540, 0.07, 'triangle', 0.1);
}

export function playDrop(): void {
  playTone(440, 0.08, 'sine', 0.1);
  playTone(660, 0.1, 'sine', 0.1, 0.05);
}

export function playCook(): void {
  playTone(330, 0.09, 'triangle', 0.08, 0);
  playTone(494, 0.09, 'triangle', 0.08, 0.07);
}

export function playSuccess(): void {
  playTone(523.25, 0.14, 'triangle', 0.12, 0);
  playTone(659.25, 0.14, 'triangle', 0.12, 0.1);
  playTone(783.99, 0.18, 'triangle', 0.14, 0.2);
  playTone(1046.5, 0.28, 'sine', 0.14, 0.32);
}

export function playError(): void {
  playTone(260, 0.16, 'sawtooth', 0.08, 0);
  playTone(195, 0.24, 'sawtooth', 0.08, 0.14);
}
