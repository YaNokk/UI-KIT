import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Dialog } from "../Dialog/Dialog";
import { Drawer } from "../Drawer/Drawer";
import { Text } from "../Text/Text";
import { Popover, type PopoverPlacement } from "./Popover";

function PopoverHarness({
  children = "Содержимое Popover",
  matchTriggerWidth = false,
  placement = "bottom-start",
  triggerLabel = "Открыть Popover"
}: {
  children?: ReactNode;
  matchTriggerWidth?: boolean;
  placement?: PopoverPlacement;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      matchTriggerWidth={matchTriggerWidth}
      onOpenChange={setOpen}
      open={open}
      placement={placement}
      trigger={<Button variant="secondary">{triggerLabel}</Button>}
    >
      {children}
    </Popover>
  );
}

function InsideModal({ kind }: { kind: "dialog" | "drawer" }) {
  const [open, setOpen] = useState(true);
  const Modal = kind === "dialog" ? Dialog : Drawer;
  return (
    <Modal
      closeLabel="Закрыть"
      onOpenChange={setOpen}
      open={open}
      title={kind === "dialog" ? "Dialog with Popover" : "Drawer with Popover"}
    >
      <PopoverHarness />
    </Modal>
  );
}

function NestedPopovers() {
  const [parentOpen, setParentOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  return (
    <Popover
      onOpenChange={setParentOpen}
      open={parentOpen}
      trigger={<Button variant="secondary">Открыть parent</Button>}
    >
      <div className="grid gap-3">
        <Text as="p">Parent surface</Text>
        <Popover
          onOpenChange={setChildOpen}
          open={childOpen}
          placement="right-start"
          trigger={<Button variant="secondary">Открыть child</Button>}
        >
          Child surface
        </Popover>
      </div>
    </Popover>
  );
}

const placements: PopoverPlacement[] = [
  "top-start",
  "right-start",
  "bottom-start",
  "left-start"
];

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"]
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as never,
  render: () => <PopoverHarness />
};

export const Placements: Story = {
  args: {} as never,
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-16">
      {placements.map((placement) => (
        <PopoverHarness
          key={placement}
          placement={placement}
          triggerLabel={placement}
        />
      ))}
    </div>
  )
};

export const LongContent: Story = {
  args: {} as never,
  render: () => (
    <PopoverHarness>
      <div className="grid max-w-sm gap-3">
        {Array.from({ length: 8 }, (_, index) => (
          <Text as="p" key={index}>
            Строка {index + 1}: прокручиваемый контент с кириллицей и числами 123.
          </Text>
        ))}
      </div>
    </PopoverHarness>
  )
};

export const MatchTriggerWidth: Story = {
  args: {} as never,
  render: () => (
    <PopoverHarness
      matchTriggerWidth
      triggerLabel="Триггер с шириной для будущего Select"
    />
  )
};

export const InsideDrawer: Story = {
  args: {} as never,
  render: () => <InsideModal kind="drawer" />
};

export const InsideDialog: Story = {
  args: {} as never,
  render: () => <InsideModal kind="dialog" />
};

export const Nested: Story = {
  args: {} as never,
  render: () => <NestedPopovers />
};

export const Dark: Story = {
  args: {} as never,
  render: () => (
    <DesignSystemProvider mode="dark">
      <div className="p-16">
        <PopoverHarness />
      </div>
    </DesignSystemProvider>
  )
};

export const DesignerReference: Story = {
  args: {} as never,
  render: () => (
    <PopoverHarness triggerLabel="Единица измерения">
      <div className="grid gap-2">
        <Text as="p">Штука</Text>
        <Text as="p">Упаковка</Text>
        <Text as="p">Килограмм</Text>
      </div>
    </PopoverHarness>
  )
};
