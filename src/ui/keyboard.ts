import { acceptsShortcuts, resolveShortcut } from '../logic/shortcuts';
import type { ShortcutAction } from '../logic/shortcuts';
import type { IGameState } from '../types/game';

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function bindKeyboard(
  getState: () => IGameState,
  run: (action: ShortcutAction) => void
): void {
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!acceptsShortcuts(getState()) || isTyping(event.target)) return;
    const action = resolveShortcut(event.key);
    if (action === null) return;
    if (action.type !== 'add' && event.repeat) return;
    event.preventDefault();
    run(action);
  });
}
