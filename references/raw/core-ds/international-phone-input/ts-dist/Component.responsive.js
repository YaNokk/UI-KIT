import React, { forwardRef } from 'react';
import { useIsDesktop } from '@alfalab/core-components-mq';
import { InternationalPhoneInputDesktop } from './desktop';
import { InternationalPhoneInputMobile } from './mobile';
export const InternationalPhoneInput = forwardRef(({ breakpoint, client, defaultMatchMediaValue = client === undefined ? undefined : client === 'desktop', ...restProps }, ref) => {
    const isDesktop = useIsDesktop(breakpoint, defaultMatchMediaValue);
    return isDesktop ? (React.createElement(InternationalPhoneInputDesktop, { ...restProps, ref: ref })) : (React.createElement(InternationalPhoneInputMobile, { ...restProps, ref: ref }));
});
InternationalPhoneInput.displayName = 'InternationalPhoneInput';
