import { ModalPrimitive } from "../internal/modal/ModalPrimitive";
import type { ModalBaseProps } from "../modal/types";

export interface DialogProps extends ModalBaseProps {
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
