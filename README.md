# 🎸 HandChord

<p align="center">
  <img src="https://img.shields.io/badge/Demo-handchord.vercel.app-7928CA?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/MediaPipe-0078D4?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe" />
  <img src="https://img.shields.io/badge/Web_Audio_API-FFA500?style=for-the-badge" alt="Web Audio" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <b>Play chords with your hands in thin air.</b><br />
  No MIDI keyboards. No physical sensors. Zero latency. Just your webcam and browser.
</p>

<p align="center">
  👉 <a href="https://handchord.vercel.app/"><b>Experience the Live Demo &rarr;</b></a>
</p>

---

## ⚡ What is HandChord?

**HandChord** turns your standard webcam into an expressive musical air-instrument. 

By analyzing hand geometry at 60 FPS directly in the browser using WebAssembly, HandChord classifies your finger poses into rich, polyphonic chord voicings. The sound engine then generates warm acoustic resonance in real time using the native Web Audio API — completely client-side with zero audio samples to download.

---

## 🖐️ Gesture Reference

Hold up your hand in front of your camera to trigger smooth acoustic voicings:

| Gesture | Chord | Voicing | Acoustic Feel |
|:---:|:---:|:---:|:---|
| ✌️ **Peace Sign** | `Dadd9` | D2 · D3 · F#3 · A3 · D4 · E4 | Bright, uplifting folk strum |
| ✋ **Open Hand** | `Gmaj7` | G2 · D3 · G3 · B3 · D4 · F#4 | Warm, dreamy, open acoustic resonance |
| ✊ **Fist** | `Em7` | E2 · E3 · G3 · B3 · D4 · E4 | Deep, grounded minor tension |
| ☝️ **Point** | `Cadd9` | C2 · G2 · G3 · C4 · D4 · E4 | Crisp modern pop resolution |
| 🤟 **3 Fingers** | `Bm7/A` | B1 · A2 · A3 · B3 · D4 · F#4 | Emotional melancholic suspension |
| 🤙 **Thumb + Index** | `Aadd9` | A1 · A2 · A3 · B3 · C#4 · E4 | Singing, bright vocal transition |
| 🛑 **Hand Lowered** | `MUTE` | — | Natural sustained ring & acoustic release |

> **Pro-Tip**: You can also click the on-screen digital piano keys or hit **Auto Play** to hear the arrangement for Goo Goo Dolls' *Iris*.

---

## 🧠 Under the Hood

### 1. Robust 3D Bone-Straightness Tracking
Many camera-gesture projects fail because 2D screen height (`y`-coordinate) misinterprets tilted or angled fingers. HandChord solves this with a multi-joint biometric pipeline:
- **Joint Straightness Ratio**: Compares direct distance from knuckle base (MCP) to fingertip against the sum of all joint segments. Extended fingers score `> 0.82`, while curled fingers collapse to `< 0.45`.
- **3D Knuckle Bend Angles**: Computes 3D angle at the PIP joint (`angle3D > 118°`). Curled fingers bend sharply (`60°–95°`), permanently eliminating false positives (e.g. peace sign will never misclassify as 3 fingers).
- **Sub-40ms Confirmation**: Fast temporal window confirms chord transitions without lag or debounce stutter.

### 2. Warm Web Audio Synthesis (No Buzz)
- **Harmonic Oscillation**: Combines warm triangle waves (natural wooden piano resonance) with pure sine sub-oscillators for fundamental warmth.
- **Butterworth Acoustic Filtering**: Lowpass filter with critically damped resonance (`Q = 0.7`) rolls off naturally above 3.2 kHz, eliminating digital harshness and buzz.
- **Psychoacoustic Bass Doubling**: Fundamental bass notes (< 120 Hz) are octave-doubled into the 140–280 Hz register so laptop and smartphone speakers produce full acoustic punch.
- **Transparent Soft Limiter**: Keeps sound loud and punchy while preventing digital clipping or audio artifacts.

### 3. Real-Time HUD
- Visual feedback skeleton draws extended fingertips in **Neon Cyan** and curled fingers in **Coral Red**.
- Live on-canvas badge reveals detected finger count and active chord name in real-time.

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- A laptop/desktop webcam or mobile browser with camera permissions

### Run Locally

```bash
# Clone the repository
git clone https://github.com/aayushbhatta230-ux/handchord.git

# Enter project directory
cd handchord

# Install dependencies
npm install

# Start lightning-fast Vite dev server
npm run dev
```

Open `http://localhost:5173` in Chrome, Edge, or Safari, click **START CAMERA**, and make your first chord!

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Built With

- **[Vite](https://vitejs.dev/)** — Sub-second HMR and optimized bundler
- **[MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)** — On-device machine learning hand landmark detection via WebAssembly
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** — Hardware-accelerated browser polyphonic audio synthesis
- **Vanilla JavaScript & CSS** — Pure performance with zero bloated framework dependencies

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/aayushbhatta230-ux/handchord/issues).

---

## ⭐ Show Your Support

If you enjoyed making music with your hands, give this repo a **Star ⭐** — it helps more musicians and developers discover creative audio coding!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
