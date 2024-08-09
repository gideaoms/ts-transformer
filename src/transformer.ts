import ts from 'typescript'

const kinds = {
  string: ts.SyntaxKind.StringKeyword,
  number: ts.SyntaxKind.NumberKeyword,
  boolean: ts.SyntaxKind.BooleanKeyword,
  any: ts.SyntaxKind.AnyKeyword,
} as const

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
                kind: kind as (keyof typeof kinds) | undefined
              }
            })
          return ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createObjectBindingPattern(
              variables.map((variable) => ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(variable.property),
                undefined
              ))
            ),
            undefined,
            ts.factory.createTypeLiteralNode(
              variables
                .map(variable => {
                  if (variable.kind === undefined) {
                    return undefined
                  }
                  const kind = kinds[variable.kind]
                  return ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier(variable.property),
                    undefined,
                    ts.factory.createKeywordTypeNode(kind),
                  )
                })
                .filter(variable => variable !== undefined)
            ),
            undefined,
          )
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(sourceFile, visit)
    }
  }
}
