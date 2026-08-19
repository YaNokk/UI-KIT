import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Archive, ChevronLeft, ChevronRight, Copy, Printer, Trash2 } from "lucide-react";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { Input } from "../Input/Input";
import { ModalFooterActions } from "../ModalFooter/ModalFooterActions";
import {
  ModalHeaderActions
} from "../ModalHeader/ModalHeaderActions";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";
import { Drawer, type DrawerSize } from "./Drawer";

const meta = {
  title: "Foundations/Modal/Drawer Chrome",
  tags: ["autodocs"]
} satisfies Meta;

export default meta;
type Story = StoryObj;

function Footer() {
  return (
    <ModalFooterActions
      primary={<Button variant="primary">Сохранить</Button>}
      secondary={<Button variant="secondary">Отменить</Button>}
    />
  );
}

function OpenDrawer({
  children,
  footer,
  size = "md",
  title = "Карточка заказа",
  ...props
}: Partial<React.ComponentProps<typeof Drawer>> & {
  size?: DrawerSize;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Drawer
      closeLabel="Закрыть"
      footer={footer}
      onOpenChange={setOpen}
      open={open}
      size={size}
      title={title}
      {...props}
    >
      {children ?? <Input label="Наименование" />}
    </Drawer>
  );
}

function SizedPair({ parentSize, childSize }: {
  childSize: DrawerSize;
  parentSize: DrawerSize;
}) {
  return (
    <Drawer
      closeLabel="Закрыть родительский Drawer"
      onOpenChange={() => undefined}
      open
      size={parentSize}
      title={`Parent ${parentSize}`}
    >
      <Drawer
        closeLabel="Закрыть дочерний Drawer"
        onOpenChange={() => undefined}
        open
        size={childSize}
        title={`Child ${childSize}`}
      >
        <Input label="Поле дочернего Drawer" />
      </Drawer>
    </Drawer>
  );
}

const actions = [
  { id: "print", label: "Печать", icon: <Printer />, onSelect: () => undefined },
  { id: "copy", label: "Копировать", icon: <Copy />, onSelect: () => undefined },
  { id: "archive", label: "Архивировать", icon: <Archive />, onSelect: () => undefined },
  {
    id: "delete",
    label: "Удалить",
    icon: <Trash2 />,
    tone: "danger" as const,
    confirmation: {
      title: "Удалить заказ?",
      description: "Действие нельзя отменить.",
      confirmLabel: "Удалить",
      cancelLabel: "Отмена"
    },
    onSelect: () => undefined
  }
] as const;

function HeaderActions() {
  return (
    <ModalHeaderActions
      actions={actions}
      closeLabel="Закрыть действия"
      label="Ещё действия"
      title="Действия"
    />
  );
}

function ConsumerHeaderLeading() {
  return (
    <>
      <IconButton aria-label="Назад" icon={<ChevronLeft />} size="sm" variant="ghost" />
      <IconButton disabled aria-label="Вперёд" icon={<ChevronRight />} size="sm" variant="ghost" />
    </>
  );
}

async function expectDrawerWidth(title: string, width: number) {
  const surface = await within(document.body).findByRole("dialog", { name: title });
  await waitFor(() => expect(surface.getBoundingClientRect().width).toBeCloseTo(width, 0));
}

async function expectSizedPair(parentSize: DrawerSize, childSize: DrawerSize) {
  const parentWidth = parentSize === "lg" ? 600 : 500;
  const childWidth = childSize === "lg" ? 600 : 500;
  await waitFor(() => {
    expect(document.querySelector(
      "[data-drawer-presentation='adjacent-parent']"
    )).not.toBeNull();
    expect(document.querySelector(
      "[data-drawer-presentation='adjacent-child']"
    )).not.toBeNull();
  });
  const parent = document.querySelector<HTMLElement>(
    "[data-drawer-presentation='adjacent-parent']"
  );
  const child = document.querySelector<HTMLElement>(
    "[data-drawer-presentation='adjacent-child']"
  );
  if (!parent || !child) throw new Error("Missing adjacent Drawer pair");
  await waitFor(() => expect(getComputedStyle(child).insetInlineEnd)
    .toBe(`${parentWidth}px`));
  expect(parent.getBoundingClientRect().width).toBeCloseTo(parentWidth, 0);
  expect(child.getBoundingClientRect().width).toBeCloseTo(childWidth, 0);
  await waitFor(() => {
    expect(parent).not.toHaveAttribute("aria-modal");
    expect(child).not.toHaveAttribute("aria-modal");
    expect(parent.closest("[data-modal-portal]")).not.toHaveAttribute("aria-hidden");
    expect(child.closest("[data-modal-portal]")).not.toHaveAttribute("aria-hidden");
  });
}

export const DrawerShortBodyWithFooter: Story = {
  render: () => <OpenDrawer footer={<Footer />} />,
  play: async () => {
    const surface = await within(document.body).findByRole("dialog", { name: "Карточка заказа" });
    const body = surface.querySelector<HTMLElement>("[data-modal-scroll-container]");
    const footer = surface.querySelector<HTMLElement>("footer");
    if (!body || !footer) throw new Error("Missing Drawer regions");
    expect(getComputedStyle(body).flex).toBe("1 1 auto");
    expect(footer.getBoundingClientRect().bottom)
      .toBeCloseTo(surface.getBoundingClientRect().bottom, 0);
  }
};

export const DrawerLongBodyWithFooter: Story = {
  render: () => (
    <OpenDrawer footer={<Footer />}>
      <div className="grid gap-3">
        {Array.from({ length: 30 }, (_, index) => (
          <Input key={index} label={`Поле ${index + 1}`} />
        ))}
      </div>
    </OpenDrawer>
  ),
  play: async () => {
    const surface = await within(document.body).findByRole("dialog", { name: "Карточка заказа" });
    const body = surface.querySelector<HTMLElement>("[data-modal-scroll-container]");
    const footer = surface.querySelector<HTMLElement>("footer");
    if (!body || !footer) throw new Error("Missing Drawer regions");
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    const footerTop = footer.getBoundingClientRect().top;
    body.scrollTop = body.scrollHeight;
    expect(footer.getBoundingClientRect().top).toBeCloseTo(footerTop, 0);
  }
};

export const DrawerMd: Story = {
  render: () => <OpenDrawer size="md" title="Drawer 500 px" />,
  play: async () => expectDrawerWidth("Drawer 500 px", 500)
};

export const DrawerLg: Story = {
  render: () => <OpenDrawer size="lg" title="Drawer 600 px" />,
  play: async () => expectDrawerWidth("Drawer 600 px", 600)
};

export const DrawerMdToLg: Story = {
  globals: { viewport: { isRotated: false, value: "desktop" } },
  render: () => <SizedPair childSize="lg" parentSize="md" />,
  play: async () => expectSizedPair("md", "lg")
};

export const DrawerLgToMd: Story = {
  globals: { viewport: { isRotated: false, value: "desktop" } },
  render: () => <SizedPair childSize="md" parentSize="lg" />,
  play: async () => expectSizedPair("lg", "md")
};

export const DrawerLgToLg: Story = {
  globals: { viewport: { isRotated: false, value: "desktop" } },
  render: () => <SizedPair childSize="lg" parentSize="lg" />,
  play: async () => expectSizedPair("lg", "lg")
};

export const DrawerHeaderLeadingControls: Story = {
  render: () => (
    <OpenDrawer
      headerLeading={<ConsumerHeaderLeading />}
    />
  )
};

export const DrawerHeaderOverflowActions: Story = {
  render: () => <OpenDrawer headerActions={<HeaderActions />} />
};

export const DrawerHeaderLongTitle: Story = {
  render: () => (
    <OpenDrawer
      description="Описание остаётся в центральной heading-области"
      headerActions={<HeaderActions />}
      headerLeading={<ConsumerHeaderLeading />}
      title="Очень длинное название карточки заказа, которое переносится на несколько строк без перекрытия действий"
    />
  )
};

export const DrawerFooterActions: Story = {
  render: () => <OpenDrawer footer={<Footer />} />
};

export const DrawerSupplementalActions: Story = {
  render: () => (
    <OpenDrawer
      footer={(
        <ModalFooterActions
          leading={<Text as="p" variant="bodyStrong">Итого: 12 400 ₽</Text>}
          primary={<Button variant="primary">Провести</Button>}
          secondary={<Button variant="secondary">Отменить</Button>}
        />
      )}
    />
  )
};

export const DrawerActionInlineConfirm: Story = {
  render: () => <OpenDrawer headerActions={<HeaderActions />} />,
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Ещё действия" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Удалить" }));
    await expect(page.findByText("Удалить заказ?")).resolves.toBeVisible();
  }
};

function ComplexDialogHarness() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <OpenDrawer
      footer={(
        <ModalFooterActions
          primary={<Button onClick={() => setDialogOpen(true)} variant="danger">Удалить с проверкой</Button>}
        />
      )}
    >
      <Input label="Заказ" />
      <Dialog
        closeLabel="Закрыть подтверждение"
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Подтвердите номер заказа"
      >
        <Input label="Номер заказа" />
      </Dialog>
    </OpenDrawer>
  );
}

export const DrawerActionComplexDialogExample: Story = {
  render: () => <ComplexDialogHarness />
};

export const DrawerCompactActionSheet: Story = {
  globals: { viewport: { isRotated: false, value: "mobile" } },
  render: () => <OpenDrawer headerActions={<HeaderActions />} />,
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Ещё действия" }));
    await expect(page.findByRole("dialog", { name: "Действия" })).resolves.toBeVisible();
  }
};

export const DrawerRTL: Story = {
  decorators: [(Story) => <div dir="rtl"><Story /></div>],
  render: () => (
    <OpenDrawer
      headerActions={<HeaderActions />}
      headerLeading={<ConsumerHeaderLeading />}
      size="lg"
    />
  )
};

export const DrawerDarkMode: Story = {
  globals: { theme: "dark" },
  render: () => <OpenDrawer footer={<Footer />} headerActions={<HeaderActions />} size="lg" />
};

export const DrawerHorizontalOverflowContract: Story = {
  render: () => (
    <OpenDrawer footer={<Footer />} size="lg">
      <div className="grid min-w-0 gap-4">
        <Input label="Адаптивное поле" />
        <div className="ds-scrollbar min-w-0 overflow-x-auto">
          <table className="whitespace-nowrap"><tbody><tr>
            {Array.from({ length: 8 }, (_, index) => (
              <td className="px-6" key={index}>Широкая колонка {index + 1}</td>
            ))}
          </tr></tbody></table>
        </div>
      </div>
    </OpenDrawer>
  ),
  play: async () => {
    const surface = await within(document.body).findByRole("dialog", { name: "Карточка заказа" });
    const body = surface.querySelector<HTMLElement>("[data-modal-scroll-container]");
    const localScroller = surface.querySelector<HTMLElement>(".overflow-x-auto");
    if (!body || !localScroller) throw new Error("Missing overflow regions");
    expect(getComputedStyle(body).minInlineSize).toBe("0px");
    expect(localScroller.scrollWidth).toBeGreaterThan(localScroller.clientWidth);
  }
};
