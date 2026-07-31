import { ChevronDown, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
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
import type {
  SelectCollectionItem,
  SelectNavigableRow,
  SelectOption
} from "../internal/select/collection";
import { resolveSelectMessages } from "../internal/select/messages";
import { SelectListboxView } from "../internal/select/SelectListboxView";
import { SelectPanel } from "../internal/select/SelectPanel";
import type { SelectCollectionState } from "../internal/select/types";
import { useSelectState } from "../internal/select/useSelectState";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import triggerStyles from "../internal/select/SelectTrigger.module.css";
import styles from "./MultiSelect.module.css";

export interface MultiSelectProps<Value extends string = string> {
  value: Value[];
  onChange: (value: Value[]) => void;
  items: readonly SelectCollectionItem<Value>[];
  selectedItems?: readonly SelectOption<Value>[] | undefined;
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

interface DisplayEntry {
  label: ReactNode;
  textValue: string;
}

export const MultiSelect = forwardRef(function MultiSelectInner<
  Value extends string
>(
  {
    value,
    onChange,
    items,
    selectedItems,
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
  }: MultiSelectProps<Value>,
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
  const viewportRef = useRef<HTMLSpanElement | null>(null);
  const sizerRef = useRef<HTMLSpanElement | null>(null);

  useImperativeHandle(ref, () => triggerRef.current as HTMLElement, []);

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
  const cacheByValue = useMemo(() => {
    const map = new Map<Value, SelectOption<Value>>();
    for (const option of selectedItems ?? []) map.set(option.value, option);
    return map;
  }, [selectedItems]);

  const displayByValue = useMemo(() => {
    const map = new Map<Value, DisplayEntry>();
    const missing: Value[] = [];
    for (const entry of value) {
      const inCollection = collection.optionRowByValue.get(entry);
      if (inCollection) {
        map.set(entry, {
          label: inCollection.option.label,
          textValue: inCollection.option.textValue
        });
        continue;
      }
      const cached = cacheByValue.get(entry);
      if (cached) {
        map.set(entry, { label: cached.label, textValue: cached.textValue });
        continue;
      }
      missing.push(entry);
      map.set(entry, { label: String(entry), textValue: String(entry) });
    }
    if (missing.length > 0 && process.env.NODE_ENV !== "production") {
      console.warn(
        "[MultiSelect] Selected values " + missing.join(", ")
          + " are not present in items and have no selectedItems cache; "
          + "falling back to raw values."
      );
    }
    return map;
  }, [cacheByValue, collection, value]);

  const selectedValues = useMemo<ReadonlySet<Value>>(
    () => new Set(value),
    [value]
  );

  const invalid = error != null;
  const interactive = !disabled && !readOnly;
  const showClear = clearable && !disabled && !required && value.length > 0;

  const commit = useCallback(
    (row: SelectNavigableRow<Value>) => {
      if (row.disabled) return;
      if (row.type === "action") {
        row.action.onSelect();
        setOpen(false);
        return;
      }
      const optionValue = row.option.value;
      const nextValues = selectedValues.has(optionValue)
        ? value.filter((entry) => entry !== optionValue)
        : [...value, optionValue];
      onChange(nextValues);
      // Multi stays open by design.
    },
    [onChange, selectedValues, setOpen, value]
  );

  const removeValue = useCallback(
    (entry: Value) => {
      onChange(value.filter((candidate) => candidate !== entry));
    },
    [onChange, value]
  );

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (!interactive) return;
    if (
      !open
      && (event.key === "Backspace" || event.key === "Delete")
      && value.length > 0
    ) {
      event.preventDefault();
      removeValue(value[value.length - 1] as Value);
      return;
    }
    if (!open) {
      state.handleTriggerKeyDown(event, commit);
      if (
        event.key === "Enter"
        || event.key === " "
        || event.key === "ArrowDown"
      ) {
        state.openWithSelection(value);
      }
      return;
    }
    state.handleListKeyDown(event, commit);
  };

  const handleClear = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!showClear) return;
    onChange([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) updateTriggerInlineSize();
    setOpen(nextOpen);
  };

  // Tag overflow: fit as many tags as the trigger width allows, reserving
  // room for the "+N" indicator. Measurement runs against a hidden sizer so
  // the public API stays free of maxTags-style layout props.
  const [visibleCount, setVisibleCount] = useState(value.length);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const sizer = sizerRef.current;
    if (!viewport || !sizer) return;

    const measure = () => {
      const available = viewport.clientWidth;
      if (available <= 0 || value.length === 0) {
        setVisibleCount(value.length);
        return;
      }
      const computed = window.getComputedStyle(sizer);
      const gap = parseFloat(computed.columnGap || "0") || 4;

      const measureWidth = (text: string) => {
        sizer.textContent = text;
        return sizer.offsetWidth;
      };

      const overflowWidth = (count: number) =>
        measureWidth("+" + count) + gap;

      let used = 0;
      let fitted = 0;
      for (let index = 0; index < value.length; index += 1) {
        const entry = displayByValue.get(value[index] as Value);
        const tagWidth = measureWidth(entry?.textValue ?? "") + gap + 24;
        const remaining = value.length - index - 1;
        const reserve = remaining > 0 ? overflowWidth(remaining) : 0;
        if (used + tagWidth + reserve <= available) {
          used += tagWidth;
          fitted += 1;
        } else {
          break;
        }
      }
      setVisibleCount(fitted);
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [displayByValue, value]);

  useEffect(() => {
    setVisibleCount((count) => Math.min(count, value.length));
  }, [value.length]);

  const visibleTags = value.slice(0, visibleCount);
  const overflowCount = value.length - visibleTags.length;

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
            <span className={triggerStyles.actions} data-field-interactive="">
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
                  triggerStyles.chevron,
                  open && triggerStyles.chevronOpen
                )}
              >
                <ChevronDown />
              </span>
            </span>
          }
          invalid={invalid}
          label={controlLabel}
          labelFloated={open || value.length > 0}
          labelView={labelView}
          onFocusRequest={() => triggerRef.current?.focus()}
          readOnly={readOnly}
          size={size}
        >
          <span className={styles.multiControl}>
            <button
              {...controlProps}
              aria-controls={open ? listboxId : undefined}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-label={ariaLabel}
              className={classNames(triggerStyles.value, styles.openTrigger)}
              data-field-part="native-control"
              disabled={disabled}
              onKeyDown={handleTriggerKeyDown}
              ref={(node) => {
                triggerRef.current = node;
              }}
              type="button"
            />
            <span className={styles.tagViewport} ref={viewportRef}>
              {value.length === 0 ? (
                <span aria-hidden="true" className={styles.placeholder}>
                  {placeholder}
                </span>
              ) : (
                <>
                  {visibleTags.map((entry) => {
                    const display = displayByValue.get(entry);
                    return (
                      <span className={styles.tag} key={entry}>
                        <span aria-hidden="true" className={styles.tagLabel}>
                          {display?.label}
                        </span>
                        {interactive ? (
                          <IconButton
                            aria-label={messages.remove(
                              display?.textValue ?? String(entry)
                            )}
                            className={styles.tagRemove}
                            icon={<X />}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeValue(entry);
                            }}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            size="sm"
                            tabIndex={-1}
                            variant="ghost"
                          />
                        ) : null}
                      </span>
                    );
                  })}
                  {overflowCount > 0 ? (
                    <span aria-hidden="true" className={styles.overflow}>
                      {"+" + overflowCount}
                    </span>
                  ) : null}
                </>
              )}
            </span>
            <span
              aria-hidden="true"
              className={styles.sizer}
              ref={sizerRef}
            >
              <span className={styles.measureTag} />
            </span>
          </span>
        </FieldShell>
      )}
    </FormControl>
  );

  return (
    <>
      {name ? (
        <input name={name} type="hidden" value={value.join(",")} />
      ) : null}
      <SelectPanel
        listboxId={listboxId}
        messages={messages}
        multiple
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
          multiple
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
  props: MultiSelectProps<Value> & { ref?: React.ForwardedRef<HTMLElement> }
) => React.ReactElement;
