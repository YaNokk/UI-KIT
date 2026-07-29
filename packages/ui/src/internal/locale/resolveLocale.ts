export const DEFAULT_LOCALE = "en-US";

/**
 * Shared locale boundary for UI foundations.
 *
 * `configuredLocale` is reserved for a future application/DS locale source.
 * Keeping it explicit makes the fallback deterministic for SSR and hydration
 * without introducing an Amount-only provider.
 */
export function resolveLocale(
  explicitLocale?: string,
  configuredLocale?: string
): string {
  return explicitLocale || configuredLocale || DEFAULT_LOCALE;
}
