export type GateType = 
  | 'H' 
  | 'X' 
  | 'Y' 
  | 'Z' 
  | 'S' 
  | 'T' 
  | 'CNOT' 
  | 'CZ' 
  | 'SWAP' 
  | 'MEASURE';

export interface GateDefinition {
  type: GateType;
  name: string;
  symbol: string;
  description: string;
  color: string;
  matrixDisplay: string;
  category: 'single' | 'phase' | 'multi' | 'measure';
  qubitCount: number;
}

export interface PlacedGate {
  id: string;
  type: GateType;
  targetQubit: number;
  controlQubit?: number; // for CNOT / CZ
  targetQubit2?: number; // for SWAP
  step: number; // time column 0, 1, 2, ...
}

export interface StateVectorEntry {
  basis: string; // e.g. "|00⟩"
  real: number;
  imag: number;
  magnitude: number;
  phase: number; // in radians
  probability: number; // 0.0 to 1.0
}

export interface BlochCoords {
  x: number;
  y: number;
  z: number;
  theta: number; // 0 to pi
  phi: number;   // 0 to 2pi
}

export interface SimulationOutput {
  statevector: StateVectorEntry[];
  probabilities: Record<string, number>;
  measurements: Record<string, number>;
  blochCoords: BlochCoords[];
  circuitDepth: number;
  gateCount: number;
}

export interface CircuitPreset {
  id: string;
  name: string;
  description: string;
  numQubits: number;
  gates: PlacedGate[];
  expectedState: string;
}
