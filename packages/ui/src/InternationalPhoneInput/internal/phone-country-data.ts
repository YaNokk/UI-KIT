import {
  getCountryCallingCode,
  getPhoneCountries,
  isPhoneCountryCode,
  type PhoneCountryCode
} from "../../internal/phone/phone-number-adapter";

export interface PhoneCountry {
  iso2: PhoneCountryCode;
  callingCode: string;
  displayName: string;
  textValue: string;
}

function displayName(locale: string, country: string): string {
  if (locale.toLowerCase().startsWith("ru") && country === "US") return "США";
  try {
    const localized = new Intl.DisplayNames([locale], { type: "region" }).of(country);
    if (localized) return localized;
    const english = new Intl.DisplayNames(["en"], { type: "region" }).of(country);
    return english || country;
  } catch {
    return country;
  }
}

export function getPhoneCountryData(
  locale: string,
  allowedCountries?: readonly PhoneCountryCode[]
): PhoneCountry[] {
  const source = allowedCountries ?? getPhoneCountries();
  const seen = new Set<string>();
  const result: PhoneCountry[] = [];

  for (const rawCountry of source) {
    const iso2 = rawCountry.toUpperCase();
    if (seen.has(iso2) || !isPhoneCountryCode(iso2)) continue;
    seen.add(iso2);
    const callingCode = getCountryCallingCode(iso2);
    if (callingCode === null) continue;
    const localizedName = displayName(locale, iso2);
    result.push({
      iso2,
      callingCode,
      displayName: localizedName,
      textValue: `${localizedName} ${iso2} +${callingCode}`
    });
  }

  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return result.sort((left, right) => {
    const byName = collator.compare(left.displayName, right.displayName);
    return byName || left.iso2.localeCompare(right.iso2);
  });
}
