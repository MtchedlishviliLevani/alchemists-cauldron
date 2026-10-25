import { STOCK_MAX, STOCK_MIN } from '../data/difficulty';
import type { IIngredient } from '../types/game';

export type RandomSource = () => number;

export function randomInt(min: number, max: number, random: RandomSource): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function createStock(
  ingredients: readonly IIngredient[],
  random: RandomSource
): Record<string, number> {
  const stock: Record<string, number> = {};
  for (const ingredient of ingredients) {
    stock[ingredient.id] = randomInt(STOCK_MIN, STOCK_MAX, random);
  }
  return stock;
}

export function stockOf(stock: Record<string, number>, id: string): number {
  return stock[id] ?? 0;
}

export function takeFromStock(stock: Record<string, number>, id: string): Record<string, number> {
  const left = stockOf(stock, id);
  if (left <= 0) return stock;
  return { ...stock, [id]: left - 1 };
}

export function isStockEmpty(stock: Record<string, number>): boolean {
  return Object.values(stock).every((left) => left <= 0);
}
