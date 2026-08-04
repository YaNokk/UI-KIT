import React, { forwardRef } from 'react';
import { InputMobile } from '@alfalab/core-components-input/mobile';
import { InputAutocompleteMobile } from '@alfalab/core-components-input-autocomplete/mobile';
import { SelectMobile } from '@alfalab/core-components-select/mobile';
import { BaseInternationalPhoneInput } from '../components/base-international-phone-input';
export const InternationalPhoneInputMobile = forwardRef((props, ref) => (React.createElement(BaseInternationalPhoneInput, { selected: props.value, ...props, view: 'mobile', ref: ref, SelectComponent: SelectMobile, Input: InputMobile, InputAutocomplete: InputAutocompleteMobile })));
