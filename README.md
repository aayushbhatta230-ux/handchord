# 🎸 HandChord

<p align="center">
  <a href="https://handchord.vercel.app/"><img src="https://img.shields.io/badge/Live_App-handchord.vercel.app-f59e0b?style=for-the-badge&logo=vercel&logoColor=black" alt="Live Demo" /></a>
  <a href="https://github.com/aayushbhatta230-ux/handchord/actions"><img src="https://img.shields.io/badge/CI-Passing-10b981?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI Passing" /></a>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/MediaPipe-0078D4?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe" />
  <img src="https://img.shields.io/badge/Web_Audio-FFA500?style=for-the-badge" alt="Web Audio" />
  <img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <b>Play acoustic chords freely in thin air with just your webcam.</b><br />
  No guitar, no MIDI keyboard, no sensors. Just your hands and a browser.
</p>

<p align="center">
  👉 <a href="https://handchord.vercel.app/"><b>Try HandChord in your browser &rarr;</b></a>
</p>

---

## ✨ Why HandChord?

We've all caught ourselves air-guitaring along to our favorite songs. **HandChord** turns that spontaneous feeling into real acoustic music.

Turn on your webcam, hold up a gesture, and the app strums rich, resonant chords in real time. Everything runs client-side inside your browser—powered by WebAssembly hand tracking and the Web Audio API—with zero latency, zero downloads, and zero plugins.

Whether you're singing along, practicing chord changes, or just having fun experimenting, it feels like strumming an invisible acoustic instrument.

---

## 🎶 Songs & Dynamic Repertoire

HandChord isn't locked to one chord loop. Each song is configured with authentic chord charts from real recordings. When you pick a song from the dropdown, the **6 piano keys**, **gesture mapping**, and **progression timeline** update automatically to match that song:

| Song | Artist | Key & Authentic Chords |
| :--- | :--- | :--- |
| **Sadhana** | John Chamling Rai | `C · G · F · Em · Dm · Am` |
| **Ko Cha Ra** | John Chamling Rai | `C · Em · F · G · Am · Dm` |
| **Maya Le** | John Chamling Rai | `C · F · Am · G · Em · Dm` |
| **Hawa Jastai** | John Chamling Rai | `G · Bm · C · D · Em · Am` |
| **Farkanna Hola** | John Chamling Rai | `C · Am · Em · F · G · Dm` |
| **Perfect** | Ed Sheeran | `G · Em · C · D · Am · Bm` |
| **Night Changes** | One Direction | `G · Em · Bm · D · C · Am` |
| **Iris** | Goo Goo Dolls | `D · Em · G · Bm · A · C` |

> Want to just listen or follow along? Toggle **Auto Play** to hear the song accompanied with synchronized chord changes and lyric cues.

---

## 🖐️ How to Play with Gestures

Position your hand comfortably in front of your camera. HandChord reads the 3D geometry of your fingers to trigger each chord smoothly:

| Gesture | Chord Slot | Typical Feel |
| :---: | :---: | :---|
| ✋ **Open Palm** (4 fingers extended) | Slot 1 | Root tonic resolution (e.g. `Cadd9` or `Gmaj`) |
| ✌️ **Peace Sign** (Index + Middle) | Slot 2 | Bright complementary chord (e.g. `Gmaj` or `Em7`) |
| ✊ **Fist** (Fingers curled inward) | Slot 3 | Grounded bass or minor shift (e.g. `Fmaj7` or `Bm7`) |
| ☝️ **Point** (Single Index finger) | Slot 4 | Melodic passing chord (e.g. `Em7` or `Dadd9`) |
| 🤟 **Three Fingers** (Index, Middle, Ring) | Slot 5 | Soulful, suspended lift (e.g. `Dm7` or `Am7`) |
| 🤙 **Thumb + Index** | Slot 6 | Transition voicing (e.g. `Am7` or `Bm7`) |
| 🛑 **Lower Hand** | Silence | Natural acoustic release and ring |

*Tip: You can also click the on-screen digital piano keys directly or use the master volume slider.*

---

## 🔊 The Sound Engine: Warm, Loud & Buzz-Free

Getting realistic acoustic tone out of browser synthesis without harsh digital buzzing or clipping pops took careful engineering:

1. **Natural Harmonics**: Uses triangle wave fundamentals combined with subtle octave sine shimmers, producing the organic 1/n² harmonic roll-off typical of acoustic guitar strings and pianos.
2. **Acoustic Lowpass Dynamics**: A gentle 2nd-order Butterworth filter (`Q = 0.75`) opens up to 3400 Hz on the initial strum to capture string presence and brightness, then softly settles to 1800 Hz as the note rings out.
3. **Studio Tape Saturation (`tanh` Curve)**: A smooth transfer curve provides warm analog headroom. It keeps the audio loud and full-bodied on laptop and phone speakers while making digital clipping or buzz physically impossible.
4. **Pop-Free Crossfading**: Changing gestures smoothly fades out ringing notes using exponential release curves (`cancelAndHoldAtTime`), giving transitions a natural, seamless feel.

---

## 🎨 Dark Music Studio Design

The UI is inspired by hardware synthesizers and analog recording studios:
- **Matte Obsidian Keys**: Dark synth keys with tactile bevels and warm gold lettering.
- **Amber Studio Glow**: Live active chords illuminate with studio backlight glow.
- **Un-Mirrored HUD Badge**: Real-time feedback in the camera view displays your detected gesture, finger count, and current chord without reverse-mirroring the text.
- **Tactile Volume Mixer**: Quick slider to adjust master output volume to your room setup.

---

## 💻 Running Locally

### Requirements
- [Node.js](https://nodejs.org/) (v18 or newer)
- A laptop/desktop webcam or mobile browser with camera support

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/aayushbhatta230-ux/handchord.git

# 2. Go to the project folder
cd handchord

# 3. Install dependencies
npm install

# 4. Start the local dev server
npm run dev
```

Visit `http://localhost:5173` in Chrome, Edge, or Safari, allow camera access, and start making music!

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **[Vite](https://vitejs.dev/)** — Lightweight, instant development server & bundler.
- **[MediaPipe Hand Landmarker](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)** — 21 3D hand landmarks tracked on-device via WebAssembly at 30–60 FPS.
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** — Polyphonic real-time synthesis and DSP audio processing.
- **Vanilla JavaScript & CSS** — Pure, lean code with zero heavyweight framework bloat.

---

## 🤝 Feedback & Contributions

Suggestions, song requests, and pull requests are warmly welcomed! If you'd like to suggest chords or new songs, open an issue or submit a PR on [GitHub](https://github.com/aayushbhatta230-ux/handchord).

If you had fun playing music with HandChord, consider leaving a **Star ⭐** on GitHub!

---

## 📄 License

Distributed under the [MIT License](LICENSE).
