import { describe, expect, it } from "vitest";
import {
  darkSemanticTokens,
  lightSemanticTokens,
  motionTokens,
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

describe("selection indicator token contract", () => {
  it.each(themes)("%s keeps checked outline semantics resolver-owned", (_, tokens) => {
    expect(tokens["control.selectionIndicator"]).toBe("{brand.selectionIndicator}");
    expect(tokens["control.selectionIndicatorHover"]).toBe("{brand.selectionIndicatorHover}");
    expect(tokens["control.selectionIndicatorActive"]).toBe("{brand.selectionIndicatorActive}");
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

describe("scrollbar token contract", () => {
  it("exposes the canonical default and compact geometry", () => {
    expect(primitiveTokens["size.scrollbar.default"]).toEqual({ value: 4, unit: "px" });
    expect(primitiveTokens["size.scrollbar.compact"]).toEqual({ value: 2, unit: "px" });
  });

  it.each(themes)("%s exposes a neutral, brand-independent thumb family", (_, tokens) => {
    expect(tokens["scrollbar.thumb"]).toBeDefined();
    expect(tokens["scrollbar.thumbHover"]).toBeDefined();
    expect(tokens["scrollbar.thumb"]).not.toContain("{brand.");
    expect(tokens["scrollbar.thumbHover"]).not.toContain("{brand.");
  });
});

describe("sidebar token contract", () => {
  it("exposes canonical component geometry instead of spacing arithmetic", () => {
    expect(primitiveTokens["size.sidebar.expanded"])
      .toEqual({ value: 280, unit: "px" });
    expect(primitiveTokens["size.sidebar.collapsed"])
      .toEqual({ value: 64, unit: "px" });
    expect(primitiveTokens["size.sidebar.flyoutMin"])
      .toEqual({ value: 232, unit: "px" });
    expect(primitiveTokens["size.sidebar.flyoutMax"])
      .toEqual({ value: 256, unit: "px" });
  });

  it.each(themes)("%s exposes inverse navigation interaction colors", (_, tokens) => {
    expect(tokens["navigation.item.textHover"]).toBe("{color.neutral.0}");
    expect(tokens["navigation.item.textDisabled"]).toBe("{color.neutral.400}");
    expect(tokens["navigation.item.iconHover"]).toBe("{color.neutral.0}");
    expect(tokens["navigation.item.iconDisabled"]).toBe("{color.neutral.400}");
    expect(tokens["navigation.item.backgroundActive"]).toBe("{brand.actionBackground}");
    expect(tokens["navigation.item.textActive"]).toBe("{brand.actionForeground}");
    expect(tokens["navigation.item.iconActive"]).toBe("{brand.actionForeground}");
  });
});

describe("system color token contract", () => {
  const colors = ["gray", "blue", "green", "amber", "red", "purple", "brand"];
  const roles = [
    "markerBackground",
    "softBackground",
    "softBackgroundHover",
    "softBackgroundSelected",
    "foreground",
    "border",
    "solidBackground",
    "onSolid"
  ];

  it.each(themes)("%s exposes the complete closed system-color matrix", (_, tokens) => {
    expect(
      Object.keys(tokens)
        .filter((path) => path.startsWith("systemColor."))
    ).toEqual(colors.flatMap((color) => roles.map((role) => `systemColor.${color}.${role}`)));
  });

  it.each(themes)("%s keeps fixed system colors brand-independent", (_, tokens) => {
    for (const color of colors.filter((color) => color !== "brand")) {
      for (const role of roles) {
        expect(tokens[`systemColor.${color}.${role}` as keyof typeof tokens])
          .not.toContain("{brand.");
      }
    }
  });

  it.each(themes)("%s aliases brand solid contrast to the runtime resolver", (_, tokens) => {
    expect(tokens["systemColor.brand.markerBackground"]).toBe("{brand.accent}");
    expect(tokens["systemColor.brand.solidBackground"]).toBe("{brand.actionBackground}");
    expect(tokens["systemColor.brand.onSolid"]).toBe("{brand.actionForeground}");
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
      "typography.fieldValueTextSm",
      "typography.fieldValueTextMd",
      "typography.fieldValueTextLg",
      "typography.compactChipText",
      "typography.controlTextSm",
      "typography.controlTextMd",
      "typography.controlTextLg",
      "typography.compactControlTextSm",
      "typography.compactControlTextMd",
      "typography.counterText",
      "typography.choiceControlLabel",
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

  it("keeps field-value roles consistent and lg at 16px", () => {
    expect(typographyTokens["typography.fieldValueTextLg"].fontSize)
      .toBe("{font.size.bodyLg}");
    expect(typographyTokens["typography.compactChipText"])
      .not.toEqual(typographyTokens["typography.fieldValueTextMd"]);
  });
});

describe("motion token contract", () => {
  it("maps reusable semantic roles to primitive duration and easing tokens", () => {
    expect(motionTokens["motion.control.state.duration"]).toBe("{motion.duration.fast}");
    expect(motionTokens["motion.control.label.duration"]).toBe("{motion.duration.normal}");
    expect(motionTokens["motion.control.label.easing"]).toBe("{motion.easing.standard}");
    expect(motionTokens["motion.control.indicator.easing"]).toBe("{motion.easing.standard}");
    expect(motionTokens["motion.overlay.enter.easing"]).toBe("{motion.easing.enter}");
    expect(motionTokens["motion.overlay.exit.duration"]).toBe("{motion.duration.fast}");
  });
});

describe("layer token contract", () => {
  it("exposes the canonical semantic layer order", () => {
    const layers = [
      primitiveTokens["zIndex.default"],
      primitiveTokens["zIndex.focused"],
      primitiveTokens["zIndex.navigation"],
      primitiveTokens["zIndex.popover"],
      primitiveTokens["zIndex.modal"],
      primitiveTokens["zIndex.toast"]
    ] as number[];

    expect(layers).toEqual([0, 100, 200, 300, 500, 600]);
    layers.reduce((previous, value) => {
      expect(previous).toBeLessThan(value);
      return value;
    }, Number.NEGATIVE_INFINITY);
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.base");
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.dropdown");
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.overlay");
    expect(primitiveTokens["zIndex.sticky"]).toBe(100);
  });

  it("keeps dropdown and modal overlay semantics on their established owners", () => {
    expect(primitiveTokens["zIndex.navigation"])
      .toBeLessThan(primitiveTokens["zIndex.popover"] as number);
    expect(primitiveTokens["zIndex.popover"])
      .toBeLessThan(primitiveTokens["zIndex.modal"] as number);
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.dropdown");
    expect(Object.keys(primitiveTokens)).not.toContain("zIndex.overlay");
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
