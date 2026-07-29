import { describe, expect, it } from "vitest";
import { getNumberFormatter } from "./numberFormat";

describe("getNumberFormatter", () => {
  it("uses a stable key for equivalent option sets", () => {
    const first = getNumberFormatter("kk-KZ", {
      currency: "KZT",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "currency",
      useGrouping: true
    });
    const reordered = getNumberFormatter("kk-KZ", {
      useGrouping: true,
      style: "currency",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencyDisplay: "narrowSymbol",
      currency: "KZT"
    });

    expect(first).toBe(reordered);
  });

  it("separates output-affecting locale and option sets", () => {
    const base = getNumberFormatter("kk-KZ", {
      maximumFractionDigits: 2,
      useGrouping: true
    });
    expect(base).not.toBe(getNumberFormatter("en-US", {
      maximumFractionDigits: 2,
      useGrouping: true
    }));
    expect(base).not.toBe(getNumberFormatter("kk-KZ", {
      maximumFractionDigits: 3,
      useGrouping: true
    }));
    expect(base).not.toBe(getNumberFormatter("kk-KZ", {
      maximumFractionDigits: 2,
      useGrouping: false
    }));
  });
});
