import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Edit3,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  X
} from "lucide-react";
import { IconButton } from "./IconButton";
import type {
  IconButtonSize,
  IconButtonVariant
} from "./IconButton";

const variants: IconButtonVariant[] = [
  "primary",
  "secondary",
  "soft",
  "ghost",
  "danger"
];
const sizes: IconButtonSize[] = ["sm", "md", "lg"];

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: {
    "aria-label": "Обновить",
    icon: <RefreshCw />,
    size: "md",
    variant: "ghost"
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <IconButton
          {...args}
          aria-label={`Вариант ${variant}`}
          key={variant}
          variant={variant}
        />
      ))}
    </div>
  )
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <IconButton
          {...args}
          aria-label={`Размер ${size}`}
          key={size}
          size={size}
        />
      ))}
    </div>
  )
};

export const Loading: Story = {
  args: { loading: true, variant: "primary" }
};

export const Disabled: Story = {
  args: { disabled: true }
};

export const AccessibleNames: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton aria-label="Поиск" icon={<Search />} />
      <span id="more-actions-label">Дополнительные действия</span>
      <IconButton aria-labelledby="more-actions-label" icon={<MoreHorizontal />} />
    </div>
  )
};

export const ToolbarExample: Story = {
  render: () => (
    <div
      aria-label="Действия отчёта"
      className="flex items-center gap-1 rounded-lg border border-border-default bg-background-surface p-1"
      role="toolbar"
    >
      <IconButton aria-label="Поиск" icon={<Search />} size="sm" />
      <IconButton aria-label="Обновить" icon={<RefreshCw />} size="sm" />
      <IconButton aria-label="Ещё" icon={<MoreHorizontal />} size="sm" />
    </div>
  )
};

export const RowActionsExample: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <IconButton aria-label="Редактировать заказ" icon={<Edit3 />} size="sm" />
      <IconButton
        aria-label="Удалить заказ"
        icon={<Trash2 />}
        size="sm"
        variant="danger"
      />
    </div>
  )
};

export const CloseActionExample: Story = {
  args: {
    "aria-label": "Закрыть диалог",
    icon: <X />
  }
};

export const BrandStress: Story = {
  render: () => (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <IconButton aria-label="Primary" icon={<RefreshCw />} variant="primary" />
        <IconButton aria-label="Soft" icon={<RefreshCw />} variant="soft" />
        <IconButton aria-label="Ghost" icon={<RefreshCw />} variant="ghost" />
      </div>
      <p className="typo-body-sm m-0 text-text-secondary">
        Проверьте blue, green, purple, yellow и near-black через global accent toolbar.
      </p>
    </div>
  )
};
