export const INGREDIENT_MIME = 'application/x-alchemist-ingredient';

export function hasIngredient(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes(INGREDIENT_MIME) ?? false;
}
