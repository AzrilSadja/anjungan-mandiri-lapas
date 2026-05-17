let speechUnlocked = false;
let audioCtx: AudioContext | null = null;
let beepAudio: HTMLAudioElement | null = null;
const BEEP_AUDIO_URL =
  process.env.NEXT_PUBLIC_BEEP_AUDIO_URL || "/audio/beep.mp3";

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

function unlockSpeech(): void {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    speechUnlocked
  )
    return;
  const unlockUtter = new SpeechSynthesisUtterance("");
  window.speechSynthesis.speak(unlockUtter);
  void getAudioContext()
    ?.resume()
    .catch(() => {
      // Ignore resume errors; browser might still require another gesture.
    });
  speechUnlocked = true;
}

export function setupSpeechUnlockOnInteraction(): void {
  if (typeof window === "undefined") return;
  const handler = () => {
    unlockSpeech();
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
  };
  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
}

function playBeep(): void {
  if (typeof window !== "undefined") {
    if (!beepAudio) {
      beepAudio = new Audio(BEEP_AUDIO_URL);
      beepAudio.preload = "auto";
    }

    beepAudio.currentTime = 0;
    void beepAudio.play().catch(() => {
      // Fallback to generated beep if browser blocks or file missing.
      playGeneratedBeep();
    });
    return;
  }
}

function waitForBeepEnd(maxMs = 2000): Promise<void> {
  return new Promise((resolve) => {
    if (!beepAudio) {
      resolve();
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      beepAudio?.removeEventListener("ended", onEnded);
      window.clearTimeout(timer);
      resolve();
    };
    const onEnded = () => finish();
    const timer = window.setTimeout(finish, maxMs);

    beepAudio.addEventListener("ended", onEnded, { once: true });
  });
}

function playGeneratedBeep(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

export function speakText(text: string): void {
  if (typeof window === "undefined") return;

  const utter = new SpeechSynthesisUtterance(text);

  utter.lang = "id-ID";
  utter.pitch = 1;
  utter.rate = 0.85;
  utter.volume = 1;

  window.speechSynthesis.speak(utter);

  console.log("SUARA JALAN:", text);
}