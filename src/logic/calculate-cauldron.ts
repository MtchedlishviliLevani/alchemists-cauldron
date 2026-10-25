import type { ICauldronValues, IIngredient } from '../types/game';

export const EMPTY_VALUES: ICauldronValues = { temperature: 0, density: 0, magicPower: 0 };

export function calculateCauldron(ingredients: readonly IIngredient[]): ICauldronValues {
  return ingredients.reduce<ICauldronValues>(
    (total, ingredient) => ({
      temperature: total.temperature + ingredient.temperature,
      density: total.density + ingredient.density,
      magicPower: total.magicPower + ingredient.magicPower,
    }),
    EMPTY_VALUES
  );
}
