import React from 'react';
import { useGameStore, LEVEL_TITLES } from '../../store/useGameStore';
import { 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Bot, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const WEEKLY_ACTIVITY = [
  { day: 'Mon', xp: 180 },
  { day: 'Tue', xp: 240 },
  { day: 'Wed', xp: 120 },
  { day: 'Thu', xp: 320 },
  { day: 'Fri', xp: 210 },
  { day: 'Sat', xp: 290 },
  { day: 'Sun', xp: 380 },
];

export const ProgressPage: React.FC = () => {
  const [store, actions] = useGameStore();

  const currentLevelTitle = LEVEL_TITLES[store.level] || 'Quantum Explorer';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Analytics & Mastery
            </span>
            <span className="text-xs text-slate-500">Continuous Evaluation</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Learning Progress & Statistics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time breakdown of your quantum intuition, quiz accuracy, and topic mastery.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Star className="w-5 h-5 fill-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total XP</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {store.xp.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">+180 XP today</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Streak</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {store.streak} Days
          </span>
          <span className="text-[11px] text-amber-600 block mt-1 font-semibold">Active Streak</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rank</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            Level {store.level}
          </span>
          <span className="text-[11px] text-purple-600 block mt-1 font-semibold">{currentLevelTitle}</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quiz Accuracy</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            94.2%
          </span>
          <span className="text-[11px] text-slate-500 block mt-1 font-semibold">24 / 26 correct</span>
        </div>
      </div>

      {/* Curriculum Module Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-900">
            Curriculum Domain Mastery
          </h3>

          <div className="space-y-4">
            {/* Domain 1 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-800">⚛️ Quantum Foundations</span>
                <span className="text-indigo-600 font-mono">85%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full w-[85%]" />
              </div>
            </div>

            {/* Domain 2 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-800">⚡ Quantum Circuits</span>
                <span className="text-purple-600 font-mono">65%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full w-[65%]" />
              </div>
            </div>

            {/* Domain 3 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-800">🤖 Quantum Algorithms</span>
                <span className="text-cyan-600 font-mono">35%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full w-[35%]" />
              </div>
            </div>
          </div>

          {/* Weak vs Strong Topics */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                Strong Topics 🌟
              </span>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Qubit Superposition & |+⟩</li>
                <li>• Hadamard Gate Matrix</li>
                <li>• Classical Binary Limits</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
                Topics to Review 💡
              </span>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Pauli-Z Phase Rotation</li>
                <li>• CNOT Control-Target Polarity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* QBIT AI Recommendation & Activity Chart */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Recommendation Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-300" />
              </div>
              <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                QBIT AI Prescribes:
              </span>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              "Practice Quantum Gates for 10 minutes today to solidify your understanding before attempting Deutsch-Jozsa."
            </p>

            <button
              onClick={() => actions.setView('practice')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Start 10-Minute Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekly XP Activity Chart */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-800 block mb-3">
              Weekly XP Velocity
            </span>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_ACTIVITY}>
                  <defs>
                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} XP`, 'Earned']}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#xpGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
