import type { Decorator, Preview } from "@storybook/react-vite";
import { ThemeProvider, type ThemePreference } from "@mypoint/ui";
import "../src/styles.css";

const accents = {
  blue: "#0080ff",
  green: "#16a34a",
  purple: "#7c3aed",
  yellow: "#facc15",
  nearBlack: "#111827"
} as const;

const foregrounds = {
  auto: undefined,
  light: "#ffffff",
  dark: "#000000"
} as const;

const withTheme: Decorator = (Story, context) => {
  const accent = accents[context.globals.accent as keyof typeof accents] ?? accents.blue;
  const foreground =
    foregrounds[context.globals.foreground as keyof typeof foregrounds] ??
    foregrounds.auto;

  return (
    <ThemeProvider
      brand={{
        accentColor: accent,
        ...(foreground ? { foregroundColor: foreground } : {})
      }}
      className="min-h-screen bg-background-page p-4 text-text-primary"
      mode={context.globals.mode as ThemePreference}
    >
      <Story />
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    mode: {
      description: "Color mode",
      toolbar: {
        icon: "mirror",
        items: ["light", "dark", "system"]
      }
    },
    accent: {
      description: "Runtime brand stress color",
      toolbar: {
        icon: "paintbrush",
        items: Object.keys(accents)
      }
    },
    foreground: {
      description: "Preferred on-accent foreground (contrast is still enforced)",
      toolbar: {
        icon: "contrast",
        items: Object.keys(foregrounds)
      }
    }
  },
  initialGlobals: {
    mode: "light",
    accent: "blue",
    foreground: "light"
  },
  parameters: {
    a11y: {
      test: "error"
    },
    controls: {
      expanded: true
    },
    options: {
      storySort: {
        order: [
          "Foundations",
          "Components",
          "Patterns",
          "Retail",
          "Prototypes"
        ]
      }
    },
    layout: "fullscreen",
    viewport: {
      options: {
        mobile: {
          name: "Mobile 390",
          styles: {
            width: "390px",
            height: "844px"
          },
          type: "mobile"
        },
        tablet: {
          name: "Tablet 768",
          styles: {
            width: "768px",
            height: "1024px"
          },
          type: "tablet"
        },
        desktop: {
          name: "Desktop 1440",
          styles: {
            width: "1440px",
            height: "900px"
          },
          type: "desktop"
        }
      }
    }
  }
};

export default preview;
