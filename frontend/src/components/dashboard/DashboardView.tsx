import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, LEVEL_TITLES } from '../../store/useGameStore';
import { INITIAL_MODULES } from '../../data/curriculumData';
import { 
  Flame, 
  Star, 
  Heart, 
  Trophy, 
  ArrowRight, 
  Check, 
  Lock, 
  Sparkles, 
  Play, 
  Target,
  Bot
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const [store, actions] = useGameStore();

  // Find next actionable lesson
  let nextLessonId = 'superposition';
  for (const mod of INITIAL_MODULES) {
    for (const l of mod.lessons) {
      if (!store.completedLessons.includes(l.id)) {
        nextLessonId = l.id;
        break;
      }
    }
  }

  const handleStartLesson = (lessonId: string) => {
    actions.startLesson(lessonId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Welcome & Goal Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm mb-1">
            <span>Welcome back</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">{store.userGoal}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            Hi, {store.userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Level {store.level} — <strong className="text-indigo-600 font-semibold">{LEVEL_TITLES[store.level] || 'Quantum Explorer'}</strong>
          </p>

          {/* Daily Goal Bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Daily Goal: Complete 5 lessons</span>
                <span className="font-bold text-indigo-600 font-mono">
                  {store.dailyGoalCurrent} / {store.dailyGoalTarget}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(store.dailyGoalCurrent / store.dailyGoalTarget) * 100}%` }}
                />
              </div>
            </div>
            {store.dailyGoalCurrent >= store.dailyGoalTarget && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Done!
              </span>
            )}
          </div>
        </div>

        {/* Primary Continue Learning Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => handleStartLesson(nextLessonId)}
            className="w-full md:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-100/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">QBIT AI Recommendation</span>
              <span className="text-[10px] font-mono bg-cyan-100 text-cyan-800 px-1.5 py-0.2 rounded font-semibold">
                Personalized
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              "Master superposition with the Hadamard gate today to unlock Bell State entanglement!"
            </p>
          </div>
        </div>
        <button
          onClick={() => actions.setTutorOpen(true)}
          className="hidden sm:inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0"
        >
          Talk to Tutor →
        </button>
      </div>

      {/* Vertical Curriculum Learning Path */}
      <div className="space-y-12 py-4">
        {INITIAL_MODULES.map((module, mIdx) => (
          <div key={module.id} className="relative">
            {/* Module Header Card */}
            <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md mb-8">
              <div className="flex items-center gap-3.5">
                <span className="text-2xl sm:text-3xl">{module.badge}</span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                    {module.title.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-300">{module.description}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-full text-indigo-200">
                Module {mIdx + 1}
              </span>
            </div>

            {/* Path Nodes with connecting line */}
            <div className="relative flex flex-col items-center space-y-8">
              {/* Vertical connector line */}
              <div className="absolute top-6 bottom-6 w-1 bg-slate-200 rounded-full pointer-events-none" />

              {module.lessons.map((lesson, lIdx) => {
                const isCompleted = store.completedLessons.includes(lesson.id);
                // Active if not completed, but previous lesson is completed or it's the first lesson
                const isPreviousCompleted = lIdx === 0 
                  ? (mIdx === 0 || store.completedLessons.length > 0)
                  : store.completedLessons.includes(module.lessons[lIdx - 1].id);
                
                const isCurrent = !isCompleted && isPreviousCompleted;
                const isLocked = !isCompleted && !isCurrent;

                // Alternate horizontal slight offsets for structured roadmap layout
                const xOffset = lIdx % 2 === 0 ? '-translate-x-4' : 'translate-x-4';

                return (
                  <div
                    key={lesson.id}
                    className={`relative z-10 flex flex-col items-center transition-all ${xOffset}`}
                  >
                    {/* Pulsing indicator for active lesson */}
                    {isCurrent && (
                      <div className="absolute -top-7 bg-indigo-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-md animate-bounce">
                        START HERE
                      </div>
                    )}

                    {/* Interactive Node Button */}
                    <motion.button
                      whileHover={!isLocked ? { scale: 1.1 } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                      disabled={isLocked}
                      onClick={() => handleStartLesson(lesson.id)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl transition-all relative ${
                        isCompleted
                          ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 text-white border-2 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                          : isCurrent
                          ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white border-2 border-cyan-300 ring-4 ring-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                          : 'bg-gradient-to-b from-slate-800 to-slate-900 text-slate-500 border border-slate-700/80 shadow-inner backdrop-blur-md cursor-not-allowed opacity-80'
                      }`}
                    >
                      {/* Energy Ring on Current Lesson */}
                      {isCurrent && (
                        <div className="absolute -inset-1.5 rounded-[28px] border-2 border-dashed border-cyan-400/60 animate-spin-slow pointer-events-none" />
                      )}

                      {isCompleted ? (
                        <Check className="w-8 h-8 text-white stroke-[3] drop-shadow-md" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-slate-400 drop-shadow-sm" />
                      ) : (
                        <span className="drop-shadow-md">{lesson.icon}</span>
                      )}
                    </motion.button>

                    {/* Node Label Card */}
                    <div className="mt-2 text-center max-w-[150px]">
                      <span className={`text-xs font-bold block ${isCurrent ? 'text-indigo-600 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                        {lesson.title}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-600 font-semibold">Mastered</span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] text-indigo-500 font-medium">+20 XP</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
