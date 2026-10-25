import { calculateCauldron as totals } from '../logic/calculate-cauldron';
import type { IIngredient, IReaction } from '../types/game';

const SECOND = 1000;
const ANNIHILATION_LIMIT = 15;
const PRESSURE_LIMIT = 70;
const ARCANE_LIMIT = 80;

function has(ingredients: readonly IIngredient[], ...ids: string[]): boolean {
  return ids.every((id) => ingredients.some((ingredient) => ingredient.id === id));
}

function scale(value: number, factor: number): number {
  return Math.round(value * factor);
}

export const REACTIONS: readonly IReaction[] = [
  {
    id: 'bubbling',
    name: 'Bubbling',
    kind: 'ingredients',
    effect: 'Magic Power +50%, −10 s',
    isActive: (list) => has(list, 'fairy-dust', 'caustic-acid'),
    apply: (values) => ({ ...values, magicPower: scale(values.magicPower, 1.5) }),
    timePenalty: 10 * SECOND,
  },
  {
    id: 'volatile-mix',
    name: 'Volatile Mix',
    kind: 'ingredients',
    effect: '−1 life, the cauldron is cleared',
    isActive: (list) => has(list, 'phoenix-feather', 'essence-of-the-void'),
    apply: (values) => values,
    livesLost: 1,
    clearsCauldron: true,
  },
  {
    id: 'solar-frost',
    name: 'Solar Frost',
    kind: 'ingredients',
    effect: 'Temperature set to 0, Density +20%',
    isActive: (list) => has(list, 'dragon-tears', 'frost-lotus'),
    apply: (values) => ({ ...values, temperature: 0, density: scale(values.density, 1.2) }),
  },
  {
    id: 'rooted-steam',
    name: 'Rooted Steam',
    kind: 'ingredients',
    effect: 'Density +25%, Magic Power −10%',
    isActive: (list) => has(list, 'mandrake-root', 'toad-slime'),
    apply: (values) => ({
      ...values,
      density: scale(values.density, 1.25),
      magicPower: scale(values.magicPower, 0.9),
    }),
  },
  {
    id: 'ashen-bloom',
    name: 'Ashen Bloom',
    kind: 'ingredients',
    effect: 'Temperature +10, Magic Power +25%',
    isActive: (list) => has(list, 'phoenix-feather', 'fairy-dust'),
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 10,
      magicPower: scale(values.magicPower, 1.25),
    }),
  },
  {
    id: 'annihilation',
    name: 'Annihilation',
    kind: 'stats',
    effect: 'Temperature set to 0, Density doubled',
    isActive: (list) =>
      list.some((item) => item.temperature > ANNIHILATION_LIMIT) &&
      list.some((item) => item.temperature < -ANNIHILATION_LIMIT),
    apply: (values) => ({ ...values, temperature: 0, density: values.density * 2 }),
  },
  {
    id: 'pressure-spike',
    name: 'Pressure Spike',
    kind: 'stats',
    effect: 'Density set to 70, Magic Power +10%',
    isActive: (list) => totals(list).density >= PRESSURE_LIMIT,
    apply: (values) => ({
      ...values,
      density: PRESSURE_LIMIT,
      magicPower: scale(values.magicPower, 1.1),
    }),
  },
  {
    id: 'magma-flux',
    name: 'Magma Flux',
    kind: 'stats',
    effect: 'Magic Power +20%, Density −10%',
    isActive: (list) => totals(list).temperature >= 60,
    apply: (values) => ({
      ...values,
      density: scale(values.density, 0.9),
      magicPower: scale(values.magicPower, 1.2),
    }),
  },
  {
    id: 'deep-freeze',
    name: 'Deep Freeze',
    kind: 'stats',
    effect: 'Density +15%, Magic Power −15%',
    isActive: (list) => totals(list).temperature <= -20,
    apply: (values) => ({
      ...values,
      density: scale(values.density, 1.15),
      magicPower: scale(values.magicPower, 0.85),
    }),
  },
  {
    id: 'arcane-saturation',
    name: 'Arcane Saturation',
    kind: 'stats',
    effect: 'Magic Power set to 80, Temperature +5',
    isActive: (list) => totals(list).magicPower >= ARCANE_LIMIT,
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 5,
      magicPower: ARCANE_LIMIT,
    }),
  },
  {
    id: 'steam-burst',
    name: 'Steam Burst',
    kind: 'mix',
    effect: 'Temperature +10, −5 s',
    isActive: (list) => has(list, 'dragon-tears', 'caustic-acid') && totals(list).temperature >= 35,
    apply: (values) => ({ ...values, temperature: values.temperature + 10 }),
    timePenalty: 5 * SECOND,
  },
  {
    id: 'black-ice',
    name: 'Black Ice',
    kind: 'mix',
    effect: 'Temperature −10, Magic Power +20%',
    isActive: (list) =>
      has(list, 'frost-lotus', 'essence-of-the-void') && totals(list).density <= 0,
    apply: (values) => ({
      ...values,
      temperature: values.temperature - 10,
      magicPower: scale(values.magicPower, 1.2),
    }),
  },
  {
    id: 'heavy-spark',
    name: 'Heavy Spark',
    kind: 'mix',
    effect: 'Density +20%, Magic Power +10%',
    isActive: (list) => has(list, 'fairy-dust', 'toad-slime') && totals(list).density >= 40,
    apply: (values) => ({
      ...values,
      density: scale(values.density, 1.2),
      magicPower: scale(values.magicPower, 1.1),
    }),
  },
  {
    id: 'burning-root',
    name: 'Burning Root',
    kind: 'mix',
    effect: 'Temperature +15, Density −10%',
    isActive: (list) =>
      has(list, 'mandrake-root', 'phoenix-feather') && totals(list).temperature >= 40,
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 15,
      density: scale(values.density, 0.9),
    }),
  },
  {
    id: 'void-resonance',
    name: 'Void Resonance',
    kind: 'mix',
    effect: 'Magic Power +30%, Temperature −5',
    isActive: (list) =>
      has(list, 'essence-of-the-void', 'dragon-tears') && totals(list).magicPower >= 50,
    apply: (values) => ({
      ...values,
      temperature: values.temperature - 5,
      magicPower: scale(values.magicPower, 1.3),
    }),
  },
];
