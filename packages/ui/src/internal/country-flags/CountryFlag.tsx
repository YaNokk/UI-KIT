import { Globe2 } from "lucide-react";
import type { PhoneCountryCode } from "../phone/phone-number-adapter";
import { classNames } from "../../shared/classNames";
import {
  countryFlagRegistry,
  hasCountryFlagAsset
} from "./country-flag-registry";
import styles from "./CountryFlag.module.css";

export interface CountryFlagProps {
  country: PhoneCountryCode;
  size?: "sm" | "md";
}

export function CountryFlag({ country, size = "sm" }: CountryFlagProps) {
  const iso2 = country.toUpperCase();
  const className = classNames(styles.root, styles[size]);

  if (!hasCountryFlagAsset(iso2)) {
    return (
      <span
        aria-hidden="true"
        className={className}
        data-country-flag={iso2}
        data-country-flag-fallback=""
      >
        <Globe2 aria-hidden="true" focusable="false" />
      </span>
    );
  }

  const FlagAsset = countryFlagRegistry[iso2];
  return (
    <span
      aria-hidden="true"
      className={className}
      data-country-flag={iso2}
      data-country-flag-asset=""
      data-size={size}
    >
      <FlagAsset aria-hidden="true" focusable="false" />
    </span>
  );
}
