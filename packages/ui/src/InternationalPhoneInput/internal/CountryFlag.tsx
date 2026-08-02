import type { PhoneCountryCode } from "../../internal/phone/phone-number-adapter";
import styles from "../InternationalPhoneInput.module.css";

export function CountryFlag({ country }: { country: PhoneCountryCode }) {
  const iso2 = country.toUpperCase();
  const flag = /^[A-Z]{2}$/.test(iso2)
    ? String.fromCodePoint(...[...iso2].map((letter) => 127397 + letter.charCodeAt(0)))
    : "";

  return (
    <span aria-hidden="true" className={styles.flag} data-country-flag={iso2}>
      {flag}
    </span>
  );
}
