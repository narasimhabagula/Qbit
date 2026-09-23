export interface PracticeChallenge {
  id: string;
  title: string;
  category: 'daily' | 'concept' | 'circuit' | 'coding' | 'ai';
  categoryLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  timeEstimate: string;
  description: string;
  badgeReward?: string;
  targetState?: string;
}

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  {
    id: 'daily-bell-state',
    title: 'Build a Bell State',
    category: 'daily',
    categoryLabel: '🎯 Daily Challenge',
    difficulty: 'Intermediate',
    xpReward: 50,
    timeEstimate: '3 mins',
    description: 'Entangle two qubits (q0 and q1) into the maximally entangled state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 using Hadamard and CNOT.',
    badgeReward: 'Entanglement Explorer Progress',
    targetState: 'bell_state',
  },
  {
    id: 'concept-pauli-x',
    title: 'Bit Flip Mastery',
    category: 'concept',
    categoryLabel: '🧠 Concept Drill',
    difficulty: 'Beginner',
    xpReward: 20,
    timeEstimate: '2 mins',
    description: 'Test your understanding of the Pauli-X gate as a quantum NOT operator and its action on the Bloch sphere.',
  },
  {
    id: 'circuit-superposition-3q',
    title: 'GHZ State Synthesis',
    category: 'circuit',
    categoryLabel: '⚛️ Circuit Practice',
    difficulty: 'Advanced',
    xpReward: 40,
    timeEstimate: '5 mins',
    description: 'Construct a Greenberger-Horne-Zeilinger 3-qubit state: (|000⟩ + |111⟩)/√2 by cascading CNOT gates.',
    targetState: 'ghz_state',
  },
  {
    id: 'coding-qiskit-rng',
    title: 'True Quantum RNG',
    category: 'coding',
    categoryLabel: '💻 Coding Practice',
    difficulty: 'Beginner',
    xpReward: 30,
    timeEstimate: '4 mins',
    description: 'Write a Qiskit script that generates true quantum random numbers using superposition and measurement.',
  },
  {
    id: 'ai-phase-estimation',
    title: 'Quantum Phase Estimation',
    category: 'ai',
    categoryLabel: '🤖 AI Challenge',
    difficulty: 'Advanced',
    xpReward: 50,
    timeEstimate: '6 mins',
    description: 'Work with QBIT AI to identify the eigenvalue phase of a unitary operator using inverse QFT.',
  },
];
