import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import "./style.css";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const CAMERA = Object.freeze({ IDLE: "IDLE", STARTING: "STARTING", LIVE: "LIVE", ERROR: "ERROR", STOPPED: "STOPPED" });
const DEBUG_ENABLED = new URLSearchParams(window.location.search).has("debug");

const CHORDS = {
  G: {
    name: "Gmaj7",
    displayName: "Gmaj7",
    gesture: "OPEN HAND",
    // Bass: G2, D3; Upper: G3, B3, D4, F#4 (Common tones with Em7 and Bm7/A)
    notes: [98.00, 146.83, 196.00, 246.94, 293.66, 369.99]
  },
  D: {
    name: "Dadd9",
    displayName: "Dadd9",
    gesture: "PEACE",
    // Bass: D2, D3; Upper: F#3, A3, D4, E4 (Voice leads smoothly to Em7)
    notes: [73.42, 146.83, 185.00, 220.00, 293.66, 329.63]
  },
  Em: {
    name: "Em7",
    displayName: "Em7",
    gesture: "FIST",
    // Bass: E2, E3; Upper: G3, B3, D4, E4 (D4 and E4 sustained common tones from Dadd9)
    notes: [82.41, 164.81, 196.00, 246.94, 293.66, 329.63]
  },
  C: {
    name: "Cadd9",
    displayName: "Cadd9",
    gesture: "POINT",
    // Bass: C2, G2; Upper: G3, C4, D4, E4
    notes: [65.41, 98.00, 196.00, 261.63, 293.66, 329.63]
  },
  Bm: {
    name: "Bm7/A",
    displayName: "Bm7/A",
    gesture: "THREE FINGERS",
    // Bass: B1, A2; Upper: A3, B3, D4, F#4 (Common tones B3, D4, F#4 with Gmaj7)
    notes: [61.74, 110.00, 220.00, 246.94, 293.66, 369.99]
  },
  A: {
    name: "Aadd9",
    displayName: "Aadd9",
    gesture: "THUMB + INDEX",
    // Bass: A1, A2; Upper: A3, B3, C#4, E4 (Voice leads seamlessly back to Gmaj7)
    notes: [55.00, 110.00, 220.00, 246.94, 277.18, 329.63]
  },
  MUTE: {
    name: "MUTE",
    displayName: "MUTE",
    gesture: "NO VALID GESTURE",
    notes: []
  }
};

// Iris vocal-phrase-aware accompaniment timing (editable per section)
const SONGS = {
  iris: {
    title: "Iris",
    artist: "Goo Goo Dolls",
    tempo: 76,
    sections: {
      // Verse: Soft, sparse, warm, lots of sustain, gentle rolling chord changes
      verse: [
        { chord: "D",  duration: 3800, intensity: 0.52, rollSpeed: 20, phrase: "And I'd give up forever to touch you", breath: 350 },
        { chord: "Em", duration: 3800, intensity: 0.50, rollSpeed: 20, phrase: "'Cause I know that you feel me somehow", breath: 350 },
        { chord: "G",  duration: 4800, intensity: 0.54, rollSpeed: 24, phrase: "You're the closest to heaven that I'll ever be", breath: 500 },
        { chord: "Bm", duration: 3800, intensity: 0.48, rollSpeed: 20, phrase: "And I don't want to go home right now", breath: 350 },
        { chord: "A",  duration: 3800, intensity: 0.50, rollSpeed: 20, phrase: "And all I can taste is this moment", breath: 350 },
        { chord: "G",  duration: 5400, intensity: 0.56, rollSpeed: 24, phrase: "And all I can breathe is your life", breath: 700 }
      ],
      // Chorus: Fuller, slightly louder, wider voicings, emotional lift
      chorus: [
        { chord: "Bm", duration: 2800, intensity: 0.74, rollSpeed: 16, phrase: "And I don't want the world to see me", breath: 200 },
        { chord: "A",  duration: 2800, intensity: 0.72, rollSpeed: 16, phrase: "", breath: 200 },
        { chord: "G",  duration: 4200, intensity: 0.78, rollSpeed: 20, phrase: "", breath: 400 },
        { chord: "Bm", duration: 2800, intensity: 0.75, rollSpeed: 16, phrase: "'Cause I don't think that they'd understand", breath: 200 },
        { chord: "A",  duration: 2800, intensity: 0.73, rollSpeed: 16, phrase: "", breath: 200 },
        { chord: "G",  duration: 4200, intensity: 0.80, rollSpeed: 20, phrase: "", breath: 400 },
        { chord: "Bm", duration: 2800, intensity: 0.76, rollSpeed: 16, phrase: "When everything's made to be broken", breath: 200 },
        { chord: "A",  duration: 2800, intensity: 0.74, rollSpeed: 16, phrase: "", breath: 200 },
        { chord: "G",  duration: 4200, intensity: 0.82, rollSpeed: 20, phrase: "", breath: 400 },
        { chord: "Bm", duration: 2900, intensity: 0.78, rollSpeed: 16, phrase: "I just want you to know who I am", breath: 250 },
        { chord: "A",  duration: 2900, intensity: 0.75, rollSpeed: 16, phrase: "", breath: 250 },
        { chord: "G",  duration: 5600, intensity: 0.84, rollSpeed: 22, phrase: "(Chorus bloom & fade)", breath: 800 }
      ],
      // Outro: Tender, quiet resolution, fading out
      outro: [
        { chord: "D",  duration: 3800, intensity: 0.46, rollSpeed: 22, phrase: "I just want you to know who I am...", breath: 400 },
        { chord: "Em", duration: 3800, intensity: 0.44, rollSpeed: 22, phrase: "", breath: 400 },
        { chord: "G",  duration: 6800, intensity: 0.48, rollSpeed: 26, phrase: "(Final sustained chord)", breath: 1000 }
      ]
    }
  }
};

function buildSongSchedule(songKey = "iris") {
  const song = SONGS[songKey];
  if (!song) return [];
  const schedule = [];
  for (const [sectionName, steps] of Object.entries(song.sections)) {
    steps.forEach((step, idx) => {
      schedule.push({
        ...step,
        section: sectionName,
        indexInSection: idx
      });
    });
  }
  return schedule;
}

const IRIS_AUTOPLAY = buildSongSchedule("iris");

const el = {
  video: document.querySelector("#camera"),
  canvas: document.querySelector("#hand-canvas"),
  start: document.querySelector("#start-camera"),
  sound: document.querySelector("#sound-toggle"),
  mute: document.querySelector("#mute-button"),
  autoPlay: document.querySelector("#auto-play"),
  appStatus: document.querySelector("#app-status"),
  cameraStatus: document.querySelector("#camera-status"),
  note: document.querySelector("#tracking-note"),
  empty: document.querySelector("#camera-empty"),
  error: document.querySelector("#camera-error"),
  gesture: document.querySelector("#detected-gesture"),
  chord: document.querySelector("#current-chord"),
  description: document.querySelector("#chord-description"),
  keys: [...document.querySelectorAll(".piano-key")],
  progression: [...document.querySelectorAll("#progression [data-chord]")],
  debug: document.querySelector("#gesture-debug"),
  volumeSlider: document.querySelector("#volume-slider"),
  volumeLabel: document.querySelector("#volume-label")
};

const context = el.canvas.getContext("2d");
let stream = null;
let cameraState = CAMERA.IDLE;
let isStartingCamera = false;
let handLandmarker = null;
let trackerPromise = null;
let animationFrame = null;
let trackerReady = false;
let lastVideoTime = -1;

// Fast gesture state tracking
let currentChord = "MUTE";
let candidateGesture = "MUTE";
let candidateStartTime = 0;
let candidateFrames = 0;
let noHandFrames = 0;
let rawGesture = "SEARCHING";
let stableGesture = "SEARCHING";
let lastClassification = null;

let autoPlayEnabled = false;
let autoPlayTimer = null;
let autoPlayIndex = 0;

class AudioEngine {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.volume = 1.0;
    this.masterGain = null;
    this.masterBus = null;
    this.activeVoices = [];
    this.releaseTimer = null;
    this.lastChord = "MUTE";
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1.0, vol));
    if (this.masterGain && this.context) {
      this.masterGain.gain.setValueAtTime(this.volume, this.context.currentTime);
    }
  }

  initContext() {
    if (this.context) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.warn("[AUDIO] Web Audio API is not supported in this browser.");
      return;
    }

    try {
      this.context = new AudioCtx();

      // Master output bus with volume control
      this.masterBus = this.context.createGain();
      this.masterBus.gain.value = 1.0;

      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.volume;

      // Transparent limiter prevents digital clipping while preserving pure tone
      this.limiter = this.context.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-2.0, this.context.currentTime);
      this.limiter.knee.setValueAtTime(4, this.context.currentTime);
      this.limiter.ratio.setValueAtTime(3.0, this.context.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.context.currentTime);
      this.limiter.release.setValueAtTime(0.08, this.context.currentTime);

      this.masterBus.connect(this.limiter);
      this.limiter.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);

      // Gentle acoustic room ambience
      try {
        const sampleRate = this.context.sampleRate || 44100;
        const decay = 0.9;
        const length = Math.floor(sampleRate * decay);
        const impulse = this.context.createBuffer(2, length, sampleRate);

        for (let ch = 0; ch < 2; ch++) {
          const data = impulse.getChannelData(ch);
          for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 6.0) * 0.08;
          }
        }

        const preDelay = this.context.createDelay(0.06);
        preDelay.delayTime.setValueAtTime(0.015, this.context.currentTime);

        this.reverbNode = this.context.createConvolver();
        this.reverbNode.buffer = impulse;

        this.reverbGain = this.context.createGain();
        this.reverbGain.gain.setValueAtTime(0.05, this.context.currentTime);

        this.masterBus.connect(preDelay);
        preDelay.connect(this.reverbNode);
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
      } catch (revErr) {
        console.warn("[AUDIO] Reverb setup skipped:", revErr);
      }
    } catch (err) {
      console.error("[AUDIO] Failed to initialize AudioContext:", err);
    }
  }

  async unlock() {
    this.initContext();
    if (!this.context) return false;
    if (this.context.state === "suspended") {
      try {
        await this.context.resume();
        console.info("[AUDIO] AudioContext resumed successfully.");
      } catch (err) {
        console.warn("[AUDIO] Context resume error:", err);
      }
    }
    return this.context.state === "running";
  }

  // Release currently sounding chord smoothly
  release(seconds = 0.5) {
    if (!this.context || this.context.state === "suspended") return;
    const now = this.context.currentTime;
    const releaseTime = Math.max(0.15, Math.min(seconds, 1.2));

    for (const voice of this.activeVoices) {
      try {
        const gain = voice.gain.gain;
        gain.cancelScheduledValues(now);
        const currentVal = Math.max(gain.value, 0.0001);
        gain.setValueAtTime(currentVal, now);
        gain.setTargetAtTime(0.00001, now, releaseTime / 3.2);

        voice.oscillators.forEach((osc) => {
          try {
            osc.stop(now + releaseTime + 0.05);
          } catch {}
        });
      } catch {}
    }

    this.activeVoices = [];
  }

  stopImmediately() {
    if (!this.context) return;
    const now = this.context.currentTime;
    for (const voice of this.activeVoices) {
      try {
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(0.00001, now);
        voice.oscillators.forEach((osc) => {
          try { osc.stop(now + 0.01); } catch {}
        });
      } catch {}
    }
    this.activeVoices = [];
    this.lastChord = "MUTE";
  }

  async play(chord, intensity = 0.85, rollSpeedMs = 14) {
    if (!this.enabled || chord === "MUTE" || !CHORDS[chord]) return;
    this.initContext();
    if (!this.context) return;

    if (this.context.state === "suspended") {
      try {
        await this.context.resume();
      } catch (err) {
        console.warn("[AUDIO] Waiting for user interaction to resume AudioContext:", err);
      }
    }

    // Release old chord voices smoothly without abrupt cuts
    this.release(0.35);

    const now = this.context.currentTime + 0.012;
    const notes = CHORDS[chord].notes;
    const roll = Math.min(0.022, Math.max(0.005, rollSpeedMs / 1000));
    const intensityScale = Math.min(1.2, Math.max(0.7, intensity));

    const newVoices = notes.map((frequency, index) => {
      // Clean acoustic tone generation:
      // Frequencies < 120 Hz doubled to remain clearly audible without speaker rattles
      const isLow = frequency < 120;
      const playFreq = isLow ? frequency * 2 : frequency;
      const start = now + index * roll;

      const osc = this.context.createOscillator();
      const bodyOsc = this.context.createOscillator();
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();

      // WARM ACOUSTIC SYNTHESIS (Zero Harsh Buzz):
      // Primary: Warm triangle wave (natural wood piano & acoustic resonance)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(playFreq, start);

      // Secondary: Pure sine wave for smooth fundamental body
      bodyOsc.type = "sine";
      bodyOsc.frequency.setValueAtTime(frequency, start);

      // Lowpass filter with low Q (0.7 = Butterworth natural acoustic roll-off)
      // Eliminates all buzzing high frequencies while keeping chime clarity
      filter.type = "lowpass";
      filter.Q.setValueAtTime(0.7, start);
      const openFreq = Math.min(3200, playFreq * 4.5);
      filter.frequency.setValueAtTime(openFreq, start);
      filter.frequency.setTargetAtTime(Math.max(650, playFreq * 1.6), start + 0.03, 0.45);

      // Balanced, comfortable acoustic volume without clipping or buzzing
      const peak = (isLow ? 0.26 : 0.22) * (intensityScale / 0.85);
      const sustain = peak * 0.45;

      osc.connect(filter);
      bodyOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterBus);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.018);
      gain.gain.setTargetAtTime(sustain, start + 0.035, 0.70);

      try { osc.start(start); } catch {}
      try { bodyOsc.start(start); } catch {}

      try {
        osc.stop(start + 8);
        bodyOsc.stop(start + 8);
      } catch {}

      return {
        oscillators: [osc, bodyOsc],
        gain,
        startTime: start,
        stopTime: start + 8
      };
    });

    this.activeVoices = newVoices;
    this.lastChord = chord;
  }
}

const audio = new AudioEngine();

function setTone(node, tone, text) {
  node.dataset.tone = tone;
  const label = node.querySelector("b, span:last-child");
  if (label) label.textContent = text;
}

function setTracking(tone, text) {
  el.note.dataset.tone = tone;
  const span = el.note.querySelector("span");
  if (span) span.textContent = text;
}

function showError(title, detail) {
  const strong = el.error.querySelector("strong");
  const p = el.error.querySelector("p");
  if (strong) strong.textContent = title;
  if (p) p.textContent = detail;
  el.error.hidden = false;
  el.error.classList.remove("hidden");
}

function hideError() {
  el.error.hidden = true;
  el.error.classList.add("hidden");
}

function resetCanvas() {
  context.clearRect(0, 0, el.canvas.width, el.canvas.height);
}

function isLiveVideoReady(video, strm) {
  if (!video || !strm) return false;
  if (video.srcObject !== strm) return false;
  const hasLiveTrack = strm.getVideoTracks().some((track) => track.readyState === "live");
  const hasVideoData = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0;
  return hasLiveTrack || hasVideoData;
}

function setCameraState(newState, details = {}) {
  cameraState = newState;
  console.info(`[CAMERA] State -> ${newState}`, details);

  switch (newState) {
    case CAMERA.IDLE:
      el.start.disabled = false;
      el.start.textContent = "START CAMERA";
      el.start.classList.remove("is-running");
      setTone(el.appStatus, "offline", "OFFLINE");
      setTone(el.cameraStatus, "idle", "CAMERA OFF");
      setTracking("idle", "Press start camera to begin");
      el.empty.classList.remove("hidden");
      hideError();
      el.video.style.display = "none";
      el.gesture.textContent = "WAITING";
      break;

    case CAMERA.STARTING:
      el.start.disabled = true;
      el.start.textContent = "STARTING...";
      el.start.classList.remove("is-running");
      setTone(el.appStatus, "offline", "STARTING");
      setTone(el.cameraStatus, "idle", "STARTING CAMERA");
      setTracking("idle", "Accessing camera...");
      hideError();
      break;

    case CAMERA.LIVE:
      el.start.disabled = false;
      el.start.textContent = "STOP CAMERA";
      el.start.classList.add("is-running");
      setTone(el.appStatus, "ready", "READY");
      setTone(el.cameraStatus, "ready", "CAMERA READY");
      setTracking("ready", trackerReady ? "Searching for hand" : "Loading hand tracking...");
      el.empty.classList.add("hidden");
      hideError();
      el.video.style.display = "block";
      console.info("[CAMERA] LIVE");
      break;

    case CAMERA.ERROR:
      el.start.disabled = false;
      el.start.textContent = "START CAMERA";
      el.start.classList.remove("is-running");
      setTone(el.appStatus, "error", "OFFLINE");
      setTone(el.cameraStatus, "error", "CAMERA ERROR");
      setTracking("error", details.trackingText || "Camera error occurred.");
      showError(details.title || "Camera Access Required", details.message || "Could not access camera.");
      el.empty.classList.remove("hidden");
      el.video.style.display = "none";
      console.error("[CAMERA] ERROR", details);
      break;

    case CAMERA.STOPPED:
      el.start.disabled = false;
      el.start.textContent = "START CAMERA";
      el.start.classList.remove("is-running");
      setTone(el.appStatus, "offline", "OFFLINE");
      setTone(el.cameraStatus, "idle", "CAMERA OFF");
      setTracking("idle", "Press start camera to begin");
      el.empty.classList.remove("hidden");
      hideError();
      el.video.style.display = "none";
      el.gesture.textContent = "WAITING";
      break;
  }
}

function updateDebug() {
  if (!DEBUG_ENABLED || !el.debug) return;
  el.debug.hidden = false;
  const states = lastClassification?.states || {};
  el.debug.innerHTML = `<b>DEBUG</b><span>Detected: ${rawGesture}</span><span>Stable: ${stableGesture}</span><span>Confidence: ${lastClassification?.confidence?.toFixed(2) || "0.00"}</span><span>Thumb: ${states.thumb || "—"} · Index: ${states.index || "—"}</span><span>Middle: ${states.middle || "—"} · Ring: ${states.ring || "—"} · Pinky: ${states.pinky || "—"}</span><span>Mapped chord: ${stableGesture in CHORDS ? stableGesture : "—"}</span>`;
}

function updateChord(chord, source = "gesture", intensity = 0.65, rollSpeed = 16, subtitle = null) {
  if (!CHORDS[chord]) return;
  // If controlled by hand gesture, do not re-trigger the exact same chord continuously while the hand is held
  if (source === "gesture" && chord === currentChord) return;
  currentChord = chord;

  if (chord === "MUTE") {
    audio.release(0.8);
  } else {
    audio.play(chord, intensity, rollSpeed);
  }

  // 2. UI PATH: Update visual elements
  const data = CHORDS[chord];
  el.chord.textContent = data.displayName || data.name;
  el.description.textContent = subtitle || (chord === "MUTE" ? "No chord is playing" : source === "gesture" ? "Controlled by your hand" : source === "auto" ? "Iris accompaniment" : "Playing from the keyboard");
  el.gesture.textContent = source === "gesture" ? data.gesture : source === "auto" ? "AUTO PLAY" : chord === "MUTE" ? "MUTED" : "KEY PRESSED";
  el.keys.forEach((key) => key.classList.toggle("active", key.dataset.chord === chord));
  el.progression.forEach((step) => step.classList.toggle("active", step.dataset.chord === chord));
  el.mute.classList.toggle("active", chord === "MUTE");
}

function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angle3D(a, b, c) {
  const ab = [a.x - b.x, a.y - b.y, (a.z - b.z) || 0];
  const cb = [c.x - b.x, c.y - b.y, (c.z - b.z) || 0];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const magAB = Math.hypot(...ab);
  const magCB = Math.hypot(...cb);
  if (!magAB || !magCB) return 180;
  const cosine = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cosine) * 180) / Math.PI;
}

// Highly reliable finger extension test based on joint straightness and knuckle bend angles
function checkFinger(points, mcp, pip, dip, tip) {
  const wrist = points[0];

  // 1. Total joint-segment bone length
  const boneLen =
    distance2D(points[mcp], points[pip]) +
    distance2D(points[pip], points[dip]) +
    distance2D(points[dip], points[tip]);

  // 2. Straightness: Direct MCP to Tip distance vs total bone length
  // Extended finger has straightness ~ 0.82 - 0.98. Curled finger has straightness < 0.50.
  const span = distance2D(points[mcp], points[tip]);
  const straightness = span / (boneLen || 0.001);

  // 3. Wrist distance ratio: Tip should be further from wrist than PIP is
  const distTipWrist = distance2D(points[tip], wrist);
  const distPipWrist = distance2D(points[pip], wrist);
  const wristRatio = distTipWrist / (distPipWrist || 0.001);

  // 4. PIP knuckle angle (extended > 125°, curled < 95°)
  const pipAngle = angle3D(points[mcp], points[pip], points[dip]);

  // 5. Screen height check (y is 0 at top, so smaller y = higher on screen)
  const isTipAbovePip = points[tip].y < points[pip].y - 0.01;

  // Final extension determination:
  // A finger is extended IF it is straight AND unbent at the PIP joint
  // AND either further from wrist or clearly higher on screen.
  const isExtended =
    straightness > 0.65 &&
    pipAngle > 118 &&
    (wristRatio > 1.08 || isTipAbovePip);

  return {
    extended: isExtended,
    straightness,
    pipAngle,
    wristRatio,
    tipIndex: tip
  };
}

function checkThumb(points) {
  const wrist = points[0];
  const cmc = points[1];
  const mcp = points[2];
  const ip = points[3];
  const tip = points[4];
  const indexMcp = points[5];
  const middleMcp = points[9];

  const palmSize = distance2D(wrist, middleMcp) || 0.001;
  const spread = distance2D(tip, indexMcp) / palmSize;
  const thumbAngle = angle3D(mcp, ip, tip);
  const distTipWrist = distance2D(tip, wrist);
  const distMcpWrist = distance2D(mcp, wrist);

  // Thumb is extended when flared away from palm and unfolded
  const isExtended = spread > 0.48 && thumbAngle > 125 && distTipWrist > distMcpWrist * 1.05;

  return {
    extended: isExtended,
    spread,
    thumbAngle,
    tipIndex: 4
  };
}

function classifyGesture(points) {
  const idx = checkFinger(points, 5, 6, 7, 8);
  const mid = checkFinger(points, 9, 10, 11, 12);
  const rng = checkFinger(points, 13, 14, 15, 16);
  const pnk = checkFinger(points, 17, 18, 19, 20);
  const thb = checkThumb(points);

  const states = {
    thumb: thb.extended ? "extended" : "curled",
    index: idx.extended ? "extended" : "curled",
    middle: mid.extended ? "extended" : "curled",
    ring: rng.extended ? "extended" : "curled",
    pinky: pnk.extended ? "extended" : "curled"
  };

  const extendedCount = [idx.extended, mid.extended, rng.extended, pnk.extended].filter(Boolean).length;

  let chord = "MUTE";
  let confidence = 0.98;

  // 1. OPEN HAND (G): All 4 fingers extended
  if (extendedCount >= 4) {
    chord = "G";
  }
  // 2. THREE FINGERS (Bm): Exactly 3 fingers extended (Index + Middle + Ring up, Pinky curled)
  else if (extendedCount === 3 && idx.extended && mid.extended && rng.extended && !pnk.extended) {
    chord = "Bm";
  }
  // 3. PEACE SIGN (D): Exactly 2 fingers extended (Index + Middle up, Ring & Pinky curled)
  else if (extendedCount === 2 && idx.extended && mid.extended && !rng.extended && !pnk.extended) {
    chord = "D";
  }
  // If count is exactly 2, GUARANTEE Peace Sign (D)
  else if (extendedCount === 2) {
    chord = "D";
  }
  // If count is exactly 3, GUARANTEE Three Fingers (Bm)
  else if (extendedCount === 3) {
    chord = "Bm";
  }
  // 4. SINGLE FINGER (Point C or Thumb+Index A)
  else if (extendedCount === 1) {
    if (idx.extended && thb.extended) {
      chord = "A"; // THUMB + INDEX
    } else if (idx.extended) {
      chord = "C"; // POINT
    } else {
      chord = "C";
    }
  }
  // 5. FIST (Em): 0 fingers extended
  else if (extendedCount === 0) {
    chord = "Em";
  } else {
    confidence = 0.40;
  }

  return {
    gesture: chord,
    confidence,
    states,
    extendedCount,
    fingerInfo: { idx, mid, rng, pnk, thb }
  };
}

// Fast low-latency temporal confirmation (< 40ms target)
function processGesture(points) {
  if (autoPlayEnabled) return;

  const now = performance.now();

  // If the hand disappears, release the current chord quickly
  if (!points) {
    noHandFrames++;

    if (noHandFrames >= 3) {
      if (currentChord !== "MUTE") {
        console.info(`[GESTURE] Hand lost -> release at ${now.toFixed(1)}ms`);
        audio.release(0.8);
        updateChord("MUTE", "gesture");
      }

      candidateGesture = "MUTE";
      candidateStartTime = 0;
      candidateFrames = 0;
      stableGesture = "SEARCHING";
      el.gesture.textContent = "SEARCHING";
      updateDebug();
    }

    return;
  }

  noHandFrames = 0;

  const classification = classifyGesture(points);
  lastClassification = classification;

  const gesture = classification.gesture || "MUTE";
  const confidence = classification.confidence || 0;

  rawGesture =
    gesture === "MUTE"
      ? "NO VALID GESTURE"
      : (CHORDS[gesture]?.gesture || "UNKNOWN");

  if (gesture === "MUTE") {
    candidateFrames = 0;
    el.gesture.textContent = rawGesture;
    updateDebug();
    return;
  }

  // New candidate gesture
  if (gesture !== candidateGesture) {
    candidateGesture = gesture;
    candidateStartTime = now;
    candidateFrames = 1;
    updateDebug();
    return;
  }

  candidateFrames++;
  const heldMs = now - candidateStartTime;

  // Confirm gesture rapidly (2 frames or 35ms)
  const isConfirmed = candidateFrames >= 2 || heldMs >= 35 || confidence >= 0.94;

  if (isConfirmed && gesture !== currentChord) {
    stableGesture = gesture;
    console.info(`[GESTURE CONFIRMED] ${gesture} in ${heldMs.toFixed(1)}ms`);
    // Full amplified playback
    updateChord(gesture, "gesture", 0.95, 12);
  }

  el.gesture.textContent = CHORDS[gesture]?.gesture || rawGesture;
  updateDebug();
}

const EDGES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
function drawHand(points, classification) {
  resetCanvas();
  context.lineWidth = 2.5;
  context.strokeStyle = "rgba(165, 138, 255, 0.75)";

  EDGES.forEach(([a, b]) => {
    context.beginPath();
    context.moveTo(points[a].x * el.canvas.width, points[a].y * el.canvas.height);
    context.lineTo(points[b].x * el.canvas.width, points[b].y * el.canvas.height);
    context.stroke();
  });

  points.forEach((point, i) => {
    const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
    let color = "#8cc2ff";
    let radius = 3.5;

    if (classification?.fingerInfo) {
      const { idx, mid, rng, pnk, thb } = classification.fingerInfo;
      if (i === 8) color = idx.extended ? "#00ffcc" : "#ff4d6d";
      if (i === 12) color = mid.extended ? "#00ffcc" : "#ff4d6d";
      if (i === 16) color = rng.extended ? "#00ffcc" : "#ff4d6d";
      if (i === 20) color = pnk.extended ? "#00ffcc" : "#ff4d6d";
      if (i === 4) color = thb.extended ? "#00ffcc" : "#ff4d6d";
      if (isTip) radius = 6.0;
    }

    context.beginPath();
    context.arc(point.x * el.canvas.width, point.y * el.canvas.height, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();

    if (isTip) {
      context.lineWidth = 1.5;
      context.strokeStyle = "#ffffff";
      context.stroke();
    }
  });

  // On-canvas live HUD badge
  if (classification && classification.gesture && classification.gesture !== "MUTE") {
    const chordData = CHORDS[classification.gesture];
    const name = chordData?.displayName || chordData?.name || classification.gesture;
    const gestureName = chordData?.gesture || "";
    const count = classification.extendedCount ?? "";

    context.save();
    context.fillStyle = "rgba(15, 17, 26, 0.85)";
    context.strokeStyle = "rgba(165, 138, 255, 0.4)";
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(14, el.canvas.height - 44, 250, 32, 8);
    context.fill();
    context.stroke();

    context.fillStyle = "#00ffcc";
    context.font = "bold 13px 'DM Mono', monospace, sans-serif";
    context.fillText(`${gestureName} [${count}] → ${name}`, 24, el.canvas.height - 23);
    context.restore();
  }
}

async function initializeTracker() {
  if (handLandmarker) return handLandmarker;
  if (trackerPromise) return trackerPromise;
  trackerPromise = (async () => {
    console.info("[MEDIAPIPE] Loading vision runtime...");
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    console.info("[MEDIAPIPE] Vision runtime loaded.");
    console.info("[MEDIAPIPE] Loading HandLandmarker...");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: .55,
      minHandPresenceConfidence: .55,
      minTrackingConfidence: .55
    });
    trackerReady = true;
    console.info("[MEDIAPIPE] HandLandmarker loaded.");
    return handLandmarker;
  })();
  try {
    return await trackerPromise;
  } catch (error) {
    handLandmarker = null;
    trackerReady = false;
    console.error("[MEDIAPIPE] Initialization failed:", error);
    throw error;
  } finally {
    trackerPromise = null;
  }
}

function detectFrame() {
  if (cameraState !== CAMERA.LIVE || !trackerReady || !handLandmarker) return;
  if (!isLiveVideoReady(el.video, stream)) {
    console.warn("[TRACKER] Live video track check failed during detection frame");
    stopExistingStream();
    setCameraState(CAMERA.ERROR, {
      title: "Camera Stream Lost",
      message: "Camera stream became unavailable during hand tracking.",
      trackingText: "Camera stream was lost."
    });
    return;
  }

  if (
    el.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    el.video.videoWidth > 0 &&
    el.video.videoHeight > 0 &&
    el.video.currentTime !== lastVideoTime
  ) {
    lastVideoTime = el.video.currentTime;
    try {
      const nowMs = performance.now();
      const timestamp = Math.max(nowMs, (detectFrame.lastTimestamp || 0) + 1);
      detectFrame.lastTimestamp = timestamp;
      const result = handLandmarker.detectForVideo(el.video, timestamp);
      const points = result.landmarks?.[0];
      if (points) {
        processGesture(points);
        drawHand(points, lastClassification);
        setTone(el.cameraStatus, "active", "HAND DETECTED");
        setTracking("active", "Hand detected");
      } else {
        resetCanvas();
        processGesture(null);
        setTone(el.cameraStatus, "ready", "SEARCHING");
        setTracking("ready", "Searching for hand");
      }
    } catch (error) {
      console.error("[TRACKER] detection failed", error);
      trackerReady = false;
      setTone(el.cameraStatus, "error", "TRACKING ERROR");
      setTracking("error", "Hand tracking error. Restart the camera.");
      return;
    }
  }
  animationFrame = requestAnimationFrame(detectFrame);
}

function startDetectionLoop() {
  if (animationFrame || cameraState !== CAMERA.LIVE || !trackerReady) return;
  console.info("[TRACKER] detection loop started");
  animationFrame = requestAnimationFrame(detectFrame);
}

function stopDetectionLoop() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  lastVideoTime = -1;
}

function playNextAutoChord() {
  if (!autoPlayEnabled) return;
  const step = IRIS_AUTOPLAY[autoPlayIndex];
  autoPlayIndex = (autoPlayIndex + 1) % IRIS_AUTOPLAY.length;
  updateChord(step.chord, "auto", step.intensity, step.rollSpeed, step.phrase);

  // Natural sustain and crossfade into the next chord
  const totalStepTime = step.duration + (step.breath || 350);

  // Gentle sustain pedal lift during breath pause before next attack
  window.setTimeout(() => {
    if (autoPlayEnabled) {
      audio.release(1.5);
    }
  }, Math.max(step.duration - 250, 600));

  autoPlayTimer = window.setTimeout(playNextAutoChord, totalStepTime);
}

function setAutoPlay(enabled) {
  autoPlayEnabled = enabled;
  window.clearTimeout(autoPlayTimer);
  autoPlayTimer = null;
  el.autoPlay.classList.toggle("active", enabled);
  el.autoPlay.setAttribute("aria-pressed", String(enabled));
  el.autoPlay.textContent = enabled ? "AUTO PLAY ON" : "AUTO PLAY";
  if (enabled) {
    autoPlayIndex = 0;
    playNextAutoChord();
  } else {
    audio.release(0.9);
    if (currentChord !== "MUTE") updateChord("MUTE", "system");
  }
}

function waitForVideoReady(video, strm, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (isLiveVideoReady(video, strm)) {
      console.info("[CAMERA] video ready");
      return resolve();
    }

    let timeoutId = null;
    let pollInterval = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (pollInterval) clearInterval(pollInterval);
      video.removeEventListener("loadedmetadata", onMetadata); video.removeEventListener("canplay", onCanPlay); video.removeEventListener("playing", onPlaying); video.removeEventListener("timeupdate", onTimeUpdate); video.removeEventListener("loadeddata", onLoadedData);
    };

    const checkAndResolve = (sourceEvent) => {
      if (isLiveVideoReady(video, strm)) {
        console.info(`[CAMERA] video ready (via ${sourceEvent}: ${video.videoWidth}x${video.videoHeight})`);
        cleanup();
        resolve();
      }
    };

    const onMetadata = () => {
      console.info("[CAMERA] video metadata loaded");
      checkAndResolve("loadedmetadata");
    };

    const onCanPlay = () => {
      checkAndResolve("canplay");
    };

    const onPlaying = () => {
      console.info("[CAMERA] video playing");
      checkAndResolve("playing");
    };

    const onTimeUpdate = () => { checkAndResolve("timeupdate"); }; const onLoadedData = () => { checkAndResolve("loadeddata"); };

    video.addEventListener("loadedmetadata", onMetadata); video.addEventListener("canplay", onCanPlay); video.addEventListener("playing", onPlaying); video.addEventListener("timeupdate", onTimeUpdate); video.addEventListener("loadeddata", onLoadedData);

    pollInterval = setInterval(() => {
      checkAndResolve("polling");
    }, 80);

    timeoutId = setTimeout(() => {
      cleanup();
      const tracks = strm.getVideoTracks();
      const trackState = tracks.map((t) => `${t.label || "video"}: ${t.readyState}`).join(", ");
      console.warn(`[CAMERA] Video ready timeout after ${timeoutMs}ms. videoWidth=${video.videoWidth}, readyState=${video.readyState}, tracks=[${trackState}]`);
      reject(new Error(`Camera video stream did not produce frames within ${timeoutMs / 1000}s. Please check camera access permissions.`));
    }, timeoutMs);
  });
}

function stopExistingStream() {
  if (stream) {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
        console.info(`[CAMERA] track stopped: ${track.label || "track"}`);
      } catch {}
    });
    stream = null;
  }
  if (el.video.srcObject) {
    el.video.srcObject = null;
  }
  stopDetectionLoop();
  resetCanvas();
}

async function startCamera() {
  console.info("[CAMERA] start requested");

  // Prevent multiple simultaneous camera streams
  if (isStartingCamera || cameraState === CAMERA.LIVE) {
    console.warn("[CAMERA] startCamera ignored: already starting or live");
    return;
  }

  isStartingCamera = true;
  setCameraState(CAMERA.STARTING);

  // Clean up any existing stream before starting a new one
  stopExistingStream();

  try {
    if (!window.isSecureContext) {
      throw new Error("Camera requires HTTPS or localhost.");
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API is not supported on this browser.");
    }

    console.info("[CAMERA] getUserMedia requested");
    const constraints = {
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    let acquiredStream;
    try {
      acquiredStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error("[CAMERA] ERROR", err);
      let errorMsg = "Camera access was denied.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Camera access was denied. Please enable camera access in your browser or device settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No camera found on this device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg = "Camera is currently in use by another application or tab.";
      } else if (err.name === "OverconstrainedError") {
        console.warn("[CAMERA] OverconstrainedError: retrying with basic video constraint");
        acquiredStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } else {
        errorMsg = err.message || "Failed to access camera.";
      }

      if (!acquiredStream) {
        setCameraState(CAMERA.ERROR, {
          title: "Camera Access Required",
          message: errorMsg,
          trackingText: "Camera permission denied or unavailable."
        });
        return;
      }
    }

    console.info("[CAMERA] stream received");
    stream = acquiredStream;

    // Track states
    const tracks = stream.getVideoTracks();
    tracks.forEach((track) => {
      console.info(`[CAMERA] track state: ${track.label || "track"} (${track.readyState})`);
      track.addEventListener("ended", () => {
        console.warn("[CAMERA] Video track ended unexpectedly");
        if (cameraState === CAMERA.LIVE) {
          stopExistingStream();
          setCameraState(CAMERA.ERROR, {
            title: "Camera Disconnected",
            message: "The camera stream was interrupted or disconnected.",
            trackingText: "Camera stream was disconnected."
          });
        }
      }, { once: true });
    });

    if (tracks.length === 0 || !tracks.some((t) => t.readyState === "live")) {
      throw new Error("No live video tracks returned in MediaStream.");
    }

    // Set video element attributes for iOS before assigning stream
    el.video.muted = true;
    el.video.autoplay = true;
    el.video.playsInline = true;
    el.video.setAttribute("muted", "");
    el.video.setAttribute("autoplay", "");
    el.video.setAttribute("playsinline", "");
    el.video.setAttribute("webkit-playsinline", "");
    el.video.style.display = "block";

    console.info("[CAMERA] video srcObject assigned");
    el.video.srcObject = stream;

    // Play video
    try {
      console.info("[CAMERA] video playing");
      await el.video.play();
    } catch (playErr) {
      console.error("[CAMERA] ERROR video.play() failed", playErr);
      throw new Error(`Video playback failed to start: ${playErr.message || "User interaction required"}`);
    }

    // Wait for video frames to become ready
    await waitForVideoReady(el.video, stream, 8000);

    // Sync canvas
    el.canvas.width = el.video.videoWidth || 640;
    el.canvas.height = el.video.videoHeight || 480;

    // Camera is verified LIVE
    setCameraState(CAMERA.LIVE);

    // Only after camera is LIVE, start hand tracking
    try {
      setTracking("ready", "Loading hand tracking...");
      await initializeTracker();
      setTone(el.cameraStatus, "ready", "TRACKING READY");
      setTracking("ready", "Searching for hand");
      startDetectionLoop();
    } catch (trackerErr) {
      console.error("[MEDIAPIPE] Initialization error:", trackerErr);
      setTone(el.cameraStatus, "error", "TRACKING ERROR");
      setTracking("error", "Hand tracking unavailable. Digital piano is still playable.");
    }

  } catch (err) {
    console.error("[CAMERA] ERROR during startup:", err);
    stopExistingStream();
    setCameraState(CAMERA.ERROR, {
      title: "Camera Failed",
      message: err.message || "Could not initialize camera stream.",
      trackingText: "Camera stream failed to initialize."
    });
  } finally {
    isStartingCamera = false;
  }
}

function stopCamera() {
  console.info("[CAMERA] stop requested");
  isStartingCamera = false;
  stopExistingStream();
  setCameraState(CAMERA.STOPPED);
  candidateGesture = "MUTE";
  candidateStartTime = 0;
  candidateFrames = 0;
  noHandFrames = 0;
  updateChord("MUTE", "system");
  console.info("[CAMERA] stopped");
}

// Global user interaction listener to reliably unlock Web Audio in modern browsers
const unlockAudioOnce = () => {
  audio.unlock().catch(() => {});
};
["pointerdown", "touchstart", "click", "keydown"].forEach((evt) => {
  window.addEventListener(evt, unlockAudioOnce, { passive: true });
});

el.start.addEventListener("click", async () => {
  await audio.unlock();
  if (cameraState === CAMERA.LIVE || cameraState === CAMERA.STARTING) {
    stopCamera();
  } else {
    startCamera();
  }
});

el.keys.forEach((key) =>
  key.addEventListener("click", async () => {
    await audio.unlock();
    updateChord(key.dataset.chord, "keyboard");
  })
);

el.mute.addEventListener("click", async () => {
  await audio.unlock();
  updateChord("MUTE", "keyboard");
});

el.autoPlay.addEventListener("click", async () => {
  await audio.unlock();
  setAutoPlay(!autoPlayEnabled);
});

el.sound.addEventListener("click", async () => {
  await audio.unlock();
  audio.enabled = !audio.enabled;
  el.sound.classList.toggle("is-off", !audio.enabled);
  el.sound.setAttribute("aria-pressed", String(audio.enabled));
  el.sound.textContent = audio.enabled ? "SOUND ON" : "SOUND OFF";
  if (!audio.enabled) audio.release(0.5);
});

if (el.volumeSlider && el.volumeLabel) {
  el.volumeSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    audio.setVolume(val / 100);
    el.volumeLabel.textContent = `${val}%`;
  });
}

setCameraState(CAMERA.IDLE);

