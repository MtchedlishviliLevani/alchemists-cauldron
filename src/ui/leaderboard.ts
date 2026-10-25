import { DIFFICULTIES, DIFFICULTY_LABELS } from '../logic/difficulty';
import { formatEntryDate } from '../logic/leaderboard';
import type { ILeaderboardEntry } from '../logic/leaderboard';
import { clearLeaderboard, loadLeaderboard } from '../storage/leaderboard';
import type { Difficulty } from '../types/game';
import { createDialog, DialogButton } from './dialog';
import { el } from './dom';

export interface ILeaderboardView {
  dialogs: HTMLDialogElement[];
  open: (difficulty: Difficulty, highlight?: ILeaderboardEntry) => void;
}

const COLUMNS = ['#', 'Name', 'Difficulty', 'Score', 'Date'];

function Row(entry: ILeaderboardEntry, rank: number, highlighted: boolean): HTMLTableRowElement {
  return el('tr', {
    className: highlighted ? 'leaderboard__row leaderboard__row--new' : 'leaderboard__row',
    children: [
      el('td', { text: String(rank) }),
      el('td', { text: entry.name }),
      el('td', { text: DIFFICULTY_LABELS[entry.difficulty] }),
      el('td', { text: String(entry.score) }),
      el('td', { text: formatEntryDate(entry.date) }),
    ],
  });
}

export function createLeaderboard(): ILeaderboardView {
  const tbody = el('tbody');
  const caption = el('caption', { className: 'visually-hidden' });
  const empty = el('p', { className: 'leaderboard__empty', text: 'No results yet. Be the first!' });
  const table = el('table', {
    className: 'leaderboard__table',
    children: [
      caption,
      el('thead', {
        children: [
          el('tr', {
            children: COLUMNS.map((column) => el('th', { attrs: { scope: 'col' }, text: column })),
          }),
        ],
      }),
      tbody,
    ],
  });

  let selected: Difficulty = 'medium';
  let highlighted: ILeaderboardEntry | undefined;

  const tabs = DIFFICULTIES.map((difficulty) => {
    const tab = el('button', {
      className: 'leaderboard__tab',
      attrs: { type: 'button', 'data-difficulty': difficulty },
      text: DIFFICULTY_LABELS[difficulty],
    });
    tab.addEventListener('click', () => {
      selected = difficulty;
      highlighted = undefined;
      render();
    });
    return tab;
  });
  const tabList = el('div', {
    className: 'leaderboard__tabs',
    attrs: { role: 'group', 'aria-label': 'Difficulty' },
    children: tabs,
  });

  const board = createDialog({ title: 'Top 10', className: 'leaderboard' });
  const confirm = createDialog({ title: 'Clear the leaderboard?', className: 'confirm' });
  const confirmText = el('p');
  const clearButton = DialogButton(
    'Clear Leaderboard',
    () => {
      confirm.open();
    },
    'secondary'
  );

  const render = (): void => {
    const entries = loadLeaderboard(selected);
    const label = DIFFICULTY_LABELS[selected];
    caption.textContent = `Top 10 results on ${label}`;
    confirmText.textContent = `All saved ${label} results will be removed. This cannot be undone.`;
    for (const tab of tabs) {
      tab.setAttribute('aria-pressed', String(tab.dataset.difficulty === selected));
    }
    tbody.replaceChildren(
      ...entries.map((entry, index) =>
        Row(entry, index + 1, entry.date === highlighted?.date && entry.name === highlighted.name)
      )
    );
    table.hidden = entries.length === 0;
    empty.hidden = entries.length > 0;
    clearButton.disabled = entries.length === 0;
  };

  board.body.append(tabList, table, empty);
  board.actions.append(
    DialogButton('Close', () => {
      board.close();
    }),
    clearButton
  );
  board.element.addEventListener('cancel', () => {
    board.close();
  });

  confirm.body.append(confirmText);
  confirm.actions.append(
    DialogButton('Clear', () => {
      clearLeaderboard(selected);
      confirm.close();
      render();
    }),
    DialogButton(
      'Cancel',
      () => {
        confirm.close();
      },
      'secondary'
    )
  );
  confirm.element.addEventListener('cancel', () => {
    confirm.close();
  });

  return {
    dialogs: [board.element, confirm.element],
    open: (difficulty, highlight) => {
      selected = difficulty;
      highlighted = highlight;
      render();
      board.open();
    },
  };
}
