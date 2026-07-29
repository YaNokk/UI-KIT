const numberFormatCache = new Map<string, Intl.NumberFormat>();
const MAX_NUMBER_FORMAT_CACHE_SIZE = 100;

function getFormatterKey(
  locale: string,
  options: Intl.NumberFormatOptions
): string {
  const normalizedOptions = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return JSON.stringify([locale, normalizedOptions]);
}

export function getNumberFormatter(
  locale: string,
  options: Intl.NumberFormatOptions = {}
): Intl.NumberFormat {
  const key = getFormatterKey(locale, options);
  const cached = numberFormatCache.get(key);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(locale, options);
  if (numberFormatCache.size >= MAX_NUMBER_FORMAT_CACHE_SIZE) {
    const oldestKey = numberFormatCache.keys().next().value;
    if (oldestKey !== undefined) numberFormatCache.delete(oldestKey);
  }
  numberFormatCache.set(key, formatter);
  return formatter;
}
