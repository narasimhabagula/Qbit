import { useState, useEffect } from 'react';
import { Badge } from '../types/curriculum';
import { INITIAL_BADGES } from '../data/curriculumData';
import { sounds } from '../lib/audio';

export type ActiveView = 
  | 'landing' 
  | 'onboarding' 
  | 'dashboard' 
  | 'lesson' 
  | 'playground' 
  | 'code' 
  | 'visualization' 
  | 'practice' 
  | 'progress' 
  | 'leaderboard' 
  | 'profile' 
  | 'instructor';

export interface GameState {
  currentView: ActiveView;
  userName: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lives: number;
  maxLives: number;
  completedLessons: string[];
  activeLessonId: string | null;
  dailyGoalCurrent: number;
  dailyGoalTarget: number;
  userExperience: string;
  userGoal: string;
  dailyMinutes: number;
  badges: Badge[];
  soundEnabled: boolean;
  tutorOpen: boolean;
  recentMistakes: string[];
  hasOnboarded: boolean;
  // Platform Authentication State
  isAuthenticated: boolean;
  userEmail: string;
  authProvider: 'google' | 'email' | 'guest';
  authModalOpen: boolean;
  authMode: 'login' | 'signup';
}

const STORAGE_KEY = 'qbit_gamification_state_v1';

const DEFAULT_STATE: GameState = {
  currentView: 'landing',
  userName: 'Student',
  avatar: '🧑‍🚀',
  xp: 1240,
  level: 4,
  streak: 7,
  lives: 5,
  maxLives: 5,
  completedLessons: ['classical-bits', 'what-is-a-qubit'],
  activeLessonId: null,
  dailyGoalCurrent: 3,
  dailyGoalTarget: 5,
  userExperience: 'Complete Beginner',
  userGoal: 'Learn Quantum Computing',
  dailyMinutes: 15,
  badges: INITIAL_BADGES,
  soundEnabled: true,
  tutorOpen: false,
  recentMistakes: [],
  hasOnboarded: false,
  isAuthenticated: false,
  userEmail: '',
  authProvider: 'guest',
  authModalOpen: false,
  authMode: 'signup',
};

// Simple global listener mechanism for fast reactive re-renders
let state: GameState = { ...DEFAULT_STATE };

// Try loading from localStorage
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { 
        ...DEFAULT_STATE, 
        ...parsed,
        authModalOpen: false,
      };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }
}

const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }
  listeners.forEach(fn => fn());
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Quantum Beginner',
  2: 'Qubit Explorer',
  3: 'Gate Apprentice',
  4: 'Circuit Builder',
  5: 'Entanglement Explorer',
  6: 'Algorithm Apprentice',
  7: 'Quantum Developer',
  8: 'Quantum Master',
};

export const gameStore = {
  getState(): GameState {
    return state;
  },

  setView(view: ActiveView) {
    state = { ...state, currentView: view };
    notify();
  },

  startLesson(lessonId: string) {
    state = { ...state, activeLessonId: lessonId, currentView: 'lesson' };
    notify();
  },

  addXP(amount: number) {
    const newXP = state.xp + amount;
    // XP thresholds: 300 per level
    const newLevel = Math.min(8, Math.floor(newXP / 350) + 1);
    const leveledUp = newLevel > state.level;

    state = {
      ...state,
      xp: newXP,
      level: newLevel,
    };

    if (state.soundEnabled) {
      if (leveledUp) {
        sounds.playLevelUp();
      } else {
        sounds.playXP();
      }
    }
    notify();
  },

  decrementLife(): boolean {
    if (state.lives <= 0) return false;
    const newLives = state.lives - 1;
    state = { ...state, lives: newLives };
    if (state.soundEnabled) {
      sounds.playWrong();
    }
    notify();
    return newLives > 0;
  },

  recoverLives() {
    state = { ...state, lives: state.maxLives };
    notify();
  },

  completeLesson(lessonId: string, xpReward: number = 20) {
    const alreadyDone = state.completedLessons.includes(lessonId);
    const completed = alreadyDone ? state.completedLessons : [...state.completedLessons, lessonId];
    const newXP = state.xp + xpReward;
    const newLevel = Math.min(8, Math.floor(newXP / 350) + 1);
    const newDaily = Math.min(state.dailyGoalTarget, state.dailyGoalCurrent + 1);

    // Check badges
    const updatedBadges = state.badges.map(b => {
      if (b.id === 'qubit-beginner' && !b.isUnlocked) {
        return { ...b, isUnlocked: true, unlockedAt: 'Just now' };
      }
      if (lessonId === 'entanglement' && b.id === 'entanglement-explorer' && !b.isUnlocked) {
        return { ...b, isUnlocked: true, unlockedAt: 'Just now' };
      }
      return b;
    });

    state = {
      ...state,
      completedLessons: completed,
      xp: newXP,
      level: newLevel,
      dailyGoalCurrent: newDaily,
      badges: updatedBadges,
    };

    if (state.soundEnabled) {
      sounds.playCorrect();
    }
    notify();
  },

  finishOnboarding(experience: string, goal: string, minutes: number) {
    state = {
      ...state,
      userExperience: experience,
      userGoal: goal,
      dailyMinutes: minutes,
      hasOnboarded: true,
      currentView: 'dashboard',
    };
    notify();
  },

  setTutorOpen(open: boolean) {
    state = { ...state, tutorOpen: open };
    notify();
  },

  addMistake(topic: string) {
    const list = [topic, ...state.recentMistakes.filter(t => t !== topic)].slice(0, 5);
    state = { ...state, recentMistakes: list };
    notify();
  },

  toggleSound() {
    const next = !state.soundEnabled;
    sounds.isMuted = !next;
    state = { ...state, soundEnabled: next };
    notify();
  },

  updateProfile(name: string, avatar: string) {
    state = { ...state, userName: name, avatar };
    notify();
  },

  openAuth(mode: 'login' | 'signup' = 'login') {
    state = { ...state, authModalOpen: true, authMode: mode };
    notify();
  },

  closeAuth() {
    state = { ...state, authModalOpen: false };
    notify();
  },

  login(email: string, name?: string, provider: 'google' | 'email' | 'guest' = 'email') {
    const displayName = name || email.split('@')[0] || 'Quantum Explorer';
    state = {
      ...state,
      isAuthenticated: true,
      userEmail: email,
      userName: displayName,
      authProvider: provider,
      authModalOpen: false,
      currentView: state.hasOnboarded ? 'dashboard' : 'onboarding',
    };
    if (state.soundEnabled) {
      sounds.playCorrect();
    }
    notify();
  },

  signup(email: string, name?: string, provider: 'google' | 'email' = 'email') {
    const displayName = name || email.split('@')[0] || 'Quantum Explorer';
    state = {
      ...state,
      isAuthenticated: true,
      userEmail: email,
      userName: displayName,
      authProvider: provider,
      authModalOpen: false,
      currentView: 'onboarding',
    };
    if (state.soundEnabled) {
      sounds.playLevelUp();
    }
    notify();
  },

  logout() {
    state = {
      ...state,
      isAuthenticated: false,
      userEmail: '',
      authProvider: 'guest',
      currentView: 'landing',
      authModalOpen: false,
    };
    notify();
  },
};

export function useGameStore(): [GameState, typeof gameStore] {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return [state, gameStore];
}
