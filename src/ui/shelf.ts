import { canAddIngredient, isCauldronFull } from '../logic/game';
import { stockOf } from '../logic/stock';
import type { IGameState, IIngredient } from '../types/game';
import { el } from './dom';
import { INGREDIENT_MIME } from './drag';
import { formatSigned } from './format';

export interface IShelfView {
  element: HTMLElement;
  update: (state: IGameState) => void;
}

interface ICard {
  ingredient: IIngredient;
  button: HTMLButtonElement;
  badge: HTMLSpanElement;
}

function Stat(label: string, value: number): HTMLElement {
  return el('span', {
    className: 'card__stat',
    children: [
      el('span', { className: 'card__stat-label', text: label }),
      el('span', { className: 'card__stat-value', text: formatSigned(value) }),
    ],
  });
}

function Card(ingredient: IIngredient, onAdd: (id: string) => void): ICard {
  const badge = el('span', { className: 'card__badge', attrs: { 'aria-hidden': 'true' } });
  const button = el('button', {
    className: 'card',
    attrs: { type: 'button', 'data-id': ingredient.id },
    children: [
      el('span', {
        className: 'card__icon',
        attrs: { 'aria-hidden': 'true' },
        text: ingredient.icon,
      }),
      el('span', { className: 'card__name', text: ingredient.name }),
      el('span', {
        className: 'card__stats',
        children: [
          Stat('T', ingredient.temperature),
          Stat('D', ingredient.density),
          Stat('M', ingredient.magicPower),
        ],
      }),
      badge,
    ],
  });
  button.addEventListener('click', () => {
    onAdd(ingredient.id);
  });
  button.addEventListener('dragstart', (event) => {
    if (button.disabled || event.dataTransfer === null) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(INGREDIENT_MIME, ingredient.id);
    event.dataTransfer.effectAllowed = 'copy';
    button.classList.add('card--dragging');
  });
  button.addEventListener('dragend', () => {
    button.classList.remove('card--dragging');
  });
  return { ingredient, button, badge };
}

export function createShelf(onAdd: (id: string) => void): IShelfView {
  const list = el('div', { className: 'shelf__grid' });
  const empty = el('p', { className: 'panel__empty', text: 'The shelf is empty.' });
  const element = el('section', {
    className: 'panel shelf',
    attrs: { 'aria-labelledby': 'shelf-title' },
    children: [
      el('h2', { className: 'panel__title', attrs: { id: 'shelf-title' }, text: 'Shelf' }),
      empty,
      list,
    ],
  });

  let cards: ICard[] = [];
  let renderedShelf: IIngredient[] | null = null;

  const update = (state: IGameState): void => {
    if (state.shelf !== renderedShelf) {
      renderedShelf = state.shelf;
      cards = state.shelf.map((ingredient) => Card(ingredient, onAdd));
      list.replaceChildren(...cards.map((card) => card.button));
    }

    empty.hidden = state.shelf.length > 0;
    const blocked = state.status === 'playing' && isCauldronFull(state);
    element.classList.toggle('shelf--blocked', blocked);

    for (const card of cards) {
      const left = stockOf(state.shelfStock, card.ingredient.id);
      const isEmpty = left <= 0;
      card.badge.textContent = String(left);
      card.button.classList.toggle('card--empty', isEmpty);
      const canAdd = canAddIngredient(state, card.ingredient.id);
      card.button.disabled = !canAdd;
      card.button.draggable = canAdd;
      card.button.setAttribute(
        'aria-label',
        isEmpty
          ? `${card.ingredient.name}: out of stock`
          : `Add ${card.ingredient.name}, ${String(left)} left`
      );
    }
  };

  return { element, update };
}
