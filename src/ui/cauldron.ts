import type { IGameState } from '../types/game';
import { el } from './dom';

export interface ICauldronView {
  element: HTMLElement;
  update: (state: IGameState) => void;
}

export function createCauldron(bars: HTMLElement): ICauldronView {
  const list = el('ol', {
    className: 'cauldron__list',
    attrs: { 'aria-label': 'Ingredients in the cauldron' },
  });
  const empty = el('p', { className: 'panel__empty', text: 'The cauldron is empty.' });
  const content = el('div', { className: 'cauldron__content', children: [list, empty] });
  const element = el('section', {
    className: 'panel cauldron',
    attrs: { 'aria-labelledby': 'cauldron-title' },
    children: [
      el('h2', { className: 'panel__title', attrs: { id: 'cauldron-title' }, text: 'Cauldron' }),
      bars,
      content,
    ],
  });

  let rendered: IGameState['cauldronIngredients'] | null = null;

  const update = (state: IGameState): void => {
    if (state.cauldronIngredients === rendered) return;
    rendered = state.cauldronIngredients;
    list.replaceChildren(
      ...state.cauldronIngredients.map((ingredient) =>
        el('li', {
          className: 'cauldron__item',
          children: [
            el('span', {
              className: 'cauldron__icon',
              attrs: { 'aria-hidden': 'true' },
              text: ingredient.icon,
            }),
            el('span', { text: ingredient.name }),
          ],
        })
      )
    );
    empty.hidden = state.cauldronIngredients.length > 0;
  };

  return { element, update };
}
