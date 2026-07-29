import { useContext, useRef, useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { BottomSheet } from "../../BottomSheet/BottomSheet";
import { Button } from "../../Button/Button";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { Dialog, type DialogProps } from "../../Dialog/Dialog";
import { Drawer } from "../../Drawer/Drawer";
import { Input } from "../../Input/Input";
import { Portal } from "../../Portal/Portal";
import type { ModalOpenChangeMeta, SharedModalProps } from "./types";
import { ModalLayerContext } from "./ModalRuntime";

type ModalComponentProps = SharedModalProps & {
  dismissOnBackdrop?: boolean;
};

const components = {
  dialog: Dialog as ComponentType<ModalComponentProps>,
  drawer: Drawer as ComponentType<ModalComponentProps>,
  sheet: BottomSheet as ComponentType<ModalComponentProps>
};

interface HarnessProps {
  children?: SharedModalProps["children"];
  kind: keyof typeof components;
  openInitially?: boolean;
}

function Harness({
  children = <Button variant="primary">Основное действие</Button>,
  kind,
  openInitially = true
}: HarnessProps) {
  const [open, setOpen] = useState(openInitially);
  const [reason, setReason] = useState("none");
  const Component = components[kind];
  return (
    <div className="grid min-h-screen content-start gap-3">
      <div
        className="fixed right-0 top-16 h-8 w-8 bg-background-accent"
        data-fixed-probe=""
      />
      <div
        className="sticky top-0 h-8 w-8 bg-background-success"
        data-sticky-probe=""
      />
      <div className="fixed bottom-4 left-4 z-toast">
        <Button onClick={() => setOpen(true)} variant="secondary">
          Открыть
        </Button>
      </div>
      <output data-close-reason="">{reason}</output>
      <div aria-hidden="true" className="h-screen" />
      <Component
        closeLabel="Закрыть"
        description="Проверка modal foundation"
        onOpenChange={(nextOpen, meta) => {
          setReason(meta.reason);
          setOpen(nextOpen);
        }}
        open={open}
        title={`${kind} surface`}
      >
        {children}
      </Component>
    </div>
  );
}

function NestedHarness({
  childKind,
  rootKind
}: {
  childKind: keyof typeof components;
  rootKind: keyof typeof components;
}) {
  const [rootOpen, setRootOpen] = useState(true);
  const [childOpen, setChildOpen] = useState(false);
  const Root = components[rootKind];
  const Child = components[childKind];
  return (
    <>
      <Button onClick={() => setRootOpen(true)} variant="secondary">
        Открыть root
      </Button>
      <Root
        closeLabel="Закрыть root"
        onOpenChange={setRootOpen}
        open={rootOpen}
        title={`${rootKind} root`}
      >
        <Button onClick={() => setChildOpen(true)} variant="secondary">
          Открыть child
        </Button>
        <Child
          closeLabel="Закрыть child"
          onOpenChange={setChildOpen}
          open={childOpen}
          title={`${childKind} child`}
        >
          <Input label="Поле child" />
        </Child>
      </Root>
    </>
  );
}

function LongContent() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 18 }, (_, index) => (
        <p className="typo-body" key={index}>
          Строка {index + 1}: длинный прокручиваемый контент с кириллицей,
          числами 123 456 и descenders gypqj.
        </p>
      ))}
    </div>
  );
}

function AncestorHarness() {
  const [rootOpen, setRootOpen] = useState(true);
  const [childOpen, setChildOpen] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const close = (
    owner: "root" | "child",
    setter: (open: boolean) => void
  ) => (nextOpen: boolean, meta: ModalOpenChangeMeta) => {
    setEvents((current) => [...current, `${owner}:${meta.reason}`]);
    if (owner === "root") setter(nextOpen);
    if (owner === "child" && meta.reason !== "ancestor") setter(nextOpen);
  };

  return (
    <div className="grid gap-3">
      <Button onClick={() => setRootOpen(true)} variant="secondary">
        Повторно открыть root
      </Button>
      <output data-ancestor-events="">{events.join(",")}</output>
      <Dialog
        closeLabel="Закрыть root"
        onOpenChange={close("root", setRootOpen)}
        open={rootOpen}
        title="Ancestor root"
      >
        <Button onClick={() => setChildOpen(false)} variant="secondary">
          Подтвердить child=false
        </Button>
        <Button onClick={() => setChildOpen(true)} variant="secondary">
          Новый child false→true
        </Button>
        <Drawer
          closeLabel="Закрыть child"
          headerActions={
            <Button onClick={() => setRootOpen(false)} variant="secondary">
              Закрыть ancestor
            </Button>
          }
          onOpenChange={close("child", setChildOpen)}
          open={childOpen}
          title="Stale child"
        >
          Потомок должен скрыться немедленно.
        </Drawer>
      </Dialog>
    </div>
  );
}

function FloatingProbe() {
  const layer = useContext(ModalLayerContext);
  if (!layer) return null;
  return (
    <Portal>
      <div
        data-floating-layer={layer.floatingLayer}
        style={{ position: "fixed", zIndex: layer.floatingLayer }}
      >
        floating probe
      </div>
    </Portal>
  );
}

function FocusHarness() {
  const [childOpen, setChildOpen] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog
      closeLabel="Закрыть parent"
      onOpenChange={() => undefined}
      open
      title="Focus parent"
    >
      <Button onClick={() => setChildOpen(true)} variant="secondary">
        Открыть focus child
      </Button>
      <Input label="Parent field" />
      <Dialog
        closeLabel="Закрыть focus child"
        initialFocusRef={initialFocusRef}
        onOpenChange={setChildOpen}
        open={childOpen}
        title="Focus child"
      >
        <Input label="Initial child field" ref={initialFocusRef} />
        <Button variant="primary">Child action</Button>
      </Dialog>
    </Dialog>
  );
}

const meta = {
  title: "Foundations/Modal",
  component: Dialog,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DialogDefault: Story = {
  args: {} as DialogProps,
  render: () => <Harness kind="dialog" />,
  play: async () => {
    const page = within(document.body);
    const dialog = page.getByRole("dialog", { name: "dialog surface" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await userEvent.click(page.getByRole("button", { name: "Закрыть" }));
    expect(page.getByText("close-button")).toBeInTheDocument();
  }
};

export const DialogNested: Story = {
  args: {} as DialogProps,
  render: () => <NestedHarness childKind="dialog" rootKind="dialog" />
};

export const DialogLongContent: Story = {
  args: {} as DialogProps,
  render: () => <Harness kind="dialog"><LongContent /></Harness>
};

export const DrawerDefault: Story = {
  args: {} as DialogProps,
  render: () => <Harness kind="drawer" />
};

export const DrawerNested: Story = {
  args: {} as DialogProps,
  render: () => <NestedHarness childKind="dialog" rootKind="drawer" />
};

export const DrawerToDrawer: Story = {
  args: {} as DialogProps,
  render: () => <NestedHarness childKind="drawer" rootKind="drawer" />
};

export const DrawerMobile: Story = {
  args: {} as DialogProps,
  render: () => <Harness kind="drawer"><LongContent /></Harness>,
  parameters: { viewport: { defaultViewport: "mobile" } }
};

export const BottomSheetDefault: Story = {
  args: {} as DialogProps,
  render: () => <Harness kind="sheet" />
};

export const BottomSheetLongContent: Story = {
  args: {} as DialogProps,
  render: () => <Harness kind="sheet"><LongContent /></Harness>
};

export const BottomSheetSwipe: Story = {
  args: {} as DialogProps,
  render: () => <Harness kind="sheet">Свайп вниз от handle или верхней границы.</Harness>,
  parameters: { viewport: { defaultViewport: "mobile" } }
};

export const BottomSheetInput: Story = {
  args: {} as DialogProps,
  render: () => (
    <Harness kind="sheet">
      <Input label="Поле рядом с экранной клавиатурой" />
    </Harness>
  ),
  parameters: { viewport: { defaultViewport: "mobile" } }
};

export const StackStress: Story = {
  args: {} as DialogProps,
  render: () => <NestedHarness childKind="sheet" rootKind="drawer" />
};

export const RadixNestedFocus: Story = {
  args: {} as DialogProps,
  render: () => <FocusHarness />
};

export const AncestorInvalidation: Story = {
  args: {} as DialogProps,
  render: () => <AncestorHarness />
};

export const LayerReservation: Story = {
  args: {} as DialogProps,
  render: () => (
    <Harness kind="dialog">
      <FloatingProbe />
      Layer relationship probe
    </Harness>
  )
};

export const NestedProviderPortal: Story = {
  args: {} as DialogProps,
  render: () => (
    // eslint-disable-next-line design-system/no-design-literals -- Runtime brand scope fixture.
    <DesignSystemProvider brand={{ accentColor: "#f97316" }} mode="dark">
      <Harness kind="dialog">Nested scoped Portal</Harness>
    </DesignSystemProvider>
  )
};
