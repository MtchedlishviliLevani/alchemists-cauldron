import type { IGameState } from '../types/game';
import { createDialog, DialogButton } from './dialog';
import { el } from './dom';

export interface IPauseView {
  element: HTMLDialogElement;
  update: (state: IGameState) => void;
}

export interface IPauseActions {
  onResume: () => void;
  onExit: () => void;
}

export function createPause({ onResume, onExit }: IPauseActions): IPauseView {
  const dialog = createDialog({ title: 'Paused', className: 'pause', onCancel: onResume });
  dialog.body.append(el('p', { text: 'The timer is stopped. Take a breath.' }));
  dialog.actions.append(
    DialogButton('Resume', onResume),
    DialogButton('Exit to Menu', onExit, 'secondary')
  );

  const update = (state: IGameState): void => {
    if (state.status === 'paused') {
      dialog.open();
    } else {
      dialog.close();
    }
  };

  return { element: dialog.element, update };
}
