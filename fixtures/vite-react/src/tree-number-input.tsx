import { NumberInput } from "@mypoint/ui";
import "@mypoint/ui/styles.css";

export function TreeNumberInput() {
  return (
    <NumberInput
      aria-label="Tree-shaken number"
      maximumFractionDigits={2}
      value={1.25}
    />
  );
}
