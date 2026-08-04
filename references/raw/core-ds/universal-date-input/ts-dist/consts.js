export const DATE_RANGE_SEPARATOR = ' – ';
export const DATE_TIME_SEPARATOR = ', ';
export const HOURS_MINUTES_SEPARATOR = ':';
export const TEMPLATES = {
    date: {
        segments: ['dd', 'MM', 'yyyy'],
        separators: ['.', '.'],
    },
    'date-time': {
        segments: ['dd', 'MM', 'yyyy', 'HH', 'mm'],
        separators: ['.', '.', DATE_TIME_SEPARATOR, HOURS_MINUTES_SEPARATOR],
    },
    'date-range': {
        segments: ['dd', 'MM', 'yyyy', 'dd', 'MM', 'yyyy'],
        separators: ['.', '.', DATE_RANGE_SEPARATOR, '.', '.'],
    },
    time: {
        segments: ['HH', 'mm'],
        separators: [HOURS_MINUTES_SEPARATOR],
    },
    month: {
        segments: ['MM', 'yyyy'],
        separators: ['.'],
    },
};
export const DATE_MAX_VALUES = {
    day: 31,
    month: 12,
    year: 9999,
    hours: 23,
    minutes: 59,
};
export const DEFAULT_MIN_DATE = new Date(1900, 0, 1).getTime();
export const DEFAULT_MAX_DATE = new Date(2124, 11, 31).getTime();
export const DATE_FORMAT = 'dd.MM.yyyy';
export const DATE_TIME_FORMAT = `dd.MM.yyyy${DATE_TIME_SEPARATOR}HH${HOURS_MINUTES_SEPARATOR}mm`;
