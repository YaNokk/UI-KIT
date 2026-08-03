import { DateTimeRangePicker } from "@mypoint/ui/date-time-range-picker";
import "@mypoint/ui/styles.css";

export default function TreeDateTimeRangePicker() {
  return (
    <DateTimeRangePicker
      label="Tree-shaken date time range"
      timeZone="Europe/Warsaw"
      value={{ from: "2026-08-01T09:00", to: "2026-08-02T18:00" }}
    />
  );
}
