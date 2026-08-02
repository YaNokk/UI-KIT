// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import styles from "./Textarea.module.css";
import { Textarea } from "./Textarea";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Textarea", () => {
  it("preserves native attributes, events, form semantics and ref", async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLTextAreaElement | null };
    const onBlur = vi.fn();
    const onChange = vi.fn();
    const onFocus = vi.fn();

    render(
      <Textarea
        autoComplete="off"
        form="details"
        id="notes"
        label="Заметки"
        maxLength={200}
        name="notes"
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        ref={ref}
        required
        spellCheck
      />
    );

    const textarea = screen.getByRole("textbox", { name: "Заметки" });
    await user.type(textarea, "Текст");
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute("name", "notes");
    expect(textarea).toHaveAttribute("form", "details");
    expect(textarea).toHaveAttribute("maxlength", "200");
    expect(textarea).toBeRequired();
    expect(onChange).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalled();
    textarea.blur();
    expect(onBlur).toHaveBeenCalled();
  });

  it("keeps controlled and uncontrolled editing native", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("one");
      return (
        <Textarea
          aria-label="Controlled"
          onChange={(event) => setValue(event.currentTarget.value)}
          value={value}
        />
      );
    }

    render(
      <>
        <Controlled />
        <Textarea aria-label="Uncontrolled" defaultValue="start" />
      </>
    );
    await user.clear(screen.getByLabelText("Controlled"));
    await user.type(screen.getByLabelText("Controlled"), "two");
    await user.type(screen.getByLabelText("Uncontrolled"), "-end");
    expect(screen.getByLabelText("Controlled")).toHaveValue("two");
    expect(screen.getByLabelText("Uncontrolled")).toHaveValue("start-end");
  });

  it("uses size row defaults and supports only none or vertical resize", () => {
    render(
      <>
        <Textarea aria-label="Small" resize="none" size="sm" />
        <Textarea aria-label="Medium" size="md" />
        <Textarea aria-label="Large" resize="vertical" size="lg" />
      </>
    );
    expect(screen.getByLabelText("Small")).toHaveAttribute("rows", "3");
    expect(screen.getByLabelText("Small")).toHaveClass(styles["resize-none"]);
    expect(screen.getByLabelText("Medium")).toHaveAttribute("rows", "4");
    expect(screen.getByLabelText("Large")).toHaveAttribute("rows", "5");
    expect(screen.getByLabelText("Large")).toHaveClass(styles["resize-vertical"]);
  });

  it("keeps disabled and readOnly distinct", () => {
    render(
      <>
        <Textarea aria-label="Disabled" disabled />
        <Textarea aria-label="Read only" readOnly value="Readable" />
      </>
    );
    expect(screen.getByLabelText("Disabled")).toBeDisabled();
    expect(screen.getByLabelText("Read only")).not.toBeDisabled();
    expect(screen.getByLabelText("Read only")).toHaveAttribute("readonly");
  });

  it("floats an inner semantic label on focus and content", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Textarea label="Описание" labelView="inner" placeholder="Введите текст" />
    );
    const textarea = screen.getByRole("textbox", { name: "Описание" });
    const shell = textarea.closest("[data-multiline]");
    expect(shell).not.toHaveAttribute("data-label-floated");
    await user.click(screen.getByText("Описание", { selector: "label" }));
    expect(textarea).toHaveFocus();
    expect(shell).toHaveAttribute("data-label-floated");
    await user.type(textarea, "Значение");
    textarea.blur();
    expect(shell).toHaveAttribute("data-label-floated");

    rerender(
      <Textarea label="Описание" labelView="inner" value="" onChange={() => undefined} />
    );
    expect(screen.getByRole("textbox", { name: "Описание" }).closest("[data-multiline]"))
      .not.toHaveAttribute("data-label-floated");
  });

  it("lets error replace hint while keeping count as description", async () => {
    const user = userEvent.setup();
    render(
      <Textarea
        error="Исправьте описание"
        hint="Подсказка"
        id="description"
        label="Описание"
        maxLength={20}
        showCount
      />
    );
    const textarea = screen.getByRole("textbox", { name: "Описание" });
    await user.type(textarea, "abc");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", "description-error");
    expect(screen.queryByText("Подсказка")).not.toBeInTheDocument();
    expect(screen.getByText("Исправьте описание")).toBeInTheDocument();
    expect(screen.getByText("3 / 20")).toBeInTheDocument();
  });

  it("autosizes between row bounds and preserves selection", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      borderBlockEndWidth: "0px",
      borderBlockStartWidth: "0px",
      lineHeight: "20px",
      paddingBlockEnd: "12px",
      paddingBlockStart: "12px"
    } as CSSStyleDeclaration);
    const { rerender } = render(
      <Textarea aria-label="Autosize" autoSize minRows={2} maxRows={3} value="a" />
    );
    const textarea = screen.getByLabelText("Autosize") as HTMLTextAreaElement;
    let scrollHeight = 120;
    Object.defineProperty(textarea, "scrollHeight", {
      configurable: true,
      get: () => scrollHeight
    });
    rerender(
      <Textarea aria-label="Autosize" autoSize minRows={2} maxRows={3} value="abcdef" />
    );
    expect(textarea.style.height).toBe("84px");
    expect(textarea.style.overflowY).toBe("auto");

    textarea.setSelectionRange(1, 1);
    rerender(
      <Textarea aria-label="Autosize" autoSize minRows={2} maxRows={4} value="abcdef" />
    );
    expect(textarea.selectionStart).toBe(1);

    scrollHeight = 20;
    rerender(
      <Textarea aria-label="Autosize" autoSize minRows={2} maxRows={3} value="short" />
    );
    expect(textarea.style.height).toBe("64px");
    expect(textarea.style.overflowY).toBe("hidden");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <Textarea hint="До 200 символов" label="Комментарий" maxLength={200} required showCount />
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } }
    });
    expect(results.violations).toEqual([]);
  });
});
