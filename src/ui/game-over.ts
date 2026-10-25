import {
  insertEntry,
  NAME_MAX_LENGTH,
  qualifiesForLeaderboard,
  validatePlayerName,
} from '../logic/leaderboard';
import type { ILeaderboardEntry } from '../logic/leaderboard';
import { loadLeaderboard, saveLeaderboard } from '../storage/leaderboard';
import type { GameOverReason, IGameState } from '../types/game';
import { createDialog, DialogButton } from './dialog';
import { el } from './dom';

export interface IGameOverView {
  element: HTMLDialogElement;
  update: (state: IGameState) => void;
}

export interface IGameOverActions {
  onPlayAgain: () => void;
  onMenu: () => void;
  onLeaderboard: (highlight?: ILeaderboardEntry) => void;
}

const REASONS: Record<GameOverReason, string> = {
  time: "Time's up",
  lives: 'No lives left',
  ingredients: 'Out of ingredients',
};

export function createGameOver({
  onPlayAgain,
  onMenu,
  onLeaderboard,
}: IGameOverActions): IGameOverView {
  const dialog = createDialog({ title: 'Game Over', className: 'game-over' });
  const reason = el('p', { className: 'game-over__reason' });
  const score = el('p', { className: 'game-over__score' });

  const nameInput = el('input', {
    className: 'name-form__input',
    attrs: {
      id: 'player-name',
      name: 'player-name',
      type: 'text',
      autocomplete: 'nickname',
      maxlength: String(NAME_MAX_LENGTH),
      required: '',
      'aria-describedby': 'player-name-error',
    },
  });
  const nameError = el('p', {
    className: 'name-form__error',
    attrs: { id: 'player-name-error', 'aria-live': 'polite' },
  });
  const form = el('form', {
    className: 'name-form',
    attrs: { novalidate: '' },
    children: [
      el('label', {
        className: 'name-form__label',
        attrs: { for: 'player-name' },
        text: 'New Top-10 result! Enter your name:',
      }),
      el('div', {
        className: 'name-form__row',
        children: [
          nameInput,
          el('button', {
            className: 'button button--primary',
            attrs: { type: 'submit' },
            text: 'Save',
          }),
        ],
      }),
      nameError,
    ],
  });
  const saved = el('p', {
    className: 'game-over__saved',
    text: 'Result saved to the leaderboard.',
  });

  dialog.body.append(reason, score, form, saved);
  dialog.actions.append(
    DialogButton('Play again', onPlayAgain),
    DialogButton(
      'Leaderboard',
      () => {
        onLeaderboard();
      },
      'secondary'
    ),
    DialogButton('Main menu', onMenu, 'secondary')
  );

  let finalScore = 0;
  let wasOver = false;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = validatePlayerName(nameInput.value);
    nameError.textContent = error ?? '';
    nameInput.setAttribute('aria-invalid', String(error !== null));
    if (error !== null) return;

    const entry: ILeaderboardEntry = {
      name: nameInput.value.trim(),
      score: finalScore,
      date: Date.now(),
    };
    saveLeaderboard(insertEntry(loadLeaderboard(), entry));
    form.hidden = true;
    saved.hidden = false;
    onLeaderboard(entry);
  });

  nameInput.addEventListener('input', () => {
    nameError.textContent = '';
    nameInput.removeAttribute('aria-invalid');
  });

  const update = (state: IGameState): void => {
    const isOver = state.status === 'game-over';
    if (!isOver) {
      wasOver = false;
      dialog.close();
      return;
    }
    if (wasOver) return;
    wasOver = true;

    finalScore = state.score;
    reason.textContent = state.gameOverReason === null ? '' : REASONS[state.gameOverReason];
    score.textContent = `Final score: ${String(state.score)}`;
    const qualifies = qualifiesForLeaderboard(loadLeaderboard(), state.score);
    form.hidden = !qualifies;
    saved.hidden = true;
    nameInput.value = '';
    nameError.textContent = '';
    nameInput.removeAttribute('aria-invalid');
    dialog.open();
    if (qualifies) nameInput.focus();
  };

  return { element: dialog.element, update };
}
