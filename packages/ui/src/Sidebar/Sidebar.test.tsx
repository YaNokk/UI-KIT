// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { BarChart3, Settings } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

afterEach(cleanup);

function Navigation({ collapsed, onCollapsedChange }: {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  return (
    <Sidebar
      aria-label="Основная навигация"
      {...(collapsed === undefined ? {} : { collapsed })}
      {...(onCollapsedChange ? { onCollapsedChange } : {})}
    >
      <Sidebar.Header>
        <span>Логотип</span>
        <Sidebar.CollapseTrigger collapseLabel="Свернуть" expandLabel="Развернуть" />
      </Sidebar.Header>
      <Sidebar.Content aria-label="Разделы">
        <Sidebar.Item active icon={<BarChart3 />} label="Аналитика" />
        <Sidebar.Group icon={<Settings />} label="Настройки">
          <Sidebar.Subitem label="Профиль" />
          <Sidebar.Subitem disabled label="Доступы" />
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar>
  );
}

describe("Sidebar", () => {
  it("supports uncontrolled collapse state", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const sidebar = screen.getByRole("complementary", { name: "Основная навигация" });
    expect(sidebar).not.toHaveAttribute("data-collapsed");
    await user.click(screen.getByRole("button", { name: "Свернуть" }));
    expect(sidebar).toHaveAttribute("data-collapsed");
    expect(screen.getByRole("button", { name: "Развернуть" })).toBeInTheDocument();
  });

  it("reports controlled collapse requests without mutating the controlled value", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    render(<Navigation collapsed={false} onCollapsedChange={onCollapsedChange} />);

    await user.click(screen.getByRole("button", { name: "Свернуть" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("complementary", { name: "Основная навигация" }))
      .not.toHaveAttribute("data-collapsed");
  });

  it("opens and closes an uncontrolled group with native keyboard activation", async () => {
    const user = userEvent.setup();
    render(<Navigation />);
    const group = screen.getByRole("button", { name: "Настройки" });

    group.focus();
    await user.keyboard("{Enter}");
    expect(group).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Профиль" })).toBeInTheDocument();
    await user.keyboard(" ");
    expect(group).toHaveAttribute("aria-expanded", "false");
  });

  it("serializes inert without React warnings and keeps closed descendants out of tab order", async () => {
    const user = userEvent.setup();
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Navigation />);

    const group = screen.getByRole("button", { name: "Настройки" });
    const submenu = document.getElementById(group.getAttribute("aria-controls") ?? "");
    const profile = screen.getByRole("button", { name: "Профиль", hidden: true });
    expect(submenu).toHaveAttribute("inert");
    expect(submenu).toHaveAttribute("aria-hidden", "true");

    expect(profile.closest("[inert]")).toBe(submenu);

    await user.click(group);
    expect(submenu).not.toHaveAttribute("inert");
    expect(submenu).toHaveAttribute("aria-hidden", "false");
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("supports controlled group state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Sidebar aria-label="Навигация">
        <Sidebar.Content aria-label="Разделы">
          <Sidebar.Group icon={<Settings />} label="Настройки" onOpenChange={onOpenChange} open={false}>
            <Sidebar.Subitem label="Профиль" />
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar>
    );
    await user.click(screen.getByRole("button", { name: "Настройки" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("button", { name: "Профиль" })).not.toBeInTheDocument();
  });

  it("renders a link-like child without nested interactive elements", () => {
    render(
      <Sidebar aria-label="Навигация">
        <Sidebar.Content aria-label="Разделы">
          <Sidebar.Item asChild icon={<BarChart3 />} label="Отчёты">
            <a aria-current="page" href="/reports" />
          </Sidebar.Item>
        </Sidebar.Content>
      </Sidebar>
    );
    const link = screen.getByRole("link", { name: "Отчёты" });
    expect(link).toHaveAttribute("href", "/reports");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.querySelector("button, a")).toBeNull();
  });

  it("prevents disabled link-like activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Sidebar aria-label="Навигация">
        <Sidebar.Content aria-label="Разделы">
          <Sidebar.Item asChild disabled icon={<BarChart3 />} label="Отчёты">
            <a href="/reports" onClick={onClick} />
          </Sidebar.Item>
        </Sidebar.Content>
      </Sidebar>
    );
    const link = screen.getByRole("link", { name: "Отчёты" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("opens a viewport-aware collapsed group flyout and dismisses it with Escape", async () => {
    const user = userEvent.setup();
    render(<Navigation collapsed />);
    const group = screen.getByRole("button", { name: "Настройки" });
    expect(group).toHaveAttribute("aria-expanded", "false");

    await user.hover(group);
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Настройки" })).toBeInTheDocument());
    expect(group).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Профиль" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Настройки" })).not.toBeInTheDocument());
  });

  it("opens a collapsed group flyout from keyboard focus", async () => {
    render(<Navigation collapsed />);
    const group = screen.getByRole("button", { name: "Настройки" });
    group.focus();
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Настройки" })).toBeInTheDocument());
    expect(group).toHaveFocus();
    expect(group).toHaveAttribute("aria-expanded", "true");
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(<Navigation />);
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
