import { Globe2 } from "lucide-react";
import type { PhoneCountryCode } from "../phone/phone-number-adapter";
import { classNames } from "../../shared/classNames";
import { hasCountryFlagAsset } from "./country-flag-registry";
import countryFlagSpriteUrl from "./country-flags.sprite.svg?url";
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

  return (
    <span
      aria-hidden="true"
      className={className}
      data-country-flag={iso2}
      data-country-flag-asset=""
      data-size={size}
    >
      <svg aria-hidden="true" focusable="false" viewBox="0 0 3 2">
        <use href={`${countryFlagSpriteUrl}#flag-${iso2}`} />
      </svg>
    </span>
  );
}
