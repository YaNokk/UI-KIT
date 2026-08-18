import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import postcssGlobalData from "@csstools/postcss-global-data";
import postcssCustomMedia from "postcss-custom-media";
import { describe, expect, it } from "vitest";
import { breakpoints, mediaQueries } from "./index";

const responsiveData = fileURLToPath(
  new URL("../generated/responsive.css", import.meta.url)
);

describe("responsive foundation", () => {
  it("derives exact md boundaries from the canonical token scale", () => {
    expect(breakpoints.md).toBe(768);
    expect(mediaQueries.belowMd).toBe("(width < 768px)");
    expect(mediaQueries.mdUp).toBe("(width >= 768px)");
    expect(mediaQueries.xlUp).toBe("(width >= 1280px)");

    const isBelowMd = (width: number) => width < breakpoints.md;
    expect([
      isBelowMd(767),
      isBelowMd(768),
      isBelowMd(769)
    ]).toEqual([true, false, false]);
  });

  it("expands generated custom media for CSS Modules", async () => {
    const generated = await readFile(responsiveData, "utf8");
    expect(generated).toContain(
      "@custom-media --ds-below-md (width < 768px);"
    );
    expect(generated).toContain(
      "@custom-media --ds-md-up (width >= 768px);"
    );
    expect(generated).toContain(
      "@custom-media --ds-xl-up (width >= 1280px);"
    );

    const result = await postcss([
      postcssGlobalData({ files: [responsiveData] }),
      postcssCustomMedia()
    ]).process(
      "@media (--ds-below-md) { .compact { display: block; } }",
      { from: undefined }
    );

    expect(result.css).toContain("@media (width < 768px)");
    expect(result.css).not.toContain("--ds-below-md");
  });
});
