import { describe, expect, it } from "vitest";
import { getAmountParts } from "./amountParts";
import { resolveAmountFormat } from "./currency";
import { formatAmount } from "./formatAmount";
import {
  decimalStringToMinor,
  fractionDigitsFromMinority,
  minorToDecimalString
} from "./minorUnits";

describe("amount foundation", () => {
  it("converts minor units without floating-point transforms", () => {
    expect(minorToDecimalString(123456, 100)).toBe("1234.56");
    expect(minorToDecimalString(-5, 1000)).toBe("-0.005");
    expect(minorToDecimalString(120, 100, true)).toBe("1.2");
    expect(decimalStringToMinor("1234.56", 100)).toBe(123456);
    expect(decimalStringToMinor("-0.005", 1000)).toBe(-5);
    expect(decimalStringToMinor("0", 100)).toBe(0);
  });

  it("supports 0, 2 and 3 fraction digits", () => {
    expect(fractionDigitsFromMinority(1)).toBe(0);
    expect(fractionDigitsFromMinority(100)).toBe(2);
    expect(fractionDigitsFromMinority(1000)).toBe(3);
    expect(() => fractionDigitsFromMinority(20)).toThrow(/power of ten/);
  });

  it("resolves currency defaults and locale placement with Intl", () => {
    const yen = resolveAmountFormat({ currency: "JPY", locale: "ja-JP" });
    const dinar = resolveAmountFormat({ currency: "KWD", locale: "en-US" });
    const dollar = resolveAmountFormat({ currency: "USD", locale: "en-US" });

    expect(yen.fractionDigits).toBe(0);
    expect(dinar.fractionDigits).toBe(3);
    expect(dollar.currencyPosition).toBe("prefix");
    expect(dollar.currency).toBe("$");
    expect(dollar.currencySeparator).toBe("");
    expect(resolveAmountFormat({}).locale).toBe("en-US");
  });

  it("returns styled display parts and honors signs/trailing zeros", () => {
    expect(
      getAmountParts(123450, {
        currency: "PLN",
        locale: "pl-PL",
        minority: 100,
        trimTrailingZeros: true
      })
    ).toMatchObject({
      major: "1 234",
      minor: "5",
      sign: ""
    });
    expect(
      formatAmount(123456, {
        currency: "USD",
        locale: "en-US",
        minority: 100,
        showPlus: true
      })
    ).toBe("+$1,234.56");
  });

  it("handles large safe integer minor values", () => {
    const value = Number.MAX_SAFE_INTEGER;
    expect(decimalStringToMinor(minorToDecimalString(value, 100), 100)).toBe(value);
    expect(() => minorToDecimalString(value + 1, 100)).toThrow(/safe integer/);
  });

  it("formats representative CIS currencies without coupling currency to locale", () => {
    const cases = [
      ["RUB", "ru-RU"],
      ["KZT", "kk-KZ"],
      ["BYN", "be-BY"],
      ["AMD", "hy-AM"],
      ["UZS", "uz-UZ"]
    ] as const;

    for (const [currency, locale] of cases) {
      const resolved = resolveAmountFormat({ currency, locale });
      expect(resolved.currency).toBeTruthy();
      expect(resolved.locale).toBe(locale);
      expect(resolved.fractionDigits).toBe(
        new Intl.NumberFormat(locale, {
          currency,
          style: "currency"
        }).resolvedOptions().maximumFractionDigits
      );
    }
  });

  it("uses Intl for valid unregistered currencies and degrades invalid codes safely", () => {
    const validUnknown = resolveAmountFormat({
      currency: "CHF",
      locale: "de-CH"
    });
    expect(validUnknown.currency).toBeTruthy();
    expect(validUnknown.locale).toBe("de-CH");

    const invalid = resolveAmountFormat({
      currency: "not-a-currency",
      locale: "en-US"
    });
    expect(invalid).toMatchObject({
      currency: "not-a-currency",
      currencyPosition: "suffix",
      currencySeparator: " ",
      fractionDigits: 2
    });
  });

  it("keeps explicit minority authoritative over currency metadata", () => {
    expect(resolveAmountFormat({
      currency: "RUB",
      locale: "ru-RU",
      minority: 1
    }).fractionDigits).toBe(0);
    expect(resolveAmountFormat({
      currency: "RUB",
      locale: "ru-RU",
      minority: 1000
    }).fractionDigits).toBe(3);
  });
});
