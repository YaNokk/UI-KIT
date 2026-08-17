import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));
const countryFlagSpritePath = fileURLToPath(new URL(
  "./src/internal/country-flags/country-flags.sprite.svg",
  import.meta.url
));
const optionalFontAssets = [
  ["fonts.css", "./src/fonts.css"],
  ["assets/inter-regular.woff2", "./src/assets/inter-regular.woff2"],
  ["assets/inter-medium.woff2", "./src/assets/inter-medium.woff2"],
  ["assets/inter-semibold.woff2", "./src/assets/inter-semibold.woff2"],
  ["assets/LICENSE-Inter.txt", "./src/assets/LICENSE-Inter.txt"]
] as const;

export default defineConfig({
  plugins: [
    {
      name: "emit-optional-font-assets",
      buildStart() {
        for (const [fileName, sourcePath] of optionalFontAssets) {
          this.emitFile({
            type: "asset",
            fileName,
            source: readFileSync(fileURLToPath(new URL(sourcePath, import.meta.url)))
          });
        }
      }
    },
    {
      name: "emit-country-flag-sprite",
      enforce: "pre",
      resolveId(source) {
        return source.endsWith("country-flags.sprite.svg?url")
          ? "\0country-flag-sprite-url"
          : null;
      },
      load(id) {
        if (id !== "\0country-flag-sprite-url") return null;
        const referenceId = this.emitFile({
          type: "asset",
          fileName: "assets/country-flags.sprite.svg",
          source: readFileSync(countryFlagSpritePath)
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
    }
  ],
  build: {
    target: "es2022",
    sourcemap: true,
    minify: false,
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        "DesignSystemProvider/index": fileURLToPath(
          new URL("./src/DesignSystemProvider/index.ts", import.meta.url)
        ),
        "DateInput/index": fileURLToPath(new URL("./src/DateInput/index.ts", import.meta.url)),
        "TimeInput/index": fileURLToPath(new URL("./src/TimeInput/index.ts", import.meta.url)),
        "DateTimeInput/index": fileURLToPath(new URL("./src/DateTimeInput/index.ts", import.meta.url)),
        "DateTimePicker/index": fileURLToPath(new URL("./src/DateTimePicker/index.ts", import.meta.url)),
        "DatePicker/index": fileURLToPath(new URL("./src/DatePicker/index.ts", import.meta.url)),
        "DateRangeInput/index": fileURLToPath(new URL("./src/DateRangeInput/index.ts", import.meta.url)),
        "DateRangePicker/index": fileURLToPath(new URL("./src/DateRangePicker/index.ts", import.meta.url)),
        "DateTimeRangeInput/index": fileURLToPath(new URL("./src/DateTimeRangeInput/index.ts", import.meta.url)),
        "DateTimeRangePicker/index": fileURLToPath(new URL("./src/DateTimeRangePicker/index.ts", import.meta.url)),
        "Dialog/index": fileURLToPath(
          new URL("./src/Dialog/index.ts", import.meta.url)
        ),
        "Drawer/index": fileURLToPath(
          new URL("./src/Drawer/index.ts", import.meta.url)
        ),
        "Amount/index": fileURLToPath(
          new URL("./src/Amount/index.ts", import.meta.url)
        ),
        "AmountInput/index": fileURLToPath(
          new URL("./src/AmountInput/index.ts", import.meta.url)
        ),
        "Badge/index": fileURLToPath(
          new URL("./src/Badge/index.ts", import.meta.url)
        ),
        "Button/index": fileURLToPath(
          new URL("./src/Button/index.ts", import.meta.url)
        ),
        "ButtonLink/index": fileURLToPath(
          new URL("./src/ButtonLink/index.ts", import.meta.url)
        ),
        "Checkbox/index": fileURLToPath(
          new URL("./src/Checkbox/index.ts", import.meta.url)
        ),
        "CheckboxGroup/index": fileURLToPath(
          new URL("./src/CheckboxGroup/index.ts", import.meta.url)
        ),
        "BottomSheet/index": fileURLToPath(
          new URL("./src/BottomSheet/index.ts", import.meta.url)
        ),
        "FieldShell/index": fileURLToPath(
          new URL("./src/FieldShell/index.ts", import.meta.url)
        ),
        "FormControl/index": fileURLToPath(
          new URL("./src/FormControl/index.ts", import.meta.url)
        ),
        "Heading/index": fileURLToPath(
          new URL("./src/Heading/index.ts", import.meta.url)
        ),
        "IconButton/index": fileURLToPath(
          new URL("./src/IconButton/index.ts", import.meta.url)
        ),
        "Input/index": fileURLToPath(
          new URL("./src/Input/index.ts", import.meta.url)
        ),
        "InternationalPhoneInput/index": fileURLToPath(
          new URL("./src/InternationalPhoneInput/index.ts", import.meta.url)
        ),
        "Link/index": fileURLToPath(
          new URL("./src/Link/index.ts", import.meta.url)
        ),
        "modal/index": fileURLToPath(
          new URL("./src/modal/index.ts", import.meta.url)
        ),
        "NumberInput/index": fileURLToPath(
          new URL("./src/NumberInput/index.ts", import.meta.url)
        ),
        "Notification/index": fileURLToPath(
          new URL("./src/Notification/index.ts", import.meta.url)
        ),
        "PasswordInput/index": fileURLToPath(
          new URL("./src/PasswordInput/index.ts", import.meta.url)
        ),
        "Radio/index": fileURLToPath(
          new URL("./src/Radio/index.ts", import.meta.url)
        ),
        "RadioGroup/index": fileURLToPath(
          new URL("./src/RadioGroup/index.ts", import.meta.url)
        ),
        "Select/index": fileURLToPath(
          new URL("./src/Select/index.ts", import.meta.url)
        ),
        "Sidebar/index": fileURLToPath(
          new URL("./src/Sidebar/index.ts", import.meta.url)
        ),
        "MultiSelect/index": fileURLToPath(
          new URL("./src/MultiSelect/index.ts", import.meta.url)
        ),
        "Portal/index": fileURLToPath(
          new URL("./src/Portal/index.ts", import.meta.url)
        ),
        "Spinner/index": fileURLToPath(
          new URL("./src/Spinner/index.ts", import.meta.url)
        ),
        "StatusIndicator/index": fileURLToPath(
          new URL("./src/StatusIndicator/index.ts", import.meta.url)
        ),
        "Switch/index": fileURLToPath(
          new URL("./src/Switch/index.ts", import.meta.url)
        ),
        "system-color/index": fileURLToPath(
          new URL("./src/system-color/index.ts", import.meta.url)
        ),
        "Tag/index": fileURLToPath(
          new URL("./src/Tag/index.ts", import.meta.url)
        ),
        "Table/index": fileURLToPath(
          new URL("./src/Table/index.ts", import.meta.url)
        ),
        "DataTable/index": fileURLToPath(
          new URL("./src/DataTable/index.ts", import.meta.url)
        ),
        "Pagination/index": fileURLToPath(
          new URL("./src/Pagination/index.ts", import.meta.url)
        ),
        "Text/index": fileURLToPath(
          new URL("./src/Text/index.ts", import.meta.url)
        ),
        "Textarea/index": fileURLToPath(
          new URL("./src/Textarea/index.ts", import.meta.url)
        )
      },
      formats: ["es"],
      cssFileName: "styles"
    },
    rollupOptions: {
      external: (id) =>
        id === "react"
        || id === "react-dom"
        || id === "react/jsx-runtime"
        || id === "@maskito/core"
        || id === "@maskito/kit"
        || id === "@maskito/phone"
        || id.startsWith("country-flag-icons")
        || id.startsWith("libphonenumber-js")
        || id === "@mypoint/tokens"
        || id === "@radix-ui/react-dialog"
        || id === "lucide-react"
        || id === "sonner"
        || id === "virtua"
        || id === "date-fns"
        || id.startsWith("date-fns/")
        || id === "@date-fns/tz",
      output: {
        preserveModules: true,
        preserveModulesRoot: sourceRoot,
        entryFileNames: "[name].js"
      }
    }
  }
});
