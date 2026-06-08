// lexer.ts — Logo+ v2 词法分析器 (移植自 lexer.py)

import { Token, TokenType, KEYWORDS } from "./tokens"
import { LexerError } from "./errors"

export class Lexer {
  private text: string
  private position = 0
  private line = 1
  private column = 1
  private currentChar: string | null

  constructor(text: string) {
    this.text = text
    this.currentChar = text.length > 0 ? text[0] : null
  }

  private advance(): void {
    if (this.currentChar === "\n") {
      this.line += 1
      this.column = 1
    } else {
      this.column += 1
    }
    this.position += 1
    this.currentChar = this.position >= this.text.length ? null : this.text[this.position]
  }

  private peek(): string | null {
    const pos = this.position + 1
    if (pos >= this.text.length) return null
    return this.text[pos]
  }

  private error(message: string): never {
    throw new LexerError(message, this.line, this.column)
  }

  private skipWhitespace(): void {
    while (this.currentChar !== null && " \t\r".includes(this.currentChar)) {
      this.advance()
    }
  }

  private isDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9"
  }

  private isAlpha(ch: string): boolean {
    return /[a-zA-Z\u4e00-\u9fa5]/.test(ch)
  }

  private isAlnum(ch: string): boolean {
    return this.isAlpha(ch) || this.isDigit(ch)
  }

  private number(): Token {
    const line = this.line
    const column = this.column
    let result = ""
    let dotCount = 0
    while (this.currentChar !== null && (this.isDigit(this.currentChar) || this.currentChar === ".")) {
      if (this.currentChar === ".") {
        dotCount += 1
        if (dotCount > 1) this.error("非法数字格式")
      }
      result += this.currentChar
      this.advance()
    }
    return { type: TokenType.NUMBER, value: Number.parseFloat(result), line, column }
  }

  private identifier(): Token {
    const line = this.line
    const column = this.column
    let result = ""
    while (this.currentChar !== null && (this.isAlnum(this.currentChar) || this.currentChar === "_")) {
      result += this.currentChar
      this.advance()
    }
    const upperValue = result.toUpperCase()
    if (upperValue in KEYWORDS) {
      return { type: KEYWORDS[upperValue], value: upperValue, line, column }
    }
    return { type: TokenType.IDENTIFIER, value: result, line, column }
  }

  private string(): Token {
    const line = this.line
    const column = this.column
    this.advance()
    let value = ""
    while (this.currentChar !== null && this.currentChar !== '"') {
      value += this.currentChar
      this.advance()
    }
    if (this.currentChar !== '"') this.error("字符串缺少结束引号")
    this.advance()
    return { type: TokenType.STRING, value, line, column }
  }

  private skipComment(): void {
    while (this.currentChar !== null && this.currentChar !== "\n") {
      this.advance()
    }
  }

  private getNextToken(): Token {
    while (this.currentChar !== null) {
      const ch = this.currentChar

      if (" \t\r".includes(ch)) {
        this.skipWhitespace()
        continue
      }

      if (ch === ";") {
        this.skipComment()
        continue
      }

      if (ch === "\n") {
        const token: Token = { type: TokenType.NEWLINE, value: "\n", line: this.line, column: this.column }
        this.advance()
        return token
      }

      if (this.isDigit(ch) || (ch === "." && this.peek() !== null && this.isDigit(this.peek()!))) {
        return this.number()
      }

      if (this.isAlpha(ch) || ch === "_") {
        return this.identifier()
      }

      if (ch === '"') return this.string()

      const simple: Record<string, TokenType> = {
        "+": TokenType.PLUS,
        "-": TokenType.MINUS,
        "*": TokenType.MUL,
        "/": TokenType.DIV,
        "(": TokenType.LPAREN,
        ")": TokenType.RPAREN,
        "[": TokenType.LBRACKET,
        "]": TokenType.RBRACKET,
      }
      if (ch in simple) {
        const token: Token = { type: simple[ch], value: ch, line: this.line, column: this.column }
        this.advance()
        return token
      }

      if (ch === "=") {
        const line = this.line
        const column = this.column
        this.advance()
        if (this.currentChar === "=") {
          this.advance()
          return { type: TokenType.EQUAL, value: "==", line, column }
        }
        return { type: TokenType.ASSIGN, value: "=", line, column }
      }

      if (ch === "!") {
        const line = this.line
        const column = this.column
        this.advance()
        if (this.currentChar === "=") {
          this.advance()
          return { type: TokenType.NOT_EQUAL, value: "!=", line, column }
        }
        this.error("期待 '='")
      }

      if (ch === ">") {
        const line = this.line
        const column = this.column
        this.advance()
        if (this.currentChar === "=") {
          this.advance()
          return { type: TokenType.GREATER_EQUAL, value: ">=", line, column }
        }
        return { type: TokenType.GREATER, value: ">", line, column }
      }

      if (ch === "<") {
        const line = this.line
        const column = this.column
        this.advance()
        if (this.currentChar === "=") {
          this.advance()
          return { type: TokenType.LESS_EQUAL, value: "<=", line, column }
        }
        return { type: TokenType.LESS, value: "<", line, column }
      }

      this.error(`非法字符 '${ch}'`)
    }

    return { type: TokenType.EOF, value: null, line: this.line, column: this.column }
  }

  tokenize(): Token[] {
    const tokens: Token[] = []
    while (true) {
      const token = this.getNextToken()
      tokens.push(token)
      if (token.type === TokenType.EOF) break
    }
    return tokens
  }
}
