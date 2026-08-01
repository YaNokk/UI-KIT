// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import {
  isFocusWithinElement,
  isFocusWithinSelectRegion
} from "./focusContainment";

describe("isFocusWithinElement", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("treats the reference and floating surface as one focus region", () => {
    const surface = document.createElement("div");
    const reference = document.createElement("button");
    const option = document.createElement("button");
    const outside = document.createElement("button");
    surface.append(option);
    document.body.append(reference, surface, outside);

    expect(isFocusWithinSelectRegion(surface, reference, option)).toBe(true);
    expect(isFocusWithinSelectRegion(surface, reference, reference)).toBe(true);
    expect(isFocusWithinSelectRegion(surface, reference, outside)).toBe(false);
    expect(isFocusWithinSelectRegion(surface, reference, null)).toBe(false);
  });

  it("uses the panel owner-document realm for related targets", () => {
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    const ownerDocument = iframe.contentDocument;
    const ownerWindow = iframe.contentWindow;
    if (!ownerDocument || !ownerWindow) {
      throw new Error("The test environment did not create an iframe realm.");
    }

    const panel = ownerDocument.createElement("div");
    const internalTarget = ownerDocument.createElement("button");
    const externalTarget = ownerDocument.createElement("button");
    panel.append(internalTarget);
    ownerDocument.body.append(panel, externalTarget);

    const NodeCtor = ownerDocument.defaultView?.Node;
    if (!NodeCtor) throw new Error("The iframe realm has no Node constructor.");
    expect(internalTarget).toBeInstanceOf(NodeCtor);
    expect(isFocusWithinElement(panel, internalTarget)).toBe(true);
    expect(isFocusWithinElement(panel, externalTarget)).toBe(false);
  });

  it("falls back safely for a detached document without defaultView", () => {
    const ownerDocument = document.implementation.createHTMLDocument();
    const panel = ownerDocument.createElement("div");
    const internalTarget = ownerDocument.createElement("button");
    panel.append(internalTarget);

    expect(ownerDocument.defaultView).toBeNull();
    expect(isFocusWithinElement(panel, internalTarget)).toBe(true);
    expect(isFocusWithinElement(panel, {} as EventTarget)).toBe(false);
    expect(isFocusWithinElement(panel, null)).toBe(false);
  });
});
