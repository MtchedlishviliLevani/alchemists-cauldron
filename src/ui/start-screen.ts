import { el } from './dom';

const PARAMETERS = ['Temperature', 'Density', 'Magic Power'] as const;

function Stat(label: string, value: string): HTMLElement {
  return el('div', {
    className: 'hud__stat',
    children: [
      el('span', { className: 'hud__label', text: label }),
      el('span', { className: 'hud__value', text: value }),
    ],
  });
}

function Header(): HTMLElement {
  return el('header', {
    className: 'header',
    children: [
      el('h1', { className: 'header__title', text: "Alchemist's Cauldron" }),
      el('div', {
        className: 'hud',
        attrs: { 'aria-label': 'Game status' },
        children: [Stat('Score', '0'), Stat('Time', '00:00')],
      }),
    ],
  });
}

function Shelf(): HTMLElement {
  return el('section', {
    className: 'panel shelf',
    attrs: { 'aria-labelledby': 'shelf-title' },
    children: [
      el('h2', { className: 'panel__title', attrs: { id: 'shelf-title' }, text: 'Shelf' }),
      el('p', { className: 'panel__empty', text: 'The shelf is empty.' }),
    ],
  });
}

function Bar(name: string): HTMLElement {
  return el('div', {
    className: 'bar',
    children: [
      el('span', { className: 'bar__label', text: name }),
      el('span', { className: 'bar__track', attrs: { 'aria-hidden': 'true' } }),
      el('span', { className: 'bar__value', text: '0' }),
    ],
  });
}

function Cauldron(): HTMLElement {
  return el('section', {
    className: 'panel cauldron',
    attrs: { 'aria-labelledby': 'cauldron-title' },
    children: [
      el('h2', { className: 'panel__title', attrs: { id: 'cauldron-title' }, text: 'Cauldron' }),
      el('div', { className: 'bars', children: PARAMETERS.map(Bar) }),
      el('p', { className: 'panel__empty', text: 'The cauldron is empty.' }),
    ],
  });
}

function StartButton(): HTMLButtonElement {
  return el('button', {
    className: 'button button--primary start-button',
    attrs: { type: 'button', disabled: '' },
    text: 'Start Game',
  });
}

export function StartScreen(): HTMLElement {
  return el('main', {
    className: 'game',
    children: [
      Header(),
      el('div', { className: 'board', children: [Shelf(), Cauldron()] }),
      el('div', { className: 'game__actions', children: [StartButton()] }),
    ],
  });
}
