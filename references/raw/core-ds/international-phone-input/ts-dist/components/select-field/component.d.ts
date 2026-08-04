import { type FC } from 'react';
import { type FieldProps } from '@alfalab/core-components-select/shared';
export declare const EMPTY_COUNTRY_SELECT_FIELD: {
    value: string;
    key: string;
};
type SelectFieldProps = FieldProps & {
    size?: 48 | 56 | 64 | 72;
};
export declare const SelectField: FC<SelectFieldProps>;
export {};
