import { addIngredient, createMenuState, startGame } from '../logic/game';
import { createStore } from '../state/store';
import type { IGameState } from '../types/game';
import { createCauldron } from './cauldron';
import { el } from './dom';
import { createShelf } from './shelf';

function Stat(label: string, value: HTMLElement): HTMLElement {
  return el('div', {
    className: 'hud__stat',
    children: [el('span', { className: 'hud__label', text: label }), value],
  });
}

export function mountApp(root: HTMLElement): void {
  const store = createStore(createMenuState());

  const scoreValue = el('span', { className: 'hud__value', text: '0' });
  const timeValue = el('span', { className: 'hud__value', text: '00:00' });

  const shelf = createShelf((id) => {
    store.setState(addIngredient(store.getState(), id));
  });
  const cauldron = createCauldron();

  const startButton = el('button', {
    className: 'button button--primary start-button',
    attrs: { type: 'button' },
    text: 'Start Game',
  });
  startButton.addEventListener('click', () => {
    store.setState(startGame(store.getState().difficulty, Math.random, Date.now()));
  });

  const header = el('header', {
    className: 'header',
    children: [
      el('h1', { className: 'header__title', text: "Alchemist's Cauldron" }),
      el('div', {
        className: 'hud',
        attrs: { 'aria-label': 'Game status' },
        children: [Stat('Score', scoreValue), Stat('Time', timeValue)],
      }),
    ],
  });

  const actions = el('div', { className: 'game__actions', children: [startButton] });

  const game = el('main', {
    className: 'game',
    children: [
      header,
      el('div', { className: 'board', children: [shelf.element, cauldron.element] }),
      actions,
    ],
  });

  const render = (state: IGameState): void => {
    scoreValue.textContent = String(state.score);
    startButton.hidden = state.status === 'playing' || state.status === 'paused';
    shelf.update(state);
    cauldron.update(state);
  };

  store.subscribe(render);
  render(store.getState());
  root.replaceChildren(game);
}
