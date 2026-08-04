import { type RefObject } from 'react';
type Args = {
    inputRef: RefObject<HTMLInputElement>;
    countryCodeLength: number;
    clearableCountryCode: boolean;
};
export declare function useCaretAvoidCountryCode({ inputRef, countryCodeLength, clearableCountryCode, }: Args): void;
export {};
