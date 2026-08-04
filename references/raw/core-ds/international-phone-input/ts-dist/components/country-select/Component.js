import React, { useCallback, useMemo } from 'react';
import cn from 'classnames';
import { BaseOption, VirtualOptionsList, } from '@alfalab/core-components-select/shared';
import { getDataTestId } from '@alfalab/core-components-shared';
import { WorldMagnifierMIcon } from '@alfalab/icons-glyph/WorldMagnifierMIcon';
import { FlagIcon } from '../flag-icon';
import { EMPTY_COUNTRY_SELECT_FIELD, SelectField } from '../select-field';
import styles from './index.module.css';
export const CountrySelect = ({ hideCountrySelect, countries, country, dataTestId, fieldWidth, onChange, view = 'desktop', SelectComponent, size, ...restProps }) => {
    const isMobile = useMemo(() => view === 'mobile', [view]);
    const options = useMemo(() => countries?.map((areas) => {
        const { iso2, dialCode, name } = areas[0];
        return {
            key: iso2,
            value: areas[0],
            content: (React.createElement("span", { className: cn([
                    styles.option,
                    styles[`size-${size}`],
                    isMobile && styles.mobile,
                ]) },
                React.createElement(FlagIcon, { country: iso2, className: styles.flag }),
                React.createElement("span", { className: styles.optionTextWrap },
                    React.createElement("span", { className: styles.countryName }, name),
                    React.createElement("span", { className: styles.dialCode },
                        "+",
                        dialCode)))),
        };
    }) || [], [countries, size, isMobile]);
    const renderOptionsList = useCallback((props) => (React.createElement("div", { style: { width: fieldWidth || 0 } },
        React.createElement(VirtualOptionsList, { ...props, optionsListWidth: 'field' }))), [fieldWidth]);
    const renderFlagIcon = () => (React.createElement("span", { className: styles.flagIconWrapper }, country?.iso2 ? (React.createElement(FlagIcon, { country: country.iso2 })) : (React.createElement(WorldMagnifierMIcon, { className: styles.emptyCountryIcon }))));
    const renderCountrySelect = () => {
        const selected = options.find((c) => c.key === country?.iso2);
        return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        React.createElement("div", { className: styles.component, onClick: (event) => event.stopPropagation() },
            React.createElement(SelectComponent, { Option: BaseOption, size: size, ...restProps, dataTestId: getDataTestId(dataTestId, 'country-select'), options: options, selected: selected?.key || EMPTY_COUNTRY_SELECT_FIELD, onChange: onChange, Field: SelectField, optionProps: {
                    'aria-label': selected?.value?.name || 'Сменить код страны',
                }, OptionsList: isMobile ? VirtualOptionsList : renderOptionsList, ...(isMobile && {
                    bottomSheetProps: {
                        title: 'Выберите страну',
                        showSwipeMarker: false,
                    },
                }) })));
    };
    return hideCountrySelect || options.length < 2 ? renderFlagIcon() : renderCountrySelect();
};
