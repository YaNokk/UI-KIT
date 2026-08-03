import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { DateInput, type DateInputProps } from "../DateInput/DateInput";
import { Calendar } from "../internal/calendar/Calendar";
import { dateValueToLocalDate } from "../internal/date/dateMath";
import { isDateAllowed } from "../internal/date/dateValidation";
import { resolveWeekStartsOn } from "../internal/date/locale";
import type { DateValue, WeekStartsOn } from "../internal/date/types";
import { useControllableValue } from "../internal/date/useControllableValue";
import { PickerOverlay } from "../internal/date-picker/PickerOverlay";
import { CalendarTriggerAddon } from "../internal/date-picker/CalendarTriggerAddon";
import { usePickerDraft } from "../internal/date-picker/usePickerDraft";
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
  const [month, setMonth] = useState(() => value ? dateValueToLocalDate(value) : new Date());
  const [calendarViewKey, setCalendarViewKey] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerDraft = usePickerDraft({ value, open, commitMode, setValue });
  const { draft, displayValue } = pickerDraft;

  useEffect(() => {
    if (open) {
      setMonth(value ? dateValueToLocalDate(value) : new Date());
    }
  }, [open, value]);
  useEffect(() => {
    if (open) setCalendarViewKey((key) => key + 1);
  }, [open]);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const reset = () => queueMicrotask(() => {
      setValue(defaultValue);
      pickerDraft.setDraft(defaultValue);
      setMonth(defaultValue ? dateValueToLocalDate(defaultValue) : new Date());
    });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [defaultValue, pickerDraft.setDraft, setValue]);

  const context = useMemo(() => ({ now: new Date(), locale, minDate, maxDate }), [locale, maxDate, minDate]);

  const openPicker = () => {
    pickerDraft.openDraft();
    setMonth(value ? dateValueToLocalDate(value) : new Date());
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
  const canApply = draft === null || isDateAllowed(draft, { minDate, maxDate, isDateUnavailable });
  const select = (next: DateValue) => {
    pickerDraft.update(next);
    setMonth(dateValueToLocalDate(next));
    if (commitMode === "immediate") {
      discardAndClose();
    }
  };
  const trigger = (
    <DateInput
      {...inputProps}
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
      isDateUnavailable={isDateUnavailable}
      locale={locale}
      maxDate={maxDate}
      minDate={minDate}
      onChange={(next) => {
        pickerDraft.update(next);
        if (next) setMonth(dateValueToLocalDate(next));
      }}
      onClick={(event) => {
        inputProps.onClick?.(event);
        if (!event.defaultPrevented && !disabled && !readOnly && !open) openPicker();
      }}
      readOnly={readOnly}
      ref={inputRef}
      value={displayValue}
    />
  );

  return (
    <PickerOverlay
      closeLabel={messages.close}
      footer={commitMode === "apply" ? (
        <>
          <Button onClick={() => pickerDraft.update(null)} variant="soft">{messages.reset}</Button>
          <Button onClick={discardAndClose} variant="secondary">{messages.cancel}</Button>
          <Button disabled={!canApply} onClick={() => { if (canApply) applyAndClose(); }} variant="primary">{messages.apply}</Button>
        </>
      ) : undefined}
      onOpenChange={handleOverlayOpenChange}
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
        resetViewKey={calendarViewKey}
        value={draft}
        weekStartsOn={weekStartsOn}
      />
      {commitMode === "immediate" ? (
        <Button onClick={() => { pickerDraft.update(null); discardAndClose(); }} size="sm" variant="secondary">{messages.reset}</Button>
      ) : null}
    </PickerOverlay>
  );
}
