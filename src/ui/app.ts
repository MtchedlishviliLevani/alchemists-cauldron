import {
  addIngredient,
  brew,
  canBrew,
  canPourOut,
  createMenuState,
  isCauldronFull,
  pauseGame,
  pourOut,
  resumeGame,
  setDifficulty,
  startGame,
  tick,
} from '../logic/game';
import { DIFFICULTY_LABELS } from '../logic/difficulty';
import { hasSaveChanges, isRunning, restoreGame, toSavedGame } from '../logic/save';
import { TICK_INTERVAL } from '../logic/timer';
import { createStore } from '../state/store';
import { clearSave, loadGame, saveGame } from '../storage/save-game';
import type { IGameState } from '../types/game';
import { createBars } from './bars';
import { createCauldron } from './cauldron';
import { el } from './dom';
import { createGameOver } from './game-over';
import { createHelp } from './help';
import { createHud } from './hud';
import { bindKeyboard } from './keyboard';
import { createLeaderboard } from './leaderboard';
import { createPause } from './pause';
import { createRecipePanel } from './recipe-panel';
import { createSettings } from './settings';
import { createShelf } from './shelf';

export function mountApp(root: HTMLElement): void {
  const store = createStore(createMenuState());
  let savedGame = loadGame();

  const newGame = (): void => {
    store.setState(startGame(store.getState().difficulty, Math.random, Date.now()));
  };

  const hud = createHud();
  const add = (id: string): void => {
    store.setState(addIngredient(store.getState(), id, Date.now()));
  };
  const shelf = createShelf(add);
  const bars = createBars();
  const cauldron = createCauldron({
    canDrop: () => {
      const state = store.getState();
      return state.status === 'playing' && !isCauldronFull(state);
    },
    onDrop: add,
  });
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

  const continueButton = el('button', {
    className: 'button button--secondary continue-button',
    attrs: { type: 'button' },
    text: 'Continue Game',
  });
  continueButton.addEventListener('click', () => {
    if (savedGame === null) return;
    store.setState(restoreGame(savedGame));
  });

  const brewButton = el('button', {
    className: 'button button--primary brew-button',
    attrs: { type: 'button', 'aria-keyshortcuts': 'B' },
    text: 'Brew',
  });
  const doBrew = (): void => {
    store.setState(brew(store.getState(), Math.random, Date.now()));
  };
  brewButton.addEventListener('click', doBrew);

  const pourButton = el('button', {
    className: 'button button--secondary pour-button',
    attrs: { type: 'button', 'aria-keyshortcuts': 'O' },
    text: 'Pour Out (−10 s)',
  });
  const doPour = (): void => {
    store.setState(pourOut(store.getState(), Date.now()));
  };
  pourButton.addEventListener('click', doPour);

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
    attrs: { type: 'button', 'aria-keyshortcuts': 'P Escape' },
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
    children: [
      startButton,
      continueButton,
      brewButton,
      el('div', { className: 'game__secondary', children: [pourButton, pauseButton] }),
      menuActions,
    ],
  });

  const gauges = el('section', {
    className: 'gauges',
    attrs: { 'aria-labelledby': 'gauges-title' },
    children: [
      el('h2', { className: 'section-title', attrs: { id: 'gauges-title' }, text: 'Readings' }),
      bars.element,
    ],
  });

  const game = el('main', {
    className: 'game',
    children: [
      header,
      el('div', {
        className: 'board',
        children: [recipePanel.element, cauldron.element, gauges, actions, shelf.element],
      }),
    ],
  });

  let shakenBrew = 0;
  const shakeOnFailure = (state: IGameState): void => {
    const brewResult = state.lastBrew;
    if (brewResult === null || brewResult.count === shakenBrew) return;
    shakenBrew = brewResult.count;
    const odd = brewResult.count % 2 === 1;
    game.classList.toggle('game--shake-odd', !brewResult.success && odd);
    game.classList.toggle('game--shake-even', !brewResult.success && !odd);
  };

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
    pourButton.hidden = !inRun;
    pourButton.disabled = !canPourOut(state);
    menuActions.hidden = state.status !== 'menu';
    continueButton.hidden = state.status !== 'menu' || savedGame === null;
    difficultyLabel.textContent = `Difficulty: ${DIFFICULTY_LABELS[state.difficulty]}`;
    pauseButton.disabled = state.status !== 'playing';
    game.classList.toggle('game--menu', state.status === 'menu');
    game.classList.toggle('game--paused', state.status === 'paused');
    game.inert = state.status === 'paused';
    shakeOnFailure(state);
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

  const persist = (state: IGameState, previous: IGameState): void => {
    if (isRunning(state)) {
      if (!hasSaveChanges(previous, state)) return;
      const save = toSavedGame(state, Date.now());
      if (save !== null) saveGame(save);
      return;
    }
    if (isRunning(previous)) {
      clearSave();
      savedGame = null;
    }
  };

  window.addEventListener('pagehide', () => {
    const save = toSavedGame(store.getState(), Date.now());
    if (save !== null) saveGame(save);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pause();
  });

  bindKeyboard(store.getState, (action) => {
    switch (action.type) {
      case 'brew':
        doBrew();
        break;
      case 'pour':
        doPour();
        break;
      case 'pause':
        pause();
        break;
      case 'add': {
        const ingredient = store.getState().shelf[action.index];
        if (ingredient !== undefined) add(ingredient.id);
        break;
      }
    }
  });

  store.subscribe(persist);
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
