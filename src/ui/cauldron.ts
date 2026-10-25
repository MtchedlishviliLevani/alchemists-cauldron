import type { IGameState } from '../types/game';
import { el } from './dom';
import { hasIngredient, INGREDIENT_MIME } from './drag';

export interface ICauldronView {
  element: HTMLElement;
  update: (state: IGameState) => void;
}

export interface ICauldronActions {
  canDrop: () => boolean;
  onDrop: (id: string) => void;
}

export function createCauldron(
  bars: HTMLElement,
  { canDrop, onDrop }: ICauldronActions
): ICauldronView {
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

  const setDropTarget = (active: boolean): void => {
    element.classList.toggle('cauldron--drop-target', active);
  };

  element.addEventListener('dragover', (event) => {
    if (!hasIngredient(event) || !canDrop()) return;
    event.preventDefault();
    if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'copy';
    setDropTarget(true);
  });
  element.addEventListener('dragleave', (event) => {
    if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;
    setDropTarget(false);
  });
  element.addEventListener('drop', (event) => {
    event.preventDefault();
    setDropTarget(false);
    const id = event.dataTransfer?.getData(INGREDIENT_MIME) ?? '';
    if (id === '' || !canDrop()) return;
    onDrop(id);
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
