import React, { useState } from 'react';
import { useGameStore, LEVEL_TITLES } from '../../store/useGameStore';
import { 
  Trophy, 
  Flame, 
  Star, 
  Heart, 
  Settings, 
  Check, 
  Award, 
  Bell, 
  Volume2, 
  Calendar,
  Sparkles,
  Mail,
  ShieldCheck,
  LogOut,
  Key
} from 'lucide-react';

const AVATAR_OPTIONS = ['🧑‍🚀', '👩‍💻', '👨‍🔬', '🧙‍♂️', '⚡', '🤖', '👾', '🐱'];

export const ProfilePage: React.FC = () => {
  const [store, actions] = useGameStore();
  const [nameInput, setNameInput] = useState<string>(store.userName);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(store.avatar);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveProfile = () => {
    actions.updateProfile(nameInput, selectedAvatar);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-3xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-5xl shadow-sm">
          {store.avatar}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{store.userName}</h1>
              <p className="text-xs text-indigo-600 font-bold">
                Level {store.level} — {LEVEL_TITLES[store.level] || 'Quantum Explorer'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                Joined: Sept 2026
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Current Goal: <strong className="text-slate-800">{store.userGoal}</strong> • Daily Commitment: <strong className="text-slate-800">{store.dailyMinutes} mins</strong>
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{store.streak} Day Streak</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
              <Star className="w-4 h-4 fill-indigo-500" />
              <span>{store.xp.toLocaleString()} Total XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Trophy Cabinet */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Quantum Trophy Cabinet</h3>
            <p className="text-xs text-slate-500">Earn badges by completing quantum milestones.</p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {store.badges.filter(b => b.isUnlocked).length} / {store.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {store.badges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                badge.isUnlocked
                  ? 'bg-gradient-to-b from-indigo-50/50 to-white border-indigo-200 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <span className="text-3xl block mb-2">{badge.icon}</span>
              <h4 className="text-xs font-bold text-slate-800 mb-1">{badge.name}</h4>
              <p className="text-[10px] text-slate-500 leading-tight">{badge.description}</p>
              {badge.isUnlocked && (
                <span className="text-[9px] font-bold text-emerald-600 block mt-2">
                  ✓ Unlocked {badge.unlockedAt}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Profile Settings & Customization */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>Profile Customization</span>
        </h3>

        {/* Change Avatar */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">Select Avatar:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {AVATAR_OPTIONS.map(av => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                  selectedAvatar === av
                    ? 'bg-indigo-100 border-2 border-indigo-600 scale-105'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Change Name */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-1">Display Name:</span>
          <div className="flex items-center gap-3 max-w-sm">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account & Security Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Account & Security</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Connected Account
            </span>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate">
                {store.userEmail || 'Guest Learner (Unregistered)'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {store.authProvider === 'google' ? 'Google OAuth' : store.authProvider === 'email' ? 'Email Verified' : 'Guest Mode'}
              </span>
              {store.isAuthenticated && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  ✓ Active Session
                </span>
              )}
            </div>
          </div>

          {/* Action / Log Out */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Session Management
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {store.isAuthenticated
                  ? 'Sign out of your QBIT quantum session on this browser.'
                  : 'Log in or create a profile to sync progress across devices.'}
              </p>
            </div>

            <div className="pt-3">
              {store.isAuthenticated ? (
                <button
                  onClick={() => actions.logout()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of QBIT</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => actions.openAuth('login')}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => actions.openAuth('signup')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
