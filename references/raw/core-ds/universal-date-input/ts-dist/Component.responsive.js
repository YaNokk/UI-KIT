import React, { forwardRef } from 'react';
import { useIsDesktop } from '@alfalab/core-components-mq';
import { BaseUniversalDateInput } from './components/base-universal-date-input';
export const UniversalDateInput = forwardRef(({ breakpoint, client, defaultMatchMediaValue = client === undefined ? undefined : client === 'desktop', view, ...restProps }, ref) => {
    const isDesktop = useIsDesktop(breakpoint, defaultMatchMediaValue);
    return (React.createElement(BaseUniversalDateInput, { ...restProps, ref: ref, view: view, breakpoint: breakpoint, defaultMatchMediaValue: defaultMatchMediaValue, platform: isDesktop ? 'desktop' : 'mobile' }));
});
UniversalDateInput.displayName = 'UniversalDateInput';
