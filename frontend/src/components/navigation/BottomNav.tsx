import React from 'react';
import { useGameStore, ActiveView } from '../../store/useGameStore';
import { Home, BookOpen, Target, Cpu, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const [store, actions] = useGameStore();

  if (store.currentView === 'landing' || store.currentView === 'lesson') {
    return null;
  }

  const items: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Learn', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'practice', label: 'Practice', icon: <Target className="w-5 h-5" /> },
    { id: 'playground', label: 'Playground', icon: <Cpu className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {items.map((item, idx) => {
        const isActive = store.currentView === item.id;
        return (
          <button
            key={idx}
            onClick={() => actions.setView(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
