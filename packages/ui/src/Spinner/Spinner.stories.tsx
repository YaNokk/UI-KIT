import type { Meta, StoryObj } from "@storybook/react-vite";
import { RefreshCw } from "lucide-react";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import {
  Spinner,
  type SpinnerSize,
  type SpinnerTone
} from "./Spinner";
import storyStyles from "./Spinner.stories.module.css";

const sizes: SpinnerSize[] = ["sm", "md", "lg"];
const tones: SpinnerTone[] = [
  "current",
  "primary",
  "secondary",
  "accent",
  "danger",
  "inverse"
];

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  args: {
    size: "md",
    tone: "current"
  },
  argTypes: {
    size: {
      control: "select",
      options: sizes
    },
    tone: {
      control: "select",
      options: tones
    }
  },
  parameters: { layout: "centered" }
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {sizes.map((size) => (
        <Spinner {...args} key={size} size={size} />
      ))}
    </div>
  )
};

export const Tones: Story = {
  render: () => (
    <div className="grid gap-3">
      <div className="flex items-center gap-4 text-text-primary">
        {tones.filter((tone) => tone !== "inverse").map((tone) => (
          <span className="inline-flex items-center gap-2" key={tone}>
            <Spinner tone={tone} />
            <span className="typo-body-sm">{tone}</span>
          </span>
        ))}
      </div>
      <div className={storyStyles.inverseSurface}>
        <Spinner tone="inverse" />
        <span className="typo-body-sm">inverse</span>
      </div>
    </div>
  )
};

export const CurrentColor: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="inline-flex items-center gap-2 text-icon-primary">
        <Spinner />
        primary context
      </span>
      <span className="inline-flex items-center gap-2 text-icon-danger">
        <Spinner />
        danger context
      </span>
    </div>
  )
};

export const StandaloneAccessible: Story = {
  args: {
    label: "Загрузка заказов"
  }
};

export const InsideButton: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button loading size="sm" variant="secondary">Сохранение</Button>
      <Button loading size="md" variant="primary">Сохранение</Button>
      <Button loading size="lg" variant="danger">Удаление</Button>
    </div>
  )
};

export const InsideIconButton: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <IconButton
          aria-label={`Обновление, размер ${size}`}
          icon={<RefreshCw />}
          key={size}
          loading
          size={size}
          variant="primary"
        />
      ))}
    </div>
  )
};

export const ReducedMotionDocumentation: Story = {
  render: () => (
    <div className="grid max-w-sm gap-3 text-text-primary">
      <Spinner label="Загрузка с учётом системной настройки движения" />
      <p className="typo-body-sm m-0 text-text-secondary">
        При prefers-reduced-motion кольцо остаётся видимым, но не вращается.
      </p>
    </div>
  )
};

export const BrandStress: Story = {
  render: () => (
    <div className="grid gap-3">
      <div className="flex items-center gap-4">
        <Spinner tone="accent" />
        <Spinner tone="danger" />
        <Spinner tone="primary" />
      </div>
      <p className="typo-body-sm m-0 text-text-secondary">
        Проверьте blue, green, purple, yellow и near-black через global accent toolbar.
      </p>
    </div>
  )
};
