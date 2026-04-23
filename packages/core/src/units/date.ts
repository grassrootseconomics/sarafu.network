/**
 * Normalizes a date range to ensure 'from' is at the start of the day (00:00:00.000)
 * and 'to' is at the end of the day (23:59:59.999)
 */
export function normalizeDateRange(from: Date, to: Date): { from: Date; to: Date } {
  const normalizedFrom = new Date(from);
  normalizedFrom.setHours(0, 0, 0, 0);

  const normalizedTo = new Date(to);
  normalizedTo.setHours(23, 59, 59, 999);

  return { from: normalizedFrom, to: normalizedTo };
}
