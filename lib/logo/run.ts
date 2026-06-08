// run.ts — 统一运行入口：把源码跑成 tokens / ast / 绘图步骤 / trace

import { Lexer } from "./lexer"
import { Parser } from "./parser"
import { Interpreter } from "./interpreter"
import { TurtleEngine } from "./turtle-engine"
import type { Token } from "./tokens"
import type { ProgramNode } from "./ast"
import { LogoError } from "./errors"
import { buildModuleMap, type ModuleMap } from "./modules"

export interface RunResult {
  ok: boolean
  tokens: Token[]
  ast: ProgramNode | null
  engine: TurtleEngine
  trace: string[]
  error: string | null
}

export interface RunOptions {
  trace?: boolean
  /** 用户上传的 IMPORT 模块，会与内置模块合并 */
  modules?: ModuleMap
}

export function runProgram(source: string, options?: RunOptions): RunResult {
  const engine = new TurtleEngine()
  const trace = options?.trace ?? true
  const modules = buildModuleMap(options?.modules)

  let tokens: Token[] = []
  let ast: ProgramNode | null = null

  try {
    const lexer = new Lexer(source)
    tokens = lexer.tokenize()

    const parser = new Parser(tokens)
    ast = parser.parse()

    const interpreter = new Interpreter(engine, { trace, modules })
    interpreter.execute(ast)

    return { ok: true, tokens, ast, engine, trace: interpreter.traceLog, error: null }
  } catch (err) {
    const message = err instanceof LogoError ? err.message : err instanceof Error ? err.message : String(err)
    return { ok: false, tokens, ast, engine, trace: [], error: message }
  }
}
