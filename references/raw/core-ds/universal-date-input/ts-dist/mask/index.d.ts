import { type MaskitoOptions } from '@maskito/core';
import { type View } from '../types';
export declare function createMaskOptions(view: View, min: Date, max: Date, autoCorrection: boolean, onCorrection: () => void): MaskitoOptions;
