import { ChevronLeft, ChevronRight } from "lucide-react";
import { useResolvedLocale } from "../internal/locale/LocaleContext.js";
import { classNames } from "../shared/classNames.js";
import "./Pagination.css";

export interface PaginationMessages {
  navigationLabel: string;
  previousPage: string;
  nextPage: string;
  page: (page: number) => string;
  pageInfo: (from: string, to: string, total: string) => string;
  pageSize: string;
  itemsPerPage: (value: number) => string;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageInfo?: boolean;
  showPageSize?: boolean;
  disabled?: boolean;
  locale?: string;
  messages?: Partial<PaginationMessages>;
  className?: string;
}

function pageItems(page: number, pageCount: number): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  if (page > 4) pages.push("ellipsis-start");
  const start = Math.max(2, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  for (let value = start; value <= end; value += 1) pages.push(value);
  if (page < pageCount - 3) pages.push("ellipsis-end");
  pages.push(pageCount);
  return pages;
}

export function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageInfo = true,
  showPageSize = Boolean(onPageSizeChange),
  disabled = false,
  locale: explicitLocale,
  messages,
  className
}: PaginationProps) {
  const locale = useResolvedLocale(explicitLocale);
  const formatter = new Intl.NumberFormat(locale);
  const defaults: PaginationMessages = {
    navigationLabel: "Пагинация",
    previousPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    page: (value) => `Страница ${value}`,
    pageInfo: (from, to, count) => `${from}–${to} из ${count}`,
    pageSize: "Строк на странице",
    itemsPerPage: (value) => `${value} строк на странице`
  };
  const labels = { ...defaults, ...messages };
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const safePageSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1;
  const pageCount = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const requestedPage = Number.isFinite(page) ? Math.floor(page) : 1;
  const safePage = Math.min(Math.max(requestedPage, 1), pageCount);
  const from = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const to = safeTotal === 0 ? 0 : Math.min(safePage * safePageSize, safeTotal);
  const safePageSizeOptions = Array.from(new Set([
    safePageSize,
    ...pageSizeOptions.filter((value) => Number.isFinite(value) && value >= 1).map(Math.floor)
  ])).sort((left, right) => left - right);

  return (
    <nav aria-label={labels.navigationLabel} className={classNames("ds-pagination", className)}>
      {showPageInfo && <span className="ds-pagination-info">{labels.pageInfo(formatter.format(from), formatter.format(to), formatter.format(safeTotal))}</span>}
      <div className="ds-pagination-pages">
        <button aria-label={labels.previousPage} className="ds-pagination-button" disabled={disabled || safePage <= 1} onClick={() => onPageChange(safePage - 1)} type="button"><ChevronLeft aria-hidden="true" /></button>
        {pageItems(safePage, pageCount).map((item) => typeof item === "number" ? (
          <button
            aria-current={item === safePage ? "page" : undefined}
            aria-label={labels.page(item)}
            className="ds-pagination-button"
            disabled={disabled}
            key={item}
            onClick={() => onPageChange(item)}
            type="button"
          >{formatter.format(item)}</button>
        ) : <span aria-hidden="true" className="ds-pagination-ellipsis" key={item}>…</span>)}
        <button aria-label={labels.nextPage} className="ds-pagination-button" disabled={disabled || safePage >= pageCount} onClick={() => onPageChange(safePage + 1)} type="button"><ChevronRight aria-hidden="true" /></button>
      </div>
      {showPageSize && onPageSizeChange && (
        <label className="ds-pagination-size">
          <span>{labels.pageSize}</span>
          <select aria-label={labels.pageSize} disabled={disabled} onChange={(event) => onPageSizeChange(Number(event.target.value))} value={safePageSize}>
            {safePageSizeOptions.map((value) => <option key={value} value={value}>{labels.itemsPerPage(value)}</option>)}
          </select>
        </label>
      )}
    </nav>
  );
}
