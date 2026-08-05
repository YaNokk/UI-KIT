import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Drawer } from "../../Drawer/Drawer";
import { Select } from "../../Select/Select";

const items = [
  { value: "alpha", label: "Альфа", textValue: "Альфа" },
  { value: "beta", label: "Бета", textValue: "Бета" }
];

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
  const [childOpen, setChildOpen] = useState(true);
  const [selectOpen, setSelectOpen] = useState(true);
  const [value, setValue] = useState<string | null>(null);
  const [transitions, setTransitions] = useState<string[]>([]);
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

export const NestedDrawerEscapeAndLayerOrder: Story = {
  args: {} as never,
  render: () => <NestedEscapeFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const option = await body.findByRole("option", { name: "Альфа" });
    await expect(option.contains(elementsAtCenter(option)[0] ?? null)).toBe(true);

    const transitions = canvasElement.ownerDocument.querySelector(
      "output[aria-label='Layer escape transitions']"
    );
    if (!transitions) throw new Error("Missing Escape transition output");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("listbox")).toBeNull());
    await expect(transitions).toHaveTextContent("select");
    await expect(body.getByRole("dialog", { name: "Layered child drawer" }))
      .toBeVisible();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(body.queryByRole("dialog", { name: "Layered child drawer" }))
        .toBeNull();
    });
    await expect(transitions).toHaveTextContent("select,child");
    await expect(body.getByRole("dialog", { name: "Layered parent drawer" }))
      .toBeVisible();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await expect(transitions).toHaveTextContent("select,child,parent");
  }
};
