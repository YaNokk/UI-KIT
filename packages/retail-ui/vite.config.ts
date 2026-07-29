import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    sourcemap: true,
    minify: false,
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        "QuantityInput/index": fileURLToPath(
          new URL("./src/QuantityInput/index.ts", import.meta.url),
        ),
      },
      formats: ["es"],
      cssFileName: "styles",
    },
    rollupOptions: {
      external: (id) =>
        id === "react" ||
        id === "react-dom" ||
        id === "react/jsx-runtime" ||
        id === "@mypoint/ui" ||
        id === "lucide-react",
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
