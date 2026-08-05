import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const consumerRoot = resolve(repositoryRoot, ".artifacts", "consumer");
const npmCache = resolve(repositoryRoot, ".artifacts", "npm-cache");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable; run this script through npm.");

function runBuild(entry, outputDirectory) {
  const result = spawnSync(
    process.execPath,
    [npmCli, "run", "build", "--", "--outDir", outputDirectory],
    {
      cwd: consumerRoot,
      env: {
        ...process.env,
        NPM_CONFIG_CACHE: npmCache,
        TREE_SHAKING_ENTRY: entry
      },
      stdio: "inherit"
    }
  );
  if (result.status !== 0) {
    throw new Error(`Tree-shaking build failed for ${entry}.`);
  }
}

function readOutput(directory, extension) {
  const assets = resolve(consumerRoot, directory, "assets");
  return readdirSync(assets)
    .filter((file) => file.endsWith(extension))
    .map((file) => readFileSync(resolve(assets, file), "utf8"))
    .join("\n");
}

function findOutputFiles(directory, extension) {
  const root = resolve(consumerRoot, directory);
  if (!existsSync(root)) return [];
  const visit = (current) => readdirSync(current).flatMap((entry) => {
    const path = resolve(current, entry);
    return statSync(path).isDirectory() ? visit(path) : [path];
  });
  return visit(root).filter((path) => path.endsWith(extension));
}

if (!existsSync(resolve(consumerRoot, "node_modules", "@mypoint", "ui"))) {
  throw new Error("Consumer is not prepared. Run npm run consumer:test first.");
}

runBuild("tree", "dist-tree");
const treeJavaScript = readOutput("dist-tree", ".js");
const treeCss = readOutput("dist-tree", ".css");
if (findOutputFiles("dist-tree", ".woff2").length !== 0 || treeCss.includes("@font-face")) {
  throw new Error("Button-only styles.css build unexpectedly emitted optional Inter assets.");
}

if (treeJavaScript.includes("prefers-color-scheme: dark")) {
  throw new Error("Unused ThemeProvider implementation survived the Button-only build.");
}
if (!treeJavaScript.includes("aria-busy")) {
  throw new Error("The used Button implementation was not found in the consumer bundle.");
}
if (!treeCss.includes("--ds-action-primary-background")) {
  throw new Error("Required UI/token CSS was removed from the consumer bundle.");
}

runBuild("tree-fonts", "dist-tree-fonts");
const fontTreeCss = readOutput("dist-tree-fonts", ".css");
const fontTreeFiles = findOutputFiles("dist-tree-fonts", ".woff2");
const expectedFontNames = ["inter-regular", "inter-medium", "inter-semibold"];
if (
  fontTreeFiles.length !== expectedFontNames.length
  || expectedFontNames.some((name) => !fontTreeFiles.some((path) => path.includes(name)))
  || !fontTreeCss.includes("@font-face")
) {
  throw new Error("Button-only fonts.css build did not emit exactly the approved Inter assets.");
}

runBuild("tree-icon", "dist-tree-icon");
const iconJavaScript = readOutput("dist-tree-icon", ".js");
if (!iconJavaScript.includes("data-loading") || !iconJavaScript.includes("aria-hidden")) {
  throw new Error("The used IconButton implementation or Lucide icon was not found.");
}

runBuild("tree-checkbox", "dist-tree-checkbox");
const checkboxJavaScript = readOutput("dist-tree-checkbox", ".js");
if (
  !checkboxJavaScript.includes("Tree-shaken checkbox")
  || !checkboxJavaScript.includes("checkbox")
) {
  throw new Error("The used Checkbox implementation was not found.");
}
if (checkboxJavaScript.includes("role=\"switch\"") || checkboxJavaScript.includes("radio-group-")) {
  throw new Error("Unused Switch or RadioGroup behavior survived the Checkbox-only build.");
}
if (iconJavaScript.includes("Trash2") || iconJavaScript.includes("CashRegister")) {
  throw new Error("Unused icon catalog entries survived the Lucide-only build.");
}

runBuild("tree-link", "dist-tree-link");
const linkJavaScript = readOutput("dist-tree-link", ".js");
if (!linkJavaScript.includes("/orders")) {
  throw new Error("The used ButtonLink implementation was not found in the bundle.");
}
if (linkJavaScript.includes("data-loading")) {
  throw new Error("Button-only loading behavior survived the ButtonLink-only build.");
}

runBuild("tree-spinner", "dist-tree-spinner");
const spinnerJavaScript = readOutput("dist-tree-spinner", ".js");
if (!spinnerJavaScript.includes("data-spinner") || !spinnerJavaScript.includes("status")) {
  throw new Error("The used standalone Spinner implementation was not found.");
}
if (spinnerJavaScript.includes("data-loading")) {
  throw new Error("Button loading behavior survived the Spinner-only build.");
}

runBuild("tree-amount", "dist-tree-amount");
const amountJavaScript = readOutput("dist-tree-amount", ".js");
if (!amountJavaScript.includes("data-amount-part")) {
  throw new Error("The used Amount implementation was not found.");
}
if (amountJavaScript.toLowerCase().includes("maskito")) {
  throw new Error("Maskito editing code survived the Amount-only build.");
}

runBuild("tree-number-input", "dist-tree-number-input");
const numberInputJavaScript = readOutput("dist-tree-number-input", ".js");
if (!numberInputJavaScript.includes("spinbutton")) {
  throw new Error("The used NumberInput implementation was not found.");
}
if (
  numberInputJavaScript.includes("data-amount-part")
  || numberInputJavaScript.includes("Tree-shaken quantity")
) {
  throw new Error("Amount or retail-ui survived the NumberInput-only build.");
}

runBuild("tree-international-phone-input", "dist-tree-international-phone-input");
const phoneInputJavaScript = readOutput("dist-tree-international-phone-input", ".js");
if (
  !phoneInputJavaScript.includes("Tree-shaken international phone")
  || !phoneInputJavaScript.includes("listbox")
) {
  throw new Error("InternationalPhoneInput or its country picker was not found.");
}
if (phoneInputJavaScript.includes("data-amount-part")) {
  throw new Error("Amount survived the InternationalPhoneInput-only build.");
}

runBuild("tree-textarea", "dist-tree-textarea");
const textareaJavaScript = readOutput("dist-tree-textarea", ".js");
if (
  !textareaJavaScript.includes("Tree-shaken textarea")
  || !textareaJavaScript.includes("data-textarea-count")
) {
  throw new Error("Textarea or its character count was not found.");
}

runBuild("tree-date-input", "dist-tree-date-input");
const dateInputJavaScript = readOutput("dist-tree-date-input", ".js");
if (!dateInputJavaScript.includes("Tree-shaken date input")) {
  throw new Error("The used DateInput implementation was not found.");
}
if (
  dateInputJavaScript.includes("data-calendar-viewport")
  || dateInputJavaScript.includes("TZDate")
  || dateInputJavaScript.includes("listbox")
) {
  throw new Error("Calendar, timezone, or select behavior survived the DateInput-only build.");
}

runBuild("tree-date-range-picker", "dist-tree-date-range-picker");
const dateRangeJavaScript = readOutput("dist-tree-date-range-picker", ".js");
if (
  !dateRangeJavaScript.includes("Tree-shaken date range")
  || !dateRangeJavaScript.includes("data-calendar-viewport")
) {
  throw new Error("The used DateRangePicker implementation was not found.");
}
if (dateRangeJavaScript.includes("TZDate")) {
  throw new Error("Timezone code survived the date-only picker build.");
}

runBuild("tree-date-range-input", "dist-tree-date-range-input");
const dateRangeInputJavaScript = readOutput("dist-tree-date-range-input", ".js");
if (!dateRangeInputJavaScript.includes("Tree-shaken date range input")) {
  throw new Error("The used DateRangeInput implementation was not found.");
}
if (dateRangeInputJavaScript.includes("data-calendar-viewport")) {
  throw new Error("Calendar behavior survived the DateRangeInput-only build.");
}

runBuild("tree-date-time-range-input", "dist-tree-date-time-range-input");
const dateTimeRangeInputJavaScript = readOutput("dist-tree-date-time-range-input", ".js");
if (!dateTimeRangeInputJavaScript.includes("Tree-shaken date time range input")) {
  throw new Error("The used DateTimeRangeInput implementation was not found.");
}
if (dateTimeRangeInputJavaScript.includes("data-calendar-viewport")) {
  throw new Error("Calendar behavior survived the DateTimeRangeInput-only build.");
}

runBuild("tree-date-time-input", "dist-tree-date-time-input");
const dateTimeInputJavaScript = readOutput("dist-tree-date-time-input", ".js");
if (!dateTimeInputJavaScript.includes("Tree-shaken date time input")) {
  throw new Error("The used DateTimeInput implementation was not found.");
}
if (
  dateTimeInputJavaScript.includes("data-calendar-viewport")
  || dateTimeInputJavaScript.includes("TZDate")
  || dateTimeInputJavaScript.includes("Choose date and time range")
) {
  throw new Error("Calendar, timezone, or range behavior survived the DateTimeInput-only build.");
}

runBuild("tree-date-time-range-picker", "dist-tree-date-time-range-picker");
const dateTimeRangeJavaScript = readOutput("dist-tree-date-time-range-picker", ".js");
if (
  !dateTimeRangeJavaScript.includes("Tree-shaken date time range")
  || !dateTimeRangeJavaScript.includes("data-calendar-viewport")
) {
  throw new Error("The used DateTimeRangePicker implementation was not found.");
}

runBuild("tree-date-time-picker", "dist-tree-date-time-picker");
const dateTimePickerJavaScript = readOutput("dist-tree-date-time-picker", ".js");
if (!dateTimePickerJavaScript.includes("Tree-shaken date time picker") || !dateTimePickerJavaScript.includes("data-calendar-viewport")) {
  throw new Error("The used DateTimePicker implementation was not found.");
}
if (dateTimePickerJavaScript.includes("last-24-hours")) {
  throw new Error("Range behavior survived the DateTimePicker-only build.");
}
if (
  textareaJavaScript.includes("data-country-flag")
  || textareaJavaScript.includes("data-amount-part")
) {
  throw new Error("Phone or amount behavior survived the Textarea-only build.");
}

runBuild("tree-quantity-input", "dist-tree-quantity-input");
const quantityInputJavaScript = readOutput("dist-tree-quantity-input", ".js");
if (
  !quantityInputJavaScript.includes("Tree-shaken quantity")
  || !quantityInputJavaScript.includes("spinbutton")
) {
  throw new Error("QuantityInput or its required NumberInput was not found.");
}
if (quantityInputJavaScript.includes("data-amount-part")) {
  throw new Error("Amount survived the QuantityInput-only build.");
}

runBuild("lazy", "dist-lazy");
const manifest = JSON.parse(
  readFileSync(resolve(consumerRoot, "dist-lazy", ".vite", "manifest.json"), "utf8")
);
const hasDynamicEntry = Object.values(manifest).some((entry) => entry.isDynamicEntry);
if (!hasDynamicEntry) {
  throw new Error("Dynamic @mypoint/ui/button import did not produce an async chunk.");
}

runBuild("lazy-button-link", "dist-lazy-button-link");
const buttonLinkManifest = JSON.parse(
  readFileSync(
    resolve(consumerRoot, "dist-lazy-button-link", ".vite", "manifest.json"),
    "utf8"
  )
);
const hasButtonLinkDynamicEntry = Object.values(buttonLinkManifest).some(
  (entry) => entry.isDynamicEntry
);
if (!hasButtonLinkDynamicEntry) {
  throw new Error(
    "Dynamic @mypoint/ui/button-link import did not produce an async chunk."
  );
}

console.log(
  "Tree-shaking passed: optional Inter assets stayed opt-in; Amount excluded Maskito; ButtonLink/IconButton/Spinner stayed independent, unused ThemeProvider and icon catalog were removed, CSS retained, dynamic subpaths split."
);
