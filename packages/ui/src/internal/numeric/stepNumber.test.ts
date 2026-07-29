import { describe, expect, it } from "vitest";
import { stepNumber } from "./stepNumber";

describe("stepNumber", () => {
  it("steps fractional values without binary floating-point artifacts", () => {
    expect(
      stepNumber({
        direction: 1,
        maximumFractionDigits: 2,
        step: 0.1,
        value: 0.2,
      }),
    ).toBe(0.3);
    expect(
      stepNumber({
        direction: -1,
        maximumFractionDigits: 2,
        step: 0.25,
        value: 1,
      }),
    ).toBe(0.75);
  });

  it("clamps stepping to boundaries and defines null stepping", () => {
    expect(stepNumber({ direction: 1, min: 2, value: null })).toBe(2);
    expect(stepNumber({ direction: -1, min: 2, value: null })).toBe(2);
    expect(stepNumber({ direction: 1, max: 3, value: 3 })).toBe(3);
    expect(
      stepNumber({
        allowNegative: false,
        direction: -1,
        value: null,
      }),
    ).toBe(0);
  });

  it("rejects an incompatible step precision", () => {
    expect(() =>
      stepNumber({
        direction: 1,
        maximumFractionDigits: 0,
        step: 0.5,
        value: 1,
      }),
    ).toThrow("step precision cannot exceed maximumFractionDigits");
  });
});
