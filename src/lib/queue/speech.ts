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
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  unlockSpeech();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "id-ID";
  utter.rate = 0.8;

  // Heuristic to pick a female-sounding voice when available.
  const chooseFemaleVoice = (
    voices: SpeechSynthesisVoice[],
  ): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    // Prefer Indonesian voices when present
    const idVoices = voices.filter(
      (v) => v.lang && v.lang.toLowerCase().startsWith("id"),
    );
    const pool = idVoices.length ? idVoices : voices;

    // Regex heuristics for female voices / WaveNet F naming
    const wavenetF = /wave\s*-?net[^\w]*f/i;
    const femaleTokens = /(female|woman|wanita|perempuan|\bF\b)/i;

    let v = pool.find(
      (x) => wavenetF.test(x.name) || wavenetF.test(x.voiceURI || ""),
    );
    if (!v)
      v = pool.find(
        (x) => femaleTokens.test(x.name) || femaleTokens.test(x.voiceURI || ""),
      );
    if (!v) v = pool.find((x) => /google.*indonesian/i.test(x.name));
    if (!v) v = pool[0];
    return v || null;
  };

  const applyVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices() || [];
    const chosen = chooseFemaleVoice(voices);
    if (chosen) utter.voice = chosen;

    // Slightly increase pitch to make the voice sound more feminine on some engines
    utter.pitch = 1.05;

    window.speechSynthesis.cancel();
    playBeep();
    void waitForBeepEnd().then(() => {
      window.speechSynthesis.speak(utter);
    });
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length) {
    applyVoiceAndSpeak();
  } else {
    // Wait for voices to load, but fallback after 1s
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        onVoicesChanged,
      );
      applyVoiceAndSpeak();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        onVoicesChanged,
      );
      applyVoiceAndSpeak();
    }, 1000);
  }
}
