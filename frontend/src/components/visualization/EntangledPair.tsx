import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QuantumParticle } from './QuantumParticle';
import { Sparkles, RefreshCw } from 'lucide-react';

export const EntangledPair: React.FC = () => {
  const [isMeasured, setIsMeasured] = useState<boolean>(false);
  const [measuredOutcome, setMeasuredOutcome] = useState<'00' | '11' | null>(null);

  const handleMeasure = () => {
    // In Bell State |Phi+>, 50% 00, 50% 11
    const outcome = Math.random() > 0.5 ? '00' : '11';
    setMeasuredOutcome(outcome);
    setIsMeasured(true);
  };

  const handleReset = () => {
    setIsMeasured(false);
    setMeasuredOutcome(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-lg">
      <div className="flex items-center justify-between w-full max-w-sm mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          Bell State: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
        </span>
        <button
          onClick={handleReset}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Reset state"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Entangled System Visualizer */}
      <div className="relative flex items-center justify-between w-full max-w-md py-6 px-4">
        {/* Qubit A */}
        <div className="flex flex-col items-center">
          <QuantumParticle
            size="sm"
            stateLabel={isMeasured ? (measuredOutcome === '00' ? '|0⟩' : '|1⟩') : '|ψA⟩'}
            isSuperposition={!isMeasured}
          />
          <span className="mt-2 text-xs font-bold text-slate-700 font-mono">Qubit A (q0)</span>
          <span className="text-[11px] text-slate-500">
            {isMeasured ? `Measured: ${measuredOutcome?.[0]}` : 'Entangled'}
          </span>
        </div>

        {/* Quantum Entanglement Wave Bridge */}
        <div className="flex-1 mx-4 relative flex items-center justify-center">
          {/* Connecting line */}
          <div className="w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 rounded-full opacity-60" />

          {/* Animated photons traveling between qubits */}
          {!isMeasured && (
            <>
              <motion.div
                animate={{ x: [-60, 60], opacity: [0, 1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00F0FF]"
              />
              <motion.div
                animate={{ x: [60, -60], opacity: [0, 1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
                className="absolute w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_#A855F7]"
              />
            </>
          )}

          {/* Entanglement correlation badge */}
          <div className="absolute -top-3 bg-white/95 px-2 py-0.5 rounded-full border border-purple-200 text-[10px] font-mono text-purple-700 shadow-sm whitespace-nowrap">
            {isMeasured ? 'Collapsed Correlation' : 'Quantum Channel'}
          </div>
        </div>

        {/* Qubit B */}
        <div className="flex flex-col items-center">
          <QuantumParticle
            size="sm"
            stateLabel={isMeasured ? (measuredOutcome === '00' ? '|0⟩' : '|1⟩') : '|ψB⟩'}
            isSuperposition={!isMeasured}
          />
          <span className="mt-2 text-xs font-bold text-slate-700 font-mono">Qubit B (q1)</span>
          <span className="text-[11px] text-slate-500">
            {isMeasured ? `Instant Collapse: ${measuredOutcome?.[1]}` : 'Entangled'}
          </span>
        </div>
      </div>

      {/* Interactive Trigger */}
      <div className="mt-4 flex flex-col items-center gap-2">
        {!isMeasured ? (
          <button
            onClick={handleMeasure}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm shadow-md hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Measure Qubit A (Observe Instant Correlation)
          </button>
        ) : (
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-2">
              Measuring Qubit A as <strong className="text-indigo-600 font-mono">|{measuredOutcome?.[0]}⟩</strong> instantaneously forced Qubit B into <strong className="text-indigo-600 font-mono">|{measuredOutcome?.[1]}⟩</strong> with zero communication delay!
            </p>
            <button
              onClick={handleReset}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              Reset to Entangled Superposition
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
