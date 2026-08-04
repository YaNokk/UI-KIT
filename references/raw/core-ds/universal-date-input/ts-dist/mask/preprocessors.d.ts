import { type MaskitoPreprocessor } from '@maskito/core';
import { type DateTemplate } from '../types';
export declare function createDisallowInputPreprocessor(): MaskitoPreprocessor;
export declare function createValidationPreprocessor(template: DateTemplate, fullStringTemplate: string, min: Date, max: Date, onCorrection: () => void): MaskitoPreprocessor;
