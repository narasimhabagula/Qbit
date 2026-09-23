import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { LEADERBOARD_WEEKLY, LEADERBOARD_GLOBAL, LeaderboardUser } from '../../data/leaderboardData';
import { Trophy, Medal, Flame, Star, Crown, Shield } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [store] = useGameStore();
  const [activeTab, setActiveTab] = useState<'weekly' | 'global' | 'friends'>('weekly');

  const list: LeaderboardUser[] = activeTab === 'global' ? LEADERBOARD_GLOBAL : LEADERBOARD_WEEKLY;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
              League Standings
            </span>
            <span className="text-xs text-slate-500">Diamond Quantum Division</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Leaderboard
          </h1>
          <p className="text-xs text-slate-500">
            Compete with fellow quantum developers and climb the weekly ranks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {(['weekly', 'global', 'friends'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 pb-2">
        {/* Silver: Rank 2 */}
        {list[1] && (
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl mb-1">{list[1].avatar}</span>
            <span className="text-xs font-black text-slate-400">#2</span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-full">
              {list[1].name}
            </h4>
            <span className="text-xs font-mono font-bold text-indigo-600 mt-1">
              {list[1].xp.toLocaleString()} XP
            </span>
          </div>
        )}

        {/* Gold: Rank 1 */}
        {list[0] && (
          <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 shadow-md flex flex-col items-center text-center relative -translate-y-2">
            <Crown className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-3xl sm:text-4xl mb-1">{list[0].avatar}</span>
            <span className="text-xs font-black text-amber-600">#1 Champion</span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-full">
              {list[0].name}
            </h4>
            <span className="text-xs font-mono font-bold text-amber-600 mt-1">
              {list[0].xp.toLocaleString()} XP
            </span>
          </div>
        )}

        {/* Bronze: Rank 3 */}
        {list[2] && (
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl mb-1">{list[2].avatar}</span>
            <span className="text-xs font-black text-orange-400">#3</span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-full">
              {list[2].name}
            </h4>
            <span className="text-xs font-mono font-bold text-indigo-600 mt-1">
              {list[2].xp.toLocaleString()} XP
            </span>
          </div>
        )}
      </div>

      {/* Full Ranking Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {list.map(user => {
            const isMe = user.isCurrentUser;
            return (
              <div
                key={user.id}
                className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                  isMe ? 'bg-indigo-50/70' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={`w-7 text-center font-black text-xs sm:text-sm font-mono ${
                      user.rank === 1
                        ? 'text-amber-500'
                        : user.rank === 2
                        ? 'text-slate-400'
                        : user.rank === 3
                        ? 'text-orange-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {user.rank}
                  </span>

                  <span className="text-2xl">{user.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {user.name}
                      </h4>
                      {isMe && (
                        <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{user.badge}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold font-mono hidden sm:flex">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{user.streak}d</span>
                  </div>

                  <span className="text-xs sm:text-sm font-black font-mono text-indigo-600">
                    {user.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
