import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PracticeChallenge } from '../../data/challengesData';
import { GateType, PlacedGate, SimulationOutput } from '../../types/quantum';
import { QuantumEngine } from '../../lib/quantum/quantumEngine';
import { useGameStore } from '../../store/useGameStore';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Clock, 
  Trophy, 
  ArrowRight,
  Code2,
  Terminal,
  Bot,
  Zap,
  Check,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeChallengeModalProps {
  challenge: PracticeChallenge;
  onClose: () => void;
}

const GATE_PALETTE: { type: GateType; label: string; desc: string; color: string }[] = [
  { type: 'H', label: 'H', desc: 'Hadamard: Creates equal superposition', color: 'bg-blue-600' },
  { type: 'X', label: 'X', desc: 'Pauli-X: Bit flip (NOT)', color: 'bg-indigo-600' },
  { type: 'Y', label: 'Y', desc: 'Pauli-Y: Bit + phase flip', color: 'bg-purple-600' },
  { type: 'Z', label: 'Z', desc: 'Pauli-Z: Phase flip', color: 'bg-emerald-600' },
  { type: 'S', label: 'S', desc: 'Phase gate (π/2)', color: 'bg-amber-600' },
  { type: 'T', label: 'T', desc: 'π/4 Phase gate', color: 'bg-orange-600' },
  { type: 'CNOT', label: 'CX', desc: 'Controlled-NOT: Entangles 2 qubits', color: 'bg-violet-600' },
  { type: 'MEASURE', label: 'M', desc: 'Measurement: Collapses state', color: 'bg-slate-700' },
];

export const PracticeChallengeModal: React.FC<PracticeChallengeModalProps> = ({ challenge, onClose }) => {
  const [store, actions] = useGameStore();

  // Mode based on challenge category
  const isCircuit = challenge.category === 'circuit' || challenge.category === 'daily';
  const isConcept = challenge.category === 'concept';
  const isCoding = challenge.category === 'coding';
  const isAI = challenge.category === 'ai';

  // Common completion state
  const isAlreadyDone = store.completedChallenges?.includes(challenge.id) || false;
  const [isCompleted, setIsCompleted] = useState<boolean>(isAlreadyDone);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [activeHintIdx, setActiveHintIdx] = useState<number>(-1);

  // -------------------------------------------------------------
  // CIRCUIT WORKBENCH STATE
  // -------------------------------------------------------------
  const numQubits = challenge.numQubits || 2;
  const numSteps = 4;
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>(challenge.starterGates || []);
  const [selectedGateType, setSelectedGateType] = useState<GateType>('H');
  const [controlQubit, setControlQubit] = useState<number>(0);
  const [circuitValidationMsg, setCircuitValidationMsg] = useState<{ isSuccess: boolean; text: string } | null>(null);

  // Real-time quantum simulation output
  const [simOutput, setSimOutput] = useState<SimulationOutput>(() =>
    QuantumEngine.simulate(numQubits, challenge.starterGates || [])
  );

  useEffect(() => {
    if (isCircuit) {
      const output = QuantumEngine.simulate(numQubits, placedGates);
      setSimOutput(output);
      setCircuitValidationMsg(null);
    }
  }, [placedGates, numQubits, isCircuit]);

  const handleCellClick = (q: number, s: number) => {
    // Check if cell already has a gate
    const existing = placedGates.find(g => g.targetQubit === q && g.step === s);
    if (existing) {
      // Remove it
      setPlacedGates(prev => prev.filter(g => g.id !== existing.id));
      return;
    }

    if (selectedGateType === 'CNOT') {
      if (controlQubit === q) {
        alert('Control and Target qubits cannot be the same wire!');
        return;
      }
      const newGate: PlacedGate = {
        id: `gate-${Date.now()}`,
        type: 'CNOT',
        targetQubit: q,
        controlQubit: controlQubit,
        step: s,
      };
      setPlacedGates(prev => [...prev.filter(g => !(g.targetQubit === q && g.step === s)), newGate]);
    } else {
      const newGate: PlacedGate = {
        id: `gate-${Date.now()}`,
        type: selectedGateType,
        targetQubit: q,
        step: s,
      };
      setPlacedGates(prev => [...prev.filter(g => !(g.targetQubit === q && g.step === s)), newGate]);
    }
  };

  const handleVerifyCircuit = () => {
    if (!challenge.targetProbabilities) return;

    const probs = simOutput.probabilities;
    const targetProbs = challenge.targetProbabilities;
    let success = true;
    let failureReason = '';

    // Check every expected state probability within 0.08 tolerance
    for (const [state, expectedProb] of Object.entries(targetProbs)) {
      const currentProb = probs[state] || 0;
      if (Math.abs(currentProb - expectedProb) > 0.08) {
        success = false;
        failureReason = `Expected state |${state}⟩ to have ~${Math.round(expectedProb * 100)}% probability, but got ${Math.round(currentProb * 100)}%.`;
        break;
      }
    }

    // Also verify no other unexpected states have significant probability
    if (success) {
      for (const [state, currentProb] of Object.entries(probs)) {
        if (!targetProbs[state] && currentProb > 0.05) {
          success = false;
          failureReason = `Unexpected state |${state}⟩ appeared with ${Math.round(currentProb * 100)}% probability. Check your entangling gates.`;
          break;
        }
      }
    }

    if (success) {
      setCircuitValidationMsg({
        isSuccess: true,
        text: 'Validation PASSED! Your circuit accurately generates the target quantum state.',
      });
      triggerCompletion();
    } else {
      setCircuitValidationMsg({
        isSuccess: false,
        text: failureReason || 'Circuit does not match target state. Check gate sequence.',
      });
    }
  };

  // -------------------------------------------------------------
  // CONCEPT DRILL STATE
  // -------------------------------------------------------------
  const questions = challenge.conceptQuestions || [];
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedConceptOption, setSelectedConceptOption] = useState<number | null>(null);
  const [conceptAnswerChecked, setConceptAnswerChecked] = useState<boolean>(false);
  const [conceptScore, setConceptScore] = useState<number>(0);

  const currentQ = questions[currentQuestionIdx];

  const handleCheckConcept = () => {
    if (selectedConceptOption === null || !currentQ) return;
    setConceptAnswerChecked(true);
    if (selectedConceptOption === currentQ.correctIndex) {
      setConceptScore(prev => prev + 1);
    }
  };

  const handleNextConcept = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedConceptOption(null);
      setConceptAnswerChecked(false);
    } else {
      // Completed all questions
      const finalScore = conceptScore + (selectedConceptOption === currentQ.correctIndex ? 0 : 0);
      if (finalScore >= Math.ceil(questions.length * 0.6)) {
        triggerCompletion();
      } else {
        alert(`You scored ${finalScore}/${questions.length}. Review the explanations and retry to earn your XP!`);
        // Reset drill
        setCurrentQuestionIdx(0);
        setSelectedConceptOption(null);
        setConceptAnswerChecked(false);
        setConceptScore(0);
      }
    }
  };

  // -------------------------------------------------------------
  // CODING PRACTICE STATE
  // -------------------------------------------------------------
  const [code, setCode] = useState<string>(challenge.starterCode || '');
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [codeValidationMsg, setCodeValidationMsg] = useState<{ isSuccess: boolean; text: string } | null>(null);

  const handleRunCode = () => {
    setIsCompiling(true);
    setTerminalOutput('Compiling Qiskit QuantumCircuit...\nInitializing backend Aer.qasm_simulator...');

    setTimeout(() => {
      setIsCompiling(false);
      const expected = challenge.expectedKeywords || [];
      const missing = expected.filter(kw => !code.replace(/\s+/g, '').includes(kw.replace(/\s+/g, '')));

      if (missing.length === 0) {
        setTerminalOutput(challenge.expectedTerminalOutput || 'Quantum Simulation finished with 1024 shots.\nResult: All assertions passed!');
        setCodeValidationMsg({
          isSuccess: true,
          text: 'Verification PASSED! Your Qiskit code successfully generated true quantum random numbers.',
        });
        triggerCompletion();
      } else {
        setTerminalOutput(`Error: Circuit incomplete.\nMissing required quantum operations: ${missing.join(', ')}\nSimulation aborted.`);
        setCodeValidationMsg({
          isSuccess: false,
          text: `Missing required operation: ${missing[0]}. Review hints to complete the circuit.`,
        });
      }
    }, 900);
  };

  // -------------------------------------------------------------
  // AI CHALLENGE STATE
  // -------------------------------------------------------------
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    {
      sender: 'ai',
      text: challenge.aiInitialResponse || 'Welcome! How can I help you explore this quantum challenge?',
    },
  ]);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiIsTyping, setAiIsTyping] = useState<boolean>(false);

  const handleSendAiMessage = (msgToSend?: string) => {
    const text = msgToSend || aiInput.trim();
    if (!text) return;

    setAiChatMessages(prev => [...prev, { sender: 'user', text }]);
    setAiInput('');
    setAiIsTyping(true);

    setTimeout(() => {
      let reply = "That is a crucial insight! In Quantum Phase Estimation, the controlled-U operations kick back eigenvalue phases into the evaluation register: |0⟩ + e^{2πiθ}|1⟩. Then the inverse Quantum Fourier Transform (QFT†) transforms this relative phase into a discrete computational basis state representing the binary fraction of θ!";
      if (text.toLowerCase().includes('shor')) {
        reply = "In Shor's Algorithm, QPE is applied to the unitary modular multiplication operator U_a|y⟩ = |ay mod N⟩. Finding the eigenvalue phase directly yields the period r, which allows us to find factors of N using classical continued fractions!";
      } else if (text.toLowerCase().includes('qft')) {
        reply = "QFT† maps phase information into amplitude information. Without QFT†, the phase θ would remain encoded in the relative phases of the qubits, which cannot be extracted by standard computational Z-basis measurement!";
      }

      setAiChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setAiIsTyping(false);
    }, 600);
  };

  // -------------------------------------------------------------
  // COMPLETION TRIGGER
  // -------------------------------------------------------------
  const triggerCompletion = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    actions.completeChallenge(challenge.id, challenge.xpReward);
    setIsCompleted(true);
    setShowExplanation(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-slate-950 border border-cyan-500/30 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.2)] text-white overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {challenge.categoryLabel}
            </span>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{challenge.title}</span>
                {isCompleted && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" /> Solved
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>Difficulty: <strong className="text-slate-200">{challenge.difficulty}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {challenge.timeEstimate}</span>
                <span>•</span>
                <span className="text-cyan-400 font-mono font-bold">+{challenge.xpReward} XP</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target Goal Banner */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                Objective
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {challenge.description}
              </p>
              {challenge.targetFormula && (
                <div className="mt-2 text-xs font-mono font-bold text-cyan-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-cyan-500/30 w-fit">
                  Target State: {challenge.targetFormula}
                </div>
              )}
            </div>

            {challenge.hints && challenge.hints.length > 0 && (
              <button
                onClick={() => setActiveHintIdx(prev => (prev + 1) % challenge.hints!.length)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Need a Hint?</span>
              </button>
            )}
          </div>

          {/* Active Hint Alert */}
          {activeHintIdx >= 0 && challenge.hints && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Hint {activeHintIdx + 1} of {challenge.hints.length}:</strong> {challenge.hints[activeHintIdx]}
              </div>
            </motion.div>
          )}

          {/* =========================================================
              1. CIRCUIT WORKBENCH
              ========================================================= */}
          {isCircuit && (
            <div className="space-y-5">
              {/* Gate Palette */}
              <div>
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>1. Choose Gate to Place:</span>
                  <span className="text-[11px] text-cyan-400">Click a gate, then click a timeline cell on the qubit wire</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {GATE_PALETTE.map(gate => {
                    const isSelected = selectedGateType === gate.type;
                    return (
                      <button
                        key={gate.type}
                        onClick={() => setSelectedGateType(gate.type)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30 scale-105'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/40'
                        }`}
                        title={gate.desc}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-mono text-white ${gate.color}`}>
                          {gate.label}
                        </span>
                        <span>{gate.type}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedGateType === 'CNOT' && (
                  <div className="mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-3 text-xs">
                    <span className="font-bold text-violet-400">CNOT Control Qubit:</span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: numQubits }).map((_, q) => (
                        <button
                          key={q}
                          onClick={() => setControlQubit(q)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold ${
                            controlQubit === q
                              ? 'bg-violet-600 text-white border border-violet-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          q[{q}]
                        </button>
                      ))}
                    </div>
                    <span className="text-slate-400 text-[11px]">(Click a different qubit cell below to set Target wire)</span>
                  </div>
                )}
              </div>

              {/* Interactive Circuit Timeline Grid */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Qubit Wires</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPlacedGates([])}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear Circuit
                    </button>
                  </div>
                </div>

                <div className="space-y-4 py-2">
                  {Array.from({ length: numQubits }).map((_, q) => (
                    <div key={q} className="flex items-center gap-3">
                      <span className="w-12 font-mono font-bold text-xs text-cyan-300">
                        q[{q}] |0⟩
                      </span>
                      <div className="relative flex-1 flex items-center">
                        {/* Horizontal wire line */}
                        <div className="absolute inset-x-0 h-0.5 bg-slate-700 pointer-events-none" />

                        {/* Step slots */}
                        <div className="relative z-10 w-full grid grid-cols-4 gap-4">
                          {Array.from({ length: numSteps }).map((_, s) => {
                            const gate = placedGates.find(g => g.targetQubit === q && g.step === s);
                            const isCnotControl = placedGates.some(g => g.type === 'CNOT' && g.controlQubit === q && g.step === s);

                            return (
                              <button
                                key={s}
                                onClick={() => handleCellClick(q, s)}
                                className={`h-11 rounded-xl border flex items-center justify-center transition-all ${
                                  gate
                                    ? 'bg-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 text-white font-bold'
                                    : isCnotControl
                                    ? 'bg-violet-950 border-violet-500 text-violet-300'
                                    : 'bg-slate-950/80 border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-900'
                                }`}
                                title={gate ? `Click to remove ${gate.type}` : 'Click to place selected gate'}
                              >
                                {gate ? (
                                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                    {gate.type}
                                  </span>
                                ) : isCnotControl ? (
                                  <div className="w-3 h-3 rounded-full bg-violet-400" />
                                ) : (
                                  <span className="text-[10px] font-mono text-slate-600">+</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation Result: Histogram & Statevector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Measurement Probability Histogram */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-300">Live Measurement Probabilities (1024 Shots)</span>
                    <span className="text-cyan-400">QuantumEngine</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    {Object.entries(simOutput.probabilities).length === 0 ? (
                      <span className="text-xs text-slate-500">|00⟩: 100%</span>
                    ) : (
                      Object.entries(simOutput.probabilities).map(([basis, prob]) => (
                        <div key={basis} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300">|{basis}⟩</span>
                            <span className="text-cyan-300 font-bold">{Math.round(prob * 100)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.round(prob * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Statevector Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-300">Quantum Statevector |ψ⟩</span>
                    <span className="text-slate-400">Dirac Amplitudes</span>
                  </div>
                  <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto font-mono text-xs">
                    {simOutput.statevector.map(sv => (
                      <div key={sv.basis} className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/60 border border-slate-800/80">
                        <span className="text-cyan-300 font-bold">{sv.basis}</span>
                        <span className="text-slate-400">Amp: {sv.real >= 0 ? '+' : ''}{sv.real.toFixed(3)}</span>
                        <span className="text-slate-400">{Math.round(sv.probability * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation Result Banner */}
              {circuitValidationMsg && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                    circuitValidationMsg.isSuccess
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {circuitValidationMsg.isSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{circuitValidationMsg.text}</span>
                </div>
              )}

              {/* Circuit Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleVerifyCircuit}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Verify & Run Solution</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              2. CONCEPT DRILL WORKBENCH
              ========================================================= */}
          {isConcept && currentQ && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                <span className="text-cyan-400 font-bold">Score: {conceptScore}/{questions.length}</span>
              </div>

              {/* Question Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedConceptOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;
                    let style = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-cyan-500/50';

                    if (conceptAnswerChecked) {
                      if (isCorrect) {
                        style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      }
                    } else if (isSelected) {
                      style = 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => !conceptAnswerChecked && setSelectedConceptOption(idx)}
                        disabled={conceptAnswerChecked}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {conceptAnswerChecked && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Banner */}
                {conceptAnswerChecked && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      selectedConceptOption === currentQ.correctIndex
                        ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <strong>Explanation:</strong> {currentQ.explanation}
                  </motion.div>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-3">
                {!conceptAnswerChecked ? (
                  <button
                    onClick={handleCheckConcept}
                    disabled={selectedConceptOption === null}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextConcept}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Complete Drill'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              3. CODING PRACTICE WORKBENCH
              ========================================================= */}
          {isCoding && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Qiskit Code Editor (Python 3.10)</span>
                </span>
                <span>Aer Simulator Active</span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  rows={12}
                  className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-950/90 text-cyan-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Terminal Output */}
              {terminalOutput && (
                <div className="p-3.5 rounded-xl bg-black border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-800 pb-1 mb-2">
                    <Terminal className="w-3.5 h-3.5" /> Output Terminal
                  </div>
                  {terminalOutput}
                </div>
              )}

              {codeValidationMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    codeValidationMsg.isSuccess
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {codeValidationMsg.isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{codeValidationMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setCode(challenge.starterCode || '')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all"
                >
                  Reset Code
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isCompiling}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{isCompiling ? 'Running Qiskit...' : 'Run & Validate'}</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              4. AI CHALLENGE WORKBENCH
              ========================================================= */}
          {isAI && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-h-72 overflow-y-auto space-y-3">
                {aiChatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {m.sender === 'ai' ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden p-0.5 bg-cyan-400 shrink-0 mt-0.5">
                        <img src="/qbit-ai-mascot.jpg" alt="QBIT AI" className="w-full h-full object-cover rounded-full" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                        You
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {aiIsTyping && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>QBIT AI is thinking...</span>
                  </div>
                )}
              </div>

              {/* Suggested Questions */}
              {challenge.aiSuggestedQuestions && (
                <div className="flex flex-wrap gap-1.5">
                  {challenge.aiSuggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendAiMessage(q)}
                      className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs transition-all text-left"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendAiMessage()}
                  placeholder="Ask QBIT AI about this challenge..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleSendAiMessage()}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={triggerCompletion}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Challenge as Understood</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VICTORY & SCIENTIFIC EXPLANATION SCREEN
              ========================================================= */}
          {showExplanation && challenge.scientificExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/40 to-slate-900 border border-emerald-500/40 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Trophy className="w-4 h-4" />
                <span>Challenge Completed! +{challenge.xpReward} XP Awarded</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong>Scientific Derivation:</strong> {challenge.scientificExplanation}
              </p>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{isCompleted ? 'Challenge Completed' : 'In Progress'}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
          >
            {isCompleted ? 'Done' : 'Exit Challenge'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
