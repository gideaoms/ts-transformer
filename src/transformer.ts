import {
  Identifier,
  Node,
  NodeFactory,
  ObjectBindingPattern,
  PluginConfig,
  Program,
  SourceFile,
  SyntaxKind,
  TransformationContext,
  TransformerExtras,
} from 'typescript'

export default function (
  program: Program,
  pluginConfig: PluginConfig,
  extras: TransformerExtras
) {
  const { ts } = extras
  return function (context: TransformationContext) {
    const { factory } = context
    return function (sourceFile: SourceFile) {
      function visit(node: Node) {
        if (
          ts.isParameter(node) &&
          ts.isObjectBindingPattern(node.name) &&
          node.type === undefined
        ) {
          return visitParameterObject(factory, node.name)
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(sourceFile, visit)
    }
  }
}

export function visitParameterObject(
  factory: NodeFactory, parameterObject: ObjectBindingPattern
) {
  const elements = parameterObject.elements
    .map(function (element) {
      if (!element.propertyName) {
        return undefined
      }
      const variableName = element.propertyName as Identifier
      const variableType = element.name as Identifier
      return {
        variableName: variableName.escapedText.toString(),
        variableType: variableType.escapedText.toString(),
      }
    })
    .filter(element => element !== undefined)
  return factory.createParameterDeclaration(
    undefined,
    undefined,
    factory.createObjectBindingPattern(
      elements.map(element => factory.createBindingElement(
        undefined,
        undefined,
        factory.createIdentifier(element.variableName),
        undefined
      ))
    ),
    undefined,
    factory.createTypeLiteralNode(
      elements.map(element => factory.createPropertySignature(
        undefined,
        factory.createIdentifier(element.variableName),
        undefined,
        factory.createKeywordTypeNode(toType(element.variableType)),
      ))
    ),
    undefined,
  )
}

function toType(type: string) {
  switch (type) {
    case 'string': {
      return SyntaxKind.StringKeyword as const
    }
    case 'number': {
      return SyntaxKind.NumberKeyword as const
    }
    default:
      throw new Error('Invalid type')
  }
}