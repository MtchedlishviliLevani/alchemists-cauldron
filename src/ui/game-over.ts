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
}

const REASONS: Record<GameOverReason, string> = {
  time: "Time's up",
  lives: 'No lives left',
  ingredients: 'Out of ingredients',
};

export function createGameOver({ onPlayAgain, onMenu }: IGameOverActions): IGameOverView {
  const dialog = createDialog({ title: 'Game Over', className: 'game-over' });
  const reason = el('p', { className: 'game-over__reason' });
  const score = el('p', { className: 'game-over__score' });
  dialog.body.append(reason, score);
  dialog.actions.append(
    DialogButton('Play again', onPlayAgain),
    DialogButton('Main menu', onMenu, 'secondary')
  );

  const update = (state: IGameState): void => {
    if (state.status !== 'game-over') {
      dialog.close();
      return;
    }
    reason.textContent = state.gameOverReason === null ? '' : REASONS[state.gameOverReason];
    score.textContent = `Final score: ${String(state.score)}`;
    dialog.open();
  };

  return { element: dialog.element, update };
}
