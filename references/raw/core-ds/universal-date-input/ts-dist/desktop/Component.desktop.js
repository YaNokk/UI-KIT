import React, { forwardRef } from 'react';
import { BaseUniversalDateInput } from '../components/base-universal-date-input';
export const UniversalDateInputDesktop = forwardRef((props, ref) => (React.createElement(BaseUniversalDateInput, { ...props, ref: ref, breakpoint: 1, platform: 'desktop', defaultMatchMediaValue: true })));
