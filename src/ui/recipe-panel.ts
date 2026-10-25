import { BARS } from '../data/bars';
import { isCauldronFull, settingsFor } from '../logic/game';
import type { IGameState, IRecipeRange } from '../types/game';
import { el } from './dom';
import { formatSigned } from './format';

export interface IRecipePanelView {
  element: HTMLElement;
  update: (state: IGameState) => void;
}

function formatRange(range: IRecipeRange): string {
  return `${formatSigned(range.min)} … ${formatSigned(range.max)}`;
}

export function createRecipePanel(): IRecipePanelView {
  const name = el('p', { className: 'recipe__name', text: 'No recipe yet' });
  const ranges = BARS.map((bar) => ({
    parameter: bar.parameter,
    value: el('span', { className: 'recipe__range-value', text: '—' }),
    label: bar.label,
  }));
  const counter = el('p', { className: 'recipe__counter', attrs: { 'aria-live': 'polite' } });
  const result = el('p', { className: 'recipe__result', attrs: { 'aria-live': 'polite' } });

  const element = el('section', {
    className: 'panel recipe',
    attrs: { 'aria-labelledby': 'recipe-title' },
    children: [
      el('h2', { className: 'panel__title', attrs: { id: 'recipe-title' }, text: 'Recipe' }),
      name,
      el('ul', {
        className: 'recipe__ranges',
        children: ranges.map((range) =>
          el('li', {
            className: 'recipe__range',
            children: [
              el('span', { className: 'recipe__range-label', text: range.label }),
              range.value,
            ],
          })
        ),
      }),
      counter,
      result,
    ],
  });

  let shownBrew = 0;

  const update = (state: IGameState): void => {
    const recipe = state.activeRecipe;
    name.textContent = recipe === null ? 'No recipe yet' : recipe.name;
    for (const range of ranges) {
      range.value.textContent = recipe === null ? '—' : formatRange(recipe[range.parameter]);
    }

    const max = settingsFor(state).maxCauldronIngredients;
    const active = state.status !== 'menu';
    counter.hidden = !active;
    counter.textContent = `Ingredients: ${String(state.cauldronIngredients.length)} / ${String(max)}`;
    counter.classList.toggle('recipe__counter--full', active && isCauldronFull(state));

    const brewResult = state.lastBrew;
    if (brewResult === null || state.status === 'menu') {
      result.replaceChildren();
      shownBrew = 0;
      return;
    }
    if (brewResult.count === shownBrew) return;
    shownBrew = brewResult.count;
    const settings = settingsFor(state);
    result.replaceChildren(
      el('span', {
        className: brewResult.success ? 'recipe__result--success' : 'recipe__result--fail',
        text: brewResult.success
          ? `Perfect brew! +${String(settings.scorePerBrew)} points`
          : 'The mix failed. −1 life',
      })
    );
  };

  return { element, update };
}
