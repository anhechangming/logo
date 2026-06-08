// utils.ts — AST 可视化等调试工具 (移植自 utils.py)

import type { ASTNode } from "./ast"
import type { Token } from "./tokens"
import { tokenToString } from "./tokens"

// 将 AST 渲染为缩进文本，用于调试视图
export function astToString(node: unknown, indent = 0): string {
  const prefix = " ".repeat(indent)
  const lines: string[] = []

  if (node === null || node === undefined) return ""

  if (Array.isArray(node)) {
    for (const item of node) {
      const s = astToString(item, indent)
      if (s) lines.push(s)
    }
    return lines.join("\n")
  }

  if (typeof node === "object" && "kind" in (node as Record<string, unknown>)) {
    const obj = node as Record<string, unknown>
    lines.push(`${prefix}${obj.kind}`)
    for (const [key, value] of Object.entries(obj)) {
      if (key === "kind") continue
      if (value !== null && typeof value === "object" && "kind" in (value as Record<string, unknown>)) {
        lines.push(`${prefix}  ${key}:`)
        lines.push(astToString(value, indent + 4))
      } else if (Array.isArray(value)) {
        lines.push(`${prefix}  ${key}:`)
        const inner = astToString(value, indent + 4)
        if (inner) lines.push(inner)
      } else {
        lines.push(`${prefix}  ${key}: ${value}`)
      }
    }
    return lines.join("\n")
  }

  return `${prefix}${String(node)}`
}

export function tokensToString(tokens: Token[]): string {
  return tokens.map(tokenToString).join("\n")
}

// 重新导出，方便消费方
export type { ASTNode }
