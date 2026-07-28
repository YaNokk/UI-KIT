import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { LinkButton } from "./LinkButton";
import type { LinkSize, LinkTone } from "./types";

const sizes: LinkSize[] = ["sm", "md", "lg"];
const tones: LinkTone[] = ["accent", "primary", "secondary", "danger", "inherit"];

const meta = {
  title: "Components/LinkButton",
  component: LinkButton,
  tags: ["autodocs"],
  args: {
    children: "Повторить",
    onClick: fn(),
    size: "md",
    tone: "accent"
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {sizes.map((size) => <LinkButton {...args} key={size} size={size}>{size}</LinkButton>)}
    </div>
  )
};

export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-2">
      {tones.map((tone) => <LinkButton {...args} key={tone} tone={tone}>{tone}</LinkButton>)}
    </div>
  )
};

export const Disabled: Story = {
  args: { disabled: true }
};

export const KeyboardActivation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    button.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(args.onClick).toHaveBeenCalledTimes(2);
  }
};
