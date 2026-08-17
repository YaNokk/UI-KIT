import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  BarChart3,
  Boxes,
  Bell,
  CircleHelp,
  Home,
  LogOut,
  Package,
  ShieldCheck,
  Settings,
  Store,
  UserRound
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

function Footer({ detailed = false, stress = false }: { detailed?: boolean; stress?: boolean }) {
  return (
    <Sidebar.Footer>
      {stress ? (
        <>
          <Sidebar.Item icon={<UserRound />} label="Профиль администратора международной торговой площадки" />
          <Sidebar.Item icon={<Bell />} label="Центр уведомлений и важных системных сообщений" />
          <Sidebar.Item icon={<ShieldCheck />} label="Безопасность, разрешения и управление доступом" />
          <Sidebar.Item icon={<Settings />} label="Настройки рабочего пространства организации" />
          <Sidebar.Item icon={<LogOut />} label="Выйти из текущей учётной записи" />
        </>
      ) : null}
      <Sidebar.Item icon={<CircleHelp />} label="Помощь" />
      {detailed ? <span className={styles.footerText}>Версия интерфейса 1.0</span> : null}
    </Sidebar.Footer>
  );
}

function Example({
  collapsed = false,
  long = false,
  alternateSlots = false,
  footerStress = false
}: {
  collapsed?: boolean;
  long?: boolean;
  alternateSlots?: boolean;
  footerStress?: boolean;
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
        <Footer detailed={alternateSlots} stress={footerStress} />
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

export const Expanded: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const sidebar = within(canvasElement).getByRole("complementary", {
      name: "Основная навигация"
    });
    const styles = getComputedStyle(sidebar);
    const canonicalWidth = getComputedStyle(document.documentElement)
      .getPropertyValue("--ds-size-sidebar-expanded");
    expect(styles.inlineSize).toBe(canonicalWidth);
  }
};
export const Collapsed: Story = {
  render: () => <Example collapsed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvas.getByRole("complementary", { name: "Основная навигация" });
    const assertCanonicalGeometryAndCentered = () => {
      const sidebarRect = sidebar.getBoundingClientRect();
      const sidebarCenter = sidebarRect.left + sidebarRect.width / 2;
      const collapseTrigger = canvas.getByRole("button", {
        name: "Развернуть навигацию"
      });
      const collapseTriggerRect = collapseTrigger.getBoundingClientRect();
      const controls = sidebar.querySelectorAll<HTMLElement>("[data-sidebar-nav-control]");
      const rootStyles = getComputedStyle(document.documentElement);
      const canonicalWidth = rootStyles.getPropertyValue("--ds-size-sidebar-collapsed");
      const canonicalRadius = Number.parseFloat(
        rootStyles.getPropertyValue("--ds-radius-lg")
      );

      expect(getComputedStyle(sidebar).inlineSize).toBe(canonicalWidth);
      expect(getComputedStyle(sidebar).overflowX).toBe("visible");
      expect(collapseTriggerRect.right).toBeGreaterThan(sidebarRect.right);
      expect(collapseTriggerRect.left).toBeLessThan(sidebarRect.right);
      const exposedPointElements = document.elementsFromPoint(
        collapseTriggerRect.right - 1,
        collapseTriggerRect.top + collapseTriggerRect.height / 2
      );
      expect(exposedPointElements).toContain(collapseTrigger);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        expect(getComputedStyle(sidebar).transitionDuration).toBe("0s");
      }
      expect(controls.length).toBeGreaterThan(0);
      for (const control of controls) {
        const rect = control.getBoundingClientRect();
        const controlCenter = rect.left + rect.width / 2;
        expect(Math.abs(controlCenter - sidebarCenter)).toBeLessThanOrEqual(1);
        expect(rect.width).toBe(rect.height);
        expect(Number.parseFloat(getComputedStyle(control).borderRadius))
          .toBe(canonicalRadius);
        expect(canonicalRadius).toBeLessThan(rect.width / 2);
      }
    };

    assertCanonicalGeometryAndCentered();
    const previousInlineSize = canvasElement.style.inlineSize;
    canvasElement.style.inlineSize = "calc(var(--ds-space-16) * 6 + var(--ds-space-10))";
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    assertCanonicalGeometryAndCentered();
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
    } else {
      expect(getComputedStyle(submenu).transitionDuration).toBe("0s");
    }
  }
};

export const ExpandSidebarLayoutAnimation: Story = {
  render: () => <Example collapsed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const getLongItemRect = () => canvas.getByRole("link", {
      name: "Склады и движение товаров с максимально длинной подписью"
    }).getBoundingClientRect();
    const getLongItemHeight = () => getLongItemRect().height;
    const collapsedItemHeight = getLongItemHeight();
    await userEvent.click(canvas.getByRole("button", { name: "Развернуть навигацию" }));
    const trigger = canvas.getByRole("button", { name: "Аналитика и отчётность" });
    const submenu = trigger.nextElementSibling as HTMLElement | null;
    if (!submenu) throw new Error("Analytics submenu is unavailable after expansion");

    await new Promise((resolve) => setTimeout(resolve, 60));
    const intermediateHeight = submenu.getBoundingClientRect().height;
    const intermediateItemHeight = getLongItemHeight();
    const intermediateItemWidth = getLongItemRect().width;
    await new Promise((resolve) => setTimeout(resolve, 180));
    const finalHeight = submenu.getBoundingClientRect().height;
    const finalItemHeight = getLongItemHeight();
    const finalItemWidth = getLongItemRect().width;
    const content = canvas.getByRole("navigation", { name: "Разделы приложения" });
    const contentStyles = getComputedStyle(content);
    const usableContentWidth = content.clientWidth
      - Number.parseFloat(contentStyles.paddingInlineStart)
      - Number.parseFloat(contentStyles.paddingInlineEnd);

    expect(finalHeight).toBeGreaterThan(0);
    expect(finalItemHeight).toBeGreaterThan(collapsedItemHeight);
    expect(Math.abs(intermediateItemWidth - finalItemWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(finalItemWidth - usableContentWidth)).toBeLessThanOrEqual(1);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(intermediateHeight).toBeGreaterThan(0);
      expect(intermediateHeight).toBeLessThan(finalHeight);
      expect(intermediateItemHeight).toBeGreaterThan(collapsedItemHeight);
      expect(intermediateItemHeight).toBeLessThan(finalItemHeight);
    }
  }
};

export const ActiveAndDisabled: Story = { render: () => <Example /> };
export const LongMenuScroll: Story = {
  render: () => <Example long />,
  play: async ({ canvasElement }) => {
    const sidebar = within(canvasElement).getByRole("complementary", {
      name: "Основная навигация"
    });
    const content = within(sidebar).getByRole("navigation", {
      name: "Разделы приложения"
    });
    const header = sidebar.firstElementChild as HTMLElement | null;
    const footer = sidebar.lastElementChild as HTMLElement | null;
    if (!header || !footer) throw new Error("Sidebar slots are unavailable");

    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
    expect(getComputedStyle(content).overflowY).toBe("auto");
    expect(header.parentElement).toBe(sidebar);
    expect(footer.parentElement).toBe(sidebar);
    expect(content.contains(header)).toBe(false);
    expect(content.contains(footer)).toBe(false);
    expect(header.getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(sidebar.getBoundingClientRect().top);
    expect(footer.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(sidebar.getBoundingClientRect().bottom + 1);
  }
};
export const LongLabels: Story = { render: () => <Example /> };
export const HeaderAndFooterSlots: Story = { render: () => <Example alternateSlots /> };

export const FooterCollapseExpandGeometry: Story = {
  render: () => <Example footerStress />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvas.getByRole("complementary", { name: "Основная навигация" });
    const footer = sidebar.lastElementChild as HTMLElement | null;
    if (!footer) throw new Error("Sidebar footer geometry is unavailable");

    const capture = () => {
      const profile = canvas.getByRole("button", {
        name: "Профиль администратора международной торговой площадки"
      });
      const icon = profile.firstElementChild as HTMLElement | null;
      if (!icon) throw new Error("Sidebar footer icon is unavailable");
      return {
        blockSize: profile.getBoundingClientRect().height,
        iconCenter: icon.getBoundingClientRect().left
          + icon.getBoundingClientRect().width / 2
          - sidebar.getBoundingClientRect().left
      };
    };
    const expanded = capture();
    await userEvent.click(canvas.getByRole("button", { name: "Свернуть навигацию" }));
    const collapseBeginning = capture();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const collapseMiddle = capture();
    await new Promise((resolve) => setTimeout(resolve, 180));
    const collapsed = capture();

    await userEvent.click(canvas.getByRole("button", { name: "Развернуть навигацию" }));
    const expandBeginning = capture();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const expandMiddle = capture();
    await new Promise((resolve) => setTimeout(resolve, 180));
    const expandedAgain = capture();

    for (const state of [
      collapseBeginning,
      collapseMiddle,
      collapsed,
      expandBeginning,
      expandMiddle,
      expandedAgain
    ]) {
      expect(Math.abs(state.iconCenter - expanded.iconCenter)).toBeLessThanOrEqual(1);
      expect(state.blockSize).toBe(expanded.blockSize);
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(getComputedStyle(sidebar).transitionDuration).toBe("0s");
    }
  }
};

export const CollapsedFlyout: Story = {
  render: () => <Example collapsed />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(canvas.getByRole("button", { name: "Аналитика и отчётность" }));
    const flyout = await body.findByRole("dialog", { name: "Аналитика и отчётность" });
    await waitFor(() => expect(flyout).toBeVisible());
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      expect(getComputedStyle(flyout).animationDuration).toBe("0s");
    }
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
