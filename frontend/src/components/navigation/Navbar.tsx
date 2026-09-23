import React from 'react';
import { useGameStore, LEVEL_TITLES, ActiveView } from '../../store/useGameStore';
import { 
  Flame, 
  Star, 
  Heart, 
  Volume2, 
  VolumeX, 
  Atom, 
  LogOut,
  Bot
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [store, actions] = useGameStore();

  const navItems: { label: string; view?: ActiveView; action?: () => void }[] = [
    { label: 'Learn', view: 'dashboard' },
    { label: 'Quantum Lab', view: 'visualization' },
    { label: 'Simulator', view: 'playground' },
    { label: 'Algorithms', view: 'code' },
    { label: 'AI Tutor', action: () => actions.setTutorOpen(true) },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 border-b border-slate-800/60 backdrop-blur-xl select-none transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Subtitle */}
        <div 
          onClick={() => actions.setView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Atom className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">
                QBIT
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
              Quantum Computing Platform
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = item.view && store.currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.view) actions.setView(item.view);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Gamification Stats Bar (when in learning views) */}
        {store.currentView !== 'landing' && (
          <div className="hidden lg:flex items-center gap-3 font-mono">
            {/* Streak */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-bold"
              title="Consecutive Day Streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{store.streak}d</span>
            </div>

            {/* XP */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-300 text-xs font-bold"
              title="Quantum XP"
            >
              <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              <span>{store.xp} XP</span>
            </div>

            {/* Lives / Coherence */}
            <div 
              onClick={() => actions.recoverLives()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer hover:bg-rose-950/40"
              title="Quantum Coherence / Lives"
            >
              <Heart className={`w-3.5 h-3.5 text-rose-400 ${store.lives > 0 ? 'fill-rose-400' : ''}`} />
              <span>{store.lives}</span>
            </div>
          </div>
        )}

        {/* Right: Sound Toggle & Auth Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={() => actions.toggleSound()}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title={store.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {store.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* User Auth Profile or Log In / Get Started */}
          {store.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => actions.setView('profile')}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer"
                title={store.userEmail || store.userName}
              >
                <span className="text-base">{store.avatar}</span>
                <span className="text-xs font-bold text-slate-200 hidden sm:inline">{store.userName}</span>
              </button>

              <button
                onClick={() => actions.logout()}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => actions.openAuth('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-slate-800 hover:border-slate-600 transition-all uppercase tracking-wider cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => actions.openAuth('signup')}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
