import { ModalPrimitive } from "../internal/modal/ModalPrimitive";
import type { SharedModalProps } from "../internal/modal/types";

export interface BottomSheetProps extends SharedModalProps {
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
