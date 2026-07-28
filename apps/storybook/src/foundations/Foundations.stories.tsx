import type { Meta, StoryObj } from "@storybook/react-vite";

function FoundationsFixture() {
  const semanticColors = [
    ["Page", "bg-background-page"],
    ["Surface", "bg-background-surface"],
    ["Subtle", "bg-background-subtle"],
    ["Selected", "bg-background-selected"],
    ["Primary action", "bg-action-primary-background text-action-primary-foreground"],
    ["Success", "bg-status-success-background text-status-success-foreground"],
    ["Warning", "bg-status-warning-background text-status-warning-foreground"],
    ["Danger", "bg-status-danger-background text-status-danger-foreground"]
  ] as const;

  return (
    <main className="mx-auto grid max-w-5xl gap-6">
      <header className="grid gap-2">
        <p className="typo-body-sm m-0 text-text-secondary">Iteration 0 fixture</p>
        <h1 className="typo-page-title m-0">Design-system foundations</h1>
        <p className="typo-body m-0 max-w-3xl text-text-secondary">
          Эта story проверяет semantic aliases, light/dark и ограниченный runtime brand.
          Она не является публичным компонентом.
        </p>
      </header>

      <section className="grid gap-3">
        <h2 className="typo-heading-md m-0">Semantic colors</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {semanticColors.map(([label, className]) => (
            <div
              className={`${className} min-h-24 rounded-lg border border-border-default p-3`}
              key={label}
            >
              <span className="typo-body-strong">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-border-default bg-background-surface p-4">
        <h2 className="typo-heading-md m-0">Control semantics</h2>
        <div className="flex flex-wrap gap-3">
          <span className="typo-body-strong rounded-lg bg-action-primary-background px-4 py-2 text-action-primary-foreground">
            Primary
          </span>
          <span className="typo-body-strong rounded-lg border border-border-default bg-action-secondary-background px-4 py-2 text-action-secondary-foreground">
            Secondary
          </span>
          <span className="typo-body-strong rounded-lg bg-action-ghost-background-hover px-4 py-2 text-action-ghost-foreground">
            Accent soft
          </span>
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Foundations/Overview",
  component: FoundationsFixture,
  tags: ["autodocs"]
} satisfies Meta<typeof FoundationsFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NarrowContainer: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    )
  ]
};
