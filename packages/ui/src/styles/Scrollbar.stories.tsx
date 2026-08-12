import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DesignSystemProvider } from "../DesignSystemProvider/DesignSystemProvider";
import { classNames } from "../shared/classNames";
import { scrollbarClassName } from "./scrollbar";
import styles from "./Scrollbar.stories.module.css";

function Rows() {
  return (
    <ul className={styles.list}>
      {Array.from({ length: 18 }, (_, index) => (
        <li className={styles.row} key={index}>Строка длинного списка {index + 1}</li>
      ))}
    </ul>
  );
}

function VerticalExample() {
  return (
    <section className={styles.example}>
      <h3 className={styles.label}>Default vertical</h3>
      <div className={classNames(styles.vertical, scrollbarClassName())} data-scrollbar-example="vertical">
        <Rows />
      </div>
    </section>
  );
}

function HorizontalExample({ compact = false }: { compact?: boolean }) {
  return (
    <section className={styles.example}>
      <h3 className={styles.label}>{compact ? "Compact horizontal" : "Default horizontal"}</h3>
      <div
        className={classNames(styles.horizontal, scrollbarClassName(compact ? "compact" : "default"))}
        data-scrollbar-example={compact ? "compact" : "horizontal"}
      >
        <div className={styles.wide}>Горизонтальная область с содержимым шире доступного контейнера</div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <div className={styles.canvas}>
      <VerticalExample />
      <HorizontalExample />
      <HorizontalExample compact />
    </div>
  );
}

const meta = {
  title: "Foundations/Scrollbar",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"]
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVertical: Story = {
  render: () => <Gallery />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const vertical = canvasElement.querySelector<HTMLElement>("[data-scrollbar-example='vertical']");
    const horizontal = canvasElement.querySelector<HTMLElement>("[data-scrollbar-example='horizontal']");
    const compact = canvasElement.querySelector<HTMLElement>("[data-scrollbar-example='compact']");
    if (!vertical || !horizontal || !compact) throw new Error("Scrollbar story owners are unavailable");
    expect(vertical).toHaveClass(scrollbarClassName());
    expect(horizontal).toHaveClass(scrollbarClassName());
    expect(compact).toHaveClass(scrollbarClassName("compact"));
    expect(vertical.scrollHeight).toBeGreaterThan(vertical.clientHeight);
    expect(horizontal.scrollWidth).toBeGreaterThan(horizontal.clientWidth);
    expect(canvas.getByText("Строка длинного списка 18")).toBeInTheDocument();
  }
};

export const DefaultHorizontal: Story = { render: () => <div className={styles.canvas}><HorizontalExample /></div> };
export const CompactHorizontal: Story = { render: () => <div className={styles.canvas}><HorizontalExample compact /></div> };
export const LongList: Story = { render: () => <div className={styles.canvas}><VerticalExample /></div> };
export const LightSurface: Story = { render: () => <DesignSystemProvider mode="light"><Gallery /></DesignSystemProvider> };
export const DarkSurface: Story = { render: () => <DesignSystemProvider mode="dark"><Gallery /></DesignSystemProvider> };

