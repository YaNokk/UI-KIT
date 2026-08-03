import { addDays, addMonths, addYears, endOfWeek, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, type KeyboardEvent } from "react";
import { IconButton } from "../../IconButton/IconButton";
import { classNames } from "../../shared/classNames";
import { createCalendarGrid } from "../date/calendarGrid";
import { compareDateValues } from "../date/dateComparison";
import { formatDateAccessible, formatMonthLabel } from "../date/dateFormatting";
import { dateValueToLocalDate } from "../date/dateMath";
import { serializeDateValue } from "../date/serializeDateValue";
import type { DateRangeValue, DateValue, WeekStartsOn } from "../date/types";
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
  const today = serializeDateValue(new Date());
  const weekdays = useMemo(() => getWeekdayLabels(locale, weekStartsOn), [locale, weekStartsOn]);
  const buttonRefs = useRef(new Map<DateValue, HTMLButtonElement>());
  const visibleMonths = Array.from({ length: months }, (_, index) => addMonths(month, index));

  const moveFocus = (current: DateValue, nextDate: Date) => {
    const next = serializeDateValue(nextDate);
    const targetMonth = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
    if (!visibleMonths.some((visible) => visible.getFullYear() === nextDate.getFullYear() && visible.getMonth() === nextDate.getMonth())) {
      onMonthChange(targetMonth);
    }
    requestAnimationFrame(() => buttonRefs.current.get(next)?.focus());
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
      moveFocus(current, next);
    }
  };

  const tentativeEnd = range?.from && !range.to ? hoverDate : null;
  const tentativeFrom = range?.from && tentativeEnd && tentativeEnd < range.from ? tentativeEnd : range?.from;
  const tentativeTo = range?.from && tentativeEnd && tentativeEnd < range.from ? range.from : tentativeEnd;

  return (
    <div
      className={styles.viewport}
      data-calendar-viewport=""
      style={{ "--calendar-month-count": months } as React.CSSProperties}
    >
      {visibleMonths.map((visibleMonth, monthIndex) => {
        const cells = createCalendarGrid(visibleMonth, weekStartsOn);
        return (
          <section className={styles.month} key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}>
            <header className={styles.header}>
              {monthIndex === 0 ? (
                <IconButton
                  aria-label={locale.startsWith("ru") ? "Предыдущий месяц" : "Previous month"}
                  icon={<ChevronLeft />}
                  onClick={() => onMonthChange(addMonths(month, -1))}
                  size="sm"
                />
              ) : <span />}
              <span className={styles.monthLabel}>{formatMonthLabel(visibleMonth, locale)}</span>
              {monthIndex === months - 1 ? (
                <IconButton
                  aria-label={locale.startsWith("ru") ? "Следующий месяц" : "Next month"}
                  icon={<ChevronRight />}
                  onClick={() => onMonthChange(addMonths(month, 1))}
                  size="sm"
                />
              ) : <span />}
            </header>
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
  );
}
