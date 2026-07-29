import { describe, expect, it } from "vitest";
import {
  darkSemanticTokens,
  lightSemanticTokens,
  primitiveTokens,
  typographyTokens
} from "./index";

const themes = [
  ["light", lightSemanticTokens],
  ["dark", darkSemanticTokens]
] as const;

describe("action token contract", () => {
  it.each(themes)("%s exposes the neutral interactive surface family", (_, tokens) => {
    expect(tokens["background.interactive"]).toBe("{background.surface}");
    expect(tokens["background.interactiveHover"]).toBe("{background.subtle}");
    expect(tokens["background.interactiveActive"]).toBeDefined();
    expect(tokens["action.secondary.background"]).toBe("{background.interactive}");
    expect(tokens["action.secondary.backgroundHover"]).toBe("{background.interactiveHover}");
    expect(tokens["action.secondary.backgroundActive"]).toBe("{background.interactiveActive}");
  });

  it.each(themes)("%s keeps primary brand-dependent", (_, tokens) => {
    expect(tokens["action.primary.background"]).toBe("{brand.actionBackground}");
    expect(tokens["action.primary.backgroundHover"]).toBe("{brand.actionBackgroundHover}");
    expect(tokens["action.primary.backgroundActive"]).toBe("{brand.actionBackgroundActive}");
    expect(tokens["action.primary.foreground"]).toBe("{brand.actionForeground}");
  });

  it.each(themes)("%s exposes a brand-dependent soft action family", (_, tokens) => {
    expect(tokens["action.soft.background"]).toBe("{brand.accentSoft}");
    expect(tokens["action.soft.backgroundHover"]).toBe("{brand.accentSoftHover}");
    expect(tokens["action.soft.backgroundActive"]).toBe("{brand.accentSoftActive}");
    expect(tokens["action.soft.foreground"]).toBe("{brand.accentContent}");
  });

  it.each(themes)("%s keeps danger brand-independent", (_, tokens) => {
    const dangerValues = [
      tokens["action.danger.background"],
      tokens["action.danger.backgroundHover"],
      tokens["action.danger.backgroundActive"],
      tokens["action.danger.foreground"]
    ];

    expect(dangerValues.every((value) => !value.includes("{brand."))).toBe(true);
  });
});

describe("icon token contract", () => {
  it("uses the Lucide-compatible geometry baseline", () => {
    expect(primitiveTokens["size.icon.sm"]).toEqual({ value: 16, unit: "px" });
    expect(primitiveTokens["size.icon.md"]).toEqual({ value: 20, unit: "px" });
    expect(primitiveTokens["size.icon.lg"]).toEqual({ value: 24, unit: "px" });
    expect(primitiveTokens["icon.stroke.default"]).toBe(2);
  });

  it.each(themes)("%s exposes all canonical semantic tones", (_, tokens) => {
    expect(tokens["icon.primary"]).toBeDefined();
    expect(tokens["icon.secondary"]).toBeDefined();
    expect(tokens["icon.disabled"]).toBeDefined();
    expect(tokens["icon.accent"]).toBe("{brand.accent}");
    expect(tokens["icon.danger"]).toBe("{status.danger.foreground}");
    expect(tokens["icon.success"]).toBe("{status.success.foreground}");
    expect(tokens["icon.warning"]).toBe("{status.warning.foreground}");
  });
});

describe("overlay size token contract", () => {
  it("keeps Dialog and Drawer roles independent from breakpoints", () => {
    expect(primitiveTokens["size.overlay.dialog.md"]).toEqual({
      value: 500,
      unit: "px"
    });
    expect(primitiveTokens["size.overlay.drawer.md"]).toEqual({
      value: 500,
      unit: "px"
    });
    expect(primitiveTokens["breakpoint.md"]).toEqual({
      value: 768,
      unit: "px"
    });
  });
});

describe("typography token contract", () => {
  it("exposes the complete compact role scale without color", () => {
    expect(Object.keys(typographyTokens)).toEqual([
      "typography.caption",
      "typography.bodySm",
      "typography.body",
      "typography.bodyStrong",
      "typography.bodyLg",
      "typography.headingSm",
      "typography.headingMd",
      "typography.headingLg",
      "typography.pageTitle"
    ]);

    for (const value of Object.values(typographyTokens)) {
      expect(value).toHaveProperty("fontFamily");
      expect(value).toHaveProperty("fontSize");
      expect(value).toHaveProperty("fontWeight");
      expect(value).toHaveProperty("lineHeight");
      expect(value).not.toHaveProperty("color");
    }
  });

  it("keeps typography metrics independent from mode and brand", () => {
    expect(typographyTokens["typography.body"].fontSize).toBe("{font.size.body}");
    expect(typographyTokens["typography.headingSm"].fontSize).toBe("{font.size.headingSm}");
    expect(typographyTokens["typography.pageTitle"].lineHeight).toBe("{lineHeight.pageTitle}");
  });
});

describe("layer token contract", () => {
  it("exposes the canonical semantic layer order", () => {
    const layers = [
      primitiveTokens["zIndex.default"],
      primitiveTokens["zIndex.focused"],
      primitiveTokens["zIndex.popover"],
      primitiveTokens["zIndex.modal"],
      primitiveTokens["zIndex.toast"]
    ] as number[];

    expect(layers).toEqual([0, 100, 300, 500, 600]);
    layers.reduce((previous, value) => {
      expect(previous).toBeLessThan(value);
      return value;
    }, Number.NEGATIVE_INFINITY);
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.base");
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.dropdown");
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.overlay");
    expect(primitiveTokens["zIndex.sticky"]).toBe(100);
  });
});

describe("text and link color contract", () => {
  it.each(themes)("%s exposes separate semantic text tones", (_, tokens) => {
    expect(tokens["text.accent"]).toBe("{brand.accentContent}");
    expect(tokens["text.danger"]).toBe("{status.danger.foreground}");
    expect(tokens["text.success"]).toBe("{status.success.foreground}");
    expect(tokens["text.warning"]).toBe("{status.warning.foreground}");
    expect(tokens["background.inverse"]).toBe("{color.neutral.900}");
    expect(tokens["text.onInverse"]).toBe("{color.neutral.0}");
  });

  it.each(themes)("%s keeps only the accent link family brand-dependent", (_, tokens) => {
    expect(tokens["action.link.foreground"]).toBe("{brand.accentContent}");
    expect(tokens["action.link.foregroundHover"]).toBe("{brand.accentHover}");
    expect(tokens["action.link.foregroundActive"]).toBe("{brand.accentActive}");
  });
});
