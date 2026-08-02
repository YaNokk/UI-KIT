import { maskitoPhoneOptionsGenerator } from "@maskito/phone";
import metadata from "libphonenumber-js/min/metadata";
import type { CountryCode } from "libphonenumber-js/min";
import type { MaskitoOptions } from "@maskito/core";
import { isPhoneCountryCode, type PhoneCountryCode } from "./phone-number-adapter";

export function createPhoneMask(
  country: PhoneCountryCode | null
): MaskitoOptions {
  return maskitoPhoneOptionsGenerator({
    ...(country !== null && isPhoneCountryCode(country)
      ? { countryIsoCode: country.toUpperCase() as CountryCode }
      : {}),
    metadata,
    strict: false,
    separator: " "
  });
}
