import { formatEntryDate } from '../logic/leaderboard';
import type { ILeaderboardEntry } from '../logic/leaderboard';
import { clearLeaderboard, loadLeaderboard } from '../storage/leaderboard';
import { createDialog, DialogButton } from './dialog';
import { el } from './dom';

export interface ILeaderboardView {
  dialogs: HTMLDialogElement[];
  open: (highlight?: ILeaderboardEntry) => void;
}

const COLUMNS = ['#', 'Name', 'Score', 'Date'];

function Row(entry: ILeaderboardEntry, rank: number, highlighted: boolean): HTMLTableRowElement {
  return el('tr', {
    className: highlighted ? 'leaderboard__row leaderboard__row--new' : 'leaderboard__row',
    children: [
      el('td', { text: String(rank) }),
      el('td', { text: entry.name }),
      el('td', { text: String(entry.score) }),
      el('td', { text: formatEntryDate(entry.date) }),
    ],
  });
}

export function createLeaderboard(): ILeaderboardView {
  const tbody = el('tbody');
  const empty = el('p', { className: 'leaderboard__empty', text: 'No results yet. Be the first!' });
  const table = el('table', {
    className: 'leaderboard__table',
    children: [
      el('caption', { className: 'visually-hidden', text: 'Top 10 results' }),
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

  const board = createDialog({ title: 'Top 10', className: 'leaderboard' });
  const confirm = createDialog({ title: 'Clear the leaderboard?', className: 'confirm' });
  const clearButton = DialogButton(
    'Clear Leaderboard',
    () => {
      confirm.open();
    },
    'secondary'
  );

  const render = (highlight?: ILeaderboardEntry): void => {
    const entries = loadLeaderboard();
    tbody.replaceChildren(
      ...entries.map((entry, index) =>
        Row(entry, index + 1, entry.date === highlight?.date && entry.name === highlight.name)
      )
    );
    table.hidden = entries.length === 0;
    empty.hidden = entries.length > 0;
    clearButton.disabled = entries.length === 0;
  };

  board.body.append(table, empty);
  board.actions.append(
    DialogButton('Close', () => {
      board.close();
    }),
    clearButton
  );
  board.element.addEventListener('cancel', () => {
    board.close();
  });

  confirm.body.append(
    el('p', { text: 'All saved results will be removed. This cannot be undone.' })
  );
  confirm.actions.append(
    DialogButton('Clear', () => {
      clearLeaderboard();
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
    open: (highlight) => {
      render(highlight);
      board.open();
    },
  };
}
