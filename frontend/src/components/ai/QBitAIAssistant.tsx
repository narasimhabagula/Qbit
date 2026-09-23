import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Lightbulb, 
  Code2, 
  HelpCircle 
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { QBitMascot3D } from './QBitMascot3D';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actions?: string[];
  tip?: string;
  timestamp: string;
}

export const QBitAIAssistant: React.FC = () => {
  const [store, actions] = useGameStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hi there! I'm QBIT AI, your personal quantum tutor. 🤖 Whether you're stuck on superposition, need help debugging a circuit, or want to explore quantum algorithms, I'm here to help!",
      actions: [
        'Explain Superposition simply',
        'How do I create a Bell State?',
        'What is the Bloch Sphere?',
        'Give me a Qiskit code example',
      ],
      tip: 'Pro-tip: Try clicking the 🔊 icon on any message to hear me explain it aloud!',
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

    // Clean markdown code blocks for speech
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block shown on screen.').replace(/\|[01]⟩/g, 'quantum state');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

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
    } catch (e) {
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
      // Try backend FastAPI endpoint first
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
    } catch (err) {
      // Fallback to local intelligent quantum educator heuristics
    }

    // Local intelligence fallback
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = "That's an insightful quantum question! Let's examine it mathematically and conceptually.";
      let tip = "Remember: Measurement in quantum mechanics is irreversible and collapses superposition.";
      let actions = ['Show me circuit example', 'How does the Hadamard gate work?', 'Explain Bell State'];

      if (lower.includes('superposition')) {
        reply = "Superposition means a qubit can exist in a linear combination of states |ψ⟩ = α|0⟩ + β|1⟩ with normalization |α|² + |β|² = 1! ⚛️ When you apply a Hadamard (H) gate, it rotates |0⟩ to |+⟩ with equal 50% probability of collapsing to 0 or 1 upon measurement.";
        tip = "Try opening the 3D Bloch Sphere in the Visualization Lab to see the state vector sit right on the equator!";
        actions = ['Open Visualization Lab', 'Why does measurement collapse it?', 'Try Bell State challenge'];
      } else if (lower.includes('bell') || lower.includes('entangle')) {
        reply = "Quantum Entanglement creates non-local correlations between qubits! 🔗 To generate the famous Bell State |Φ⁺⟩:\n\n1. Place Hadamard on q0: (|00⟩ + |10⟩)/√2\n2. Place CNOT(q0 -> q1): (|00⟩ + |11⟩)/√2\n\nNow, measuring q0 as 0 guarantees q1 is 0 instantaneously!";
        tip = "You can test this right now in the Quantum Playground by loading the 'Bell State' preset!";
        actions = ['Go to Playground', 'Explain CNOT Gate', 'What is Quantum Teleportation?'];
      } else if (lower.includes('bloch')) {
        reply = "The Bloch Sphere maps pure single-qubit states onto a 3D unit sphere! 🌐 The North pole is |0⟩ (θ=0), South pole is |1⟩ (θ=π), and points along the equator represent equal superpositions like |+⟩ and |i⟩. Every single-qubit quantum gate is simply a rotation around an axis on this sphere!";
        tip = "A 180° rotation around the X-axis transforms |0⟩ into |1⟩, which is why Pauli-X is called the bit-flip NOT gate.";
        actions = ['Rotate Bloch Sphere', 'What is Pauli-Y?', 'Explain spherical angles'];
      } else if (lower.includes('qiskit') || lower.includes('code')) {
        reply = "Here is how you build and measure a 2-qubit entangled pair in Qiskit:\n\n```python\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)         # Put q0 into superposition\nqc.cx(0, 1)     # Entangle q0 and q1\nqc.measure([0, 1], [0, 1])\n```\nYou can run, debug, and optimize this code directly in QBIT's Code Studio!";
        actions = ['Open Code Studio', 'Convert to Cirq', 'Run simulation'];
      } else if (store.recentMistakes.length > 0) {
        reply = `I noticed earlier you had a question related to ${store.recentMistakes[0]}. Don't worry! In quantum computing, intuition takes time. Would you like a quick 2-minute visual walkthrough?`;
        actions = ['Start visual walkthrough', 'Explain gate math', 'Try practice drill'];
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
    }, 450);
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
      {/* Floating Mascot Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-xl hover:shadow-indigo-500/30 transition-all border border-white/20"
      >
        {/* Animated Robot Mascot Icon */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-5 h-5 text-white animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-200">AI Tutor</div>
          <div className="text-xs font-bold leading-tight">QBIT AI</div>
        </div>
      </motion.button>

      {/* Slide-over Chat Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-4 sm:right-6 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-indigo-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-500/30 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center -ml-1">
                  <QBitMascot3D size={52} state={isLoading ? 'thinking' : isSpeaking ? 'speaking' : 'idle'} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">QBIT AI</h3>
                    <span className="text-[10px] bg-cyan-400/20 text-cyan-200 font-mono px-1.5 py-0.5 rounded border border-cyan-400/30">
                      3D Tutor
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">Photorealistic Quantum Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => speakText(messages[messages.length - 1]?.text || '')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSpeaking ? 'bg-white/30 text-cyan-300' : 'text-white/80 hover:bg-white/10'
                  }`}
                  title={isSpeaking ? 'Mute speech' : 'Listen to last response'}
                >
                  {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={closeTutor}
                  className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                    {/* Quantum Tip Box */}
                    {msg.tip && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{msg.tip}</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Action Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 shadow-2xs transition-all text-left"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>QBIT AI is thinking...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isListening ? 'Listening...' : 'Talk with Voice'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask QBIT AI about quantum computing..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-sm transition-all"
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
