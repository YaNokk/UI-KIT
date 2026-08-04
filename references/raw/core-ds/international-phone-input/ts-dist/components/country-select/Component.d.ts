import React, { type ElementType } from 'react';
import { type BaseSelectProps } from '@alfalab/core-components-select/shared';
import { type Country } from '../../types';
export type SharedCountrySelectProps = Omit<BaseSelectProps, 'fieldProps' | 'options' | 'Field' | 'OptionsList' | 'selected'> & {
    /**
     * Пропсы, которые будут прокинуты в компонент поля
     */
    fieldProps?: Record<string, unknown>;
    hideCountrySelect?: boolean;
};
type CountrySelectProps = SharedCountrySelectProps & {
    countries?: Country[][];
    country?: Country;
    fieldWidth?: number;
    view: 'desktop' | 'mobile';
    SelectComponent: ElementType;
};
export declare const CountrySelect: React.FC<CountrySelectProps>;
export {};
