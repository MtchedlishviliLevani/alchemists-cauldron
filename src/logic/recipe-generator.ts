import { RECIPES } from '../data/recipes';
import type { Difficulty, IRecipe } from '../types/game';
import { randomInt } from './stock';
import type { RandomSource } from './stock';

export function getRecipesByDifficulty(difficulty: Difficulty): IRecipe[] {
  return RECIPES.filter((recipe) => recipe.difficulty === difficulty);
}

export function pickRecipe(difficulty: Difficulty, random: RandomSource): IRecipe {
  const available = getRecipesByDifficulty(difficulty);
  const picked = available[randomInt(0, available.length - 1, random)];
  if (picked === undefined) throw new Error(`No recipes for difficulty "${difficulty}"`);
  return picked;
}
