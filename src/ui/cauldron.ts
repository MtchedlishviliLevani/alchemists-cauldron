import { BARS } from '../data/bars';
import { settingsFor } from '../logic/game';
import { heatOf } from '../logic/heat';
import { activeReactions, calculateMix, findReaction, reactionsFor } from '../logic/reactions';
import type { IGameState, IReaction } from '../types/game';
import { CauldronArt, IngredientArt, SmokeArt, SparkleArt } from './art';
import { el } from './dom';
import { hasIngredient, INGREDIENT_MIME } from './drag';

const MS_PER_SECOND = 1000;
const BUBBLE_COUNT = 5;
const STEAM_COUNT = 3;
const TEMPERATURE_SCALE = BARS.find((bar) => bar.parameter === 'temperature')?.scale ?? {
  min: 0,
  max: 0,
};

function Layer(className: string, count: number): HTMLElement {
  return el('div', {
    className,
    children: Array.from({ length: count }, (_, index) => {
      const item = el('span');
      item.style.setProperty('--index', String(index));
      return item;
    }),
  });
}

export interface ICauldronView {
  element: HTMLElement;
  update: (state: IGameState) => void;
}

export interface ICauldronActions {
  canDrop: () => boolean;
  onDrop: (id: string) => void;
}

export function createCauldron({ canDrop, onDrop }: ICauldronActions): ICauldronView {
  const list = el('ol', {
    className: 'cauldron__list',
    attrs: { 'aria-label': 'Ingredients in the cauldron' },
  });
  const empty = el('p', { className: 'panel__empty', text: 'The cauldron is empty.' });
  const active = el('p', { className: 'cauldron__active' });
  const notice = el('p', { className: 'cauldron__notice', attrs: { 'aria-live': 'polite' } });
  const floating = el('div', { className: 'pot__floating' });
  const ripple = el('div', { className: 'pot__ripple' });
  const effect = el('div', { className: 'pot__effect' });
  const pot = el('div', {
    className: 'pot',
    attrs: { 'aria-hidden': 'true' },
    children: [
      Layer('pot__steam', STEAM_COUNT),
      CauldronArt(),
      Layer('pot__bubbles', BUBBLE_COUNT),
      ripple,
      floating,
      effect,
    ],
  });
  const content = el('div', {
    className: 'cauldron__content',
    children: [list, empty, active, notice],
  });
  const element = el('section', {
    className: 'cauldron',
    attrs: { 'aria-labelledby': 'cauldron-title' },
    children: [
      el('h2', {
        className: 'cauldron__title visually-hidden',
        attrs: { id: 'cauldron-title' },
        text: 'Cauldron',
      }),
      pot,
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
              el('span', { className: 'burst__icon', children: [SparkleArt()] }),
              el('span', { className: 'burst__text', text: `+${String(bonus)} s` }),
            ],
          })
        : el('span', {
            className: 'burst burst--fail',
            children: [el('span', { className: 'burst__icon', children: [SmokeArt()] })],
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

  const showHeat = (state: IGameState): void => {
    const { temperature } = calculateMix(state.cauldronIngredients, state.difficulty);
    const heat = heatOf(temperature, TEMPERATURE_SCALE);
    pot.style.setProperty('--warm', `${String(heat.warm)}%`);
    pot.style.setProperty('--cold', `${String(heat.cold)}%`);
  };

  const update = (state: IGameState): void => {
    element.classList.toggle(
      'cauldron--lit',
      state.status === 'playing' || state.status === 'paused'
    );
    element.classList.toggle('cauldron--filled', state.cauldronIngredients.length > 0);
    showNotice(state);
    showBrewEffect(state);
    if (state.cauldronIngredients === rendered) return;
    const added = rendered !== null && state.cauldronIngredients.length > rendered.length;
    rendered = state.cauldronIngredients;
    showHeat(state);
    ripple.replaceChildren(...(added ? [el('span', { className: 'pot__wave' })] : []));
    floating.replaceChildren(
      ...state.cauldronIngredients.map((ingredient, index) => {
        const icon = el('span', { className: 'pot__icon', children: [IngredientArt(ingredient)] });
        icon.style.setProperty('--index', String(index));
        return icon;
      })
    );
    list.replaceChildren(
      ...state.cauldronIngredients.map((ingredient) =>
        el('li', {
          className: 'cauldron__item',
          children: [
            el('span', { className: 'cauldron__icon', children: [IngredientArt(ingredient)] }),
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
