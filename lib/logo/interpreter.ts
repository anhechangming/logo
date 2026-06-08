// interpreter.ts — Logo+ v2 AST 解释执行器 (移植自 interpreter.py)

import { Lexer } from "./lexer"
import { Parser } from "./parser"
import { TurtleEngine } from "./turtle-engine"
import { InterpreterRuntimeError } from "./errors"
import { resolveModuleSource } from "./modules"
import type {
  ASTNode,
  ProgramNode,
  NumberNode,
  StringNode,
  IdentifierNode,
  UnaryOpNode,
  BinaryOpNode,
  AssignmentNode,
  CommandNode,
  RepeatNode,
  IfNode,
  WhileNode,
  ForNode,
  ProcedureNode,
  ProcedureCallNode,
  ColorNode,
  ImportNode,
} from "./ast"

// 防止无限循环 / 死循环卡死浏览器
const MAX_STEPS = 2_000_000

export class Interpreter {
  engine: TurtleEngine
  trace: boolean
  traceLog: string[] = []
  variables: Record<string, number | string | boolean> = {}
  procedures: Record<string, ProcedureNode> = {}
  importedFiles = new Set<string>()
  // 内存中的可导入模块（浏览器无文件系统）
  modules: Record<string, string>
  private stepCount = 0

  constructor(engine: TurtleEngine, options?: { trace?: boolean; modules?: Record<string, string> }) {
    this.engine = engine
    this.trace = options?.trace ?? false
    this.modules = options?.modules ?? {}
  }

  private log(message: string): void {
    if (this.trace) this.traceLog.push(message)
  }

  private tick(): void {
    this.stepCount += 1
    if (this.stepCount > MAX_STEPS) {
      throw new InterpreterRuntimeError("执行步数超过上限，可能存在死循环")
    }
  }

  execute(node: ASTNode): void {
    this.tick()
    switch (node.kind) {
      case "Program":
        return this.visitProgram(node)
      case "Command":
        return this.visitCommand(node)
      case "Repeat":
        return this.visitRepeat(node)
      case "If":
        return this.visitIf(node)
      case "While":
        return this.visitWhile(node)
      case "For":
        return this.visitFor(node)
      case "Assignment":
        return this.visitAssignment(node)
      case "Procedure":
        return this.visitProcedure(node)
      case "ProcedureCall":
        return this.visitProcedureCall(node)
      case "Color":
        return this.visitColor(node)
      case "Import":
        return this.visitImport(node)
      case "Clear":
        return this.engine.clear()
      default:
        throw new InterpreterRuntimeError(`未知节点 ${(node as ASTNode).kind}`)
    }
  }

  private evaluate(node: ASTNode): number | string | boolean {
    switch (node.kind) {
      case "Number":
        return (node as NumberNode).value
      case "String":
        return (node as StringNode).value
      case "Identifier":
        return this.visitIdentifier(node as IdentifierNode)
      case "UnaryOp":
        return this.visitUnaryOp(node as UnaryOpNode)
      case "BinaryOp":
        return this.visitBinaryOp(node as BinaryOpNode)
      default:
        throw new InterpreterRuntimeError(`无法求值节点 ${node.kind}`)
    }
  }

  private visitProgram(node: ProgramNode): void {
    for (const stmt of node.statements) this.execute(stmt)
  }

  private visitIdentifier(node: IdentifierNode): number | string | boolean {
    if (!(node.name in this.variables)) {
      throw new InterpreterRuntimeError(`变量不存在: ${node.name}`)
    }
    return this.variables[node.name]
  }

  private visitUnaryOp(node: UnaryOpNode): number {
    const value = this.evaluate(node.operand)
    if (node.operator === "-") return -(value as number)
    return value as number
  }

  private visitBinaryOp(node: BinaryOpNode): number | boolean {
    const left = this.evaluate(node.left) as number
    const right = this.evaluate(node.right) as number
    switch (node.operator) {
      case "+":
        return left + right
      case "-":
        return left - right
      case "*":
        return left * right
      case "/":
        if (right === 0) throw new InterpreterRuntimeError("除数不能为 0")
        return left / right
      case ">":
        return left > right
      case "<":
        return left < right
      case ">=":
        return left >= right
      case "<=":
        return left <= right
      case "==":
        return left === right
      case "!=":
        return left !== right
      default:
        throw new InterpreterRuntimeError(`未知运算符 ${node.operator}`)
    }
  }

  private visitAssignment(node: AssignmentNode): void {
    const value = this.evaluate(node.expression)
    this.variables[node.name] = value
    this.log(`LET ${node.name}=${value}`)
  }

  private visitCommand(node: CommandNode): void {
    const cmd = node.command.toUpperCase()
    let value: number | null = null
    if (node.argument) value = this.evaluate(node.argument) as number
    this.log(`${cmd}${value !== null ? " " + value : ""}`)

    switch (cmd) {
      case "FD":
      case "FORWARD":
        this.engine.forward(value as number)
        break
      case "BK":
      case "BACK":
        this.engine.backward(value as number)
        break
      case "RT":
        this.engine.right(value as number)
        break
      case "LT":
        this.engine.left(value as number)
        break
      case "PU":
        this.engine.penup()
        break
      case "PD":
        this.engine.pendown()
        break
    }
  }

  private visitRepeat(node: RepeatNode): void {
    const count = Math.trunc(this.evaluate(node.count) as number)
    this.log(`REPEAT ${count}`)
    for (let i = 0; i < count; i++) {
      this.tick()
      for (const stmt of node.body) this.execute(stmt)
    }
  }

  private visitIf(node: IfNode): void {
    const result = this.evaluate(node.condition)
    this.log(`IF => ${result}`)
    if (result) {
      for (const stmt of node.body) this.execute(stmt)
    }
  }

  private visitWhile(node: WhileNode): void {
    while (this.evaluate(node.condition)) {
      this.tick()
      for (const stmt of node.body) this.execute(stmt)
    }
  }

  private visitFor(node: ForNode): void {
    const start = Math.trunc(this.evaluate(node.start) as number)
    const end = Math.trunc(this.evaluate(node.end) as number)
    this.log(`FOR ${node.variable} ${start}->${end}`)
    for (let value = start; value <= end; value++) {
      this.tick()
      this.variables[node.variable] = value
      for (const stmt of node.body) this.execute(stmt)
    }
  }

  private visitProcedure(node: ProcedureNode): void {
    this.procedures[node.name] = node
    this.log(`Procedure ${node.name} registered`)
  }

  private visitProcedureCall(node: ProcedureCallNode): void {
    if (!(node.name in this.procedures)) {
      throw new InterpreterRuntimeError(`过程不存在: ${node.name}`)
    }
    const procedure = this.procedures[node.name]
    this.log(`CALL ${node.name}`)
    for (const stmt of procedure.body) this.execute(stmt)
  }

  private visitColor(node: ColorNode): void {
    this.log(`COLOR ${node.color}`)
    this.engine.setColor(node.color)
  }

  private visitImport(node: ImportNode): void {
    const filename = node.filename
    if (this.importedFiles.has(filename)) return
    this.importedFiles.add(filename)
    this.log(`IMPORT ${filename}`)
    const source = resolveModuleSource(filename, this.modules)
    if (source === null) {
      throw new InterpreterRuntimeError(`文件不存在: ${filename}`)
    }
    this.runSource(source)
  }

  runSource(source: string): void {
    const lexer = new Lexer(source)
    const tokens = lexer.tokenize()
    const parser = new Parser(tokens)
    const ast = parser.parse()
    this.execute(ast)
  }
}
