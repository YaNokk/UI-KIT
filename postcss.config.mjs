import postcssGlobalData from "@csstools/postcss-global-data";
import postcssCustomMedia from "postcss-custom-media";
import { fileURLToPath } from "node:url";

const responsiveData = fileURLToPath(
  new URL("./packages/tokens/generated/responsive.css", import.meta.url)
);

export default {
  plugins: [
    postcssGlobalData({
      files: [responsiveData]
    }),
    postcssCustomMedia()
  ]
};
