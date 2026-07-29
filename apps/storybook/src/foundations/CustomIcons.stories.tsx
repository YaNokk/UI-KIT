import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundations/Icons/Custom",
  tags: ["autodocs"],
  parameters: { layout: "padded" }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {
  render: () => (
    <section className="grid max-w-2xl gap-3 rounded-lg border border-border-default bg-background-surface p-6">
      <h2 className="typo-heading-sm m-0 text-text-primary">
        Пользовательских иконок пока нет
      </h2>
      <p className="m-0 text-text-secondary">
        Сначала найдите семантически подходящую иконку Lucide. Новая Mypoint
        иконка допускается только с описанием смысла, места использования,
        рассмотренных альтернатив и причины отдельного glyph.
      </p>
    </section>
  )
};
