import React, { forwardRef, useRef, useState } from 'react';
import { Input } from '@alfalab/core-components-input';
import { isCompleteMonth } from '../../utils';
const defaultMonth = '01.1900';
export const MonthInput = forwardRef((props, ref) => {
    const { onInputChange, onChange, onClear, onBlur, autoCorrection, clear, defaultValue, value = '', ...restProps } = props;
    const [inputValue, setInputValue] = useState(value ?? defaultValue);
    const prevValueProp = useRef(value);
    const lastValidMonth = useRef(defaultMonth);
    // getDerivedStateFromProps
    if ('value' in props && !(value === prevValueProp.current)) {
        prevValueProp.current = value;
        if (!(inputValue === value)) {
            setInputValue(value);
            lastValidMonth.current = isCompleteMonth(value) ? value : defaultMonth;
        }
    }
    const changeInputValue = (val, event) => {
        onInputChange?.(event, { value: val });
        setInputValue(val);
        const isComplete = isCompleteMonth(val);
        if (val === '' || isComplete) {
            onChange?.(val);
            lastValidMonth.current = isComplete ? val : defaultMonth;
        }
    };
    const handleInputChange = (event) => {
        changeInputValue(event.target.value, event);
    };
    const handleClear = (event) => {
        changeInputValue('', null);
        onClear?.(event);
    };
    const handleBlur = (event) => {
        onBlur?.(event);
        if (autoCorrection && inputValue && !isCompleteMonth(inputValue)) {
            changeInputValue(lastValidMonth.current, null);
        }
    };
    return (React.createElement(Input, { ...restProps, ref: ref, clear: clear && isCompleteMonth(inputValue), onClear: handleClear, onBlur: handleBlur, onInput: handleInputChange, value: inputValue, inputMode: 'decimal' }));
});
