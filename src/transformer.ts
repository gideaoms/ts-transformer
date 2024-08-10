import ts from 'typescript'

function toSourceFile(sourceText: string) {
  const sourceFile = ts.createSourceFile(
    "test.ts",
    sourceText,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );
  const { transformed } = ts.transform(sourceFile, []);
  return transformed[0]
}

export default function (
  _program: ts.Program,
  _pluginConfig: ts.PluginConfig,
  extras: ts.TransformerExtras
) {
  extras.removeDiagnostic(0)
  extras.removeDiagnostic(0)
  return function (context: ts.TransformationContext) {
    return function (sourceFile: ts.SourceFile) {
      function visit(node: ts.Node) {
        if (
          ts.isParameter(node) &&
          ts.isObjectBindingPattern(node.name) &&
          node.type === undefined
        ) {
          const variables = node
            .getText()
            .replace(/^\{|\}$/gm, '')
            .split(',')
            .map(item => item.trim())
            .map(item => {
              const [property, kind] = item.split(' as ')
              return {
                property,
                kind: kind as string | undefined,
              }
            })
          const properties = variables.map(item => item.property).join(', ')
          const kinds = variables.filter(item => item.kind !== undefined)
            .map(item => `${item.property}: ${item.kind}`)
            .join(', ')
          const sourceText = `function fn({${properties}}: {${kinds}}) {}`
          const sourceFile = toSourceFile(sourceText)
          const fn = sourceFile.statements[0] as ts.FunctionDeclaration
          return fn.parameters
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(sourceFile, visit)
    }
  }
}
