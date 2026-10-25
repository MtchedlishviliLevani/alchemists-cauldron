import { isLeaderboardEntry, sortEntries } from '../logic/leaderboard';
import type { ILeaderboardEntry } from '../logic/leaderboard';
import type { Difficulty } from '../types/game';

const KEY_PREFIX = 'alchemists-cauldron:leaderboard';

export function leaderboardKey(difficulty: Difficulty): string {
  return `${KEY_PREFIX}:${difficulty}`;
}

export function loadLeaderboard(difficulty: Difficulty): ILeaderboardEntry[] {
  try {
    const raw = window.localStorage.getItem(leaderboardKey(difficulty));
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortEntries(
      parsed.filter((entry): entry is ILeaderboardEntry => isLeaderboardEntry(entry, difficulty))
    );
  } catch {
    return [];
  }
}

export function saveLeaderboard(
  difficulty: Difficulty,
  entries: readonly ILeaderboardEntry[]
): boolean {
  try {
    window.localStorage.setItem(leaderboardKey(difficulty), JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function clearLeaderboard(difficulty: Difficulty): boolean {
  try {
    window.localStorage.removeItem(leaderboardKey(difficulty));
    return true;
  } catch {
    return false;
  }
}
