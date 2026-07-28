import type { Meta, StoryObj } from "@storybook/react-vite";

const layers = [
  ["default", "Обычный поток", "var(--ds-z-index-default)"],
  ["focused", "Локальное перекрытие соседей", "var(--ds-z-index-focused)"],
  ["popover", "Позиционируемая поверхность", "var(--ds-z-index-popover)"],
  ["modal", "Модальный слой", "var(--ds-z-index-modal)"],
  ["toast", "Глобальное уведомление", "var(--ds-z-index-toast)"]
] as const;

const meta = {
  title: "Foundations/Layers",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Канонический порядок слоёв. Компоненты используют токены и не вводят произвольные z-index."
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CanonicalOrder: Story = {
  render: () => (
    <ol className="grid list-none gap-2 p-0">
      {layers.map(([name, description, value]) => (
        <li
          className="flex items-center justify-between gap-4 rounded-lg border border-border-default bg-background-surface p-3"
          key={name}
        >
          <span><strong>{name}</strong> — {description}</span>
          <code>{value}</code>
        </li>
      ))}
    </ol>
  )
};
