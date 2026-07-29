import { useRef } from "react";
import {
  canStepNumber,
  NumberInput,
  type NumberInputActions,
} from "@mypoint/ui";
import "@mypoint/ui/styles.css";

export function TreeNumberInput() {
  const actionsRef = useRef<NumberInputActions | null>(null);
  const canIncrement = canStepNumber({
    direction: 1,
    maximumFractionDigits: 2,
    step: 0.25,
    value: 1.25,
  });

  return (
    <NumberInput
      actionsRef={actionsRef}
      aria-label="Tree-shaken number"
      data-can-increment={canIncrement}
      maximumFractionDigits={2}
      value={1.25}
    />
  );
}
