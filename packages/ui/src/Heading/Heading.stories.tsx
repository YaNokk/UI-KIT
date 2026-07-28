import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading, type HeadingLevel, type HeadingVariant } from "./Heading";

const variants: HeadingVariant[] = ["sm", "md", "lg", "page"];
const levels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

const meta = {
  title: "Components/Heading",
  component: Heading,
  tags: ["autodocs"],
  args: {
    children: "Заголовок раздела",
    level: 2,
    tone: "primary",
    variant: "md"
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div className="grid gap-3">
      {variants.map((variant) => (
        <Heading {...args} key={variant} variant={variant}>
          {variant} — Сводка заказов 2026
        </Heading>
      ))}
    </div>
  )
};

export const SemanticLevels: Story = {
  render: () => (
    <div className="grid gap-2">
      {levels.map((level) => (
        <Heading key={level} level={level} variant="md">Уровень h{level}</Heading>
      ))}
    </div>
  )
};

export const LongHeading: Story = {
  args: {
    children: "Отчёт по обработке заказов, возвратов и взаиморасчётов за текущий период",
    level: 1,
    variant: "page"
  },
  decorators: [(Story) => <div className="max-w-lg"><Story /></div>]
};

export const HierarchyExample: Story = {
  render: () => (
    <article className="grid max-w-lg gap-3">
      <Heading level={1} variant="page">Заказы</Heading>
      <Heading level={2} variant="lg">Сегодня</Heading>
      <Heading level={3} variant="sm">Требуют внимания</Heading>
    </article>
  )
};
