import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Sparkles, ArrowRight, Check, Bot, Atom } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal: React.FC = () => {
  const [, actions] = useGameStore();
  const [step, setStep] = useState<number>(1);

  // Selections
  const [experience, setExperience] = useState<string>('Complete Beginner');
  const [goal, setGoal] = useState<string>('Learn Quantum Computing');
  const [dailyMinutes, setDailyMinutes] = useState<number>(15);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const experienceOptions = [
    { id: 'Complete Beginner', title: 'Complete Beginner', desc: 'No prior physics or quantum computing experience.' },
    { id: 'I know the basics', title: 'I know the basics', desc: 'Familiar with binary logic, matrices, and linear algebra.' },
    { id: 'I can build circuits', title: 'I can build circuits', desc: 'Understand quantum gates like Hadamard, Pauli, and CNOT.' },
    { id: 'I already code quantum algorithms', title: 'I already code quantum algorithms', desc: 'Experienced in Qiskit, Cirq, or PennyLane.' },
  ];

  const goalOptions = [
    { id: 'Learn Quantum Computing', title: 'Learn Quantum Computing', icon: '⚛️' },
    { id: 'Build Quantum Circuits', title: 'Build Quantum Circuits', icon: '⚡' },
    { id: 'Learn Quantum Algorithms', title: 'Learn Quantum Algorithms', icon: '🤖' },
    { id: 'Prepare for Research', title: 'Prepare for Research', icon: '🔬' },
    { id: 'Learn Quantum Programming', title: 'Learn Quantum Programming', icon: '💻' },
  ];

  const timeOptions = [
    { minutes: 5, label: '5 minutes / day', tag: 'Casual' },
    { minutes: 10, label: '10 minutes / day', tag: 'Regular' },
    { minutes: 15, label: '15 minutes / day', tag: 'Committed (Recommended)' },
    { minutes: 30, label: '30 minutes / day', tag: 'Intense Quantum' },
  ];

  const handleFinish = () => {
    setIsGenerating(true);
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      actions.finishOnboarding(experience, goal, dailyMinutes);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 py-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Experience */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                What is your quantum experience?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              QBIT AI will adapt lesson pacing and mathematical depth to your background.
            </p>

            <div className="space-y-3 mb-8">
              {experienceOptions.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setExperience(opt.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    experience === opt.id
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{opt.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {experience === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                What is your goal?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              We will customize your learning path to prioritize the skills you care about.
            </p>

            <div className="space-y-3 mb-8">
              {goalOptions.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setGoal(opt.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    goal === opt.id
                      ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="font-bold text-slate-900 text-sm">{opt.title}</span>
                  </div>
                  {goal === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Daily Target & Generation */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                3
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                How much time do you want to learn each day?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Consistency builds quantum intuition. You can adjust this anytime in your profile.
            </p>

            <div className="space-y-3 mb-8">
              {timeOptions.map(opt => (
                <div
                  key={opt.minutes}
                  onClick={() => setDailyMinutes(opt.minutes)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    dailyMinutes === opt.minutes
                      ? 'border-cyan-600 bg-cyan-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{opt.label}</span>
                    <span className="text-[11px] text-cyan-700 font-medium">{opt.tag}</span>
                  </div>
                  {dailyMinutes === opt.minutes && (
                    <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={isGenerating}
                className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={isGenerating}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Atom className="w-4 h-4 animate-spin" />
                    <span>QBIT AI is synthesizing path...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Learning Path</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
