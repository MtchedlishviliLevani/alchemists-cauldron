import { parseSavedGame } from '../logic/save';
import type { ISavedGame } from '../logic/save';

export const SAVE_KEY = 'alchemists-cauldron:save';

export function saveGame(save: ISavedGame): boolean {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): boolean {
  try {
    window.localStorage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function loadGame(): ISavedGame | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw === null) return null;
    const save = parseSavedGame(JSON.parse(raw));
    if (save === null) clearSave();
    return save;
  } catch {
    clearSave();
    return null;
  }
}
