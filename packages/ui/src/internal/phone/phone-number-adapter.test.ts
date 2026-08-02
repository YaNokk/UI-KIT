import { describe, expect, it } from "vitest";
import {
  detectPhoneCountry,
  formatPhoneValue,
  getCountryCallingCode,
  normalizePhoneValue,
  parsePhoneValue,
  replacePhoneCountry
} from "./phone-number-adapter";

describe("phone-number-adapter", () => {
  it("keeps canonical storage separate from formatted presentation", () => {
    expect(normalizePhoneValue("+7 (495) 788-88-78")).toBe("+74957888878");
    expect(formatPhoneValue("+74957888878", "RU")).toBe("+7 495 788 88 78");
  });

  it("normalizes national input and the Russian trunk prefix", () => {
    expect(normalizePhoneValue("495 788-88-78", "RU")).toBe("+74957888878");
    expect(normalizePhoneValue("8 (495) 788-88-78", "RU")).toBe("+74957888878");
  });

  it("detects countries within an allowlist", () => {
    expect(detectPhoneCountry("+48123123123", ["PL", "RU"])).toBe("PL");
    expect(detectPhoneCountry("+48123123123", ["RU"])).toBeNull();
  });

  it("reports possible and valid state without owning UI validation", () => {
    const complete = parsePhoneValue("+74957888878", "RU");
    const incomplete = parsePhoneValue("+7495", "RU");
    expect(complete).toMatchObject({
      callingCode: "7",
      country: "RU",
      isPossible: true,
      isValid: true,
      nationalNumber: "4957888878"
    });
    expect(incomplete.isValid).toBe(false);
  });

  it("preserves national digits when switching country", () => {
    expect(replacePhoneCountry("+74957888878", "RU", "PL"))
      .toBe("+484957888878");
    expect(replacePhoneCountry("+7", "RU", "PL")).toBe("+48");
    expect(getCountryCallingCode("PL")).toBe("48");
  });
});
