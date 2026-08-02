import { useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  canStepNumber,
  NumberInput,
  type NumberInputActions,
} from "@mypoint/ui";
import "@mypoint/ui/styles.css";

function TreeNumberInput() {
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

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(<TreeNumberInput />);
