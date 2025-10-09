export type DateLike = string | number | Date | null | undefined;

/**
 * Formats a date/time value into a human-friendly string.
 * Defaults to es-ES locale and 24h HH:mm.
 */
export function formatDate(
  input: DateLike,
  locale: string = 'es-ES',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
): string {
  if (input === null || input === undefined || input === '') return '';
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.valueOf())) return '';
  return new Intl.DateTimeFormat(locale, options).format(d);
}
