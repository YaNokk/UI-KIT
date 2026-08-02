import { ChevronDown, Globe2, Search } from "lucide-react";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject
} from "react";
import { Input } from "../../Input/Input";
import type { PhoneCountryCode } from "../../internal/phone/phone-number-adapter";
import type { SelectInteractiveRow, SelectOption } from "../../internal/select/collection";
import { resolveSelectMessages } from "../../internal/select/messages";
import { useSelectSearch } from "../../internal/select/search";
import { SelectListboxView } from "../../internal/select/SelectListboxView";
import { SelectPanel } from "../../internal/select/SelectPanel";
import { useSelectState } from "../../internal/select/useSelectState";
import { classNames } from "../../shared/classNames";
import styles from "../InternationalPhoneInput.module.css";
import { CountryFlag } from "./CountryFlag";
import type { PhoneCountry } from "./phone-country-data";

export interface CountryPickerProps {
  countries: readonly PhoneCountry[];
  country: PhoneCountryCode | null;
  disabled: boolean;
  fieldRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  locale: string;
  noCountriesText: string;
  onChange: (country: PhoneCountryCode) => void;
  pickerLabel: string;
  searchPlaceholder: string;
}

export function CountryPicker({
  countries,
  country,
  disabled,
  fieldRef,
  inputRef,
  locale,
  noCountriesText,
  onChange,
  pickerLabel,
  searchPlaceholder
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const skipFocusRestoreRef = useRef(false);
  const items = useMemo<SelectOption<PhoneCountryCode>[]>(
    () => countries.map((item) => ({
      value: item.iso2,
      label: item.displayName,
      textValue: item.textValue,
      leading: <CountryFlag country={item.iso2} />,
      trailing: `+${item.callingCode}`
    })),
    [countries]
  );
  const search = useSelectSearch(items, true, {
    placeholder: searchPlaceholder,
    filter: (text, query) => text.toLocaleLowerCase(locale).includes(
      query.toLocaleLowerCase(locale)
    )
  });
  const state = useSelectState<PhoneCountryCode>({
    items: search.visibleItems,
    open,
    onOpenChange: setOpen,
    locale
  });
  const baseMessages = useMemo(() => resolveSelectMessages(locale), [locale]);
  const messages = useMemo(() => ({
    ...baseMessages,
    empty: noCountriesText,
    noResults: noCountriesText,
    searchPlaceholder,
    sheetTitle: pickerLabel
  }), [baseMessages, noCountriesText, pickerLabel, searchPlaceholder]);
  const selectedValues = useMemo<ReadonlySet<PhoneCountryCode>>(
    () => new Set(country === null ? [] : [country]),
    [country]
  );
  const current = countries.find((item) => item.iso2 === country) ?? null;
  const interactive = !disabled && countries.length > 1;

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen && !interactive) return;
    if (!nextOpen) search.resetQuery();
    setOpen(nextOpen);
  }, [interactive, search.resetQuery]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const length = inputRef.current?.value.length ?? 0;
      inputRef.current?.setSelectionRange(length, length);
    });
  }, [inputRef]);

  const commit = useCallback((row: SelectInteractiveRow<PhoneCountryCode>) => {
    if (row.type !== "option" || row.disabled) return;
    skipFocusRestoreRef.current = true;
    onChange(row.option.value);
    handleOpenChange(false);
    focusInput();
  }, [focusInput, handleOpenChange, onChange]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    if (open) {
      state.handleListKeyDown(event, commit);
      return;
    }
    state.handleTriggerKeyDown(event, commit);
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      state.openWithSelection(country === null ? [] : [country], event.key === "ArrowUp");
    }
  };

  const triggerLabel = current === null
    ? pickerLabel
    : `${pickerLabel}: ${current.displayName}, +${current.callingCode}`;
  const trigger = (
    <button
      aria-controls={listboxId}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={triggerLabel}
      className={styles.countryTrigger}
      data-field-interactive=""
      disabled={!interactive}
      onKeyDown={handleTriggerKeyDown}
      ref={triggerRef}
      type="button"
    >
      {current === null ? <Globe2 /> : <CountryFlag country={current.iso2} />}
      {interactive ? (
        <ChevronDown
          aria-hidden="true"
          className={classNames(styles.chevron, open && styles.chevronOpen)}
        />
      ) : null}
    </button>
  );
  const searchField = (
    <Input
      aria-label={messages.search}
      onChange={(event) => search.setQuery(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          handleOpenChange(false);
          focusInput();
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!state.activeRow) state.moveActive("first");
          listboxRef.current?.focus();
        } else if (event.key === "Enter" && state.activeRow) {
          event.preventDefault();
          commit(state.activeRow);
        }
      }}
      placeholder={searchPlaceholder}
      ref={searchRef}
      size="sm"
      startAdornment={<Search />}
      value={search.query}
    />
  );

  return (
    <SelectPanel
      geometryReferenceRef={fieldRef}
      focusTriggerRef={triggerRef}
      header={searchField}
      initialFocusRef={searchRef}
      interactive={interactive}
      messages={messages}
      multiple={false}
      onOpenChange={handleOpenChange}
      open={open}
      panelClassName={styles.countryPanel}
      skipFocusRestoreRef={skipFocusRestoreRef}
      trigger={trigger}
    >
      <SelectListboxView<PhoneCountryCode>
        activeRowId={state.activeRow?.rowId ?? null}
        autoFocus={false}
        listboxId={listboxId}
        messages={messages}
        multiple={false}
        onHoverRow={state.setActiveRow}
        onKeyDown={(event) => state.handleListKeyDown(event, commit)}
        onPickRow={commit}
        onRetry={state.onRetry}
        ref={listboxRef}
        rows={state.collection.rows}
        selectedValues={selectedValues}
        status={state.status}
        statusMessage={state.status === "empty" ? noCountriesText : state.statusMessage}
      />
    </SelectPanel>
  );
}
