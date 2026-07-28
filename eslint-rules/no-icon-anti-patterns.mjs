const LUCIDE_SOURCE = "lucide-react";

function isLiteral(value) {
  return value?.type === "Literal" || (
    value?.type === "JSXExpressionContainer" &&
    value.expression?.type === "Literal"
  );
}

export const noIconAntiPatterns = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce static, token-owned Lucide icon usage in production UI."
    },
    schema: [],
    messages: {
      namespaceImport: "Use static named Lucide imports; namespace imports break module transparency.",
      literalColor: "Icon color belongs to a semantic currentColor context, not a Lucide color prop.",
      arbitrarySize: "The slot-owning component must set a canonical icon size.",
      arbitraryStroke: "Use the design-system stroke baseline; do not set strokeWidth per icon.",
      prototypeAsset: "Production packages must not import icon assets from prototypes."
    }
  },
  create(context) {
    const lucideLocals = new Set();

    return {
      ImportDeclaration(node) {
        if (
          typeof node.source.value === "string" &&
          /(?:^|[/\\])prototypes?(?:[/\\]|$)/i.test(node.source.value)
        ) {
          context.report({ node, messageId: "prototypeAsset" });
        }

        if (node.source.value !== LUCIDE_SOURCE) return;

        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier") {
            context.report({ node: specifier, messageId: "namespaceImport" });
          }
          if (specifier.type === "ImportSpecifier") {
            lucideLocals.add(specifier.local.name);
          }
        }
      },
      JSXOpeningElement(node) {
        if (
          node.name.type !== "JSXIdentifier" ||
          !lucideLocals.has(node.name.name)
        ) return;

        for (const attribute of node.attributes) {
          if (attribute.type !== "JSXAttribute") continue;
          if (attribute.name.name === "color" && isLiteral(attribute.value)) {
            context.report({ node: attribute, messageId: "literalColor" });
          }
          if (attribute.name.name === "size") {
            context.report({ node: attribute, messageId: "arbitrarySize" });
          }
          if (
            attribute.name.name === "strokeWidth" ||
            attribute.name.name === "absoluteStrokeWidth"
          ) {
            context.report({ node: attribute, messageId: "arbitraryStroke" });
          }
        }
      }
    };
  }
};
