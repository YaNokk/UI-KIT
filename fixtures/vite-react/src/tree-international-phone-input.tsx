import { createRoot } from "react-dom/client";
import { InternationalPhoneInput } from "@mypoint/ui/international-phone-input";
import "@mypoint/ui/styles.css";

const root = document.createElement("div");
document.body.append(root);
createRoot(root).render(
    <InternationalPhoneInput
      aria-label="Tree-shaken international phone"
      defaultCountry="PL"
    />
);
