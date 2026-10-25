import { DIFFICULTY_SETTINGS } from '../data/difficulty';
import type { Difficulty } from '../types/game';

const SECOND = 1000;

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value);
}

export function describeDifficulty(difficulty: Difficulty): string {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  return [
    `${String(settings.shelfSize)} ingredients`,
    `${String(settings.startTime / SECOND)} s`,
    `±${String(settings.tolerance)}`,
    `${String(settings.lives)} lives`,
    settings.reactionCount === 0 ? 'no reactions' : `${String(settings.reactionCount)} reactions`,
  ].join(' · ');
}
