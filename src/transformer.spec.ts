import {
  createPrinter,
  createSourceFile,
  factory,
  ListFormat,
  NewLineKind,
  Node,
  NodeArray,
  ScriptKind,
  ScriptTarget,
} from 'typescript'
import { describe, it, expect } from 'vitest'
import { visitParameterObject } from './transformer'

function compile(nodes: NodeArray<Node>) {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed })
  const resultFile = createSourceFile(
    "temp.ts",
    "",
    ScriptTarget.Latest,
    false,
    ScriptKind.TS
  )
  return printer.printList(ListFormat.MultiLine, nodes, resultFile)
}

describe('Transformer', function () {
  it('({ name: string }) to ({ name }: { name: string })', function () {
    const parameterObject = factory.createObjectBindingPattern([
      factory.createBindingElement(
        undefined,
        factory.createIdentifier("name"),
        factory.createIdentifier("string"),
        undefined
      )
    ])
    const nodes = factory
      .createNodeArray([visitParameterObject(factory, parameterObject)])
    expect(compile(nodes)).toEqual(`{ name }: {
    name: string;
}
`)
  })

  it(
    '({ name: string, age: number }) to ({ name, age }: { name: string; age: number })',
    function () {
      const parameterObject = factory.createObjectBindingPattern([
        factory.createBindingElement(
          undefined,
          factory.createIdentifier("name"),
          factory.createIdentifier("string"),
          undefined
        ),
        factory.createBindingElement(
          undefined,
          factory.createIdentifier("age"),
          factory.createIdentifier("number"),
          undefined
        )
      ])
      const nodes = factory
        .createNodeArray([visitParameterObject(factory, parameterObject)])
      expect(compile(nodes)).toEqual(`{ name, age }: {
    name: string;
    age: number;
}
`)
    }
  )
})