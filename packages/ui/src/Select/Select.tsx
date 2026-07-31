import { ChevronDown, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode
} from "react";
import { FieldShell } from "../FieldShell/FieldShell";
import { FormControl } from "../FormControl/FormControl";
import { IconButton } from "../IconButton/IconButton";
import type { FieldLabelView, FieldSize } from "../shared/field";
import { classNames } from "../shared/classNames";
import {
  type SelectCollectionItem,
  type SelectNavigableRow,
  type SelectOption
} from "../internal/select/collection";
import { resolveSelectMessages } from "../internal/select/messages";
import { SelectListboxView } from "../internal/select/SelectListboxView";
import { SelectPanel } from "../internal/select/SelectPanel";
import type { SelectCollectionState } from "../internal/select/types";
import { useSelectState } from "../internal/select/useSelectState";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import styles from "../internal/select/SelectTrigger.module.css";

export interface SelectProps<Value extends string = string> {
  value: Value | null;
  onChange: (value: Value | null) => void;
  items: readonly SelectCollectionItem<Value>[];
  selectedItem?: SelectOption<Value> | undefined;
  collectionState?: SelectCollectionState | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  placeholder?: ReactNode;
  label?: ReactNode;
  labelView?: FieldLabelView;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  size?: FieldSize;
  name?: string;
  id?: string;
  locale?: string | undefined;
  clearLabel?: string | undefined;
  emptyMessage?: ReactNode;
  loadingMessage?: ReactNode;
  className?: string | undefined;
  "aria-describedby"?: string | undefined;
  "aria-label"?: string | undefined;
}

export const Select = forwardRef(function SelectInner<Value extends string>(
  {
    value,
    onChange,
    items,
    selectedItem,
    collectionState,
    open: controlledOpen,
    onOpenChange,
    placeholder,
    label,
    labelView = "outer",
    hint,
    error,
    required = false,
    disabled = false,
    readOnly = false,
    clearable = false,
    size = "md",
    name,
    id,
    locale,
    clearLabel,
    emptyMessage,
    loadingMessage,
    className,
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel
  }: SelectProps<Value>,
  ref: React.ForwardedRef<HTMLElement>
) {
  const resolvedLocale = useResolvedLocale(locale);
  const messages = useMemo(() => {
    const base = resolveSelectMessages(resolvedLocale);
    return {
      ...base,
      ...(clearLabel !== undefined ? { clear: clearLabel } : {}),
      ...(emptyMessage != null && typeof emptyMessage === "string"
        ? { empty: emptyMessage }
        : {}),
      ...(loadingMessage != null && typeof loadingMessage === "string"
        ? { loading: loadingMessage }
        : {})
    };
  }, [resolvedLocale, clearLabel, emptyMessage, loadingMessage]);

  const isControlledOpen = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlledOpen ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlledOpen) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isControlledOpen, onOpenChange]
  );

  const state = useSelectState<Value>({
    items,
    collectionState,
    open,
    onOpenChange: setOpen,
    locale: resolvedLocale
  });

  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const floatingReferenceRef = useRef<HTMLElement | null>(null);
  const skipFocusRestoreRef = useRef(false);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => triggerRef.current as HTMLElement, []);

  // Trigger width drives the private popover min-width policy without
  // changing the frozen generic Popover contract.
  const updateTriggerInlineSize = useCallback(() => {
    const reference = floatingReferenceRef.current;
    if (!reference || typeof reference.getBoundingClientRect !== "function") {
      return;
    }
    const width = reference.getBoundingClientRect().width;
    if (width > 0) {
      reference.style.setProperty(
        "--select-trigger-inline-size",
        width + "px"
      );
    }
  }, []);

  const collection = state.collection;
  const displayOption = useMemo(() => {
    if (value === null) return null;
    const inCollection = collection.optionRowByValue.get(value);
    if (inCollection) return inCollection.option;
    if (selectedItem) return selectedItem;
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Select] Selected value '" + value + "' is not present in items "
          + "and no selectedItem presentation cache was provided; "
          + "falling back to the raw value."
      );
    }
    return {
      value,
      label: String(value),
      textValue: String(value)
    } as SelectOption<Value>;
  }, [collection, selectedItem, value]);

  const selectedValues = useMemo<ReadonlySet<Value>>(
    () => new Set<Value>(value === null ? [] : [value]),
    [value]
  );

  const invalid = error != null;
  const interactive = !disabled && !readOnly;
  const showClear = clearable && !disabled && !required && value !== null;

  const commit = useCallback(
    (row: SelectNavigableRow<Value>) => {
      if (row.disabled) return;
      if (row.type === "action") {
        row.action.onSelect();
        setOpen(false);
        return;
      }
      onChange(row.option.value);
      setOpen(false);
    },
    [onChange, setOpen]
  );

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (!interactive) return;
    if (!open && event.key !== "Backspace" && event.key !== "Delete") {
      state.handleTriggerKeyDown(event, commit);
      if (
        (event.key === "Enter"
          || event.key === " "
          || event.key === "ArrowDown")
        && !open
      ) {
        state.openWithSelection(value === null ? [] : [value]);
      }
      return;
    }
    if (open) state.handleListKeyDown(event, commit);
  };

  const handleClear = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!showClear) return;
    onChange(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) updateTriggerInlineSize();
    setOpen(nextOpen);
  };

  const trigger = (
    <FormControl
      className={className}
      controlId={id}
      describedBy={ariaDescribedBy}
      disabled={disabled}
      error={error}
      hint={hint}
      invalid={invalid}
      label={label}
      labelView={labelView}
      required={required}
    >
      {({ label: controlLabel, ...controlProps }) => (
        <FieldShell
          disabled={disabled}
          endAdornment={
            <span className={styles.actions} data-field-interactive="">
              {showClear ? (
                <IconButton
                  aria-label={messages.clear}
                  disabled={disabled}
                  icon={<X />}
                  onClick={handleClear}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  size="sm"
                  variant="ghost"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={classNames(
                  styles.chevron,
                  open && styles.chevronOpen
                )}
              >
                <ChevronDown />
              </span>
            </span>
          }
          invalid={invalid}
          label={controlLabel}
          labelFloated={open || value !== null}
          labelView={labelView}
          onFocusRequest={() => triggerRef.current?.focus()}
          readOnly={readOnly}
          ref={shellRef}
          size={size}
        >
          <button
            {...controlProps}
            aria-controls={open ? listboxId : undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={ariaLabel}
            className={styles.value}
            data-field-part="native-control"
            disabled={disabled}
            onKeyDown={handleTriggerKeyDown}
            ref={(node) => {
              triggerRef.current = node;
            }}
            type="button"
          >
            {displayOption?.leading != null ? (
              <span aria-hidden="true" className={styles.valueLeading}>
                {displayOption.leading}
              </span>
            ) : null}
            <span
              className={classNames(
                styles.valueText,
                displayOption === null && styles.placeholder
              )}
            >
              {displayOption === null ? placeholder : displayOption.label}
            </span>
          </button>
        </FieldShell>
      )}
    </FormControl>
  );

  return (
    <>
      {name ? (
        <input name={name} type="hidden" value={value ?? ""} />
      ) : null}
      <SelectPanel
        listboxId={listboxId}
        messages={messages}
        multiple={false}
        onOpenChange={handleOpenChange}
        open={open}
        trigger={trigger}
        focusTriggerRef={triggerRef}
        skipFocusRestoreRef={skipFocusRestoreRef}
        triggerRef={floatingReferenceRef}
      >
        <SelectListboxView<Value>
          activeRowId={state.activeRow?.rowId ?? null}
          listboxId={listboxId}
          messages={messages}
          multiple={false}
          onHoverRow={(row) => state.setActiveRow(row)}
          onKeyDown={(event) => {
            if (event.key === "Tab") skipFocusRestoreRef.current = true;
            state.handleListKeyDown(event, commit);
          }}
          onPickRow={commit}
          onRetry={state.onRetry}
          rows={state.collection.rows}
          selectedValues={selectedValues}
          status={state.status}
          statusMessage={
            state.status === "empty" && emptyMessage != null
              ? emptyMessage
              : state.status === "loading" && loadingMessage != null
                ? loadingMessage
                : state.statusMessage
          }
        />
      </SelectPanel>
    </>
  );
}) as <Value extends string = string>(
  props: SelectProps<Value> & { ref?: React.ForwardedRef<HTMLElement> }
) => React.ReactElement;
