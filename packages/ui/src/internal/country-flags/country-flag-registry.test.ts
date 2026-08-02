import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getPhoneCountries } from "../phone/phone-number-adapter";
import { countryFlagRegistry } from "./country-flag-registry";

describe("countryFlagRegistry", () => {
  it("covers every libphonenumber country with unique ISO2 asset keys", () => {
    const supportedCountries = getPhoneCountries();
    const registryKeys = [...countryFlagRegistry];

    expect(new Set(registryKeys).size).toBe(registryKeys.length);
    expect(registryKeys.every((key) => /^[A-Z]{2}$/.test(key))).toBe(true);
    expect(supportedCountries.every((country) => countryFlagRegistry.has(country)))
      .toBe(true);

    const sprite = readFileSync(
      new URL("./country-flags.sprite.svg", import.meta.url),
      "utf8"
    );
    const symbolIds = [...sprite.matchAll(/<symbol id="flag-([A-Z]{2})"/g)]
      .map((match) => match[1]);

    expect(symbolIds).toHaveLength(registryKeys.length);
    expect(new Set(symbolIds)).toEqual(new Set(registryKeys));
  });
});
