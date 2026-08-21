import { ChevronDown, Search, X } from "lucide-react";
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
  type ReactElement,
  type ReactNode
} from "react";
import { FieldShell } from "../FieldShell/FieldShell";
import { FormControl } from "../FormControl/FormControl";
import { IconButton } from "../IconButton/IconButton";
import { Input } from "../Input/Input";
import { Spinner } from "../Spinner/Spinner";
import type { FieldLabelView, FieldSize } from "../shared/field";
import { classNames } from "../shared/classNames";
import {
  type SelectCollectionItem,
  type SelectInteractiveRow,
  type SelectOption,
  type SelectValue,
  getSelectValueIdentity,
  normalizeSelectCollection
} from "../internal/select/collection";
import { resolveSelectMessages } from "../internal/select/messages";
import { SelectListboxView } from "../internal/select/SelectListboxView";
import { SelectPanel } from "../internal/select/SelectPanel";
import type {
  SelectCollectionState,
  SelectSearchProps
} from "../internal/select/types";
import { useSelectSearch } from "../internal/select/search";
import { useSelectState } from "../internal/select/useSelectState";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import triggerStyles from "../internal/select/SelectTrigger.module.css";
import styles from "./MultiSelect.module.css";
import {
  compactChipTextClassName,
  fieldValueOpticalClassNames,
  fieldValueTypographyClassNames
} from "../internal/single-line-control-typography/singleLineControlTypography";

const fieldValueRoleNames: Record<FieldSize, string> = {
  sm: "fieldValueTextSm",
  md: "fieldValueTextMd",
  lg: "fieldValueTextLg"
};

export interface MultiSelectProps<Value extends SelectValue = string> {
  value: Value[];
  onChange: (value: Value[]) => void;
  items: readonly SelectCollectionItem<Value>[];
  selectedItems?: readonly SelectOption<Value>[] | undefined;
  collectionState?: SelectCollectionState | undefined;
  searchable?: boolean;
  searchProps?: SelectSearchProps;
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
  block?: boolean;
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
  Value extends SelectValue
>(
  {
    value,
    onChange,
    items,
    selectedItems,
    collectionState,
    searchable = false,
    searchProps,
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
    block = false,
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

  const interactive = !disabled && !readOnly;
  const isControlledOpen = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const requestedOpen = isControlledOpen ? controlledOpen : uncontrolledOpen;
  const open = interactive ? requestedOpen : false;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && !interactive) return;
      if (!isControlledOpen) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [interactive, isControlledOpen, onOpenChange]
  );

  useEffect(() => {
    if (interactive || !requestedOpen) return;
    if (!isControlledOpen) setUncontrolledOpen(false);
    onOpenChange?.(false);
  }, [interactive, isControlledOpen, onOpenChange, requestedOpen]);

  const search = useSelectSearch(items, searchable, searchProps);
  const state = useSelectState<Value>({
    items: search.visibleItems,
    collectionState,
    open,
    onOpenChange: setOpen,
    locale: resolvedLocale
  });

  const listboxId = useId();
  const selectedSummaryId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const skipFocusRestoreRef = useRef(false);
  const viewportRef = useRef<HTMLSpanElement | null>(null);
  const sizerRef = useRef<HTMLSpanElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const firstEnabledActionRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => triggerRef.current as HTMLElement, []);

  const unfilteredCollection = search.visibleItems === items
    ? state.collection
    : null;
  const collection = useMemo(
    () => unfilteredCollection ?? normalizeSelectCollection(items),
    [items, unfilteredCollection]
  );
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
  const hasEnabledActions = state.collection.actionFocusItems.length > 0;

  const invalid = error != null;
  const compactInnerSummary = labelView === "inner" && size !== "lg";
  const showClear = clearable
    && !disabled
    && !readOnly
    && !required
    && value.length > 0;
  const loading = collectionState?.status === "loading";
  const refreshing = collectionState?.status === "refreshing";
  const showClearButton = showClear && !loading;
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) search.resetQuery();
    if (nextOpen) setActiveTagIndex(null);
    setOpen(nextOpen);
  }, [search.resetQuery, setOpen]);

  const commit = useCallback(
    (row: SelectInteractiveRow<Value>) => {
      if (row.disabled) return;
      if (row.type === "action") {
        skipFocusRestoreRef.current = true;
        handleOpenChange(false);
        row.action.onSelect();
        return;
      }
      const optionValue = row.option.value;
      const nextValues = selectedValues.has(optionValue)
        ? value.filter((entry) => entry !== optionValue)
        : [...value, optionValue];
      onChange(nextValues);
      search.resetQuery();
      // Multi stays open by design.
    }, [handleOpenChange, onChange, search.resetQuery, selectedValues, value]
  );

  const removeValue = useCallback(
    (entry: Value) => {
      onChange(value.filter((candidate) => candidate !== entry));
    },
    [onChange, value]
  );

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (!interactive) return;
    if (!open && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      if (value.length === 0) return;
      event.preventDefault();
      setActiveTagIndex((current) => {
        if (current === null) return event.key === "ArrowLeft" ? value.length - 1 : 0;
        const delta = event.key === "ArrowLeft" ? -1 : 1;
        return (current + delta + value.length) % value.length;
      });
      return;
    }
    if (
      !open
      && (event.key === "Backspace" || event.key === "Delete")
      && value.length > 0
    ) {
      if (activeTagIndex === null && event.key === "Delete") return;
      event.preventDefault();
      const removeIndex = activeTagIndex ?? value.length - 1;
      removeValue(value[removeIndex] as Value);
      setActiveTagIndex(
        value.length <= 1 ? null : Math.min(removeIndex, value.length - 2)
      );
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

  const searchField = searchable ? (
    <Input
      aria-label={messages.search}
      onChange={(event) => search.setQuery(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          handleOpenChange(false);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!state.activeRow) state.moveActive("first");
          listboxRef.current?.focus();
        } else if (event.key === "Enter" && state.activeRow) {
          event.preventDefault();
          commit(state.activeRow);
        }
      }}
      placeholder={searchProps?.placeholder ?? messages.searchPlaceholder}
      readOnly={search.queryReadOnly}
      ref={searchRef}
      size="sm"
      startAdornment={<Search />}
      value={search.query}
    />
  ) : null;

  // Tag overflow: fit as many tags as the trigger width allows, reserving
  // room for the "+N" indicator. Measurement runs against a hidden sizer so
  // the public API stays free of maxTags-style layout props.
  const [visibleCount, setVisibleCount] = useState(value.length);

  useLayoutEffect(() => {
    if (compactInnerSummary || value.length === 0) {
      setVisibleCount(0);
      return;
    }
    const viewport = viewportRef.current;
    const sizer = sizerRef.current;
    if (!viewport || !sizer) return;

    const measure = () => {
      const available = viewport.clientWidth;
      if (available <= 0 || value.length === 0) {
        setVisibleCount(value.length);
        return;
      }
      const tag = sizer.querySelector<HTMLElement>("[data-measure-tag]");
      const label = sizer.querySelector<HTMLElement>("[data-measure-label]");
      const overflow = sizer.querySelector<HTMLElement>("[data-measure-overflow]");
      if (!tag || !label || !overflow) return;
      const gap = parseFloat(window.getComputedStyle(sizer).columnGap) || 0;

      const measureTagWidth = (text: string) => {
        label.textContent = text;
        return tag.getBoundingClientRect().width;
      };

      const overflowWidth = (count: number) => {
        overflow.textContent = "+" + count;
        return overflow.getBoundingClientRect().width + gap;
      };

      let used = 0;
      let fitted = 0;
      for (let index = 0; index < value.length; index += 1) {
        const entry = displayByValue.get(value[index] as Value);
        const tagWidth = measureTagWidth(entry?.textValue ?? "") + gap;
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
  }, [compactInnerSummary, displayByValue, value]);

  useEffect(() => {
    setVisibleCount((count) => Math.min(count, value.length));
  }, [value.length]);

  const visibleTags = compactInnerSummary ? [] : value.slice(0, visibleCount);
  const overflowCount = value.length - visibleTags.length;

  const renderPanel = (triggerElement: ReactElement) => (
    <SelectPanel
      outsidePressBoundaryRef={shellRef}
      geometryReferenceRef={shellRef}
      messages={messages}
      multiple
      onOpenChange={handleOpenChange}
      open={open}
      trigger={triggerElement}
      focusTriggerRef={triggerRef}
      skipFocusRestoreRef={skipFocusRestoreRef}
      header={searchField}
      initialFocusRef={searchable
        ? searchRef
        : hasEnabledActions
          ? firstEnabledActionRef
          : listboxRef}
      interactive={interactive}
    >
      <SelectListboxView<Value>
        activeRowId={state.activeRow?.rowId ?? null}
        choiceIndicatorSize={size === "sm" ? "sm" : "md"}
        listboxId={listboxId}
        messages={messages}
        multiple
        firstEnabledActionRef={firstEnabledActionRef}
        onHoverRow={(row) => state.setActiveRow(row)}
        onKeyDown={(event) => state.handleListKeyDown(event, commit)}
        onPickRow={commit}
        onRetry={state.onRetry}
        rows={state.collection.rows}
        selectedValues={selectedValues}
        status={state.status}
        statusMessage={
          state.status === "empty" && emptyMessage != null
            ? emptyMessage
            : state.status === "empty" && search.query.length > 0
              ? messages.noResults
            : state.status === "loading" && loadingMessage != null
              ? loadingMessage
              : state.statusMessage
        }
        autoFocus={false}
        ref={listboxRef}
      />
    </SelectPanel>
  );

  const trigger = (
    <FormControl
      block={block}
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
          endAdornment={showClearButton ? (
            <span className={triggerStyles.actions}>
              <IconButton
                aria-label={messages.clear}
                data-multiselect-clear=""
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
            </span>
          ) : undefined}
          invalid={invalid}
          label={controlLabel}
          labelFloated={open || value.length > 0}
          labelView={labelView}
          onFocusRequest={() => {
            triggerRef.current?.focus();
            if (interactive) triggerRef.current?.click();
          }}
          readOnly={readOnly}
          ref={shellRef}
          size={size}
        >
          <span className={classNames(
            styles.multiControl
          )}>
            {renderPanel(<button
              {...controlProps}
              aria-controls={open ? listboxId : undefined}
              aria-describedby={value.length > 0
                ? [controlProps["aria-describedby"], selectedSummaryId]
                  .filter(Boolean)
                  .join(" ")
                : controlProps["aria-describedby"]}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-busy={loading || refreshing ? true : undefined}
              aria-label={ariaLabel}
              className={classNames(triggerStyles.value, styles.openTrigger)}
              data-multiselect-trigger=""
              data-field-part="native-control"
              disabled={disabled}
              onKeyDown={handleTriggerKeyDown}
              ref={(node) => {
                triggerRef.current = node;
              }}
              type="button"
            >
              {value.length > 0 ? (
                <span className={styles.srOnly} id={selectedSummaryId}>
                  {messages.selectedSummary(value.map((entry) =>
                    displayByValue.get(entry)?.textValue ?? String(entry)
                  ))}
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className={styles.triggerStatus}
                data-field-vertical-invariant=""
              >
                {loading || refreshing ? (
                  <Spinner
                    data-select-spinner=""
                    size={size === "lg" ? "md" : "sm"}
                    tone="secondary"
                  />
                ) : null}
                {!loading ? <span
                  aria-hidden="true"
                  className={classNames(
                    triggerStyles.chevron,
                    open && triggerStyles.chevronOpen
                  )}
                  data-multiselect-chevron=""
                >
                  <ChevronDown />
                </span> : null}
              </span>
            </button>)}
            <span
              className={styles.tagViewport}
              data-field-selection-presentation={
                value.length === 0
                  ? "empty"
                  : compactInnerSummary
                    ? "summary"
                    : "chips"
              }
              ref={viewportRef}
            >
              {value.length === 0 ? (
                <span
                  aria-hidden="true"
                  className={styles.placeholder}
                  data-control-text-clip=""
                  data-field-placeholder=""
                >
                  <span
                    className={classNames(
                      fieldValueTypographyClassNames[size],
                      fieldValueOpticalClassNames[size]
                    )}
                    data-control-text-role={fieldValueRoleNames[size]}
                    data-field-value-optical=""
                    data-field-value-typography=""
                  >{placeholder}</span>
                </span>
              ) : compactInnerSummary ? (
                <span aria-hidden="true" className={styles.compactSummary} data-control-text-clip="">
                  <span
                    className={classNames(
                      fieldValueTypographyClassNames[size],
                      fieldValueOpticalClassNames[size]
                    )}
                    data-control-text-role={fieldValueRoleNames[size]}
                    data-field-value-optical=""
                    data-field-value-typography=""
                  >{messages.selectedCount(value.length)}</span>
                </span>
              ) : (
                <>
                  {visibleTags.map((entry) => {
                    const display = displayByValue.get(entry);
                    return (
                      <span
                        className={classNames(
                          styles.tag,
                          disabled && styles.disabledTag,
                          value.indexOf(entry) === activeTagIndex && styles.activeTag
                        )}
                        data-field-chip=""
                        key={getSelectValueIdentity(entry)}
                      >
                        <span aria-hidden="true" className={styles.tagLabel} data-control-text-clip="">
                          <span
                            className={classNames(styles.labelText, compactChipTextClassName)}
                            data-compact-chip-text=""
                            data-control-text-role="compactChipText"
                          >{display?.label}</span>
                        </span>
                        {interactive ? (
                          <button
                            aria-label={messages.remove(
                              display?.textValue ?? String(entry)
                            )}
                            className={styles.tagRemove}
                            data-field-chip-remove=""
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeValue(entry);
                            }}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            tabIndex={-1}
                          >
                            <X aria-hidden="true" />
                          </button>
                        ) : null}
                      </span>
                    );
                  })}
                  {overflowCount > 0 ? (
                    <span
                      aria-hidden="true"
                      className={classNames(styles.overflow, compactChipTextClassName)}
                      data-control-text-role="compactChipText"
                    >
                      {"+" + overflowCount}
                    </span>
                  ) : null}
                </>
              )}
            </span>
            {compactInnerSummary || value.length === 0 ? null : (
              <span
                aria-hidden="true"
                className={styles.sizer}
                ref={sizerRef}
              >
                <span className={classNames(styles.tag, styles.measureTag)} data-measure-tag="">
                  <span className={styles.tagLabel} data-measure-label=""><span className={classNames(styles.labelText, compactChipTextClassName)} /></span>
                  {interactive ? (
                    <span className={styles.tagRemove}>
                      <X aria-hidden="true" />
                    </span>
                  ) : null}
                </span>
                <span className={classNames(styles.overflow, compactChipTextClassName)} data-measure-overflow="" />
              </span>
            )}
          </span>
        </FieldShell>
      )}
    </FormControl>
  );

  return (
    <>
      {name ? value.map((entry) => (
        <input
          key={getSelectValueIdentity(entry)}
          name={name}
          type="hidden"
          value={entry}
        />
      )) : null}
      {trigger}
    </>
  );
}) as <Value extends SelectValue = string>(
  props: MultiSelectProps<Value> & { ref?: React.ForwardedRef<HTMLElement> }
) => React.ReactElement;
