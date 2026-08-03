import type { ReactElement, ReactNode } from "react";
import { BottomSheet } from "../../BottomSheet/BottomSheet";
import { Popover } from "../../Popover/Popover";
import { useSelectPresentation } from "../select/useSelectPresentation";
import { classNames } from "../../shared/classNames";
import styles from "./PickerOverlay.module.css";

export interface PickerOverlayProps {
  children: ReactNode;
  closeLabel: string;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: ReactNode;
  trigger: ReactElement;
  wide?: boolean;
}

export function PickerOverlay({
  children,
  closeLabel,
  footer,
  onOpenChange,
  open,
  title,
  trigger,
  wide = false
}: PickerOverlayProps) {
  const presentation = useSelectPresentation();
  if (presentation === "sheet") {
    return (
      <>
        {trigger}
        <BottomSheet
          closeLabel={closeLabel}
          footer={footer ? <div className={styles.sheetFooter}>{footer}</div> : undefined}
          onOpenChange={onOpenChange}
          open={open}
          title={title}
        >
          <div className={styles.body}>{children}</div>
        </BottomSheet>
      </>
    );
  }
  return (
    <Popover
      className={classNames(styles.popover, wide && styles.wide)}
      onOpenChange={onOpenChange}
      open={open}
      trigger={trigger}
    >
      <div className={styles.body}>
        {children}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </Popover>
  );
}
