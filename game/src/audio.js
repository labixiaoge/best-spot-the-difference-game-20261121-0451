// Sound, made with the Web Audio API and nothing else: short oscillator
// notes, no audio files, no network. The context is created on the first
// player gesture, so browsers never complain about autoplay.
let audioContext = null;
let muted = false;

function context() {
  if (audioContext === null) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function note(frequency, startAt, length, type, volume) {
  const ctx = context();
  if (ctx === null || muted) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + length);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startAt);
  oscillator.stop(ctx.currentTime + startAt + length + 0.05);
}

export function unlockAudio() {
  context();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

/** A bright two-note chime when a difference is found. */
export function playFound() {
  note(880, 0, 0.18, 'sine', 0.22);
  note(1318.5, 0.09, 0.28, 'sine', 0.2);
}

/** A low dull thud for a wrong click. */
export function playMiss() {
  note(160, 0, 0.22, 'triangle', 0.2);
  note(110, 0.05, 0.25, 'triangle', 0.16);
}

/** A soft rising blip for a hint. */
export function playHint() {
  note(523.25, 0, 0.12, 'sine', 0.14);
  note(784, 0.08, 0.18, 'sine', 0.12);
}

/** A click for buttons and the title screen. */
export function playClick() {
  note(660, 0, 0.08, 'sine', 0.12);
}

/** A little arpeggio when a picture pair is cleared. */
export function playLevelClear() {
  [523.25, 659.25, 784, 1046.5].forEach((frequency, i) => {
    note(frequency, i * 0.11, 0.3, 'sine', 0.2);
  });
}

/** A longer fanfare when the whole hunt is won. */
export function playWin() {
  [523.25, 659.25, 784, 1046.5, 784, 1046.5, 1318.5].forEach((frequency, i) => {
    note(frequency, i * 0.13, 0.32, 'triangle', 0.18);
  });
}
