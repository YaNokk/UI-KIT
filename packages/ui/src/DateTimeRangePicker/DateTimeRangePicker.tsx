import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { DateTimeRangeInput, type DateTimeRangeInputProps } from "../DateTimeRangeInput/DateTimeRangeInput";
import type { MinuteStep } from "../TimeInput/TimeInput";
import { Calendar } from "../internal/calendar/Calendar";
import { dateValueToLocalDate } from "../internal/date/dateMath";
import { equalDateTimeRanges } from "../internal/date/dateComparison";
import { createStandardDateTimeRangePresets } from "../internal/date/dateTimePresets";
import { validateDateTimeRange } from "../internal/date/dateTimeRange";
import { isDateAllowed, isTimeAllowed } from "../internal/date/dateValidation";
import { resolveWeekStartsOn } from "../internal/date/locale";
import { joinLocalDateTime } from "../internal/date/parseLocalDateTimeValue";
import { parseLocalizedDateTimeRange } from "../internal/date/range-input/parseLocalizedDateRange";
import { resolveDateMessages } from "../internal/date/resolveDateMessages";
import { selectRangeDate } from "../internal/date/dateRange";
import { zonedNow } from "../internal/date/timezone";
import type {
  DateRangeValue,
  DateTimeRangePreset,
  DateTimeRangeValue,
  DateValue,
  LocalDateTimeValue,
  TimeValue,
  WeekStartsOn
} from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { PickerOverlay } from "../internal/date-picker/PickerOverlay";
import { usePickerDraft } from "../internal/date-picker/usePickerDraft";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import styles from "./DateTimeRangePicker.module.css";

const EMPTY_RANGE: DateTimeRangeValue = { from: null, to: null };

function datePart(value: LocalDateTimeValue | null): DateValue | null {
  return value ? value.slice(0, 10) as DateValue : null;
}

function timePart(value: LocalDateTimeValue | null, fallback: TimeValue): TimeValue {
  return value ? value.slice(11, 16) as TimeValue : fallback;
}

export interface DateTimeRangePickerProps extends Omit<
  DateTimeRangeInputProps,
  "minValue" | "maxValue" | "minuteStep"
> {
  timeZone: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  minValue?: LocalDateTimeValue | undefined;
  maxValue?: LocalDateTimeValue | undefined;
  minuteStep?: MinuteStep;
  defaultStartTime?: TimeValue;
  defaultEndTime?: TimeValue;
  maxDuration?: { days?: number; hours?: number };
  presets?: readonly DateTimeRangePreset[];
  weekStartsOn?: WeekStartsOn;
}

export function DateTimeRangePicker({
  value: controlledValue,
  defaultValue = EMPTY_RANGE,
  onChange,
  timeZone,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  minValue,
  maxValue,
  minuteStep = 1,
  defaultStartTime = "00:00",
  defaultEndTime = "23:59",
  maxDuration,
  presets,
  weekStartsOn: explicitWeekStartsOn,
  locale: explicitLocale,
  isDateUnavailable,
  isTimeUnavailable,
  disabled = false,
  readOnly = false,
  ...inputProps
}: DateTimeRangePickerProps) {
  useMemo(() => zonedNow(new Date(), timeZone), [timeZone]);
  const locale = useResolvedLocale(explicitLocale);
  const messages = resolveDateMessages(locale);
  const weekStartsOn = resolveWeekStartsOn(locale, explicitWeekStartsOn);
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
  const [open, setOpen] = useControllableValue(controlledOpen, defaultOpen, onOpenChange);
  const [draftComplete, setDraftComplete] = useState(Boolean(value.from && value.to));
  const [hoverDate, setHoverDate] = useState<DateValue | null>(null);
  const [month, setMonth] = useState(() => {
    const initialDate = datePart(value.from);
    return initialDate ? dateValueToLocalDate(initialDate) : new Date();
  });
  const [calendarViewKey, setCalendarViewKey] = useState(0);
  const inputGroupRef = useRef<HTMLInputElement | null>(null);
  const pickerDraft = usePickerDraft({ value, open, commitMode: "apply", setValue });
  const { draft, displayValue } = pickerDraft;
  const resolvedPresets = useMemo(() => presets ?? createStandardDateTimeRangePresets({ locale }), [locale, presets]);
  const context = useMemo(() => ({ now: new Date(), locale, timeZone, weekStartsOn, minValue, maxValue }), [locale, maxValue, minValue, timeZone, weekStartsOn]);

  useEffect(() => {
    if (open) {
      setDraftComplete(Boolean(value.from && value.to));
      const nextDate = datePart(value.from);
      setMonth(nextDate ? dateValueToLocalDate(nextDate) : new Date());
    }
  }, [open, value]);
  useEffect(() => {
    if (open) setCalendarViewKey((key) => key + 1);
  }, [open]);

  useEffect(() => {
    const form = inputGroupRef.current?.closest("form");
    if (!form) return;
    const reset = () => queueMicrotask(() => {
      setValue(defaultValue);
      pickerDraft.setDraft(defaultValue);
      setDraftComplete(Boolean(defaultValue.from && defaultValue.to));
      const resetDate = datePart(defaultValue.from);
      setMonth(resetDate ? dateValueToLocalDate(resetDate) : new Date());
    });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue, pickerDraft.setDraft, setValue]);

  const dateRange: DateRangeValue = { from: datePart(draft.from), to: datePart(draft.to) };
  const isValidDraft = (candidate: DateTimeRangeValue) => {
    if (!candidate.from || !candidate.to) return false;
    const fromDate = datePart(candidate.from);
    const toDate = datePart(candidate.to);
    if (!fromDate || !toDate) return false;
    return validateDateTimeRange(candidate, maxDuration, timeZone)
      && isDateAllowed(fromDate, { isDateUnavailable })
      && isDateAllowed(toDate, { isDateUnavailable })
      && isTimeAllowed(candidate.from.slice(11, 16) as TimeValue, { minuteStep })
      && isTimeAllowed(candidate.to.slice(11, 16) as TimeValue, { minuteStep })
      && (!minValue || candidate.from >= minValue)
      && (!maxValue || candidate.to <= maxValue)
      && !isTimeUnavailable?.(candidate.from, "from")
      && !isTimeUnavailable?.(candidate.to, "to");
  };
  const updateDates = (selected: DateValue) => {
    const next = selectRangeDate(dateRange, selected).value;
    pickerDraft.update({
      from: joinLocalDateTime(next.from, timePart(draft.from, defaultStartTime)),
      to: joinLocalDateTime(next.to, timePart(draft.to, defaultEndTime))
    });
    setDraftComplete(Boolean(next.from && next.to));
  };
  const canApply = draftComplete && isValidDraft(draft);
  const handleOpenChange = (next: boolean) => {
    if (next) {
      pickerDraft.openDraft();
      setDraftComplete(Boolean(value.from && value.to));
      const nextDate = datePart(value.from);
      setMonth(nextDate ? dateValueToLocalDate(nextDate) : new Date());
    } else {
      pickerDraft.discard();
      setDraftComplete(Boolean(value.from && value.to));
    }
    setOpen(next);
  };
  const trigger = (
    <div onClick={() => { if (!disabled && !readOnly && !open) handleOpenChange(true); }}>
      <DateTimeRangeInput
        {...inputProps}
        defaultValue={defaultValue}
        disabled={disabled}
        error={open ? null : inputProps.error}
        isDateUnavailable={isDateUnavailable}
        isTimeUnavailable={isTimeUnavailable}
        locale={locale}
        maxValue={maxValue}
        minValue={minValue}
        minuteStep={minuteStep}
        onChange={(next) => {
          if (!isValidDraft(next)) return;
          pickerDraft.update(next);
          setDraftComplete(true);
          const nextDate = datePart(next.from);
          if (nextDate) setMonth(dateValueToLocalDate(nextDate));
        }}
        onInputValueChange={(text) => {
          inputProps.onInputValueChange?.(text);
          if (!open) return;
          const parsed = parseLocalizedDateTimeRange(text, locale);
          setDraftComplete(Boolean(parsed && isValidDraft(parsed)));
        }}
        readOnly={readOnly}
        ref={inputGroupRef}
        value={displayValue}
      />
    </div>
  );

  return (
    <PickerOverlay
      closeLabel={messages.close}
      footer={(
        <>
          <Button onClick={() => { pickerDraft.update(EMPTY_RANGE); setDraftComplete(false); }} variant="soft">{messages.reset}</Button>
          <Button onClick={() => handleOpenChange(false)} variant="secondary">{messages.cancel}</Button>
          <Button disabled={!canApply} onClick={() => { if (canApply) pickerDraft.apply(); handleOpenChange(false); }} variant="primary">{messages.apply}</Button>
        </>
      )}
      onOpenChange={handleOpenChange}
      open={open}
      title={messages.chooseDateTimeRange}
      trigger={trigger}
      wide
    >
      <div className={styles.layout}>
        <div className={styles.presets}>
          {resolvedPresets.map((preset) => {
            const resolved = preset.resolve(context);
            return (
              <Button
                aria-pressed={equalDateTimeRanges(resolved, draft)}
                key={preset.id}
                onClick={() => {
                  pickerDraft.update(resolved);
                  setDraftComplete(Boolean(resolved.from && resolved.to));
                  const resolvedDate = datePart(resolved.from);
                  if (resolvedDate) setMonth(dateValueToLocalDate(resolvedDate));
                }}
                size="sm"
                variant={equalDateTimeRanges(resolved, draft) ? "primary" : "soft"}
              >{preset.label}</Button>
            );
          })}
        </div>
        <div>
          <Calendar
            hoverDate={hoverDate}
            isDateUnavailable={isDateUnavailable}
            locale={locale}
            maxDate={maxValue?.slice(0, 10) as DateValue | undefined}
            minDate={minValue?.slice(0, 10) as DateValue | undefined}
            month={month}
            months={2}
            onHoverDateChange={setHoverDate}
            onMonthChange={setMonth}
            onSelect={updateDates}
            range={dateRange}
            resetViewKey={calendarViewKey}
            weekStartsOn={weekStartsOn}
          />
          <div className={styles.draftFields}>
            <DateTimeRangeInput
              aria-label={messages.chooseDateTimeRange}
              disabled={disabled}
              isDateUnavailable={isDateUnavailable}
              isTimeUnavailable={isTimeUnavailable}
              locale={locale}
              maxValue={maxValue}
              minValue={minValue}
              minuteStep={minuteStep}
              onChange={(next) => {
                pickerDraft.update(next);
                setDraftComplete(isValidDraft(next));
                const nextDate = datePart(next.from);
                if (nextDate) setMonth(dateValueToLocalDate(nextDate));
              }}
              onInputValueChange={(text) => {
                const parsed = parseLocalizedDateTimeRange(text, locale);
                setDraftComplete(Boolean(parsed && isValidDraft(parsed)));
              }}
              value={draft}
            />
          </div>
        </div>
      </div>
    </PickerOverlay>
  );
}
