import type { Difficulty } from '../types/game';

export interface IDifficultySettings {
  shelfSize: number;
  maxCauldronIngredients: number;
  startTime: number;
  tolerance: number;
  lives: number;
  scorePerBrew: number;
  timeBonus: number;
  reactionCount: number;
}

const SECOND = 1000;

export const DIFFICULTY_SETTINGS: Record<Difficulty, IDifficultySettings> = {
  easy: {
    shelfSize: 4,
    maxCauldronIngredients: 4,
    startTime: 180 * SECOND,
    tolerance: 12,
    lives: 5,
    scorePerBrew: 100,
    timeBonus: 15 * SECOND,
    reactionCount: 0,
  },
  medium: {
    shelfSize: 6,
    maxCauldronIngredients: 4,
    startTime: 150 * SECOND,
    tolerance: 8,
    lives: 3,
    scorePerBrew: 200,
    timeBonus: 10 * SECOND,
    reactionCount: 2,
  },
  hard: {
    shelfSize: 8,
    maxCauldronIngredients: 5,
    startTime: 150 * SECOND,
    tolerance: 5,
    lives: 3,
    scorePerBrew: 300,
    timeBonus: 5 * SECOND,
    reactionCount: 3,
  },
};

export const LEVEL_1_DIFFICULTY: Difficulty = 'medium';

export const STOCK_MIN = 2;
export const STOCK_MAX = 15;
