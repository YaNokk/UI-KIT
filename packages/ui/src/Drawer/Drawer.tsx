import { ModalPrimitive } from "../internal/modal/ModalPrimitive";
import type { SharedModalProps } from "../internal/modal/types";

export type DrawerProps = SharedModalProps;

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
