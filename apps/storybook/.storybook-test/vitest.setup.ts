import "@storybook/addon-vitest/internal/setup-file";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as previewAnnotations from "./preview";

setProjectAnnotations([previewAnnotations]);
