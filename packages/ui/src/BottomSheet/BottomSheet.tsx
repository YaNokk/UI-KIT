import { ModalPrimitive } from "../internal/modal/ModalPrimitive";
import type { ModalBaseProps } from "../modal/types";

export interface BottomSheetProps extends ModalBaseProps {
  dismissOnBackdrop?: boolean;
}

export function BottomSheet({
  dismissOnBackdrop = true,
  ...props
}: BottomSheetProps) {
  return (
    <ModalPrimitive
      {...props}
      dim
      dismissOnBackdrop={dismissOnBackdrop}
      kind="bottom-sheet"
    />
  );
}
