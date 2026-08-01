import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Badge } from "../../Badge/Badge";
import { Button } from "../../Button/Button";
import { MultiSelect } from "../../MultiSelect/MultiSelect";
import { Select } from "../../Select/Select";
import { Tag } from "../../Tag/Tag";
import { Tooltip } from "../../Tooltip/Tooltip";
import type { SelectCollectionItem } from "../select/collection";
import styles from "./SingleLineControlTypography.stories.module.css";
import typographyStyles from "./singleLineControlTypography.module.css";

const glyphs = [
  "Ag",
  "gjpqy",
  "ÅÉÇÑ",
  "ğşă",
  "Дру",
  "Уцщ",
  "ЦЩ",
  "Йц",
  "Ә Ғ Қ Ң Ө Ұ Ү Һ І",
  "08",
  "123",
  "99+",
  "!+%",
  "₽ ₸ €"
];
const calibrationText = "Ag gjpqy Дру Уцщ ӘҒҚҢӨҰҮҺІ 08 99+ !+% ₽ ₸ €";
const selectItems: SelectCollectionItem[] = [
  {
    type: "action",
    id: "calibration-action",
    label: "Создать gjpqy Уцщ",
    textValue: "Создать gjpqy Уцщ",
    onSelect: () => undefined
  },
  ...glyphs.map((label) => ({ label, textValue: label, value: label }))
];

function Calibration() {
  const [value, setValue] = useState<string | null>("Дру");
  const [multiValue, setMultiValue] = useState(["gjpqy", "Уцщ"]);
  return (
    <div className={styles.matrix} data-typography-calibration="">
      <div className={styles.note}>Chromium · Windows · 100% zoom · Latin/Cyrillic/Kazakh Cyrillic · full line boxes</div>
      <section className={styles.row}><strong>Button sm/md/lg</strong><div className={styles.cells}>{(["sm", "md", "lg"] as const).map((size) => <span className={styles.guide} data-height={`button-${size}`} key={size}><Button size={size} variant="primary">{calibrationText}</Button></span>)}</div></section>
      <section className={styles.row}><strong>Tag sm/md</strong><div className={styles.cells}>{(["sm", "md"] as const).map((size) => <span className={styles.guide} data-height={`tag-${size}`} key={size}><Tag size={size}>{calibrationText}</Tag></span>)}</div></section>
      <section className={styles.row}><strong>Badge</strong><div className={styles.cells}>{glyphs.map((glyph) => <span className={styles.guide} data-height="badge" key={glyph}><Badge color="blue">{glyph}</Badge></span>)}</div></section>
      <section className={styles.row}><strong>Select trigger sm/md/lg</strong><div className={styles.selectGrid}>{(["sm", "md", "lg"] as const).map((size) => <span data-height={`select-${size}`} key={size}><Select aria-label={`Select ${size}`} items={selectItems} onChange={setValue} size={size} value={value} /></span>)}</div></section>
      <section className={styles.row}><strong>MultiSelect chip</strong><span className={styles.selectCell} data-height="multi-chip"><MultiSelect aria-label="Калибровка MultiSelect" items={selectItems} onChange={setMultiValue} value={multiValue} /></span></section>
      <section className={styles.row}><strong>Tooltip (wrapping text)</strong><Tooltip content={calibrationText} defaultOpen><Button size="sm" variant="secondary">Tooltip</Button></Tooltip></section>
      <section className={styles.row}><strong>Future choice label</strong><span className={typographyStyles.choiceControlLabel}>{calibrationText}</span></section>
      <section className={styles.row}><strong>Role weights</strong><div className={styles.weights}><span className={typographyStyles.choiceControlLabel}>regular {calibrationText}</span><span className={typographyStyles.controlTextMd}>medium {calibrationText}</span><span className={typographyStyles.counterText}>semibold 99+ ₽ ₸ €</span></div></section>
      <section className={styles.row}><strong>Select option / Action</strong><div className={styles.selectCell}><Select aria-label="Select options calibration" items={selectItems} onChange={setValue} open size="md" value={value} /></div></section>
    </div>
  );
}

const expectedHeights: Record<string, number> = {
  "button-sm": 32,
  "button-md": 40,
  "button-lg": 48,
  "tag-sm": 24,
  "tag-md": 32,
  badge: 20,
  "select-sm": 32,
  "select-md": 40,
  "select-lg": 48,
  "multi-chip": 20
};

async function verifyTypography(canvasElement: HTMLElement, fallback: boolean) {
  await document.fonts.ready;
  expect(document.fonts.status).toBe("loaded");
  const controlText = canvasElement.querySelector("[data-control-text]");
  expect(controlText).not.toBeNull();
  const family = getComputedStyle(controlText as Element).fontFamily;
  if (fallback) expect(family).not.toContain("Inter");
  else expect(family).toContain("Inter");

  for (const clip of document.querySelectorAll("[data-control-text-clip]")) {
    const text = clip.firstElementChild;
    if (text === null) continue;
    const clipRect = clip.getBoundingClientRect();
    const textRect = text.getBoundingClientRect();
    expect(textRect.top).toBeGreaterThanOrEqual(clipRect.top - 0.5);
    expect(textRect.bottom).toBeLessThanOrEqual(clipRect.bottom + 0.5);
  }

  for (const [name, height] of Object.entries(expectedHeights)) {
    const fixture = canvasElement.querySelector(`[data-height="${name}"]`);
    const control = name.startsWith("select-")
      ? fixture?.querySelector('[data-field-part="shell"]')
      : name === "multi-chip"
        ? fixture?.querySelector("[data-field-chip]")
        : fixture?.firstElementChild;
    expect(Math.round(control?.getBoundingClientRect().height ?? 0)).toBe(height);
  }
}

const meta = {
  title: "Foundations/SingleLineControlTypography",
  component: Calibration,
  parameters: { layout: "padded" },
  tags: ["test"]
} satisfies Meta<typeof Calibration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Matrix: Story = {
  play: async ({ canvasElement }) => verifyTypography(canvasElement, false)
};

export const SystemUiFallback: Story = {
  decorators: [(Story) => <div className={styles.fallback}><Story /></div>],
  play: async ({ canvasElement }) => verifyTypography(canvasElement, true)
};
