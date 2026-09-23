"""
QBIT - AI-Powered Interactive Quantum Computing Platform
Backend Engine (FastAPI)
"""

import math
import cmath
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np

app = FastAPI(
    title="QBIT Quantum Simulation & AI Engine",
    description="Backend API for QBIT - Quantum Computing Platform",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gate Matrix Definitions (2x2 complex matrices)
GATES_1Q = {
    "I": np.array([[1, 0], [0, 1]], dtype=complex),
    "X": np.array([[0, 1], [1, 0]], dtype=complex),
    "Y": np.array([[0, -1j], [1j, 0]], dtype=complex),
    "Z": np.array([[1, 0], [0, -1]], dtype=complex),
    "H": (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex),
    "S": np.array([[1, 0], [0, 1j]], dtype=complex),
    "T": np.array([[1, 0], [0, cmath.exp(1j * np.pi / 4)]], dtype=complex),
}

# Request / Response Models
class GateOp(BaseModel):
    name: str
    target: int
    control: Optional[int] = None
    step: int = 0
    params: Optional[Dict[str, float]] = None

class CircuitSimulationRequest(BaseModel):
    num_qubits: int = Field(default=2, ge=1, le=8)
    gates: List[GateOp]
    shots: int = Field(default=1024, ge=1, le=8192)

class SimulationResult(BaseModel):
    statevector: List[Dict[str, Any]]
    probabilities: Dict[str, float]
    measurements: Dict[str, int]
    bloch_vectors: List[Dict[str, float]]
    circuit_depth: int
    gate_count: int

class TutorChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    current_lesson: Optional[str] = None
    recent_mistakes: Optional[List[str]] = None

class TutorChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str]
    quantum_tip: Optional[str] = None

class VerifyCircuitRequest(BaseModel):
    target_state: str  # e.g., "bell_state", "ghz", "superposition"
    num_qubits: int
    gates: List[GateOp]

class CodeRunRequest(BaseModel):
    framework: str  # "qiskit", "cirq", "pennylane"
    code: str

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "QBIT Quantum Engine",
        "platform": "QBIT Quantum Computing Platform",
        "supported_frameworks": ["Qiskit", "Cirq", "PennyLane", "OpenQASM"],
        "max_simulated_qubits": 8
    }

def apply_1q_gate(state: np.ndarray, gate_mat: np.ndarray, target: int, num_qubits: int) -> np.ndarray:
    """Applies a 1-qubit gate to the target qubit in an n-qubit statevector."""
    # Build tensor product: I x ... x Gate x ... x I
    ops = []
    for i in range(num_qubits):
        if i == target:
            ops.append(gate_mat)
        else:
            ops.append(GATES_1Q["I"])
    
    full_mat = ops[0]
    for op in ops[1:]:
        full_mat = np.kron(full_mat, op)
    
    return np.dot(full_mat, state)

def apply_cx_gate(state: np.ndarray, control: int, target: int, num_qubits: int) -> np.ndarray:
    """Applies a Controlled-X (CNOT) gate between control and target qubits."""
    dim = 2 ** num_qubits
    full_mat = np.zeros((dim, dim), dtype=complex)
    
    for basis in range(dim):
        # Check if control bit is 1
        # In our convention qubit 0 is most significant or least significant
        ctrl_val = (basis >> (num_qubits - 1 - control)) & 1
        if ctrl_val == 1:
            # Flip target bit
            flipped_basis = basis ^ (1 << (num_qubits - 1 - target))
            full_mat[flipped_basis, basis] = 1.0
        else:
            full_mat[basis, basis] = 1.0
            
    return np.dot(full_mat, state)

def compute_single_qubit_bloch(state: np.ndarray, target: int, num_qubits: int) -> Dict[str, float]:
    """Computes the reduced density matrix and Bloch coordinates (x, y, z) for target qubit."""
    # Tracing out all other qubits
    dim = 2 ** num_qubits
    rho_single = np.zeros((2, 2), dtype=complex)
    
    for i in range(dim):
        bit_i = (i >> (num_qubits - 1 - target)) & 1
        amp_i = state[i]
        for j in range(dim):
            bit_j = (j >> (num_qubits - 1 - target)) & 1
            # Check if all other qubits match
            mask = ~(1 << (num_qubits - 1 - target)) & (dim - 1)
            if (i & mask) == (j & mask):
                rho_single[bit_i, bit_j] += amp_i * np.conj(state[j])
                
    # Bloch vector components: x = 2*Re(rho01), y = 2*Im(rho10), z = rho00 - rho11
    x = float(2.0 * np.real(rho_single[0, 1]))
    y = float(2.0 * np.imag(rho_single[1, 0]))
    z = float(np.real(rho_single[0, 0] - rho_single[1, 1]))
    
    # Spherical coordinates theta, phi
    r = math.sqrt(x*x + y*y + z*z)
    theta = math.acos(max(-1.0, min(1.0, z / r))) if r > 1e-6 else 0.0
    phi = math.atan2(y, x) if (x*x + y*y) > 1e-6 else 0.0
    
    return {"x": round(x, 4), "y": round(y, 4), "z": round(z, 4), "theta": round(theta, 4), "phi": round(phi, 4)}

@app.post("/api/simulate", response_model=SimulationResult)
def simulate_circuit(req: CircuitSimulationRequest):
    num_qubits = req.num_qubits
    dim = 2 ** num_qubits
    
    # Initialize state |00...0>
    state = np.zeros(dim, dtype=complex)
    state[0] = 1.0
    
    # Sort gates by step
    sorted_gates = sorted(req.gates, key=lambda g: g.step)
    
    for gate in sorted_gates:
        name = gate.name.upper()
        if name in GATES_1Q:
            state = apply_1q_gate(state, GATES_1Q[name], gate.target, num_qubits)
        elif name in ["CNOT", "CX"] and gate.control is not None:
            state = apply_cx_gate(state, gate.control, gate.target, num_qubits)
        elif name == "MEASURE":
            # Measurement does not alter statevector in pure unitaries for simulation view
            pass
            
    # Compute probabilities
    probs = {}
    for i in range(dim):
        bitstring = format(i, f"0{num_qubits}b")
        prob = float(np.abs(state[i]) ** 2)
        if prob > 1e-5:
            probs[bitstring] = round(prob, 4)
            
    # Simulate shots
    prob_array = np.abs(state) ** 2
    prob_array = prob_array / np.sum(prob_array)  # normalize
    sampled_indices = np.random.choice(dim, size=req.shots, p=prob_array)
    measurements = {}
    for idx in sampled_indices:
        b = format(idx, f"0{num_qubits}b")
        measurements[b] = measurements.get(b, 0) + 1
        
    # Statevector amplitudes
    sv_list = []
    for i in range(dim):
        b = format(i, f"0{num_qubits}b")
        val = state[i]
        sv_list.append({
            "basis": f"|{b}⟩",
            "real": round(float(np.real(val)), 4),
            "imag": round(float(np.imag(val)), 4),
            "magnitude": round(float(np.abs(val)), 4),
            "probability": round(float(np.abs(val)**2), 4)
        })
        
    # Bloch coordinates for each qubit
    bloch_vectors = [compute_single_qubit_bloch(state, q, num_qubits) for q in range(num_qubits)]
    
    return SimulationResult(
        statevector=sv_list,
        probabilities=probs,
        measurements=measurements,
        bloch_vectors=bloch_vectors,
        circuit_depth=len(set(g.step for g in sorted_gates)) if sorted_gates else 0,
        gate_count=len(sorted_gates)
    )

@app.post("/api/verify")
def verify_circuit(req: VerifyCircuitRequest):
    sim = simulate_circuit(CircuitSimulationRequest(num_qubits=req.num_qubits, gates=req.gates, shots=1024))
    probs = sim.probabilities
    
    if req.target_state == "bell_state":
        # Target: |Phi+> = (|00> + |11>) / sqrt(2)
        p00 = probs.get("00", 0.0)
        p11 = probs.get("11", 0.0)
        is_success = (0.40 <= p00 <= 0.60) and (0.40 <= p11 <= 0.60) and (len(probs) == 2)
        return {
            "success": is_success,
            "target": "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2",
            "feedback": "🎉 Perfect Bell State! You have successfully entangled two qubits!" if is_success else "Close! A Bell State needs equal 50% probability for |00⟩ and |11⟩ with 0% for |01⟩ and |10⟩. Hint: Use H on q0, then CNOT(q0, q1)."
        }
    elif req.target_state == "superposition":
        p0 = probs.get("0", 0.0)
        p1 = probs.get("1", 0.0)
        is_success = (0.40 <= p0 <= 0.60) and (0.40 <= p1 <= 0.60)
        return {
            "success": is_success,
            "target": "|+⟩ = (|0⟩ + |1⟩)/√2",
            "feedback": "🎉 Superposition achieved! The qubit is in an equal state of |0⟩ and |1⟩." if is_success else "Not quite! Place a single Hadamard (H) gate on q0 to generate superposition."
        }
        
    return {"success": True, "feedback": "Circuit executed successfully!"}

@app.post("/api/tutor/chat", response_model=TutorChatResponse)
def tutor_chat(req: TutorChatRequest):
    msg = req.message.lower()
    
    # Intelligent quantum tutor heuristics
    if "superposition" in msg:
        reply = "Superposition is one of the pillars of quantum mechanics! ⚛️ Unlike a classical bit that is strictly 0 OR 1, a qubit in superposition exists as a linear combination: |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1. When you place a Hadamard (H) gate on |0⟩, it creates equal 50/50 superposition |+⟩!"
        tip = "Applying two Hadamard gates in a row restores the qubit back to its original state! H(H|0⟩) = |0⟩."
        actions = ["Show me on the Bloch Sphere", "Build Superposition Circuit", "Why does measurement collapse it?"]
    elif "entangle" in msg or "bell" in msg:
        reply = "Quantum Entanglement links two or more qubits so that the quantum state of each cannot be described independently! 🔗 Even if separated by light-years, measuring one qubit instantly determines the state of the other. The classic Bell state |Φ⁺⟩ is created with H on q0 followed by CNOT(q0 -> q1)."
        tip = "Einstein famously called entanglement 'spooky action at a distance', but today it powers quantum cryptography and teleportation!"
        actions = ["Try Bell State Challenge", "What is Quantum Teleportation?", "Explain CNOT Gate"]
    elif "bloch" in msg:
        reply = "The Bloch Sphere is a geometric representation of pure single-qubit states on the surface of a unit sphere! 🌐 The North pole is |0⟩ (θ=0), the South pole is |1⟩ (θ=π), and points on the equator represent equal superpositions like |+⟩ and |i⟩."
        tip = "Quantum gates act as rotations around the X, Y, or Z axes on the Bloch Sphere."
        actions = ["Rotate to |+⟩ state", "Apply Pauli-X gate", "Explain spherical coordinates"]
    elif "qiskit" in msg or "code" in msg or "python" in msg:
        reply = "In Qiskit, creating a circuit is intuitive:\n\n```python\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])\n```\nThis snippet prepares a Bell pair and measures both qubits into classical registers!"
        tip = "Always remember to match your quantum registers with classical registers if you are measuring!"
        actions = ["Run this in Code Studio", "Convert to Cirq", "Simulate with Aer"]
    elif "mistake" in msg or (req.recent_mistakes and len(req.recent_mistakes) > 0):
        reply = f"I noticed you encountered difficulty with {req.recent_mistakes[0] if req.recent_mistakes else 'gates'}. Don't worry! In quantum computing, intuition takes time. Let's break down the transformation matrix and try one micro-step together! 💡"
        tip = "Practice makes permanent: Try the 3-minute gate drill in the Practice Hub."
        actions = ["Start 3-min drill", "Explain gate matrix", "Reset circuit"]
    else:
        reply = "I'm QBIT AI, your personal quantum guide! 🤖 Whether you want to master superposition, build a Bell state circuit, analyze quantum algorithms, or write Qiskit code, I'm here to coach you step-by-step. What would you like to explore?"
        tip = "Try asking: 'How does a CNOT gate work?' or 'What happens when I apply Hadamard?'"
        actions = ["What is a Qubit?", "Explore Quantum Playground", "Take Quantum Challenge"]
        
    return TutorChatResponse(reply=reply, suggested_actions=actions, quantum_tip=tip)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
