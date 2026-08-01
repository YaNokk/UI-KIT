/* eslint-disable design-system/no-design-literals -- Deliberate runtime-brand contrast fixtures. */
import type { BrandInput } from "@mypoint/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "../../Badge/Badge";
import { Button } from "../../Button/Button";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { StatusIndicator } from "../../StatusIndicator/StatusIndicator";
import { Tag } from "../../Tag/Tag";
import { systemColors } from "./systemColor";

const brandFixtures: Array<{ brand?: BrandInput; name: string }> = [
  { name: "default-blue" },
  { brand: { accentColor: "#facc15" }, name: "light-yellow" },
  { brand: { accentColor: "#86efac" }, name: "light-green" },
  { brand: { accentColor: "#003366" }, name: "dark-blue" },
  { brand: { accentColor: "#7f1d1d" }, name: "dark-red" },
  { brand: { accentColor: "#facc15", foregroundColor: "#111827" }, name: "explicit-foreground" }
];

function RoleFixture() {
  return (
    <div className="grid gap-2 p-4">
      {systemColors.map((color) => (
        <div className="flex items-center gap-2" data-color-row={color} key={color}>
          <StatusIndicator color={color} size="md" />
          <Tag color={color}>soft</Tag>
          <Tag color={color} onClick={() => undefined} selected>selected</Tag>
          <Badge color={color}>99+</Badge>
        </div>
      ))}
    </div>
  );
}

function BrandFixture({ brand, name }: { brand?: BrandInput; name: string }) {
  return (
    <DesignSystemProvider {...(brand === undefined ? {} : { brand })} data-brand-fixture={name}>
      <div className="flex items-center gap-2 p-2">
        <span data-brand-accent-probe="" style={{ backgroundColor: "var(--ds-brand-accent)" }} />
        <StatusIndicator color="brand" size="md" />
        <Badge color="brand">12</Badge>
        <Button variant="primary">Primary</Button>
      </div>
    </DesignSystemProvider>
  );
}

function Fixture() {
  return (
    <div>
      <RoleFixture />
      {brandFixtures.map((fixture) => <BrandFixture {...fixture} key={fixture.name} />)}
    </div>
  );
}

function rgb(value: string): [number, number, number] {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Unsupported color: ${value}`);
  return channels as [number, number, number];
}

function contrast(background: string, foreground: string) {
  const luminance = (value: string) => {
    const channels = rgb(value).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    const [red = 0, green = 0, blue = 0] = channels;
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  };
  const [lighter = 0, darker = 0] = [luminance(background), luminance(foreground)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const meta = {
  title: "Regression/SystemColorContrast",
  component: Fixture,
  tags: ["test"],
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof Fixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComputedRoles: Story = {
  play: async ({ canvasElement }) => {
    for (const color of systemColors) {
      const row = canvasElement.querySelector(`[data-color-row="${color}"]`);
      if (!(row instanceof HTMLElement)) throw new Error(`Missing ${color} row`);
      const tagLabels = row.querySelectorAll("[data-compact-control-text]");
      const soft = tagLabels[0]?.parentElement?.parentElement;
      const selected = tagLabels[1]?.parentElement?.parentElement;
      const badge = row.querySelector("[data-badge]");
      for (const surface of [soft, selected, badge]) {
        if (!(surface instanceof HTMLElement)) throw new Error(`Missing ${color} surface`);
        const style = getComputedStyle(surface);
        expect(contrast(style.backgroundColor, style.color)).toBeGreaterThanOrEqual(4.5);
      }
    }

    for (const fixture of brandFixtures) {
      const scope = canvasElement.querySelector(`[data-brand-fixture="${fixture.name}"]`);
      if (!(scope instanceof HTMLElement)) throw new Error(`Missing ${fixture.name}`);
      const badge = scope.querySelector("[data-badge]");
      const marker = scope.querySelector("[data-status-indicator]");
      const accent = scope.querySelector("[data-brand-accent-probe]");
      const button = within(scope).getByRole("button", { name: "Primary" });
      if (!(badge instanceof HTMLElement) || !(marker instanceof HTMLElement) || !(accent instanceof HTMLElement)) {
        throw new Error(`Incomplete ${fixture.name} fixture`);
      }
      expect(getComputedStyle(badge).backgroundColor).toBe(getComputedStyle(button).backgroundColor);
      expect(getComputedStyle(badge).color).toBe(getComputedStyle(button).color);
      expect(getComputedStyle(marker).backgroundColor).toBe(getComputedStyle(accent).backgroundColor);
      expect(contrast(getComputedStyle(badge).backgroundColor, getComputedStyle(badge).color))
        .toBeGreaterThanOrEqual(4.5);
    }
  }
};

export const ComputedRolesDark: Story = {
  ...ComputedRoles,
  decorators: [(Story) => <DesignSystemProvider mode="dark"><Story /></DesignSystemProvider>]
};
