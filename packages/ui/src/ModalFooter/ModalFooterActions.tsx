import { type ReactNode } from "react";
import styles from "./ModalFooterActions.module.css";

export interface ModalFooterActionsProps {
  leading?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
}

export function ModalFooterActions({
  leading,
  primary,
  secondary
}: ModalFooterActionsProps) {
  return (
    <div className={styles.root}>
      {leading != null ? <div className={styles.leading}>{leading}</div> : null}
      <div className={styles.actions}>
        {secondary != null ? <div className={styles.secondary}>{secondary}</div> : null}
        <div className={styles.primary}>{primary}</div>
      </div>
    </div>
  );
}
