import {
  addIngredient,
  brew,
  canBrew,
  createMenuState,
  pauseGame,
  resumeGame,
  startGame,
  tick,
} from '../logic/game';
import { TICK_INTERVAL } from '../logic/timer';
import { createStore } from '../state/store';
import type { IGameState } from '../types/game';
import { createBars } from './bars';
import { createCauldron } from './cauldron';
import { el } from './dom';
import { createGameOver } from './game-over';
import { createHud } from './hud';
import { createPause } from './pause';
import { createRecipePanel } from './recipe-panel';
import { createShelf } from './shelf';

export function mountApp(root: HTMLElement): void {
  const store = createStore(createMenuState());

  const newGame = (): void => {
    store.setState(startGame(store.getState().difficulty, Math.random, Date.now()));
  };

  const hud = createHud();
  const shelf = createShelf((id) => {
    store.setState(addIngredient(store.getState(), id));
  });
  const bars = createBars();
  const cauldron = createCauldron(bars.element);
  const recipePanel = createRecipePanel();
  const toMenu = (): void => {
    store.setState(createMenuState(store.getState().difficulty));
  };
  const pause = (): void => {
    store.setState(pauseGame(store.getState(), Date.now()));
  };
  const resume = (): void => {
    store.setState(resumeGame(store.getState(), Date.now()));
  };
  const gameOver = createGameOver({ onPlayAgain: newGame, onMenu: toMenu });
  const pauseDialog = createPause({ onResume: resume, onExit: toMenu });

  const startButton = el('button', {
    className: 'button button--primary start-button',
    attrs: { type: 'button' },
    text: 'Start Game',
  });
  startButton.addEventListener('click', newGame);

  const brewButton = el('button', {
    className: 'button button--primary brew-button',
    attrs: { type: 'button' },
    text: 'Brew',
  });
  brewButton.addEventListener('click', () => {
    store.setState(brew(store.getState(), Math.random, Date.now()));
  });

  const pauseButton = el('button', {
    className: 'button button--secondary pause-button',
    attrs: { type: 'button' },
    text: 'Pause',
  });
  pauseButton.addEventListener('click', pause);

  const header = el('header', {
    className: 'header',
    children: [el('h1', { className: 'header__title', text: "Alchemist's Cauldron" }), hud.element],
  });

  const actions = el('div', {
    className: 'game__actions',
    children: [startButton, brewButton, pauseButton],
  });

  const game = el('main', {
    className: 'game',
    children: [
      header,
      el('div', {
        className: 'board',
        children: [shelf.element, recipePanel.element, cauldron.element],
      }),
      actions,
    ],
  });

  let ticker = 0;
  const syncTicker = (state: IGameState): void => {
    if (state.status === 'playing' && ticker === 0) {
      ticker = window.setInterval(() => {
        store.setState(tick(store.getState(), Date.now()));
      }, TICK_INTERVAL);
    } else if (state.status !== 'playing' && ticker !== 0) {
      window.clearInterval(ticker);
      ticker = 0;
    }
  };

  const render = (state: IGameState): void => {
    const inRun = state.status === 'playing' || state.status === 'paused';
    startButton.hidden = inRun || state.status === 'game-over';
    brewButton.hidden = !inRun;
    brewButton.disabled = !canBrew(state);
    pauseButton.hidden = !inRun;
    pauseButton.disabled = state.status !== 'playing';
    game.classList.toggle('game--paused', state.status === 'paused');
    game.inert = state.status === 'paused';
    hud.update(state);
    shelf.update(state);
    cauldron.update(state);
    bars.update(state);
    recipePanel.update(state);
    gameOver.update(state);
    pauseDialog.update(state);
    syncTicker(state);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pause();
  });

  store.subscribe(render);
  root.replaceChildren(game, gameOver.element, pauseDialog.element);
  render(store.getState());
}
