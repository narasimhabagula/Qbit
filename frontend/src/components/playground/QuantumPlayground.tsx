import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GateType, PlacedGate, SimulationOutput, CircuitPreset } from '../../types/quantum';
import { QuantumEngine } from '../../lib/quantum/quantumEngine';
import { CodeGenerator } from '../../lib/quantum/codeGenerators';
import { BlochSphere3D } from '../visualization/BlochSphere3D';
import { CircuitBoard3D } from './CircuitBoard3D';
import { useGameStore } from '../../store/useGameStore';
import { 
  Play, 
  RotateCcw, 
  Save, 
  Share2, 
  Trash2, 
  Plus, 
  Minus, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Cpu, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const GATE_PALETTE: { type: GateType; label: string; desc: string; color: string }[] = [
  { type: 'H', label: 'H', desc: 'Hadamard: Creates equal superposition', color: 'bg-blue-600' },
  { type: 'X', label: 'X', desc: 'Pauli-X: Bit flip (NOT)', color: 'bg-indigo-600' },
  { type: 'Y', label: 'Y', desc: 'Pauli-Y: Bit + phase flip', color: 'bg-purple-600' },
  { type: 'Z', label: 'Z', desc: 'Pauli-Z: Phase flip', color: 'bg-emerald-600' },
  { type: 'S', label: 'S', desc: 'Phase gate (π/2)', color: 'bg-amber-600' },
  { type: 'T', label: 'T', desc: 'π/4 Phase gate', color: 'bg-orange-600' },
  { type: 'CNOT', label: 'CX', desc: 'Controlled-NOT: Entangles 2 qubits', color: 'bg-violet-600' },
  { type: 'MEASURE', label: 'M', desc: 'Measurement: Collapses qubit state', color: 'bg-slate-800' },
];

const PRESETS: CircuitPreset[] = [
  {
    id: 'bell-state',
    name: 'Bell State |Φ⁺⟩',
    description: 'Maximally entangles 2 qubits: (|00⟩ + |11⟩)/√2',
    numQubits: 2,
    expectedState: '00: 50%, 11: 50%',
    gates: [
      { id: 'g1', type: 'H', targetQubit: 0, step: 0 },
      { id: 'g2', type: 'CNOT', controlQubit: 0, targetQubit: 1, step: 1 },
      { id: 'g3', type: 'MEASURE', targetQubit: 0, step: 2 },
      { id: 'g4', type: 'MEASURE', targetQubit: 1, step: 2 },
    ],
  },
  {
    id: 'ghz-state',
    name: '3-Qubit GHZ State',
    description: 'Greenberger-Horne-Zeilinger state: (|000⟩ + |111⟩)/√2',
    numQubits: 3,
    expectedState: '000: 50%, 111: 50%',
    gates: [
      { id: 'g1', type: 'H', targetQubit: 0, step: 0 },
      { id: 'g2', type: 'CNOT', controlQubit: 0, targetQubit: 1, step: 1 },
      { id: 'g3', type: 'CNOT', controlQubit: 1, targetQubit: 2, step: 2 },
      { id: 'g4', type: 'MEASURE', targetQubit: 0, step: 3 },
      { id: 'g5', type: 'MEASURE', targetQubit: 1, step: 3 },
      { id: 'g6', type: 'MEASURE', targetQubit: 2, step: 3 },
    ],
  },
  {
    id: 'superposition',
    name: 'Equal Superposition',
    description: 'Generates |+⟩ state with 50/50 probability on q0',
    numQubits: 2,
    expectedState: '0: 50%, 1: 50%',
    gates: [
      { id: 'g1', type: 'H', targetQubit: 0, step: 0 },
      { id: 'g2', type: 'MEASURE', targetQubit: 0, step: 1 },
    ],
  },
];

export const QuantumPlayground: React.FC = () => {
  const [, actions] = useGameStore();
  const [numQubits, setNumQubits] = useState<number>(2);
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>(PRESETS[0].gates);
  const [selectedGateType, setSelectedGateType] = useState<GateType | null>('H');
  const [controlQubit, setControlQubit] = useState<number>(0);

  // Simulation output state
  const [simOutput, setSimOutput] = useState<SimulationOutput>(() =>
    QuantumEngine.simulate(2, PRESETS[0].gates)
  );
  const [activeStepAnim, setActiveStepAnim] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedBlochQubit, setSelectedBlochQubit] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'sim' | 'code'>('sim');
  const [codeFramework, setCodeFramework] = useState<'qiskit' | 'cirq' | 'pennylane' | 'qasm'>('qiskit');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [circuitView, setCircuitView] = useState<'3d' | '2d'>('3d');

  const maxSteps = 6;

  // Run simulation whenever gates or qubit count change
  useEffect(() => {
    const result = QuantumEngine.simulate(numQubits, placedGates);
    setSimOutput(result);
  }, [placedGates, numQubits]);

  // Execute animated circuit simulation
  const handleRunSimulation = () => {
    setIsRunning(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step <= maxSteps) {
        setActiveStepAnim(step);
        step++;
      } else {
        clearInterval(interval);
        setActiveStepAnim(null);
        setIsRunning(false);
        actions.addXP(30);
      }
    }, 400);
  };

  const handleReset = () => {
    setPlacedGates([]);
  };

  const handleLoadPreset = (preset: CircuitPreset) => {
    setNumQubits(preset.numQubits);
    setPlacedGates(preset.gates);
  };

  // Place gate on slot
  const handleSlotClick = (qubit: number, step: number) => {
    if (!selectedGateType) return;

    // If gate already exists at (qubit, step), remove it
    const existing = placedGates.find(g => g.targetQubit === qubit && g.step === step);
    if (existing) {
      setPlacedGates(prev => prev.filter(g => g.id !== existing.id));
      return;
    }

    const newGate: PlacedGate = {
      id: `${selectedGateType}-${qubit}-${step}-${Date.now()}`,
      type: selectedGateType,
      targetQubit: qubit,
      step,
      controlQubit: selectedGateType === 'CNOT' ? (qubit === 0 ? 1 : 0) : undefined,
    };

    setPlacedGates(prev => [...prev, newGate]);
  };

  const removeGate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedGates(prev => prev.filter(g => g.id !== id));
  };

  // Chart data formatting
  const chartData = Object.entries(simOutput.probabilities).map(([state, prob]) => ({
    state: `|${state}⟩`,
    probability: Math.round(prob * 100),
  }));

  // Code export string
  const getExportCode = () => {
    switch (codeFramework) {
      case 'qiskit':
        return CodeGenerator.toQiskit(numQubits, placedGates);
      case 'cirq':
        return CodeGenerator.toCirq(numQubits, placedGates);
      case 'pennylane':
        return CodeGenerator.toPennyLane(numQubits, placedGates);
      case 'qasm':
        return CodeGenerator.toOpenQASM(numQubits, placedGates);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getExportCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Interactive Lab
            </span>
            <span className="text-xs text-slate-500 font-mono">Depth: {simOutput.circuitDepth}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Quantum Circuit Playground
          </h1>
          <p className="text-xs text-slate-500">
            Drag and place quantum gates to synthesize arbitrary unitary operations and observe state collapse.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">Presets:</span>
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-Column Layout: Left (Palette) | Center (Circuit Grid) | Right (Sim Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Quantum Gate Palette */}
        <div className="lg:col-span-2 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quantum Gates
          </h3>
          <p className="text-[11px] text-slate-500">Select gate, then click on circuit grid:</p>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {GATE_PALETTE.map(gate => {
              const isSelected = selectedGateType === gate.type;
              return (
                <button
                  key={gate.type}
                  onClick={() => setSelectedGateType(gate.type)}
                  className={`w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between text-left group hover:-translate-y-0.5 active:translate-y-0 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 shadow-md shadow-indigo-500/15 scale-[1.02]'
                      : 'border-slate-200/80 hover:border-slate-300 bg-gradient-to-b from-white to-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${gate.color}`}
                    >
                      {gate.label}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{gate.type}</span>
                      <span className="text-[9px] text-slate-400 block">{gate.label}</span>
                    </div>
                  </div>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_#6366f1]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-semibold">Qubit Lines:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNumQubits(Math.max(1, numQubits - 1))}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold px-2">{numQubits}</span>
                <button
                  onClick={() => setNumQubits(Math.min(4, numQubits + 1))}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive Circuit Canvas */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Timeline Register</h3>
              </div>

              {/* View Switcher: 3D Waveguide vs 2D Grid */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => setCircuitView('3d')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    circuitView === '3d'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  3D Waveguide
                </button>
                <button
                  onClick={() => setCircuitView('2d')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    circuitView === '2d'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  2D Schematic
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Clear Circuit"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md hover:shadow-indigo-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Executing...' : 'Run Simulation'}</span>
              </button>
            </div>
          </div>

          {/* 3D Waveguide View if active */}
          {circuitView === '3d' && (
            <CircuitBoard3D
              numQubits={numQubits}
              gates={placedGates}
              isExecuting={isRunning}
              activeStep={activeStepAnim}
            />
          )}

          {/* Circuit Grid Canvas */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono overflow-x-auto min-h-[260px] flex flex-col justify-around relative">
            {/* Animated step runner laser beam */}
            {activeStepAnim !== null && (
              <motion.div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_#00F0FF] z-20 pointer-events-none"
                style={{ left: `${80 + activeStepAnim * 64}px` }}
              />
            )}

            {Array.from({ length: numQubits }).map((_, qIdx) => (
              <div key={qIdx} className="relative flex items-center py-4 my-1">
                {/* Qubit Label */}
                <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs font-bold text-cyan-300 select-none">
                  <span>q{qIdx}:</span>
                  <span className="text-[10px] text-slate-400 font-normal">|0⟩</span>
                </div>

                {/* Horizontal Wire Line */}
                <div className="absolute left-16 right-4 h-0.5 bg-slate-700 pointer-events-none" />

                {/* Timeline Step Slots */}
                <div className="flex items-center gap-4 z-10 pl-2">
                  {Array.from({ length: maxSteps }).map((_, sIdx) => {
                    const gate = placedGates.find(g => g.targetQubit === qIdx && g.step === sIdx);
                    const isControl = placedGates.some(
                      g => g.controlQubit === qIdx && g.step === sIdx
                    );
                    const isExecutingThis = activeStepAnim === sIdx;

                    return (
                      <div
                        key={sIdx}
                        onClick={() => handleSlotClick(qIdx, sIdx)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all relative ${
                          gate
                            ? isExecutingThis
                              ? 'bg-cyan-400 text-slate-900 font-bold scale-110 shadow-[0_0_20px_#00F0FF]'
                              : 'bg-indigo-600 text-white font-bold shadow-md hover:scale-105'
                            : isControl
                            ? 'bg-transparent'
                            : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 border-dashed'
                        }`}
                      >
                        {gate && (
                          <>
                            <span className="text-xs font-bold font-mono">{gate.type}</span>
                            <button
                              onClick={e => removeGate(gate.id, e)}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              title="Delete gate"
                            >
                              ×
                            </button>
                          </>
                        )}

                        {/* CNOT Control dot */}
                        {isControl && (
                          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
                        )}

                        {/* Vertical line connecting control and target for CNOT */}
                        {gate?.type === 'CNOT' && gate.controlQubit !== undefined && (
                          <div
                            className="absolute w-0.5 bg-cyan-400 pointer-events-none"
                            style={{
                              top: gate.controlQubit < qIdx ? '-2.5rem' : 'auto',
                              bottom: gate.controlQubit > qIdx ? '-2.5rem' : 'auto',
                              height: '2.5rem',
                              left: '50%',
                              transform: 'translateX(-50%)',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>💡 Click a placed gate to remove it. Select CNOT to link control and target.</span>
            <button
              onClick={() => actions.setTutorOpen(true)}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Explain Circuit with QBIT AI
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Simulation Results & Bloch Sync */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('sim')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'sim'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Simulation Output
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'code'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Multi-SDK Code
              </button>
            </div>
          </div>

          {activeTab === 'sim' && (
            <div className="space-y-4">
              {/* Measurement Probabilities Chart */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Measurement Probabilities (1024 Shots)
                </span>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Probability']}
                        contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                      />
                      <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? '#6366F1' : '#06B6D4'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Synchronized Bloch Sphere */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Bloch Sphere (Qubit q{selectedBlochQubit})
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: numQubits }).map((_, q) => (
                      <button
                        key={q}
                        onClick={() => setSelectedBlochQubit(q)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          selectedBlochQubit === q
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        q{q}
                      </button>
                    ))}
                  </div>
                </div>

                <BlochSphere3D
                  theta={simOutput.blochCoords[selectedBlochQubit]?.theta || 0}
                  phi={simOutput.blochCoords[selectedBlochQubit]?.phi || 0}
                  interactive={false}
                />
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              {/* Framework Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['qiskit', 'cirq', 'pennylane', 'qasm'] as const).map(fw => (
                  <button
                    key={fw}
                    onClick={() => setCodeFramework(fw)}
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg transition-all ${
                      codeFramework === fw
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {fw}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="relative">
                <pre className="p-3.5 bg-slate-900 text-cyan-300 font-mono text-xs rounded-2xl overflow-x-auto max-h-[300px] leading-relaxed">
                  <code>{getExportCode()}</code>
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                onClick={() => actions.setView('code')}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Open in Full Code Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
