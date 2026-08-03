import { describe, expect, it } from "vitest";
import { resolveDateMessages } from "./resolveDateMessages";

describe("resolveDateMessages", () => {
  it("resolves the supported Russian and English catalogs", () => {
    expect(resolveDateMessages("ru-RU").apply).toBe("Применить");
    expect(resolveDateMessages("en-US").apply).toBe("Apply");
  });
});
