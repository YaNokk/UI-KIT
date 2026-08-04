import { type SyntheticEvent } from 'react';
export declare function parseDateString(value: string, format?: string): Date;
export declare const formatDate: (date: Date | number, dateFormat?: string) => string;
export declare function formatDateRange(range: {
    dateFrom: Date | number;
    dateTo: Date | number;
}): string;
export declare function isCompleteDate(value?: string): boolean;
export declare function isCompleteTime(value?: string, withTime?: boolean): boolean;
export declare function isCompleteMonth(value?: string): boolean;
export declare function isCompleteDateRange(value?: string): boolean;
export declare function isValidDate({ value, minDate, maxDate, offDays, }: {
    value?: string;
    minDate: number;
    maxDate: number;
    offDays?: Array<Date | number>;
}): boolean;
export declare function preventDefault(e: SyntheticEvent): void;
export declare function getValidRange({ from, to, offDays, minDate, maxDate, }: {
    from: string;
    to: string;
    offDays?: Array<Date | number>;
    minDate: number;
    maxDate: number;
}): {
    validFrom: Date | undefined;
    validTo: Date | undefined;
};
/**
 * Частично копипаста updatePeriod хука в календаре
 */
export declare function updateRange({ date, validFrom, validTo, rangeBehavior, }: {
    date?: number;
    validFrom?: Date;
    validTo?: Date;
    rangeBehavior: 'clarification' | 'reset';
}): string;
export declare function getUniversalDateInputTestIds(dataTestId: string): {
    input: string;
    componentWrapper: string;
    popover: string;
    calendar: string;
    inputWrapper: string;
    inputWrapperInner: string;
    leftAddons: string;
    rightAddons: string;
    error: string;
    hint: string;
};
