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
import { Star } from "lucide-react";
import { ButtonLink } from "../ButtonLink/ButtonLink";
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./Button";

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
      startIcon={<Star />}
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
const typographyLabels = [
  "ABC",
  "Купить",
  "Продолжить",
  "gypqj",
  "ЁЙЦЩ",
  "123 456",
  "1 234,56"
];

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

export const TypographyAlignment: Story = {
  render: () => (
    <div className="grid gap-6">
      {sizes.map((size) => (
        <section className="grid gap-3" key={size}>
          <h2 className="typo-heading-sm">{size}</h2>

          <div className="flex flex-wrap items-center gap-3">
            {typographyLabels.map((label) => (
              <Button key={label} size={size} variant="secondary">
                {label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size={size} variant="primary">Текст</Button>
            <Button size={size} startIcon={<Star />} variant="primary">
              Начало
            </Button>
            <Button endIcon={<Star />} size={size} variant="primary">
              Конец
            </Button>
            <Button
              endIcon={<Star />}
              size={size}
              startIcon={<Star />}
              variant="primary"
            >
              Обе иконки
            </Button>
            <Button loading size={size} startIcon={<Star />} variant="primary">
              Загрузка
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size={size} startIcon={<Star />} variant="soft">
              Button
            </Button>
            <ButtonLink
              href="#typography-alignment"
              size={size}
              startIcon={<Star />}
              variant="soft"
            >
              ButtonLink
            </ButtonLink>
          </div>
        </section>
      ))}
    </div>
  ),
  parameters: {
    layout: "padded"
  }
};

export const WithStartIcon: Story = {
  args: {
    children: "Добавить",
    startIcon: <Star />
  }
};

export const WithEndIcon: Story = {
  args: {
    children: "Продолжить",
    endIcon: <Star />
  }
};

export const WithBothIcons: Story = {
  args: {
    children: "Переместить",
    endIcon: <Star />,
    startIcon: <Star />
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

export const TypographySmMdLg: Story = {
  args: { children: "Ag Дру gj 08 99+", variant: "primary" },
  render: (args) => <div className="flex items-center gap-3"><Button {...args} size="sm" /><Button {...args} size="md" /><Button {...args} size="lg" /></div>
};
