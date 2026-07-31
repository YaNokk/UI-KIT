import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
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
        "Button/index": fileURLToPath(
          new URL("./src/Button/index.ts", import.meta.url)
        ),
        "ButtonLink/index": fileURLToPath(
          new URL("./src/ButtonLink/index.ts", import.meta.url)
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
        "Link/index": fileURLToPath(
          new URL("./src/Link/index.ts", import.meta.url)
        ),
        "modal/index": fileURLToPath(
          new URL("./src/modal/index.ts", import.meta.url)
        ),
        "NumberInput/index": fileURLToPath(
          new URL("./src/NumberInput/index.ts", import.meta.url)
        ),
        "PasswordInput/index": fileURLToPath(
          new URL("./src/PasswordInput/index.ts", import.meta.url)
        ),
        "Select/index": fileURLToPath(
          new URL("./src/Select/index.ts", import.meta.url)
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
        "Text/index": fileURLToPath(
          new URL("./src/Text/index.ts", import.meta.url)
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
        || id === "@mypoint/tokens"
        || id === "@radix-ui/react-dialog"
        || id === "virtua",
      output: {
        preserveModules: true,
        preserveModulesRoot: sourceRoot,
        entryFileNames: "[name].js"
      }
    }
  }
});
