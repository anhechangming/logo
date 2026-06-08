// tokens.ts — Logo+ v2 Token 定义 (TypeScript 移植自 token_types.py)

export enum TokenType {
  // Logo 命令
  FD = "FD",
  FORWARD = "FORWARD",
  BK = "BK",
  BACK = "BACK",
  RT = "RT",
  LT = "LT",
  PU = "PU",
  PD = "PD",
  REPEAT = "REPEAT",
  TO = "TO",
  END = "END",
  // 关键字
  LET = "LET",
  IF = "IF",
  WHILE = "WHILE",
  FOR = "FOR",
  IMPORT = "IMPORT",
  COLOR = "COLOR",
  CLEAR = "CLEAR",
  // 标识符与常量
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  // 运算符
  PLUS = "PLUS",
  MINUS = "MINUS",
  MUL = "MUL",
  DIV = "DIV",
  ASSIGN = "ASSIGN",
  // 比较运算
  GREATER = "GREATER",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS = "LESS",
  LESS_EQUAL = "LESS_EQUAL",
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  // 括号
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",
  // 控制
  NEWLINE = "NEWLINE",
  EOF = "EOF",
}

export const KEYWORDS: Record<string, TokenType> = {
  FD: TokenType.FD,
  FORWARD: TokenType.FORWARD,
  BK: TokenType.BK,
  BACK: TokenType.BACK,
  RT: TokenType.RT,
  LT: TokenType.LT,
  PU: TokenType.PU,
  PD: TokenType.PD,
  REPEAT: TokenType.REPEAT,
  TO: TokenType.TO,
  END: TokenType.END,
  LET: TokenType.LET,
  IF: TokenType.IF,
  WHILE: TokenType.WHILE,
  FOR: TokenType.FOR,
  IMPORT: TokenType.IMPORT,
  COLOR: TokenType.COLOR,
  CLEAR: TokenType.CLEAR,
}

export interface Token {
  type: TokenType
  value: string | number | null
  line: number
  column: number
}

export function tokenToString(token: Token): string {
  return `${token.type}(${token.value}) [${token.line}:${token.column}]`
}
