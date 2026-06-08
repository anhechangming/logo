// parser.ts — Logo+ v2 递归下降语法分析器 (移植自 parser.py)

import { Token, TokenType } from "./tokens"
import { ParserError } from "./errors"
import type {
  ASTNode,
  ProgramNode,
  CommandNode,
  RepeatNode,
  ProcedureNode,
  ProcedureCallNode,
  AssignmentNode,
  IfNode,
  WhileNode,
  ForNode,
  ColorNode,
  ImportNode,
} from "./ast"

const COMMAND_TYPES = new Set<TokenType>([
  TokenType.FD,
  TokenType.FORWARD,
  TokenType.BK,
  TokenType.BACK,
  TokenType.RT,
  TokenType.LT,
  TokenType.PU,
  TokenType.PD,
])

const COMPARISON_TYPES = new Set<TokenType>([
  TokenType.GREATER,
  TokenType.GREATER_EQUAL,
  TokenType.LESS,
  TokenType.LESS_EQUAL,
  TokenType.EQUAL,
  TokenType.NOT_EQUAL,
])

export class Parser {
  private tokens: Token[]
  private position = 0
  private currentToken: Token

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.currentToken = tokens[0]
  }

  private advance(): void {
    this.position += 1
    if (this.position < this.tokens.length) {
      this.currentToken = this.tokens[this.position]
    }
  }

  private error(message: string): never {
    const token = this.currentToken
    throw new ParserError(message, token.line, token.column)
  }

  private eat(tokenType: TokenType): Token {
    const token = this.currentToken
    if (token.type === tokenType) {
      this.advance()
      return token
    }
    this.error(`期待 ${tokenType} 实际得到 ${token.type}`)
  }

  parse(): ProgramNode {
    const statements: ASTNode[] = []
    while (this.currentToken.type !== TokenType.EOF) {
      if (this.currentToken.type === TokenType.NEWLINE) {
        this.advance()
        continue
      }
      statements.push(this.statement())
    }
    return { kind: "Program", statements }
  }

  private statement(): ASTNode {
    const token = this.currentToken
    if (COMMAND_TYPES.has(token.type)) return this.commandStatement()
    switch (token.type) {
      case TokenType.REPEAT:
        return this.repeatStatement()
      case TokenType.LET:
        return this.assignmentStatement()
      case TokenType.IF:
        return this.ifStatement()
      case TokenType.WHILE:
        return this.whileStatement()
      case TokenType.FOR:
        return this.forStatement()
      case TokenType.TO:
        return this.procedureDefinition()
      case TokenType.COLOR:
        return this.colorStatement()
      case TokenType.IMPORT:
        return this.importStatement()
      case TokenType.IDENTIFIER:
        return this.procedureCall()
      case TokenType.CLEAR:
        this.eat(TokenType.CLEAR)
        return { kind: "Clear" }
      default:
        this.error(`未知语句 ${token.type}`)
    }
  }

  private commandStatement(): CommandNode {
    const token = this.currentToken
    const command = String(token.value)
    this.advance()
    if (command === "PU" || command === "PD") {
      return { kind: "Command", command, argument: null }
    }
    const argument = this.expression()
    return { kind: "Command", command, argument }
  }

  private repeatStatement(): RepeatNode {
    this.eat(TokenType.REPEAT)
    const count = this.expression()
    const body = this.block()
    return { kind: "Repeat", count, body }
  }

  private assignmentStatement(): AssignmentNode {
    this.eat(TokenType.LET)
    const name = String(this.eat(TokenType.IDENTIFIER).value)
    this.eat(TokenType.ASSIGN)
    const expression = this.expression()
    return { kind: "Assignment", name, expression }
  }

  private colorStatement(): ColorNode {
    this.eat(TokenType.COLOR)
    const token = this.currentToken
    if (token.type === TokenType.STRING || token.type === TokenType.IDENTIFIER) {
      this.advance()
      return { kind: "Color", color: String(token.value) }
    }
    this.error("非法颜色")
  }

  private importStatement(): ImportNode {
    this.eat(TokenType.IMPORT)
    const filename = String(this.eat(TokenType.STRING).value)
    return { kind: "Import", filename }
  }

  private procedureCall(): ProcedureCallNode {
    const name = String(this.eat(TokenType.IDENTIFIER).value)
    return { kind: "ProcedureCall", name }
  }

  private block(): ASTNode[] {
    const statements: ASTNode[] = []
    this.eat(TokenType.LBRACKET)
    while (this.currentToken.type !== TokenType.RBRACKET) {
      if (this.currentToken.type === TokenType.NEWLINE) {
        this.advance()
        continue
      }
      if (this.currentToken.type === TokenType.EOF) {
        this.error("代码块缺少结束括号 ']'")
      }
      statements.push(this.statement())
    }
    this.eat(TokenType.RBRACKET)
    return statements
  }

  private ifStatement(): IfNode {
    this.eat(TokenType.IF)
    const condition = this.comparison()
    const body = this.block()
    return { kind: "If", condition, body }
  }

  private whileStatement(): WhileNode {
    this.eat(TokenType.WHILE)
    const condition = this.comparison()
    const body = this.block()
    return { kind: "While", condition, body }
  }

  private forStatement(): ForNode {
    this.eat(TokenType.FOR)
    const variable = String(this.eat(TokenType.IDENTIFIER).value)
    const start = this.expression()
    const end = this.expression()
    const body = this.block()
    return { kind: "For", variable, start, end, body }
  }

  private procedureDefinition(): ProcedureNode {
    this.eat(TokenType.TO)
    const name = String(this.eat(TokenType.IDENTIFIER).value)
    const body: ASTNode[] = []
    while (this.currentToken.type !== TokenType.END) {
      if (this.currentToken.type === TokenType.NEWLINE) {
        this.advance()
        continue
      }
      if (this.currentToken.type === TokenType.EOF) {
        this.error("过程定义缺少 END")
      }
      body.push(this.statement())
    }
    this.eat(TokenType.END)
    return { kind: "Procedure", name, body }
  }

  private comparison(): ASTNode {
    let node = this.expression()
    while (COMPARISON_TYPES.has(this.currentToken.type)) {
      const op = String(this.currentToken.value)
      this.advance()
      const right = this.expression()
      node = { kind: "BinaryOp", left: node, operator: op, right }
    }
    return node
  }

  private expression(): ASTNode {
    let node = this.term()
    while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
      const op = String(this.currentToken.value)
      this.advance()
      node = { kind: "BinaryOp", left: node, operator: op, right: this.term() }
    }
    return node
  }

  private term(): ASTNode {
    let node = this.factor()
    while (this.currentToken.type === TokenType.MUL || this.currentToken.type === TokenType.DIV) {
      const op = String(this.currentToken.value)
      this.advance()
      node = { kind: "BinaryOp", left: node, operator: op, right: this.factor() }
    }
    return node
  }

  private factor(): ASTNode {
    const token = this.currentToken
    if (token.type === TokenType.NUMBER) {
      this.advance()
      return { kind: "Number", value: Number(token.value) }
    }
    if (token.type === TokenType.STRING) {
      this.advance()
      return { kind: "String", value: String(token.value) }
    }
    if (token.type === TokenType.IDENTIFIER) {
      this.advance()
      return { kind: "Identifier", name: String(token.value) }
    }
    if (token.type === TokenType.MINUS) {
      this.advance()
      return { kind: "UnaryOp", operator: "-", operand: this.factor() }
    }
    if (token.type === TokenType.LPAREN) {
      this.advance()
      const node = this.comparison()
      this.eat(TokenType.RPAREN)
      return node
    }
    this.error("非法表达式")
  }
}
