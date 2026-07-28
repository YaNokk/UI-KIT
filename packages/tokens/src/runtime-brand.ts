export type ThemeMode = "light" | "dark";

export interface BrandInput {
  accentColor: string;
  foregroundColor?: string;
}

export interface ResolvedBrand {
  accent: string;
  onAccent: string;
  accentHover: string;
  accentActive: string;
  accentSoft: string;
  accentSoftHover: string;
  accentSoftForeground: string;
  accentBorder: string;
  accentFocus: string;
}

export type BrandCssVariables = Record<`--ds-brand-${string}`, string>;

type Rgb = readonly [red: number, green: number, blue: number];

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const DARK_SURFACE: Rgb = [23, 27, 34];
const MIN_TEXT_CONTRAST = 4.5;
const MIN_FOCUS_CONTRAST = 3;

export const DEFAULT_BRAND_INPUT: Readonly<BrandInput> = {
  accentColor: "#0080ff",
  foregroundColor: "#ffffff"
};

function parseHex(value: string): Rgb | null {
  const normalized = value.trim().replace(/^#/, "");
  const hex = normalized.length === 3
    ? normalized.split("").map((character) => character.repeat(2)).join("")
    : normalized;

  if (!/^[\da-f]{6}$/i.test(hex)) return null;
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ];
}

function toHex(color: Rgb): string {
  return `#${color
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(color: Rgb, target: Rgb, amount: number): Rgb {
  return color.map((channel, index) =>
    channel + ((target[index] ?? channel) - channel) * amount
  ) as unknown as Rgb;
}

function luminance(color: Rgb): number {
  const linearize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const red = linearize(color[0]);
  const green = linearize(color[1]);
  const blue = linearize(color[2]);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: Rgb, second: Rgb): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function readableForeground(background: Rgb, preference?: Rgb): Rgb {
  if (preference && contrast(background, preference) >= MIN_TEXT_CONTRAST) return preference;
  return contrast(background, BLACK) >= contrast(background, WHITE) ? BLACK : WHITE;
}

function interactiveShade(accent: Rgb, foreground: Rgb, amount: number): Rgb {
  const firstTarget = luminance(accent) > 0.45 ? BLACK : WHITE;
  const candidate = mix(accent, firstTarget, amount);
  return contrast(candidate, foreground) >= MIN_TEXT_CONTRAST ? candidate : accent;
}

export function resolveBrand(input: BrandInput, mode: ThemeMode): ResolvedBrand {
  const accent = parseHex(input.accentColor);
  if (!accent) {
    throw new TypeError("accentColor must be a three- or six-digit HEX color.");
  }

  const preferredForeground = input.foregroundColor
    ? parseHex(input.foregroundColor)
    : null;
  if (input.foregroundColor && !preferredForeground) {
    throw new TypeError("foregroundColor must be a three- or six-digit HEX color.");
  }

  const onAccent = readableForeground(accent, preferredForeground ?? undefined);
  const modeSurface = mode === "dark" ? DARK_SURFACE : WHITE;
  const soft = mix(accent, modeSurface, mode === "dark" ? 0.8 : 0.88);
  const softHover = mix(accent, modeSurface, mode === "dark" ? 0.7 : 0.8);
  const softForeground = readableForeground(soft, accent);
  const focus = contrast(accent, modeSurface) >= MIN_FOCUS_CONTRAST
    ? accent
    : readableForeground(modeSurface);

  return {
    accent: toHex(accent),
    onAccent: toHex(onAccent),
    accentHover: toHex(interactiveShade(accent, onAccent, 0.12)),
    accentActive: toHex(interactiveShade(accent, onAccent, 0.2)),
    accentSoft: toHex(soft),
    accentSoftHover: toHex(softHover),
    accentSoftForeground: toHex(softForeground),
    accentBorder: toHex(mix(accent, modeSurface, mode === "dark" ? 0.35 : 0.48)),
    accentFocus: toHex(focus)
  };
}

export function createBrandCssVariables(
  input: BrandInput,
  mode: ThemeMode
): BrandCssVariables {
  const brand = resolveBrand(input, mode);
  return {
    "--ds-brand-accent": brand.accent,
    "--ds-brand-on-accent": brand.onAccent,
    "--ds-brand-accent-hover": brand.accentHover,
    "--ds-brand-accent-active": brand.accentActive,
    "--ds-brand-accent-soft": brand.accentSoft,
    "--ds-brand-accent-soft-hover": brand.accentSoftHover,
    "--ds-brand-accent-soft-foreground": brand.accentSoftForeground,
    "--ds-brand-accent-border": brand.accentBorder,
    "--ds-brand-accent-focus": brand.accentFocus
  };
}

export function applyBrandTheme(
  element: HTMLElement,
  input: BrandInput,
  mode: ThemeMode
): void {
  element.dataset.theme = mode;
  element.dataset.brandTheme = "";

  for (const [property, value] of Object.entries(createBrandCssVariables(input, mode))) {
    element.style.setProperty(property, value);
  }
}
