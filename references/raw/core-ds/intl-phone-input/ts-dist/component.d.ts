import React from 'react';
import { type CountryCode } from 'libphonenumber-js/min';
import { type InputAutocompleteDesktopProps } from '@alfalab/core-components-input-autocomplete/desktop';
import { type SelectProps } from '@alfalab/core-components-select';
import { type Country } from '@alfalab/utils';
type MaxPhoneLenByCountry = Record<string, number>;
export type IntlPhoneInputProps = Partial<Omit<InputAutocompleteDesktopProps, 'onChange'>> & Pick<SelectProps, 'preventFlip'> & {
    /**
     * Значение
     */
    value: string;
    /**
     * Набор цветов для компонента
     */
    colors?: 'default' | 'inverted';
    /**
     * Обработчик события изменения значения
     */
    onChange: (value: string) => void;
    /**
     * Дефолтный код страны
     */
    defaultCountryIso2?: string;
    /**
     * Обработчик события изменения страны
     */
    onCountryChange?: (countryCode?: CountryCode) => void;
    /**
     * Список стран
     */
    countries?: Country[];
    /**
     * Максимальная длина кода страны
     */
    maxDialCodeLength?: number;
    /**
     * Возможность стереть код страны
     */
    clearableCountryCode?: boolean;
    /**
     * Ограничение длин вводимых номеров по странам.
     */
    maxPhoneLen?: MaxPhoneLenByCountry;
    hideCountrySelect?: boolean;
    canBeEmptyCountry?: boolean;
    ruNumberPriority?: boolean;
    clear?: boolean;
};
/**
 * @deprecated
 * use InternationalPhoneInput instead
 */
export declare const IntlPhoneInput: React.ForwardRefExoticComponent<Partial<Omit<InputAutocompleteDesktopProps, "onChange">> & Pick<SelectProps, "preventFlip"> & {
    /**
     * Значение
     */
    value: string;
    /**
     * Набор цветов для компонента
     */
    colors?: "default" | "inverted";
    /**
     * Обработчик события изменения значения
     */
    onChange: (value: string) => void;
    /**
     * Дефолтный код страны
     */
    defaultCountryIso2?: string;
    /**
     * Обработчик события изменения страны
     */
    onCountryChange?: (countryCode?: CountryCode) => void;
    /**
     * Список стран
     */
    countries?: Country[];
    /**
     * Максимальная длина кода страны
     */
    maxDialCodeLength?: number;
    /**
     * Возможность стереть код страны
     */
    clearableCountryCode?: boolean;
    /**
     * Ограничение длин вводимых номеров по странам.
     */
    maxPhoneLen?: MaxPhoneLenByCountry;
    hideCountrySelect?: boolean;
    canBeEmptyCountry?: boolean;
    ruNumberPriority?: boolean;
    clear?: boolean;
} & React.RefAttributes<HTMLInputElement>>;
export {};
