# HandChord

A browser-based musical instrument that lets you trigger chord progressions with hand gestures through your webcam.

Built with [MediaPipe Hand Landmarker](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) and the Web Audio API.

---

## How It Works

HandChord tracks your hand landmarks in real time and classifies poses into specific guitar-style chords. The audio engine generates multi-oscillator voices with individual string detuning, dynamic lowpass filtering, and custom release envelopes to simulate acoustic guitar strumming and voice leading.

It also includes an accompaniment mode mapped to the chord progression for Goo Goo Dolls' *Iris*.

### Gesture Controls

| Gesture | Chord | Notes / Voicing |
|---|---|---|
| **Open Hand** | Gmaj7 | G2, D3, G3, B3, D4, F#4 |
| **Peace Sign** | Dadd9 | D2, D3, F#3, A3, D4, E4 |
| **Fist** | Em7 | E2, E3, G3, B3, D4, E4 |
| **Point** | Cadd9 | C2, G2, G3, C4, D4, E4 |
| **Three Fingers** | Bm7/A | B1, A2, A3, B3, D4, F#4 |
| **Thumb + Index** | Aadd9 | A1, A2, A3, B3, C#4, E4 |

You can also click on the on-screen keys directly or toggle the **Auto Play** button to hear the full arrangement.

---

## Tech Stack

- **Vite** — Fast client-side bundler and dev server
- **MediaPipe Tasks Vision** — Client-side hand pose estimation running locally via WebAssembly
- **Web Audio API** — Real-time polyphonic synthesis (oscillators, biquad filters, gain envelopes)
- **Vanilla JavaScript & CSS** — Zero heavy UI framework overhead

---

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- A working webcam and browser with WebRTC support (Chrome, Edge, Safari, Firefox)

### Installation

```bash
git clone https://github.com/aayushbhatta230-ux/handchord.git
cd handchord
npm install
```

### Development

```bash
npm run dev
```

Open the local server URL (typically `http://localhost:5173`) in your browser and allow camera permissions when prompted.

### Production Build

```bash
npm run build
npm run preview
```

---

## License

MIT
