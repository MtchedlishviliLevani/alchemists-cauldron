import { DIFFICULTIES, DIFFICULTY_LABELS, describeDifficulty } from '../logic/difficulty';
import type { Difficulty, IGameState } from '../types/game';
import { createDialog, DialogButton } from './dialog';
import { el } from './dom';

export interface ISettingsView {
  element: HTMLDialogElement;
  open: () => void;
  update: (state: IGameState) => void;
}

function DifficultyOption(difficulty: Difficulty, onSelect: () => void): HTMLButtonElement {
  const button = el('button', {
    className: 'difficulty-option',
    attrs: { type: 'button', 'data-difficulty': difficulty },
    children: [
      el('span', { className: 'difficulty-option__name', text: DIFFICULTY_LABELS[difficulty] }),
      el('span', {
        className: 'difficulty-option__details',
        text: describeDifficulty(difficulty),
      }),
    ],
  });
  button.addEventListener('click', onSelect);
  return button;
}

export function createSettings(onSelect: (difficulty: Difficulty) => void): ISettingsView {
  const dialog = createDialog({ title: 'Settings', className: 'settings' });
  const close = (): void => {
    dialog.close();
  };
  dialog.element.addEventListener('cancel', close);

  const options = DIFFICULTIES.map((difficulty) =>
    DifficultyOption(difficulty, () => {
      onSelect(difficulty);
      close();
    })
  );

  dialog.body.append(
    el('p', { className: 'settings__hint', text: 'Choose the difficulty before you start.' }),
    el('div', {
      className: 'settings__options',
      attrs: { role: 'group', 'aria-label': 'Difficulty' },
      children: options,
    })
  );
  dialog.actions.append(DialogButton('Close', close, 'secondary'));

  const update = (state: IGameState): void => {
    for (const option of options) {
      option.setAttribute('aria-pressed', String(option.dataset.difficulty === state.difficulty));
    }
  };

  return { element: dialog.element, open: dialog.open, update };
}
