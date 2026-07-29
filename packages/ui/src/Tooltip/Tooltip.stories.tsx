import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info } from "lucide-react";
import { Button } from "../Button/Button";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { Dialog } from "../Dialog/Dialog";
import { IconButton } from "../IconButton/IconButton";
import { Tooltip, type TooltipPlacement } from "./Tooltip";

const placements: TooltipPlacement[] = ["top", "right", "bottom", "left"];

function DialogTooltip() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      closeLabel="Закрыть Dialog"
      onOpenChange={setOpen}
      open={open}
      title="Dialog with Tooltip"
    >
      <Tooltip content="Подсказка остаётся в floating range Dialog">
        <Button variant="secondary">Навести или сфокусировать</Button>
      </Tooltip>
    </Dialog>
  );
}

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"]
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Button variant="secondary">Навести</Button>,
    content: "Короткая информационная подсказка"
  }
};

export const Placements: Story = {
  args: {} as never,
  render: () => (
    <div className="grid grid-cols-2 gap-16 p-16">
      {placements.map((placement) => (
        <Tooltip
          content={`Расположение: ${placement}`}
          key={placement}
          placement={placement}
        >
          <Button variant="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  )
};

export const IconButtonStory: Story = {
  args: {} as never,
  name: "IconButton",
  render: () => (
    <Tooltip content="Дополнительная информация">
      <IconButton aria-label="Информация" icon={<Info />} />
    </Tooltip>
  )
};

export const KeyboardFocus: Story = {
  args: {} as never,
  render: () => (
    <Tooltip content="Открывается при keyboard focus">
      <Button variant="secondary">Перейдите сюда клавишей Tab</Button>
    </Tooltip>
  )
};

export const LongText: Story = {
  args: {} as never,
  render: () => (
    <Tooltip content="Длинная подсказка переносится внутри доступной области экрана и сохраняет компактную типографику.">
      <Button variant="secondary">Длинный текст</Button>
    </Tooltip>
  )
};

export const InsideDialog: Story = {
  args: {} as never,
  render: () => <DialogTooltip />
};

export const Dark: Story = {
  args: {} as never,
  render: () => (
    <DesignSystemProvider mode="dark">
      <div className="p-16">
        <Tooltip content="Inverse surface в dark theme">
          <Button variant="secondary">Dark Tooltip</Button>
        </Tooltip>
      </div>
    </DesignSystemProvider>
  )
};

export const DesignerReference: Story = {
  args: {} as never,
  render: () => (
    <Tooltip content="Цена продажи за выбранную единицу измерения">
      <IconButton aria-label="О цене" icon={<Info />} />
    </Tooltip>
  )
};

export const MobileBottomSheet: Story = {
  args: {} as never,
  render: () => (
    <Tooltip content="На компактном viewport эта подсказка открывается в BottomSheet.">
      <Button variant="secondary">Открыть подсказку</Button>
    </Tooltip>
  ),
  parameters: { viewport: { defaultViewport: "mobile" } }
};

export const ResponsiveBoundary: Story = {
  args: {} as never,
  render: () => (
    <Tooltip content="Открытая presentation закрывается при переходе через md и не мигрирует.">
      <Button variant="secondary">Проверить границу 767/768/769</Button>
    </Tooltip>
  )
};

export const NestedMobileInsideDialog: Story = {
  args: {} as never,
  render: () => <DialogTooltip />,
  parameters: { viewport: { defaultViewport: "mobile" } }
};
