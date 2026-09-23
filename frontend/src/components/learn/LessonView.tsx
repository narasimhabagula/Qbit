import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { LESSON_DETAILS } from '../../data/curriculumData';
import { Lesson, LessonStep } from '../../types/curriculum';
import { Qubit3D } from '../visualization/Qubit3D';
import { BlochSphere3D } from '../visualization/BlochSphere3D';
import { Entanglement3D } from '../visualization/Entanglement3D';
import { QBitMascot3D } from '../ai/QBitMascot3D';
import { 
  X, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  Flame, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LessonView: React.FC = () => {
  const [store, actions] = useGameStore();
  const lessonId = store.activeLessonId || 'superposition';
  const lesson: Lesson = LESSON_DETAILS[lessonId] || LESSON_DETAILS['superposition'];

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Drag & drop circuit mini state
  const [droppedGate, setDroppedGate] = useState<string | null>(null);

  // Match concepts state
  const [selectedPairs, setSelectedPairs] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);

  const step: LessonStep = lesson.steps[currentStepIdx] || lesson.steps[0];
  const progressPercent = ((currentStepIdx + 1) / lesson.steps.length) * 100;

  const handleCheckAnswer = () => {
    if (step.type === 'multiple_choice' || step.type === 'predict_probability') {
      const correctOpt = step.options?.find(o => o.isCorrect);
      const right = selectedOption === correctOpt?.id;
      setIsCorrect(right);
      setHasAnswered(true);

      if (right) {
        actions.addXP(10);
      } else {
        actions.decrementLife();
        actions.addMistake(step.conceptTitle);
      }
    } else if (step.type === 'drag_drop_circuit') {
      const expected = step.targetCircuit?.slots[0]?.expectedGate;
      const right = droppedGate === expected;
      setIsCorrect(right);
      setHasAnswered(true);

      if (right) {
        actions.addXP(10);
      } else {
        actions.decrementLife();
        actions.addMistake('Gate Placement');
      }
    } else if (step.type === 'tap_match') {
      // In tap match, check if all matchPairs are matched
      const totalPairs = step.matchPairs?.length || 0;
      const matchedCount = Object.keys(selectedPairs).length;
      const right = matchedCount === totalPairs;
      setIsCorrect(right);
      setHasAnswered(true);

      if (right) {
        actions.addXP(10);
      } else {
        actions.decrementLife();
      }
    }
  };

  const handleNext = () => {
    if (currentStepIdx < lesson.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setHasAnswered(false);
      setSelectedOption(null);
      setDroppedGate(null);
      setSelectedPairs({});
      setActiveLeft(null);
    } else {
      // Finish Lesson!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      actions.completeLesson(lesson.id, lesson.xpReward);
      setIsCompleted(true);
    }
  };

  const handleExit = () => {
    actions.setView('dashboard');
  };

  // Tap match item select
  const handleMatchSelect = (item: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setActiveLeft(item);
    } else if (side === 'right' && activeLeft) {
      setSelectedPairs(prev => ({ ...prev, [activeLeft]: item }));
      setActiveLeft(null);
    }
  };

  // Lesson Finished Screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 border border-indigo-100 shadow-2xl text-center"
        >
          <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
            <QBitMascot3D size={90} state="success" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            LESSON COMPLETE!
          </h2>
          <p className="text-sm font-semibold text-indigo-600 mt-1">
            "{lesson.title} Mastered"
          </p>

          <div className="my-6 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">XP Earned</span>
              <span className="text-xl font-black text-indigo-600 font-mono">+{lesson.xpReward} XP</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Streak</span>
              <span className="text-xl font-black text-amber-600 font-mono flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-500" /> {store.streak} Days
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left mb-6">
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-700">Quantum Foundations Progress</span>
              <span className="text-indigo-600 font-mono">82%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full w-[82%]" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span>Badge Unlocked: <strong>Superposition Explorer</strong></span>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header with Progress & Lives */}
      <header className="px-4 sm:px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
        <button
          onClick={handleExit}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Lesson Step Progress Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Lives Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs font-mono">
          <Heart className={`w-4 h-4 ${store.lives > 0 ? 'fill-rose-500' : ''}`} />
          <span>{store.lives}</span>
        </div>
      </header>

      {/* Main Interactive Lesson Card Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-6"
        >
          {/* Visual Interactive Element */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            {step.visualType === 'particle' && (
              <div className="w-full max-w-sm">
                <Qubit3D initialState="|+⟩" size="sm" />
              </div>
            )}
            {step.visualType === 'bloch' && (
              <div className="w-full max-w-sm">
                <BlochSphere3D theta={Math.PI / 2} phi={0} interactive={true} />
              </div>
            )}
            {step.visualType === 'entanglement' && (
              <div className="w-full max-w-sm">
                <Entanglement3D />
              </div>
            )}
            {step.visualType === 'circuit' && (
              <div className="w-full bg-slate-900 rounded-2xl p-4 text-white font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-2">Live Circuit State</div>
                <div className="flex items-center gap-2 py-1">
                  <span className="text-cyan-400">q0: ───</span>
                  <span className="bg-indigo-600 px-2 py-1 rounded text-white font-bold">
                    {droppedGate || '[ ? ]'}
                  </span>
                  <span className="text-cyan-400">───── (Measure)</span>
                </div>
              </div>
            )}
            {step.visualType === 'matrix' && (
              <div className="flex items-center justify-center gap-4 text-sm font-mono text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span>|ψ⟩ = α|0⟩ + β|1⟩</span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-600 font-bold">|α|² + |β|² = 1</span>
              </div>
            )}

            {/* Concept Summary */}
            <div className="text-center mt-4 max-w-md">
              <h3 className="font-extrabold text-slate-900 text-lg">{step.conceptTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{step.conceptSummary}</p>
            </div>
          </div>

          {/* Question / Challenge */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-4">
              {step.question}
            </h4>

            {/* Multiple Choice / Predict Probability */}
            {(step.type === 'multiple_choice' || step.type === 'predict_probability') && (
              <div className="space-y-2.5">
                {step.options?.map(opt => {
                  const isSelected = selectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !hasAnswered && setSelectedOption(opt.id)}
                      disabled={hasAnswered}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <span>{opt.text}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Drag & Drop Gate Assembler */}
            {step.type === 'drag_drop_circuit' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-indigo-300 flex items-center justify-center gap-3">
                  <span className="text-xs text-slate-500">Timeline slot:</span>
                  {droppedGate ? (
                    <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-mono font-bold text-sm shadow-md flex items-center gap-2">
                      <span>Gate {droppedGate}</span>
                      {!hasAnswered && (
                        <button onClick={() => setDroppedGate(null)} className="text-white/80 hover:text-white">
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-indigo-500 font-semibold">[ Drop Gate Here ]</span>
                  )}
                </div>

                {!droppedGate && !hasAnswered && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {['H', 'X', 'Z', 'CNOT'].map(g => (
                      <button
                        key={g}
                        onClick={() => setDroppedGate(g)}
                        className="px-4 py-2.5 rounded-xl bg-white border-2 border-indigo-200 hover:border-indigo-600 text-indigo-700 font-mono font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tap Match Pairs */}
            {step.type === 'tap_match' && step.matchPairs && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Terms</span>
                  {step.matchPairs.map(p => {
                    const isMatched = selectedPairs[p.left] !== undefined;
                    const isActive = activeLeft === p.left;
                    return (
                      <button
                        key={p.left}
                        disabled={isMatched || hasAnswered}
                        onClick={() => handleMatchSelect(p.left, 'left')}
                        className={`w-full p-2.5 rounded-xl text-xs font-mono font-bold border-2 transition-all text-left ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : isActive
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        {p.left}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Meaning</span>
                  {step.matchPairs.map(p => {
                    const isMatched = Object.values(selectedPairs).includes(p.right);
                    return (
                      <button
                        key={p.right}
                        disabled={isMatched || hasAnswered}
                        onClick={() => handleMatchSelect(p.right, 'right')}
                        className={`w-full p-2.5 rounded-xl text-xs font-medium border-2 transition-all text-left ${
                          isMatched
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        {p.right}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Bottom Action / Feedback Drawer */}
      <footer
        className={`p-4 sm:p-6 transition-all border-t ${
          !hasAnswered
            ? 'bg-white border-slate-200'
            : isCorrect
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {!hasAnswered ? (
            <>
              <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>Select an answer and click check</span>
              </div>
              <button
                onClick={handleCheckAnswer}
                disabled={
                  (step.type === 'multiple_choice' && !selectedOption) ||
                  (step.type === 'predict_probability' && !selectedOption) ||
                  (step.type === 'drag_drop_circuit' && !droppedGate)
                }
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all"
              >
                Check Answer
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 w-full sm:w-auto">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base">
                    {isCorrect ? '🎉 Correct! +10 XP' : "Almost! Let's understand it."}
                  </h4>
                  <p className="text-xs mt-0.5 max-w-md opacity-90">{step.explanation}</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  isCorrect
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};
