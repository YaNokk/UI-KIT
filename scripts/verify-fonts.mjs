import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const uiRoot = resolve(repositoryRoot, "packages/ui");
const fontCssPath = resolve(uiRoot, "src/fonts.css");
const fontCss = readFileSync(fontCssPath, "utf8");
const fontFaces = fontCss.match(/@font-face\s*\{[^}]*\}/g) ?? [];
const outsideFontFaces = fontCss.replace(/@font-face\s*\{[^}]*\}/g, "").trim();
const approvedFonts = [
  {
    file: "inter-regular.woff2",
    weight: "400",
    hash: "E06F6B1BC553AAEA4E4668023ED0AB0A147129C3107F511BC7D03D361B0AE085"
  },
  {
    file: "inter-medium.woff2",
    weight: "500",
    hash: "0FF3E94614E1493EB556314FD247AE6C4A85A7783B4CC86BE539940CF83F2A48"
  },
  {
    file: "inter-semibold.woff2",
    weight: "600",
    hash: "5CB7103E4E605989AFEBC03D989C79201E54B21B5183DB33981F70DB9178A301"
  }
];

if (fontFaces.length !== approvedFonts.length || outsideFontFaces !== "") {
  throw new Error("src/fonts.css must contain exactly three @font-face declarations.");
}

for (const approved of approvedFonts) {
  const url = `./assets/${approved.file}`;
  const block = fontFaces.find((candidate) => candidate.includes(url));
  if (
    !block
    || !block.includes('font-family: "Inter"')
    || !block.includes(`font-weight: ${approved.weight}`)
    || !block.includes("font-style: normal")
    || !block.includes("font-display: swap")
  ) {
    throw new Error(`Invalid optional font declaration for ${approved.file}.`);
  }
  const assetPath = resolve(dirname(fontCssPath), url);
  const hash = createHash("sha256")
    .update(readFileSync(assetPath))
    .digest("hex")
    .toUpperCase();
  if (hash !== approved.hash) {
    throw new Error(`Unexpected binary or version for ${approved.file}.`);
  }
}

const assetNames = readdirSync(resolve(uiRoot, "src/assets"));
const packagedFontFiles = assetNames.filter((name) => /\.(?:otf|ttf|woff2?)$/i.test(name));
if (
  packagedFontFiles.length !== approvedFonts.length
  || packagedFontFiles.some((name) => !approvedFonts.some(({ file }) => file === name))
) {
  throw new Error("Only the approved Inter 400/500/600 WOFF2 assets may be packaged.");
}

const uiPackage = JSON.parse(readFileSync(resolve(uiRoot, "package.json"), "utf8"));
if (uiPackage.exports?.["./fonts.css"] !== "./dist/fonts.css") {
  throw new Error("@mypoint/ui must export ./fonts.css from ./dist/fonts.css.");
}
if (!uiPackage.sideEffects?.includes("**/*.css")) {
  throw new Error("@mypoint/ui must preserve explicit CSS side effects.");
}

const uiIndex = readFileSync(resolve(uiRoot, "src/index.ts"), "utf8");
if (/fonts\.css|\.woff2/i.test(uiIndex)) {
  throw new Error("The UI JavaScript root must not import optional font delivery.");
}

const storybookPreview = readFileSync(
  resolve(repositoryRoot, "apps/storybook/.storybook/preview.tsx"),
  "utf8"
);
const browserStory = readFileSync(
  resolve(
    uiRoot,
    "src/internal/single-line-control-typography/SingleLineControlTypography.stories.tsx"
  ),
  "utf8"
);
if (!storybookPreview.includes('packages/ui/src/fonts.css')) {
  throw new Error("Storybook must import the optional font entry.");
}
if (!browserStory.includes(`document.fonts.check('14px "Inter"')`)) {
  throw new Error("The deterministic Storybook font availability assertion is missing.");
}

console.log("Optional Inter font source contract passed.");
