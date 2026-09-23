import React from 'react';
import { useGameStore, ActiveView } from '../../store/useGameStore';
import { 
  BookOpen, 
  Cpu, 
  Code2, 
  Orbit, 
  Target, 
  TrendingUp, 
  Trophy, 
  GraduationCap, 
  User, 
  Sparkles,
  Bot
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const [store, actions] = useGameStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Learn', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'playground', label: 'Playground', icon: <Cpu className="w-5 h-5" />, badge: 'Sim' },
    { id: 'code', label: 'Code Studio', icon: <Code2 className="w-5 h-5" />, badge: 'Qiskit' },
    { id: 'visualization', label: 'Viz Lab', icon: <Orbit className="w-5 h-5" />, badge: '3D' },
    { id: 'practice', label: 'Practice', icon: <Target className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { id: 'instructor', label: 'Instructor', icon: <GraduationCap className="w-5 h-5" />, badge: 'SIH' },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-61px)] select-none">
      {/* Navigation list */}
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Learning System
        </div>
        {navItems.map(item => {
          const isActive = store.currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => actions.setView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/60 text-indigo-700 shadow-2xs border border-indigo-200/60'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Tutor Card inside Sidebar */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-lg relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">QBIT AI</h4>
            <span className="text-[10px] text-cyan-300">Quantum Tutor Ready</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
          Need help understanding circuit matrices or Bell states?
        </p>
        <button
          onClick={() => actions.setTutorOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-md transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask QBIT AI
        </button>
      </div>
    </aside>
  );
};
