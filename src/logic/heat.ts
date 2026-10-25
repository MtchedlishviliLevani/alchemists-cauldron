import type { IRecipeRange } from '../types/game';
import { toPercent } from './bar-geometry';

export interface IHeat {
  warm: number;
  cold: number;
}

const FULL = 100;
const SPREAD = 2;

export function heatOf(value: number, scale: IRecipeRange): IHeat {
  const offset = (toPercent(value, scale) - toPercent(0, scale)) * SPREAD;
  return {
    warm: Math.min(FULL, Math.max(0, offset)),
    cold: Math.min(FULL, Math.max(0, -offset)),
  };
}
