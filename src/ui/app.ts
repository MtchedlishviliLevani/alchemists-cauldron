import {
  addIngredient,
  brew,
  canBrew,
  createMenuState,
  pauseGame,
  resumeGame,
  setDifficulty,
  startGame,
  tick,
} from '../logic/game';
import { DIFFICULTY_LABELS } from '../logic/difficulty';
import { TICK_INTERVAL } from '../logic/timer';
import { createStore } from '../state/store';
import type { IGameState } from '../types/game';
import { createBars } from './bars';
import { createCauldron } from './cauldron';
import { el } from './dom';
import { createGameOver } from './game-over';
import { createHelp } from './help';
import { createHud } from './hud';
import { createLeaderboard } from './leaderboard';
import { createPause } from './pause';
import { createRecipePanel } from './recipe-panel';
import { createSettings } from './settings';
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
  const leaderboard = createLeaderboard();
  const gameOver = createGameOver({
    onPlayAgain: newGame,
    onMenu: toMenu,
    onLeaderboard: leaderboard.open,
  });
  const pauseDialog = createPause({ onResume: resume, onExit: toMenu });
  const settings = createSettings((difficulty) => {
    store.setState(setDifficulty(store.getState(), difficulty));
  });
  const help = createHelp();

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

  const leaderboardButton = el('button', {
    className: 'button button--secondary',
    attrs: { type: 'button' },
    text: 'Leaderboard',
  });
  leaderboardButton.addEventListener('click', () => {
    leaderboard.open(store.getState().difficulty);
  });

  const settingsButton = el('button', {
    className: 'button button--secondary',
    attrs: { type: 'button' },
    text: 'Settings',
  });
  settingsButton.addEventListener('click', settings.open);

  const helpButton = el('button', {
    className: 'button button--secondary',
    attrs: { type: 'button' },
    text: 'Help',
  });
  helpButton.addEventListener('click', help.open);

  const difficultyLabel = el('p', { className: 'header__difficulty' });

  const pauseButton = el('button', {
    className: 'button button--secondary pause-button',
    attrs: { type: 'button' },
    text: 'Pause',
  });
  pauseButton.addEventListener('click', pause);

  const header = el('header', {
    className: 'header',
    children: [
      el('div', {
        className: 'header__heading',
        children: [
          el('h1', { className: 'header__title', text: "Alchemist's Cauldron" }),
          difficultyLabel,
        ],
      }),
      hud.element,
    ],
  });

  const menuActions = el('div', {
    className: 'game__menu',
    children: [settingsButton, helpButton, leaderboardButton],
  });

  const actions = el('div', {
    className: 'game__actions',
    children: [startButton, brewButton, pauseButton, menuActions],
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
    menuActions.hidden = state.status !== 'menu';
    difficultyLabel.textContent = `Difficulty: ${DIFFICULTY_LABELS[state.difficulty]}`;
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
    settings.update(state);
    syncTicker(state);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pause();
  });

  store.subscribe(render);
  root.replaceChildren(
    game,
    gameOver.element,
    pauseDialog.element,
    settings.element,
    help.element,
    ...leaderboard.dialogs
  );
  render(store.getState());
}
