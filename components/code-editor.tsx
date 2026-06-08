"use client"

import { useRef, useEffect } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  errorLine?: number | null
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)

  const lines = value.split("\n")
  const lineCount = lines.length

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.currentTarget
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = value.substring(0, start) + "    " + value.substring(end)
      onChange(newValue)
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4
      })
    }
  }

  useEffect(() => {
    syncScroll()
  }, [value])

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-card font-mono text-sm">
      {/* 行号 */}
      <div
        ref={lineNumbersRef}
        aria-hidden="true"
        className="select-none overflow-hidden border-r border-border bg-card py-3 pl-3 pr-2 text-right text-muted-foreground/60"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>

      {/* 编辑区 */}
      <div className="relative flex-1">
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre px-3 py-3 leading-6 text-transparent"
        >
          <code dangerouslySetInnerHTML={{ __html: highlight(value) }} />
        </pre>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent px-3 py-3 leading-6 text-foreground caret-primary outline-none"
          aria-label="Logo 代码编辑器"
        />
      </div>
    </div>
  )
}

const KEYWORDS = new Set([
  "FD",
  "FORWARD",
  "BK",
  "BACK",
  "RT",
  "LT",
  "PU",
  "PD",
  "REPEAT",
  "TO",
  "END",
  "LET",
  "IF",
  "WHILE",
  "FOR",
  "IMPORT",
  "COLOR",
  "CLEAR",
])

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// 极简语法高亮：注释、字符串、数字、关键字
function highlight(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      // 注释
      const commentIdx = line.indexOf(";")
      let codePart = line
      let comment = ""
      if (commentIdx >= 0) {
        codePart = line.slice(0, commentIdx)
        comment = line.slice(commentIdx)
      }

      // 用占位避免重复处理字符串
      const tokens = codePart.split(/("[^"]*")/g)
      const highlighted = tokens
        .map((tok) => {
          if (tok.startsWith('"') && tok.endsWith('"')) {
            return `<span style="color:#fbbf24">${escapeHtml(tok)}</span>`
          }
          return escapeHtml(tok).replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b|\b(\d+\.?\d*)\b/g, (m, word, num) => {
            if (num !== undefined) return `<span style="color:#f472b6">${num}</span>`
            if (word && KEYWORDS.has(word.toUpperCase())) {
              return `<span style="color:#22d3ee;font-weight:600">${word}</span>`
            }
            return `<span style="color:#a3e635">${word}</span>`
          })
        })
        .join("")

      const commentHtml = comment ? `<span style="color:#6b7280;font-style:italic">${escapeHtml(comment)}</span>` : ""
      return highlighted + commentHtml || "\u200b"
    })
    .join("\n")
}
