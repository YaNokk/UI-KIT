// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { Bell } from "lucide-react";
import { Alert } from "./Alert";

afterEach(cleanup);

describe("Alert", () => {
  it("defaults to neutral without asserting live-region semantics", () => {
    render(<Alert title="Контекст">Описание</Alert>);
    const alert = screen.getByText("Контекст").closest("[data-alert]");
    expect(alert).toHaveAttribute("data-variant", "neutral");
    expect(alert).not.toHaveAttribute("role");
    expect(alert).not.toHaveAttribute("aria-live");
  });

  it.each(["success", "error", "warning", "info", "neutral"] as const)(
    "maps the %s variant through the shared feedback contract",
    (variant) => {
      const { container } = render(<Alert title={variant} variant={variant} />);
      expect(container.querySelector("[data-alert]"))
        .toHaveAttribute("data-feedback-variant", variant);
      expect(container.querySelector("[data-feedback-icon]"))
        .toHaveAttribute("aria-hidden", "true");
    }
  );

  it("supports title-only and body-only content", () => {
    const { rerender } = render(<Alert title="Только заголовок" />);
    expect(screen.getByText("Только заголовок")).toBeInTheDocument();
    rerender(<Alert>Только описание</Alert>);
    expect(screen.getByText("Только описание")).toBeInTheDocument();
  });

  it("supports custom and disabled icons", () => {
    const { container, rerender } = render(
      <Alert icon={<Bell data-testid="custom-icon" />} title="Событие" />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    rerender(<Alert icon={false} title="Без иконки" />);
    expect(container.querySelector("[data-feedback-icon]")).not.toBeInTheDocument();
    expect(container.querySelector("[data-alert]")).toHaveAttribute("data-has-icon", "false");
  });

  it("forwards native attributes, className, role and ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Alert
        aria-label="Динамическая ошибка"
        className="consumer-class"
        data-source="server"
        ref={ref}
        role="alert"
      >
        Ошибка
      </Alert>
    );
    const alert = screen.getByRole("alert", { name: "Динамическая ошибка" });
    expect(alert).toHaveClass("consumer-class");
    expect(alert).toHaveAttribute("data-source", "server");
    expect(ref.current).toBe(alert);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <Alert title="Требуется внимание" variant="warning">
        Срок действия лицензии истекает через 7 дней.
      </Alert>
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
