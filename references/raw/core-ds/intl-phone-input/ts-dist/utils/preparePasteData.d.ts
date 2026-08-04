/**
 * Подготовка данных для вставки из буфера обмена.
 * @param phoneValue Телефон уже введённый в поле ввода.
 * @param phoneFromBuffer Текст номера телефона из буфера обмена.
 * @param selectionStart Начало выделенного в инпуте текста
 * @param selectionEnd Конец выделенного в инпуте текста
 * @param ruNumberPriority Приоритетность российского номера в инпуте
 */
export declare function preparePasteData(phoneValue: string, phoneFromBuffer: string, selectionStart?: number, selectionEnd?: number, ruNumberPriority?: boolean): string;
