import { DIFFICULTY_SETTINGS, LEVEL_1_DIFFICULTY } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type { IDifficultySettings } from '../data/difficulty';
import type { Difficulty, IGameState } from '../types/game';
import { createStock, stockOf, takeFromStock } from './stock';
import type { RandomSource } from './stock';

export function settingsFor(state: Pick<IGameState, 'difficulty'>): IDifficultySettings {
  return DIFFICULTY_SETTINGS[state.difficulty];
}

export function createMenuState(difficulty: Difficulty = LEVEL_1_DIFFICULTY): IGameState {
  return {
    status: 'menu',
    difficulty,
    score: 0,
    timeLeft: 0,
    endTime: null,
    lives: 0,
    activeRecipe: null,
    shelf: [],
    cauldronIngredients: [],
    shelfStock: {},
    gameOverReason: null,
  };
}

export function startGame(difficulty: Difficulty, random: RandomSource, now: number): IGameState {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const shelf = INGREDIENTS.slice(0, settings.shelfSize);
  return {
    ...createMenuState(difficulty),
    status: 'playing',
    timeLeft: settings.startTime,
    endTime: now + settings.startTime,
    lives: settings.lives,
    shelf,
    shelfStock: createStock(shelf, random),
  };
}

export function isCauldronFull(state: IGameState): boolean {
  return state.cauldronIngredients.length >= settingsFor(state).maxCauldronIngredients;
}

export function canAddIngredient(state: IGameState, id: string): boolean {
  return (
    state.status === 'playing' &&
    !isCauldronFull(state) &&
    stockOf(state.shelfStock, id) > 0 &&
    state.shelf.some((ingredient) => ingredient.id === id)
  );
}

export function addIngredient(state: IGameState, id: string): IGameState {
  if (!canAddIngredient(state, id)) return state;
  const ingredient = state.shelf.find((item) => item.id === id);
  if (ingredient === undefined) return state;
  return {
    ...state,
    cauldronIngredients: [...state.cauldronIngredients, ingredient],
    shelfStock: takeFromStock(state.shelfStock, id),
  };
}
