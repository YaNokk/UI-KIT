import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../../../../tokens/generated/tokens.css";
import { MultiSelect } from "../../MultiSelect/MultiSelect";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

const items = [
  { value: "alpha", label: "Alpha", textValue: "Alpha" },
  { value: "beta", label: "Beta", textValue: "Beta" }
];

function Fixture() {
  const [changes, setChanges] = useState(0);
  const [value, setValue] = useState(["alpha", "beta"]);
  return (
    <div style={{ inlineSize: 320 }}>
      <MultiSelect
        block
        items={items}
        label="Tag remove state capture"
        locale="en-US"
        onChange={(nextValue) => {
          setChanges((count) => count + 1);
          setValue(nextValue);
        }}
        value={value}
      />
      <output aria-label="Tag remove changes">{changes}</output>
    </div>
  );
}

function tagElements() {
  const remove = document.querySelector<HTMLElement>("[data-field-chip-remove]");
  const chip = remove?.closest<HTMLElement>("[data-field-chip]");
  if (!remove || !chip) throw new Error("Tag remove state fixture is incomplete.");
  return { chip, remove };
}

function expectContainedAndStable(chip: HTMLElement, remove: HTMLElement, initial: DOMRect) {
  const chipRect = chip.getBoundingClientRect();
  const removeRect = remove.getBoundingClientRect();
  expect(Math.abs(chipRect.width - initial.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(chipRect.height - initial.height)).toBeLessThanOrEqual(0.5);
  expect(removeRect.left).toBeGreaterThanOrEqual(chipRect.left);
  expect(removeRect.top).toBeGreaterThanOrEqual(chipRect.top);
  expect(removeRect.right).toBeLessThanOrEqual(chipRect.right);
  expect(removeRect.bottom).toBeLessThanOrEqual(chipRect.bottom);
}

async function wait(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForPseudoState(element: Element, state: ":active" | ":hover") {
  const deadline = performance.now() + 1000;
  while (!element.matches(state) && performance.now() < deadline) await wait(10);
  expect(element.matches(state)).toBe(true);
}

beforeEach(async () => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root.render(<Fixture />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("MultiSelect tag remove real browser states", () => {
  it("captures genuine hover and active without geometry drift, then removes once", async () => {
    const { chip, remove } = tagElements();
    const initialRect = chip.getBoundingClientRect();
    const locator = page.getByRole("button", { name: "Remove Alpha" });

    await act(async () => locator.hover());
    await waitForPseudoState(remove, ":hover");
    expectContainedAndStable(chip, remove, initialRect);

    // The delay deliberately keeps the native pointer-down interval observable.
    await act(async () => {
      const interaction = Promise.resolve(locator.click({ delay: 600 }));
      await waitForPseudoState(remove, ":active");
      expectContainedAndStable(chip, remove, initialRect);
      await interaction;
    });

    expect(remove.matches(":active")).toBe(false);
    expect(document.querySelector("[data-field-chip-remove][aria-label=\"Remove Alpha\"]"))
      .toBeNull();
    expect(document.querySelector("[data-field-chip-remove][aria-label=\"Remove Beta\"]"))
      .not.toBeNull();
    expect(document.querySelector("[aria-label=\"Tag remove changes\"]")?.textContent)
      .toBe("1");
  });
});
