import { addDays } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { DateTimeInput, type DateTimeInputProps } from "../DateTimeInput/DateTimeInput";
import { Calendar } from "../internal/calendar/Calendar";
import { dateValueToLocalDate } from "../internal/date/dateMath";
import { parseLocalizedDateTime } from "../internal/date/dateFormatting";
import { isDateAllowed, isTimeAllowed } from "../internal/date/dateValidation";
import { resolveWeekStartsOn } from "../internal/date/locale";
import { joinLocalDateTime } from "../internal/date/parseLocalDateTimeValue";
import { resolveDateMessages } from "../internal/date/resolveDateMessages";
import { serializeDateValue } from "../internal/date/serializeDateValue";
import { serializeZonedDateTime, zonedNow } from "../internal/date/timezone";
import type { DateTimePreset, DateValue, LocalDateTimeValue, TimeValue, WeekStartsOn } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { PickerOverlay } from "../internal/date-picker/PickerOverlay";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import styles from "./DateTimePicker.module.css";

function timePart(value: LocalDateTimeValue | null, fallback: TimeValue): TimeValue {
  return value ? value.slice(11, 16) as TimeValue : fallback;
}

function serializeLocalDateTime(date: Date): LocalDateTimeValue {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${serializeDateValue(date)}T${hours}:${minutes}` as LocalDateTimeValue;
}

export interface DateTimePickerProps extends DateTimeInputProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  timeZone?: string | undefined;
  presets?: readonly DateTimePreset[];
  commitMode?: "immediate" | "apply";
  defaultTime?: TimeValue;
  weekStartsOn?: WeekStartsOn;
}

export function DateTimePicker({
  value: controlledValue,
  defaultValue = null,
  onChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  timeZone,
  presets,
  commitMode = "apply",
  defaultTime = "00:00",
  weekStartsOn: explicitWeekStartsOn,
  locale: explicitLocale,
  minValue,
  maxValue,
  isDateUnavailable,
  isTimeUnavailable,
  minuteStep = 1,
  disabled = false,
  readOnly = false,
  ...inputProps
}: DateTimePickerProps) {
  const locale = useResolvedLocale(explicitLocale);
  const messages = resolveDateMessages(locale);
  const weekStartsOn = resolveWeekStartsOn(locale, explicitWeekStartsOn);
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
  const [open, setOpen] = useControllableValue(controlledOpen, defaultOpen, onOpenChange);
  const [draft, setDraft] = useState(value);
  const [draftComplete, setDraftComplete] = useState(Boolean(value));
  const [month, setMonth] = useState(() => value ? dateValueToLocalDate(value.slice(0, 10) as DateValue) : new Date());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const context = useMemo(() => ({ now: new Date(), locale, timeZone }), [locale, timeZone]);
  const defaultPresets = useMemo<DateTimePreset[]>(() => {
    const resolveNow = (date: Date) => timeZone ? serializeZonedDateTime(zonedNow(date, timeZone)) : serializeLocalDateTime(date);
    return [
      { id: "now", label: messages.now, resolve: ({ now }) => resolveNow(now) },
      { id: "today-start", label: messages.todayStart, resolve: ({ now }) => `${serializeDateValue(timeZone ? zonedNow(now, timeZone) : now)}T00:00` },
      { id: "today-end", label: messages.todayEnd, resolve: ({ now }) => `${serializeDateValue(timeZone ? zonedNow(now, timeZone) : now)}T23:59` },
      { id: "tomorrow-start", label: messages.tomorrowStart, resolve: ({ now }) => `${serializeDateValue(addDays(timeZone ? zonedNow(now, timeZone) : now, 1))}T00:00` }
    ];
  }, [messages, timeZone]);
  const resolvedPresets = presets ?? defaultPresets;

  const isValidValue = (candidate: LocalDateTimeValue) => {
    const date = candidate.slice(0, 10) as DateValue;
    const time = candidate.slice(11, 16) as TimeValue;
    return isDateAllowed(date, { isDateUnavailable })
      && isTimeAllowed(time, { minuteStep })
      && (!minValue || candidate >= minValue)
      && (!maxValue || candidate <= maxValue)
      && !isTimeUnavailable?.(candidate);
  };

  useEffect(() => {
    if (open) {
      setDraft(value);
      setDraftComplete(Boolean(value));
      if (value) setMonth(dateValueToLocalDate(value.slice(0, 10) as DateValue));
    }
  }, [open, value]);

  useEffect(() => {
    const form = inputRef.current?.closest("form");
    if (!form) return;
    const reset = () => queueMicrotask(() => {
      setValue(defaultValue);
      setDraft(defaultValue);
      setDraftComplete(Boolean(defaultValue));
      setMonth(defaultValue ? dateValueToLocalDate(defaultValue.slice(0, 10) as DateValue) : new Date());
    });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue, setValue]);

  const updateDraft = (next: LocalDateTimeValue | null) => {
    setDraft(next);
    setDraftComplete(Boolean(next));
    if (commitMode === "immediate") setValue(next);
  };
  const selectDate = (date: DateValue) => updateDraft(joinLocalDateTime(date, timePart(draft, defaultTime)));
  const trigger = (
    <DateTimeInput
      {...inputProps}
      disabled={disabled}
      isDateUnavailable={isDateUnavailable}
      isTimeUnavailable={isTimeUnavailable}
      locale={locale}
      maxValue={maxValue}
      minValue={minValue}
      minuteStep={minuteStep}
      onChange={setValue}
      onClick={(event) => { inputProps.onClick?.(event); if (!event.defaultPrevented && !disabled && !readOnly) setOpen(true); }}
      readOnly={readOnly}
      ref={inputRef}
      value={value}
    />
  );

  return (
    <PickerOverlay
      closeLabel={messages.close}
      footer={commitMode === "apply" ? <>
        <Button onClick={() => { setDraft(value); setOpen(false); }} variant="secondary">{messages.cancel}</Button>
        <Button disabled={!draft || !draftComplete || !isValidValue(draft)} onClick={() => { if (draft && draftComplete && isValidValue(draft)) setValue(draft); setOpen(false); }} variant="primary">{messages.apply}</Button>
      </> : undefined}
      onOpenChange={(next) => { if (!next) setDraft(value); setOpen(next); }}
      open={open}
      title={messages.chooseDateTime}
      trigger={trigger}
    >
      <div className={styles.content}>
        <div className={styles.presets} data-date-time-picker-presets="" role="list">
          {resolvedPresets.map((preset) => <Button key={preset.id} onClick={() => { const next = preset.resolve(context); updateDraft(next); setMonth(dateValueToLocalDate(next.slice(0, 10) as DateValue)); }} size="sm" variant="soft">{preset.label}</Button>)}
        </div>
        <Calendar
          isDateUnavailable={isDateUnavailable}
          locale={locale}
          maxDate={maxValue?.slice(0, 10) as DateValue | undefined}
          minDate={minValue?.slice(0, 10) as DateValue | undefined}
          month={month}
          onMonthChange={setMonth}
          onSelect={selectDate}
          value={draft ? draft.slice(0, 10) as DateValue : null}
          weekStartsOn={weekStartsOn}
        />
        <DateTimeInput
          isDateUnavailable={isDateUnavailable}
          isTimeUnavailable={isTimeUnavailable}
          label={messages.chooseDateTime}
          locale={locale}
          maxValue={maxValue}
          minValue={minValue}
          minuteStep={minuteStep}
          onChange={updateDraft}
          onInputValueChange={(text) => {
            const parsed = parseLocalizedDateTime(text, locale);
            setDraftComplete(Boolean(parsed && isValidValue(parsed)));
          }}
          value={draft}
        />
      </div>
    </PickerOverlay>
  );
}
