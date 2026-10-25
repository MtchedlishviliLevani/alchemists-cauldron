import { createDialog, DialogButton } from './dialog';
import { el } from './dom';

export interface IHelpView {
  element: HTMLDialogElement;
  open: () => void;
}

const RULES = [
  'Pick a difficulty in Settings, then press Start Game.',
  'Click an ingredient on the shelf to add it to the cauldron. Each one changes Temperature, Density and Magic Power.',
  'Every ingredient has a limited stock. Used ingredients never come back.',
  'On Medium and Hard some mixes trigger reactions that change the values, cost time or even a life. Watch the cauldron notes.',
  'Press Brew when all 3 bars glow green inside the recipe zones.',
  'A good brew gives points, extra time and a new recipe. A wrong brew costs a life.',
  'The game ends when the time runs out, all lives are lost or the ingredients run out.',
  'Use Pause at any time. A Top-10 score can be saved to the leaderboard.',
];

export function createHelp(): IHelpView {
  const dialog = createDialog({ title: 'How to play', className: 'help' });
  const close = (): void => {
    dialog.close();
  };
  dialog.element.addEventListener('cancel', close);
  dialog.body.append(
    el('ol', {
      className: 'help__rules',
      children: RULES.map((rule) => el('li', { text: rule })),
    })
  );
  dialog.actions.append(DialogButton('Got it', close));
  return { element: dialog.element, open: dialog.open };
}
