import { ModalPrimitive } from "../internal/modal/ModalPrimitive";
import type { DrawerSize, ModalBaseProps } from "../modal/types";

export type { DrawerSize } from "../modal/types";

export interface DrawerProps extends ModalBaseProps {
  size?: DrawerSize;
}

export function Drawer({ size = "md", ...props }: DrawerProps) {
  return (
    <ModalPrimitive
      {...props}
      dim={false}
      dismissOnBackdrop={false}
      drawerSize={size}
      kind="drawer"
    />
  );
}
