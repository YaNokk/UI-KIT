import React, { forwardRef, useEffect, useRef, useState, } from 'react';
import { Input } from '@alfalab/core-components-input';
import { HOURS_MINUTES_SEPARATOR } from '../../consts';
import { isCompleteTime } from '../../utils';
const defaultTime = `00${HOURS_MINUTES_SEPARATOR}00`;
export const TimeInput = forwardRef(({ autoCorrection, value: valueProp, defaultValue, clear, onClear, onChange, onInputChange, onBlur, ...restProps }, ref) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const lastValidTime = useRef(defaultTime);
    useEffect(() => {
        if (autoCorrection && !inputValue) {
            lastValidTime.current = defaultTime;
        }
    }, [autoCorrection, inputValue]);
    useEffect(() => {
        if (valueProp !== undefined) {
            setInputValue(valueProp);
        }
    }, [valueProp]);
    const callOnChange = (val) => {
        onChange?.(val);
        lastValidTime.current = val;
    };
    const changeInputValue = (val, event) => {
        onInputChange?.(event, { value: val });
        setInputValue(val);
        if (val === '' || isCompleteTime(val, true))
            callOnChange(val);
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
        if (autoCorrection && inputValue && !isCompleteTime(inputValue, true)) {
            changeInputValue(lastValidTime.current, null);
        }
    };
    return (React.createElement(Input, { ...restProps, clear: clear && isCompleteTime(inputValue, true), onClear: valueProp === undefined ? handleClear : onClear, onBlur: handleBlur, onInput: handleInputChange, ref: ref, value: inputValue, inputMode: 'decimal' }));
});
