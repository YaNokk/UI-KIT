import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { Button } from "../Button/Button";
import { Spinner } from "../Spinner/Spinner";
import { Text } from "../Text/Text";
import type { ActionMenuAction } from "./types";
import styles from "./ActionMenu.module.css";

interface ActionMenuListProps {
  actions: readonly ActionMenuAction[];
  autoFocus: boolean;
  confirming: ActionMenuAction | undefined;
  menuLabel: string;
  onCancelConfirmation: () => void;
  onConfirm: (action: ActionMenuAction) => void;
  onRequestClose: () => void;
  onSelect: (action: ActionMenuAction) => void;
  pendingId: string | null;
  presentation: "floating" | "sheet";
  setSurface: (surface: HTMLElement | null) => void;
}

export function ActionMenuList({
  actions,
  autoFocus,
  confirming,
  menuLabel,
  onCancelConfirmation,
  onConfirm,
  onRequestClose,
  onSelect,
  pendingId,
  presentation,
  setSurface
}: ActionMenuListProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const confirmation = confirming?.tone === "danger"
    ? confirming.confirmation
    : false;

  useEffect(() => {
    setSurface(rootRef.current);
    return () => setSurface(null);
  }, [setSurface]);

  useEffect(() => {
    if (!autoFocus) return;
    const target = rootRef.current?.querySelector<HTMLElement>(
      confirmation
        ? "button:not(:disabled)"
        : "[role='menuitem']:not(:disabled)"
    );
    target?.focus({ preventScroll: true });
  }, [autoFocus, confirmation]);

  if (confirmation && confirming) {
    return (
      <div
        aria-labelledby={titleId}
        className={styles.confirmation}
        data-action-menu-presentation={presentation}
        ref={rootRef}
        role={presentation === "floating" ? "alertdialog" : "region"}
      >
        <Text as="p" id={titleId} variant="bodyStrong">
          {confirmation.title}
        </Text>
        {confirmation.description != null ? (
          <Text as="p" tone="secondary" variant="bodySm">
            {confirmation.description}
          </Text>
        ) : null}
        <div className={styles.confirmationActions}>
          <Button
            disabled={pendingId != null}
            onClick={onCancelConfirmation}
            size="sm"
            variant="secondary"
          >
            {confirmation.cancelLabel}
          </Button>
          <Button
            loading={pendingId === confirming.id}
            onClick={() => onConfirm(confirming)}
            size="sm"
            variant="danger"
          >
            {confirmation.confirmLabel}
          </Button>
        </div>
      </div>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      onRequestClose();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(
      "[role='menuitem']:not(:disabled)"
    ) ?? []);
    if (items.length === 0) return;
    const current = event.target instanceof HTMLElement
      ? items.indexOf(event.target)
      : -1;
    let next = 0;
    if (event.key === "End") next = items.length - 1;
    if (event.key === "ArrowDown") next = (current + 1) % items.length;
    if (event.key === "ArrowUp") {
      next = current <= 0 ? items.length - 1 : current - 1;
    }
    items[next]?.focus({ preventScroll: true });
  };

  return (
    <div
      aria-label={menuLabel}
      className={styles.list}
      data-action-menu-presentation={presentation}
      onKeyDown={handleKeyDown}
      ref={rootRef}
      role="menu"
    >
      {actions.map((action) => {
        const pending = pendingId === action.id;
        return (
          <button
            aria-busy={pending || undefined}
            className={styles.item}
            data-tone={action.tone === "danger" ? "danger" : undefined}
            disabled={Boolean(action.disabled || pendingId != null)}
            key={action.id}
            onClick={() => onSelect(action)}
            role="menuitem"
            tabIndex={-1}
            type="button"
          >
            {pending ? (
              <Spinner size="sm" tone="current" />
            ) : action.icon != null ? (
              <span aria-hidden="true" className={styles.icon}>{action.icon}</span>
            ) : null}
            <span className={styles.label}>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
