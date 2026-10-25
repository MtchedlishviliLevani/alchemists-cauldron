import { isLeaderboardEntry, sortEntries } from '../logic/leaderboard';
import type { ILeaderboardEntry } from '../logic/leaderboard';

export const LEADERBOARD_KEY = 'alchemists-cauldron:leaderboard';

export function loadLeaderboard(): ILeaderboardEntry[] {
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortEntries(parsed.filter(isLeaderboardEntry));
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: readonly ILeaderboardEntry[]): boolean {
  try {
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function clearLeaderboard(): boolean {
  try {
    window.localStorage.removeItem(LEADERBOARD_KEY);
    return true;
  } catch {
    return false;
  }
}
