import {
  AsYouType,
  getCountries,
  getCountryCallingCode as getLibCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode
} from "libphonenumber-js/min";

export type PhoneCountryCode = string;

export interface ParsedPhoneValue {
  canonicalValue: string;
  country: PhoneCountryCode | null;
  callingCode: string | null;
  formattedValue: string;
  nationalNumber: string;
  isPossible: boolean;
  isValid: boolean;
}

const countries = getCountries();
const countrySet = new Set<string>(countries);

export function isPhoneCountryCode(value: string): value is CountryCode {
  return countrySet.has(value.toUpperCase());
}

export function getPhoneCountries(): PhoneCountryCode[] {
  return [...countries];
}

export function getCountryCallingCode(country: PhoneCountryCode): string | null {
  return isPhoneCountryCode(country)
    ? getLibCountryCallingCode(country.toUpperCase() as CountryCode)
    : null;
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function canonicalInternational(value: string): string {
  const valueDigits = digits(value).slice(0, 15);
  return valueDigits.length === 0 ? "" : `+${valueDigits}`;
}

function normalizeNational(
  value: string,
  country: PhoneCountryCode | null
): string {
  const valueDigits = digits(value);
  if (valueDigits.length === 0 || country === null) return canonicalInternational(value);

  const upperCountry = country.toUpperCase();
  const callingCode = getCountryCallingCode(upperCountry);
  if (callingCode === null) return canonicalInternational(value);

  // Russian domestic numbers are commonly pasted with the trunk prefix 8.
  if (upperCountry === "RU" && valueDigits.startsWith("8")) {
    return canonicalInternational(`${callingCode}${valueDigits.slice(1)}`);
  }

  const parsed = isPhoneCountryCode(upperCountry)
    ? parsePhoneNumberFromString(value, upperCountry)
    : undefined;
  if (parsed) return canonicalInternational(parsed.number);

  return canonicalInternational(`${callingCode}${valueDigits}`);
}

export function normalizePhoneValue(
  value: string,
  country: PhoneCountryCode | null = null
): string {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed === "+") return "";
  return trimmed.startsWith("+")
    ? canonicalInternational(trimmed)
    : normalizeNational(trimmed, country);
}

export function detectPhoneCountry(
  value: string,
  allowedCountries?: readonly PhoneCountryCode[]
): PhoneCountryCode | null {
  const canonical = normalizePhoneValue(value);
  if (canonical === "") return null;
  const allowed = allowedCountries === undefined
    ? null
    : new Set(allowedCountries.map((country) => country.toUpperCase()));
  const parsed = parsePhoneNumberFromString(canonical);

  // AsYouType must receive the number on the same instance.
  const formatter = new AsYouType();
  formatter.input(canonical);
  const country = parsed?.country ?? formatter.getCountry();
  if (!country || (allowed && !allowed.has(country))) return null;
  return country;
}

export function formatPhoneValue(
  value: string,
  country: PhoneCountryCode | null = null
): string {
  const canonical = normalizePhoneValue(value, country);
  if (canonical === "") return "";
  const normalizedCountry = country !== null && isPhoneCountryCode(country)
    ? country.toUpperCase() as CountryCode
    : null;
  const formatter = normalizedCountry !== null
    ? new AsYouType(normalizedCountry)
    : new AsYouType();
  return formatter.input(canonical) || canonical;
}

export function parsePhoneValue(
  value: string,
  country: PhoneCountryCode | null = null,
  allowedCountries?: readonly PhoneCountryCode[]
): ParsedPhoneValue {
  const canonicalValue = normalizePhoneValue(value, country);
  const parsed = canonicalValue === ""
    ? undefined
    : parsePhoneNumberFromString(canonicalValue);
  const detectedCountry = detectPhoneCountry(canonicalValue, allowedCountries);
  const resolvedCountry = detectedCountry ?? country?.toUpperCase() ?? null;
  const callingCode = resolvedCountry === null
    ? parsed?.countryCallingCode ?? null
    : getCountryCallingCode(resolvedCountry);
  const nationalNumber = parsed?.nationalNumber
    ?? (callingCode && canonicalValue.startsWith(`+${callingCode}`)
      ? canonicalValue.slice(callingCode.length + 1)
      : canonicalValue.replace(/^\+/, ""));

  return {
    canonicalValue,
    country: resolvedCountry,
    callingCode,
    formattedValue: formatPhoneValue(canonicalValue, resolvedCountry),
    nationalNumber,
    isPossible: parsed?.isPossible() ?? false,
    isValid: parsed?.isValid() ?? false
  };
}

export function isPossiblePhoneValue(value: string): boolean {
  return parsePhoneValue(value).isPossible;
}

export function isValidPhoneValue(value: string): boolean {
  return parsePhoneValue(value).isValid;
}

export function replacePhoneCountry(
  value: string,
  previousCountry: PhoneCountryCode | null,
  nextCountry: PhoneCountryCode
): string {
  const nextCallingCode = getCountryCallingCode(nextCountry);
  if (nextCallingCode === null) return normalizePhoneValue(value, previousCountry);
  const current = parsePhoneValue(value, previousCountry);
  if (current.canonicalValue === "" || current.nationalNumber.length === 0) {
    return `+${nextCallingCode}`;
  }
  return normalizePhoneValue(`+${nextCallingCode}${current.nationalNumber}`);
}
