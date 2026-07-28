import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Button,
  type ButtonSize,
  type ButtonVariant
} from "../Button/Button";
import {
  ButtonLink,
  type ButtonLinkProps
} from "./ButtonLink";

const variants: ButtonVariant[] = ["primary", "secondary", "soft", "danger"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

const meta = {
  title: "Components/ButtonLink",
  component: ButtonLink,
  tags: ["autodocs"],
  args: {
    children: "Открыть заказы",
    href: "#orders",
    size: "md",
    variant: "primary"
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <ButtonLink {...args} key={variant} variant={variant}>
          {variant}
        </ButtonLink>
      ))}
    </div>
  )
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <ButtonLink {...args} key={size} size={size}>
          {size}
        </ButtonLink>
      ))}
    </div>
  )
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonLink {...args} startIcon={<ArrowLeft />}>Назад</ButtonLink>
      <ButtonLink {...args} endIcon={<ArrowRight />}>Подробнее</ButtonLink>
    </div>
  )
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [(Story) => <div className="w-full max-w-lg"><Story /></div>]
};

export const NativeAnchorProps: Story = {
  args: {
    children: "Скачать отчёт",
    download: "report.csv",
    href: "data:text/csv;charset=utf-8,order,total",
    referrerPolicy: "no-referrer"
  }
};

export const ButtonVsButtonLink: Story = {
  render: (args) => (
    <div className="grid w-full gap-3">
      {variants.flatMap((variant) =>
        sizes.map((size) => {
          const visualProps: Pick<
            ButtonLinkProps,
            "size" | "variant"
          > = { size, variant };
          return (
            <div className="grid grid-cols-2 gap-3" key={`${variant}-${size}`}>
              <Button {...visualProps}>{variant} {size}</Button>
              <ButtonLink {...args} {...visualProps}>{variant} {size}</ButtonLink>
            </div>
          );
        })
      )}
    </div>
  ),
  decorators: [(Story) => <div className="w-full max-w-lg"><Story /></div>]
};
