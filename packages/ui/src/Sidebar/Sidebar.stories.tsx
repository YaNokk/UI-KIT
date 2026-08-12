import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  BarChart3,
  Boxes,
  CircleHelp,
  Home,
  Package,
  Settings,
  Store
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Sidebar.stories.module.css";

function Header({ alternate = false }: { alternate?: boolean }) {
  return (
    <Sidebar.Header>
      <span aria-hidden="true" className={styles.logo}>{alternate ? <Boxes /> : <Store />}</span>
      <span className={styles.brand}>{alternate ? "Workspace" : "My Point"}</span>
      <Sidebar.CollapseTrigger collapseLabel="Свернуть навигацию" expandLabel="Развернуть навигацию" />
    </Sidebar.Header>
  );
}

function DemoItems({ long = false }: { long?: boolean }) {
  return (
    <>
      <Sidebar.Item active asChild icon={<Home />} label="Главная">
        <a aria-current="page" href="#home" />
      </Sidebar.Item>
      <Sidebar.Group defaultOpen icon={<BarChart3 />} label="Аналитика и отчётность">
        <Sidebar.Subitem active asChild label="Продажи"><a href="#sales" /></Sidebar.Subitem>
        <Sidebar.Subitem asChild label="По продукции"><a href="#products" /></Sidebar.Subitem>
        <Sidebar.Subitem disabled label="Недоступный отчёт" />
      </Sidebar.Group>
      <Sidebar.Item asChild icon={<Package />} label="Склады и движение товаров с максимально длинной подписью">
        <a href="#warehouse" />
      </Sidebar.Item>
      <Sidebar.Group icon={<Settings />} label="Настройки">
        <Sidebar.Subitem asChild label="Профиль"><a href="#profile" /></Sidebar.Subitem>
        <Sidebar.Subitem asChild label="Права доступа"><a href="#access" /></Sidebar.Subitem>
      </Sidebar.Group>
      {long ? Array.from({ length: 14 }, (_, index) => (
        <Sidebar.Item
          icon={index % 2 ? <Package /> : <BarChart3 />}
          key={index}
          label={`Дополнительный раздел ${index + 1}`}
        />
      )) : null}
    </>
  );
}

function Footer({ detailed = false }: { detailed?: boolean }) {
  return (
    <Sidebar.Footer>
      <Sidebar.Item icon={<CircleHelp />} label="Помощь" />
      {detailed ? <span className={styles.footerText}>Версия интерфейса 1.0</span> : null}
    </Sidebar.Footer>
  );
}

function Example({
  collapsed = false,
  long = false,
  alternateSlots = false
}: {
  collapsed?: boolean;
  long?: boolean;
  alternateSlots?: boolean;
}) {
  const [isCollapsed, setCollapsed] = useState(collapsed);
  return (
    <div className={styles.frame}>
      <Sidebar
        aria-label="Основная навигация"
        collapsed={isCollapsed}
        onCollapsedChange={setCollapsed}
      >
        <Header alternate={alternateSlots} />
        <Sidebar.Content aria-label="Разделы приложения">
          <DemoItems long={long} />
        </Sidebar.Content>
        <Footer detailed={alternateSlots} />
      </Sidebar>
    </div>
  );
}

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"]
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = { render: () => <Example /> };
export const Collapsed: Story = {
  render: () => <Example collapsed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvas.getByRole("complementary", { name: "Основная навигация" });
    const assertCircularAndCentered = () => {
      const sidebarRect = sidebar.getBoundingClientRect();
      const sidebarCenter = sidebarRect.left + sidebarRect.width / 2;
      const controls = sidebar.querySelectorAll<HTMLElement>("[data-sidebar-nav-control]");

      expect(controls.length).toBeGreaterThan(0);
      for (const control of controls) {
        const rect = control.getBoundingClientRect();
        const controlCenter = rect.left + rect.width / 2;
        expect(Math.abs(controlCenter - sidebarCenter)).toBeLessThanOrEqual(1);
        expect(Number.parseFloat(getComputedStyle(control).borderRadius))
          .toBeGreaterThanOrEqual(rect.width / 2);
      }
    };

    assertCircularAndCentered();
    const previousInlineSize = canvasElement.style.inlineSize;
    canvasElement.style.inlineSize = "calc(var(--ds-space-16) * 6 + var(--ds-space-10))";
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    assertCircularAndCentered();
    canvasElement.style.inlineSize = previousInlineSize;
  }
};
export const NestedGroups: Story = { render: () => <Example /> };

export const NestedGroupLayoutAnimation: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Настройки" });
    const submenu = trigger.nextElementSibling as HTMLElement | null;
    if (!submenu) throw new Error("Settings submenu is unavailable");

    const initialHeight = submenu.getBoundingClientRect().height;
    await userEvent.click(trigger);
    await new Promise((resolve) => setTimeout(resolve, 60));
    const intermediateHeight = submenu.getBoundingClientRect().height;
    await new Promise((resolve) => setTimeout(resolve, 180));
    const finalHeight = submenu.getBoundingClientRect().height;

    expect(initialHeight).toBe(0);
    expect(finalHeight).toBeGreaterThan(0);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(intermediateHeight).toBeGreaterThan(initialHeight);
      expect(intermediateHeight).toBeLessThan(finalHeight);
    }
  }
};

export const ExpandSidebarLayoutAnimation: Story = {
  render: () => <Example collapsed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const getLongItemHeight = () => canvas.getByRole("link", {
      name: "Склады и движение товаров с максимально длинной подписью"
    }).getBoundingClientRect().height;
    const collapsedItemHeight = getLongItemHeight();
    await userEvent.click(canvas.getByRole("button", { name: "Развернуть навигацию" }));
    const trigger = canvas.getByRole("button", { name: "Аналитика и отчётность" });
    const submenu = trigger.nextElementSibling as HTMLElement | null;
    if (!submenu) throw new Error("Analytics submenu is unavailable after expansion");

    await new Promise((resolve) => setTimeout(resolve, 60));
    const intermediateHeight = submenu.getBoundingClientRect().height;
    const intermediateItemHeight = getLongItemHeight();
    await new Promise((resolve) => setTimeout(resolve, 180));
    const finalHeight = submenu.getBoundingClientRect().height;
    const finalItemHeight = getLongItemHeight();

    expect(finalHeight).toBeGreaterThan(0);
    expect(finalItemHeight).toBeGreaterThan(collapsedItemHeight);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(intermediateHeight).toBeGreaterThan(0);
      expect(intermediateHeight).toBeLessThan(finalHeight);
      expect(intermediateItemHeight).toBeGreaterThan(collapsedItemHeight);
      expect(intermediateItemHeight).toBeLessThan(finalItemHeight);
    }
  }
};

export const ActiveAndDisabled: Story = { render: () => <Example /> };
export const LongMenuScroll: Story = { render: () => <Example long /> };
export const LongLabels: Story = { render: () => <Example /> };
export const HeaderAndFooterSlots: Story = { render: () => <Example alternateSlots /> };

export const CollapsedFlyout: Story = {
  render: () => <Example collapsed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(canvas.getByRole("button", { name: "Аналитика и отчётность" }));
    await waitFor(() => expect(body.getByRole("dialog", { name: "Аналитика и отчётность" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Аналитика и отчётность" })).not.toBeInTheDocument());
  }
};

export const LinkLikeChild: Story = {
  render: () => (
    <div className={styles.frame}>
      <Sidebar aria-label="Навигация со ссылкой">
        <Header />
        <Sidebar.Content aria-label="Разделы">
          <Sidebar.Item active asChild icon={<Home />} label="Настоящая ссылка без вложенной кнопки">
            <a aria-current="page" href="#link-example" />
          </Sidebar.Item>
        </Sidebar.Content>
      </Sidebar>
    </div>
  )
};
