import type { IRecipeRange } from '../types/game';

export interface ISegment {
  start: number;
  size: number;
}

const FULL = 100;

export function toPercent(value: number, scale: IRecipeRange): number {
  const clamped = Math.min(Math.max(value, scale.min), scale.max);
  return ((clamped - scale.min) / (scale.max - scale.min)) * FULL;
}

export function rangeSegment(range: IRecipeRange, scale: IRecipeRange): ISegment {
  const start = toPercent(range.min, scale);
  return { start, size: toPercent(range.max, scale) - start };
}

export function fillSegment(value: number, scale: IRecipeRange): ISegment {
  const zero = toPercent(0, scale);
  const point = toPercent(value, scale);
  return { start: Math.min(zero, point), size: Math.abs(point - zero) };
}

export function isSigned(scale: IRecipeRange): boolean {
  return scale.min < 0;
}
