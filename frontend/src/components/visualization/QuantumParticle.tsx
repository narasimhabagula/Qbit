import React from 'react';
import { motion } from 'framer-motion';

interface QuantumParticleProps {
  stateLabel?: string;
  isSuperposition?: boolean;
  phaseAngle?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantumParticle: React.FC<QuantumParticleProps> = ({
  stateLabel = '|0⟩',
  isSuperposition = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { container: 'w-24 h-24', core: 'w-10 h-10', ring1: 'w-20 h-20', ring2: 'w-24 h-24' },
    md: { container: 'w-36 h-36', core: 'w-14 h-14', ring1: 'w-28 h-28', ring2: 'w-36 h-36' },
    lg: { container: 'w-52 h-52', core: 'w-20 h-20', ring1: 'w-40 h-40', ring2: 'w-52 h-52' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative ${currentSize.container} flex items-center justify-center select-none`}>
      {/* Outer orbital ring 1 */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className={`absolute ${currentSize.ring2} rounded-full border-2 border-dashed border-indigo-400/40`}
      />

      {/* Outer orbital ring 2 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className={`absolute ${currentSize.ring1} rounded-full border border-cyan-400/50`}
        style={{ transform: 'rotateX(65deg)' }}
      />

      {/* Orbiting electron / photon packet */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: isSuperposition ? 3 : 6, repeat: Infinity, ease: 'linear' }}
        className={`absolute ${currentSize.ring1}`}
      >
        <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#00F0FF] absolute top-0 left-1/2 -translate-x-1/2" />
      </motion.div>

      {/* Quantum Core / Wavefunction Packet */}
      <motion.div
        animate={
          isSuperposition
            ? {
                scale: [1, 1.15, 0.95, 1],
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)',
                  '0 0 35px rgba(168, 85, 247, 0.8), 0 0 60px rgba(99, 102, 241, 0.5)',
                  '0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)',
                ],
              }
            : {
                scale: [1, 1.05, 1],
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }
        }
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`${currentSize.core} rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-cyan-400 flex items-center justify-center text-white font-mono font-bold text-xs sm:text-sm shadow-xl z-10 cursor-pointer`}
      >
        <span className="drop-shadow-md">{stateLabel}</span>
      </motion.div>

      {/* Probability haze */}
      {isSuperposition && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-xl pointer-events-none"
        />
      )}
    </div>
  );
};
