import type { ICauldronValues, IRecipe, IRecipeRange, Parameter } from '../types/game';

export const PARAMETERS: readonly Parameter[] = ['temperature', 'density', 'magicPower'];

export function checkedRange(range: IRecipeRange, tolerance: number): IRecipeRange {
  return { min: range.min - tolerance, max: range.max + tolerance };
}

export function isInRange(value: number, range: IRecipeRange): boolean {
  return value >= range.min && value <= range.max;
}

export function isParameterMatched(
  values: ICauldronValues,
  recipe: IRecipe,
  parameter: Parameter,
  tolerance: number
): boolean {
  return isInRange(values[parameter], checkedRange(recipe[parameter], tolerance));
}

export function isBrewSuccessful(
  values: ICauldronValues,
  recipe: IRecipe,
  tolerance: number
): boolean {
  return PARAMETERS.every((parameter) => isParameterMatched(values, recipe, parameter, tolerance));
}
