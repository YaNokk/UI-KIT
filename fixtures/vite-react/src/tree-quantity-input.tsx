import { QuantityInput } from "@mypoint/retail-ui";
import "@mypoint/retail-ui/styles.css";
import "@mypoint/ui/styles.css";

export function TreeQuantityInput() {
  return (
    <QuantityInput
      aria-label="Tree-shaken quantity"
      decreaseLabel="Decrease tree-shaken quantity"
      increaseLabel="Increase tree-shaken quantity"
      min={1}
      value={2}
    />
  );
}
