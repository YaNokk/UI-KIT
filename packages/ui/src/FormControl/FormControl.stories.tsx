import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormControl } from "./FormControl";

const meta = {
  title: "Components/FormControl",
  component: FormControl,
  tags: ["autodocs"],
  parameters: { layout: "centered" }
} satisfies Meta<typeof FormControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderControl = (args: React.ComponentProps<typeof FormControl>) => (
  <div className="w-80 max-w-full">
    <FormControl {...args}>
      {(props) => (
        <input
          {...props}
          className="box-border h-10 w-full rounded-lg border border-border-default bg-control-background px-3 text-text-primary"
        />
      )}
    </FormControl>
  </div>
);

export const Default: Story = {
  args: { children: () => null, label: "Название" },
  render: renderControl
};

export const Required: Story = {
  args: { children: () => null, label: "Email", required: true },
  render: renderControl
};

export const Description: Story = {
  args: {
    children: () => null,
    description: "Используется для уведомлений",
    label: "Email"
  },
  render: renderControl
};

export const Error: Story = {
  args: {
    children: () => null,
    error: "Введите корректный адрес",
    label: "Email"
  },
  render: renderControl
};

export const DescriptionAndError: Story = {
  args: {
    children: () => null,
    description: "Рабочий адрес",
    error: "Адрес уже используется",
    label: "Email"
  },
  render: renderControl
};

export const DisabledComposition: Story = {
  args: { children: () => null, disabled: true, label: "Недоступное поле" },
  render: renderControl
};

export const LongContent: Story = {
  args: {
    children: () => null,
    description: "Длинное пояснение переносится и сохраняет связь с полем при любой ширине контейнера.",
    error: "Длинное сообщение об ошибке не должно нарушать геометрию формы.",
    label: "Очень длинная подпись поля для проверки переноса"
  },
  render: renderControl
};
