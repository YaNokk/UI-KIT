import { useRef } from "react";
import {
  NumberInput,
  type NumberInputActions,
} from "@mypoint/ui";
import "@mypoint/ui/styles.css";

export function TreeNumberInput() {
  const actionsRef = useRef<NumberInputActions | null>(null);

  return (
    <NumberInput
      actionsRef={actionsRef}
      aria-label="Tree-shaken number"
      maximumFractionDigits={2}
      value={1.25}
    />
  );
}
