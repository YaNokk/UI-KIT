import { describe, expect, it } from "vitest";
import { getNumberFormatter } from "./numberFormat";

describe("getNumberFormatter", () => {
  it("caches equivalent formatter requests without reading environment locale", () => {
    const options = { maximumFractionDigits: 2 } as const;
    expect(getNumberFormatter("kk-KZ", options))
      .toBe(getNumberFormatter("kk-KZ", options));
    expect(getNumberFormatter("kk-KZ", options))
      .not.toBe(getNumberFormatter("en-US", options));
  });
});
