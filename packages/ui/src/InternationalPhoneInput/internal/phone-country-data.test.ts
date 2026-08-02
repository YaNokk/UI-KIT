import { describe, expect, it } from "vitest";
import { getPhoneCountries } from "../../internal/phone/phone-number-adapter";
import { getPhoneCountryData } from "./phone-country-data";

describe("getPhoneCountryData", () => {
  it("returns every supported phone country by default", () => {
    const countries = getPhoneCountryData("ru-RU");
    const supportedCountries = getPhoneCountries();

    expect(countries).toHaveLength(supportedCountries.length);
    expect(countries.map((country) => country.iso2)).toEqual(
      expect.arrayContaining(supportedCountries)
    );
    expect(countries.find((country) => country.iso2 === "JP")?.displayName)
      .toBe("Япония");
  });

  it("treats countries as an explicit allowlist", () => {
    expect(getPhoneCountryData("ru-RU", ["RU", "PL"]).map(({ iso2 }) => iso2))
      .toEqual(["PL", "RU"]);
  });
});
