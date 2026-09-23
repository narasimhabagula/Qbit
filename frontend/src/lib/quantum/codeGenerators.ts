import { PlacedGate } from '../../types/quantum';

export class CodeGenerator {
  public static toQiskit(numQubits: number, gates: PlacedGate[]): string {
    const sorted = [...gates].sort((a, b) => a.step - b.step);
    let code = `from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\n\n# Initialize circuit with ${numQubits} qubits and classical registers\nqc = QuantumCircuit(${numQubits}, ${numQubits})\n\n`;

    for (const g of sorted) {
      switch (g.type) {
        case 'H':
          code += `qc.h(${g.targetQubit})\n`;
          break;
        case 'X':
          code += `qc.x(${g.targetQubit})\n`;
          break;
        case 'Y':
          code += `qc.y(${g.targetQubit})\n`;
          break;
        case 'Z':
          code += `qc.z(${g.targetQubit})\n`;
          break;
        case 'S':
          code += `qc.s(${g.targetQubit})\n`;
          break;
        case 'T':
          code += `qc.t(${g.targetQubit})\n`;
          break;
        case 'CNOT':
          if (g.controlQubit !== undefined) {
            code += `qc.cx(${g.controlQubit}, ${g.targetQubit})\n`;
          }
          break;
        case 'CZ':
          if (g.controlQubit !== undefined) {
            code += `qc.cz(${g.controlQubit}, ${g.targetQubit})\n`;
          }
          break;
        case 'SWAP':
          if (g.targetQubit2 !== undefined) {
            code += `qc.swap(${g.targetQubit}, ${g.targetQubit2})\n`;
          }
          break;
        case 'MEASURE':
          code += `qc.measure(${g.targetQubit}, ${g.targetQubit})\n`;
          break;
      }
    }

    code += `\n# Simulate using AerSimulator\nsim = AerSimulator()\ncompiled_circuit = transpile(qc, sim)\njob = sim.run(compiled_circuit, shots=1024)\nresult = job.result()\ncounts = result.get_counts(qc)\nprint("Measurement Counts:", counts)\n`;
    return code;
  }

  public static toCirq(numQubits: number, gates: PlacedGate[]): string {
    const sorted = [...gates].sort((a, b) => a.step - b.step);
    let code = `import cirq\n\n# Create qubits\nqubits = cirq.LineQubit.range(${numQubits})\ncircuit = cirq.Circuit()\n\n`;

    for (const g of sorted) {
      switch (g.type) {
        case 'H':
          code += `circuit.append(cirq.H(qubits[${g.targetQubit}]))\n`;
          break;
        case 'X':
          code += `circuit.append(cirq.X(qubits[${g.targetQubit}]))\n`;
          break;
        case 'Y':
          code += `circuit.append(cirq.Y(qubits[${g.targetQubit}]))\n`;
          break;
        case 'Z':
          code += `circuit.append(cirq.Z(qubits[${g.targetQubit}]))\n`;
          break;
        case 'S':
          code += `circuit.append(cirq.S(qubits[${g.targetQubit}]))\n`;
          break;
        case 'T':
          code += `circuit.append(cirq.T(qubits[${g.targetQubit}]))\n`;
          break;
        case 'CNOT':
          if (g.controlQubit !== undefined) {
            code += `circuit.append(cirq.CNOT(qubits[${g.controlQubit}], qubits[${g.targetQubit}]))\n`;
          }
          break;
        case 'CZ':
          if (g.controlQubit !== undefined) {
            code += `circuit.append(cirq.CZ(qubits[${g.controlQubit}], qubits[${g.targetQubit}]))\n`;
          }
          break;
        case 'SWAP':
          if (g.targetQubit2 !== undefined) {
            code += `circuit.append(cirq.SWAP(qubits[${g.targetQubit}], qubits[${g.targetQubit2}]))\n`;
          }
          break;
        case 'MEASURE':
          code += `circuit.append(cirq.measure(qubits[${g.targetQubit}], key='m${g.targetQubit}'))\n`;
          break;
      }
    }

    code += `\n# Run simulation\nsimulator = cirq.Simulator()\nresult = simulator.run(circuit, repetitions=1024)\nprint(result)\n`;
    return code;
  }

  public static toPennyLane(numQubits: number, gates: PlacedGate[]): string {
    const sorted = [...gates].sort((a, b) => a.step - b.step);
    let code = `import pennylane as qml\nfrom pennylane import numpy as np\n\ndev = qml.device("default.qubit", wires=${numQubits})\n\n@qml.qnode(dev)\ndef quantum_circuit():\n`;

    for (const g of sorted) {
      switch (g.type) {
        case 'H':
          code += `    qml.Hadamard(wires=${g.targetQubit})\n`;
          break;
        case 'X':
          code += `    qml.PauliX(wires=${g.targetQubit})\n`;
          break;
        case 'Y':
          code += `    qml.PauliY(wires=${g.targetQubit})\n`;
          break;
        case 'Z':
          code += `    qml.PauliZ(wires=${g.targetQubit})\n`;
          break;
        case 'S':
          code += `    qml.S(wires=${g.targetQubit})\n`;
          break;
        case 'T':
          code += `    qml.T(wires=${g.targetQubit})\n`;
          break;
        case 'CNOT':
          if (g.controlQubit !== undefined) {
            code += `    qml.CNOT(wires=[${g.controlQubit}, ${g.targetQubit}])\n`;
          }
          break;
        case 'CZ':
          if (g.controlQubit !== undefined) {
            code += `    qml.CZ(wires=[${g.controlQubit}, ${g.targetQubit}])\n`;
          }
          break;
        case 'SWAP':
          if (g.targetQubit2 !== undefined) {
            code += `    qml.SWAP(wires=[${g.targetQubit}, ${g.targetQubit2}])\n`;
          }
          break;
      }
    }

    code += `    return qml.probs(wires=range(${numQubits}))\n\nprint("Probabilities:", quantum_circuit())\n`;
    return code;
  }

  public static toOpenQASM(numQubits: number, gates: PlacedGate[]): string {
    const sorted = [...gates].sort((a, b) => a.step - b.step);
    let code = `OPENQASM 2.0;\ninclude "qelib1.inc";\n\nqreg q[${numQubits}];\ncreg c[${numQubits}];\n\n`;

    for (const g of sorted) {
      switch (g.type) {
        case 'H':
          code += `h q[${g.targetQubit}];\n`;
          break;
        case 'X':
          code += `x q[${g.targetQubit}];\n`;
          break;
        case 'Y':
          code += `y q[${g.targetQubit}];\n`;
          break;
        case 'Z':
          code += `z q[${g.targetQubit}];\n`;
          break;
        case 'S':
          code += `s q[${g.targetQubit}];\n`;
          break;
        case 'T':
          code += `t q[${g.targetQubit}];\n`;
          break;
        case 'CNOT':
          if (g.controlQubit !== undefined) {
            code += `cx q[${g.controlQubit}], q[${g.targetQubit}];\n`;
          }
          break;
        case 'CZ':
          if (g.controlQubit !== undefined) {
            code += `cz q[${g.controlQubit}], q[${g.targetQubit}];\n`;
          }
          break;
        case 'SWAP':
          if (g.targetQubit2 !== undefined) {
            code += `swap q[${g.targetQubit}], q[${g.targetQubit2}];\n`;
          }
          break;
        case 'MEASURE':
          code += `measure q[${g.targetQubit}] -> c[${g.targetQubit}];\n`;
          break;
      }
    }
    return code;
  }
}
