import { useEffect, useState, type ReactNode } from "react";
import { Check, Plus } from "lucide-react";
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

type TypographyRole =
  | "fieldValueTextSm"
  | "fieldValueTextMd"
  | "fieldValueTextLg"
  | "compactChipText"
  | "controlTextSm"
  | "controlTextMd"
  | "controlTextLg"
  | "compactControlTextSm"
  | "compactControlTextMd"
  | "counterText"
  | "choiceControlLabel";

const expectedOffsets: Record<TypographyRole, string> = {
  fieldValueTextSm: "-0.25px",
  fieldValueTextMd: "-0.25px",
  fieldValueTextLg: "-0.5px",
  compactChipText: "-0.25px",
  controlTextSm: "-0.25px",
  controlTextMd: "-0.25px",
  controlTextLg: "-0.5px",
  compactControlTextSm: "-0.5px",
  compactControlTextMd: "-0.25px",
  counterText: "-0.5px",
  choiceControlLabel: "-0.25px"
};

const expectedWeights: Record<TypographyRole, string> = {
  fieldValueTextSm: "500",
  fieldValueTextMd: "500",
  fieldValueTextLg: "500",
  compactChipText: "500",
  controlTextSm: "500",
  controlTextMd: "500",
  controlTextLg: "500",
  compactControlTextSm: "500",
  compactControlTextMd: "500",
  counterText: "600",
  choiceControlLabel: "400"
};

const roleDetails: Record<TypographyRole, { metrics: string; consumers: string }> = {
  fieldValueTextSm: { metrics: "13 / 14 · 500", consumers: "Input, Select, MultiSelect value sm" },
  fieldValueTextMd: { metrics: "14 / 20 · 500", consumers: "Input, Select, MultiSelect value md" },
  fieldValueTextLg: { metrics: "16 / 22 · 500", consumers: "Input, Select, MultiSelect value lg" },
  compactChipText: { metrics: "13 / 18 · 500", consumers: "MultiSelect chip and overflow" },
  controlTextSm: { metrics: "14 / 20 · 500", consumers: "Button sm, Select trigger sm" },
  controlTextMd: { metrics: "16 / 24 · 500", consumers: "Button md, Select trigger md" },
  controlTextLg: { metrics: "18 / 28 · 500", consumers: "Button lg, Select trigger lg" },
  compactControlTextSm: { metrics: "12 / 16 · 500", consumers: "Tag sm" },
  compactControlTextMd: { metrics: "14 / 20 · 500", consumers: "Tag md, MultiSelect chip/summary" },
  counterText: { metrics: "12 / 16 · 600", consumers: "Badge, compact counters" },
  choiceControlLabel: { metrics: "16 / 24 · 400", consumers: "Select option/action, future single-line choices" }
};

const calibrationText = "Ag gjpqy Дру Уцщ Сохранить Черновик ӘҒҚҢӨҰҮҺІ 08 99+ !+% ₽ ₸ €";
const badgeGlyphs = ["0", "3", "8", "12", "99+", "!", "+1", "₸", "₽", "€", "gjpqy", "Уцщ"];
const selectItems: SelectCollectionItem[] = [
  {
    type: "action",
    id: "calibration-action",
    label: "Создать Черновик",
    textValue: "Создать Черновик",
    leading: <Plus />,
    onSelect: () => undefined
  },
  { label: "Ag", textValue: "Ag", value: "Ag" },
  { label: "gjpqy", textValue: "gjpqy", value: "gjpqy" },
  { label: "Дру", textValue: "Дру", value: "Дру" },
  { label: "Уцщ", textValue: "Уцщ", value: "Уцщ" },
  { label: "ӘҒҚҢӨҰҮҺІ", textValue: "ӘҒҚҢӨҰҮҺІ", value: "ӘҒҚҢӨҰҮҺІ" },
  { label: "99+ ₽ ₸ €", textValue: "99+ ₽ ₸ €", value: "99+ ₽ ₸ €" }
];

function Guide({ children, height }: { children: ReactNode; height?: string }) {
  return <span className={styles.guide} data-height={height}>{children}</span>;
}

function RoleHeader({ role }: { role: TypographyRole }) {
  const details = roleDetails[role];
  return (
    <div className={styles.roleHeader}>
      <strong>{role}</strong>
      <span>{details.metrics}</span>
      <span>offset {expectedOffsets[role]}</span>
      <span>{details.consumers}</span>
    </div>
  );
}

const controlRoleBySize = {
  sm: "controlTextSm",
  md: "controlTextMd",
  lg: "controlTextLg"
} as const;

const compactRoleBySize = {
  sm: "compactControlTextSm",
  md: "compactControlTextMd"
} as const;

function ControlRoleSection({ size }: { size: "sm" | "md" | "lg" }) {
  const role = controlRoleBySize[size];
  return (
    <section className={styles.roleSection} data-role-section={role}>
      <RoleHeader role={role} />
      <div className={styles.cells}>
        <Guide height={`button-${size}`}><Button size={size} variant="primary">Сохранить gjpqy Уцщ</Button></Guide>
        <Guide><Button size={size} startIcon={<Check />} variant="secondary">Pending 99+</Button></Guide>
        <Guide><Button endIcon={<Check />} size={size} variant="soft">Черновик ₸</Button></Guide>
        <Guide><Button loading size={size} variant="primary">Pending</Button></Guide>
        <Guide><Button disabled size={size} variant="secondary">Disabled</Button></Guide>
        <span className={styles.selectCell} data-height={`select-${size}`}>
          <Select aria-label={`Select ${size}`} items={selectItems} onChange={() => undefined} size={size} value="Уцщ" />
        </span>
        <span className={styles.selectCell}>
          <Select aria-label={`Select ${size} placeholder`} items={selectItems} onChange={() => undefined} placeholder="Pending" size={size} value={null} />
        </span>
        <span className={styles.selectCell}>
          <Select aria-label={`Select ${size} loading`} collectionState={{ status: "loading" }} items={[]} onChange={() => undefined} placeholder="Pending" size={size} value={null} />
        </span>
      </div>
    </section>
  );
}

function CompactRoleSection({ size }: { size: "sm" | "md" }) {
  const role = compactRoleBySize[size];
  const [multiValue, setMultiValue] = useState(["gjpqy", "Уцщ"]);
  return (
    <section className={styles.roleSection} data-role-section={role}>
      <RoleHeader role={role} />
      <div className={styles.cells}>
        <Guide height={`tag-${size}`}><Tag size={size}>Ag gjpqy</Tag></Guide>
        <Guide><Tag dot size={size}>Уцщ ₸</Tag></Guide>
        <Guide><Tag onClick={() => undefined} selected size={size}>Selected 99+</Tag></Guide>
        <Guide><Tag onRemove={() => undefined} removeLabel="Удалить" size={size}>ӘҒҚҢӨҰҮҺІ</Tag></Guide>
      </div>
      {size === "md" ? (
        <span className={styles.selectCell}>
          <MultiSelect aria-label="MultiSelect role consumer" items={selectItems} onChange={setMultiValue} value={multiValue} />
        </span>
      ) : null}
    </section>
  );
}

function CounterRoleSection() {
  return (
    <section className={styles.roleSection} data-role-section="counterText">
      <RoleHeader role="counterText" />
      <div className={styles.cells}>
        {badgeGlyphs.map((glyph) => <Guide height="badge" key={glyph}><Badge color="blue">{glyph}</Badge></Guide>)}
      </div>
    </section>
  );
}

function MultiSelectRoleSection() {
  const [value, setValue] = useState(["gjpqy", "Уцщ"]);
  return (
    <section className={styles.roleSection} data-role-section="compactChipText">
      <RoleHeader role="compactChipText" />
      <div className={styles.multiGrid}>
        {(["sm", "md", "lg"] as const).map((size) => (
          <span className={styles.selectCell} data-height={size === "lg" ? "multi-chip" : undefined} key={size}>
            <MultiSelect aria-label={`MultiSelect ${size}`} items={selectItems} labelView={size === "lg" ? "outer" : "inner"} onChange={setValue} size={size} value={value} />
          </span>
        ))}
        {(["sm", "md", "lg"] as const).map((size) => (
          <span className={styles.selectCell} key={`empty-${size}`}>
            <MultiSelect aria-label={`MultiSelect empty ${size}`} items={selectItems} labelView="inner" onChange={() => undefined} size={size} value={[]} />
          </span>
        ))}
        <span className={styles.selectCell}>
          <MultiSelect aria-label="MultiSelect summary" items={selectItems} onChange={() => undefined} size="md" value={["Ag", "gjpqy", "Дру", "Уцщ", "ӘҒҚҢӨҰҮҺІ"]} />
        </span>
      </div>
    </section>
  );
}

function ChoiceRoleSection() {
  const [value, setValue] = useState<string | null>("Уцщ");
  return (
    <section className={styles.roleSection} data-role-section="choiceControlLabel">
      <RoleHeader role="choiceControlLabel" />
      <div className={styles.choicePreview}>
        <span aria-hidden="true" className={styles.choiceIndicator} />
        <span className={typographyStyles.choiceControlLabel} data-control-text-role="choiceControlLabel">{calibrationText}</span>
      </div>
      <div className={styles.selectCell}>
        <Select aria-label="Select option and Action calibration" items={selectItems} onChange={setValue} open size="md" value={value} />
      </div>
    </section>
  );
}

function TooltipAudit() {
  return (
    <section className={styles.auditSection}>
      <strong>Tooltip audit</strong>
      <span>Content remains normal wrapping typography; no one-line role is applied to the content stack.</span>
      <Tooltip content={calibrationText} defaultOpen><Button size="sm" variant="secondary">Tooltip</Button></Tooltip>
    </section>
  );
}

function Calibration({ family = "all" }: { family?: "all" | "badge" | "button" | "tag" | "select" | "multi" }) {
  return (
    <div className={styles.matrix} data-typography-calibration="">
      <div className={styles.note}>Inter · Chromium · Windows · 100% zoom · full line boxes · physical center guides</div>
      {family === "all" || family === "button" || family === "select" ? <ControlRoleSection size="sm" /> : null}
      {family === "all" || family === "button" || family === "select" ? <ControlRoleSection size="md" /> : null}
      {family === "all" || family === "button" || family === "select" ? <ControlRoleSection size="lg" /> : null}
      {family === "all" || family === "tag" ? <CompactRoleSection size="sm" /> : null}
      {family === "all" || family === "tag" ? <CompactRoleSection size="md" /> : null}
      {family === "all" || family === "badge" ? <CounterRoleSection /> : null}
      {family === "all" || family === "multi" ? <MultiSelectRoleSection /> : null}
      {family === "all" || family === "select" ? <ChoiceRoleSection /> : null}
      {family === "all" ? <TooltipAudit /> : null}
    </div>
  );
}

function FallbackScope({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add(styles.fallback);
    return () => document.documentElement.classList.remove(styles.fallback);
  }, []);
  return <div className={styles.fallback}>{children}</div>;
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

async function verifyTypography(canvasElement: HTMLElement, fallback: boolean, roles: TypographyRole[]) {
  await document.fonts.ready;
  expect(document.fonts.status).toBe("loaded");
  if (!fallback) expect(document.fonts.check('14px "Inter"')).toBe(true);

  for (const role of roles) {
    const elements = [...document.querySelectorAll(`[data-control-text-role="${role}"]`)];
    expect(elements.length).toBeGreaterThan(0);
    for (const element of elements) {
      const computed = getComputedStyle(element);
      if (role.startsWith("fieldValueText")) {
        expect(element).toHaveAttribute("data-field-value-typography");
        if (element.hasAttribute("data-field-value-optical")) {
          expect(computed.getPropertyValue("--control-text-optical-offset").trim())
            .toBe(expectedOffsets[role]);
        } else {
          expect(element.tagName).toBe("INPUT");
          expect(computed.getPropertyValue("--control-text-optical-offset").trim())
            .toBe("");
          expect(computed.position).toBe("static");
          expect(computed.insetBlockStart).toBe("auto");
        }
      } else {
        expect(computed.getPropertyValue("--control-text-optical-offset").trim())
          .toBe(expectedOffsets[role]);
      }
      expect(computed.fontWeight).toBe(expectedWeights[role]);
      if (fallback) expect(computed.fontFamily).not.toContain("Inter");
      else expect(computed.fontFamily).toContain("Inter");
    }
  }

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
    if (fixture === null) continue;
    const control = name.startsWith("select-")
      ? fixture.querySelector('[data-field-part="shell"]')
      : name === "multi-chip"
        ? fixture.querySelector("[data-field-chip]")
        : fixture.firstElementChild;
    expect(Math.round(control?.getBoundingClientRect().height ?? 0)).toBe(height);
  }
}

const allRoles = Object.keys(expectedOffsets) as TypographyRole[];
const controlRoles: TypographyRole[] = ["controlTextSm", "controlTextMd", "controlTextLg"];
const tagRoles: TypographyRole[] = ["compactControlTextSm", "compactControlTextMd"];
const fieldValueRoles: TypographyRole[] = ["fieldValueTextSm", "fieldValueTextMd", "fieldValueTextLg"];

const meta = {
  title: "Foundations/SingleLineControlTypography",
  component: Calibration,
  parameters: { layout: "padded" },
  tags: ["test", "visual"]
} satisfies Meta<typeof Calibration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Matrix: Story = { play: async ({ canvasElement }) => verifyTypography(canvasElement, false, allRoles) };
export const BadgeRoleMatrix: Story = { args: { family: "badge" }, play: async ({ canvasElement }) => verifyTypography(canvasElement, false, ["counterText"]) };
export const ButtonSizeMatrix: Story = { args: { family: "button" }, play: async ({ canvasElement }) => verifyTypography(canvasElement, false, controlRoles) };
export const TagSizeStateMatrix: Story = { args: { family: "tag" }, play: async ({ canvasElement }) => verifyTypography(canvasElement, false, tagRoles) };
export const SelectTriggerOptionActionMatrix: Story = { args: { family: "select" }, play: async ({ canvasElement }) => verifyTypography(canvasElement, false, [...controlRoles, ...fieldValueRoles, "choiceControlLabel"]) };
export const MultiSelectChipSummaryMatrix: Story = { args: { family: "multi" }, play: async ({ canvasElement }) => verifyTypography(canvasElement, false, [...fieldValueRoles, "compactChipText"]) };
export const SystemUiFallbackMatrix: Story = {
  decorators: [(Story) => <FallbackScope><Story /></FallbackScope>],
  play: async ({ canvasElement }) => verifyTypography(canvasElement, true, allRoles)
};
