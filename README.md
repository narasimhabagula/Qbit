# ⚛️ QBIT — AI-Powered Interactive Quantum Computing Platform

> **"Learn Quantum. Build Quantum. Think Quantum."**
> 
> A next-generation, scientific quantum computing learning platform featuring photorealistic 3D hardware simulation, visual circuit design, and an AI quantum tutor.

---

## 🏆 Smart India Hackathon Details
- **Problem Statement ID**: `SIH26140`
- **Problem Title**: AI-Based Interactive Quantum Algorithm Learning Platform
- **Theme**: Smart Education
- **Category**: Software
- **Team Name**: **UNPAIRED ELECTRONS**
- **AI Tutor Inside**: **QBIT AI** (Your Personal Quantum Tutor)

---

## 🚀 Core Product Features

### 1. 🔬 Interactive Quantum Curriculum & Micro-Lessons
- Concept-driven, visual, and highly interactive learning modules (no intimidating walls of text).
- Multiple interactive question types: Single/Multiple choice, concept matching, state outcome prediction, and quantum gate timeline placement.
- Instant feedback with sound effects, XP tracking, coherence mechanics, streak multipliers, and achievement badges.

### 2. ⚛️ Interactive Quantum Playground
- Graphical drag-and-drop circuit designer supporting 1 to 4 customizable qubit lines ($q_0, q_1, q_2, q_3$).
- Supported Gates: Hadamard ($H$), Pauli ($X, Y, Z$), Phase ($S, T$), Controlled-NOT ($CNOT / CX$), and Measurement.
- Sequential animated circuit execution with travelling optical pulses.
- Real-time simulation engine displaying:
  - Exact measurement probabilities (1024-shot sampling histogram)
  - Full complex statevector amplitudes ($\alpha + i\beta$) and phases
  - Synchronized 3D Bloch sphere for any selected qubit register
  - Multi-SDK code generation in **Python Qiskit**, **Cirq**, **PennyLane**, and **OpenQASM 2.0**.
  - One-click presets: *Bell State ($|\Phi^+\rangle$)*, *GHZ 3-Qubit Entanglement*, and *Equal Superposition*.

### 3. 🌐 3D Bloch Sphere & Visualization Lab
- Interactive 3D Bloch sphere rendered with Three.js.
- Visualizes poles $|0\rangle$ (North Pole), $|1\rangle$ (South Pole), equator superpositions ($|+\rangle, |-\rangle, |i\rangle, |-i\rangle$), and real-time state vector arrows $(\theta, \phi)$.
- Quick gate triggers ($H, X, Y, Z, S$) with smooth orbital camera controls.
- Quantum wave-particle packet visualizer demonstrating superposition probability haze.
- Entangled pair visualizer demonstrating instant non-local wavefunction collapse upon measurement.

### 4. 🤖 QBIT AI — In-Lesson & Platform AI Tutor
- Friendly animated robot/quantum mascot floating assistant.
- Voice Interaction UI:
  - 🔊 Text-to-Speech (reads quantum explanations aloud using Web Speech API)
  - 🎤 Speech-to-Text (talk directly to QBIT AI with voice queries)
- Context-Aware Tutoring: Remembers current lesson, recent user mistakes, and circuit state.
- Socratic explanations, circuit error diagnosis, and personalized study recommendations.

### 5. 💻 Quantum Code Studio
- Professional syntax-highlighted code editor for **Qiskit**, **Cirq**, and **PennyLane**.
- Action tools:
  - **▶ Run**: Runs simulation on backend and prints measurement counts.
  - **✨ Explain with QBIT AI**: Deconstructs code line-by-line.
  - **🐛 Debug**: Detects common quantum pitfalls (e.g., measuring before entanglement).
  - **⚡ Optimize**: Recommends circuit depth reduction and gate cancellation.

### 6. 📈 Gamification Progression & Analytics
- **8 Levels**: From *Level 1 (Quantum Beginner)* to *Level 8 (Quantum Master)*.
- **Streaks & Lives**: 7-day streak tracking with fire animations, 5 hearts life system with recharge mechanics.
- **7 Prestigious Badges**: Qubit Beginner, Gate Master, Entanglement Explorer, Circuit Builder, Quantum Coder, AI Explorer, Quantum Master.
- **Mastery Analytics**: Topic breakdown across Foundations (85%), Circuits (65%), Algorithms (35%), and weekly XP velocity chart.
- **Leaderboard**: Weekly League, Global Standings, and Friends leaderboards.

### 7. 👨‍🏫 Instructor & Educator Console (SIH Architecture)
- Student roster tracking with curriculum completion percentages.
- Automated class misconception diagnostics (e.g., detecting students measuring before entangling).
- One-click assignment dispatcher for targeted remedial modules.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Icons & Visuals**: Lucide React + Three.js + Recharts + Canvas Confetti
- **Audio & Speech**: Web Audio API (zero external sound asset lag) + Web Speech API (TTS & SpeechRecognition)
- **State Management**: Reactive Game Store with LocalStorage Persistence
- **Backend API**: Python FastAPI + Uvicorn + NumPy + SciPy (Exact tensor product statevector matrix engine)

---

## 🏁 Quickstart Guide

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Launch the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Launch the Python Quantum Backend (Optional / Recommended)
```bash
cd backend
python main.py
```
FastAPI server runs on [http://127.0.0.1:8000](http://127.0.0.1:8000) with API docs at `/docs`.

*(Note: The platform features a dual-engine architecture — if the Python backend is offline, the client-side TypeScript matrix engine executes all simulations and Socratic tutoring automatically with zero downtime!)*
