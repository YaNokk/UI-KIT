import { afterEach, describe, expect, it } from "vitest";
import { isFocusWithinElement } from "./focusContainment";

describe("isFocusWithinElement", () => {
  afterEach(() => {
    document.body.replaceChildren();
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
