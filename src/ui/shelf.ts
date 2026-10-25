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

function TooltipRow(label: string, value: number): HTMLElement {
  return el('span', {
    className: 'tooltip__row',
    children: [
      el('span', { className: 'tooltip__label', text: label }),
      el('span', { className: 'tooltip__value', text: formatSigned(value) }),
    ],
  });
}

function Tooltip(ingredient: IIngredient): HTMLElement {
  return el('span', {
    className: 'tooltip',
    attrs: { id: `tooltip-${ingredient.id}`, role: 'tooltip' },
    children: [
      el('span', { className: 'tooltip__title', text: ingredient.name }),
      TooltipRow('Temperature', ingredient.temperature),
      TooltipRow('Density', ingredient.density),
      TooltipRow('Magic Power', ingredient.magicPower),
    ],
  });
}

function placeTooltip(card: HTMLElement, tooltip: HTMLElement): void {
  const cardBox = card.getBoundingClientRect();
  const tipBox = tooltip.getBoundingClientRect();
  const viewport = document.documentElement;
  const fitsRight = cardBox.right + tipBox.width <= viewport.clientWidth;
  const fitsLeft = cardBox.left - tipBox.width >= 0;
  const stacked = !fitsRight && !fitsLeft;
  const bottom = stacked ? cardBox.bottom : cardBox.top;
  tooltip.classList.toggle('tooltip--left', !fitsRight && fitsLeft);
  tooltip.classList.toggle('tooltip--stacked', stacked);
  tooltip.classList.toggle('tooltip--up', bottom + tipBox.height > viewport.clientHeight);
}

function Card(ingredient: IIngredient, slot: number, onAdd: (id: string) => void): ICard {
  const badge = el('span', { className: 'card__badge', attrs: { 'aria-hidden': 'true' } });
  const tooltip = Tooltip(ingredient);
  const button = el('button', {
    className: 'card',
    attrs: {
      type: 'button',
      'data-id': ingredient.id,
      'aria-describedby': tooltip.id,
      'aria-keyshortcuts': String(slot),
    },
    children: [
      el('span', {
        className: 'card__icon',
        attrs: { 'aria-hidden': 'true' },
        text: ingredient.icon,
      }),
      el('span', { className: 'card__name', text: ingredient.name }),
      badge,
      el('kbd', { className: 'card__key', attrs: { 'aria-hidden': 'true' }, text: String(slot) }),
      tooltip,
    ],
  });
  button.addEventListener('click', () => {
    onAdd(ingredient.id);
  });
  const place = (): void => {
    placeTooltip(button, tooltip);
  };
  button.addEventListener('mouseenter', place);
  button.addEventListener('focus', place);
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
      cards = state.shelf.map((ingredient, index) => Card(ingredient, index + 1, onAdd));
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
