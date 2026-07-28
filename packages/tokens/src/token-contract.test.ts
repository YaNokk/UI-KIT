import { describe, expect, it } from "vitest";
import {
  darkSemanticTokens,
  lightSemanticTokens
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
    expect(tokens["action.primary.background"]).toBe("{brand.accent}");
    expect(tokens["action.primary.backgroundHover"]).toBe("{brand.accentHover}");
    expect(tokens["action.primary.backgroundActive"]).toBe("{brand.accentActive}");
    expect(tokens["action.primary.foreground"]).toBe("{brand.onAccent}");
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
