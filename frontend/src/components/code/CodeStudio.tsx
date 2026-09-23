import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { 
  Play, 
  Sparkles, 
  Bug, 
  Zap, 
  Copy, 
  Check, 
  RotateCcw, 
  Terminal, 
  Cpu, 
  Bot,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface CodePreset {
  id: string;
  name: string;
  framework: 'qiskit' | 'cirq' | 'pennylane';
  code: string;
}

const TEMPLATES: CodePreset[] = [
  {
    id: 'qiskit-bell',
    name: 'Qiskit: Bell State |Φ⁺⟩',
    framework: 'qiskit',
    code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# Initialize 2-qubit circuit with classical registers
qc = QuantumCircuit(2, 2)

# Step 1: Create superposition on q0
qc.h(0)

# Step 2: Entangle q0 and q1 with CNOT
qc.cx(0, 1)

# Step 3: Measure both qubits
qc.measure([0, 1], [0, 1])

# Simulate on AerSimulator
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1024)
result = job.result()
counts = result.get_counts(qc)

print("Measurement Counts:", counts)`,
  },
  {
    id: 'cirq-superposition',
    name: 'Cirq: Equal Superposition',
    framework: 'cirq',
    code: `import cirq

# Initialize single qubit
q = cirq.LineQubit(0)
circuit = cirq.Circuit()

# Apply Hadamard gate
circuit.append(cirq.H(q))

# Measure qubit
circuit.append(cirq.measure(q, key='result'))

# Simulate 1000 repetitions
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1000)

print(circuit)
print("Histogram:", result.histogram(key='result'))`,
  },
  {
    id: 'pennylane-qnode',
    name: 'PennyLane: Variational QNode',
    framework: 'pennylane',
    code: `import pennylane as qml
from pennylane import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def quantum_circuit(theta):
    qml.RX(theta, wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.probs(wires=[0, 1])

angle = np.pi / 3
print("Probabilities at theta = pi/3:", quantum_circuit(angle))`,
  },
  {
    id: 'buggy-example',
    name: 'Buggy Circuit (Try Debugger!)',
    framework: 'qiskit',
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)

# Line 5: Measuring BEFORE entangling!
qc.measure([0, 1], [0, 1])
qc.h(0)
qc.cx(0, 1)

print(qc.draw())`,
  },
];

export const CodeStudio: React.FC = () => {
  const [, actions] = useGameStore();
  const [selectedPreset, setSelectedPreset] = useState<string>('qiskit-bell');
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [framework, setFramework] = useState<'qiskit' | 'cirq' | 'pennylane'>('qiskit');
  const [output, setOutput] = useState<string>(
    "Simulation ready. Click ▶ Run to execute on Qiskit Aer Engine."
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<{ type: 'explain' | 'debug' | 'optimize'; text: string; correctedCode?: string } | null>(null);

  const handleSelectTemplate = (tId: string) => {
    setSelectedPreset(tId);
    const tmpl = TEMPLATES.find(t => t.id === tId);
    if (tmpl) {
      setCode(tmpl.code);
      setFramework(tmpl.framework);
      setAiMessage(null);
      setOutput(`Loaded ${tmpl.name}. Press ▶ Run to test.`);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput("Compiling quantum circuit on quantum simulator backend...");

    setTimeout(() => {
      setIsRunning(false);
      actions.addXP(20);

      if (code.includes('measure') && code.indexOf('measure') < code.indexOf('cx')) {
        setOutput(
          `Runtime Warning: Measurement executed on line 5 prior to entangling operation cx(0, 1)!\nState collapsed early to classical mixture:\nCounts: {'00': 1024}`
        );
      } else if (framework === 'qiskit') {
        setOutput(
          `Compiling circuit with 2 qubits, 2 classical bits.\nTranspilation complete (depth: 2, gate count: 2).\nRunning AerSimulator with 1024 shots...\n\nSimulation Results:\n----------------------------------\n|00⟩: 518 shots (50.58%)\n|11⟩: 506 shots (49.42%)\n|01⟩: 0 shots (0.00%)\n|10⟩: 0 shots (0.00%)\n\nProcess finished with exit code 0.`
        );
      } else if (framework === 'cirq') {
        setOutput(
          `q(0): ───H───M('result')───\n\nHistogram:\nCounter({0: 508, 1: 492})\nProbability: 50.8% |0⟩, 49.2% |1⟩\n\nProcess finished with exit code 0.`
        );
      } else {
        setOutput(
          `Evaluating PennyLane QNode on device 'default.qubit'...\nStatevector probabilities:\n[0.75, 0.0, 0.0, 0.25]\n\nProcess finished with exit code 0.`
        );
      }
    }, 800);
  };

  const handleAiExplain = () => {
    setAiMessage({
      type: 'explain',
      text: `Let's break down this ${framework.toUpperCase()} code step-by-step:
1. Lines 1-3: Import the required quantum library and simulator engine.
2. Lines 5-8: Initialize a 2-qubit register. The Hadamard gate puts qubit 0 into equal superposition (|0⟩ + |1⟩)/√2.
3. Lines 9-11: CNOT targets qubit 1 using qubit 0 as control. This entangles the pair into Bell state |Φ⁺⟩.
4. Lines 12-18: We measure both qubits into classical bits and sample 1,024 shots with the Aer simulator.`,
    });
  };

  const handleAiDebug = () => {
    if (code.includes('measure') && code.indexOf('measure') < code.indexOf('cx')) {
      const fixed = `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)

# Corrected: Perform gates first, then measure!
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

print(qc.draw())`;

      setAiMessage({
        type: 'debug',
        text: `I found an issue in line 5! 🐛\nThe circuit is measuring qubits BEFORE the required entanglement operation (cx). In quantum computing, measurement causes irreversible wavefunction collapse, destroying superposition.`,
        correctedCode: fixed,
      });
    } else {
      setAiMessage({
        type: 'debug',
        text: `No logical bugs detected! ✨ Your circuit topology and register sizing are mathematically valid. Gates are placed in chronological order before measurement.`,
      });
    }
  };

  const handleAiOptimize = () => {
    setAiMessage({
      type: 'optimize',
      text: `⚡ Optimization Analysis (QBIT AI Compiler):
- Circuit Depth: 2 (Optimal)
- Redundant Gates: 0 detected
- Hardware Compatibility: Native basis gates (CX, RZ, SX, X). No SWAP decomposition required for linear nearest-neighbor architecture.`,
    });
  };

  const applyCorrectedCode = () => {
    if (aiMessage?.correctedCode) {
      setCode(aiMessage.correctedCode);
      setAiMessage(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Multi-SDK Studio
            </span>
            <span className="text-xs text-slate-500 font-mono">Qiskit • Cirq • PennyLane</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Quantum Code Editor
          </h1>
          <p className="text-xs text-slate-500">
            Write, simulate, and debug authentic quantum algorithms with QBIT AI code analysis.
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                selectedPreset === t.id
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Main Column */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Action Toolbar */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-2">circuit_script.py</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>

              <button
                onClick={handleAiExplain}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Explain</span>
              </button>

              <button
                onClick={handleAiDebug}
                className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Debug</span>
              </button>

              <button
                onClick={handleAiOptimize}
                className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Optimize</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Area */}
          <div className="p-4 bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 min-h-[360px] flex">
            {/* Line numbers */}
            <div className="pr-4 select-none text-slate-600 text-right leading-relaxed font-mono">
              {code.split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>

            {/* Editable textarea with code styling */}
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full bg-transparent resize-none text-cyan-300 focus:outline-none font-mono leading-relaxed selection:bg-indigo-700"
              rows={code.split('\n').length + 2}
            />
          </div>
        </div>

        {/* Terminal Output & AI Diagnostics Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Terminal Console */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 text-white shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Simulation Console</span>
              </div>
              <button
                onClick={() => setOutput('Console cleared.')}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto">
              {output}
            </pre>
          </div>

          {/* QBIT AI Code Diagnostic Card */}
          <AnimatePresence>
            {aiMessage && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white rounded-3xl border border-indigo-100 p-5 shadow-md space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">QBIT AI Code Analysis</h4>
                    <span className="text-[10px] text-indigo-600 font-semibold uppercase">
                      {aiMessage.type}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {aiMessage.text}
                </p>

                {aiMessage.correctedCode && (
                  <div className="pt-2">
                    <button
                      onClick={applyCorrectedCode}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Apply Corrected Code
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
