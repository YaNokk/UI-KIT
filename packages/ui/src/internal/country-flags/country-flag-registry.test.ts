import { describe, expect, it } from "vitest";
import { getPhoneCountries } from "../phone/phone-number-adapter";
import { countryFlagRegistry } from "./country-flag-registry";

describe("countryFlagRegistry", () => {
  it("covers every libphonenumber country with unique ISO2 asset keys", () => {
    const supportedCountries = getPhoneCountries();
    const registryKeys = Object.keys(countryFlagRegistry);

    expect(new Set(registryKeys).size).toBe(registryKeys.length);
    expect(registryKeys.every((key) => /^[A-Z]{2}$/.test(key))).toBe(true);
    expect(supportedCountries.every((country) => country in countryFlagRegistry))
      .toBe(true);
  });
});
