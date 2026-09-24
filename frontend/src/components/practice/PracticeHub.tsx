import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { PRACTICE_CHALLENGES, PracticeChallenge } from '../../data/challengesData';
import { PracticeChallengeModal } from './PracticeChallengeModal';
import { 
  Target, 
  Sparkles, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
  Check
} from 'lucide-react';

export const PracticeHub: React.FC = () => {
  const [store] = useGameStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeChallenge, setActiveChallenge] = useState<PracticeChallenge | null>(null);

  const completedList = store.completedChallenges || [];

  const filtered = selectedFilter === 'all'
    ? PRACTICE_CHALLENGES
    : PRACTICE_CHALLENGES.filter(c => c.category === selectedFilter);

  const daily = PRACTICE_CHALLENGES.find(c => c.category === 'daily') || PRACTICE_CHALLENGES[0];
  const isDailyCompleted = completedList.includes(daily.id);

  // Stats calculation
  const totalSolved = completedList.length;
  const totalChallenges = PRACTICE_CHALLENGES.length;
  const totalXpInPractice = completedList.reduce((acc, id) => {
    const found = PRACTICE_CHALLENGES.find(c => c.id === id);
    return acc + (found ? found.xpReward : 0);
  }, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-3 py-0.5 rounded-full border border-cyan-800 font-mono">
              Quantum Arena
            </span>
            <span className="text-xs text-slate-400">Interactive Circuit & Concept Drills</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quantum Practice Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Test your quantum computing skills with live circuit simulations, Dirac matrix quizzes, and in-browser Qiskit verification.
          </p>
        </div>

        {/* Real-time Stats Chips */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Solved</span>
            <span className="text-lg font-black text-cyan-400 font-mono">
              {totalSolved} / {totalChallenges}
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Practice XP</span>
            <span className="text-lg font-black text-indigo-400 font-mono">
              +{totalXpInPractice}
            </span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Streak</span>
            <span className="text-lg font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" /> {store.streak}d
            </span>
          </div>
        </div>
      </div>

      {/* Featured Daily Challenge Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-500/30">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-black/30 text-amber-200 font-mono font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm inline-block border border-amber-400/30">
              🎯 Daily Challenge
            </span>
            {isDailyCompleted && (
              <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Completed Today
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">{daily.title}</h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            {daily.description}
          </p>

          <div className="flex items-center gap-4 pt-2 text-xs font-semibold">
            <span className="bg-black/30 px-3 py-1 rounded-xl backdrop-blur-sm border border-amber-400/20 font-mono text-amber-200">
              +{daily.xpReward} XP Reward
            </span>
            <span className="flex items-center gap-1 text-white">
              <Clock className="w-3.5 h-3.5" /> {daily.timeEstimate}
            </span>
            {daily.badgeReward && (
              <span className="flex items-center gap-1 text-amber-200 font-medium">
                <Trophy className="w-3.5 h-3.5" /> {daily.badgeReward}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setActiveChallenge(daily)}
          className={`relative z-10 px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            isDailyCompleted
              ? 'bg-slate-950 hover:bg-slate-900 text-amber-300 border border-amber-400/30'
              : 'bg-white hover:bg-amber-50 text-slate-950'
          }`}
        >
          <span>{isDailyCompleted ? 'Replay Challenge' : 'Accept Daily Challenge'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Challenges' },
          { id: 'circuit', label: '⚛️ Circuit Practice' },
          { id: 'concept', label: '🧠 Concept Drills' },
          { id: 'coding', label: '💻 Coding Practice' },
          { id: 'ai', label: '🤖 AI Challenge' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(ch => {
          const isDone = completedList.includes(ch.id);
          return (
            <div
              key={ch.id}
              className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between transition-all hover:scale-[1.01] ${
                isDone
                  ? 'bg-slate-900/90 border-emerald-500/30 shadow-emerald-950/20'
                  : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800">
                    {ch.categoryLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {ch.difficulty}
                    </span>
                    {isDone && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-white text-base mb-1.5">{ch.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{ch.description}</p>

                {ch.targetFormula && (
                  <div className="mb-3 text-[11px] font-mono text-cyan-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                    {ch.targetFormula}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
                  <span>+{ch.xpReward} XP</span>
                </div>

                <button
                  onClick={() => setActiveChallenge(ch)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  {isDone ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Review / Replay</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Start Challenge</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Interactive Challenge Workbench Modal */}
      {activeChallenge && (
        <PracticeChallengeModal
          challenge={activeChallenge}
          onClose={() => setActiveChallenge(null)}
        />
      )}
    </div>
  );
};
