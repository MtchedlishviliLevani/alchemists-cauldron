import { DIFFICULTY_SETTINGS, STOCK_MAX } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type { Difficulty, IGameState, IIngredient, IRecipe } from '../types/game';
import { isDifficulty } from './difficulty';
import { createMenuState } from './game';
import { getRecipesByDifficulty } from './recipe-generator';
import { isStockEmpty } from './stock';
import { computeTimeLeft } from './timer';

export type SavedStatus = 'playing' | 'paused';

export interface ISavedGame {
  difficulty: Difficulty;
  status: SavedStatus;
  score: number;
  timeLeft: number;
  lives: number;
  activeRecipe: IRecipe;
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>;
}

const SECOND = 1000;

export function isRunning(state: Pick<IGameState, 'status'>): boolean {
  return state.status === 'playing' || state.status === 'paused';
}

function shelfFor(difficulty: Difficulty): IIngredient[] {
  return INGREDIENTS.slice(0, DIFFICULTY_SETTINGS[difficulty].shelfSize);
}

export function toSavedGame(state: IGameState, now: number): ISavedGame | null {
  if (!isRunning(state) || state.activeRecipe === null) return null;
  const timeLeft =
    state.status === 'playing' && state.endTime !== null
      ? computeTimeLeft(state.endTime, now)
      : state.timeLeft;
  return {
    difficulty: state.difficulty,
    status: state.status === 'playing' ? 'playing' : 'paused',
    score: state.score,
    timeLeft,
    lives: state.lives,
    activeRecipe: state.activeRecipe,
    cauldronIngredients: state.cauldronIngredients,
    shelfStock: state.shelfStock,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isWholeNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function idOf(value: unknown): string | null {
  return isRecord(value) && typeof value.id === 'string' ? value.id : null;
}

function findRecipe(value: unknown, difficulty: Difficulty): IRecipe | undefined {
  const id = idOf(value);
  return getRecipesByDifficulty(difficulty).find((recipe) => recipe.id === id);
}

function findIngredients(value: unknown, shelf: readonly IIngredient[]): IIngredient[] | null {
  if (!Array.isArray(value)) return null;
  const found: IIngredient[] = [];
  for (const item of value) {
    const id = idOf(item);
    const ingredient = shelf.find((entry) => entry.id === id);
    if (ingredient === undefined) return null;
    found.push(ingredient);
  }
  return found;
}

function readStock(value: unknown, shelf: readonly IIngredient[]): Record<string, number> | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).length !== shelf.length) return null;
  const stock: Record<string, number> = {};
  for (const ingredient of shelf) {
    const left = value[ingredient.id];
    if (!isWholeNumber(left, 0, STOCK_MAX)) return null;
    stock[ingredient.id] = left;
  }
  return stock;
}

export function parseSavedGame(data: unknown): ISavedGame | null {
  if (!isRecord(data) || !isDifficulty(data.difficulty)) return null;
  const { difficulty, status, score, timeLeft, lives } = data;
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const shelf = shelfFor(difficulty);

  if (status !== 'playing' && status !== 'paused') return null;
  if (!isWholeNumber(score, 0, Number.MAX_SAFE_INTEGER)) return null;
  if (typeof timeLeft !== 'number' || !(timeLeft > 0 && timeLeft <= settings.startTime)) {
    return null;
  }
  if (!isWholeNumber(lives, 1, settings.lives)) return null;

  const activeRecipe = findRecipe(data.activeRecipe, difficulty);
  const cauldronIngredients = findIngredients(data.cauldronIngredients, shelf);
  const shelfStock = readStock(data.shelfStock, shelf);
  if (activeRecipe === undefined || cauldronIngredients === null || shelfStock === null) {
    return null;
  }
  if (cauldronIngredients.length > settings.maxCauldronIngredients) return null;
  if (cauldronIngredients.length === 0 && isStockEmpty(shelfStock)) return null;

  return {
    difficulty,
    status,
    score,
    timeLeft,
    lives,
    activeRecipe,
    cauldronIngredients,
    shelfStock,
  };
}

export function isValidSave(data: unknown): boolean {
  return parseSavedGame(data) !== null;
}

export function restoreGame(save: ISavedGame): IGameState {
  return {
    ...createMenuState(save.difficulty),
    status: 'paused',
    score: save.score,
    timeLeft: save.timeLeft,
    lives: save.lives,
    activeRecipe: save.activeRecipe,
    shelf: shelfFor(save.difficulty),
    cauldronIngredients: [...save.cauldronIngredients],
    shelfStock: { ...save.shelfStock },
  };
}

function wholeSeconds(time: number): number {
  return Math.ceil(time / SECOND);
}

export function hasSaveChanges(previous: IGameState, next: IGameState): boolean {
  return (
    previous.status !== next.status ||
    previous.difficulty !== next.difficulty ||
    previous.score !== next.score ||
    previous.lives !== next.lives ||
    previous.activeRecipe !== next.activeRecipe ||
    previous.cauldronIngredients !== next.cauldronIngredients ||
    previous.shelfStock !== next.shelfStock ||
    wholeSeconds(previous.timeLeft) !== wholeSeconds(next.timeLeft)
  );
}
