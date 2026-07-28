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
        "Button/index": fileURLToPath(
          new URL("./src/Button/index.ts", import.meta.url)
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
        || id === "@mypoint/tokens",
      output: {
        preserveModules: true,
        preserveModulesRoot: sourceRoot,
        entryFileNames: "[name].js"
      }
    }
  }
});
