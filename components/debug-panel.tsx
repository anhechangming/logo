"use client"

import { useMemo } from "react"
import type { RunResult } from "@/lib/logo/run"
import { tokensToString } from "@/lib/logo/utils"
import { astToString } from "@/lib/logo/utils"

export type DebugTab = "output" | "tokens" | "ast" | "trace"

interface DebugPanelProps {
  result: RunResult | null
  activeTab: DebugTab
  onTabChange: (tab: DebugTab) => void
}

const TABS: { id: DebugTab; label: string }[] = [
  { id: "output", label: "输出" },
  { id: "tokens", label: "Token 流" },
  { id: "ast", label: "语法树" },
  { id: "trace", label: "执行追踪" },
]

export function DebugPanel({ result, activeTab, onTabChange }: DebugPanelProps) {
  const tokensText = useMemo(() => (result ? tokensToString(result.tokens) : ""), [result])
  const astText = useMemo(() => (result?.ast ? astToString(result.ast) : ""), [result])

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Tabs */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2">
        {TABS.map((tab) => {
          const count =
            tab.id === "tokens"
              ? result?.tokens.length
              : tab.id === "trace"
                ? result?.trace.length
                : undefined
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-3 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {count !== undefined && count > 0 ? (
                <span className="ml-1.5 rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {count}
                </span>
              ) : null}
              {activeTab === tab.id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
        {!result ? (
          <p className="text-muted-foreground">点击「运行」以执行代码并查看结果。</p>
        ) : activeTab === "output" ? (
          <OutputView result={result} />
        ) : activeTab === "tokens" ? (
          <pre className="whitespace-pre-wrap text-muted-foreground">{tokensText || "无 Token"}</pre>
        ) : activeTab === "ast" ? (
          <pre className="whitespace-pre-wrap text-muted-foreground">{astText || "无语法树"}</pre>
        ) : (
          <TraceView result={result} />
        )}
      </div>
    </div>
  )
}

function OutputView({ result }: { result: RunResult }) {
  if (!result.ok && result.error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
          <span className="font-sans font-medium">执行出错</span>
        </div>
        <pre className="whitespace-pre-wrap rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive">
          {result.error}
        </pre>
      </div>
    )
  }
  const segCount = result.engine.segments.length
  const stepCount = result.engine.steps.length
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
        <span className="font-sans font-medium">运行成功</span>
      </div>
      <dl className="grid grid-cols-2 gap-2 font-sans text-muted-foreground sm:grid-cols-3">
        <Stat label="Token 数" value={result.tokens.length} />
        <Stat label="语句数" value={result.ast?.statements.length ?? 0} />
        <Stat label="绘制线段" value={segCount} />
        <Stat label="动画步数" value={stepCount} />
        <Stat label="追踪条目" value={result.trace.length} />
      </dl>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-2.5">
      <div className="font-mono text-lg font-semibold text-foreground">{value}</div>
      <div className="text-[11px]">{label}</div>
    </div>
  )
}

function TraceView({ result }: { result: RunResult }) {
  if (result.trace.length === 0) {
    return <p className="text-muted-foreground">无追踪信息。</p>
  }
  return (
    <ol className="space-y-0.5">
      {result.trace.map((line, i) => (
        <li key={i} className="flex gap-3 text-muted-foreground">
          <span className="w-8 shrink-0 select-none text-right text-muted-foreground/40">{i + 1}</span>
          <span className="text-foreground/90">{line}</span>
        </li>
      ))}
    </ol>
  )
}
