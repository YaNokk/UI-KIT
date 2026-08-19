import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Copy, Download, Pencil, Printer, Share2, Trash2 } from "lucide-react";
import { Button } from "../Button/Button";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Drawer } from "../Drawer/Drawer";
import { IconButton } from "../IconButton/IconButton";
import { ActionMenu } from "./ActionMenu";
import type { ActionMenuAction } from "./types";

const neutralActions: readonly ActionMenuAction[] = [
  { id: "print", label: "Печать", icon: <Printer />, onSelect: () => undefined },
  { id: "copy", label: "Копировать", icon: <Copy />, onSelect: () => undefined },
  { id: "share", label: "Поделиться", icon: <Share2 />, onSelect: () => undefined }
];

const dangerAction: ActionMenuAction = {
  id: "delete",
  label: "Удалить",
  icon: <Trash2 />,
  tone: "danger",
  confirmation: {
    title: "Удалить запись?",
    description: "Это действие нельзя отменить.",
    confirmLabel: "Удалить",
    cancelLabel: "Отмена"
  },
  onSelect: () => undefined
};

function Menu({
  actions = neutralActions,
  label = "Действия"
}: {
  actions?: readonly ActionMenuAction[];
  label?: string;
}) {
  return (
    <ActionMenu
      actions={actions}
      trigger={<Button variant="secondary">{label}</Button>}
    />
  );
}

const meta = {
  component: ActionMenu,
  title: "Components/ActionMenu",
  tags: ["autodocs"],
  parameters: { layout: "centered" }
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions: neutralActions,
    trigger: <Button variant="secondary">Действия</Button>
  },
  play: async () => {
    const page = within(document.body);
    const trigger = page.getByRole("button", { name: "Действия" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(trigger);
    expect(await page.findByRole("menu")).toBeVisible();
    await waitFor(() => expect(page.getByRole("menuitem", { name: "Печать" })).toHaveFocus());
    await userEvent.keyboard("{End}");
    expect(page.getByRole("menuitem", { name: "Поделиться" })).toHaveFocus();
  }
};

export const WithIcons: Story = {
  args: { actions: neutralActions, trigger: <Button variant="secondary">С иконками</Button> }
};

export const Danger: Story = {
  args: { actions: [dangerAction], trigger: <Button variant="secondary">Опасное действие</Button> }
};

export const Disabled: Story = {
  args: {
    actions: [
      { id: "edit", label: "Редактировать", icon: <Pencil />, disabled: true, onSelect: () => undefined },
      { id: "download", label: "Скачать", icon: <Download />, onSelect: () => undefined }
    ],
    trigger: <Button variant="secondary">С disabled item</Button>
  }
};

function AsyncHarness() {
  const [done, setDone] = useState(false);
  return (
    <div>
      <Menu actions={[{
        id: "download",
        label: "Скачать отчёт",
        icon: <Download />,
        onSelect: async () => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          setDone(true);
        }
      }]} label="Async действие" />
      {done ? <p>Готово</p> : null}
    </div>
  );
}

export const Async: Story = { args: Default.args, render: () => <AsyncHarness /> };

export const InlineConfirm: Story = {
  args: { actions: [dangerAction], trigger: <Button variant="secondary">Удаление</Button> },
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Удаление" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Удалить" }));
    expect(page.getByRole("alertdialog")).toBeVisible();
    expect(document.querySelectorAll("[data-action-menu-surface]")).toHaveLength(1);
  }
};

export const ManyActions: Story = {
  args: {
    actions: Array.from({ length: 24 }, (_, index) => ({
      id: `action-${index}`,
      label: `Действие ${index + 1}`,
      onSelect: () => undefined
    })),
    trigger: <Button variant="secondary">24 действия</Button>
  }
};

export const LongLabels: Story = {
  args: {
    actions: [{
      id: "long",
      label: "Скопировать подробную информацию о выбранном заказе в буфер обмена",
      onSelect: () => undefined
    }],
    trigger: <Button variant="secondary">Длинная локализация</Button>
  }
};

function DrawerHarness() {
  return (
    <Drawer closeLabel="Закрыть Drawer" onOpenChange={() => undefined} open title="Заказ №123">
      <Menu label="Действия в Drawer" />
    </Drawer>
  );
}

export const InsideDrawer: Story = {
  args: Default.args,
  parameters: { layout: "fullscreen" },
  render: () => <DrawerHarness />
};

function AdjacentHarness() {
  return (
    <Drawer
      closeLabel="Закрыть parent"
      headerActions={<Menu label="Действия parent" />}
      onOpenChange={() => undefined}
      open
      title="Родительский Drawer"
    >
      <Drawer closeLabel="Закрыть child" onOpenChange={() => undefined} open title="Дочерний Drawer">
        <Menu label="Действия child" />
      </Drawer>
    </Drawer>
  );
}

export const InsideAdjacentDrawerParent: Story = {
  args: Default.args,
  globals: { viewport: { isRotated: false, value: "desktop" } },
  parameters: { layout: "fullscreen" },
  render: () => <AdjacentHarness />,
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Действия parent" }));
    expect(await page.findByRole("menu")).toBeVisible();
  }
};

export const InsideAdjacentDrawerChild: Story = {
  args: Default.args,
  globals: { viewport: { isRotated: false, value: "desktop" } },
  parameters: { layout: "fullscreen" },
  render: () => <AdjacentHarness />,
  play: async () => {
    const page = within(document.body);
    await userEvent.click(page.getByRole("button", { name: "Действия child" }));
    expect(await page.findByRole("menu")).toBeVisible();
  }
};

export const CompactBottomSheet: Story = {
  args: Default.args,
  globals: { viewport: { isRotated: false, value: "mobile" } },
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="p-4"><Menu actions={[...neutralActions, dangerAction]} /></div>
  ),
  play: async () => {
    const page = within(document.body);
    const trigger = page.getByRole("button", { name: "Действия" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(trigger);
    expect(await page.findByRole("dialog", { name: "Действия" })).toBeVisible();
    expect(page.getAllByRole("menuitem")).toHaveLength(4);
    expect(document.querySelector("[data-action-menu-surface]")).toBeNull();
    await userEvent.click(page.getByRole("menuitem", { name: "Удалить" }));
    expect(page.getAllByRole("dialog")).toHaveLength(1);
    expect(page.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(page.getByRole("region", { name: "Удалить запись?" })).toBeVisible();
  }
};

export const RTL: Story = {
  args: {
    actions: neutralActions,
    trigger: <IconButton aria-label="الإجراءات" icon={<Share2 />} />
  },
  decorators: [(Story) => <div dir="rtl"><Story /></div>]
};

export const Dark: Story = {
  args: Default.args,
  globals: { theme: "dark" }
};

export const KazakhLocale: Story = {
  args: Default.args,
  globals: { viewport: { isRotated: false, value: "mobile" } },
  render: () => (
    <DesignSystemProvider locale="kk-KZ" mode="light">
      <Menu actions={[{ id: "copy", label: "Көшіру", onSelect: () => undefined }]} label="Ашу" />
    </DesignSystemProvider>
  )
};
