import { type DateSegments, type DateTemplate } from '../types';
export declare function isDigit(v: string): boolean;
/**
 *  Делит строку на сегменты по разделителям.
 *  01.01.2020, 00:00 -> ['01', '01', '2020', '00', '00']
 */
export declare function getValueSegments(rawValue: string, separators: string[]): string[];
/**
 *  Переносит лишнее значение сегмента в начало следующего.
 *  Например, ['00', '000', '1'] -> ['00', '00', '01']
 */
export declare function shiftSegmentsData(rawSegments: string[], templateSegments: string[]): string[];
/**
 *  Заменяет значение сегмента, в котором стоит каретка.
 *  Например, data:1, selection: [0.0], segments: ['00', '000', '1'] -> ['10', '00', '1']
 */
export declare function replaceSegmentsData(rawSegments: string[], template: DateTemplate, selection: readonly [number, number], data: string): string[];
/**
 * Возвращает информацию о каретке(сегмент, сдвиг внутри сегмента)
 */
export declare function findCursorPlace(segments: string[], templateSegments: string[], separators: string[], selection: readonly [number, number]): {
    segmentIdx: number;
    offset: number;
    beforeNext: boolean;
} | undefined;
/**
 * Возвращает маску по сегментам
 * segments: ['00', '12'], separators: ['.', '.'] -> [/\d/, /\d/, '.', /\d/, /\d/]
 */
export declare function segmentsToPattern(segments: string[], separators: string[]): (string | RegExp)[];
/**
 * Склеивает сегменты в строку
 * segments:['00', '00'], separators: ['.', '.'] -> 00.00
 */
export declare function segmentsToString(segments: string[], separators: string[]): string;
/**
 *  Удаляет разделители с конца строки.
 *  01.12. -> 01.12
 */
export declare function removeSeparatorsFromTail(str: string): string;
/**
 *  Возвращает кол-во разделителей в начале строки.
 *  countSeparatorsFromHead('..2024') -> 2
 */
export declare function countSeparatorsFromHead(str: string, startFrom?: number): number;
/**
 *  Валидация сегментов.
 *  9.9 -> 09.09
 */
export declare function validateSegments({ dateTemplate, templateSegments, segments, selection: [from, to], min, max, }: {
    segments: string[];
    templateSegments: string[];
    dateTemplate: string;
    selection: [number, number];
    min: Date;
    max: Date;
}): {
    validatedDateString: string;
    updatedSelection: [number, number];
};
/**
 *  Валидация сегментов с учетом границ min, max.
 *  35.02 -> 29.02, 01.01.0001 -> 01.01.1900
 */
export declare function minMaxValidation(segments: Partial<DateSegments>, min: Date, max: Date): void;
export declare function padWithZeroesUntilValid(segmentValue: string, paddedMaxValue: string, prefixedZeroesCount?: number): {
    prefixedZeroesCount: number;
    validatedSegmentValue: string;
};
/**
 *  Превращает объект с сегментами в строку
 */
export declare function toDateString({ day, month, year, hours, minutes }: Partial<DateSegments>, dateTemplate: string): string;
export declare function parseDateRangeString(dateRange: string, maxLen: number): string[];
export declare function segmentsToObj(segments: string[], templateSegments: string[]): Partial<DateSegments>;
