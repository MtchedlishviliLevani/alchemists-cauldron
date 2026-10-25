import { settingsFor } from '../logic/game';
import { formatTime, isLowTime } from '../logic/timer';
import type { IGameState } from '../types/game';
import { el } from './dom';

export interface IHudView {
  element: HTMLElement;
  update: (state: IGameState) => void;
}

const LIFE_ICON = '♥';

function Stat(label: string, value: HTMLElement, extra?: HTMLElement): HTMLElement {
  return el('div', {
    className: 'hud__stat',
    children: [
      el('span', { className: 'hud__label', text: label }),
      value,
      ...(extra === undefined ? [] : [extra]),
    ],
  });
}

export function createHud(): IHudView {
  const score = el('span', { className: 'hud__value', text: '0' });
  const time = el('span', { className: 'hud__value hud__time', text: '00:00' });
  const timeFill = el('span', { className: 'time-bar__fill' });
  const timeBar = el('span', {
    className: 'time-bar',
    attrs: { 'aria-hidden': 'true' },
    children: [timeFill],
  });
  const lives = el('span', { className: 'hud__value hud__lives' });
  const livesStat = Stat('Lives', lives);

  const element = el('div', {
    className: 'hud',
    attrs: { 'aria-label': 'Game status' },
    children: [Stat('Score', score), Stat('Time', time, timeBar), livesStat],
  });

  const update = (state: IGameState): void => {
    score.textContent = String(state.score);
    time.textContent = formatTime(state.timeLeft);
    const ratio = state.status === 'menu' ? 0 : state.timeLeft / settingsFor(state).startTime;
    timeFill.style.setProperty('--ratio', String(Math.min(1, Math.max(0, ratio))));

    const low = state.status === 'playing' && isLowTime(state.timeLeft);
    element.classList.toggle('hud--low-time', low);

    livesStat.hidden = state.status === 'menu';
    lives.textContent = LIFE_ICON.repeat(Math.max(0, state.lives));
    lives.setAttribute('aria-label', `${String(state.lives)} lives left`);
  };

  return { element, update };
}
