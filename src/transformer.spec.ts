import ts from 'typescript';
import { describe, it, expect } from 'vitest'
import transformer from './transformer';

function compile(sourceText: string) {
  const diagnostics: ts.Diagnostic[] = [];
  const program = ts.createProgram({
    options: {},
    rootNames: ['test.ts'],
  });
  const pluginConfig = {};
  const extras = {
    removeDiagnostic: (index: number) => { diagnostics.splice(index, 1); },
  } as ts.TransformerExtras;
  const sourceFile1 = ts.createSourceFile(
    "test.ts",
    sourceText,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );
  const { transformed } = ts.transform(sourceFile1, [
    transformer(
      program,
      pluginConfig,
      extras
    ) as ts.TransformerFactory<ts.SourceFile>
  ]);
  const printer = ts.createPrinter();
  const sourceFile2 = printer.printFile(transformed[0]);
  const extraSpaceAndBreakLine = new RegExp(/\s{2,}|\n/gm)
  return sourceFile2.replaceAll(extraSpaceAndBreakLine, '')
}

describe('Transformer', function () {
  it('should transform "name as string"', function () {
    const sourceText =
      'const sayHello = ({ name as string }) => {}'
    const expected =
      'const sayHello = ({ name }: {name: string;}) => { };'
    expect(compile(sourceText)).toEqual(expected)
  })

  it('should transform "name as string, age as string"', function () {
    const sourceText =
      'const sayHello = ({ name as string, age as number }) => {}'
    const expected =
      'const sayHello = ({ name, age }: {name: string;age: number;}) => { };'
    expect(compile(sourceText)).toEqual(expected)
  })

  it('should transform "name as string, age as string, country"', function () {
    const sourceText =
      'const sayHello = ({ name as string, age as number, country }) => {}'
    const expected =
      'const sayHello = ({ name, age, country }: {name: string;age: number;}) => { };'
    expect(compile(sourceText)).toEqual(expected)
  })

  it('should transform "isLoading as boolean"', function () {
    const sourceText =
      'const sayHello = ({ isLoading as boolean }) => {}'
    const expected =
      'const sayHello = ({ isLoading }: {isLoading: boolean;}) => { };'
    expect(compile(sourceText)).toEqual(expected)
  })

  it.todo('should support type reference')

  it.todo('should support nested object')

  it.todo('should support default value')

  it.todo('should support default with type reference. e.g. status as Status = "active"')
})