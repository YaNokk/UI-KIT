import React from 'react';
import cn from 'classnames';
import { flagSprite } from './flagSprite';
import styles from './index.module.css';
/**
 * Компонент флага в виде иконки.
 */
export const FlagIcon = ({ country = '', className }) => flagSprite[country] ? (React.createElement("span", { className: cn(styles.flagIcon, className), "data-test-id": `flag-icon-${country}`, 
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML: { __html: flagSprite[country] } })) : (React.createElement("div", { className: cn(styles.flagPlaceholder, className) }));
