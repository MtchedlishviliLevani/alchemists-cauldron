import { settingsFor } from '../logic/game';
import { activeReactions, findReaction, reactionsFor } from '../logic/reactions';
import type { IGameState, IReaction } from '../types/game';
import { el } from './dom';
import { hasIngredient, INGREDIENT_MIME } from './drag';

const MS_PER_SECOND = 1000;

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
  const active = el('p', { className: 'cauldron__active' });
  const notice = el('p', { className: 'cauldron__notice', attrs: { 'aria-live': 'polite' } });
  const floating = el('div', { className: 'pot__floating' });
  const effect = el('div', { className: 'pot__effect' });
  const pot = el('div', {
    className: 'pot',
    attrs: { 'aria-hidden': 'true' },
    children: [
      el('div', {
        className: 'pot__bowl',
        children: [el('div', { className: 'pot__liquid' }), floating, effect],
      }),
    ],
  });
  const content = el('div', {
    className: 'cauldron__content',
    children: [list, empty, active, notice],
  });
  const element = el('section', {
    className: 'panel cauldron',
    attrs: { 'aria-labelledby': 'cauldron-title' },
    children: [
      el('h2', { className: 'panel__title', attrs: { id: 'cauldron-title' }, text: 'Cauldron' }),
      pot,
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
  let shownReaction = 0;
  let shownBrew = 0;

  const showBrewEffect = (state: IGameState): void => {
    const brew = state.lastBrew;
    if (brew === null || state.status === 'menu') {
      effect.replaceChildren();
      shownBrew = 0;
      return;
    }
    if (brew.count === shownBrew) return;
    shownBrew = brew.count;
    const bonus = settingsFor(state).timeBonus / MS_PER_SECOND;
    effect.replaceChildren(
      brew.success
        ? el('span', {
            className: 'burst burst--success',
            children: [
              el('span', { className: 'burst__icon', text: '✨' }),
              el('span', { className: 'burst__text', text: `+${String(bonus)}s` }),
            ],
          })
        : el('span', {
            className: 'burst burst--fail',
            children: [el('span', { className: 'burst__icon', text: '💥' })],
          })
    );
  };

  const showNotice = (state: IGameState): void => {
    const event = state.lastReaction;
    if (event === null || state.status === 'menu') {
      notice.replaceChildren();
      shownReaction = 0;
      return;
    }
    if (event.count === shownReaction) return;
    shownReaction = event.count;
    const fired = event.ids
      .map(findReaction)
      .filter((reaction): reaction is IReaction => reaction !== undefined);
    notice.replaceChildren(
      ...fired.map((reaction) =>
        el('span', {
          className: 'reaction',
          children: [
            el('strong', { className: 'reaction__name', text: `${reaction.name}!` }),
            el('span', { text: reaction.effect }),
          ],
        })
      )
    );
  };

  const update = (state: IGameState): void => {
    showNotice(state);
    showBrewEffect(state);
    if (state.cauldronIngredients === rendered) return;
    rendered = state.cauldronIngredients;
    floating.replaceChildren(
      ...state.cauldronIngredients.map((ingredient, index) => {
        const icon = el('span', { className: 'pot__icon', text: ingredient.icon });
        icon.style.setProperty('--index', String(index));
        return icon;
      })
    );
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
    const names = activeReactions(state.cauldronIngredients, reactionsFor(state.difficulty)).map(
      (reaction) => reaction.name
    );
    active.textContent = names.length > 0 ? `Active: ${names.join(', ')}` : '';
  };

  return { element, update };
}
