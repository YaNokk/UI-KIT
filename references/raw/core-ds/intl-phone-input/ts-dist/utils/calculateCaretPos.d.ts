/**
 * Расчет нового положения каретки.
 * @param phonePart Шаблон с которым сравнивается новое значение. (Часть телефона без маски с учетом удаленных и добавленных цифр).
 * @param newVal Новый отформатированный телефон.
 */
export declare function calculateCaretPos(phonePart: string, newVal: string): number;
