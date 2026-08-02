import { InternationalPhoneInput } from "@mypoint/ui/international-phone-input";
import "@mypoint/ui/styles.css";

export function TreeInternationalPhoneInput() {
  return (
    <InternationalPhoneInput
      aria-label="Tree-shaken international phone"
      defaultCountry="PL"
    />
  );
}
