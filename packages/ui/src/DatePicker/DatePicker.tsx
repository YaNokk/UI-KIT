import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { DateInput, type DateInputProps } from "../DateInput/DateInput";
import { Calendar } from "../internal/calendar/Calendar";
import { dateValueToLocalDate } from "../internal/date/dateMath";
import { resolveWeekStartsOn } from "../internal/date/locale";
import type { DateValue, WeekStartsOn } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { PickerOverlay } from "../internal/date-picker/PickerOverlay";
import { useResolvedLocale } from "../internal/locale/LocaleContext";
import { resolveDateMessages } from "../internal/date/resolveDateMessages";

export interface DatePresetContext {
  now: Date;
  locale: string;
  minDate?: DateValue | undefined;
  maxDate?: DateValue | undefined;
}

export interface DatePreset {
  id: string;
  label: ReactNode;
  resolve: (context: DatePresetContext) => DateValue;
}

export interface DatePickerProps extends DateInputProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  presets?: readonly DatePreset[];
  commitMode?: "immediate" | "apply";
  weekStartsOn?: WeekStartsOn;
}

export function DatePicker({
  value: controlledValue,
  defaultValue = null,
  onChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  presets,
  commitMode = "immediate",
  locale: explicitLocale,
  weekStartsOn: explicitWeekStartsOn,
  minDate,
  maxDate,
  isDateUnavailable,
  disabled = false,
  readOnly = false,
  ...inputProps
}: DatePickerProps) {
  const locale = useResolvedLocale(explicitLocale);
  const weekStartsOn = resolveWeekStartsOn(locale, explicitWeekStartsOn);
  const messages = resolveDateMessages(locale);
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onChange);
  const [open, setOpen] = useControllableValue(controlledOpen, defaultOpen, onOpenChange);
  const [draft, setDraft] = useState<DateValue | null>(value);
  const [month, setMonth] = useState(() => value ? dateValueToLocalDate(value) : new Date());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setMonth(value ? dateValueToLocalDate(value) : new Date());
    }
  }, [open, value]);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const reset = () => queueMicrotask(() => {
      setValue(defaultValue);
      setDraft(defaultValue);
      setMonth(defaultValue ? dateValueToLocalDate(defaultValue) : new Date());
    });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue, setValue]);

  const context = useMemo(() => ({ now: new Date(), locale, minDate, maxDate }), [locale, maxDate, minDate]);

  const close = () => setOpen(false);
  const select = (next: DateValue) => {
    setDraft(next);
    if (commitMode === "immediate") {
      setValue(next);
      close();
    }
  };
  const trigger = (
    <DateInput
      {...inputProps}
      disabled={disabled}
      endAdornment={<CalendarDays />}
      isDateUnavailable={isDateUnavailable}
      locale={locale}
      maxDate={maxDate}
      minDate={minDate}
      onChange={setValue}
      onClick={(event) => {
        inputProps.onClick?.(event);
        if (!event.defaultPrevented && !disabled && !readOnly) setOpen(true);
      }}
      readOnly={readOnly}
      ref={inputRef}
      value={value}
    />
  );

  return (
    <PickerOverlay
      closeLabel={messages.close}
      footer={commitMode === "apply" ? (
        <>
          <Button onClick={close} variant="secondary">{messages.cancel}</Button>
          <Button disabled={!draft} onClick={() => { if (draft) setValue(draft); close(); }} variant="primary">{messages.apply}</Button>
        </>
      ) : undefined}
      onOpenChange={(next) => {
        if (!next) setDraft(value);
        setOpen(next);
      }}
      open={open}
      title={messages.chooseDate}
      trigger={trigger}
    >
      {presets?.length ? (
        <div role="list">
          {presets.map((preset) => (
            <Button key={preset.id} onClick={() => select(preset.resolve(context))} size="sm" variant="soft">
              {preset.label}
            </Button>
          ))}
        </div>
      ) : null}
      <Calendar
        isDateUnavailable={isDateUnavailable}
        locale={locale}
        maxDate={maxDate}
        minDate={minDate}
        month={month}
        onMonthChange={setMonth}
        onSelect={select}
        value={draft}
        weekStartsOn={weekStartsOn}
      />
      {commitMode === "immediate" ? (
        <Button onClick={() => { setValue(null); close(); }} size="sm" variant="secondary">{messages.reset}</Button>
      ) : null}
    </PickerOverlay>
  );
}
