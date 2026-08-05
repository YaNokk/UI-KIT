import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { MultiSelect } from "../../MultiSelect/MultiSelect";
import { Select } from "../../Select/Select";
import { Dialog } from "../../Dialog/Dialog";
import { Drawer } from "../../Drawer/Drawer";
import { Button } from "../../Button/Button";
import { Popover } from "../../Popover/Popover";
import { Tooltip } from "../../Tooltip/Tooltip";

const items = [
  { value: "alpha", label: "Альфа", textValue: "Альфа" },
  { value: "beta", label: "Бета", textValue: "Бета" }
];

function SharedFloatingTriggerFixture() {
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const [selectOpen, setSelectOpen] = useState(false);
  const [multiOpen, setMultiOpen] = useState(false);
  const selectTransitions = useRef<boolean[]>([]);
  const multiTransitions = useRef<boolean[]>([]);
  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)", inlineSize: "28rem" }}>
      <Select
        items={items}
        label="Общий Select trigger"
        onChange={setSelectValue}
        onOpenChange={(nextOpen) => {
          selectTransitions.current.push(nextOpen);
          setSelectOpen(nextOpen);
        }}
        open={selectOpen}
        value={selectValue}
      />
      <output aria-label="Общий Select transitions">
        {selectTransitions.current.map(String).join(",")}
      </output>
      <MultiSelect
        items={items}
        label="Общий MultiSelect trigger"
        onChange={setMultiValue}
        onOpenChange={(nextOpen) => {
          multiTransitions.current.push(nextOpen);
          setMultiOpen(nextOpen);
        }}
        open={multiOpen}
        value={multiValue}
      />
      <output aria-label="Общий MultiSelect transitions">
        {multiTransitions.current.map(String).join(",")}
      </output>
    </div>
  );
}

const meta = {
  title: "Internal/SharedFloatingTriggerBrowserRegression",
  component: Select,
  tags: ["test"]
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RepeatedActivation: Story = {
  args: {} as never,
  render: () => <SharedFloatingTriggerFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const cases = [
      {
        trigger: canvas.getByRole("button", { name: "Общий Select trigger" }),
        transitions: canvas.getByRole("status", { name: "Общий Select transitions" }),
        visualSelector: "[data-select-chevron]"
      },
      {
        trigger: canvas.getByRole("button", { name: "Общий MultiSelect trigger" }),
        transitions: canvas.getByRole("status", { name: "Общий MultiSelect transitions" }),
        visualSelector: "[data-multiselect-chevron]"
      }
    ];

    for (const { trigger, transitions, visualSelector } of cases) {
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(transitions).toHaveTextContent("");
      await userEvent.click(trigger);
      const globalListbox = await body.findByRole("listbox");
      await expect(globalListbox).toBeVisible();
      await expect(
        globalListbox.closest("[data-modal-floating-container]")
      ).toBeNull();
      await expect(globalListbox.closest("[data-ds-portal-root]"))
        .not.toBeNull();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(transitions).toHaveTextContent("true");
      const visualRoot = trigger.closest<HTMLElement>("[data-field-part='shell']")
        ?? trigger;
      const visualTarget = visualRoot.querySelector<HTMLElement>(visualSelector);
      if (!visualTarget) throw new Error(`Missing trigger target ${visualSelector}.`);
      await userEvent.click(visualTarget);
      await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(transitions).toHaveTextContent("true,false");
      await userEvent.click(trigger);
      await expect(await body.findByRole("listbox")).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(transitions).toHaveTextContent("true,false,true");
      await expect(trigger).toBeInTheDocument();
      await userEvent.click(trigger);
      await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      await expect(transitions).toHaveTextContent("true,false,true,false");
    }
  }
};

function SearchableDialogFixture() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Dialog
      closeLabel="Close dialog"
      onOpenChange={() => undefined}
      open
      title="Select in dialog"
    >
      <Select
        items={items}
        label="Client"
        locale="en"
        onChange={setValue}
        searchable
        size="lg"
        value={value}
      />
    </Dialog>
  );
}

export const SearchableInsideDialog: Story = {
  args: {} as never,
  render: () => <SearchableDialogFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole("button", { name: "Client" });
    const chevron = trigger.closest("[data-field-part=\"shell\"]")
      ?.querySelector<HTMLElement>("[data-select-chevron]");
    if (!chevron) throw new Error("Select chevron was not rendered");

    await userEvent.click(chevron);
    const search = await body.findByRole("textbox", { name: "Search options" });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, "Alpha");
    await expect(search).toHaveValue("Alpha");
    await expect(
      search.closest("[data-modal-floating-container]")
    ).not.toBeNull();
    const dialog = body.getByRole("dialog", { name: "Select in dialog" });
    await userEvent.tab();
    await expect(dialog.contains(canvasElement.ownerDocument.activeElement))
      .toBe(true);
    await userEvent.tab({ shift: true });
    await expect(dialog.contains(canvasElement.ownerDocument.activeElement))
      .toBe(true);
  }
};

function DialogEdgeGeometryFixture() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Dialog
      closeLabel="Close dialog"
      onOpenChange={() => undefined}
      open
      title="Floating geometry"
    >
      <div
        style={{
          display: "grid",
          justifyItems: "end",
          minBlockSize: "48rem",
          paddingBlockStart: "36rem"
        }}
      >
        <div style={{ inlineSize: "18rem" }}>
          <Select
            items={items}
            label="Edge client"
            locale="en"
            onChange={setValue}
            open
            value={value}
          />
        </div>
      </div>
    </Dialog>
  );
}

export const DialogEdgeAndScrollGeometry: Story = {
  args: {} as never,
  render: () => <DialogEdgeGeometryFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole("button", { name: "Edge client" });
    const listbox = await body.findByRole("listbox");
    const surface = listbox.closest<HTMLElement>("[data-select-surface]");
    const scrollContainer = trigger.closest<HTMLElement>(
      "[data-modal-scroll-container]"
    );
    if (!surface || !scrollContainer) {
      throw new Error("Modal floating geometry fixture is incomplete");
    }

    const assertAligned = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const surfaceRect = surface.getBoundingClientRect();
      expect(Math.abs(surfaceRect.left - triggerRect.left)).toBeLessThan(3);
      expect(Math.abs(surfaceRect.width - triggerRect.width)).toBeLessThan(3);
      expect(surfaceRect.left).toBeGreaterThanOrEqual(0);
      expect(surfaceRect.right).toBeLessThanOrEqual(window.innerWidth);
      expect(surfaceRect.top).toBeGreaterThanOrEqual(0);
      expect(surfaceRect.bottom).toBeLessThanOrEqual(window.innerHeight);
    };

    await waitFor(assertAligned);
    scrollContainer.scrollTop += 64;
    scrollContainer.dispatchEvent(new Event("scroll", { bubbles: true }));
    await waitFor(assertAligned);
  }
};

function NestedDrawerSelectFixture() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Drawer
      closeLabel="Close parent drawer"
      onOpenChange={() => undefined}
      open
      title="Parent drawer"
    >
      <Drawer
        closeLabel="Close child drawer"
        onOpenChange={() => undefined}
        open
        title="Child drawer"
      >
        <Select
          items={items}
          label="Drawer client"
          locale="en"
          onChange={setValue}
          value={value}
        />
      </Drawer>
    </Drawer>
  );
}

export const SelectInsideNestedDrawer: Story = {
  args: {} as never,
  render: () => <NestedDrawerSelectFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole("button", { name: "Drawer client" });
    await userEvent.click(trigger);
    const option = await body.findByRole("option", { name: "Альфа" });
    await expect(option.closest("[data-modal-floating-container]"))
      .not.toBeNull();
    await userEvent.click(option);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvasElement.ownerDocument.querySelectorAll("[data-modal-surface]")
    ).toHaveLength(2);
  }
};

function DialogPopoverFixture() {
  const [open, setOpen] = useState(false);
  const [clicks, setClicks] = useState(0);
  return (
    <Dialog
      closeLabel="Close dialog"
      onOpenChange={() => undefined}
      open
      title="Popover dialog"
    >
      <Popover
        onOpenChange={setOpen}
        open={open}
        trigger={<Button variant="secondary">Open popover</Button>}
      >
        <Button
          onClick={() => setClicks((current) => current + 1)}
          variant="secondary"
        >
          Popover action
        </Button>
      </Popover>
      <output aria-label="Popover clicks">{clicks}</output>
    </Dialog>
  );
}

export const PopoverInsideDialog: Story = {
  args: {} as never,
  render: () => <DialogPopoverFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("button", { name: "Open popover" })
    );
    const action = await body.findByRole("button", { name: "Popover action" });
    await expect(action.closest("[data-modal-floating-container]"))
      .not.toBeNull();
    await userEvent.click(action);
    await expect(body.getByRole("status", { name: "Popover clicks" }))
      .toHaveTextContent("1");
    await expect(body.getByRole("dialog", { name: "Popover dialog" }))
      .toBeVisible();
  }
};

function DrawerTooltipFixture() {
  return (
    <Drawer
      closeLabel="Close drawer"
      headerActions={(
        <Tooltip content="Drawer help">
          <Button variant="secondary">Help</Button>
        </Tooltip>
      )}
      onOpenChange={() => undefined}
      open
      title="Tooltip drawer"
    >
      Drawer content
    </Drawer>
  );
}

export const TooltipInsideDrawerHeader: Story = {
  args: {} as never,
  render: () => <DrawerTooltipFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(await body.findByRole("button", { name: "Help" }));
    const tooltip = await body.findByRole("tooltip");
    await expect(tooltip).toHaveTextContent("Drawer help");
    await expect(tooltip.closest("[data-modal-floating-container]"))
      .not.toBeNull();
    await expect(body.getByRole("dialog", { name: "Tooltip drawer" }))
      .toBeVisible();
  }
};

function EscapeHierarchyFixture() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [selectOpen, setSelectOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const transitions = useRef<string[]>([]);
  return (
    <>
      <Dialog
        closeLabel="Close dialog"
        onOpenChange={(nextOpen) => {
          if (!nextOpen) transitions.current.push("dialog");
          setDialogOpen(nextOpen);
        }}
        open={dialogOpen}
        title="Escape dialog"
      >
        <Select
          items={items}
          label="Escape client"
          locale="en"
          onChange={setValue}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) transitions.current.push("select");
            setSelectOpen(nextOpen);
          }}
          open={selectOpen}
          value={value}
        />
      </Dialog>
      <output aria-label="Escape transitions">
        {transitions.current.join(",")}
      </output>
    </>
  );
}

export const EscapeClosesFloatingBeforeModal: Story = {
  args: {} as never,
  render: () => <EscapeHierarchyFixture />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole("button", { name: "Escape client" });
    await userEvent.click(trigger);
    const listbox = await body.findByRole("listbox");
    const surface = listbox.closest("[data-select-surface]");
    await waitFor(() => expect(surface).toBeVisible());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("listbox")).toBeNull());
    await expect(body.getByRole("dialog", { name: "Escape dialog" }))
      .toBeVisible();
    const transitions = canvasElement.ownerDocument.querySelector(
      "output[aria-label=\"Escape transitions\"]"
    );
    await expect(transitions).toHaveTextContent("select");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(body.queryByRole("dialog", { name: "Escape dialog" })).toBeNull();
    });
    await expect(transitions)
      .toHaveTextContent("select,dialog");
  }
};
