import { ModalPrimitive } from "../internal/modal/ModalPrimitive";
import type { SharedModalProps } from "../internal/modal/types";

export interface DialogProps extends SharedModalProps {
  dismissOnBackdrop?: boolean;
}

export function Dialog({
  dismissOnBackdrop = true,
  ...props
}: DialogProps) {
  return (
    <ModalPrimitive
      {...props}
      dim
      dismissOnBackdrop={dismissOnBackdrop}
      kind="dialog"
    />
  );
}
