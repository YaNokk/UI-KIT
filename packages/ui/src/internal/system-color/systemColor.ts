import styles from "./systemColor.module.css";

export const systemColors = [
  "gray",
  "blue",
  "green",
  "amber",
  "red",
  "purple",
  "brand"
] as const;

export type SystemColor = (typeof systemColors)[number];

const systemColorClassNames: Record<SystemColor, string> = {
  gray: styles.gray,
  blue: styles.blue,
  green: styles.green,
  amber: styles.amber,
  red: styles.red,
  purple: styles.purple,
  brand: styles.brand
};

export function getSystemColorClass(color: SystemColor): string {
  if (color in systemColorClassNames) {
    return systemColorClassNames[color];
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[SystemColor] Unknown color "${String(color)}"; using gray.`);
  }

  return systemColorClassNames.gray;
}
