import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Lightbulb, 
  RotateCcw
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actions?: string[];
  tip?: string;
  timestamp: string;
}

const INITIAL_PROMPTS = [
  'Explain qubits',
  'Explain quantum gates',
  'Help me build a circuit',
  "Explain Grover's algorithm",
  'What is superposition?',
];

export const QBitAIAssistant: React.FC = () => {
  const [store, actions] = useGameStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      sender: 'ai',
      text: "Hi! I'm QBIT AI.\nI'm here to help you learn quantum computing.",
      actions: INITIAL_PROMPTS,
      tip: 'Click any suggested prompt below or type your question in Dirac notation or plain English!',
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync with store tutorOpen
  useEffect(() => {
    if (store.tutorOpen) {
      setIsOpen(true);
    }
  }, [store.tutorOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Web Speech API: Text-to-Speech
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block shown on screen.').replace(/\|[01]⟩/g, 'quantum state');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API: Speech-to-Text (Microphone)
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your question!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Attempt backend API call
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          current_lesson: store.activeLessonId || undefined,
          recent_mistakes: store.recentMistakes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply,
          actions: data.suggested_actions,
          tip: data.quantum_tip,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
        return;
      }
    } catch {
      // Fallback to local intelligent quantum educator heuristics
    }

    // Local intelligence fallback
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = "That is an important question in quantum computing! Let's examine the mathematical principles and practical circuit implications.";
      let tip = "Remember: In quantum mechanics, state operations are unitary until projective measurement irreversibly collapses the superposition.";
      let actions = ['Explain qubits', 'Explain quantum gates', 'Help me build a circuit'];

      if (lower.includes('qubit')) {
        reply = "A qubit (quantum bit) is the fundamental unit of quantum information. Unlike a classical bit that is strictly 0 or 1, a qubit exists in a two-dimensional Hilbert space:\n\n|ψ⟩ = α|0⟩ + β|1⟩\n\nwhere α and β are complex probability amplitudes satisfying |α|² + |β|² = 1. Geometrically, any pure qubit state can be mapped to a point on the unit 3D Bloch Sphere!";
        tip = "The North Pole of the Bloch Sphere represents state |0⟩, while the South Pole represents |1⟩. Points along the equator represent equal superpositions!";
        actions = ['What is superposition?', 'Explain Bloch Sphere', 'Explain quantum gates'];
      } else if (lower.includes('superposition')) {
        reply = "Superposition allows a quantum system to exist in a linear combination of mutually orthogonal eigenstates simultaneously!\n\nWhen a Hadamard gate H is applied to |0⟩:\nH|0⟩ = (|0⟩ + |1⟩) / √2 = |+⟩\n\nMeasurement collapses this superposition into either |0⟩ or |1⟩ with equal 50% probability according to the Born rule: P(x) = |⟨x|ψ⟩|².";
        tip = "Superposition enables quantum parallelism, allowing algorithms to process 2ⁿ states simultaneously with n qubits!";
        actions = ['Explain quantum gates', 'How to create Bell State?', 'Explain qubits'];
      } else if (lower.includes('gate')) {
        reply = "Quantum gates are reversible unitary transformations (U†U = I) represented by complex square matrices:\n\n• Hadamard (H): Creates superposition\n• Pauli-X (NOT): Bit flip (|0⟩ ↔ |1⟩)\n• Pauli-Z: Phase flip (|1⟩ ↔ -|1⟩)\n• Phase (S) & T: π/2 and π/4 rotations around Z-axis\n• CNOT (CX): 2-qubit controlled-NOT gate that generates entanglement\n• SWAP: Exchanges states of two qubits";
        tip = "Any multi-qubit quantum algorithm can be decomposed into single-qubit rotations plus the two-qubit CNOT gate!";
        actions = ['Help me build a circuit', 'Explain Bell State', 'What is superposition?'];
      } else if (lower.includes('circuit') || lower.includes('build')) {
        reply = "Let's build a circuit! A great foundational circuit is the Bell State generator (EPR pair):\n\n1. Initialize 2 qubits in |00⟩\n2. Apply a Hadamard (H) gate to qubit q[0] → (|00⟩ + |10⟩)/√2\n3. Apply a CNOT gate with control q[0] and target q[1] → (|00⟩ + |11⟩)/√2\n4. Add Measurement operators to read out results!\n\nYou can experiment with this directly in our interactive Quantum Circuit Builder!";
        tip = "You can open the Simulator tab to run 1024 simulation shots on this Bell circuit!";
        actions = ['Open Simulator', 'Explain Grover\'s algorithm', 'Explain quantum gates'];
      } else if (lower.includes('grover')) {
        reply = "Grover's Algorithm provides a proven quadratic speedup for unstructured database searching: O(√N) quantum queries compared to O(N/2) classical checks!\n\nThe algorithm alternates between two operators:\n1. Phase Oracle (U_f): Inverts the phase of the target marked state |ω⟩ → -|ω⟩\n2. Diffusion Operator (D = 2|s⟩⟨s| - I): Inverts amplitudes about their mean, amplifying the probability of the marked state while suppressing non-target states.";
        tip = "For a 4-item search (2 qubits), Grover's algorithm finds the marked item with 100% success probability in exactly 1 iteration!";
        actions = ['Explain qubits', 'Help me build a circuit', 'What is Shor\'s algorithm?'];
      } else if (lower.includes('bell') || lower.includes('entangle')) {
        reply = "Quantum entanglement creates non-local correlations that cannot be factored into product states:\n\n|Φ⁺⟩ = (|00⟩ + |11⟩) / √2\n\nMeasuring qubit 0 instantaneously dictates the outcome of qubit 1 with 100% correlation regardless of spatial separation, violating Bell's inequality!";
        tip = "Entanglement is the key resource behind Quantum Teleportation and Superdense Coding.";
        actions = ['Help me build a circuit', 'Explain qubits', 'Open Simulator'];
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          actions,
          tip,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }, 400);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: "Hi! I'm QBIT AI.\nI'm here to help you learn quantum computing.",
        actions: INITIAL_PROMPTS,
        tip: 'Click any suggested prompt below or type your question in Dirac notation or plain English!',
        timestamp: 'Just now',
      },
    ]);
  };

  const closeTutor = () => {
    setIsOpen(false);
    actions.setTutorOpen(false);
    if (isSpeaking && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {/* ============================================================
          FLOATING CHATBOT BUTTON (REFERENCE IMAGE 1 — QBIT AI ROBOT)
          - Bottom-right corner
          - Circular cropped robot mascot
          - Subtle cyan/purple glow and hover animation
          ============================================================ */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group flex items-center justify-center cursor-pointer focus:outline-none"
        aria-label="Open QBIT AI Assistant"
      >
        <div className="relative">
          {/* Ambient Glow Aura */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse" />
          
          {/* Circular Button Container with Reference Image 1 */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-2xl ring-2 ring-cyan-400/60 group-hover:ring-cyan-300 transition-all duration-300 bg-slate-950">
            <img 
              src="/qbit-ai-mascot.jpg" 
              alt="QBIT AI Robot Mascot" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Active Status Pulse Dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 border-2 border-slate-950" />
          </span>

          {/* Hover Tooltip Badge */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 text-white text-xs font-semibold shadow-xl whitespace-nowrap backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Ask QBIT AI</span>
          </div>
        </div>
      </motion.button>

      {/* ============================================================
          GLASSMORPHISM CHAT PANEL (REFERENCE IMAGE 1 IDENTITY)
          ============================================================ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-6 right-4 sm:right-6 w-[94vw] sm:w-[440px] h-[640px] max-h-[88vh] bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.2)] border border-cyan-500/30 flex flex-col z-50 overflow-hidden text-slate-100"
          >
            {/* Header: Full QBIT AI Robot Identity */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-cyan-500/20 shadow-md">
              <div className="flex items-center gap-3">
                {/* Robot Mascot Avatar */}
                <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-purple-500 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400/50 shrink-0 overflow-hidden bg-slate-950">
                  <img 
                    src="/qbit-ai-mascot.jpg" 
                    alt="QBIT AI Robot Mascot Avatar" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-white tracking-tight">QBIT AI</h3>
                    <span className="text-[9px] bg-cyan-400/20 text-cyan-300 font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-400/30 uppercase tracking-wider">
                      AI Tutor
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-200/90 font-medium">Your Quantum Learning Assistant</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => speakText(messages[messages.length - 1]?.text || '')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSpeaking ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={isSpeaking ? 'Mute speech' : 'Listen to last response'}
                >
                  {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse text-cyan-300" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={closeTutor}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Top Identity Welcome Banner inside Chat Window */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-950/40 border-b border-cyan-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>QBIT AI • Neural Quantum Engine</span>
              </div>
              <span className="text-[10px] text-cyan-400/80 font-mono">Dirac • Qiskit • Gates</span>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  {msg.sender === 'ai' ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-cyan-400/50 shadow-sm shrink-0 bg-slate-950 mt-1">
                      <img 
                        src="/qbit-ai-mascot.jpg" 
                        alt="QBIT AI Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1">
                      You
                    </div>
                  )}

                  <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-md leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none'
                          : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-none shadow-cyan-950/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Quantum Tip Box */}
                      {msg.tip && (
                        <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-start gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{msg.tip}</span>
                        </div>
                      )}
                    </div>

                    {/* Suggested Action Prompt Chips */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(act)}
                            className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-cyan-950/70 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400 shadow-xs transition-all text-left flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>{act}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-cyan-300 bg-slate-900/90 p-3 rounded-2xl border border-cyan-500/20 w-fit">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>QBIT AI is synthesizing answer...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
                title={isListening ? 'Listening...' : 'Talk with Voice'}
              >
                {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask QBIT AI about quantum computing..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-slate-950 font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
