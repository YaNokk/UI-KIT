import { ChevronDown, Search, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
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
import styles from "../internal/select/SelectTrigger.module.css";
import {
  fieldValueOpticalClassNames,
  fieldValueTypographyClassNames
} from "../internal/single-line-control-typography/singleLineControlTypography";

const textRoleNames: Record<FieldSize, string> = {
  sm: "fieldValueTextSm",
  md: "fieldValueTextMd",
  lg: "fieldValueTextLg"
};

export interface SelectProps<Value extends string = string> {
  value: Value | null;
  onChange: (value: Value | null) => void;
  items: readonly SelectCollectionItem<Value>[];
  selectedItem?: SelectOption<Value> | undefined;
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

export const Select = forwardRef(function SelectInner<Value extends string>(
  {
    value,
    onChange,
    items,
    selectedItem,
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const skipFocusRestoreRef = useRef(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
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
  const hasEnabledActions = state.collection.actionFocusItems.length > 0;

  const invalid = error != null;
  const showClear = clearable
    && !disabled
    && !readOnly
    && !required
    && value !== null;
  const loading = collectionState?.status === "loading";
  const refreshing = collectionState?.status === "refreshing";
  const showClearButton = showClear && !loading;

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) search.resetQuery();
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
      onChange(row.option.value);
      handleOpenChange(false);
    }, [handleOpenChange, onChange]
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

  const renderPanel = (triggerElement: ReactElement) => (
    <SelectPanel
      outsidePressBoundaryRef={shellRef}
      geometryReferenceRef={shellRef}
      messages={messages}
      multiple={false}
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
        listboxId={listboxId}
        messages={messages}
        multiple={false}
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
            <span className={styles.actions}>
              <IconButton
                aria-label={messages.clear}
                data-select-clear=""
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
          labelFloated={open || value !== null}
          labelView={labelView}
          onFocusRequest={() => {
            triggerRef.current?.focus();
            if (interactive) triggerRef.current?.click();
          }}
          readOnly={readOnly}
          ref={shellRef}
          size={size}
          startAdornment={displayOption?.leading == null ? undefined : (
            <span aria-hidden="true">{displayOption.leading}</span>
          )}
        >
          {renderPanel(<button
            {...controlProps}
            aria-controls={open ? listboxId : undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-busy={loading || refreshing ? true : undefined}
            aria-label={ariaLabel}
            className={styles.value}
            data-select-trigger=""
            data-field-part="native-control"
            disabled={disabled}
            onKeyDown={handleTriggerKeyDown}
            ref={(node) => {
              triggerRef.current = node;
            }}
            type="button"
          >
            <span className={styles.valueContent}>
              <span
                className={classNames(
                  styles.valueText,
                  displayOption === null && styles.placeholder
                )}
                data-field-placeholder={displayOption === null ? "" : undefined}
                data-control-text-clip=""
              >
                <span
                  className={classNames(
                    styles.valueLabel,
                    fieldValueTypographyClassNames[size],
                    fieldValueOpticalClassNames[size]
                  )}
                  data-control-text=""
                  data-control-text-role={textRoleNames[size]}
                  data-field-value-optical=""
                  data-field-value-typography=""
                >{displayOption === null ? placeholder : displayOption.label}</span>
              </span>
            </span>
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
                  styles.chevron,
                  open && styles.chevronOpen
                )}
                data-select-chevron=""
              >
                <ChevronDown />
              </span> : null}
            </span>
          </button>)}
        </FieldShell>
      )}
    </FormControl>
  );

  return (
    <>
      {name ? (
        <input name={name} type="hidden" value={value ?? ""} />
      ) : null}
      {trigger}
    </>
  );
}) as <Value extends string = string>(
  props: SelectProps<Value> & { ref?: React.ForwardedRef<HTMLElement> }
) => React.ReactElement;
