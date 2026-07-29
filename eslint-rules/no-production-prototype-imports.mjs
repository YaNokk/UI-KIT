const PROTOTYPE_SEGMENT = /(?:^|[/\\])prototypes?(?:[/\\]|$)/i;

function reportPrototypeSource(context, node) {
  if (
    typeof node.source?.value === "string"
    && PROTOTYPE_SEGMENT.test(node.source.value)
  ) {
    context.report({ node, messageId: "prototypeImport" });
  }
}

export const noProductionPrototypeImports = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent production apps and packages from depending on prototypes."
    },
    schema: [],
    messages: {
      prototypeImport: "Production apps and packages must not import from prototypes."
    }
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        reportPrototypeSource(context, node);
      },
      ExportNamedDeclaration(node) {
        reportPrototypeSource(context, node);
      },
      ExportAllDeclaration(node) {
        reportPrototypeSource(context, node);
      },
      ImportExpression(node) {
        if (
          node.source?.type === "Literal"
          && typeof node.source.value === "string"
          && PROTOTYPE_SEGMENT.test(node.source.value)
        ) {
          context.report({ node, messageId: "prototypeImport" });
        }
      }
    };
  }
};
