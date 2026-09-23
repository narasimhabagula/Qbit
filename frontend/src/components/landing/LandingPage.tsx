import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, ActiveView } from '../../store/useGameStore';
import { QuantumBackdrop3D } from '../visualization/QuantumBackdrop3D';
import { QuantumChamber3D } from '../visualization/QuantumChamber3D';
import { Qubit3D } from '../visualization/Qubit3D';
import { Superposition3D } from '../visualization/Superposition3D';
import { Entanglement3D } from '../visualization/Entanglement3D';
import { BlochSphere3D } from '../visualization/BlochSphere3D';
import { QBitMascot3D } from '../ai/QBitMascot3D';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Cpu, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Code2, 
  Orbit, 
  Play,
  Terminal,
  Activity,
  Compass,
  BookOpen,
  Sliders,
  Share2,
  Atom,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface AlgorithmCard {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyColor: string;
  concept: string;
  speedup: string;
  circuitSnippet: string;
  qubits: number;
}

const ALGORITHMS: AlgorithmCard[] = [
  {
    id: 'deutsch-jozsa',
    name: 'Deutsch-Jozsa',
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    concept: 'Determines whether a black-box oracle function is constant or balanced using exactly 1 quantum query.',
    speedup: 'Exponential: 1 query vs 2ⁿ⁻¹ + 1 classical',
    circuitSnippet: '|0⟩─H─[ Uf ]─H─M\n|1⟩─H─[ Uf ]───',
    qubits: 2,
  },
  {
    id: 'bernstein-vazirani',
    name: 'Bernstein-Vazirani',
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    concept: 'Finds an unknown n-bit secret string s with 100% certainty in a single query.',
    speedup: 'Linear speedup: 1 query vs n classical queries',
    circuitSnippet: '|0⟩ⁿ─Hⁿ─[ U_s ]─Hⁿ─Mⁿ\n|1⟩───H──[ U_s ]────',
    qubits: 3,
  },
  {
    id: 'teleportation',
    name: 'Quantum Teleportation',
    difficulty: 'Intermediate',
    difficultyColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    concept: 'Transfers an unknown quantum state |ψ⟩ between distant nodes via entanglement and 2 classical bits.',
    speedup: 'State transfer adhering to No-Cloning theorem',
    circuitSnippet: '|ψ⟩───●──H──M \n|0⟩─H─┼─────┼─X─\n|0⟩───X─────M──Z─',
    qubits: 3,
  },
  {
    id: 'grover',
    name: "Grover's Search",
    difficulty: 'Intermediate',
    difficultyColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    concept: 'Searches an unstructured database of N elements in O(√N) steps using amplitude amplification.',
    speedup: 'Quadratic speedup: O(√N) vs O(N) classical',
    circuitSnippet: '|s⟩─[ Oracle ]─[ Diffuser ]─M\n|0⟩─[ Oracle ]─[ Diffuser ]─M',
    qubits: 4,
  },
  {
    id: 'qft',
    name: 'Quantum Fourier Transform',
    difficulty: 'Advanced',
    difficultyColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    concept: 'Transforms discrete quantum amplitudes into phase frequencies in O(n²) quantum gates.',
    speedup: 'Exponential over FFT: O(n²) vs O(n · 2ⁿ)',
    circuitSnippet: '|j₁⟩─H─[R₂]─[R₃]──\n|j₂⟩───┼───H─[R₂]─\n|j₃⟩───┼───┼───H──',
    qubits: 4,
  },
  {
    id: 'shor',
    name: "Shor's Algorithm",
    difficulty: 'Advanced',
    difficultyColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    concept: 'Finds prime factors of large integers N in polynomial time using modular exponentiation and QFT.',
    speedup: 'Exponential speedup: O((log N)³) vs sub-exponential',
    circuitSnippet: '|0⟩ⁿ─Hⁿ─[ U_aˣ ]─[ QFT† ]─M\n|1⟩─────[ U_aˣ ]──────────',
    qubits: 8,
  },
];

const CURRICULUM_STEPS = [
  { step: '01', title: 'Quantum Basics', desc: 'Linear algebra, complex vectors, Hilbert spaces, and qubit state representation.' },
  { step: '02', title: 'Qubits & Superposition', desc: 'Bloch sphere geometry, Dirac bra-ket notation, and Born rule probability collapse.' },
  { step: '03', title: 'Quantum Gates', desc: 'Unitary matrix transformations: Pauli X, Y, Z, Hadamard, phase gates, and CNOT.' },
  { step: '04', title: 'Quantum Circuits', desc: 'Multi-qubit registers, entanglement generation, Bell states, and decoherence.' },
  { step: '05', title: 'Quantum Algorithms', desc: 'Deutsch-Jozsa, Bernstein-Vazirani, Grover search, and phase estimation.' },
  { step: '06', title: 'Simulation & Noise', desc: 'Density matrices, Kraus operators, T₁ relaxation, and T₂ dephasing simulation.' },
  { step: '07', title: 'Advanced Quantum Hardware', desc: 'Superconducting transmons, cryogenic microwave controls, and quantum error mitigation.' },
];

export const LandingPage: React.FC = () => {
  const [store, actions] = useGameStore();
  const [active3DTab, setActive3DTab] = useState<'qubit' | 'superposition' | 'entanglement' | 'bloch'>('qubit');
  const [selectedLabModule, setSelectedLabModule] = useState<'chip' | 'cryo' | 'electronics' | 'readout'>('chip');

  const scrollToLab = () => {
    const el = document.getElementById('quantum-lab');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-cyan-500 selection:text-slate-950">
      {/* 3D Interactive Quantum Particle Field in Background */}
      <QuantumBackdrop3D />

      {/* Subtle Scientific Lighting Overlays */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP SUBTLE SIH ANNOUNCEMENT BAR */}
      <div className="bg-slate-900/90 text-slate-300 text-[10px] sm:text-[11px] py-1.5 px-4 text-center border-b border-slate-800/80 flex items-center justify-center gap-2 flex-wrap font-mono tracking-wider relative z-20">
        <span className="text-cyan-400 font-bold">SMART INDIA HACKATHON 2026</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-300">SIH26140</span>
        <span className="text-slate-500">•</span>
        <span className="text-indigo-300 font-semibold">TEAM UNPAIRED ELECTRONS</span>
      </div>

      {/* 2. MAIN NAVIGATION HEADER */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative z-20">
        {/* Brand */}
        <div 
          onClick={() => actions.setView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Atom className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white">
                QBIT
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
              Quantum Learning Platform
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button 
            onClick={() => actions.setView('dashboard')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Learn
          </button>
          <button 
            onClick={scrollToLab}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Quantum Lab
          </button>
          <button 
            onClick={() => actions.setView('playground')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Simulator
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('algorithms-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Algorithms
          </button>
          <button 
            onClick={() => actions.setTutorOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Tutor</span>
          </button>
        </nav>

        {/* Right Auth / Access Controls */}
        <div className="flex items-center gap-2.5">
          {store.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => actions.setView(store.hasOnboarded ? 'dashboard' : 'onboarding')}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black shadow-md transition-all cursor-pointer"
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => actions.logout()}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
                title="Log Out"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => actions.openAuth('login')}
                className="text-xs font-bold px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-slate-800 hover:border-slate-600 transition-all uppercase tracking-wider cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => actions.openAuth('signup')}
                className="text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all uppercase tracking-wider cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Scientific Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-cyan-300 text-xs font-mono font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Gen Quantum Computing Education</span>
            </div>

            {/* Powerful Typography Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Learn Quantum Computing.{' '}
              <span className="block bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Build. Simulate. Understand.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base text-slate-300 max-w-xl leading-relaxed">
              An interactive AI-powered platform for learning quantum computing, building quantum circuits, 
              running simulations, and exploring the future of quantum technology.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => actions.setView(store.hasOnboarded ? 'dashboard' : 'onboarding')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/15 flex items-center justify-center gap-2.5 transition-all hover:scale-102 cursor-pointer"
              >
                <span>START LEARNING</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={scrollToLab}
                className="px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-extrabold text-sm uppercase tracking-wider border border-slate-700 hover:border-slate-500 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>EXPLORE 3D LAB</span>
              </button>

              <button
                onClick={() => actions.setView('playground')}
                className="px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold border border-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>OPEN QUANTUM SIMULATOR</span>
              </button>
            </div>

            {/* Hardware Specifications Strip */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left font-mono">
              <div>
                <div className="text-cyan-400 font-black text-xl">15.2 mK</div>
                <div className="text-[11px] text-slate-400 font-medium">Cryogenic Temp</div>
              </div>
              <div>
                <div className="text-purple-400 font-black text-xl">127 Qubits</div>
                <div className="text-[11px] text-slate-400 font-medium">Transmon Lattice</div>
              </div>
              <div>
                <div className="text-indigo-400 font-black text-xl">118 μs</div>
                <div className="text-[11px] text-slate-400 font-medium">Coherence Time T₁</div>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Visual: HIGH-END PHOTOREALISTIC 3D QUANTUM COMPUTER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-6 relative"
          >
            <QuantumChamber3D />
          </motion.div>
        </div>
      </section>

      {/* 4. PRODUCT FEATURE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            Comprehensive Learning Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything You Need to Understand Quantum Computing
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From intuitive geometric visualizers to full mathematical state vectors and live Python SDKs, 
            QBIT bridges foundational physics with real quantum development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 01 - LEARN */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-cyan-400">01</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  FOUNDATIONS
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                LEARN
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive micro-lessons breaking down complex linear algebra, state vectors, superposition, 
                and measurement collapse without mathematical intimidation.
              </p>
            </div>
            <button
              onClick={() => actions.setView('dashboard')}
              className="mt-6 flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 02 - BUILD */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-indigo-400">02</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  CIRCUITS
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                BUILD
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag-and-drop quantum circuit builder with Hadamard, Pauli gates, phase rotations, 
                and multi-qubit CNOT entanglement channels.
              </p>
            </div>
            <button
              onClick={() => actions.setView('playground')}
              className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <span>Open Circuit Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 03 - SIMULATE */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-purple-400">03</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  ENGINE
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                SIMULATE
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Execute circuits in real-time, inspect unitary matrices, calculate probability distributions, 
                and visualize states on a 3D glass Bloch sphere.
              </p>
            </div>
            <button
              onClick={() => actions.setView('visualization')}
              className="mt-6 flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <span>Launch 3D Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 04 - ASK QBIT AI */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/40 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-cyan-300">04</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  AI TUTOR
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                ASK QBIT AI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your personal AI quantum tutor for step-by-step guidance, circuit debugging, 
                Dirac notation explanation, and Qiskit code assistance.
              </p>
            </div>
            <button
              onClick={() => actions.setTutorOpen(true)}
              className="mt-6 flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
            >
              <span>Talk to QBIT AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. QUANTUM LAB SECTION */}
      <section id="quantum-lab" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            Scientific Deep-Dive
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Step Inside the Quantum Lab
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Examine the engineering layers of a real dilution refrigerator operating at 15 millikelvin. 
            Click any hardware subsystem to inspect its physical parameters and quantum mechanics role.
          </p>
        </div>

        {/* 4 Hotspot Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {[
            { id: 'chip', label: 'Qubit Chip', icon: <Cpu className="w-4 h-4" /> },
            { id: 'cryo', label: 'Cryogenic System', icon: <Activity className="w-4 h-4" /> },
            { id: 'electronics', label: 'Control Electronics', icon: <Sliders className="w-4 h-4" /> },
            { id: 'readout', label: 'Readout System', icon: <Compass className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLabModule(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedLabModule === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Lab Module Details Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800/80 backdrop-blur-xl">
          <div className="lg:col-span-5 space-y-4">
            {selectedLabModule === 'chip' && (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Core Processor Subsystem
                </span>
                <h3 className="text-2xl font-black text-white">Superconducting Transmon Chip</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The processor is engineered with superconducting transmon circuits patterned on high-resistivity silicon. 
                  Josephson junctions act as non-linear inductors, isolating the ground |0⟩ and excited |1⟩ states from higher energy levels.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ANHARMONICITY:</span>
                    <strong className="text-cyan-300">-300 MHz</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">RESONATOR COUPLING:</span>
                    <strong className="text-white">g / 2π = 75 MHz</strong>
                  </div>
                </div>
              </>
            )}

            {selectedLabModule === 'cryo' && (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Thermodynamic Isolation
                </span>
                <h3 className="text-2xl font-black text-white">Closed-Cycle Dilution Refrigerator</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Superconductivity and quantum coherence require an environment colder than deep outer space. 
                  By circulating helium-3 and helium-4 across a phase boundary, the mixing chamber achieves a baseline of 15 millikelvin.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">COOLING POWER:</span>
                    <strong className="text-cyan-300">250 μW @ 100 mK</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">BASE TEMPERATURE:</span>
                    <strong className="text-white">15.2 mK</strong>
                  </div>
                </div>
              </>
            )}

            {selectedLabModule === 'electronics' && (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Control Instrumentation
                </span>
                <h3 className="text-2xl font-black text-white">Microwave Pulse Control Lines</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Room-temperature arbitrary waveform generators (AWGs) synthesize Gaussian microwave pulses at 4–8 GHz. 
                  These travel down thermalized coaxial cables with -60 dB attenuation to drive single-qubit Rabi oscillations.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PULSE FREQUENCY:</span>
                    <strong className="text-cyan-300">4.5 – 6.5 GHz</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">GATE DURATION:</span>
                    <strong className="text-white">20 – 40 ns</strong>
                  </div>
                </div>
              </>
            )}

            {selectedLabModule === 'readout' && (
              <>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Quantum Measurement Chain
                </span>
                <h3 className="text-2xl font-black text-white">Dispersive Cavity Readout</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Each qubit is capacitively coupled to an optical readout resonator. Measuring transmitted microwave tone phase 
                  identifies whether the qubit is in |0⟩ or |1⟩ without destroying the state non-demolition (QND).
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">AMPLIFICATION:</span>
                    <strong className="text-cyan-300">TWPA + HEMT (+40 dB)</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">READOUT FIDELITY:</span>
                    <strong className="text-white">98.7%</strong>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                onClick={() => actions.setView('visualization')}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-400/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Interactive 3D Lab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Interactive 3D Tab Switcher */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'qubit', label: '3D Qubit' },
                  { id: 'superposition', label: 'Superposition Collapse' },
                  { id: 'entanglement', label: 'Entangled Filaments' },
                  { id: 'bloch', label: 'Bloch Sphere' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActive3DTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono transition-all cursor-pointer ${
                      active3DTab === tab.id
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">60 FPS WebGL</span>
            </div>

            {/* Selected 3D Interactive Visual */}
            <div className="w-full">
              {active3DTab === 'qubit' && <Qubit3D />}
              {active3DTab === 'superposition' && <Superposition3D />}
              {active3DTab === 'entanglement' && <Entanglement3D />}
              {active3DTab === 'bloch' && <BlochSphere3D />}
            </div>
          </div>
        </div>
      </section>

      {/* 6. QUANTUM CIRCUIT BUILDER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              Visual Quantum IDE
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Compose & Simulate Quantum Circuits
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Design multi-qubit quantum algorithms on an optical waveguide timeline. Apply single-qubit 
              rotations and multi-qubit entanglement gates, then watch real-time state vector transformations.
            </p>

            {/* Gate Palette Showcase */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Supported Gate Palette:
              </span>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { sym: 'H', name: 'Hadamard', col: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
                  { sym: 'X', name: 'Pauli-X', col: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
                  { sym: 'Y', name: 'Pauli-Y', col: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
                  { sym: 'Z', name: 'Pauli-Z', col: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
                  { sym: 'CX', name: 'CNOT', col: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
                  { sym: 'M', name: 'Measure', col: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                ].map((g) => (
                  <div 
                    key={g.sym}
                    className={`p-2 rounded-xl border text-center font-mono ${g.col}`}
                    title={g.name}
                  >
                    <div className="font-bold text-sm">{g.sym}</div>
                    <div className="text-[9px] truncate opacity-80">{g.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => actions.setView('playground')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>BUILD YOUR FIRST CIRCUIT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* IDE Schematic Preview */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4 font-mono">
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 ml-2 font-bold">bell_state_circuit.qbit</span>
              </div>
              <span className="text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                STATE: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
              </span>
            </div>

            {/* Waveguide Circuit Diagram */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-8 select-none">
              {/* Qubit 0 Line */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-cyan-300 font-bold w-12 shrink-0">q[0] |0⟩</span>
                <div className="flex-1 flex items-center relative">
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-500/40" />
                  <div className="flex items-center justify-around w-full relative z-10">
                    <span className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/30">
                      H
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-400 border-2 border-slate-950 shadow-md" />
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
                      M
                    </span>
                  </div>
                </div>
              </div>

              {/* Entanglement Bridge Connector */}
              <div className="h-6 flex items-center justify-center -my-4 relative">
                <div className="w-0.5 h-8 bg-purple-400/80" />
              </div>

              {/* Qubit 1 Line */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-cyan-300 font-bold w-12 shrink-0">q[1] |0⟩</span>
                <div className="flex-1 flex items-center relative">
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-500/40" />
                  <div className="flex items-center justify-around w-full relative z-10">
                    <span className="text-slate-600 text-xs">—</span>
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      ⊕
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
                      M
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Measurement Probability Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">P(|00⟩):</span>
                <span className="text-cyan-400 font-bold">50.0% (0.500)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">P(|11⟩):</span>
                <span className="text-cyan-400 font-bold">50.0% (0.500)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI TUTOR — QBIT AI SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* AI 3D Mascot Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <QBitMascot3D state="thinking" size={260} />
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
                <Bot className="w-3.5 h-3.5" />
                <span>QBIT AI • Quantum Tutor Model</span>
              </span>
            </div>
          </div>

          {/* AI Capabilities & Interactive Prompts */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                Intelligent Mentorship
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Meet QBIT AI
              </h2>
              <p className="text-lg text-indigo-300 font-semibold mt-1">
                Your personal quantum computing tutor.
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Trained on graduate quantum computing curricula, Qiskit SDK patterns, and gate-level circuit mathematics. 
              QBIT AI offers real-time conversational breakdowns, step-by-step guidance, and Dirac notation explanations.
            </p>

            {/* Core Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                'Explain quantum concepts intuitively',
                'Explain and construct quantum circuits',
                'Help debug runtime circuit errors',
                'Generate Qiskit & Cirq code examples',
                'Explain algorithms like Grover & Shor',
                'Answer beginner & advanced questions',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Interactive Sample Question Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Click a sample question to ask QBIT AI:
              </span>
              <div className="flex flex-col gap-2">
                {[
                  'Why does a Hadamard gate create an equal superposition of |0⟩ and |1⟩?',
                  'How does the CNOT gate create maximal entanglement in a Bell State?',
                  'Explain how Grover amplitude amplification achieves O(√N) speedup.',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      actions.setTutorOpen(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-200 hover:text-cyan-300 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>"{q}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => actions.setTutorOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>OPEN QBIT AI TUTOR</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. QUANTUM ALGORITHMS SECTION */}
      <section id="algorithms-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            Foundational Algorithms
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Explore Quantum Algorithms
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Study, analyze, and simulate standard quantum algorithms demonstrating proven computational advantages 
            over the best known classical methods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALGORITHMS.map((algo) => (
            <div
              key={algo.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white">
                    {algo.name}
                  </h3>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${algo.difficultyColor}`}>
                    {algo.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {algo.concept}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-cyan-300">
                  <span className="text-slate-500 block mb-0.5 text-[9px] uppercase tracking-wider font-bold">
                    Quantum Speedup:
                  </span>
                  {algo.speedup}
                </div>

                {/* Circuit Preview ASCII */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-tight">
                  <pre className="overflow-x-auto">{algo.circuitSnippet}</pre>
                </div>
              </div>

              <button
                onClick={() => actions.setView('playground')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Try Algorithm in Simulator</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 9. STRUCTURED LEARNING JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            Academic Curriculum
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            The Quantum Learning Roadmap
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A comprehensive, structured roadmap taking you from foundational linear algebra to 
            multi-qubit gate synthesis and hardware execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CURRICULUM_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <span className="text-xs font-mono font-black text-cyan-400 block mb-2">
                  STAGE {step.step}
                </span>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>Milestone {idx + 1} of 7</span>
                <span className="text-cyan-400 font-bold">✓ Ready</span>
              </div>
            </div>
          ))}

          {/* Final Certification Tile */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-black text-purple-400 block mb-2">
                FINAL CAPSTONE
              </span>
              <h4 className="text-sm font-bold text-white mb-1.5">
                Quantum Certification
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Demonstrate proficiency across circuit construction, algorithm implementation, and Dirac mathematics.
              </p>
            </div>

            <button
              onClick={() => actions.setView('dashboard')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
            >
              Begin Journey
            </button>
          </div>
        </div>
      </section>

      {/* 10. SCIENTIFIC FOOTER */}
      <footer className="bg-slate-950 text-white py-14 px-4 sm:px-6 border-t border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="text-cyan-400 font-extrabold text-2xl">⚛</span>
              <span className="font-black text-xl text-white tracking-tight">QBIT</span>
              <span className="text-xs text-slate-500 font-mono">| SIH26140</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              AI-Based Interactive Quantum Algorithm Learning Platform. 
              Built for students, educators, and quantum researchers.
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Developed by Team <strong className="text-slate-200">UNPAIRED ELECTRONS</strong> • Smart India Hackathon 2026
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center font-mono text-xs">
            <button
              onClick={() => actions.setView('playground')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
            >
              Simulator
            </button>
            <button
              onClick={() => actions.setView('visualization')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
            >
              3D Lab
            </button>
            <button
              onClick={() => actions.setView('code')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
            >
              Qiskit Studio
            </button>
            <button
              onClick={() => actions.setView('instructor')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-all cursor-pointer"
            >
              Instructor Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
