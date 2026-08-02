import { X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type ReactNode
} from "react";
import { FieldShell } from "../FieldShell/FieldShell";
import { FormControl } from "../FormControl/FormControl";
import { IconButton } from "../IconButton/IconButton";
import type { InputProps } from "../Input/Input";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import { createPhoneMask } from "../internal/phone/phone-mask";
import {
  detectPhoneCountry,
  formatPhoneValue,
  getCountryCallingCode,
  normalizePhoneValue,
  parsePhoneValue,
  replacePhoneCountry,
  type PhoneCountryCode
} from "../internal/phone/phone-number-adapter";
import { usePhoneInputMask } from "../internal/phone/usePhoneInputMask";
import { fieldValueTypographyClassNames } from "../internal/single-line-control-typography/singleLineControlTypography";
import { classNames } from "../shared/classNames";
import type { FieldSize } from "../shared/field";
import styles from "./InternationalPhoneInput.module.css";
import { CountryPicker } from "./internal/CountryPicker";
import { getPhoneCountryData } from "./internal/phone-country-data";

export type { PhoneCountryCode };

export type PhoneValueChangeSource =
  | "input"
  | "paste"
  | "country"
  | "clear"
  | "external";

export interface PhoneValueChangeMeta {
  country: PhoneCountryCode | null;
  callingCode: string | null;
  formattedValue: string;
  nationalNumber: string;
  isPossible: boolean;
  isValid: boolean;
  source: PhoneValueChangeSource;
}

export interface PhoneCountryChangeMeta {
  previousCountry: PhoneCountryCode | null;
  source: "number" | "country-picker" | "external" | "clear";
}

export interface InternationalPhoneInputProps
  extends Omit<
    InputProps,
    | "defaultValue"
    | "inputMode"
    | "onChange"
    | "startAdornment"
    | "type"
    | "value"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, meta: PhoneValueChangeMeta) => void;
  country?: PhoneCountryCode | null;
  defaultCountry?: PhoneCountryCode;
  onCountryChange?: (
    country: PhoneCountryCode | null,
    meta: PhoneCountryChangeMeta
  ) => void;
  countries?: readonly PhoneCountryCode[];
  countryPickerLabel?: string;
  countrySearchPlaceholder?: string;
  noCountriesText?: string;
  clearable?: boolean;
  clearLabel?: string;
  preserveCountryCallingCode?: boolean;
  locale?: string;
}

const valueRoleNames: Record<FieldSize, string> = {
  sm: "fieldValueTextSm",
  md: "fieldValueTextMd",
  lg: "fieldValueTextLg"
};

function localizedDefaults(locale: string) {
  const russian = locale.toLowerCase().startsWith("ru");
  return russian
    ? {
        clear: "Очистить номер телефона",
        noCountries: "Страны не найдены",
        picker: "Выбрать страну",
        search: "Поиск страны"
      }
    : {
        clear: "Clear phone number",
        noCountries: "No countries found",
        picker: "Choose country",
        search: "Search countries"
      };
}

export const InternationalPhoneInput = forwardRef<
  HTMLInputElement,
  InternationalPhoneInputProps
>(function InternationalPhoneInput(
  {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    autoComplete = "tel",
    className,
    clearable = true,
    clearLabel,
    countries,
    country: controlledCountry,
    countryPickerLabel,
    countrySearchPlaceholder,
    defaultCountry,
    defaultValue = "",
    disabled = false,
    endAdornment,
    error,
    hint,
    id,
    label,
    labelView = "outer",
    locale,
    noCountriesText,
    onBlur,
    onCountryChange,
    onFocus,
    onValueChange,
    preserveCountryCallingCode = true,
    readOnly = false,
    required = false,
    size = "md",
    value: controlledValue,
    ...nativeProps
  },
  forwardedRef
) {
  const resolvedLocale = useResolvedLocale(locale);
  const messages = useMemo(() => localizedDefaults(resolvedLocale), [resolvedLocale]);
  const countryData = useMemo(
    () => getPhoneCountryData(resolvedLocale, countries),
    [countries, resolvedLocale]
  );
  const allowedCountries = useMemo(
    () => countryData.map((item) => item.iso2),
    [countryData]
  );
  const normalizedDefaultCountry = defaultCountry?.toUpperCase();
  const firstCountry = countryData[0]?.iso2 ?? null;
  const initialCountry = normalizedDefaultCountry
    && allowedCountries.includes(normalizedDefaultCountry)
    ? normalizedDefaultCountry
    : firstCountry;
  const [internalCountry, setInternalCountry] = useState<PhoneCountryCode | null>(
    initialCountry
  );
  const valueControlled = controlledValue !== undefined;
  const countryControlled = controlledCountry !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    normalizePhoneValue(defaultValue, initialCountry)
  );
  const semanticValue = valueControlled
    ? normalizePhoneValue(controlledValue, controlledCountry ?? internalCountry)
    : internalValue;
  const detectedCountry = semanticValue === ""
    ? null
    : detectPhoneCountry(semanticValue, allowedCountries);
  const normalizedControlledCountry = controlledCountry?.toUpperCase() ?? null;
  const effectiveCountry = countryControlled
    ? (normalizedControlledCountry !== null
      && allowedCountries.includes(normalizedControlledCountry)
        ? normalizedControlledCountry
        : null)
    : detectedCountry
      ?? (internalCountry !== null && allowedCountries.includes(internalCountry)
        ? internalCountry
        : null)
      ?? (normalizedDefaultCountry
        && allowedCountries.includes(normalizedDefaultCountry)
          ? normalizedDefaultCountry
          : null)
      ?? firstCountry;
  const [displayValue, setDisplayValue] = useState(() =>
    formatPhoneValue(semanticValue, effectiveCountry)
  );
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const lastExternalValue = useRef(semanticValue);
  const maskOptions = useMemo(() => createPhoneMask(effectiveCountry), [effectiveCountry]);
  const maskRef = usePhoneInputMask(maskOptions);

  useEffect(() => {
    setDisplayValue(formatPhoneValue(semanticValue, effectiveCountry));
  }, [effectiveCountry, semanticValue]);

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    maskRef(node);
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef, maskRef]);

  const emitValue = useCallback((
    nextValue: string,
    nextCountry: PhoneCountryCode | null,
    source: PhoneValueChangeSource
  ) => {
    const parsed = parsePhoneValue(nextValue, nextCountry, allowedCountries);
    const metaCountry = nextCountry ?? parsed.country;
    const formattedValue = formatPhoneValue(parsed.canonicalValue, metaCountry);
    setDisplayValue(formattedValue);
    if (!valueControlled) setInternalValue(parsed.canonicalValue);
    onValueChange?.(parsed.canonicalValue, {
      country: metaCountry,
      callingCode: metaCountry === null
        ? parsed.callingCode
        : getCountryCallingCode(metaCountry),
      formattedValue,
      nationalNumber: parsed.nationalNumber,
      isPossible: parsed.isPossible,
      isValid: parsed.isValid,
      source
    });
  }, [allowedCountries, onValueChange, valueControlled]);

  const applyExternalCanonicalValue = useCallback((nextValue: string) => {
    const nextCountry = detectPhoneCountry(nextValue, allowedCountries);
    if (nextCountry !== null && nextCountry !== effectiveCountry) {
      if (!countryControlled) setInternalCountry(nextCountry);
      onCountryChange?.(nextCountry, {
        previousCountry: effectiveCountry,
        source: "external"
      });
    }
    setDisplayValue(formatPhoneValue(nextValue, effectiveCountry));
  }, [
    allowedCountries,
    countryControlled,
    effectiveCountry,
    onCountryChange
  ]);

  useEffect(() => {
    if (!valueControlled || lastExternalValue.current === semanticValue) return;
    lastExternalValue.current = semanticValue;
    applyExternalCanonicalValue(semanticValue);
  }, [applyExternalCanonicalValue, semanticValue, valueControlled]);

  const applyNationalEditingValue = useCallback((rawValue: string, source: "input" | "paste") => {
    if (effectiveCountry === null) {
      emitValue(normalizePhoneValue(rawValue), null, source);
      return;
    }
    const callingCode = getCountryCallingCode(effectiveCountry);
    const rawDigits = rawValue.replace(/\D/g, "");
    const startsInternational = rawValue.trimStart().startsWith("+");
    const nationalValue = callingCode !== null && startsInternational
      ? (rawDigits.startsWith(callingCode)
        ? rawDigits.slice(callingCode.length)
        : rawDigits)
      : rawValue;
    const nextValue = nationalValue === "" && callingCode !== null
      ? `+${callingCode}`
      : normalizePhoneValue(nationalValue, effectiveCountry);
    emitValue(nextValue, effectiveCountry, source);
  }, [
    effectiveCountry,
    emitValue
  ]);

  const applyInternationalValue = useCallback((
    rawValue: string,
    source: "input" | "paste"
  ) => {
    const nextValue = normalizePhoneValue(rawValue);
    const nextCountry = detectPhoneCountry(nextValue, allowedCountries);
    if (nextCountry === null) {
      applyNationalEditingValue(rawValue, source);
      return;
    }
    if (nextCountry !== effectiveCountry) {
      if (!countryControlled) setInternalCountry(nextCountry);
      onCountryChange?.(nextCountry, {
        previousCountry: effectiveCountry,
        source: "number"
      });
    }
    emitValue(nextValue, nextCountry, source);
  }, [
    allowedCountries,
    applyNationalEditingValue,
    countryControlled,
    effectiveCountry,
    emitValue,
    onCountryChange
  ]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyNationalEditingValue(event.currentTarget.value, "input");
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    if (!pasted) return;
    event.preventDefault();
    if (pasted.trimStart().startsWith("+")) applyInternationalValue(pasted, "paste");
    else applyNationalEditingValue(pasted, "paste");
  };

  const handleCountryChange = (nextCountry: PhoneCountryCode) => {
    const previousCountry = effectiveCountry;
    if (!countryControlled) setInternalCountry(nextCountry);
    onCountryChange?.(nextCountry, {
      previousCountry,
      source: "country-picker"
    });
    emitValue(
      replacePhoneCountry(semanticValue, previousCountry, nextCountry),
      nextCountry,
      "country"
    );
  };

  const handleClear = () => {
    const previousCountry = effectiveCountry;
    const callingCode = previousCountry === null
      ? null
      : getCountryCallingCode(previousCountry);
    const nextValue = preserveCountryCallingCode && callingCode
      ? `+${callingCode}`
      : "";
    emitValue(nextValue, effectiveCountry, "clear");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      const caret = inputRef.current?.value.length ?? 0;
      inputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const invalid = error != null || ariaInvalid === true || ariaInvalid === "true";
  const effectiveLabelView = labelView === "inner" && label != null ? "inner" : "outer";
  const labelFloated = focused || displayValue.length > 0;
  const showClear = clearable
    && displayValue.length > 0
    && !disabled
    && !readOnly;
  const trailingActions: ReactNode = showClear || endAdornment != null ? (
    <span className={styles.actions} data-field-interactive="">
      {endAdornment}
      {showClear ? (
        <IconButton
          aria-label={clearLabel ?? messages.clear}
          className={styles.clearButton}
          icon={<X />}
          onClick={handleClear}
          onMouseDown={(event) => event.preventDefault()}
          size="sm"
          variant="ghost"
        />
      ) : null}
    </span>
  ) : null;

  return (
    <FormControl
      className={className}
      controlId={id}
      describedBy={ariaDescribedBy}
      disabled={disabled}
      error={error}
      hint={hint}
      invalid={invalid}
      label={label}
      labelView={effectiveLabelView}
      required={required}
    >
      {({ label: controlLabel, ...controlProps }) => (
        <FieldShell
          data-field-textlike=""
          disabled={disabled}
          endAdornment={trailingActions}
          invalid={invalid}
          label={controlLabel}
          labelFloated={labelFloated}
          labelView={effectiveLabelView}
          onFocusRequest={() => inputRef.current?.focus()}
          readOnly={readOnly}
          ref={shellRef}
          size={size}
          startAdornment={(
            <CountryPicker
              countries={countryData}
              country={effectiveCountry}
              disabled={disabled || readOnly}
              fieldRef={shellRef}
              inputRef={inputRef}
              locale={resolvedLocale}
              noCountriesText={noCountriesText ?? messages.noCountries}
              onChange={handleCountryChange}
              pickerLabel={countryPickerLabel ?? messages.picker}
              searchPlaceholder={countrySearchPlaceholder ?? messages.search}
            />
          )}
        >
          <input
            {...nativeProps}
            {...controlProps}
            autoComplete={autoComplete}
            className={classNames(styles.input, fieldValueTypographyClassNames[size])}
            data-control-text-role={valueRoleNames[size]}
            data-field-part="native-control"
            data-field-value-typography=""
            data-label-floated={labelFloated ? "" : undefined}
            data-label-view={effectiveLabelView}
            disabled={disabled}
            inputMode="tel"
            onBlur={(event: FocusEvent<HTMLInputElement>) => {
              setFocused(false);
              const domValue = event.currentTarget.value;
              const normalizedDomValue = normalizePhoneValue(domValue);
              const callingCode = effectiveCountry === null
                ? null
                : getCountryCallingCode(effectiveCountry);
              const focusSeed = callingCode === null ? "" : `+${callingCode}`;
              if (
                normalizedDomValue !== ""
                && normalizedDomValue !== semanticValue
                && !(semanticValue === "" && normalizedDomValue === focusSeed)
              ) {
                if (domValue.trimStart().startsWith("+")) {
                  applyInternationalValue(domValue, "input");
                } else {
                  applyNationalEditingValue(domValue, "input");
                }
              } else if (semanticValue === "") {
                setDisplayValue("");
              }
              onBlur?.(event);
            }}
            onChange={handleChange}
            onFocus={(event: FocusEvent<HTMLInputElement>) => {
              setFocused(true);
              if (semanticValue === "" && effectiveCountry !== null) {
                const callingCode = getCountryCallingCode(effectiveCountry);
                if (callingCode !== null) setDisplayValue(`+${callingCode}`);
              }
              onFocus?.(event);
            }}
            onPaste={handlePaste}
            readOnly={readOnly}
            ref={setInputRef}
            type="tel"
            value={displayValue}
          />
        </FieldShell>
      )}
    </FormControl>
  );
});
