export interface ILeaderboardEntry {
  name: string;
  score: number;
  date: number;
}

export const LEADERBOARD_SIZE = 10;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 15;

const NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;
const PAD = 2;

export function validatePlayerName(raw: string): string | null {
  const name = raw.trim();
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    return `Use ${String(NAME_MIN_LENGTH)}–${String(NAME_MAX_LENGTH)} characters.`;
  }
  if (!NAME_PATTERN.test(name)) {
    return 'Use letters, digits, spaces, _ or - only.';
  }
  return null;
}

export function compareEntries(a: ILeaderboardEntry, b: ILeaderboardEntry): number {
  return b.score - a.score || a.date - b.date;
}

export function sortEntries(entries: readonly ILeaderboardEntry[]): ILeaderboardEntry[] {
  return [...entries].sort(compareEntries).slice(0, LEADERBOARD_SIZE);
}

export function qualifiesForLeaderboard(
  entries: readonly ILeaderboardEntry[],
  score: number
): boolean {
  if (score <= 0) return false;
  if (entries.length < LEADERBOARD_SIZE) return true;
  const lowest = sortEntries(entries).at(-1);
  return lowest === undefined || score > lowest.score;
}

export function insertEntry(
  entries: readonly ILeaderboardEntry[],
  entry: ILeaderboardEntry
): ILeaderboardEntry[] {
  return sortEntries([...entries, entry]);
}

export function isLeaderboardEntry(value: unknown): value is ILeaderboardEntry {
  if (typeof value !== 'object' || value === null) return false;
  const { name, score, date } = value as Record<string, unknown>;
  return (
    typeof name === 'string' &&
    validatePlayerName(name) === null &&
    typeof score === 'number' &&
    Number.isFinite(score) &&
    score >= 0 &&
    typeof date === 'number' &&
    Number.isFinite(date)
  );
}

function pad(value: number): string {
  return String(value).padStart(PAD, '0');
}

export function formatEntryDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${day}.${month}.${String(date.getFullYear())} ${time}`;
}
