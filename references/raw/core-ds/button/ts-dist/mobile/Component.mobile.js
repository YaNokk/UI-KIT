import React, { forwardRef } from 'react';
import { BaseButton } from '../components/base-button';
import defaultColors from './default.mobile.module.css';
import invertedColors from './inverted.mobile.module.css';
import styles from './mobile.module.css';
const colorStyles = {
    default: defaultColors,
    inverted: invertedColors,
};
export const ButtonMobile = forwardRef((restProps, ref) => (React.createElement(BaseButton, { ...restProps, ref: ref, colorStylesMap: colorStyles, styles: styles })));
