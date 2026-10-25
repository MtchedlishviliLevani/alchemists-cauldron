import { BARS } from '../data/bars';
import type { IBarConfig } from '../data/bars';
import { fillSegment, isSigned, rangeSegment, toPercent } from '../logic/bar-geometry';
import type { ISegment } from '../logic/bar-geometry';
import { checkedRange, isInRange } from '../logic/brew-check';
import { calculateCauldron } from '../logic/calculate-cauldron';
import { settingsFor } from '../logic/game';
import type { IGameState } from '../types/game';
import { el } from './dom';
import { formatSigned } from './format';

export interface IBarsView {
  element: HTMLElement;
  update: (state: IGameState) => void;
}

interface IBar {
  config: IBarConfig;
  root: HTMLElement;
  tolerance: HTMLElement;
  target: HTMLElement;
  fill: HTMLElement;
  marker: HTMLElement;
  value: HTMLElement;
}

function placeSegment(node: HTMLElement, segment: ISegment): void {
  node.style.setProperty('--start', `${String(segment.start)}%`);
  node.style.setProperty('--size', `${String(segment.size)}%`);
}

function Bar(config: IBarConfig): IBar {
  const tolerance = el('span', { className: 'bar__zone bar__zone--tolerance' });
  const target = el('span', { className: 'bar__zone bar__zone--target' });
  const fill = el('span', { className: 'bar__fill' });
  const marker = el('span', { className: 'bar__marker' });
  const track = el('span', {
    className: 'bar__track',
    attrs: { 'aria-hidden': 'true' },
    children: [tolerance, target, fill, marker],
  });
  if (isSigned(config.scale)) {
    const zero = el('span', { className: 'bar__zero' });
    zero.style.setProperty('--start', `${String(toPercent(0, config.scale))}%`);
    track.append(zero);
  }
  const value = el('span', { className: 'bar__value', text: '0' });
  const root = el('div', {
    className: 'bar',
    children: [el('span', { className: 'bar__label', text: config.label }), track, value],
  });
  return { config, root, tolerance, target, fill, marker, value };
}

export function createBars(): IBarsView {
  const bars = BARS.map(Bar);
  const element = el('div', {
    className: 'bars',
    attrs: { role: 'group', 'aria-label': 'Cauldron parameters' },
    children: bars.map((bar) => bar.root),
  });

  const update = (state: IGameState): void => {
    const values = calculateCauldron(state.cauldronIngredients);
    const recipe = state.activeRecipe;
    const tolerance = settingsFor(state).tolerance;

    for (const bar of bars) {
      const { parameter, scale, label } = bar.config;
      const current = values[parameter];
      placeSegment(bar.fill, fillSegment(current, scale));
      bar.marker.style.setProperty('--start', `${String(toPercent(current, scale))}%`);
      bar.value.textContent = formatSigned(current);

      const hasRecipe = recipe !== null;
      bar.target.hidden = !hasRecipe;
      bar.tolerance.hidden = !hasRecipe;
      let matched = false;
      if (hasRecipe) {
        const range = recipe[parameter];
        const checked = checkedRange(range, tolerance);
        placeSegment(bar.target, rangeSegment(range, scale));
        placeSegment(bar.tolerance, rangeSegment(checked, scale));
        matched = state.cauldronIngredients.length > 0 && isInRange(current, checked);
      }
      bar.root.classList.toggle('bar--matched', matched);
      bar.root.setAttribute(
        'aria-label',
        `${label}: ${formatSigned(current)}${matched ? ', inside the target zone' : ''}`
      );
    }
  };

  return { element, update };
}
