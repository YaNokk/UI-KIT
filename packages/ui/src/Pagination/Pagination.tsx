import { ChevronLeft, ChevronRight } from "lucide-react";
import { useResolvedLocale } from "../internal/locale/LocaleContext.js";
import { classNames } from "../shared/classNames.js";
import "./Pagination.css";

export interface PaginationMessages {
  navigationLabel: string;
  previousPage: string;
  nextPage: string;
  page: (page: number) => string;
  pageInfo: (page: string, pageCount: string, total: string) => string;
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
    pageInfo: (current, count) => `стр. ${current} из ${count}`,
    pageSize: "На странице",
    itemsPerPage: (value) => `${value} строк на странице`
  };
  const labels = { ...defaults, ...messages };
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const safePageSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1;
  const pageCount = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const requestedPage = Number.isFinite(page) ? Math.floor(page) : 1;
  const safePage = Math.min(Math.max(requestedPage, 1), pageCount);
  const safePageSizeOptions = Array.from(new Set([
    safePageSize,
    ...pageSizeOptions
      .filter((value) => Number.isFinite(value) && value >= 1)
      .map(Math.floor)
  ])).sort((left, right) => left - right);

  return (
    <nav aria-label={labels.navigationLabel} className={classNames("ds-pagination", className)}>
      <div className="ds-pagination-navigation">
        <div className="ds-pagination-controls">
          <button
            aria-label={labels.previousPage}
            className="ds-pagination-button"
            disabled={disabled || safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <span
            aria-current="page"
            aria-label={labels.page(safePage)}
            className="ds-pagination-current"
          >
            {formatter.format(safePage)}
          </span>
          <button
            aria-label={labels.nextPage}
            className="ds-pagination-button"
            disabled={disabled || safePage >= pageCount}
            onClick={() => onPageChange(safePage + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        {showPageInfo && (
          <span className="ds-pagination-page-count">
            {labels.pageInfo(
              formatter.format(safePage),
              formatter.format(pageCount),
              formatter.format(safeTotal)
            )}
          </span>
        )}
      </div>
      {showPageSize && onPageSizeChange && (
        <div className="ds-pagination-page-size">
          <span className="ds-pagination-page-size-label">{labels.pageSize}</span>
          <div
            aria-label={labels.pageSize}
            className="ds-pagination-page-size-options"
            role="group"
          >
            {safePageSizeOptions.map((value) => (
              <button
                aria-pressed={value === safePageSize}
                className="ds-pagination-page-size-button"
                disabled={disabled}
                key={value}
                onClick={() => onPageSizeChange(value)}
                type="button"
              >
                {formatter.format(value)}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
