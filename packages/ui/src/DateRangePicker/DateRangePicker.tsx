import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { DateRangeInput } from "../DateRangeInput/DateRangeInput";
import { Calendar } from "../internal/calendar/Calendar";
import { equalDateRanges } from "../internal/date/dateComparison";
import { formatDateValue } from "../internal/date/dateFormatting";
import { dateValueToLocalDate } from "../internal/date/dateMath";
import { createStandardDateRangePresets } from "../internal/date/datePresets";
import { isDateRangeComplete, isDateRangeDurationValid, isEmptyDateRange, selectRangeDate } from "../internal/date/dateRange";
import { isDateAllowed } from "../internal/date/dateValidation";
import { resolveWeekStartsOn } from "../internal/date/locale";
import type {
  CurrentPeriodMode,
  DateRangePreset,
  DateRangeValue,
  DateValue,
  WeekStartsOn
} from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { PickerOverlay } from "../internal/date-picker/PickerOverlay";
import { CalendarTriggerAddon } from "../internal/date-picker/CalendarTriggerAddon";
import { usePickerDraft } from "../internal/date-picker/usePickerDraft";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import styles from "./DateRangePicker.module.css";
import { resolveDateMessages } from "../internal/date/resolveDateMessages";

const EMPTY_RANGE: DateRangeValue = { from: null, to: null };

export interface DateRangePickerProps {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  minDate?: DateValue | undefined;
  maxDate?: DateValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  presets?: readonly DateRangePreset[];
  currentPeriodMode?: CurrentPeriodMode;
  maxDuration?: { days?: number };
  locale?: string;
  weekStartsOn?: WeekStartsOn;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  block?: boolean;
  fromName?: string;
  toName?: string;
}

export function DateRangePicker({
  value: controlledValue,
  defaultValue = EMPTY_RANGE,
  onChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  minDate,
  maxDate,
  isDateUnavailable,
  presets,
  currentPeriodMode = "full",
  maxDuration,
  locale: explicitLocale,
  weekStartsOn: explicitWeekStartsOn,
  label,
  hint,
  error,
  disabled = false,
  readOnly = false,
  required,
  block,
  fromName,
  toName
}: DateRangePickerProps) {
  const locale = useResolvedLocale(explicitLocale);
  const weekStartsOn = resolveWeekStartsOn(locale, explicitWeekStartsOn);
  const messages = resolveDateMessages(locale);
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
  const [open, setOpen] = useControllableValue(controlledOpen, defaultOpen, onOpenChange);
  const [hoverDate, setHoverDate] = useState<DateValue | null>(null);
  const [month, setMonth] = useState(() => value.from ? dateValueToLocalDate(value.from) : new Date());
  const [calendarViewKey, setCalendarViewKey] = useState(0);
  const inputGroupRef = useRef<HTMLInputElement | null>(null);
  const pickerDraft = usePickerDraft({
    value,
    open,
    commitMode: "apply",
    setValue,
    isEqual: equalDateRanges
  });
  const { draft, displayValue } = pickerDraft;
  const resolvedPresets = useMemo(() => presets ?? createStandardDateRangePresets({
    locale,
    currentPeriodMode,
    includeAllTime: Boolean(minDate && maxDate)
  }), [currentPeriodMode, locale, maxDate, minDate, presets]);
  const context = useMemo(() => ({ now: new Date(), locale, weekStartsOn, minDate, maxDate }), [locale, maxDate, minDate, weekStartsOn]);

  useEffect(() => {
    if (open) {
      setMonth(value.from ? dateValueToLocalDate(value.from) : new Date());
    }
  }, [open, value.from, value.to]);
  useEffect(() => {
    if (open) setCalendarViewKey((key) => key + 1);
  }, [open]);

  useEffect(() => {
    const form = inputGroupRef.current?.closest("form");
    if (!form) return;
    const reset = () => queueMicrotask(() => {
      setValue(defaultValue);
      pickerDraft.setDraft(defaultValue);
      setMonth(defaultValue.from ? dateValueToLocalDate(defaultValue.from) : new Date());
    });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue, pickerDraft.setDraft, setValue]);

  const openPicker = () => {
    pickerDraft.openDraft();
    setMonth(value.from ? dateValueToLocalDate(value.from) : new Date());
    setOpen(true);
  };
  const discardAndClose = () => {
    pickerDraft.discard();
    setOpen(false);
  };
  const applyAndClose = () => {
    pickerDraft.apply();
    setOpen(false);
  };
  const handleOverlayOpenChange = (next: boolean) => {
    if (next) openPicker();
    else discardAndClose();
  };

  const isCompleteRangeAllowed = (candidate: DateRangeValue) => {
    if (!isDateRangeComplete(candidate) || !candidate.from || !candidate.to) return false;
    return isDateRangeDurationValid(candidate, maxDuration)
      && isDateAllowed(candidate.from, { minDate, maxDate, isDateUnavailable })
      && isDateAllowed(candidate.to, { minDate, maxDate, isDateUnavailable });
  };
  const canApply = isEmptyDateRange(draft) || isCompleteRangeAllowed(draft);
  const trigger = (
    <div onClick={() => { if (!disabled && !readOnly && !open) openPicker(); }}>
      <DateRangeInput
        block={block}
        defaultValue={defaultValue}
        disabled={disabled}
        endAdornment={(
          <CalendarTriggerAddon
            disabled={disabled}
            label={messages.openCalendar}
            onOpen={openPicker}
            open={open}
            readOnly={readOnly}
          />
        )}
        error={error}
        fromName={fromName}
        hint={hint}
        isDateUnavailable={isDateUnavailable}
        label={label}
        locale={locale}
        maxDate={maxDate}
        minDate={minDate}
        onChange={(next) => {
          if (!isDateRangeComplete(next) || !next.from) return;
          pickerDraft.update(next);
          setMonth(dateValueToLocalDate(next.from));
        }}
        readOnly={readOnly}
        ref={inputGroupRef}
        required={required}
        toName={toName}
        value={displayValue}
      />
    </div>
  );

  return (
    <PickerOverlay
      closeLabel={messages.close}
      footer={(
        <>
          <Button onClick={() => pickerDraft.update(EMPTY_RANGE)} variant="soft">{messages.reset}</Button>
          <Button onClick={discardAndClose} variant="secondary">{messages.cancel}</Button>
          <Button disabled={!canApply} onClick={() => { if (canApply) applyAndClose(); }} variant="primary">{messages.apply}</Button>
        </>
      )}
      onOpenChange={handleOverlayOpenChange}
      open={open}
      title={messages.chooseRange}
      trigger={trigger}
      wide
    >
      <div className={styles.layout}>
        <div className={styles.presets}>
          {resolvedPresets.map((preset) => {
            const resolved = preset.resolve(context);
            const available = isCompleteRangeAllowed(resolved);
            return (
              <Button
                aria-pressed={equalDateRanges(resolved, draft)}
                className={styles.preset}
                disabled={!available}
                key={preset.id}
                onClick={() => {
                  pickerDraft.update(resolved);
                  if (resolved.from) setMonth(dateValueToLocalDate(resolved.from));
                }}
                size="sm"
                variant={equalDateRanges(resolved, draft) ? "primary" : "soft"}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
        <div>
          <p aria-live="polite" className={styles.summary}>
            {draft.from ? `${formatDateValue(draft.from, locale)}${draft.to ? ` — ${formatDateValue(draft.to, locale)}` : ""}` : messages.chooseRangeStart}
            {draft.from && !draft.to ? ` · ${messages.chooseRangeEnd}` : ""}
          </p>
          <Calendar
            hoverDate={hoverDate}
            isDateUnavailable={isDateUnavailable}
            locale={locale}
            maxDate={maxDate}
            minDate={minDate}
            month={month}
            months={2}
            onHoverDateChange={setHoverDate}
            onMonthChange={setMonth}
            onSelect={(selected) => pickerDraft.update(selectRangeDate(draft, selected).value)}
            range={draft}
            resetViewKey={calendarViewKey}
            weekStartsOn={weekStartsOn}
          />
        </div>
      </div>
    </PickerOverlay>
  );
}
