import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Amount } from "../Amount/Amount";
import { Button } from "../Button/Button";
import { Portal } from "../Portal/Portal";
import { DesignSystemProvider } from "./DesignSystemProvider";

const meta = {
  title: "Foundations/DesignSystemProvider",
  component: DesignSystemProvider,
  parameters: {
    docs: {
      description: {
        component:
          "Application runtime scope for locale, color mode, brand and portal environment."
      }
    }
  }
} satisfies Meta<typeof DesignSystemProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// eslint-disable-next-line design-system/no-design-literals -- Deliberate runtime brand stress input.
const purpleBrand = { accentColor: "#7c3aed", foregroundColor: "#ffffff" };
// eslint-disable-next-line design-system/no-design-literals -- Deliberate runtime brand stress input.
const greenBrand = { accentColor: "#16a34a" };

export const RuntimeScope: Story = {
  args: {
    brand: purpleBrand,
    children: (
      <div className="grid gap-3 p-4">
        <Amount currency="KZT" value={123456} />
        <Button variant="primary">Branded action</Button>
      </div>
    ),
    locale: "ru-RU",
    mode: "light"
  }
};

export const NestedScopes: Story = {
  args: {
    children: null
  },
  render: () => (
    <DesignSystemProvider
      brand={greenBrand}
      locale="ru-RU"
      mode="dark"
    >
      <div className="grid gap-3 p-4">
        <div data-provider-probe="outer-content">Outer content</div>
        <Portal>
          <div data-provider-probe="outer-portal">Outer portal content</div>
        </Portal>
        <Amount currency="KZT" value={123456} />
        <DesignSystemProvider brand={purpleBrand} locale="en-US">
          <div className="p-4">
            <div data-provider-probe="inner-content">Inner content</div>
            <Portal>
              <div data-provider-probe="inner-portal">Inner portal content</div>
            </Portal>
            <Amount currency="KZT" value={123456} />
          </div>
        </DesignSystemProvider>
      </div>
    </DesignSystemProvider>
  )
};

function ExplicitPortalTargetExample() {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  return (
    <div className="grid gap-3 p-4">
      <div data-explicit-portal-root="" ref={setTarget} />
      {target ? (
        <DesignSystemProvider
          brand={purpleBrand}
          mode="dark"
          portalContainer={target}
        >
          <div>Provider content</div>
          <Portal>
            <div data-provider-probe="explicit-portal">
              Explicit portal content
            </div>
          </Portal>
        </DesignSystemProvider>
      ) : null}
    </div>
  );
}

export const ExplicitPortalTarget: Story = {
  args: {
    children: null
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText("Explicit portal content")).toBeVisible()
    );

    const provider = canvas.getByText("Provider content").closest<HTMLElement>(
      "[data-ds-root]"
    );
    const target = canvasElement.querySelector<HTMLElement>(
      "[data-explicit-portal-root]"
    );
    expect(provider).not.toBeNull();
    expect(target).toHaveAttribute("data-brand-theme", "");
    expect(target).toHaveAttribute("data-theme", "dark");
    expect(target?.style.getPropertyValue("--ds-brand-accent")).toBe(
      provider?.style.getPropertyValue("--ds-brand-accent")
    );
  },
  render: () => <ExplicitPortalTargetExample />
};
