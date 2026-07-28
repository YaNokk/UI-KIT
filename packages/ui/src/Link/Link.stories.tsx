import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Link } from "./Link";
import type { LinkSize, LinkTone } from "./types";

const sizes: LinkSize[] = ["sm", "md", "lg"];
const tones: LinkTone[] = ["accent", "primary", "secondary", "danger", "inherit"];

const meta = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    children: "Открыть заказы",
    href: "#orders",
    size: "md",
    tone: "accent"
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  render: (args) => <p className="typo-body m-0">Перейдите в <Link {...args}>список заказов</Link>, чтобы продолжить.</p>
};

export const Standalone: Story = {
  args: { appearance: "standalone" }
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {sizes.map((size) => <Link {...args} key={size} size={size}>{size}</Link>)}
    </div>
  )
};

export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-2">
      {tones.map((tone) => <Link {...args} key={tone} tone={tone}>{tone}</Link>)}
    </div>
  )
};

export const External: Story = {
  args: {
    children: "Внешняя документация",
    external: true,
    href: "https://example.com"
  }
};

export const LongLabel: Story = {
  args: { children: "Открыть подробную документацию по обработке возвратов и взаиморасчётов" },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>]
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    expect(canvas.getByRole("link")).toHaveFocus();
  }
};
