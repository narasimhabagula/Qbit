export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
}

export const LEADERBOARD_WEEKLY: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'u1',
    name: 'Aarav Sharma',
    avatar: '👨‍🔬',
    xp: 2450,
    level: 6,
    streak: 18,
    badge: 'Algorithm Apprentice',
  },
  {
    rank: 2,
    id: 'u2',
    name: 'Elena Rostova',
    avatar: '👩‍💻',
    xp: 2180,
    level: 5,
    streak: 14,
    badge: 'Entanglement Explorer',
  },
  {
    rank: 3,
    id: 'u3',
    name: 'You (Student)',
    avatar: '🧑‍🚀',
    xp: 1240,
    level: 4,
    streak: 7,
    badge: 'Circuit Builder',
    isCurrentUser: true,
  },
  {
    rank: 4,
    id: 'u4',
    name: 'Dr. Vikram Rao',
    avatar: '👨‍🏫',
    xp: 1190,
    level: 4,
    streak: 9,
    badge: 'Circuit Builder',
  },
  {
    rank: 5,
    id: 'u5',
    name: 'Priya Patel',
    avatar: '👩‍🔬',
    xp: 980,
    level: 3,
    streak: 5,
    badge: 'Gate Apprentice',
  },
  {
    rank: 6,
    id: 'u6',
    name: 'Kai Takahashi',
    avatar: '🧑‍🎓',
    xp: 850,
    level: 3,
    streak: 4,
    badge: 'Gate Apprentice',
  },
  {
    rank: 7,
    id: 'u7',
    name: 'Marcus Vance',
    avatar: '👨‍💼',
    xp: 720,
    level: 2,
    streak: 3,
    badge: 'Qubit Explorer',
  },
];

export const LEADERBOARD_GLOBAL: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'g1',
    name: 'QuantumSage_99',
    avatar: '🧙‍♂️',
    xp: 18450,
    level: 8,
    streak: 120,
    badge: 'Quantum Master',
  },
  {
    rank: 2,
    id: 'g2',
    name: 'ShorDev',
    avatar: '⚡',
    xp: 14200,
    level: 7,
    streak: 84,
    badge: 'Quantum Developer',
  },
  {
    rank: 3,
    id: 'g3',
    name: 'Alice_Bob_Bell',
    avatar: '🔗',
    xp: 12100,
    level: 7,
    streak: 65,
    badge: 'Quantum Developer',
  },
  {
    rank: 28,
    id: 'u3',
    name: 'You (Student)',
    avatar: '🧑‍🚀',
    xp: 1240,
    level: 4,
    streak: 7,
    badge: 'Circuit Builder',
    isCurrentUser: true,
  },
];
