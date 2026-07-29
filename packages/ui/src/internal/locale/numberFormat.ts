const numberFormatCache = new Map<string, Intl.NumberFormat>();

export function getNumberFormatter(
  locale: string,
  options: Intl.NumberFormatOptions = {}
): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  const cached = numberFormatCache.get(key);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(locale, options);
  numberFormatCache.set(key, formatter);
  return formatter;
}
