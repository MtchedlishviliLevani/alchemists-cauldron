const SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const PAD = 2;

export const LOW_TIME_THRESHOLD = 15 * SECOND;

export function computeTimeLeft(endTime: number, now: number): number {
  return Math.max(0, endTime - now);
}

export function formatTime(timeLeft: number): string {
  const totalSeconds = Math.ceil(Math.max(0, timeLeft) / SECOND);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(PAD, '0')}:${String(seconds).padStart(PAD, '0')}`;
}

export function isLowTime(timeLeft: number): boolean {
  return timeLeft > 0 && timeLeft < LOW_TIME_THRESHOLD;
}

export const TICK_INTERVAL = 200;
