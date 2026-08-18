import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DatePicker } from "../../DatePicker/DatePicker";
import { Button } from "../../Button/Button";
import { Dialog } from "../../Dialog/Dialog";
import { Drawer } from "../../Drawer/Drawer";
import { Input } from "../../Input/Input";
import { Select } from "../../Select/Select";

const items = [
  { value: "alpha", label: "Альфа", textValue: "Альфа" },
  { value: "beta", label: "Бета", textValue: "Бета" }
];

function DrawerDocumentScrollOwnershipFixture() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ alignContent: "start", display: "grid", gap: "1rem", minBlockSize: "180vh" }}>
      <div
        data-bounded-app-scroll-owner=""
        style={{ blockSize: "12rem", overflow: "auto" }}
      >
        <div style={{ blockSize: "40rem" }}>Bounded application scroll owner</div>
      </div>
      <div style={{ insetBlockEnd: "1rem", insetInlineStart: "1rem", position: "fixed" }}>
        <Button onClick={() => setOpen(true)} variant="secondary">
          Открыть длинный Drawer
        </Button>
      </div>
      <Drawer
        closeLabel="Закрыть длинный Drawer"
        footer={<Button onClick={() => setOpen(false)} variant="primary">Готово</Button>}
        onOpenChange={setOpen}
        open={open}
        title="Длинный Drawer с фиксированным footer"
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          {Array.from({ length: 24 }, (_, index) => (
            <p key={index}>Строка {index + 1}: длинный Drawer body content.</p>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

function elementsAtCenter(element: Element) {
  const rect = element.getBoundingClientRect();
  return element.ownerDocument.elementsFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
}

function HostileApplicationLayerFixture() {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ minBlockSize: "100vh" }}>
      <div
        data-test-sticky-table=""
        style={{
          blockSize: "6rem",
          inlineSize: "100%",
          position: "sticky",
          top: 0,
          transform: "translateZ(0)",
          zIndex: 3
        }}
      >
        Sticky table header
      </div>
      <Drawer
        closeLabel="Close hostile drawer"
        onOpenChange={setOpen}
        open={open}
        title="Hostile stacking drawer"
      >
        Drawer content
      </Drawer>
    </div>
  );
}

function LayeredSelect({ label }: { label: string }) {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<string | null>(null);

  return (
    <>
      <Select
        items={items}
        label={label}
        onChange={setValue}
        onOpenChange={setOpen}
        open={open}
        value={value}
      />
      <div
        data-test-modal-content-layer=""
        style={{
          background: "var(--ds-background-surface-raised)",
          inset: 0,
          position: "fixed",
          zIndex: 10
        }}
      >
        Modal content
      </div>
      <output aria-label={`${label} value`}>{value ?? "empty"}</output>
    </>
  );
}

function FloatingAboveContentFixture() {
  return (
    <Drawer
      closeLabel="Close layered drawer"
      onOpenChange={() => undefined}
      open
      title="Floating above content"
    >
      <LayeredSelect label="Layered client" />
    </Drawer>
  );
}

function NestedEscapeFixture() {
  const [parentOpen, setParentOpen] = useState(true);
  const [childOpen, setChildOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(true);
  const [value, setValue] = useState<string | null>(null);
  const [transitions, setTransitions] = useState<string[]>([]);
  const [parentActions, setParentActions] = useState(0);
  const recordTransition = (
    transition: "select" | "child" | "parent"
  ) => {
    setTransitions((current) => [...current, transition]);
  };

  return (
    <>
      <Drawer
        closeLabel="Close parent drawer"
        onOpenChange={(nextOpen) => {
          if (!nextOpen) recordTransition("parent");
          setParentOpen(nextOpen);
        }}
        open={parentOpen}
        title="Layered parent drawer"
      >
        <Button onClick={() => setChildOpen(true)} variant="secondary">
          Open layered child drawer
        </Button>
        <Button
          onClick={() => setParentActions((value) => value + 1)}
          variant="secondary"
        >
          Parent workspace action
        </Button>
        <output aria-label="Parent workspace actions">{parentActions}</output>
        <Drawer
          closeLabel="Close child drawer"
          onOpenChange={(nextOpen) => {
            if (!nextOpen) recordTransition("child");
            setChildOpen(nextOpen);
          }}
          open={childOpen}
          title="Layered child drawer"
        >
          <Select
            items={items}
            label="Nested layered client"
            onChange={setValue}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) recordTransition("select");
              setSelectOpen(nextOpen);
            }}
            open={selectOpen}
            value={value}
          />
          <div
            data-test-modal-content-layer=""
            style={{
              background: "var(--ds-background-surface-raised)",
              inset: 0,
              position: "fixed",
              zIndex: 10
            }}
          >
            Child modal content
          </div>
        </Drawer>
      </Drawer>
      <output aria-label="Layer escape transitions">
        {transitions.join(",")}
      </output>
    </>
  );
}

function HorizontalOverflowFields() {
  const [selectValue, setSelectValue] = useState<string | null>(null);

  return (
    <div className="grid gap-3">
      <Input
        label="Очень длинная подпись большого пустого поля"
        labelView="inner"
        placeholder="Введите значение"
        size="lg"
      />
      <Select
        block
        items={items}
        label="Вариант внутри модального окна"
        labelView="inner"
        onChange={setSelectValue}
        placeholder="Выберите вариант"
        size="lg"
        value={selectValue}
      />
      <DatePicker
        block
        label="Дата внутри модального окна"
        labelView="inner"
        size="lg"
      />
      {Array.from({ length: 24 }, (_, index) => (
        <p className="typo-body" key={index}>
          Строка {index + 1}: вертикальная прокрутка остаётся доступной.
        </p>
      ))}
    </div>
  );
}

function DrawerHorizontalOverflowFixture() {
  return (
    <Drawer
      closeLabel="Закрыть проверку Drawer"
      onOpenChange={() => undefined}
      open
      title="FieldShell overflow в Drawer"
    >
      <HorizontalOverflowFields />
    </Drawer>
  );
}

function DialogHorizontalOverflowFixture() {
  return (
    <Dialog
      closeLabel="Закрыть проверку Dialog"
      onOpenChange={() => undefined}
      open
      title="FieldShell overflow в Dialog"
    >
      <Input
        label="Очень длинная подпись большого пустого поля в Dialog"
        labelView="inner"
        size="lg"
      />
    </Dialog>
  );
}

function NarrowColumnOverflowFixture() {
  return (
    <div className="w-80" data-narrow-field-column="">
      <Input
        label="Очень длинная подпись большого пустого поля в узкой колонке"
        labelView="inner"
        size="lg"
      />
    </div>
  );
}

function expectNoHorizontalOverflow(element: HTMLElement) {
  expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth + 1);
}

function expectLabelVisible(shell: HTMLElement) {
  const viewport = shell.querySelector<HTMLElement>(
    "[data-field-part=\"label-viewport\"]"
  );
  const label = shell.querySelector<HTMLElement>(
    "[data-field-part=\"inner-label\"]"
  );
  if (!viewport || !label) throw new Error("Missing FieldShell label viewport");

  const viewportRect = viewport.getBoundingClientRect();
  const labelRect = label.getBoundingClientRect();
  expect(labelRect.right).toBeGreaterThan(viewportRect.left);
  expect(labelRect.left).toBeLessThan(viewportRect.right);
  expect(labelRect.bottom).toBeGreaterThan(viewportRect.top);
  expect(labelRect.top).toBeLessThan(viewportRect.bottom);
}

const meta = {
  title: "Internal/ModalLayeringBrowserRegression",
  component: Drawer,
  tags: ["test"]
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DrawerAboveHostileApplicationLayer: Story = {
  args: {} as never,
  render: () => <HostileApplicationLayerFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const drawer = await body.findByRole("dialog", {
      name: "Hostile stacking drawer"
    });
    const sticky = canvasElement.ownerDocument.querySelector<HTMLElement>(
      "[data-test-sticky-table]"
    );
    if (!sticky) throw new Error("Missing hostile sticky layer");

    await waitFor(() => {
      const drawerRect = drawer.getBoundingClientRect();
      const stickyRect = sticky.getBoundingClientRect();
      const overlapX = Math.max(drawerRect.left, stickyRect.left) + 24;
      const overlapY = Math.max(drawerRect.top, stickyRect.top) + 24;
      const painted = canvasElement.ownerDocument.elementsFromPoint(
        overlapX,
        overlapY
      );
      const firstRelevant = painted.find(
        (element) => drawer.contains(element) || element === sticky
      );

      expect(firstRelevant).toBeDefined();
      expect(firstRelevant === sticky).toBe(false);
      expect(drawer.contains(firstRelevant ?? null)).toBe(true);
    });
    await userEvent.click(
      body.getByRole("button", { name: "Close hostile drawer" })
    );
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  }
};

export const FloatingAboveModalContent: Story = {
  args: {} as never,
  render: () => <FloatingAboveContentFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const option = await body.findByRole("option", { name: "Альфа" });
    const topmost = elementsAtCenter(option)[0];

    await expect(option.closest("[data-modal-floating-container]"))
      .not.toBeNull();
    await expect(option.contains(topmost ?? null)).toBe(true);
    await userEvent.click(option);
    await expect(body.getByRole("status", { name: "Layered client value" }))
      .toHaveTextContent("alpha");
    await expect(body.getByRole("dialog", { name: "Floating above content" }))
      .toBeVisible();
  }
};

export const FieldShellDrawerHorizontalOverflow: Story = {
  args: {} as never,
  render: () => <DrawerHorizontalOverflowFixture />,
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const page = within(document.body);
    const dialog = await page.findByRole("dialog", {
      name: "FieldShell overflow в Drawer"
    });
    const scrollContainer = dialog.querySelector<HTMLElement>(
      "[data-modal-scroll-container]"
    );
    if (!scrollContainer) throw new Error("Missing modal scroll container");

    const input = page.getByRole<HTMLInputElement>("textbox", {
      name: "Очень длинная подпись большого пустого поля"
    });
    const inputShell = input.closest<HTMLElement>("[data-field-part=\"shell\"]");
    if (!inputShell) throw new Error("Missing Input FieldShell");

    expectNoHorizontalOverflow(scrollContainer);
    expectLabelVisible(inputShell);

    await userEvent.click(input);
    await expect(input).toHaveFocus();
    expectNoHorizontalOverflow(scrollContainer);
    expectLabelVisible(inputShell);
    const focusedShellStyles = getComputedStyle(inputShell);
    expect(focusedShellStyles.overflowX).toBe("visible");
    expect(focusedShellStyles.overflowY).toBe("visible");

    const selectTrigger = page.getByRole("button", {
      name: "Вариант внутри модального окна"
    });
    const selectShell = selectTrigger.closest<HTMLElement>(
      "[data-field-part=\"shell\"]"
    );
    const chevron = selectShell?.querySelector<HTMLElement>(
      "[data-select-chevron]"
    );
    if (!selectShell || !chevron) throw new Error("Missing Select status visual");
    const shellRect = selectShell.getBoundingClientRect();
    const chevronRect = chevron.getBoundingClientRect();
    expect(chevronRect.left).toBeGreaterThanOrEqual(shellRect.left);
    expect(chevronRect.right).toBeLessThanOrEqual(shellRect.right);

    await userEvent.click(selectTrigger);
    await waitFor(() => expect(document.querySelector("[data-select-surface]"))
      .not.toBeNull());
    expect(document.querySelector("[data-select-surface]")
      ?.closest("[data-modal-floating-container]")).not.toBeNull();
    expectNoHorizontalOverflow(scrollContainer);
    await userEvent.keyboard("{Escape}");

    const dateInput = page.getByRole<HTMLInputElement>("textbox", {
      name: "Дата внутри модального окна"
    });
    await userEvent.click(dateInput);
    await waitFor(() => expect(document.querySelector("[data-popover-surface]"))
      .not.toBeNull());
    expect(document.querySelector("[data-popover-surface]")
      ?.closest("[data-modal-floating-container]")).not.toBeNull();
    expectNoHorizontalOverflow(scrollContainer);
    await userEvent.keyboard("{Escape}");

    expect(scrollContainer.scrollHeight).toBeGreaterThan(scrollContainer.clientHeight);
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    expect(scrollContainer.scrollTop).toBeGreaterThan(0);
  }
};

export const FieldShellDialogHorizontalOverflow: Story = {
  args: {} as never,
  render: () => <DialogHorizontalOverflowFixture />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", {
      name: "FieldShell overflow в Dialog"
    });
    const scrollContainer = dialog.querySelector<HTMLElement>(
      "[data-modal-scroll-container]"
    );
    const input = page.getByRole<HTMLInputElement>("textbox", {
      name: "Очень длинная подпись большого пустого поля в Dialog"
    });
    const shell = input.closest<HTMLElement>("[data-field-part=\"shell\"]");
    if (!scrollContainer || !shell) throw new Error("Missing Dialog overflow fixture");

    expectNoHorizontalOverflow(scrollContainer);
    expectLabelVisible(shell);
    await userEvent.click(input);
    expectNoHorizontalOverflow(scrollContainer);
    expectLabelVisible(shell);
  }
};

export const FieldShellNarrowColumnHorizontalOverflow: Story = {
  args: {} as never,
  render: () => <NarrowColumnOverflowFixture />,
  play: async ({ canvasElement }) => {
    const column = canvasElement.querySelector<HTMLElement>(
      "[data-narrow-field-column]"
    );
    const input = within(canvasElement).getByRole<HTMLInputElement>("textbox", {
      name: "Очень длинная подпись большого пустого поля в узкой колонке"
    });
    const shell = input.closest<HTMLElement>("[data-field-part=\"shell\"]");
    if (!column || !shell) throw new Error("Missing narrow FieldShell fixture");

    expectNoHorizontalOverflow(column);
    expectLabelVisible(shell);
    await userEvent.click(input);
    expectNoHorizontalOverflow(column);
    expectLabelVisible(shell);
  }
};

export const NestedDrawerEscapeAndLayerOrder: Story = {
  args: {} as never,
  render: () => <NestedEscapeFixture />,
  globals: { viewport: { isRotated: false, value: "desktop" } },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole("button", {
      name: "Open layered child drawer"
    }));
    const option = await body.findByRole("option", { name: "Альфа" });
    await expect(option.contains(elementsAtCenter(option)[0] ?? null)).toBe(true);

    const drawers = Array.from(canvasElement.ownerDocument.querySelectorAll<HTMLElement>(
      "[data-modal-kind='drawer']"
    ));
    const parentDrawer = drawers.find((drawer) => drawer.getAttribute(
      "data-drawer-presentation"
    ) === "adjacent-parent");
    const childDrawer = drawers.find((drawer) => drawer.getAttribute(
      "data-drawer-presentation"
    ) === "adjacent-child");
    const guard = canvasElement.ownerDocument.querySelector<HTMLElement>(
      "[data-modal-guard]"
    );
    if (!parentDrawer || !childDrawer || !guard) {
      throw new Error("Missing active Drawer stack layers");
    }
    await expect(getComputedStyle(parentDrawer).insetInlineEnd).toBe("0px");
    await waitFor(() => expect(getComputedStyle(childDrawer).insetInlineEnd)
      .toBe("500px"));
    await expect(canvasElement.ownerDocument.querySelectorAll(
      "[data-modal-guard]"
    )).toHaveLength(1);
    await waitFor(() => {
      const parentBounds = parentDrawer.getBoundingClientRect();
      const childBounds = childDrawer.getBoundingClientRect();
      expect(Math.abs(childBounds.right - parentBounds.left))
        .toBeLessThanOrEqual(1);
    });
    await expect(Number(guard.style.zIndex))
      .toBeLessThan(Number(parentDrawer.style.zIndex));
    await expect(guard).not.toHaveAttribute("data-dim");
    await expect(parentDrawer).toHaveAttribute("aria-modal", "true");
    await expect(childDrawer).not.toHaveAttribute("aria-modal");
    await expect(getComputedStyle(parentDrawer).animationName).toBe("none");
    await expect(getComputedStyle(childDrawer).animationName).toBe("none");

    const transitions = canvasElement.ownerDocument.querySelector(
      "output[aria-label='Layer escape transitions']"
    );
    if (!transitions) throw new Error("Missing Escape transition output");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("listbox")).toBeNull());
    await expect(transitions).toHaveTextContent("select");
    await expect(body.getByRole("dialog", { name: "Layered child drawer" }))
      .toBeVisible();

    const parentAction = body.getByRole("button", {
      name: "Parent workspace action"
    });
    await userEvent.click(parentAction);
    await expect(body.getByRole("status", {
      name: "Parent workspace actions"
    })).toHaveTextContent("1");
    await expect(parentAction).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(body.queryByRole("dialog", { name: "Layered child drawer" }))
        .toBeNull();
    });
    expect(document.documentElement).toHaveAttribute("data-ds-scroll-locked");
    await expect(transitions).toHaveTextContent("select,child");
    const activeParent = body.getByRole("dialog", {
      name: "Layered parent drawer"
    });
    await expect(activeParent).toBeVisible();
    await expect(activeParent)
      .not.toHaveAttribute("data-drawer-presentation");
    await waitFor(() => expect(body.getByRole("button", {
      name: "Open layered child drawer"
    })).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    expect(document.documentElement).not.toHaveAttribute("data-ds-scroll-locked");
    await expect(transitions).toHaveTextContent("select,child,parent");
  }
};

export const DrawerDocumentScrollOwnership: Story = {
  args: {} as never,
  render: () => <DrawerDocumentScrollOwnershipFixture />,
  play: async ({ canvasElement }) => {
    const ownerDocument = canvasElement.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) throw new Error("Missing Storybook window");
    const page = within(ownerDocument.body);
    ownerDocument.documentElement.style.overflowY = "scroll";
    ownerWindow.scrollTo(0, 320);
    const originalScrollY = ownerWindow.scrollY;
    const originalBlankRange = Math.max(
      0,
      ownerDocument.documentElement.scrollHeight
        - ownerDocument.documentElement.clientHeight
    );

    await userEvent.click(page.getByRole("button", { name: "Открыть длинный Drawer" }));
    const drawer = page.getByRole("dialog", {
      name: "Длинный Drawer с фиксированным footer"
    });
    const scrollContainer = drawer.querySelector<HTMLElement>(
      "[data-modal-scroll-container]"
    );
    if (!scrollContainer) throw new Error("Missing Drawer scroll container");

    expect(ownerDocument.documentElement.style.overflow).toBe("hidden");
    expect(ownerDocument.documentElement.style.overflowY).not.toBe("scroll");
    expect(ownerDocument.body.style.position).toBe("fixed");
    expect(getComputedStyle(scrollContainer).overflowY).toBe("auto");
    expect(drawer.querySelector("footer")).not.toBeNull();
    expect(
      ownerDocument.documentElement.scrollHeight
        - ownerDocument.documentElement.clientHeight
    ).toBeLessThanOrEqual(originalBlankRange);

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    expect(scrollContainer.scrollTop).toBeGreaterThan(0);
    await userEvent.click(page.getByRole("button", { name: "Готово" }));
    expect(ownerDocument.documentElement).not.toHaveAttribute("data-ds-scroll-locked");
    expect(ownerDocument.documentElement.style.overflowY).toBe("scroll");
    expect(ownerWindow.scrollY).toBe(originalScrollY);
    ownerDocument.documentElement.style.overflowY = "";
  }
};
