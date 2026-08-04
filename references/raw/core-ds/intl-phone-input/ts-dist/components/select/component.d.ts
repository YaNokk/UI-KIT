import { type FC } from 'react';
import { type SelectDesktopProps } from '@alfalab/core-components-select/desktop';
import { type Country } from '@alfalab/utils';
type CountriesSelectProps = Pick<SelectDesktopProps, 'size' | 'dataTestId' | 'disabled' | 'onChange' | 'preventFlip'> & {
    selected?: string;
    countries: Country[];
    fieldWidth: number | null;
};
export declare const CountriesSelect: FC<CountriesSelectProps>;
export {};
