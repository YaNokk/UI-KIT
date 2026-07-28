import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, type TextTone, type TextVariant } from "./Text";

const variants: TextVariant[] = ["caption", "bodySm", "body", "bodyStrong", "bodyLg"];
const tones: TextTone[] = [
  "primary",
  "secondary",
  "disabled",
  "accent",
  "danger",
  "success",
  "warning",
  "inherit"
];

const meta = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  args: {
    children: "Интерфейсный текст",
    tone: "primary",
    variant: "body"
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div className="grid gap-2">
      {variants.map((variant) => (
        <Text {...args} key={variant} variant={variant}>
          {variant} — Съешь ещё этих мягких французских булок, 1 250 ₽
        </Text>
      ))}
    </div>
  )
};

export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-2">
      {tones.map((tone) => (
        <Text {...args} key={tone} tone={tone}>{tone}</Text>
      ))}
    </div>
  )
};

export const AsElements: Story = {
  render: () => (
    <div className="grid gap-2">
      <Text as="span">span</Text>
      <Text as="p">p без автоматических отступов</Text>
      <Text as="div">div</Text>
      <Text as="label" htmlFor="text-story-input">label</Text>
      <input id="text-story-input" />
    </div>
  )
};

export const Truncate: Story = {
  args: {
    children: "Очень длинная строка, которая должна оставаться на одной строке и завершаться многоточием",
    truncate: true
  },
  decorators: [(Story) => <div className="w-64"><Story /></div>]
};

export const LongText: Story = {
  args: {
    as: "p",
    children: "Длинный текст проверяет естественный перенос строк, кириллицу, Latin text, числа 123 456 и денежные значения 9 999,99 ₽ без добавления компонентом внешних отступов."
  },
  decorators: [(Story) => <div className="max-w-lg"><Story /></div>]
};
