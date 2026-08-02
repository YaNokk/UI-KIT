import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getCountries } from "libphonenumber-js/min";

const repositoryRoot = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(repositoryRoot, "node_modules", "country-flag-icons", "3x2");
const outputRoot = resolve(
  repositoryRoot,
  "packages",
  "ui",
  "src",
  "internal",
  "country-flags"
);
const countries = [...getCountries()].sort();

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function prefixInternalIds(markup, country) {
  const ids = [...markup.matchAll(/\bid=(['"])([^'"]+)\1/g)]
    .map((match) => match[2]);
  let nextMarkup = markup;
  for (const id of ids) {
    const escapedId = escapeRegExp(id);
    const nextId = `${country}-${id}`;
    nextMarkup = nextMarkup
      .replace(new RegExp(`\\bid=(['"])${escapedId}\\1`, "g"), `id="${nextId}"`)
      .replace(new RegExp(`url\\(#${escapedId}\\)`, "g"), `url(#${nextId})`)
      .replace(new RegExp(`(href|xlink:href)=(['"])#${escapedId}\\2`, "g"), `$1="#${nextId}"`);
  }
  return nextMarkup;
}

const symbols = countries.map((country) => {
  const source = readFileSync(resolve(sourceRoot, `${country}.svg`), "utf8");
  const opening = source.match(/<svg\b([^>]*)>/i);
  const viewBox = opening?.[1].match(/\bviewBox=(['"])([^'"]+)\1/i)?.[2];
  const body = source
    .replace(/^\s*<svg\b[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");
  if (!viewBox) throw new Error(`Flag ${country} has no viewBox.`);
  return `  <symbol id="flag-${country}" viewBox="${viewBox}">${prefixInternalIds(body, country)}</symbol>`;
});

mkdirSync(outputRoot, { recursive: true });
writeFileSync(
  resolve(outputRoot, "country-flags.sprite.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join("\n")}\n</svg>\n`,
  "utf8"
);

const registry = `import type { PhoneCountryCode } from "../phone/phone-number-adapter";\n\n`
  + `export const countryFlagRegistry: ReadonlySet<string> = new Set(${JSON.stringify(countries, null, 2)});\n\n`
  + `export function hasCountryFlagAsset(country: string): country is PhoneCountryCode {\n`
  + `  return countryFlagRegistry.has(country);\n`
  + `}\n`;
writeFileSync(
  resolve(outputRoot, "country-flag-registry.ts"),
  registry,
  "utf8"
);

console.log(`Generated ${countries.length} country flag symbols.`);
