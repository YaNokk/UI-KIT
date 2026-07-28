// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createContext, useContext } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Portal, PortalProvider } from "./Portal";

afterEach(cleanup);

describe("Portal", () => {
  it("mounts to document.body by default and cleans up on unmount", () => {
    const { unmount } = render(
      <div data-testid="owner">
        <Portal>
          <span data-testid="content">Portal content</span>
        </Portal>
      </div>
    );

    const content = screen.getByTestId("content");
    expect(content.parentElement).toBe(document.body);
    expect(screen.getByTestId("owner")).not.toContainElement(content);

    unmount();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });

  it("uses an explicit container before a provider root", () => {
    const providerRoot = document.createElement("div");
    const explicitRoot = document.createElement("div");
    document.body.append(providerRoot, explicitRoot);

    const { unmount } = render(
      <PortalProvider root={providerRoot}>
        <Portal container={explicitRoot}>
          <span data-testid="explicit">Explicit</span>
        </Portal>
      </PortalProvider>
    );

    expect(explicitRoot).toContainElement(screen.getByTestId("explicit"));
    expect(providerRoot).not.toContainElement(screen.getByTestId("explicit"));
    unmount();
    providerRoot.remove();
    explicitRoot.remove();
  });

  it("uses the nearest configured root", () => {
    const root = document.createElement("div");
    document.body.append(root);

    const { unmount } = render(
      <PortalProvider root={root}>
        <Portal>
          <span data-testid="configured">Configured</span>
        </Portal>
      </PortalProvider>
    );

    expect(root).toContainElement(screen.getByTestId("configured"));
    unmount();
    root.remove();
  });

  it("preserves React context", () => {
    const MessageContext = createContext("missing");
    function Message() {
      return <span>{useContext(MessageContext)}</span>;
    }

    render(
      <MessageContext.Provider value="preserved">
        <Portal>
          <Message />
        </Portal>
      </MessageContext.Provider>
    );

    expect(screen.getByText("preserved")).toBeInTheDocument();
  });

  it("can render in place when disabled", () => {
    render(
      <div data-testid="owner">
        <Portal disabled>
          <span data-testid="inline">Inline</span>
        </Portal>
      </div>
    );

    expect(screen.getByTestId("owner")).toContainElement(screen.getByTestId("inline"));
  });

  it("renders safely without DOM access during SSR", () => {
    expect(renderToString(<Portal><span>SSR</span></Portal>)).toBe("");
    expect(renderToString(<Portal disabled><span>SSR</span></Portal>)).toContain("SSR");
  });
});
