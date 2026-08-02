import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../../../../tokens/generated/tokens.css";
import { Checkbox } from "../../Checkbox/Checkbox";
import { Radio } from "../../Radio/Radio";
import { Switch } from "../../Switch/Switch";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const transitionWait = 220;
let host: HTMLDivElement;
let root: Root;

function Probe({ name, value }: { name: string; value: string }) {
  return (
    <span
      data-probe={name}
      style={{ backgroundColor: value, blockSize: 1, inlineSize: 1, position: "absolute" }}
    />
  );
}

function Fixture() {
  return (
    <div>
      <Probe name="control-hover" value="var(--ds-control-border-hover)" />
      <Probe name="primary-hover" value="var(--ds-action-primary-background-hover)" />
      <Probe name="primary-active" value="var(--ds-action-primary-background-active)" />
      <Probe name="selection-hover" value="var(--ds-control-selection-indicator-hover)" />
      <Probe name="selection-active" value="var(--ds-control-selection-indicator-active)" />
      <Checkbox label="Unchecked checkbox capture" />
      <Checkbox defaultChecked label="Checked checkbox capture" />
      <Radio defaultChecked label="Checked radio capture" name="capture-radio" />
      <Switch defaultChecked label="Checked switch capture" />
    </div>
  );
}

function probeColor(name: string) {
  const probe = document.querySelector(`[data-probe="${name}"]`);
  if (!(probe instanceof HTMLElement)) throw new Error(`Missing probe: ${name}`);
  return getComputedStyle(probe).backgroundColor;
}

function elementsFor(label: string) {
  const text = [...document.querySelectorAll("span")]
    .find((element) => element.textContent === label);
  const owner = text?.closest("label");
  const input = owner?.querySelector("input");
  const indicator = input?.nextElementSibling;
  if (
    !(text instanceof HTMLElement)
    || !(owner instanceof HTMLLabelElement)
    || !(input instanceof HTMLInputElement)
    || !(indicator instanceof HTMLElement)
  ) {
    throw new Error(`Incomplete state-capture fixture: ${label}`);
  }
  return { indicator, input, owner, text };
}

async function wait(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForPseudoState(element: Element, state: ":active" | ":hover") {
  const deadline = performance.now() + 1000;
  while (!element.matches(state) && performance.now() < deadline) await wait(10);
  expect(element.matches(state)).toBe(true);
}

async function captureActive(label: string, assertion: (indicator: HTMLElement) => void) {
  const { indicator, owner } = elementsFor(label);
  const interaction = Promise.resolve(page.getByText(label, { exact: true }).click({ delay: 600 }));
  await waitForPseudoState(owner, ":active");
  await wait(transitionWait);
  expect(owner.matches(":active")).toBe(true);
  assertion(indicator);
  await interaction;
  expect(owner.matches(":active")).toBe(false);
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

describe("Choice Control real browser states", () => {
  it("captures real hover and compares computed semantic colors", async () => {
    const unchecked = elementsFor("Unchecked checkbox capture");
    await page.getByText("Unchecked checkbox capture", { exact: true }).hover();
    await waitForPseudoState(unchecked.owner, ":hover");
    await wait(transitionWait);
    expect(getComputedStyle(unchecked.indicator).borderColor).toBe(probeColor("control-hover"));

    const checkbox = elementsFor("Checked checkbox capture");
    await page.getByText("Checked checkbox capture", { exact: true }).hover();
    await waitForPseudoState(checkbox.owner, ":hover");
    await wait(transitionWait);
    const checkboxStyle = getComputedStyle(checkbox.indicator);
    expect(checkboxStyle.backgroundColor).toBe(probeColor("primary-hover"));
    expect(checkboxStyle.borderColor).toBe(probeColor("primary-hover"));

    const radio = elementsFor("Checked radio capture");
    await page.getByText("Checked radio capture", { exact: true }).hover();
    await waitForPseudoState(radio.owner, ":hover");
    await wait(transitionWait);
    const radioDot = radio.indicator.firstElementChild;
    if (!(radioDot instanceof HTMLElement)) throw new Error("Missing Radio dot.");
    expect(getComputedStyle(radio.indicator).borderColor).toBe(probeColor("selection-hover"));
    expect(getComputedStyle(radioDot).backgroundColor).toBe(probeColor("selection-hover"));

    const switchControl = elementsFor("Checked switch capture");
    await page.getByText("Checked switch capture", { exact: true }).hover();
    await waitForPseudoState(switchControl.owner, ":hover");
    await wait(transitionWait);
    const switchStyle = getComputedStyle(switchControl.indicator);
    expect(switchStyle.backgroundColor).toBe(probeColor("primary-hover"));
    expect(switchStyle.borderColor).toBe(probeColor("primary-hover"));
  });

  it("captures real pointer-down active state before release", async () => {
    await captureActive("Checked checkbox capture", (indicator) => {
      const style = getComputedStyle(indicator);
      expect(style.backgroundColor).toBe(probeColor("primary-active"));
      expect(style.borderColor).toBe(probeColor("primary-active"));
    });

    await captureActive("Checked radio capture", (indicator) => {
      const dot = indicator.firstElementChild;
      if (!(dot instanceof HTMLElement)) throw new Error("Missing Radio dot.");
      expect(getComputedStyle(indicator).borderColor).toBe(probeColor("selection-active"));
      expect(getComputedStyle(dot).backgroundColor).toBe(probeColor("selection-active"));
    });

    await captureActive("Checked switch capture", (indicator) => {
      const style = getComputedStyle(indicator);
      expect(style.backgroundColor).toBe(probeColor("primary-active"));
      expect(style.borderColor).toBe(probeColor("primary-active"));
    });
  });
});
