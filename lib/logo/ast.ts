// ast.ts — Logo+ v2 抽象语法树节点 (移植自 ast_nodes.py)

export type ASTNode =
  | ProgramNode
  | CommandNode
  | RepeatNode
  | ProcedureNode
  | ProcedureCallNode
  | AssignmentNode
  | IfNode
  | WhileNode
  | ForNode
  | ColorNode
  | ImportNode
  | ClearNode
  | NumberNode
  | StringNode
  | IdentifierNode
  | UnaryOpNode
  | BinaryOpNode

export interface ProgramNode {
  kind: "Program"
  statements: ASTNode[]
}

export interface CommandNode {
  kind: "Command"
  command: string
  argument: ASTNode | null
}

export interface RepeatNode {
  kind: "Repeat"
  count: ASTNode
  body: ASTNode[]
}

export interface ProcedureNode {
  kind: "Procedure"
  name: string
  body: ASTNode[]
}

export interface ProcedureCallNode {
  kind: "ProcedureCall"
  name: string
}

export interface NumberNode {
  kind: "Number"
  value: number
}

export interface StringNode {
  kind: "String"
  value: string
}

export interface IdentifierNode {
  kind: "Identifier"
  name: string
}

export interface UnaryOpNode {
  kind: "UnaryOp"
  operator: string
  operand: ASTNode
}

export interface BinaryOpNode {
  kind: "BinaryOp"
  left: ASTNode
  operator: string
  right: ASTNode
}

export interface AssignmentNode {
  kind: "Assignment"
  name: string
  expression: ASTNode
}

export interface IfNode {
  kind: "If"
  condition: ASTNode
  body: ASTNode[]
}

export interface WhileNode {
  kind: "While"
  condition: ASTNode
  body: ASTNode[]
}

export interface ForNode {
  kind: "For"
  variable: string
  start: ASTNode
  end: ASTNode
  body: ASTNode[]
}

export interface ColorNode {
  kind: "Color"
  color: string
}

export interface ImportNode {
  kind: "Import"
  filename: string
}

export interface ClearNode {
  kind: "Clear"
}
