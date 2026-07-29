import { describe, expect, it } from "vitest";
import { stepNumber } from "./stepNumber";

describe("stepNumber", () => {
  it("steps fractional values without binary floating-point artifacts", () => {
    expect(
      stepNumber({
        direction: 1,
        maximumFractionDigits: 2,
        step: 0.1,
        value: 0.1,
      }),
    ).toBe(0.2);
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
        direction: 1,
        maximumFractionDigits: 2,
        step: 0.25,
        value: 1,
      }),
    ).toBe(1.25);
    expect(
      stepNumber({
        direction: 1,
        maximumFractionDigits: 2,
        step: 0.25,
        value: 1.25,
      }),
    ).toBe(1.5);
    expect(
      stepNumber({
        direction: -1,
        maximumFractionDigits: 2,
        step: 0.1,
        value: 0.3,
      }),
    ).toBe(0.2);
    expect(
      stepNumber({
        direction: -1,
        maximumFractionDigits: 2,
        step: 0.25,
        value: 1,
      }),
    ).toBe(0.75);
  });

  it("clamps crossing steps at fractional and negative boundaries", () => {
    expect(
      stepNumber({
        direction: 1,
        max: 1.3,
        maximumFractionDigits: 2,
        step: 0.25,
        value: 1.25,
      }),
    ).toBe(1.3);
    expect(
      stepNumber({
        direction: -1,
        min: -1.3,
        maximumFractionDigits: 2,
        step: 0.25,
        value: -1.25,
      }),
    ).toBe(-1.3);
    expect(
      stepNumber({
        direction: -1,
        min: -1.3,
        maximumFractionDigits: 2,
        step: 0.25,
        value: -1.3,
      }),
    ).toBe(-1.3);
  });

  it("returns the unchanged value when scaled arithmetic is unsafe", () => {
    const largestSafeTenth = Number.MAX_SAFE_INTEGER / 10;

    expect(
      stepNumber({
        direction: 1,
        maximumFractionDigits: 1,
        step: 0.1,
        value: largestSafeTenth,
      }),
    ).toBe(largestSafeTenth);
    expect(
      stepNumber({
        direction: 1,
        max: Number.MAX_SAFE_INTEGER,
        maximumFractionDigits: 1,
        step: 0.1,
        value: 1,
      }),
    ).toBe(1);
    expect(
      stepNumber({
        direction: 1,
        maximumFractionDigits: 1,
        step: 0.2,
        value: (Number.MAX_SAFE_INTEGER - 1) / 10,
      }),
    ).toBe((Number.MAX_SAFE_INTEGER - 1) / 10);
  });

  it("supports the bounded precision scale and rejects a larger one", () => {
    expect(
      stepNumber({
        direction: 1,
        maximumFractionDigits: 15,
        step: 0.000000000000001,
        value: 1,
      }),
    ).toBe(1.000000000000001);
    expect(() =>
      stepNumber({
        direction: 1,
        maximumFractionDigits: 16,
        step: 0.0000000000000001,
        value: 1,
      }),
    ).toThrow("maximumFractionDigits must be an integer between 0 and 15");
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
