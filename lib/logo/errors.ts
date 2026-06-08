// errors.ts — 统一异常体系 (移植自 exceptions.py)

export class LogoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LogoError"
  }
}

export class LexerError extends LogoError {
  constructor(message: string, line: number, column: number) {
    super(`[LexerError] Line ${line}, Column ${column}: ${message}`)
    this.name = "LexerError"
  }
}

export class ParserError extends LogoError {
  constructor(message: string, line: number, column: number) {
    super(`[ParserError] Line ${line}, Column ${column}: ${message}`)
    this.name = "ParserError"
  }
}

export class InterpreterRuntimeError extends LogoError {
  constructor(message: string) {
    super(`[RuntimeError] ${message}`)
    this.name = "InterpreterRuntimeError"
  }
}
