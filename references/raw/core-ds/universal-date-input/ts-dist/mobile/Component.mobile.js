import React, { forwardRef } from 'react';
import { BaseUniversalDateInput } from '../components/base-universal-date-input';
export const UniversalDateInputMobile = forwardRef((props, ref) => (React.createElement(BaseUniversalDateInput, { ...props, ref: ref, breakpoint: 10000, platform: 'mobile', defaultMatchMediaValue: false })));
