import { ModalPrimitive } from "../internal/modal/ModalPrimitive";
import type { ModalBaseProps } from "../modal/types";

export type DrawerProps = ModalBaseProps;

export function Drawer(props: DrawerProps) {
  return (
    <ModalPrimitive
      {...props}
      dim={false}
      dismissOnBackdrop={false}
      kind="drawer"
    />
  );
}
