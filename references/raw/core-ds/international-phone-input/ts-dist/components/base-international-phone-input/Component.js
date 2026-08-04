import React, { forwardRef, useEffect, useMemo, useRef, useState, } from 'react';
import mergeRefs from 'react-merge-refs';
import { maskitoTransform } from '@maskito/core';
import { useMaskito } from '@maskito/react';
import { BaseOption } from '@alfalab/core-components-select/shared';
import { createMaskOptions, filterPhones, findCountry, getClear, getInitialValueFromCountry, getPhoneData, initCountries, } from '../../utils';
import { CountrySelect } from '../country-select';
import styles from './index.module.css';
export const BaseInternationalPhoneInput = forwardRef(({ clearableCountryCode: clearableCountryCodeFromProps = true, value, country: countryProp, filterFn, onChange, onCountryChange, countrySelectProps, countries, defaultIso2, disabled, options, size = 56, Input, InputAutocomplete, SelectComponent, view, clear: clearProp, open: openProps, defaultOpen, customCountriesList, autoFill, ...restProps }, ref) => {
    const { readOnly } = restProps;
    const countriesData = useMemo(() => initCountries(countries, customCountriesList), [countries, customCountriesList]);
    const inputRef = useRef(null);
    const inputWrapperRef = useRef(null);
    const [open, setOpen] = useState(defaultOpen);
    const [openCountry, setOpenCountry] = useState(countrySelectProps?.defaultOpen);
    const beforeAutofillValueRef = useRef('');
    const [selectedCountry, setSelectedCountry] = useState(() => findCountry(countriesData, value, defaultIso2, countryProp));
    const filteredOptions = filterPhones(value, options, filterFn);
    const country = countryProp ?? selectedCountry;
    const handleCountryChange = (nextCountry) => {
        if (countryProp === undefined)
            setSelectedCountry(nextCountry);
        onCountryChange?.(nextCountry);
    };
    const preserveCountryCode = clearableCountryCodeFromProps === 'preserve';
    const clearableCountryCode = preserveCountryCode || clearableCountryCodeFromProps;
    const maskOptions = useMemo(() => createMaskOptions(country, clearableCountryCode, preserveCountryCode, beforeAutofillValueRef), [country, clearableCountryCode, preserveCountryCode]);
    const maskRef = useMaskito({ options: maskOptions });
    const changeNumber = (phone) => {
        onChange?.(phone);
    };
    const updatePhoneData = (phone) => {
        const { nextCountry, nextPhone } = getPhoneData(phone, countriesData, defaultIso2);
        if (nextCountry !== country) {
            handleCountryChange?.(nextCountry);
        }
        changeNumber(nextPhone);
    };
    const handleSelectCountry = ({ selected }) => {
        const nextCountry = selected?.value;
        handleCountryChange?.(nextCountry);
        if (nextCountry) {
            changeNumber(getInitialValueFromCountry(nextCountry.countryCode));
        }
        requestAnimationFrame(() => inputRef.current?.focus());
    };
    const handleOptionSelect = (payload) => {
        updatePhoneData(maskitoTransform(typeof payload === 'string' ? payload : payload.selected?.key || '', maskOptions));
    };
    const handleInput = ({ target: { value: inputValue } }) => {
        updatePhoneData(inputValue);
    };
    const handleClear = (event) => {
        restProps.inputProps?.onClear?.(event);
        if (clearableCountryCode) {
            const nextCountry = findCountry(countriesData, '', defaultIso2, countryProp);
            changeNumber('');
            handleCountryChange(nextCountry);
        }
        else {
            changeNumber(country ? getInitialValueFromCountry(country.countryCode) : '');
        }
    };
    useEffect(() => {
        if (value) {
            const newValue = maskitoTransform(value, maskOptions);
            if (value !== newValue) {
                updatePhoneData(newValue);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, maskOptions]);
    const openPhoneSelect = (payload) => {
        if (openProps === undefined)
            setOpen(payload.open);
        restProps.onOpen?.(payload);
    };
    const openCountrySelect = (payload) => {
        if (countrySelectProps?.open === undefined)
            setOpenCountry(payload.open);
        countrySelectProps?.onOpen?.(payload);
    };
    const handlePhoneSelectOpen = (payload) => {
        if (payload.open) {
            openCountrySelect({ open: false });
        }
        openPhoneSelect(payload);
    };
    const handleCountrySelectOpen = (payload) => {
        if (payload.open) {
            openPhoneSelect({ open: false });
        }
        openCountrySelect(payload);
    };
    const showPhoneSelect = Boolean(open || openProps);
    const showCountrySelect = Boolean(openCountry || countrySelectProps?.open);
    const renderCountrySelect = (compact = false) => {
        if (disabled || readOnly) {
            return undefined;
        }
        return (React.createElement(CountrySelect, { dataTestId: restProps?.dataTestId, size: size, ...countrySelectProps, view: view, SelectComponent: SelectComponent, disabled: disabled || countrySelectProps?.disabled, onChange: handleSelectCountry, country: country, countries: compact ? [] : countriesData, fieldWidth: inputWrapperRef.current?.getBoundingClientRect().width, onOpen: handleCountrySelectOpen, open: showCountrySelect }));
    };
    const inputProps = {
        className: styles.component,
        ref: mergeRefs([maskRef, ref, inputRef]),
        wrapperRef: inputWrapperRef,
        addonsClassName: styles.addons,
        type: 'tel',
        autoComplete: 'tel',
        clear: getClear(clearProp, clearableCountryCode, value, country?.countryCode),
        ...restProps.inputProps,
    };
    return Array.isArray(options) ? (React.createElement(InputAutocomplete, { closeOnSelect: true, Option: BaseOption, size: size, ...restProps, disabled: disabled, options: filteredOptions, value: value, open: showPhoneSelect, onOpen: handlePhoneSelectOpen, onChange: handleOptionSelect, onInput: (phone) => updatePhoneData(phone), inputProps: {
            ...inputProps,
            onClear: handleClear,
            onInput: handleInput,
            leftAddons: renderCountrySelect(view === 'mobile'),
        }, fieldProps: {
            ...restProps.fieldProps,
            className: inputProps.className,
            addonsClassName: inputProps.addonsClassName,
            ...(view === 'mobile' ? { leftAddons: renderCountrySelect() } : null),
        } })) : (React.createElement(Input, { ...restProps, ...inputProps, onClear: inputProps.clear ? handleClear : undefined, leftAddons: renderCountrySelect(), size: size, onInput: handleInput, value: value, disabled: disabled }));
});
