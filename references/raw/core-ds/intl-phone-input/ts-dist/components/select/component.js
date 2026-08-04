/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useMemo } from 'react';
import { SelectDesktop } from '@alfalab/core-components-select/desktop';
import { VirtualOptionsList } from '@alfalab/core-components-select/shared';
import { FlagIcon } from '../flag-icon';
import { EMPTY_COUNTRY_SELECT_FIELD, SelectField } from '../select-field';
import styles from './index.module.css';
export const CountriesSelect = ({ disabled, size, selected, countries, fieldWidth, preventFlip, onChange, dataTestId, }) => {
    const options = useMemo(() => countries.map(({ iso2, dialCode, name }) => ({
        key: iso2,
        value: iso2,
        content: (React.createElement("span", { className: styles.option },
            React.createElement(FlagIcon, { country: iso2, className: styles.flag }),
            React.createElement("span", { className: styles.optionTextWrap },
                React.createElement("span", { className: styles.countryName }, name),
                React.createElement("span", { className: styles.dialCode },
                    "+",
                    dialCode)))),
    })), [countries]);
    const renderOptionsList = useCallback((props) => (React.createElement("div", { style: { width: fieldWidth || 0 } },
        React.createElement(VirtualOptionsList, { ...props, optionsListWidth: 'field' }))), [fieldWidth]);
    return (React.createElement("div", { className: styles.component, onClick: (event) => event.stopPropagation() },
        React.createElement(SelectDesktop, { dataTestId: dataTestId, disabled: disabled, size: size, options: options, selected: selected || EMPTY_COUNTRY_SELECT_FIELD, onChange: onChange, Field: SelectField, OptionsList: renderOptionsList, preventFlip: preventFlip })));
};
