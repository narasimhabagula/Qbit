import { GateType, PlacedGate, SimulationOutput, StateVectorEntry, BlochCoords } from '../../types/quantum';

interface Complex {
  r: number;
  i: number;
}

const cAdd = (a: Complex, b: Complex): Complex => ({ r: a.r + b.r, i: a.i + b.i });
const cSub = (a: Complex, b: Complex): Complex => ({ r: a.r - b.r, i: a.i - b.i });
const cMul = (a: Complex, b: Complex): Complex => ({
  r: a.r * b.r - a.i * b.i,
  i: a.r * b.i + a.i * b.r,
});
const cMag = (a: Complex): number => Math.sqrt(a.r * a.r + a.i * a.i);
const cMagSq = (a: Complex): number => a.r * a.r + a.i * a.i;
const cPhase = (a: Complex): number => Math.atan2(a.i, a.r);

type Matrix2x2 = [[Complex, Complex], [Complex, Complex]];

const SQRT1_2 = 1 / Math.SQRT2;

const GATES_1Q: Record<string, Matrix2x2> = {
  I: [
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
    [{ r: 0, i: 0 }, { r: 1, i: 0 }],
  ],
  X: [
    [{ r: 0, i: 0 }, { r: 1, i: 0 }],
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
  ],
  Y: [
    [{ r: 0, i: 0 }, { r: 0, i: -1 }],
    [{ r: 0, i: 1 }, { r: 0, i: 0 }],
  ],
  Z: [
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
    [{ r: 0, i: 0 }, { r: -1, i: 0 }],
  ],
  H: [
    [{ r: SQRT1_2, i: 0 }, { r: SQRT1_2, i: 0 }],
    [{ r: SQRT1_2, i: 0 }, { r: -SQRT1_2, i: 0 }],
  ],
  S: [
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
    [{ r: 0, i: 0 }, { r: 0, i: 1 }],
  ],
  T: [
    [{ r: 1, i: 0 }, { r: 0, i: 0 }],
    [{ r: 0, i: 0 }, { r: SQRT1_2, i: SQRT1_2 }],
  ],
};

export class QuantumEngine {
  public static simulate(numQubits: number, gates: PlacedGate[], shots: number = 1024): SimulationOutput {
    const dim = 1 << numQubits;
    let state: Complex[] = new Array(dim).fill(0).map((_, idx) => (idx === 0 ? { r: 1, i: 0 } : { r: 0, i: 0 }));

    // Sort gates chronologically by time step
    const sortedGates = [...gates].sort((a, b) => a.step - b.step);

    for (const gate of sortedGates) {
      if (gate.type === 'MEASURE') continue;

      if (['H', 'X', 'Y', 'Z', 'S', 'T'].includes(gate.type)) {
        state = this.apply1QGate(state, GATES_1Q[gate.type], gate.targetQubit, numQubits);
      } else if (gate.type === 'CNOT' && gate.controlQubit !== undefined) {
        state = this.applyCNOT(state, gate.controlQubit, gate.targetQubit, numQubits);
      } else if (gate.type === 'CZ' && gate.controlQubit !== undefined) {
        state = this.applyCZ(state, gate.controlQubit, gate.targetQubit, numQubits);
      } else if (gate.type === 'SWAP' && gate.targetQubit2 !== undefined) {
        state = this.applySWAP(state, gate.targetQubit, gate.targetQubit2, numQubits);
      }
    }

    // Probabilities
    const probabilities: Record<string, number> = {};
    const statevector: StateVectorEntry[] = [];

    for (let i = 0; i < dim; i++) {
      const bitstring = i.toString(2).padStart(numQubits, '0');
      const amp = state[i];
      const prob = cMagSq(amp);
      
      if (prob > 0.0001) {
        probabilities[bitstring] = Math.round(prob * 1000) / 1000;
      }

      statevector.push({
        basis: `|${bitstring}⟩`,
        real: Math.round(amp.r * 1000) / 1000,
        imag: Math.round(amp.i * 1000) / 1000,
        magnitude: Math.round(cMag(amp) * 1000) / 1000,
        phase: Math.round(cPhase(amp) * 100) / 100,
        probability: Math.round(prob * 1000) / 1000,
      });
    }

    // Shot sampling
    const measurements: Record<string, number> = {};
    for (let s = 0; s < shots; s++) {
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < dim; i++) {
        cumulative += cMagSq(state[i]);
        if (rand <= cumulative || i === dim - 1) {
          const bitstring = i.toString(2).padStart(numQubits, '0');
          measurements[bitstring] = (measurements[bitstring] || 0) + 1;
          break;
        }
      }
    }

    // Single-qubit Bloch Sphere representations
    const blochCoords: BlochCoords[] = [];
    for (let q = 0; q < numQubits; q++) {
      blochCoords.push(this.computeBlochCoords(state, q, numQubits));
    }

    const uniqueSteps = new Set(sortedGates.map(g => g.step)).size;

    return {
      statevector,
      probabilities,
      measurements,
      blochCoords,
      circuitDepth: uniqueSteps,
      gateCount: sortedGates.length,
    };
  }

  private static apply1QGate(state: Complex[], gate: Matrix2x2, target: number, numQubits: number): Complex[] {
    const dim = 1 << numQubits;
    const newState: Complex[] = new Array(dim);
    const targetBitMask = 1 << (numQubits - 1 - target);

    for (let i = 0; i < dim; i++) {
      if ((i & targetBitMask) === 0) {
        const i0 = i;
        const i1 = i | targetBitMask;

        const v0 = state[i0];
        const v1 = state[i1];

        newState[i0] = cAdd(cMul(gate[0][0], v0), cMul(gate[0][1], v1));
        newState[i1] = cAdd(cMul(gate[1][0], v0), cMul(gate[1][1], v1));
      }
    }
    return newState;
  }

  private static applyCNOT(state: Complex[], control: number, target: number, numQubits: number): Complex[] {
    const dim = 1 << numQubits;
    const newState: Complex[] = [...state];
    const ctrlMask = 1 << (numQubits - 1 - control);
    const targetMask = 1 << (numQubits - 1 - target);

    for (let i = 0; i < dim; i++) {
      if ((i & ctrlMask) !== 0) {
        // Control bit is 1: swap basis amplitude with flipped target
        const flipped = i ^ targetMask;
        if (i < flipped) {
          const temp = newState[i];
          newState[i] = newState[flipped];
          newState[flipped] = temp;
        }
      }
    }
    return newState;
  }

  private static applyCZ(state: Complex[], control: number, target: number, numQubits: number): Complex[] {
    const dim = 1 << numQubits;
    const newState: Complex[] = [...state];
    const ctrlMask = 1 << (numQubits - 1 - control);
    const targetMask = 1 << (numQubits - 1 - target);

    for (let i = 0; i < dim; i++) {
      if ((i & ctrlMask) !== 0 && (i & targetMask) !== 0) {
        // Both control and target are 1: flip phase
        newState[i] = { r: -newState[i].r, i: -newState[i].i };
      }
    }
    return newState;
  }

  private static applySWAP(state: Complex[], q1: number, q2: number, numQubits: number): Complex[] {
    const dim = 1 << numQubits;
    const newState: Complex[] = [...state];
    const mask1 = 1 << (numQubits - 1 - q1);
    const mask2 = 1 << (numQubits - 1 - q2);

    for (let i = 0; i < dim; i++) {
      const bit1 = (i & mask1) !== 0 ? 1 : 0;
      const bit2 = (i & mask2) !== 0 ? 1 : 0;

      if (bit1 !== bit2) {
        const swapped = (i ^ mask1) ^ mask2;
        if (i < swapped) {
          const temp = newState[i];
          newState[i] = newState[swapped];
          newState[swapped] = temp;
        }
      }
    }
    return newState;
  }

  private static computeBlochCoords(state: Complex[], target: number, numQubits: number): BlochCoords {
    const dim = 1 << numQubits;
    const targetMask = 1 << (numQubits - 1 - target);

    // Reduced density matrix rho_single = [[rho00, rho01], [rho10, rho11]]
    let rho00 = 0;
    let rho11 = 0;
    let rho01: Complex = { r: 0, i: 0 };

    for (let i = 0; i < dim; i++) {
      const bit = (i & targetMask) !== 0 ? 1 : 0;
      const ampI = state[i];

      if (bit === 0) {
        rho00 += cMagSq(ampI);
        const partner = i | targetMask;
        const ampPartner = state[partner];
        // rho01 = amp(0) * conj(amp(1))
        rho01 = cAdd(rho01, {
          r: ampI.r * ampPartner.r + ampI.i * ampPartner.i,
          i: ampI.i * ampPartner.r - ampI.r * ampPartner.i,
        });
      } else {
        rho11 += cMagSq(ampI);
      }
    }

    const x = Math.min(1, Math.max(-1, 2 * rho01.r));
    const y = Math.min(1, Math.max(-1, 2 * rho01.i));
    const z = Math.min(1, Math.max(-1, rho00 - rho11));

    const r = Math.sqrt(x * x + y * y + z * z);
    const theta = r > 1e-4 ? Math.acos(Math.min(1, Math.max(-1, z / r))) : 0;
    const phi = Math.abs(x) > 1e-4 || Math.abs(y) > 1e-4 ? Math.atan2(y, x) : 0;

    return {
      x: Math.round(x * 1000) / 1000,
      y: Math.round(y * 1000) / 1000,
      z: Math.round(z * 1000) / 1000,
      theta: Math.round(theta * 100) / 100,
      phi: Math.round(phi * 100) / 100,
    };
  }
}
