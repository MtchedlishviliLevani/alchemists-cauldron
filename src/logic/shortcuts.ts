import type { IGameState } from '../types/game';

export type ShortcutAction =
  { type: 'add'; index: number } | { type: 'brew' } | { type: 'pour' } | { type: 'pause' };

const COMMANDS: Readonly<Record<string, ShortcutAction>> = {
  b: { type: 'brew' },
  o: { type: 'pour' },
  p: { type: 'pause' },
  escape: { type: 'pause' },
};

const FIRST_SLOT = 1;
const LAST_SLOT = 8;

export const SHORTCUT_HELP: readonly (readonly [string, string])[] = [
  [`${String(FIRST_SLOT)}–${String(LAST_SLOT)}`, 'Add the ingredient in that shelf slot'],
  ['B', 'Brew'],
  ['O', 'Pour Out'],
  ['P / Esc', 'Pause; Esc in the pause window resumes'],
];

export function resolveShortcut(key: string): ShortcutAction | null {
  const slot = Number(key);
  if (Number.isInteger(slot) && slot >= FIRST_SLOT && slot <= LAST_SLOT) {
    return { type: 'add', index: slot - FIRST_SLOT };
  }
  return COMMANDS[key.toLowerCase()] ?? null;
}

export function acceptsShortcuts(state: Pick<IGameState, 'status'>): boolean {
  return state.status === 'playing';
}
