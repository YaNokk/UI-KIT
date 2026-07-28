import type { Meta, StoryObj } from "@storybook/react-vite";

const roles = [
  ["caption", "11 / 16", "400", "typo-caption"],
  ["body-sm", "13 / 18", "400", "typo-body-sm"],
  ["body", "14 / 20", "400", "typo-body"],
  ["body-strong", "14 / 20", "600", "typo-body-strong"],
  ["body-lg", "16 / 24", "400", "typo-body-lg"],
  ["heading-sm", "16 / 24", "600", "typo-heading-sm"],
  ["heading-md", "18 / 26", "600", "typo-heading-md"],
  ["heading-lg", "22 / 30", "600", "typo-heading-lg"],
  ["page-title", "28 / 36", "600", "typo-page-title"]
] as const;

function TypographyFixture() {
  return (
    <main className="mx-auto grid max-w-5xl gap-6">
      <header className="grid gap-2">
        <h1 className="typo-page-title m-0 text-text-primary">Typography</h1>
        <p className="typo-body m-0 text-text-secondary">
          Inter, ui-sans-serif, system-ui · Кириллица · Latin · 123 456 · 9 999,99 ₽
        </p>
      </header>

      <div className="grid gap-3">
        {roles.map(([role, metrics, weight, className]) => (
          <section
            className="grid gap-2 border-b border-border-default pb-3 md:grid-cols-[10rem_1fr]"
            key={role}
          >
            <div className="typo-caption text-text-secondary">
              typo-{role}<br />{metrics} · {weight}
            </div>
            <div className={`${className} text-text-primary`}>
              Съешь ещё этих мягких французских булок · The quick brown fox · 1 250,50 ₽
            </div>
          </section>
        ))}
      </div>

      <p className="typo-body m-0 max-w-3xl text-text-secondary">
        Длинный текст демонстрирует перенос строк и показывает, что типографическая роль
        задаёт только метрики. Цвет подключается отдельным semantic utility.
      </p>
    </main>
  );
}

const meta = {
  title: "Foundations/Typography",
  component: TypographyFixture,
  tags: ["autodocs"]
} satisfies Meta<typeof TypographyFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllRoles: Story = {};

export const NarrowContainer: Story = {
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
  parameters: { viewport: { defaultViewport: "mobile" } }
};
