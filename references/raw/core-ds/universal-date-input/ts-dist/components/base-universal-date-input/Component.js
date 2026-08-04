import React, { forwardRef, useEffect, useMemo, useRef, useState, } from 'react';
import mergeRefs from 'react-merge-refs';
import { useMaskito } from '@maskito/react';
import cn from 'classnames';
import { endOfDay, startOfDay } from 'date-fns';
import { hasOwnProperty } from '@alfalab/core-components-shared';
import { DATE_RANGE_SEPARATOR, DEFAULT_MAX_DATE, DEFAULT_MIN_DATE, HOURS_MINUTES_SEPARATOR, } from '../../consts';
import { createMaskOptions } from '../../mask';
import { DateInput } from '../date-input';
import { DateRangeInput } from '../date-range-input';
import { MonthInput } from '../month-input';
import { TimeInput } from '../time-input';
import styles from '../../index.module.css';
export const BaseUniversalDateInput = forwardRef((props, ref) => {
    const { autoCorrection = true, minDate = DEFAULT_MIN_DATE, maxDate = DEFAULT_MAX_DATE, view, picker, calendarOpen = false, onCalendarOpenChange, onCalendarClose, onCalendarOpen, platform, onKeyDown, disabled, readOnly, fieldClassName, disableUserInput, correctionRef, ...restProps } = props;
    const [correctionOccurred, setCorrectionOccurred] = useState(false);
    const [open, setOpen] = useState(calendarOpen);
    const prevOpenRef = useRef(open);
    const isControlledCalendarOpen = hasOwnProperty(props, 'calendarOpen');
    // getDerivedStateFromProps
    if (isControlledCalendarOpen && calendarOpen !== open) {
        setOpen(calendarOpen);
    }
    useEffect(() => {
        const prevOpen = prevOpenRef.current;
        if (prevOpen === open) {
            return;
        }
        prevOpenRef.current = open;
        if (!picker || isControlledCalendarOpen) {
            return;
        }
        onCalendarOpenChange?.(open);
        if (prevOpen && !open) {
            onCalendarClose?.();
        }
        if (!prevOpen && open) {
            onCalendarOpen?.();
        }
    }, [
        isControlledCalendarOpen,
        onCalendarClose,
        onCalendarOpen,
        onCalendarOpenChange,
        open,
        picker,
    ]);
    const inputRef = useRef(null);
    const calendarRef = useRef(null);
    const inputWrapperRef = useRef(null);
    const maskOptions = useMemo(() => createMaskOptions(view, startOfDay(minDate), endOfDay(maxDate), autoCorrection, handleCorrection), [view, minDate, maxDate, autoCorrection]);
    const maskRef = useMaskito({ options: maskOptions });
    useEffect(() => {
        let timeoutId;
        if (correctionOccurred) {
            timeoutId = setTimeout(() => setCorrectionOccurred(false), 150);
        }
        return () => clearTimeout(timeoutId);
    }, [correctionOccurred]);
    const openCalendar = () => {
        if (picker) {
            if (isControlledCalendarOpen) {
                onCalendarOpen?.();
                onCalendarOpenChange?.(true);
                return;
            }
            setOpen(true);
        }
    };
    const closeCalendar = () => {
        if (picker) {
            if (isControlledCalendarOpen) {
                onCalendarClose?.();
                onCalendarOpenChange?.(false);
                return;
            }
            setOpen(false);
        }
    };
    function handleCorrection() {
        setCorrectionOccurred(true);
    }
    const handleKeyDown = (event) => {
        if (event.key === 'Escape')
            closeCalendar();
    };
    const handleInputKeyDown = (event) => {
        if (['ArrowDown', 'ArrowUp'].includes(event.key) && calendarRef.current) {
            event.preventDefault();
            calendarRef.current.focus();
        }
        if (event.key === 'Enter') {
            if (open)
                closeCalendar();
            else
                openCalendar();
        }
        onKeyDown?.(event);
    };
    const handleClick = (event) => {
        if (!inputWrapperRef.current?.contains(event.target))
            return;
        if (platform === 'desktop') {
            if (!open)
                openCalendar();
            inputRef.current?.focus();
        }
        if (platform === 'mobile' && disableUserInput && !open) {
            openCalendar();
        }
    };
    const handlePickerClick = () => {
        if (platform === 'mobile' && !disableUserInput && !open) {
            openCalendar();
        }
    };
    const handleFocus = (event) => {
        if (!inputWrapperRef.current?.contains(event.target))
            return;
        if (platform === 'desktop')
            openCalendar();
    };
    const handleBlur = (event) => {
        if (platform === 'desktop') {
            const target = (event.relatedTarget || document.activeElement);
            if (inputRef.current !== target &&
                calendarRef.current?.contains(target) === false) {
                closeCalendar();
            }
        }
    };
    const inputDisabled = disabled || readOnly;
    const commonProps = {
        autoComplete: picker ? 'off' : undefined,
        disableUserInput,
        autoCorrection,
        disabled,
        readOnly,
        fieldClassName: cn(fieldClassName, { [styles.blink]: correctionOccurred }),
        onKeyDown: handleInputKeyDown,
    };
    const pickerProps = {
        platform,
        picker,
        onCalendarClose: closeCalendar,
        onPickerClick: handlePickerClick,
        wrapperHandlers: {
            onKeyDown: inputDisabled ? undefined : handleKeyDown,
            onClick: inputDisabled ? undefined : handleClick,
            onFocus: inputDisabled ? undefined : handleFocus,
            onBlur: handleBlur,
        },
        minDate,
        maxDate,
    };
    switch (view) {
        case 'date':
        case 'date-time':
            return (React.createElement(DateInput, { placeholder: view === 'date-time' ? 'ДД.ММ.ГГГГ, ЧЧ:ММ' : 'ДД.ММ.ГГГГ', ...restProps, ...commonProps, ...pickerProps, withTime: view === 'date-time', open: open, calendarRef: calendarRef, inputWrapperRef: inputWrapperRef, ref: mergeRefs([ref, maskRef, inputRef]) }));
        case 'date-range':
            return (React.createElement(DateRangeInput, { placeholder: `ДД.ММ.ГГГГ${DATE_RANGE_SEPARATOR}ДД.ММ.ГГГГ`, ...restProps, ...commonProps, ...pickerProps, open: open, calendarRef: calendarRef, inputWrapperRef: inputWrapperRef, ref: mergeRefs([ref, maskRef, inputRef]) }));
        case 'time':
            return (React.createElement(TimeInput, { placeholder: `ЧЧ${HOURS_MINUTES_SEPARATOR}ММ`, ...restProps, ...commonProps, ref: mergeRefs([ref, maskRef, inputRef]) }));
        case 'month':
            return (React.createElement(MonthInput, { placeholder: '\u041C\u041C.\u0413\u0413\u0413\u0413', ...restProps, ...commonProps, ref: mergeRefs([ref, maskRef, inputRef]) }));
        default:
            throw new Error('The view prop must be specified');
    }
});
