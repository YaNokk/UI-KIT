import { useContext, useRef, useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { BottomSheet } from "../../BottomSheet/BottomSheet";
import { Button } from "../../Button/Button";
import { DesignSystemProvider } from "../../DesignSystemProvider/DesignSystemProvider";
import { Dialog, type DialogProps } from "../../Dialog/Dialog";
import { Drawer } from "../../Drawer/Drawer";
import { Input } from "../../Input/Input";
import { Portal } from "../../Portal/Portal";
import { Select } from "../../Select/Select";
import { Text } from "../../Text/Text";
import type { ModalBaseProps } from "../../modal/types";
import { ModalLayerContext } from "./ModalRuntime";

type ModalComponentProps = ModalBaseProps & {
  dismissOnBackdrop?: boolean;
};

const components = {
  dialog: Dialog as ComponentType<ModalComponentProps>,
  drawer: Drawer as ComponentType<ModalComponentProps>,
  sheet: BottomSheet as ComponentType<ModalComponentProps>
};

interface HarnessProps {
  children?: ModalBaseProps["children"];
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
  childOpenInitially = false,
  childTitle,
  rootTitle,
  rootKind
}: {
  childKind: keyof typeof components;
  childOpenInitially?: boolean;
  childTitle?: string;
  rootTitle?: string;
  rootKind: keyof typeof components;
}) {
  const [rootOpen, setRootOpen] = useState(true);
  const [childOpen, setChildOpen] = useState(childOpenInitially);
  const [childActions, setChildActions] = useState(0);
  const [rootActions, setRootActions] = useState(0);
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
        title={rootTitle ?? `${rootKind} root`}
      >
        <Button onClick={() => setChildOpen(true)} variant="secondary">
          Открыть child
        </Button>
        <Button
          onClick={() => setRootActions((value) => value + 1)}
          variant="secondary"
        >
          Действие root
        </Button>
        <Input label="Поле root" />
        <output aria-label="Действия root">{rootActions}</output>
        <Child
          closeLabel="Закрыть child"
          onOpenChange={setChildOpen}
          open={childOpen}
          title={childTitle ?? `${childKind} child`}
        >
          <Input label="Поле child" />
          <Button
            onClick={() => setChildActions((value) => value + 1)}
            variant="secondary"
          >
            Действие child
          </Button>
          <output aria-label="Действия child">{childActions}</output>
        </Child>
      </Root>
    </>
  );
}

function DrawerDrawerDialogHarness() {
  const [childOpen, setChildOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(true);
  return (
    <Drawer
      closeLabel="Закрыть Drawer A"
      onOpenChange={() => undefined}
      open
      title="Drawer A"
    >
      <Drawer
        closeLabel="Закрыть Drawer B"
        onOpenChange={setChildOpen}
        open={childOpen}
        title="Drawer B"
      >
        <Dialog
          closeLabel="Закрыть Dialog C"
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Dialog C"
        >
          Dialog не меняет существующую геометрию пары Drawer A → Drawer B.
        </Dialog>
      </Drawer>
    </Drawer>
  );
}

function ThreeDrawerHarness() {
  const [aOpen, setAOpen] = useState(true);
  const [bOpen, setBOpen] = useState(true);
  const [cOpen, setCOpen] = useState(true);
  return (
    <Drawer closeLabel="Закрыть A" onOpenChange={setAOpen} open={aOpen} title="Drawer A">
      <Drawer closeLabel="Закрыть B" onOpenChange={setBOpen} open={bOpen} title="Drawer B">
        <Drawer closeLabel="Закрыть C" onOpenChange={setCOpen} open={cOpen} title="Drawer C">
          Текущая contextual workspace
        </Drawer>
      </Drawer>
    </Drawer>
  );
}

async function assertDrawerPresentation({
  adjacent = true,
  fullscreen = false,
  workspaceActive = adjacent
}: {
  adjacent?: boolean;
  fullscreen?: boolean;
  workspaceActive?: boolean;
} = {}) {
  const drawers = Array.from(document.querySelectorAll<HTMLElement>(
    "[data-modal-kind='drawer']"
  ));
  const parent = drawers.find((drawer) => drawer.getAttribute(
    "data-drawer-presentation"
  ) === "adjacent-parent");
  const child = drawers.find((drawer) => drawer.getAttribute(
    "data-drawer-presentation"
  ) === "adjacent-child");
  if (!parent || !child) throw new Error("Missing nested Drawer pair");

  expect(getComputedStyle(parent).insetInlineEnd).toBe("0px");
  await waitFor(() => expect(getComputedStyle(child).insetInlineEnd)
    .toBe(adjacent ? "500px" : "0px"));
  if (!adjacent) {
    expect(getComputedStyle(child).inlineSize)
      .toBe(getComputedStyle(parent).inlineSize);
  }
  if (fullscreen) {
    expect(getComputedStyle(child).inlineSize).toBe(`${window.innerWidth}px`);
  }
  const guards = document.querySelectorAll<HTMLElement>("[data-modal-guard]");
  expect(guards).toHaveLength(1);
  const guard = guards[0];
  if (!guard) throw new Error("Missing modal guard");
  if (workspaceActive) {
    expect(guard).not.toHaveAttribute("data-dim");
    expect(Number(guard.style.zIndex)).toBeLessThan(Number(parent.style.zIndex));
    expect(parent).toHaveAttribute("aria-modal", "true");
    expect(child).not.toHaveAttribute("aria-modal");
    expect(getComputedStyle(parent).animationName).toBe("none");
    expect(getComputedStyle(child).animationName).toBe("none");
    expect(getComputedStyle(parent).borderRadius).toBe("0px");
    expect(getComputedStyle(child).borderRadius).toBe("0px");
    expect(getComputedStyle(parent).boxShadow).toBe("none");
    expect(getComputedStyle(child).boxShadow).toBe("none");
    expect(getComputedStyle(parent).opacity).toBe("1");
    expect(getComputedStyle(parent).filter).toBe("none");
  } else if (!adjacent) {
    expect(guard).not.toHaveAttribute("data-dim");
  }
  expect(document.documentElement).toHaveAttribute("data-ds-scroll-locked");
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

function SectionDividerHarness({ kind }: { kind: "dialog" | "drawer" }) {
  const [open, setOpen] = useState(true);
  const Component = components[kind];
  return (
    <Component
      closeLabel="Закрыть surface"
      footer={(
        <>
          <Button variant="secondary">Отменить</Button>
          <Button variant="primary">Сохранить</Button>
        </>
      )}
      headerActions={<Button variant="secondary">Дополнительно</Button>}
      onOpenChange={setOpen}
      open={open}
      title={kind === "drawer" ? "Новый заказ" : "Создание записи"}
    >
      <LongContent />
    </Component>
  );
}

async function assertSectionDividers(title: string) {
  const surface = within(document.body).getByRole("dialog", { name: title });
  const header = surface.querySelector("header");
  const body = surface.querySelector<HTMLElement>(
    "[data-modal-scroll-container]"
  );
  const footer = surface.querySelector("footer");
  if (!header || !body || !footer) {
    throw new Error("Missing modal surface sections");
  }
  const headerStyle = getComputedStyle(header);
  const footerStyle = getComputedStyle(footer);
  expect(headerStyle.borderBlockEndWidth).toBe("1px");
  expect(footerStyle.borderBlockStartWidth).toBe("1px");
  expect(headerStyle.borderBlockEndColor)
    .toBe(footerStyle.borderBlockStartColor);
  expect(getComputedStyle(body).paddingBlockStart).toBe("16px");
}

const nestedSheetSelectItems = [
  { label: "Основной склад", textValue: "Основной склад", value: "main" },
  { label: "Резервный склад", textValue: "Резервный склад", value: "reserve" },
  { label: "Транзитный склад", textValue: "Транзитный склад", value: "transit" }
] as const;

function BottomSheetWithSelectHarness() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<string | null>(null);
  return (
    <BottomSheet
      closeLabel="Закрыть оформление заказа"
      footer={<Button variant="primary">Продолжить</Button>}
      onOpenChange={setOpen}
      open={open}
      title="Оформление заказа"
    >
      <div className="grid gap-4">
        <Text as="p" variant="body">
          На компактном viewport Select открывается как вложенный BottomSheet.
        </Text>
        <Select
          block
          items={nestedSheetSelectItems}
          label="Склад отгрузки"
          locale="ru-RU"
          onChange={setValue}
          placeholder="Выберите склад"
          value={value}
        />
        <output aria-label="Выбранный склад">{value ?? "не выбран"}</output>
      </div>
    </BottomSheet>
  );
}

function AncestorHarness() {
  const [rootOpen, setRootOpen] = useState(true);
  const [childIdentity, setChildIdentity] = useState<"A" | "B">("A");
  const [events, setEvents] = useState<string[]>([]);

  return (
    <div className="grid gap-3">
      <Button onClick={() => setRootOpen(true)} variant="secondary">
        Повторно открыть root
      </Button>
      <Button onClick={() => setChildIdentity("B")} variant="secondary">
        Смонтировать sibling B
      </Button>
      <output data-ancestor-events="">{events.join(",")}</output>
      <Dialog
        closeLabel="Закрыть root"
        onOpenChange={(nextOpen, meta) => {
          setEvents((current) => [...current, `root:${meta.reason}`]);
          setRootOpen(nextOpen);
        }}
        open={rootOpen}
        title="Ancestor root"
      >
        <Drawer
          key={childIdentity}
          closeLabel="Закрыть child"
          headerActions={
            <Button onClick={() => setRootOpen(false)} variant="secondary">
              Закрыть ancestor
            </Button>
          }
          onOpenChange={(_nextOpen, meta) => {
            setEvents((current) => [
              ...current,
              `child-${childIdentity}:${meta.reason}`
            ]);
          }}
          open
          title={`Child ${childIdentity}`}
        >
          Invalidation A не должна мигрировать на remounted sibling B.
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

function FocusDiscoveryHarness({ invalidRef }: { invalidRef: boolean }) {
  const hiddenRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      closeLabel="Закрыть focus discovery"
      headerActions={
        <>
          <button hidden ref={hiddenRef}>Hidden control</button>
          <button className="hidden">Display none control</button>
          <button disabled>Disabled control</button>
          <div inert>
            <button>Inert control</button>
          </div>
          <button>Visible focus control</button>
        </>
      }
      {...(invalidRef ? { initialFocusRef: hiddenRef } : {})}
      onOpenChange={() => undefined}
      open
      title={invalidRef ? "Invalid explicit focus" : "Radix focus discovery"}
    >
      Focus fixture body
    </Dialog>
  );
}

function MissingOpenerHarness() {
  const [childOpen, setChildOpen] = useState(false);
  const [openerVisible, setOpenerVisible] = useState(true);
  return (
    <Drawer
      closeLabel="Закрыть fallback parent"
      onOpenChange={() => undefined}
      open
      title="Fallback parent"
    >
      {openerVisible ? (
        <Button onClick={() => setChildOpen(true)} variant="secondary">
          Открыть fallback child
        </Button>
      ) : null}
      <Dialog
        closeLabel="Закрыть fallback child"
        headerActions={
          <Button
            onClick={() => setOpenerVisible(false)}
            variant="secondary"
          >
            Удалить opener
          </Button>
        }
        onOpenChange={setChildOpen}
        open={childOpen}
        title="Fallback child"
      >
        После удаления opener фокус должен вернуться на surface родителя.
      </Dialog>
    </Drawer>
  );
}

function VisualCalibrationHarness({
  destructive = false,
  kind,
  title
}: {
  destructive?: boolean;
  kind: keyof typeof components;
  title: string;
}) {
  const [open, setOpen] = useState(true);
  const Component = components[kind];
  const description = destructive
    ? "Действие нельзя будет отменить"
    : "Заполните поля — данные сохранятся в справочник";

  return (
    <div className="min-h-screen">
      <Button onClick={() => setOpen(true)} variant="secondary">
        Открыть пример
      </Button>
      <Component
        closeLabel="Закрыть"
        description={description}
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="secondary">
              Отменить
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant={destructive ? "danger" : "primary"}
            >
              {destructive ? "Удалить" : "Сохранить"}
            </Button>
          </>
        }
        onOpenChange={setOpen}
        open={open}
        title={title}
      >
        {destructive ? (
          <Text as="p" tone="danger" variant="body">
            Единица измерения «Упаковка» будет удалена из справочника.
          </Text>
        ) : (
          <div className="grid gap-4">
            <Input label="Наименование" />
            <Input label="Краткое обозначение" />
          </div>
        )}
      </Component>
    </div>
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

export const DrawerSectionDividers: Story = {
  args: {} as DialogProps,
  render: () => <SectionDividerHarness kind="drawer" />,
  play: async () => assertSectionDividers("Новый заказ")
};

export const DialogSectionDividers: Story = {
  args: {} as DialogProps,
  render: () => <SectionDividerHarness kind="dialog" />,
  play: async () => assertSectionDividers("Создание записи")
};

export const DrawerNested: Story = {
  args: {} as DialogProps,
  render: () => (
    <NestedHarness childKind="dialog" childOpenInitially rootKind="drawer" />
  ),
  play: async () => {
    expect(document.querySelector("[data-drawer-presentation]"))
      .toBeNull();
  }
};

export const DrawerAdjacentNested: Story = {
  args: {} as DialogProps,
  render: () => (
    <NestedHarness
      childKind="drawer"
      childOpenInitially
      childTitle="Клиент Иван Петров"
      rootKind="drawer"
      rootTitle="Заказ №123"
    />
  ),
  globals: { viewport: { isRotated: false, value: "desktop" } },
  play: async () => {
    await assertDrawerPresentation();
    const parent = document.querySelector<HTMLElement>(
      "[data-drawer-presentation='adjacent-parent']"
    );
    const child = document.querySelector<HTMLElement>(
      "[data-drawer-presentation='adjacent-child']"
    );
    if (!parent || !child) throw new Error("Missing cooperative Drawer pair");
    const parentAction = within(parent).getByRole("button", {
      name: "Действие root"
    });
    await userEvent.click(parentAction);
    expect(within(parent).getByRole("status", {
      name: "Действия root"
    })).toHaveTextContent("1");
    const parentInput = within(parent).getByRole("textbox", {
      name: "Поле root"
    });
    await userEvent.click(parentInput);
    expect(parentInput).toHaveFocus();
    const childAction = within(child).getByRole("button", {
      name: "Действие child"
    });
    await userEvent.click(childAction);
    expect(within(child).getByRole("status", {
      name: "Действия child"
    })).toHaveTextContent("1");
    const childInput = within(child).getByRole("textbox", {
      name: "Поле child"
    });
    await userEvent.click(childInput);
    expect(childInput).toHaveFocus();
    await userEvent.click(within(child).getByRole("button", {
      name: "Закрыть child"
    }));
    await waitFor(() => expect(document.querySelector(
      "[data-drawer-presentation='adjacent-child']"
    )).toBeNull());
    expect(parent).not.toHaveAttribute("data-drawer-presentation");
    expect(parent).toHaveAttribute("data-drawer-workspace-motion", "none");
    expect(getComputedStyle(parent).animationName).toBe("none");
    expect(getComputedStyle(parent).transform).toBe("none");
    await userEvent.click(within(parent).getByRole("button", {
      name: "Открыть child"
    }));
    await waitFor(() => expect(document.querySelector(
      "[data-drawer-presentation='adjacent-child']"
    )).not.toBeNull());
    await assertDrawerPresentation();
  }
};

export const DrawerAdjacentThreshold: Story = {
  args: {} as DialogProps,
  render: () => (
    <NestedHarness
      childKind="drawer"
      childOpenInitially
      childTitle="Клиент Иван Петров"
      rootKind="drawer"
      rootTitle="Заказ №123"
    />
  ),
  globals: { viewport: { isRotated: false, value: "tablet" } },
  play: async () => assertDrawerPresentation({ adjacent: false })
};

export const DrawerAdjacentMobile: Story = {
  args: {} as DialogProps,
  render: () => (
    <NestedHarness childKind="drawer" childOpenInitially rootKind="drawer" />
  ),
  globals: { viewport: { isRotated: false, value: "mobile" } },
  play: async () => assertDrawerPresentation({
    adjacent: false,
    fullscreen: true
  })
};

export const DrawerAdjacentRtl: Story = {
  args: {} as DialogProps,
  render: () => (
    <DesignSystemProvider dir="rtl">
      <NestedHarness childKind="drawer" childOpenInitially rootKind="drawer" />
    </DesignSystemProvider>
  ),
  globals: { viewport: { isRotated: false, value: "desktop" } },
  play: async () => {
    await assertDrawerPresentation();
    const parent = document.querySelector<HTMLElement>(
      "[data-drawer-presentation='adjacent-parent']"
    );
    const child = document.querySelector<HTMLElement>(
      "[data-drawer-presentation='adjacent-child']"
    );
    if (!parent || !child) throw new Error("Missing RTL Drawer stack");
    expect(Math.round(
      child.getBoundingClientRect().left - parent.getBoundingClientRect().left
    )).toBe(500);
  }
};

export const DrawerAdjacentWithDialog: Story = {
  args: {} as DialogProps,
  render: () => <DrawerDrawerDialogHarness />,
  globals: { viewport: { isRotated: false, value: "desktop" } },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await assertDrawerPresentation({ workspaceActive: false });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog", {
      name: "Dialog C"
    })).toBeNull());
    await assertDrawerPresentation();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog", {
      name: "Drawer B"
    })).toBeNull());
    expect(document.querySelector("[data-drawer-presentation]"))
      .toBeNull();
    expect(page.getByRole("dialog", { name: "Drawer A" })).toBeVisible();
  }
};

export const DrawerAdjacentThreeLevels: Story = {
  args: {} as DialogProps,
  render: () => <ThreeDrawerHarness />,
  globals: { viewport: { isRotated: false, value: "desktop" } },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await assertDrawerPresentation();
    expect(document.querySelector(
      "[data-drawer-presentation='adjacent-parent']"
    )).toHaveTextContent("Drawer B");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog", {
      name: "Drawer C"
    })).toBeNull());
    await assertDrawerPresentation();
    expect(document.querySelector(
      "[data-drawer-presentation='adjacent-parent']"
    )).toHaveTextContent("Drawer A");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog", {
      name: "Drawer B"
    })).toBeNull());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  }
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

export const BottomSheetWithNestedSelectSheet: Story = {
  args: {} as DialogProps,
  render: () => <BottomSheetWithSelectHarness />,
  globals: {
    viewport: { isRotated: false, value: "mobile" }
  },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const parent = await page.findByRole("dialog", { name: "Оформление заказа" });
    await userEvent.click(page.getByRole("button", { name: /Склад отгрузки/ }));
    const nested = await page.findByRole("dialog", { name: "Выбор" });
    expect(parent).toBeVisible();
    expect(nested).toBeVisible();
    expect(canvasElement.ownerDocument.querySelectorAll(
      "[data-modal-kind='bottom-sheet']"
    )).toHaveLength(2);

    await userEvent.click(page.getByRole("option", { name: "Резервный склад" }));
    await waitFor(() => expect(page.queryByRole("dialog", { name: "Выбор" }))
      .not.toBeInTheDocument());
    expect(parent).toBeVisible();
    expect(page.getByRole("status", { name: "Выбранный склад" }))
      .toHaveTextContent("reserve");
  }
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

export const DialogDesignerReference: Story = {
  args: {} as DialogProps,
  render: () => (
    <VisualCalibrationHarness
      kind="dialog"
      title="Создание единицы измерения"
    />
  )
};

export const DialogDestructiveReference: Story = {
  args: {} as DialogProps,
  render: () => (
    <VisualCalibrationHarness
      destructive
      kind="dialog"
      title="Удалить единицу измерения?"
    />
  )
};

export const DrawerDesignerReference: Story = {
  args: {} as DialogProps,
  render: () => (
    <VisualCalibrationHarness
      kind="drawer"
      title="Редактирование единицы измерения"
    />
  )
};

export const BottomSheetDesignerReference: Story = {
  args: {} as DialogProps,
  render: () => (
    <VisualCalibrationHarness
      kind="sheet"
      title="Фильтр товаров"
    />
  ),
  parameters: { viewport: { defaultViewport: "mobile" } }
};

export const StackStress: Story = {
  args: {} as DialogProps,
  render: () => (
    <NestedHarness childKind="sheet" childOpenInitially rootKind="drawer" />
  ),
  play: async () => {
    expect(document.querySelector("[data-drawer-presentation]"))
      .toBeNull();
  }
};

export const RadixNestedFocus: Story = {
  args: {} as DialogProps,
  render: () => <FocusHarness />
};

export const RadixDefaultFocusDiscovery: Story = {
  args: {} as DialogProps,
  render: () => <FocusDiscoveryHarness invalidRef={false} />
};

export const InvalidInitialFocusRef: Story = {
  args: {} as DialogProps,
  render: () => <FocusDiscoveryHarness invalidRef />
};

export const MissingOpenerFallback: Story = {
  args: {} as DialogProps,
  render: () => <MissingOpenerHarness />
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
