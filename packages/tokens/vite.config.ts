import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const packageRoot = fileURLToPath(new URL(".", import.meta.url));
const outputRoot = fileURLToPath(new URL("./dist", import.meta.url));

function copyPublicCss(): Plugin {
  return {
    name: "copy-public-token-css",
    closeBundle() {
      mkdirSync(outputRoot, { recursive: true });
      copyFileSync(`${packageRoot}generated/tokens.css`, `${outputRoot}/tokens.css`);
      copyFileSync(`${packageRoot}generated/responsive.css`, `${outputRoot}/responsive.css`);
      copyFileSync(`${packageRoot}generated/tailwind.css`, `${outputRoot}/tailwind.css`);
    }
  };
}

export default defineConfig({
  plugins: [copyPublicCss()],
  build: {
    target: "es2022",
    sourcemap: true,
    minify: false,
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "index"
    }
  }
});
