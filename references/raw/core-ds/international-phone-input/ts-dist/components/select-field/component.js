import React, { useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import cn from 'classnames';
import { useFocus } from '@alfalab/hooks';
import { WorldMagnifierMIcon } from '@alfalab/icons-glyph/WorldMagnifierMIcon';
import { FlagIcon } from '../flag-icon';
import styles from './index.module.css';
export const EMPTY_COUNTRY_SELECT_FIELD = {
    value: 'EMPTY_COUNTRY_SELECT_VALUE',
    key: 'EMPTY_COUNTRY_SELECT_KEY',
};
export const SelectField = ({ selected, Arrow, size, disabled, innerProps = {}, }) => {
    const wrapperRef = useRef(null);
    const [focusVisible] = useFocus(wrapperRef, 'keyboard');
    const ref = innerProps.ref ? mergeRefs([innerProps.ref, wrapperRef]) : wrapperRef;
    return (React.createElement("div", { ref: ref, className: cn(styles.component, styles[`size-${size}`], {
            [styles.focusVisible]: focusVisible,
            [styles.disabled]: disabled,
        }) },
        React.createElement("div", { ...innerProps, className: styles.inner },
            React.createElement("span", { className: styles.flagIconContainer }, !selected || selected === EMPTY_COUNTRY_SELECT_FIELD ? (React.createElement(WorldMagnifierMIcon, { className: styles.emptyCountryIcon })) : (React.createElement(FlagIcon, { country: selected.key }))),
            Arrow)));
};
