import { describe, expect, it } from "vitest";
import { createNumberMask } from "./createNumberMask";
import { formatNumericInput } from "./formatNumericInput";
import { parseNumericInput } from "./parseNumericInput";

const config = {
  allowNegative: true,
  decimalSeparator: ",",
  groupSeparator: " ",
  integerDigits: 9,
  maximumFractionDigits: 2
};

describe("numeric editing foundation", () => {
  it("parses locale editing strings and preserves intermediate states", () => {
    expect(parseNumericInput("1 234,5", config)).toBe("1234.5");
    expect(parseNumericInput("-", config)).toBeNull();
    expect(parseNumericInput("", config)).toBeNull();
    expect(parseNumericInput("abc", config)).toBeNull();
  });

  it("formats editing strings with locale separators", () => {
    expect(formatNumericInput("-1234.5", config)).toBe("-1 234,5");
    expect(formatNumericInput("0.", config)).toBe("0,");
  });

  it("keeps Maskito configuration behind the adapter", () => {
    const options = createNumberMask(config);
    expect(options.mask).toBeDefined();
    expect(options.postprocessors?.length).toBeGreaterThan(0);
  });

  it("formats and parses fixed currency affixes", () => {
    const suffixConfig = { ...config, postfix: " zł" };
    const prefixConfig = { ...config, prefix: "$ " };

    expect(formatNumericInput("1234.5", suffixConfig)).toBe("1 234,5 zł");
    expect(parseNumericInput("1 234,5 zł", suffixConfig)).toBe("1234.5");
    expect(formatNumericInput("-1234.5", prefixConfig)).toBe("$ -1 234,5");
    expect(parseNumericInput("$ -1 234,5", prefixConfig)).toBe("-1234.5");
  });
});
