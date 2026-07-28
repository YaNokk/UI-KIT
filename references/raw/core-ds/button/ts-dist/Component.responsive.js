import React, { forwardRef } from 'react';
import { useIsDesktop } from '@alfalab/core-components-mq';
import { ButtonDesktop } from './desktop';
import { ButtonMobile } from './mobile';
export const Button = forwardRef(({ children, breakpoint, client, defaultMatchMediaValue = client === undefined ? undefined : client === 'desktop', ...restProps }, ref) => {
    const isDesktop = useIsDesktop(breakpoint, defaultMatchMediaValue);
    const Component = isDesktop ? ButtonDesktop : ButtonMobile;
    return (React.createElement(Component, { ref: ref, ...restProps }, children));
});
Button.displayName = 'Button';
