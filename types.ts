
export interface Riddle {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface Level {
  number: number;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  riddles: Riddle[];
  isUnlocked: boolean;
  isCompleted: boolean;
}

export type ScreenState = 'MENU' | 'LEVEL_SELECT' | 'GAME' | 'RESULT' | 'LOADING';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}
