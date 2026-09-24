import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import "./style.css";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const CAMERA = Object.freeze({ IDLE: "IDLE", STARTING: "STARTING", LIVE: "LIVE", ERROR: "ERROR", STOPPED: "STOPPED" });
const DEBUG_ENABLED = new URLSearchParams(window.location.search).has("debug");

const ALL_CHORDS = {
  G: {
    name: "G",
    displayName: "Gmaj",
    notes: [98.00, 146.83, 196.00, 246.94, 293.66, 392.00]
  },
  Em: {
    name: "Em",
    displayName: "Em7",
    notes: [82.41, 123.47, 164.81, 196.00, 246.94, 329.63]
  },
  C: {
    name: "C",
    displayName: "Cadd9",
    notes: [130.81, 164.81, 196.00, 261.63, 293.66, 329.63]
  },
  D: {
    name: "D",
    displayName: "Dadd9",
    notes: [146.83, 220.00, 293.66, 369.99, 440.00, 587.33]
  },
  Am: {
    name: "Am",
    displayName: "Am7",
    notes: [110.00, 164.81, 220.00, 261.63, 329.63, 440.00]
  },
  F: {
    name: "F",
    displayName: "Fmaj7",
    notes: [87.31, 130.81, 174.61, 220.00, 261.63, 349.23]
  },
  Dm: {
    name: "Dm",
    displayName: "Dm7",
    notes: [146.83, 220.00, 293.66, 349.23, 440.00, 523.25]
  },
  Bm: {
    name: "Bm",
    displayName: "Bm7",
    notes: [123.47, 185.00, 246.94, 293.66, 369.99, 493.88]
  },
  A: {
    name: "A",
    displayName: "Aadd9",
    notes: [110.00, 164.81, 220.00, 277.18, 329.63, 440.00]
  },
  MUTE: {
    name: "MUTE",
    displayName: "MUTE",
    notes: []
  }
};
const CHORDS = ALL_CHORDS;

const SONGS = {
  sadhana: {
    title: "Sadhana",
    artist: "John Chamling Rai",
    tempo: 72,
    chordSlots: [
      { key: "C",  name: "Cadd9", gesture: "OPEN PALM", emoji: "✋" },
      { key: "G",  name: "Gmaj",  gesture: "PEACE",     emoji: "✌️" },
      { key: "F",  name: "Fmaj7", gesture: "FIST",      emoji: "✊" },
      { key: "Em", name: "Em7",   gesture: "POINT",     emoji: "☝️" },
      { key: "Dm", name: "Dm7",   gesture: "3 FINGERS", emoji: "🤟" },
      { key: "Am", name: "Am7",   gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "C",  label: "Cadd9", emoji: "✋" },
      { chord: "G",  label: "Gmaj",  emoji: "✌️" },
      { chord: "F",  label: "Fmaj7", emoji: "✊" },
      { chord: "G",  label: "Gmaj",  emoji: "✌️" },
      { chord: "C",  label: "Cadd9", emoji: "✋" },
      { chord: "Em", label: "Em7",   emoji: "☝️" },
      { chord: "Dm", label: "Dm7",   emoji: "🤟" },
      { chord: "G",  label: "Gmaj",  emoji: "✌️" }
    ],
    sections: {
      chorus: [
        { chord: "C",  duration: 3400, intensity: 0.72, rollSpeed: 18, phrase: "Tetikai choda na kesha lai", breath: 250 },
        { chord: "G",  duration: 3400, intensity: 0.70, rollSpeed: 18, phrase: "Udaauna deu haawaa lai", breath: 250 },
        { chord: "F",  duration: 3400, intensity: 0.74, rollSpeed: 18, phrase: "Dubchu hola timraa aakhaa mai", breath: 250 },
        { chord: "G",  duration: 3600, intensity: 0.72, rollSpeed: 18, phrase: "Dubi rahana cha tyehi malai", breath: 350 }
      ],
      verse: [
        { chord: "C",  duration: 3200, intensity: 0.65, rollSpeed: 18, phrase: "Ma, ma maayaa maardina", breath: 250 },
        { chord: "Em", duration: 3200, intensity: 0.62, rollSpeed: 18, phrase: "Timi lai chaaddina", breath: 250 },
        { chord: "Dm", duration: 3400, intensity: 0.64, rollSpeed: 18, phrase: "Timi mana ma chau mero", breath: 250 },
        { chord: "G",  duration: 3800, intensity: 0.68, rollSpeed: 20, phrase: "Samjhanaa hau mero, kaile birsinna", breath: 350 }
      ],
      bridge: [
        { chord: "F",  duration: 3200, intensity: 0.75, rollSpeed: 16, phrase: "Chaayaa hau, kaile nachutne", breath: 250 },
        { chord: "C",  duration: 3200, intensity: 0.72, rollSpeed: 16, phrase: "Sapana hau, har raat aaune", breath: 250 },
        { chord: "Dm", duration: 3400, intensity: 0.74, rollSpeed: 18, phrase: "Eh mana yo kaile namarne", breath: 250 },
        { chord: "G",  duration: 3400, intensity: 0.76, rollSpeed: 18, phrase: "Timlai samjhi, timlai samjhi", breath: 300 },
        { chord: "Am", duration: 4800, intensity: 0.80, rollSpeed: 20, phrase: "Sadhana bani basechau...", breath: 600 }
      ]
    }
  },
  koChaRa: {
    title: "Ko Cha Ra",
    artist: "John Chamling Rai",
    tempo: 76,
    chordSlots: [
      { key: "C",  name: "Cadd9", gesture: "OPEN PALM", emoji: "✋" },
      { key: "Em", name: "Em7",   gesture: "PEACE",     emoji: "✌️" },
      { key: "F",  name: "Fmaj7", gesture: "FIST",      emoji: "✊" },
      { key: "G",  name: "Gmaj",  gesture: "POINT",     emoji: "☝️" },
      { key: "Am", name: "Am7",   gesture: "3 FINGERS", emoji: "🤟" },
      { key: "Dm", name: "Dm7",   gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "C",  label: "Cadd9", emoji: "✋" },
      { chord: "Em", label: "Em7",   emoji: "✌️" },
      { chord: "F",  label: "Fmaj7", emoji: "✊" },
      { chord: "G",  label: "Gmaj",  emoji: "☝️" },
      { chord: "Am", label: "Am7",   emoji: "🤟" },
      { chord: "G",  label: "Gmaj",  emoji: "☝️" },
      { chord: "F",  label: "Fmaj7", emoji: "✊" },
      { chord: "G",  label: "Gmaj",  emoji: "☝️" }
    ],
    sections: {
      verse: [
        { chord: "C",  duration: 3400, intensity: 0.68, rollSpeed: 18, phrase: "Ko cha ra timilai aaja bujhidine", breath: 250 },
        { chord: "Em", duration: 3400, intensity: 0.65, rollSpeed: 18, phrase: "Timra manka kura sabai sodhidine", breath: 250 },
        { chord: "F",  duration: 3400, intensity: 0.68, rollSpeed: 18, phrase: "Aankhako aashu puchi dine", breath: 250 },
        { chord: "G",  duration: 3600, intensity: 0.70, rollSpeed: 18, phrase: "Sadhai timrai saath dine", breath: 300 }
      ],
      chorus: [
        { chord: "Am", duration: 3200, intensity: 0.76, rollSpeed: 16, phrase: "Pida huncha malai timilai dukhda", breath: 250 },
        { chord: "G",  duration: 3200, intensity: 0.74, rollSpeed: 16, phrase: "Khusi hunchu timro muskan dekhda", breath: 250 },
        { chord: "F",  duration: 3400, intensity: 0.78, rollSpeed: 18, phrase: "Timilai nai ta rojeko chu", breath: 250 },
        { chord: "G",  duration: 4400, intensity: 0.80, rollSpeed: 20, phrase: "Yo dhadkan le sadaiv bhari", breath: 600 }
      ]
    }
  },
  mayaLe: {
    title: "Maya Le",
    artist: "John Chamling Rai",
    tempo: 70,
    chordSlots: [
      { key: "C",  name: "Cadd9", gesture: "OPEN PALM", emoji: "✋" },
      { key: "F",  name: "Fmaj7", gesture: "PEACE",     emoji: "✌️" },
      { key: "Am", name: "Am7",   gesture: "FIST",      emoji: "✊" },
      { key: "G",  name: "Gmaj",  gesture: "POINT",     emoji: "☝️" },
      { key: "Em", name: "Em7",   gesture: "3 FINGERS", emoji: "🤟" },
      { key: "Dm", name: "Dm7",   gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "C",  label: "Cadd9", emoji: "✋" },
      { chord: "F",  label: "Fmaj7", emoji: "✌️" },
      { chord: "C",  label: "Cadd9", emoji: "✋" },
      { chord: "Am", label: "Am7",   emoji: "✊" },
      { chord: "G",  label: "Gmaj",  emoji: "☝️" },
      { chord: "F",  label: "Fmaj7", emoji: "✌️" },
      { chord: "C",  label: "Cadd9", emoji: "✋" },
      { chord: "G",  label: "Gmaj",  emoji: "☝️" }
    ],
    sections: {
      verse: [
        { chord: "C",  duration: 3400, intensity: 0.65, rollSpeed: 18, phrase: "Maya ley bolauda, maya ley bolnu", breath: 250 },
        { chord: "F",  duration: 3400, intensity: 0.68, rollSpeed: 18, phrase: "Jati tadha gaye pani, malai nai khojnu", breath: 250 },
        { chord: "C",  duration: 3400, intensity: 0.65, rollSpeed: 18, phrase: "Timi bahek kohi chaina yo mero mutu ma", breath: 250 },
        { chord: "Am", duration: 3400, intensity: 0.68, rollSpeed: 18, phrase: "Sadhai timilai nai rakhne chu aashma", breath: 250 },
        { chord: "G",  duration: 3600, intensity: 0.72, rollSpeed: 18, phrase: "Maya launa jani sakechu, mana bhitra dekhinai", breath: 300 }
      ],
      chorus: [
        { chord: "F",  duration: 3200, intensity: 0.76, rollSpeed: 16, phrase: "Ma ni sadhai timilai rochhu", breath: 250 },
        { chord: "C",  duration: 3200, intensity: 0.74, rollSpeed: 16, phrase: "Mero antim saas sammai", breath: 250 },
        { chord: "G",  duration: 4400, intensity: 0.78, rollSpeed: 20, phrase: "Maya ley baandhi deu malai...", breath: 600 }
      ]
    }
  },
  hawaJastai: {
    title: "Hawa Jastai",
    artist: "John Chamling Rai",
    tempo: 74,
    chordSlots: [
      { key: "G",  name: "Gmaj",  gesture: "OPEN PALM", emoji: "✋" },
      { key: "Bm", name: "Bm7",   gesture: "PEACE",     emoji: "✌️" },
      { key: "C",  name: "Cadd9", gesture: "FIST",      emoji: "✊" },
      { key: "D",  name: "Dadd9", gesture: "POINT",     emoji: "☝️" },
      { key: "Em", name: "Em7",   gesture: "3 FINGERS", emoji: "🤟" },
      { key: "Am", name: "Am7",   gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "G",  label: "Gmaj",  emoji: "✋" },
      { chord: "Bm", label: "Bm7",   emoji: "✌️" },
      { chord: "C",  label: "Cadd9", emoji: "✊" },
      { chord: "D",  label: "Dadd9", emoji: "☝️" },
      { chord: "Em", label: "Em7",   emoji: "🤟" },
      { chord: "Bm", label: "Bm7",   emoji: "✌️" },
      { chord: "C",  label: "Cadd9", emoji: "✊" },
      { chord: "D",  label: "Dadd9", emoji: "☝️" }
    ],
    sections: {
      verse: [
        { chord: "G",  duration: 3400, intensity: 0.65, rollSpeed: 18, phrase: "Hawa jastai bagirahechu", breath: 250 },
        { chord: "Bm", duration: 3400, intensity: 0.62, rollSpeed: 18, phrase: "Timrai aashpas ma jahile", breath: 250 },
        { chord: "C",  duration: 3400, intensity: 0.66, rollSpeed: 18, phrase: "Sheetal paban bani chunchu timilai", breath: 250 },
        { chord: "D",  duration: 3600, intensity: 0.68, rollSpeed: 18, phrase: "Timle malai na-dekhe pani", breath: 300 }
      ],
      chorus: [
        { chord: "Em", duration: 3200, intensity: 0.76, rollSpeed: 16, phrase: "Mutu nadukhai rakha mero", breath: 250 },
        { chord: "Bm", duration: 3200, intensity: 0.74, rollSpeed: 16, phrase: "Sadhai timrai saath chu ma", breath: 250 },
        { chord: "C",  duration: 3400, intensity: 0.78, rollSpeed: 18, phrase: "Aakash jastai asim maya", breath: 250 },
        { chord: "D",  duration: 4400, intensity: 0.80, rollSpeed: 20, phrase: "Timilai nai sumpeko chu", breath: 600 }
      ]
    }
  },
  farkannaHola: {
    title: "Farkanna Hola",
    artist: "John Chamling Rai",
    tempo: 70,
    chordSlots: [
      { key: "C",  name: "Cadd9", gesture: "OPEN PALM", emoji: "✋" },
      { key: "Am", name: "Am7",   gesture: "PEACE",     emoji: "✌️" },
      { key: "Em", name: "Em7",   gesture: "FIST",      emoji: "✊" },
      { key: "F",  name: "Fmaj7", gesture: "POINT",     emoji: "☝️" },
      { key: "G",  name: "Gmaj",  gesture: "3 FINGERS", emoji: "🤟" },
      { key: "Dm", name: "Dm7",   gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "C",  label: "Cadd9", emoji: "✋" },
      { chord: "Am", label: "Am7",   emoji: "✌️" },
      { chord: "Em", label: "Em7",   emoji: "✊" },
      { chord: "F",  label: "Fmaj7", emoji: "☝️" },
      { chord: "G",  label: "Gmaj",  emoji: "🤟" }
    ],
    sections: {
      verse: [
        { chord: "C",  duration: 3400, intensity: 0.65, rollSpeed: 18, phrase: "Farkanna hola aba ma", breath: 250 },
        { chord: "Am", duration: 3400, intensity: 0.62, rollSpeed: 18, phrase: "Gaye pachi utai tira", breath: 250 },
        { chord: "Em", duration: 3400, intensity: 0.64, rollSpeed: 18, phrase: "Samjanchu la dherai nai", breath: 250 },
        { chord: "F",  duration: 3400, intensity: 0.68, rollSpeed: 18, phrase: "Kahile kahi samjhi didaa", breath: 250 },
        { chord: "G",  duration: 4200, intensity: 0.72, rollSpeed: 20, phrase: "Jindagii bekamfuse, kahile kaa...", breath: 500 }
      ]
    }
  },
  perfect: {
    title: "Perfect",
    artist: "Ed Sheeran",
    tempo: 63,
    chordSlots: [
      { key: "G",  name: "Gmaj",  gesture: "OPEN PALM", emoji: "✋" },
      { key: "Em", name: "Em7",   gesture: "PEACE",     emoji: "✌️" },
      { key: "C",  name: "Cadd9", gesture: "FIST",      emoji: "✊" },
      { key: "D",  name: "Dadd9", gesture: "POINT",     emoji: "☝️" },
      { key: "Am", name: "Am7",   gesture: "3 FINGERS", emoji: "🤟" },
      { key: "Bm", name: "Bm7",   gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "G",  label: "Gmaj",  emoji: "✋" },
      { chord: "Em", label: "Em7",   emoji: "✌️" },
      { chord: "C",  label: "Cadd9", emoji: "✊" },
      { chord: "D",  label: "Dadd9", emoji: "☝️" },
      { chord: "Em", label: "Em7",   emoji: "✌️" },
      { chord: "C",  label: "Cadd9", emoji: "✊" },
      { chord: "G",  label: "Gmaj",  emoji: "✋" },
      { chord: "D",  label: "Dadd9", emoji: "☝️" }
    ],
    sections: {
      verse: [
        { chord: "G",  duration: 3500, intensity: 0.65, rollSpeed: 18, phrase: "I found a love for me", breath: 250 },
        { chord: "Em", duration: 3500, intensity: 0.62, rollSpeed: 18, phrase: "Darling just dive right in and follow my lead", breath: 250 },
        { chord: "C",  duration: 3500, intensity: 0.64, rollSpeed: 18, phrase: "Well I found a girl, beautiful and sweet", breath: 250 },
        { chord: "D",  duration: 3800, intensity: 0.68, rollSpeed: 18, phrase: "I never knew you were the someone waiting for me", breath: 350 }
      ],
      chorus: [
        { chord: "Em", duration: 3300, intensity: 0.76, rollSpeed: 16, phrase: "Baby, I'm dancing in the dark", breath: 250 },
        { chord: "C",  duration: 3300, intensity: 0.74, rollSpeed: 16, phrase: "With you between my arms", breath: 250 },
        { chord: "G",  duration: 3300, intensity: 0.78, rollSpeed: 18, phrase: "Barefoot on the grass", breath: 250 },
        { chord: "D",  duration: 4400, intensity: 0.76, rollSpeed: 18, phrase: "Listening to our favorite song", breath: 500 }
      ]
    }
  },
  nightChanges: {
    title: "Night Changes",
    artist: "One Direction",
    tempo: 60,
    chordSlots: [
      { key: "G",  name: "Gmaj",  gesture: "OPEN PALM", emoji: "✋" },
      { key: "Em", name: "Em7",   gesture: "PEACE",     emoji: "✌️" },
      { key: "Bm", name: "Bm7",   gesture: "FIST",      emoji: "✊" },
      { key: "D",  name: "Dadd9", gesture: "POINT",     emoji: "☝️" },
      { key: "C",  name: "Cadd9", gesture: "3 FINGERS", emoji: "🤟" },
      { key: "Am", name: "Am7",   gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "G",  label: "Gmaj",  emoji: "✋" },
      { chord: "Em", label: "Em7",   emoji: "✌️" },
      { chord: "Bm", label: "Bm7",   emoji: "✊" },
      { chord: "D",  label: "Dadd9", emoji: "☝️" },
      { chord: "C",  label: "Cadd9", emoji: "🤟" },
      { chord: "D",  label: "Dadd9", emoji: "☝️" },
      { chord: "G",  label: "Gmaj",  emoji: "✋" },
      { chord: "Em", label: "Em7",   emoji: "✌️" }
    ],
    sections: {
      verse: [
        { chord: "G",  duration: 3400, intensity: 0.65, rollSpeed: 18, phrase: "Goin' out tonight, changes into something red", breath: 250 },
        { chord: "Em", duration: 3400, intensity: 0.62, rollSpeed: 18, phrase: "Her mother doesn't like that kind of dress", breath: 250 },
        { chord: "Bm", duration: 3400, intensity: 0.64, rollSpeed: 18, phrase: "Everything she never had she's showin' off", breath: 250 },
        { chord: "D",  duration: 3600, intensity: 0.68, rollSpeed: 18, phrase: "Drivin' too fast, moon is breakin' through her hair", breath: 300 }
      ],
      chorus: [
        { chord: "C",  duration: 3200, intensity: 0.74, rollSpeed: 16, phrase: "We're only getting older, baby", breath: 250 },
        { chord: "D",  duration: 3200, intensity: 0.76, rollSpeed: 16, phrase: "And I've been thinking about it lately", breath: 250 },
        { chord: "G",  duration: 3300, intensity: 0.78, rollSpeed: 18, phrase: "Does it ever drive you crazy", breath: 250 },
        { chord: "Em", duration: 4200, intensity: 0.76, rollSpeed: 18, phrase: "Just how fast the night changes...", breath: 500 }
      ]
    }
  },
  iris: {
    title: "Iris",
    artist: "Goo Goo Dolls",
    tempo: 76,
    chordSlots: [
      { key: "D",  name: "Dadd9", gesture: "OPEN PALM", emoji: "✋" },
      { key: "Em", name: "Em7",   gesture: "PEACE",     emoji: "✌️" },
      { key: "G",  name: "Gmaj7", gesture: "FIST",      emoji: "✊" },
      { key: "Bm", name: "Bm7",   gesture: "POINT",     emoji: "☝️" },
      { key: "A",  name: "Aadd9", gesture: "3 FINGERS", emoji: "🤟" },
      { key: "C",  name: "Cadd9", gesture: "THUMB+INDEX", emoji: "🤙" }
    ],
    progression: [
      { chord: "D",  label: "Dadd9", emoji: "✋" },
      { chord: "Em", label: "Em7",   emoji: "✌️" },
      { chord: "G",  label: "Gmaj7", emoji: "✊" },
      { chord: "Bm", label: "Bm7",   emoji: "☝️" },
      { chord: "A",  label: "Aadd9", emoji: "🤟" },
      { chord: "G",  label: "Gmaj7", emoji: "✊" }
    ],
    sections: {
      verse: [
        { chord: "D",  duration: 3600, intensity: 0.65, rollSpeed: 20, phrase: "And I'd give up forever to touch you", breath: 250 },
        { chord: "Em", duration: 3600, intensity: 0.62, rollSpeed: 20, phrase: "'Cause I know that you feel me somehow", breath: 250 },
        { chord: "G",  duration: 4200, intensity: 0.68, rollSpeed: 22, phrase: "You're the closest to heaven that I'll ever be", breath: 350 },
        { chord: "Bm", duration: 3600, intensity: 0.64, rollSpeed: 20, phrase: "And I don't want to go home right now", breath: 250 },
        { chord: "A",  duration: 3600, intensity: 0.66, rollSpeed: 20, phrase: "And all I can taste is this moment", breath: 250 },
        { chord: "G",  duration: 4600, intensity: 0.70, rollSpeed: 22, phrase: "And all I can breathe is your life", breath: 500 }
      ],
      chorus: [
        { chord: "Bm", duration: 2800, intensity: 0.76, rollSpeed: 16, phrase: "And I don't want the world to see me", breath: 200 },
        { chord: "A",  duration: 2800, intensity: 0.74, rollSpeed: 16, phrase: "'Cause I don't think that they'd understand", breath: 200 },
        { chord: "G",  duration: 4200, intensity: 0.80, rollSpeed: 20, phrase: "When everything's made to be broken", breath: 350 },
        { chord: "Bm", duration: 2900, intensity: 0.78, rollSpeed: 16, phrase: "I just want you to know who I am", breath: 250 },
        { chord: "A",  duration: 2900, intensity: 0.75, rollSpeed: 16, phrase: "", breath: 250 },
        { chord: "G",  duration: 5200, intensity: 0.82, rollSpeed: 22, phrase: "(Chorus bloom & fade)", breath: 600 }
      ]
    }
  }
};

function buildSongSchedule(songKey = "sadhana") {
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

let currentSongKey = "sadhana";
let currentSongSchedule = buildSongSchedule(currentSongKey);

function renderPianoKeys(songKey) {
  const song = SONGS[songKey];
  const piano = document.querySelector("#piano");
  if (!piano || !song || !song.chordSlots) return;

  piano.innerHTML = "";
  song.chordSlots.forEach((slot) => {
    const btn = document.createElement("button");
    btn.className = "piano-key";
    btn.type = "button";
    btn.dataset.chord = slot.key;
    btn.setAttribute("aria-label", `Play ${slot.name}`);
    btn.innerHTML = `
      <span class="key-emoji">${slot.emoji}</span>
      <strong>${slot.key}</strong>
      <span>${slot.name}</span>
      <small>${slot.gesture}</small>
    `;
    btn.addEventListener("click", async () => {
      await audio.unlock();
      updateChord(slot.key, "keyboard");
    });
    piano.appendChild(btn);
  });

  el.keys = [...piano.querySelectorAll(".piano-key")];
}

function renderProgression(songKey) {
  const song = SONGS[songKey];
  const container = document.querySelector("#progression");
  if (!container || !song || !song.progression) return;

  container.innerHTML = "";
  song.progression.forEach((item, idx) => {
    const span = document.createElement("span");
    span.dataset.chord = item.chord;
    span.innerHTML = `<i>${item.emoji}</i> ${item.label}`;
    container.appendChild(span);

    if (idx < song.progression.length - 1) {
      const arrow = document.createElement("i");
      arrow.textContent = "→";
      container.appendChild(arrow);
    }
  });

  el.progression = [...container.querySelectorAll("[data-chord]")];
}

function updateActiveSong(songKey) {
  if (!SONGS[songKey]) return;
  currentSongKey = songKey;
  currentSongSchedule = buildSongSchedule(songKey);
  renderPianoKeys(songKey);
  renderProgression(songKey);
  if (autoPlayEnabled) {
    autoPlayIndex = 0;
    window.clearTimeout(autoPlayTimer);
    playNextAutoChord();
  }
}

const el = {
  video: document.querySelector("#camera"),
  canvas: document.querySelector("#hand-canvas"),
  cameraHud: document.querySelector("#camera-hud-badge"),
  cameraHudText: document.querySelector("#hud-text"),
  start: document.querySelector("#start-camera"),
  sound: document.querySelector("#sound-toggle"),
  mute: document.querySelector("#mute-button"),
  autoPlay: document.querySelector("#auto-play"),
  songSelect: document.querySelector("#song-select"),
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
let isProcessingFrame = false;
let lastInferenceTime = 0;
let consecutiveDetectionErrors = 0;
let consecutiveDeadVideoFrames = 0;

// Fast gesture state tracking
let currentChord = "MUTE";
let candidateGesture = "MUTE";
let candidateStartTime = 0;
let candidateFrames = 0;
let noHandFrames = 0;
let rawGesture = "SEARCHING";
let stableGesture = "SEARCHING";
let lastClassification = null;
let lastChordTriggerTime = 0;

let autoPlayEnabled = false;
let autoPlayTimer = null;
let autoPlayIndex = 0;

class AudioEngine {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.volume = 1.0;
    this.masterGain = null;
    this.activeVoices = [];
    this.lastChord = "MUTE";
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1.0, vol));
    if (this.masterGain && this.context) {
      this.masterGain.gain.setValueAtTime(this.volume * 0.75, this.context.currentTime);
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

      // Master output gain with calibrated digital headroom (never clips or buzzes)
      this.masterGain = this.context.createGain();
      this.masterGain.gain.setValueAtTime(this.volume * 0.75, this.context.currentTime);
      this.masterGain.connect(this.context.destination);
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

  // Smooth, pop-free acoustic crossfade release using cancelAndHoldAtTime
  release(seconds = 0.35) {
    if (!this.context || this.context.state === "suspended") return;
    const now = this.context.currentTime;
    const timeConstant = seconds / 3.2;

    const voicesToRelease = this.activeVoices;
    this.activeVoices = [];

    for (const voice of voicesToRelease) {
      try {
        const param = voice.gain.gain;
        if (typeof param.cancelAndHoldAtTime === "function") {
          param.cancelAndHoldAtTime(now);
        } else {
          param.cancelScheduledValues(now);
          param.setValueAtTime(param.value, now);
        }
        param.setTargetAtTime(0.00001, now, timeConstant);
      } catch {}
    }
  }

  stopImmediately() {
    if (!this.context) return;
    const now = this.context.currentTime;
    for (const voice of this.activeVoices) {
      try {
        const param = voice.gain.gain;
        if (typeof param.cancelAndHoldAtTime === "function") {
          param.cancelAndHoldAtTime(now);
        } else {
          param.cancelScheduledValues(now);
          param.setValueAtTime(param.value, now);
        }
        param.setTargetAtTime(0.00001, now, 0.01);
      } catch {}
    }
    this.activeVoices = [];
    this.lastChord = "MUTE";
  }

  async play(chord, intensity = 0.85, rollSpeedMs = 20) {
    if (!this.enabled || chord === "MUTE" || !ALL_CHORDS[chord]) return;
    this.initContext();
    if (!this.context) return;

    if (this.context.state === "suspended") {
      try {
        await this.context.resume();
      } catch (err) {
        console.warn("[AUDIO] Waiting for user interaction to resume AudioContext:", err);
      }
    }

    // Lush seamless crossfade: gently fade previous chord without pops or clicks
    this.release(0.35);

    const now = this.context.currentTime + 0.015;
    const notes = ALL_CHORDS[chord].notes;
    const roll = Math.min(0.026, Math.max(0.014, rollSpeedMs / 1000));
    const intensityScale = Math.min(1.15, Math.max(0.70, intensity));

    const newVoices = notes.map((frequency, index) => {
      const start = now + index * roll;

      // 1. Warm acoustic body: triangle wave has natural harmonic roll-off (1/n²), never harsh
      const osc = this.context.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, start);

      // 2. Velvety 2nd-order acoustic lowpass filter (warm wooden resonance, zero buzzing)
      const filter = this.context.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(0.7, start);
      filter.frequency.setValueAtTime(Math.min(2600, Math.max(1200, frequency * 3.8)), start);
      filter.frequency.setTargetAtTime(Math.min(1100, Math.max(600, frequency * 1.8)), start + 0.03, 0.45);

      // Dedicated voice gain with calibrated headroom (5-6 strings sum to <= 0.39, impossible to clip)
      const voiceGain = this.context.createGain();
      const peak = 0.065 * (intensityScale / 0.85);

      // Connect graph: osc -> filter -> voiceGain -> masterGain -> destination
      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(this.masterGain);

      // Click-free acoustic pluck envelope:
      // 25ms soft pluck ramp -> 2.5s exponential decay
      voiceGain.gain.setValueAtTime(0.00001, start);
      voiceGain.gain.linearRampToValueAtTime(peak, start + 0.025);
      voiceGain.gain.setTargetAtTime(0.00001, start + 0.04, 1.4);

      try {
        osc.start(start);
        osc.stop(start + 5.0);
      } catch {}

      return {
        oscillators: [osc],
        gain: voiceGain,
        startTime: start,
        stopTime: start + 5.0
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
  if (el.cameraHud) el.cameraHud.hidden = true;
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

function updateChord(chord, source = "gesture", intensity = 0.65, rollSpeed = 18, subtitle = null) {
  if (!CHORDS[chord] && chord !== "MUTE") return;
  // If controlled by hand gesture, do not re-trigger the exact same chord continuously while the hand is held
  if (source === "gesture" && chord === currentChord) return;
  currentChord = chord;

  if (chord === "MUTE") {
    audio.release(0.5);
  } else {
    audio.play(chord, intensity, rollSpeed);
  }

  // 2. UI PATH: Update visual elements
  const data = CHORDS[chord] || { name: "MUTE", displayName: "MUTE" };
  const song = SONGS[currentSongKey] || SONGS.sadhana;
  const slot = song.chordSlots ? song.chordSlots.find((s) => s.key === chord) : null;
  const chordTitle = slot ? slot.name : (data.displayName || data.name);
  const gestureText = slot ? `${slot.emoji} ${slot.gesture}` : "PLAYING";

  el.chord.textContent = chordTitle;
  el.description.textContent = subtitle || (chord === "MUTE" ? "No chord is playing" : source === "gesture" ? "Controlled by your hand" : source === "auto" ? `${song?.title || "Song"} accompaniment` : "Playing from the keyboard");
  el.gesture.textContent = source === "gesture" ? gestureText : source === "auto" ? "AUTO PLAY" : chord === "MUTE" ? "MUTED" : "KEY PRESSED";
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

  let slotIndex = -1;
  let gestureLabel = "SEARCHING";
  let confidence = 0.98;

  // 1. OPEN PALM (Slot 0): 4 fingers extended
  if (extendedCount >= 4) {
    slotIndex = 0;
    gestureLabel = "OPEN PALM";
  }
  // 2. THREE FINGERS (Slot 4): exactly 3 fingers extended
  else if (extendedCount === 3) {
    slotIndex = 4;
    gestureLabel = "3 FINGERS";
  }
  // 3. PEACE SIGN (Slot 1): exactly 2 fingers extended
  else if (extendedCount === 2) {
    if (thb.extended && idx.extended && !mid.extended) {
      slotIndex = 5;
      gestureLabel = "THUMB + INDEX";
    } else {
      slotIndex = 1;
      gestureLabel = "PEACE";
    }
  }
  // 4. SINGLE FINGER (Slot 3 or Slot 5)
  else if (extendedCount === 1) {
    if (idx.extended && thb.extended) {
      slotIndex = 5;
      gestureLabel = "THUMB + INDEX";
    } else {
      slotIndex = 3;
      gestureLabel = "POINT";
    }
  }
  // 5. FIST (Slot 2): 0 fingers extended
  else if (extendedCount === 0) {
    slotIndex = 2;
    gestureLabel = "FIST";
  } else {
    confidence = 0.40;
  }

  const song = SONGS[currentSongKey] || SONGS.sadhana;
  const slot = (slotIndex >= 0 && slotIndex < song.chordSlots.length) ? song.chordSlots[slotIndex] : null;
  const chord = slot ? slot.key : "MUTE";
  const chordName = slot ? slot.name : "MUTE";

  return {
    gesture: chord,
    slotIndex,
    gestureLabel,
    chordName,
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
        audio.release(0.5);
        updateChord("MUTE", "gesture");
      }

      if (el.cameraHud) el.cameraHud.hidden = true;
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

  rawGesture =
    gesture === "MUTE"
      ? "NO VALID GESTURE"
      : (classification.gestureLabel || "UNKNOWN");

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

  // Stable confirmation: require at least 3 consecutive frames AND 65ms hold
  const isConfirmed = candidateFrames >= 3 && heldMs >= 65;

  if (isConfirmed && gesture !== currentChord && (now - lastChordTriggerTime >= 150)) {
    lastChordTriggerTime = now;
    stableGesture = gesture;
    console.info(`[GESTURE CONFIRMED] ${gesture} (${classification.gestureLabel}) in ${heldMs.toFixed(1)}ms`);
    updateChord(gesture, "gesture", 0.80, 16);
  }

  el.gesture.textContent = classification.gestureLabel || rawGesture;
  updateDebug();
}

const EDGES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
function drawHand(points, classification) {
  resetCanvas();
  context.lineWidth = 2.5;
  context.strokeStyle = "rgba(245, 158, 11, 0.75)";

  EDGES.forEach(([a, b]) => {
    context.beginPath();
    context.moveTo(points[a].x * el.canvas.width, points[a].y * el.canvas.height);
    context.lineTo(points[b].x * el.canvas.width, points[b].y * el.canvas.height);
    context.stroke();
  });

  points.forEach((point, i) => {
    const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
    let color = "#e5dfd3";
    let radius = 3.5;

    if (classification?.fingerInfo) {
      const { idx, mid, rng, pnk, thb } = classification.fingerInfo;
      if (i === 8) color = idx.extended ? "#fbbf24" : "#e07a5f";
      if (i === 12) color = mid.extended ? "#fbbf24" : "#e07a5f";
      if (i === 16) color = rng.extended ? "#fbbf24" : "#e07a5f";
      if (i === 20) color = pnk.extended ? "#fbbf24" : "#e07a5f";
      if (i === 4) color = thb.extended ? "#fbbf24" : "#e07a5f";
      if (isTip) radius = 6.0;
    }

    context.beginPath();
    context.arc(point.x * el.canvas.width, point.y * el.canvas.height, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();

    if (isTip) {
      context.lineWidth = 1.5;
      context.strokeStyle = "#fffdfa";
      context.stroke();
    }
  });

  // Live un-mirrored HUD badge in camera stage (bottom-right)
  if (classification && classification.gesture && classification.gesture !== "MUTE") {
    const gestureLabel = classification.gestureLabel || "";
    const name = classification.chordName || classification.gesture;
    const count = classification.extendedCount != null ? `[${classification.extendedCount}] ` : "";

    if (el.cameraHud && el.cameraHudText) {
      el.cameraHud.hidden = false;
      el.cameraHudText.textContent = `${gestureLabel} ${count}→ ${name}`;
    }
  } else {
    if (el.cameraHud) {
      el.cameraHud.hidden = true;
    }
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

    // 1. Attempt hardware-accelerated GPU delegate for smooth 60fps performance
    try {
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      console.info("[MEDIAPIPE] HandLandmarker loaded with GPU acceleration.");
    } catch (gpuErr) {
      console.warn("[MEDIAPIPE] GPU acceleration unavailable, using CPU fallback:", gpuErr);
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      console.info("[MEDIAPIPE] HandLandmarker loaded with CPU.");
    }

    trackerReady = true;
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

  // 1. Resilient video stream check - NEVER kill camera on transient frame drop
  if (!isLiveVideoReady(el.video, stream)) {
    consecutiveDeadVideoFrames++;
    if (consecutiveDeadVideoFrames > 90) { // ~3 seconds of continuous dead stream
      console.warn("[TRACKER] Live video track lost permanently.");
      stopExistingStream();
      setCameraState(CAMERA.ERROR, {
        title: "Camera Stream Lost",
        message: "Camera stream became unavailable during hand tracking.",
        trackingText: "Camera stream was lost."
      });
      return;
    }
    // Temporary drop: keep RAF loop alive
    animationFrame = requestAnimationFrame(detectFrame);
    return;
  }
  consecutiveDeadVideoFrames = 0;

  // 2. Synchronize canvas resolution dynamically
  if (el.video.videoWidth > 0 && (el.canvas.width !== el.video.videoWidth || el.canvas.height !== el.video.videoHeight)) {
    el.canvas.width = el.video.videoWidth;
    el.canvas.height = el.video.videoHeight;
  }

  // 3. Pacing & Concurrency Guard:
  // - Prevent overlapping ML inference calls
  // - Pace inference to ~33 FPS max (webcam refresh rate) to free CPU for rendering & audio
  const now = performance.now();
  const timeSinceLastInference = now - lastInferenceTime;
  const isNewVideoFrame = el.video.currentTime !== lastVideoTime;

  if (
    !isProcessingFrame &&
    timeSinceLastInference >= 30 &&
    el.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    isNewVideoFrame
  ) {
    isProcessingFrame = true;
    lastVideoTime = el.video.currentTime;
    lastInferenceTime = now;

    try {
      const timestamp = Math.max(now, (detectFrame.lastTimestamp || 0) + 1);
      detectFrame.lastTimestamp = timestamp;

      const result = handLandmarker.detectForVideo(el.video, timestamp);
      consecutiveDetectionErrors = 0;

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
      consecutiveDetectionErrors++;
      console.warn(`[TRACKER] Non-fatal frame glitch (${consecutiveDetectionErrors}):`, error);
      // Reset timestamp if MediaPipe threw due to timestamp monotonicity
      detectFrame.lastTimestamp = performance.now();

      // Only give up if error persists continuously for dozens of frames
      if (consecutiveDetectionErrors > 30) {
        console.error("[TRACKER] Persistent detection failure:", error);
        trackerReady = false;
        setTone(el.cameraStatus, "error", "TRACKING ERROR");
        setTracking("error", "Hand tracking error. Please restart camera.");
        isProcessingFrame = false;
        return;
      }
    } finally {
      isProcessingFrame = false;
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
  if (!currentSongSchedule || currentSongSchedule.length === 0) return;
  const step = currentSongSchedule[autoPlayIndex];
  autoPlayIndex = (autoPlayIndex + 1) % currentSongSchedule.length;
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
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 30, max: 30 }
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

if (el.songSelect) {
  el.songSelect.addEventListener("change", async (e) => {
    await audio.unlock();
    const newKey = e.target.value;
    if (SONGS[newKey]) {
      updateActiveSong(newKey);
    }
  });
}

updateActiveSong(currentSongKey);
setCameraState(CAMERA.IDLE);

