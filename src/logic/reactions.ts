import { DIFFICULTY_SETTINGS } from '../data/difficulty';
import { REACTIONS } from '../data/reactions';
import type { Difficulty, ICauldronValues, IIngredient, IReaction } from '../types/game';
import { calculateCauldron } from './calculate-cauldron';

export function reactionsFor(difficulty: Difficulty): IReaction[] {
  const { reactionIds, reactionCount } = DIFFICULTY_SETTINGS[difficulty];
  const allowed = reactionIds.slice(0, reactionCount);
  return REACTIONS.filter((reaction) => allowed.includes(reaction.id));
}

export function findReaction(id: string): IReaction | undefined {
  return REACTIONS.find((reaction) => reaction.id === id);
}

export function activeReactions(
  ingredients: readonly IIngredient[],
  reactions: readonly IReaction[]
): IReaction[] {
  return reactions.filter((reaction) => reaction.isActive(ingredients));
}

export function firedReactions(
  before: readonly IIngredient[],
  after: readonly IIngredient[],
  reactions: readonly IReaction[]
): IReaction[] {
  return reactions.filter((reaction) => !reaction.isActive(before) && reaction.isActive(after));
}

export function applyReactions(
  values: ICauldronValues,
  reactions: readonly IReaction[]
): ICauldronValues {
  return reactions.reduce((current, reaction) => reaction.apply(current), values);
}

export function calculateMix(
  ingredients: readonly IIngredient[],
  difficulty: Difficulty
): ICauldronValues {
  const active = activeReactions(ingredients, reactionsFor(difficulty));
  return applyReactions(calculateCauldron(ingredients), active);
}
