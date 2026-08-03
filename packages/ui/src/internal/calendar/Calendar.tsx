import { addDays, addMonths, addYears, endOfWeek, isSameMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { IconButton } from "../../IconButton/IconButton";
import { Select } from "../../Select/Select";
import type { SelectOption } from "../../internal/select/collection";
import { classNames } from "../../shared/classNames";
import { createCalendarGrid } from "../date/calendarGrid";
import { compareDateValues } from "../date/dateComparison";
import { formatDateAccessible, formatMonthLabel } from "../date/dateFormatting";
import { dateValueToLocalDate } from "../date/dateMath";
import { resolveDateMessages } from "../date/resolveDateMessages";
import { serializeDateValue } from "../date/serializeDateValue";
import type { DateRangeValue, DateValue, WeekStartsOn } from "../date/types";
import { clampCalendarMonth } from "./clampCalendarMonth";
import styles from "./Calendar.module.css";

export interface CalendarProps {
  month: Date;
  months?: 1 | 2;
  locale: string;
  weekStartsOn: WeekStartsOn;
  value?: DateValue | null;
  range?: DateRangeValue;
  hoverDate?: DateValue | null;
  minDate?: DateValue | undefined;
  maxDate?: DateValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  onMonthChange: (month: Date) => void;
  onSelect: (date: DateValue) => void;
  onHoverDateChange?: (date: DateValue | null) => void;
}

function getWeekdayLabels(locale: string, weekStartsOn: WeekStartsOn) {
  const start = startOfWeek(new Date(2024, 0, 7), { weekStartsOn });
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(addDays(start, index))
  );
}

function getMonthOptions(locale: string, year: number, minDate?: DateValue, maxDate?: DateValue) {
  return Array.from({ length: 12 }, (_, monthIndex): SelectOption => {
    const date = new Date(year, monthIndex, 1);
    const clamped = clampCalendarMonth(date, minDate, maxDate);
    const label = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
    return {
      value: String(monthIndex),
      label,
      textValue: label,
      disabled: !isSameMonth(date, clamped)
    };
  });
}

function clampFocusedDate(date: Date, minDate?: DateValue, maxDate?: DateValue) {
  const value = serializeDateValue(date);
  if (minDate && value < minDate) return dateValueToLocalDate(minDate);
  if (maxDate && value > maxDate) return dateValueToLocalDate(maxDate);
  return date;
}

export function Calendar({
  month,
  months = 1,
  locale,
  weekStartsOn,
  value,
  range,
  hoverDate,
  minDate,
  maxDate,
  isDateUnavailable,
  onMonthChange,
  onSelect,
  onHoverDateChange
}: CalendarProps) {
  const currentMonth = clampCalendarMonth(month, minDate, maxDate);
  const today = serializeDateValue(new Date());
  const messages = resolveDateMessages(locale);
  const weekdays = useMemo(() => getWeekdayLabels(locale, weekStartsOn), [locale, weekStartsOn]);
  const monthOptions = useMemo(
    () => getMonthOptions(locale, currentMonth.getFullYear(), minDate, maxDate),
    [currentMonth, locale, maxDate, minDate]
  );
  const currentYear = currentMonth.getFullYear();
  const minYear = minDate ? Number(minDate.slice(0, 4)) : currentYear - 100;
  const maxYear = maxDate ? Number(maxDate.slice(0, 4)) : currentYear + 20;
  const yearOptions = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, index): SelectOption => {
      const year = String(minYear + index);
      return { value: year, label: year, textValue: year };
    }),
    [maxYear, minYear]
  );
  const buttonRefs = useRef(new Map<DateValue, HTMLButtonElement>());
  const pendingFocusRef = useRef<DateValue | "fallback" | null>(null);
  const visibleMonths = Array.from({ length: months }, (_, index) => addMonths(currentMonth, index));
  const previousMonth = clampCalendarMonth(addMonths(currentMonth, -1), minDate, maxDate);
  const nextMonth = clampCalendarMonth(addMonths(currentMonth, 1), minDate, maxDate);

  const isSelectable = (candidate: DateValue) => !(
    (minDate && compareDateValues(candidate, minDate) < 0)
    || (maxDate && compareDateValues(candidate, maxDate) > 0)
    || isDateUnavailable?.(candidate)
  );

  useEffect(() => {
    const requested = pendingFocusRef.current;
    if (requested === null) return;
    pendingFocusRef.current = null;
    requestAnimationFrame(() => {
      const preferred = requested !== "fallback" && isSelectable(requested)
        ? requested
        : null;
      const selected = value ?? range?.from ?? null;
      const visibleValues = visibleMonths.flatMap((visible) =>
        createCalendarGrid(visible, weekStartsOn)
          .filter((cell) => !cell.outside)
          .map((cell) => cell.value)
      );
      const target = preferred && visibleValues.includes(preferred)
        ? preferred
        : selected && visibleValues.includes(selected) && isSelectable(selected)
          ? selected
          : visibleValues.includes(today) && isSelectable(today)
            ? today
            : visibleValues.find(isSelectable);
      if (target) buttonRefs.current.get(target)?.focus();
    });
  }, [currentMonth, isDateUnavailable, maxDate, minDate, range?.from, today, value, weekStartsOn]);

  const navigateMonth = (next: Date, preferredFocus: DateValue | "fallback" = "fallback") => {
    pendingFocusRef.current = preferredFocus;
    onMonthChange(clampCalendarMonth(next, minDate, maxDate));
  };

  const moveFocus = (nextDate: Date) => {
    const boundedDate = clampFocusedDate(nextDate, minDate, maxDate);
    const next = serializeDateValue(boundedDate);
    const targetMonth = clampCalendarMonth(boundedDate, minDate, maxDate);
    if (!visibleMonths.some((visible) => isSameMonth(visible, boundedDate))) {
      navigateMonth(targetMonth, next);
    } else {
      requestAnimationFrame(() => buttonRefs.current.get(next)?.focus());
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: DateValue) => {
    const date = dateValueToLocalDate(current);
    let next: Date | null = null;
    switch (event.key) {
      case "ArrowLeft": next = addDays(date, -1); break;
      case "ArrowRight": next = addDays(date, 1); break;
      case "ArrowUp": next = addDays(date, -7); break;
      case "ArrowDown": next = addDays(date, 7); break;
      case "Home": next = startOfWeek(date, { weekStartsOn }); break;
      case "End": next = endOfWeek(date, { weekStartsOn }); break;
      case "PageUp": next = event.shiftKey ? addYears(date, -1) : addMonths(date, -1); break;
      case "PageDown": next = event.shiftKey ? addYears(date, 1) : addMonths(date, 1); break;
    }
    if (next) {
      event.preventDefault();
      moveFocus(next);
    }
  };

  const tentativeEnd = range?.from && !range.to ? hoverDate : null;
  const tentativeFrom = range?.from && tentativeEnd && tentativeEnd < range.from ? tentativeEnd : range?.from;
  const tentativeTo = range?.from && tentativeEnd && tentativeEnd < range.from ? range.from : tentativeEnd;

  return (
    <div className={styles.root}>
      <header className={styles.navigation}>
        <IconButton
          aria-label={messages.previousMonth}
          disabled={isSameMonth(previousMonth, currentMonth)}
          icon={<ChevronLeft />}
          onClick={() => navigateMonth(previousMonth)}
          size="sm"
        />
        <Select
          aria-label={messages.selectMonth}
          block
          items={monthOptions}
          onChange={(next) => {
            if (next !== null) navigateMonth(new Date(currentYear, Number(next), 1));
          }}
          size="sm"
          value={String(currentMonth.getMonth())}
        />
        <Select
          aria-label={messages.selectYear}
          block
          items={yearOptions}
          onChange={(next) => {
            if (next !== null) navigateMonth(new Date(Number(next), currentMonth.getMonth(), 1));
          }}
          size="sm"
          value={String(currentYear)}
        />
        <IconButton
          aria-label={messages.nextMonth}
          disabled={isSameMonth(nextMonth, currentMonth)}
          icon={<ChevronRight />}
          onClick={() => navigateMonth(nextMonth)}
          size="sm"
        />
      </header>
      <div
        className={styles.viewport}
        data-calendar-viewport=""
        style={{ "--calendar-month-count": months } as React.CSSProperties}
      >
        {visibleMonths.map((visibleMonth) => {
          const cells = createCalendarGrid(visibleMonth, weekStartsOn);
          return (
            <section className={styles.month} key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}>
              <div className={styles.monthLabel}>{formatMonthLabel(visibleMonth, locale)}</div>
              <div aria-label={formatMonthLabel(visibleMonth, locale)} className={styles.grid} role="grid">
                {weekdays.map((weekday, index) => (
                  <div aria-hidden="true" className={styles.weekday} key={`${weekday}-${index}`} role="columnheader">{weekday}</div>
                ))}
                {cells.map((cell) => {
                  const unavailable = Boolean(
                    (minDate && compareDateValues(cell.value, minDate) < 0)
                    || (maxDate && compareDateValues(cell.value, maxDate) > 0)
                    || isDateUnavailable?.(cell.value)
                  );
                  const selected = value === cell.value || range?.from === cell.value || range?.to === cell.value;
                  const inRange = Boolean(range?.from && range.to && cell.value > range.from && cell.value < range.to);
                  const preview = Boolean(tentativeFrom && tentativeTo && cell.value >= tentativeFrom && cell.value <= tentativeTo);
                  return (
                    <button
                      aria-current={cell.value === today ? "date" : undefined}
                      aria-label={formatDateAccessible(cell.value, locale)}
                      aria-selected={selected || inRange}
                      className={classNames(
                        styles.cell,
                        cell.outside && styles.outside,
                        cell.value === today && styles.today,
                        inRange && styles.inRange,
                        preview && styles.preview,
                        selected && styles.selected,
                        range?.from === cell.value && styles.rangeStart,
                        range?.to === cell.value && styles.rangeEnd
                      )}
                      disabled={unavailable}
                      key={cell.value}
                      onClick={() => onSelect(cell.value)}
                      onFocus={() => onHoverDateChange?.(cell.value)}
                      onKeyDown={(event) => handleKeyDown(event, cell.value)}
                      onMouseEnter={() => onHoverDateChange?.(cell.value)}
                      onMouseLeave={() => onHoverDateChange?.(null)}
                      ref={(node) => {
                        if (node) buttonRefs.current.set(cell.value, node);
                        else buttonRefs.current.delete(cell.value);
                      }}
                      role="gridcell"
                      tabIndex={selected || cell.value === today ? 0 : -1}
                      type="button"
                    >
                      {Number(cell.value.slice(-2))}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
