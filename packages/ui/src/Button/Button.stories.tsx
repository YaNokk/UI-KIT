import {
  useEffect,
  useRef,
  useState,
  type MouseEventHandler
} from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expect,
  fn,
  userEvent,
  waitFor,
  within
} from "storybook/test";
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./Button";

function StarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function LoadingExample({
  onClick
}: Pick<ButtonProps, "onClick">) {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    []
  );

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    setLoading(true);
    timerRef.current = window.setTimeout(() => setLoading(false), 160);
  };

  return (
    <Button
      loading={loading}
      onClick={handleClick}
      startIcon={<StarIcon />}
      variant="primary"
    >
      Сохранить изменения
    </Button>
  );
}

const submitHandler = fn();

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Действие",
    size: "md",
    variant: "secondary"
  },
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "select",
      options: ["primary", "secondary", "soft", "danger"]
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"]
    }
  },
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants: ButtonVariant[] = ["primary", "secondary", "soft", "danger"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

export const Variants: Story = {
  args: {
    onClick: fn()
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button {...args} key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "primary" }));
    expect(args.onClick).toHaveBeenCalledTimes(1);
  }
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Button {...args} key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  )
};

export const WithStartIcon: Story = {
  args: {
    children: "Добавить",
    startIcon: <StarIcon />
  }
};

export const WithEndIcon: Story = {
  args: {
    children: "Продолжить",
    endIcon: <StarIcon />
  }
};

export const WithBothIcons: Story = {
  args: {
    children: "Переместить",
    endIcon: <StarIcon />,
    startIcon: <StarIcon />
  }
};

export const Loading: Story = {
  args: {
    onClick: fn()
  },
  render: (args) => <LoadingExample onClick={args.onClick} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Сохранить изменения" });
    const widthBefore = button.getBoundingClientRect().width;

    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute("aria-busy", "true"));

    button.click();
    expect(args.onClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveFocus();
    expect(button.getBoundingClientRect().width).toBeCloseTo(widthBefore, 1);

    await waitFor(() => expect(button).not.toHaveAttribute("aria-busy"), {
      timeout: 1000
    });
    expect(button).toHaveFocus();
    expect(button.getBoundingClientRect().width).toBeCloseTo(widthBefore, 1);
  }
};

export const Disabled: Story = {
  args: {
    children: "Недоступно",
    disabled: true,
    onClick: fn()
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Недоступно" }));
    expect(args.onClick).not.toHaveBeenCalled();
  }
};

export const LongLabel: Story = {
  args: {
    children: "Создать новый заказ и перейти к заполнению контактных данных"
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    )
  ]
};

export const FullWidth: Story = {
  args: {
    children: "Продолжить",
    fullWidth: true,
    variant: "primary"
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    )
  ]
};

export const Submit: Story = {
  args: {
    children: "Отправить",
    type: "submit",
    variant: "primary"
  },
  render: (args) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitHandler();
      }}
    >
      <Button {...args} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    submitHandler.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Отправить" }));
    expect(submitHandler).toHaveBeenCalledTimes(1);
  }
};

export const NarrowContainer: Story = {
  args: {
    children: "Подтвердить создание заказа для выбранного филиала",
    fullWidth: true,
    variant: "primary"
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    )
  ],
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
};
