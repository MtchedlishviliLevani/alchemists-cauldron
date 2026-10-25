import { DIFFICULTY_SETTINGS, LEVEL_1_DIFFICULTY } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import type { IDifficultySettings } from '../data/difficulty';
import type { Difficulty, GameOverReason, IGameState } from '../types/game';
import { isBrewSuccessful } from './brew-check';
import { calculateMix, firedReactions, reactionsFor } from './reactions';
import { pickRecipe } from './recipe-generator';
import { createStock, isStockEmpty, stockOf, takeFromStock } from './stock';
import { computeTimeLeft } from './timer';
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
    lastReaction: null,
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

export function canChangeDifficulty(state: IGameState): boolean {
  return state.status === 'menu' || state.status === 'game-over';
}

export function setDifficulty(state: IGameState, difficulty: Difficulty): IGameState {
  if (!canChangeDifficulty(state) || state.difficulty === difficulty) return state;
  return createMenuState(difficulty);
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

export function addIngredient(state: IGameState, id: string, now: number): IGameState {
  if (!canAddIngredient(state, id)) return state;
  const ingredient = state.shelf.find((item) => item.id === id);
  if (ingredient === undefined) return state;
  const cauldronIngredients = [...state.cauldronIngredients, ingredient];
  const added: IGameState = {
    ...state,
    cauldronIngredients,
    shelfStock: takeFromStock(state.shelfStock, id),
  };
  const fired = firedReactions(
    state.cauldronIngredients,
    cauldronIngredients,
    reactionsFor(state.difficulty)
  );
  if (fired.length === 0) return added;

  const timePenalty = fired.reduce((total, reaction) => total + (reaction.timePenalty ?? 0), 0);
  const livesLost = fired.reduce((total, reaction) => total + (reaction.livesLost ?? 0), 0);
  const clears = fired.some((reaction) => reaction.clearsCauldron === true);
  const timeLeft = remainingTime(state, now) - timePenalty;
  const reacted: IGameState = {
    ...added,
    lives: state.lives - livesLost,
    timeLeft: Math.max(0, timeLeft),
    endTime: now + Math.max(0, timeLeft),
    cauldronIngredients: clears ? [] : cauldronIngredients,
    lastReaction: {
      ids: fired.map((reaction) => reaction.id),
      count: (state.lastReaction?.count ?? 0) + 1,
    },
  };
  if (timeLeft <= 0) return endGame(reacted, 'time', now);
  return settle(reacted, now);
}

export function canBrew(state: IGameState): boolean {
  return (
    state.status === 'playing' &&
    state.activeRecipe !== null &&
    state.cauldronIngredients.length > 0
  );
}

function remainingTime(state: IGameState, now: number): number {
  return state.endTime === null ? state.timeLeft : computeTimeLeft(state.endTime, now);
}

export function endGame(state: IGameState, reason: GameOverReason, now: number): IGameState {
  return {
    ...state,
    status: 'game-over',
    timeLeft: reason === 'time' ? 0 : remainingTime(state, now),
    endTime: null,
    gameOverReason: reason,
  };
}

export function findGameOverReason(state: IGameState): GameOverReason | null {
  if (state.lives <= 0) return 'lives';
  if (state.cauldronIngredients.length === 0 && isStockEmpty(state.shelfStock)) {
    return 'ingredients';
  }
  return null;
}

function settle(state: IGameState, now: number): IGameState {
  const reason = findGameOverReason(state);
  return reason === null ? state : endGame(state, reason, now);
}

export function tick(state: IGameState, now: number): IGameState {
  if (state.status !== 'playing' || state.endTime === null) return state;
  const timeLeft = computeTimeLeft(state.endTime, now);
  if (timeLeft <= 0) return endGame(state, 'time', now);
  if (timeLeft === state.timeLeft) return state;
  return { ...state, timeLeft };
}

export function brew(state: IGameState, random: RandomSource, now: number): IGameState {
  if (!canBrew(state) || state.activeRecipe === null) return state;
  const settings = settingsFor(state);
  const values = calculateMix(state.cauldronIngredients, state.difficulty);
  const success = isBrewSuccessful(values, state.activeRecipe, settings.tolerance);
  const count = (state.lastBrew?.count ?? 0) + 1;

  if (!success) {
    return settle(
      {
        ...state,
        lives: state.lives - 1,
        timeLeft: remainingTime(state, now),
        cauldronIngredients: [],
        lastBrew: { success, count },
      },
      now
    );
  }

  const timeLeft = Math.min(remainingTime(state, now) + settings.timeBonus, settings.startTime);
  return settle(
    {
      ...state,
      score: state.score + settings.scorePerBrew,
      timeLeft,
      endTime: now + timeLeft,
      activeRecipe: pickRecipe(state.difficulty, random),
      cauldronIngredients: [],
      lastBrew: { success, count },
    },
    now
  );
}

export const POUR_OUT_PENALTY = 10 * 1000;

export function canPourOut(state: IGameState): boolean {
  return state.status === 'playing' && state.cauldronIngredients.length > 0;
}

export function pourOut(state: IGameState, now: number): IGameState {
  if (!canPourOut(state)) return state;
  const timeLeft = remainingTime(state, now) - POUR_OUT_PENALTY;
  const poured: IGameState = {
    ...state,
    timeLeft: Math.max(0, timeLeft),
    endTime: now + Math.max(0, timeLeft),
    cauldronIngredients: [],
  };
  if (timeLeft <= 0) return endGame(poured, 'time', now);
  return settle(poured, now);
}

export function pauseGame(state: IGameState, now: number): IGameState {
  if (state.status !== 'playing') return state;
  return { ...state, status: 'paused', timeLeft: remainingTime(state, now), endTime: null };
}

export function resumeGame(state: IGameState, now: number): IGameState {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'playing', endTime: now + state.timeLeft };
}
