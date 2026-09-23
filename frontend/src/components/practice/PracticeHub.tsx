import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { PRACTICE_CHALLENGES, PracticeChallenge } from '../../data/challengesData';
import { 
  Target, 
  Sparkles, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PracticeHub: React.FC = () => {
  const [, actions] = useGameStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const filtered = selectedFilter === 'all'
    ? PRACTICE_CHALLENGES
    : PRACTICE_CHALLENGES.filter(c => c.category === selectedFilter);

  const handleStartChallenge = (c: PracticeChallenge) => {
    if (c.category === 'circuit' || c.id === 'daily-bell-state') {
      actions.setView('playground');
    } else if (c.category === 'coding') {
      actions.setView('code');
    } else if (c.category === 'ai') {
      actions.setTutorOpen(true);
    } else {
      // Instant complete quiz
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
      actions.addXP(c.xpReward);
      setCompletedChallenges(prev => [...prev, c.id]);
    }
  };

  const daily = PRACTICE_CHALLENGES.find(c => c.category === 'daily') || PRACTICE_CHALLENGES[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
              Daily Practice Arena
            </span>
            <span className="text-xs text-slate-500">Sharpen Intuition</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Quantum Practice Hub
          </h1>
          <p className="text-xs text-slate-500">
            Earn bonus XP, master elusive quantum gate transformations, and level up faster.
          </p>
        </div>
      </div>

      {/* Featured Daily Challenge Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm inline-block mb-3">
            🎯 Daily Quantum Challenge
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">{daily.title}</h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed">
            {daily.description}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs font-semibold">
            <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
              +{daily.xpReward} XP Reward
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {daily.timeEstimate}
            </span>
            {daily.badgeReward && (
              <span className="flex items-center gap-1 text-amber-100">
                <Trophy className="w-3.5 h-3.5" /> {daily.badgeReward}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => handleStartChallenge(daily)}
          className="relative z-10 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2"
        >
          <span>Accept Daily Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Challenges' },
          { id: 'concept', label: '🧠 Concept Practice' },
          { id: 'circuit', label: '⚛️ Circuit Practice' },
          { id: 'coding', label: '💻 Coding Practice' },
          { id: 'ai', label: '🤖 AI Challenge' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              selectedFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(ch => {
          const isDone = completedChallenges.includes(ch.id);
          return (
            <div
              key={ch.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {ch.categoryLabel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {ch.difficulty}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mb-1.5">{ch.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{ch.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 font-mono">
                  <span>+{ch.xpReward} XP</span>
                </div>

                <button
                  onClick={() => handleStartChallenge(ch)}
                  disabled={isDone}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:scale-105 active:scale-95'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
