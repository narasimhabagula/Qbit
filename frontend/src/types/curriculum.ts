export type QuestionType = 
  | 'multiple_choice' 
  | 'drag_drop_circuit' 
  | 'tap_match' 
  | 'predict_probability' 
  | 'fill_blank';

export interface LessonStep {
  id: string;
  type: QuestionType;
  conceptTitle: string;
  conceptSummary: string;
  visualType: 'particle' | 'bloch' | 'entanglement' | 'circuit' | 'matrix';
  visualProps?: Record<string, any>;
  question: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  hint?: string;
  // For drag_drop_circuit
  targetCircuit?: {
    slots: { step: number; qubit: number; expectedGate: string }[];
  };
  // For tap_match
  matchPairs?: { left: string; right: string }[];
}

export interface Lesson {
  id: string;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  xpReward: number;
  icon: string;
  steps: LessonStep[];
}

export interface CurriculumModule {
  id: string;
  title: string;
  badge: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    description: string;
    icon: string;
    isLocked: boolean;
    isCompleted: boolean;
  }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}
