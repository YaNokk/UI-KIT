const RAW_COLOR = /(?:#[\da-f]{3,8}\b|(?:rgb|hsl)a?\s*\()/i;
const ARBITRARY_TAILWIND_VALUE = /(?:^|\s|:)[-\w/]+-\[[^\]]+\]/;

export const noDesignLiterals = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw colors and unrestricted arbitrary Tailwind values in reusable UI."
    },
    schema: [],
    messages: {
      rawColor: "Use a semantic color token instead of a raw color literal.",
      arbitraryValue: "Use a system token instead of an arbitrary Tailwind value."
    }
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;

        if (RAW_COLOR.test(node.value)) {
          context.report({ node, messageId: "rawColor" });
        }

        if (ARBITRARY_TAILWIND_VALUE.test(node.value)) {
          context.report({ node, messageId: "arbitraryValue" });
        }
      },
      TemplateElement(node) {
        const value = node.value.raw;

        if (RAW_COLOR.test(value)) {
          context.report({ node, messageId: "rawColor" });
        }

        if (ARBITRARY_TAILWIND_VALUE.test(value)) {
          context.report({ node, messageId: "arbitraryValue" });
        }
      }
    };
  }
};

