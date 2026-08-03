import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { DateRangeInput } from "../DateRangeInput/DateRangeInput";
import { Calendar } from "../internal/calendar/Calendar";
import { equalDateRanges } from "../internal/date/dateComparison";
import { formatDateValue } from "../internal/date/dateFormatting";
import { dateValueToLocalDate } from "../internal/date/dateMath";
import { createStandardDateRangePresets } from "../internal/date/datePresets";
import { isDateRangeComplete, isDateRangeDurationValid, selectRangeDate } from "../internal/date/dateRange";
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
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import styles from "./DateRangePicker.module.css";

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
  currentPeriodMode = "elapsed",
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
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
  const [open, setOpen] = useControllableValue(controlledOpen, defaultOpen, onOpenChange);
  const [draft, setDraft] = useState(value);
  const [hoverDate, setHoverDate] = useState<DateValue | null>(null);
  const [month, setMonth] = useState(() => value.from ? dateValueToLocalDate(value.from) : new Date());
  const inputGroupRef = useRef<HTMLDivElement | null>(null);
  const resolvedPresets = useMemo(() => presets ?? createStandardDateRangePresets({
    locale,
    currentPeriodMode,
    includeAllTime: Boolean(minDate && maxDate)
  }), [currentPeriodMode, locale, maxDate, minDate, presets]);
  const context = useMemo(() => ({ now: new Date(), locale, weekStartsOn, minDate, maxDate }), [locale, maxDate, minDate, weekStartsOn]);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setMonth(value.from ? dateValueToLocalDate(value.from) : new Date());
    }
  }, [open, value]);

  useEffect(() => {
    const form = inputGroupRef.current?.closest("form");
    if (!form) return;
    const reset = () => queueMicrotask(() => {
      setValue(defaultValue);
      setDraft(defaultValue);
      setMonth(defaultValue.from ? dateValueToLocalDate(defaultValue.from) : new Date());
    });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue, setValue]);

  const ru = locale.toLowerCase().startsWith("ru");
  const labels = ru
    ? { title: "Выберите период", close: "Закрыть", cancel: "Отмена", apply: "Применить", reset: "Сбросить", start: "Выберите дату начала", end: "Выберите дату окончания" }
    : { title: "Choose a date range", close: "Close", cancel: "Cancel", apply: "Apply", reset: "Reset", start: "Choose a start date", end: "Choose an end date" };
  const canApply = isDateRangeComplete(draft) && isDateRangeDurationValid(draft, maxDuration);
  const trigger = (
    <div onClick={() => { if (!disabled && !readOnly) setOpen(true); }}>
      <DateRangeInput
        block={block}
        disabled={disabled}
        error={error}
        fromName={fromName}
        hint={hint}
        isDateUnavailable={isDateUnavailable}
        label={label}
        locale={locale}
        maxDate={maxDate}
        minDate={minDate}
        onChange={(next) => { if (isDateRangeComplete(next)) setValue(next); }}
        readOnly={readOnly}
        ref={inputGroupRef}
        required={required}
        toName={toName}
        value={value}
      />
      <span hidden><CalendarDays /></span>
    </div>
  );

  return (
    <PickerOverlay
      closeLabel={labels.close}
      footer={(
        <>
          <Button onClick={() => setDraft(EMPTY_RANGE)} variant="soft">{labels.reset}</Button>
          <Button onClick={() => { setDraft(value); setOpen(false); }} variant="secondary">{labels.cancel}</Button>
          <Button disabled={!canApply} onClick={() => { if (canApply) setValue(draft); setOpen(false); }} variant="primary">{labels.apply}</Button>
        </>
      )}
      onOpenChange={(next) => {
        if (!next) setDraft(value);
        setOpen(next);
      }}
      open={open}
      title={labels.title}
      trigger={trigger}
      wide
    >
      <div className={styles.layout}>
        <div className={styles.presets}>
          {resolvedPresets.map((preset) => {
            const resolved = preset.resolve(context);
            return (
              <Button
                aria-pressed={equalDateRanges(resolved, draft)}
                className={styles.preset}
                key={preset.id}
                onClick={() => {
                  setDraft(resolved);
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
            {draft.from ? `${formatDateValue(draft.from, locale)}${draft.to ? ` — ${formatDateValue(draft.to, locale)}` : ""}` : labels.start}
            {draft.from && !draft.to ? ` · ${labels.end}` : ""}
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
            onSelect={(selected) => setDraft(selectRangeDate(draft, selected).value)}
            range={draft}
            weekStartsOn={weekStartsOn}
          />
        </div>
      </div>
    </PickerOverlay>
  );
}
