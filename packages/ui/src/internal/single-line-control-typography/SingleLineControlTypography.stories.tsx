import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Badge } from "../../Badge/Badge";
import { Button } from "../../Button/Button";
import { Select } from "../../Select/Select";
import { Tag } from "../../Tag/Tag";
import { Tooltip } from "../../Tooltip/Tooltip";
import styles from "./SingleLineControlTypography.stories.module.css";
import typographyStyles from "./singleLineControlTypography.module.css";

const glyphs = ["Ag", "Дру", "gj", "08", "99+", "!"];
const items = glyphs.map((label) => ({ label, textValue: label, value: label }));

function Calibration() {
  const [value, setValue] = useState<string | null>("Дру");
  return (
    <div className={styles.matrix} data-typography-calibration="">
      <div className={styles.note}>Chromium · Windows · 100% zoom · guides cross the control center</div>
      <section className={styles.row}><strong>Button sm/md/lg</strong><div className={styles.cells}>{(["sm", "md", "lg"] as const).map((size) => <span className={styles.guide} key={size}><Button size={size} variant="primary">Ag Дру gj 08 99+ !</Button></span>)}</div></section>
      <section className={styles.row}><strong>Tag sm/md</strong><div className={styles.cells}>{(["sm", "md"] as const).map((size) => <span className={styles.guide} key={size}><Tag size={size}>Ag Дру gj 08 99+ !</Tag></span>)}</div></section>
      <section className={styles.row}><strong>Badge</strong><div className={styles.cells}>{glyphs.map((glyph) => <span className={styles.guide} key={glyph}><Badge color="blue">{glyph}</Badge></span>)}</div></section>
      <section className={styles.row}><strong>Tooltip (wrapping role, no trim)</strong><Tooltip content="Ag Дру gj 08 99+ !" defaultOpen><Button size="sm" variant="secondary">Tooltip</Button></Tooltip></section>
      <section className={styles.row}><strong>Future choice label</strong><span className={typographyStyles.choiceControlLabel}>Ag Дру gj 08 99+ !</span></section>
      <section className={styles.row}><strong>Weights</strong><div className={styles.weights}><span className={typographyStyles.choiceControlLabel}>regular Ag Дру gj</span><span className={typographyStyles.controlTextMd}>medium Ag Дру gj</span><span className={typographyStyles.counterText}>semibold 99+</span></div></section>
      <section className={styles.row}><strong>Select trigger / option</strong><div className={styles.selectCell}><Select aria-label="Калибровка Select" items={items} onChange={setValue} open size="md" value={value} /></div></section>
    </div>
  );
}

const meta = {
  title: "Foundations/SingleLineControlTypography",
  component: Calibration,
  parameters: { layout: "padded" }
} satisfies Meta<typeof Calibration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Matrix: Story = {
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    expect(document.fonts.status).toBe("loaded");
    const controlText = canvasElement.querySelector("[data-control-text]");
    expect(controlText).not.toBeNull();
    expect(getComputedStyle(controlText as Element).fontFamily).toContain("Inter");
  }
};
