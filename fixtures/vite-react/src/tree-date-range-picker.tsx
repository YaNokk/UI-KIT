import { DateRangePicker } from "@mypoint/ui/date-range-picker";
import "@mypoint/ui/styles.css";

export default function TreeDateRangePicker() {
  return <DateRangePicker label="Tree-shaken date range" value={{ from: "2026-08-01", to: "2026-08-02" }} />;
}
