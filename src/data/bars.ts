import type { IRecipeRange, Parameter } from '../types/game';

export interface IBarConfig {
  parameter: Parameter;
  label: string;
  scale: IRecipeRange;
}

export const BARS: readonly IBarConfig[] = [
  { parameter: 'temperature', label: 'Temperature', scale: { min: -120, max: 120 } },
  { parameter: 'density', label: 'Density', scale: { min: -120, max: 120 } },
  { parameter: 'magicPower', label: 'Magic Power', scale: { min: 0, max: 200 } },
];
