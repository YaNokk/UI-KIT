import { type FC } from 'react';
export type FlagIconProps = {
    /**
     * Код страны из <a href="https://ru.wikipedia.org/wiki/ISO_3166-1_alpha-2" target="_blank">ISO 3166-1 alpha-2</a>
     */
    country?: string;
    /**
     * Дополнительный класс
     */
    className?: string;
};
/**
 * Компонент флага в виде иконки.
 */
export declare const FlagIcon: FC<FlagIconProps>;
