import { createContext, useContext, useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Portal, PortalProvider } from "./Portal";

const meta = {
  title: "Components/Portal",
  component: Portal,
  tags: ["autodocs"],
  parameters: { layout: "padded" }
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultRoot: Story = {
  args: {
    children: (
      <div className="rounded-lg border border-border-default bg-background-surface p-3">
        Этот блок смонтирован в document.body
      </div>
    )
  }
};

export const CustomContainer: Story = {
  args: { children: null },
  render: () => {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    return (
      <div className="grid gap-3">
        <div className="rounded-lg border border-border-default p-3" ref={setRoot} />
        {root ? <Portal container={root}>Контент в явном контейнере</Portal> : null}
      </div>
    );
  }
};

export const ConfiguredRoot: Story = {
  args: { children: null },
  render: () => {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    return (
      <div className="grid gap-3">
        <div className="rounded-lg border border-border-default p-3" ref={setRoot} />
        <PortalProvider root={root}>
          <Portal>Контент ближайшего PortalProvider</Portal>
        </PortalProvider>
      </div>
    );
  }
};

const StoryContext = createContext("Контекст потерян");

export const NestedReactContext: Story = {
  args: { children: null },
  render: () => {
    function ContextValue() {
      return <span>{useContext(StoryContext)}</span>;
    }
    return (
      <StoryContext.Provider value="React-контекст сохранён">
        <Portal><ContextValue /></Portal>
      </StoryContext.Provider>
    );
  }
};

export const ClippingDemo: Story = {
  args: { children: null },
  render: () => {
    const [portalContent, setPortalContent] = useState<HTMLElement | null>(null);
    useEffect(() => setPortalContent(document.body), []);
    return (
      <div className="grid gap-3">
        <div className="h-10 overflow-hidden rounded-lg border border-border-default p-2">
          <div>Родитель с overflow: hidden</div>
          {portalContent ? (
            <Portal container={portalContent}>
              <div className="rounded-lg border border-border-default bg-background-surface p-2 shadow-sm">
                Portal не обрезается родителем
              </div>
            </Portal>
          ) : null}
        </div>
      </div>
    );
  }
};
