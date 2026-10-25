import { DIFFICULTY_SETTINGS, LEVEL_1_DIFFICULTY } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type { IDifficultySettings } from '../data/difficulty';
import type { Difficulty, IGameState } from '../types/game';
import { isBrewSuccessful } from './brew-check';
import { calculateCauldron } from './calculate-cauldron';
import { pickRecipe } from './recipe-generator';
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
    lastBrew: null,
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
    activeRecipe: pickRecipe(difficulty, random),
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

export function canBrew(state: IGameState): boolean {
  return (
    state.status === 'playing' &&
    state.activeRecipe !== null &&
    state.cauldronIngredients.length > 0
  );
}

function remainingTime(state: IGameState, now: number): number {
  return state.endTime === null ? state.timeLeft : Math.max(0, state.endTime - now);
}

export function brew(state: IGameState, random: RandomSource, now: number): IGameState {
  if (!canBrew(state) || state.activeRecipe === null) return state;
  const settings = settingsFor(state);
  const values = calculateCauldron(state.cauldronIngredients);
  const success = isBrewSuccessful(values, state.activeRecipe, settings.tolerance);
  const count = (state.lastBrew?.count ?? 0) + 1;

  if (!success) {
    return {
      ...state,
      lives: state.lives - 1,
      cauldronIngredients: [],
      lastBrew: { success, count },
    };
  }

  const timeLeft = Math.min(remainingTime(state, now) + settings.timeBonus, settings.startTime);
  return {
    ...state,
    score: state.score + settings.scorePerBrew,
    timeLeft,
    endTime: now + timeLeft,
    activeRecipe: pickRecipe(state.difficulty, random),
    cauldronIngredients: [],
    lastBrew: { success, count },
  };
}
