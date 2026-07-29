import type { Meta, StoryObj } from "@storybook/react-vite";
import { Amount } from "../Amount/Amount";
import { Button } from "../Button/Button";
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

export const NestedOverrides: Story = {
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
        <Amount currency="KZT" value={123456} />
        <DesignSystemProvider locale="en-US">
          <div className="p-4">
            <Amount currency="KZT" value={123456} />
          </div>
        </DesignSystemProvider>
      </div>
    </DesignSystemProvider>
  )
};
