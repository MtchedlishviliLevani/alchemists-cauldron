const MINUS = '−';

export function formatSigned(value: number): string {
  if (value > 0) return `+${String(value)}`;
  if (value < 0) return `${MINUS}${String(Math.abs(value))}`;
  return '0';
}
