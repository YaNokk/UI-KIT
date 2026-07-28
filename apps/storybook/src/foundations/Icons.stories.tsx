import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Plus,
  Search,
  Trash2,
  type LucideIcon
} from "lucide-react";
import { ThemeProvider } from "@mypoint/ui";

const meta = {
  title: "Foundations/Icons",
  tags: ["autodocs"],
  parameters: { layout: "padded" }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tones = [
  ["primary", "text-icon-primary"],
  ["secondary", "text-icon-secondary"],
  ["disabled", "text-icon-disabled"],
  ["accent", "text-icon-accent"],
  ["danger", "text-icon-danger"],
  ["success", "text-icon-success"],
  ["warning", "text-icon-warning"]
] as const;

const brands = [
  ["Blue", "#0080ff"],
  ["Green", "#16a34a"],
  ["Purple", "#7c3aed"],
  ["Yellow", "#facc15"],
  ["Near black", "#111827"]
] as const;
const modes = ["light", "dark"] as const;

const examples = [
  ["Добавить", Plus],
  ["Поиск", Search],
  ["Удалить", Trash2],
  ["Предупреждение", AlertTriangle],
  ["Успешно", CheckCircle2]
] satisfies ReadonlyArray<readonly [string, LucideIcon]>;

export const BaselineAndSizes: Story = {
  render: () => (
    <div className="grid gap-6">
      <p className="m-0 text-text-secondary">
        Lucide baseline: 24 × 24 source canvas, currentColor, stroke 2,
        round caps and joins.
      </p>
      <div className="flex flex-wrap items-end gap-6">
        {[
          ["sm · 16", "size-icon-sm"],
          ["md · 20", "size-icon-md"],
          ["lg · 24", "size-icon-lg"]
        ].map(([label, className]) => (
          <div className="grid justify-items-center gap-2" key={label}>
            <Search aria-hidden="true" className={className} />
            <span className="text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
};

export const SemanticTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {tones.map(([tone, className]) => (
        <div className="grid justify-items-center gap-2" key={tone}>
          <Info aria-hidden="true" className={`size-icon-lg ${className}`} />
          <span className="text-text-secondary">{tone}</span>
        </div>
      ))}
    </div>
  )
};

export const StaticNamedImports: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 text-icon-primary">
      {examples.map(([label, Icon]) => (
        <div className="flex items-center gap-2" key={label}>
          <Icon aria-hidden="true" className="size-icon-md" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
};

export const RuntimeBrandAccent: Story = {
  render: () => (
    <div className="grid gap-6">
      {modes.map((mode) => (
        <section className="grid gap-3" key={mode}>
          <h2 className="m-0 text-lg font-semibold capitalize">{mode}</h2>
          {brands.map(([name, accentColor]) => (
            <ThemeProvider
              brand={{ accentColor }}
              className="flex items-center gap-3 rounded-lg bg-background-surface p-4 text-icon-accent"
              key={name}
              mode={mode}
            >
              <CheckCircle2 aria-hidden="true" className="size-icon-lg" />
              <span className="text-text-primary">{name}</span>
            </ThemeProvider>
          ))}
        </section>
      ))}
    </div>
  )
};
