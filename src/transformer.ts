import ts from 'typescript'

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
          const elements = node.name.elements
          const properties: ts.BindingElement[] = []
          const types: ts.PropertySignature[] = []
          for (let idx = 0; idx < elements.length; idx++) {
            const current = elements[idx]
            const prev1 = elements[idx - 1] as ts.BindingElement | undefined
            const prev2 = elements[idx - 2] as ts.BindingElement | undefined
            const next1 = elements[idx + 1] as ts.BindingElement | undefined
            const next2 = elements[idx + 2] as ts.BindingElement | undefined
            const isKeyword = current.getText() === 'as'
            const isType = prev1?.getText() === 'as' && prev2 !== undefined
            const hasType = next1?.getText() === 'as'
            const initializer = current.initializer ?? next2?.initializer
            if (isKeyword || isType) {
              continue
            }
            if (hasType && !initializer) {
              properties.push(ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(current.name.getText()),
                undefined
              ))
              types.push(ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier(current.name.getText()),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
              ))
            } else if (hasType && initializer) {
              properties.push(ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(current.name.getText()),
                ts.factory.createStringLiteral(initializer.getText())
              ))
              types.push(ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier(current.name.getText()),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
              ))
            } else if (!hasType && initializer) {
              properties.push(ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(current.name.getText()),
                ts.factory.createStringLiteral(initializer.getText())
              ))
              types.push(ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier(current.name.getText()),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
              ))
            } else if (!hasType) {
              properties.push(ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(current.name.getText()),
                undefined
              ))
            }
          }
          return ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createObjectBindingPattern(properties),
            undefined,
            ts.factory.createTypeLiteralNode(types),
            undefined
          )

        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(sourceFile, visit)
    }
  }
}
