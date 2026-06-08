"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  Eraser,
  Gauge,
  Code2,
  PanelLeftClose,
  PanelLeft,
  FolderOpen,
  Download,
} from "lucide-react"
import { TurtleCanvas, type TurtleCanvasHandle } from "@/components/turtle-canvas"
import { CodeEditor } from "@/components/code-editor"
import { DebugPanel, type DebugTab } from "@/components/debug-panel"
import { ExamplesList } from "@/components/examples-list"
import { ModuleManager } from "@/components/module-manager"
import { LanguageReference } from "@/components/language-reference"
import { ThemeToggle } from "@/components/theme-toggle"
import { runProgram, type RunResult } from "@/lib/logo/run"
import { EXAMPLES, DEFAULT_CODE } from "@/lib/logo/examples"
import {
  type ModuleMap,
  loadUserModulesFromStorage,
  saveUserModulesToStorage,
  basename,
} from "@/lib/logo/modules"
import type { TurtleStep } from "@/lib/logo/turtle-engine"

const SPEED_PRESETS = [
  { label: "慢", value: 40 },
  { label: "中", value: 150 },
  { label: "快", value: 500 },
  { label: "瞬间", value: 100000 },
]

export function LogoIDE() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [fileName, setFileName] = useState("main.logo")
  const [userModules, setUserModules] = useState<ModuleMap>({})
  const [modulesReady, setModulesReady] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [steps, setSteps] = useState<TurtleStep[]>([])
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [speed, setSpeed] = useState(150)
  const [activeTab, setActiveTab] = useState<DebugTab>("output")
  const [activeExample, setActiveExample] = useState<string | null>("flower")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const canvasRef = useRef<TurtleCanvasHandle>(null)
  const openFileRef = useRef<HTMLInputElement>(null)

  const execute = useCallback(
    (source: string) => {
      const res = runProgram(source, { trace: true, modules: userModules })
      setResult(res)
      setSteps(res.engine.steps)
      if (!res.ok) setActiveTab("output")
      requestAnimationFrame(() => {
        if (res.ok && res.engine.steps.length > 0) canvasRef.current?.restart()
      })
      return res
    },
    [userModules],
  )

  const run = useCallback(() => {
    execute(code)
  }, [code, execute])

  // 客户端挂载后再读 localStorage，避免 SSR 与客户端 HTML 不一致
  useEffect(() => {
    setUserModules(loadUserModulesFromStorage())
    setModulesReady(true)
  }, [])

  useEffect(() => {
    if (!modulesReady) return
    saveUserModulesToStorage(userModules)
  }, [userModules, modulesReady])

  // 首次自动运行（模块就绪后执行，保证 IMPORT 可用）
  useEffect(() => {
    if (!modulesReady) return
    execute(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulesReady])

  const handleSelectExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id)
    if (!ex) return
    setActiveExample(id)
    setFileName(`${ex.id}.logo`)
    setCode(ex.code)
    execute(ex.code)
  }

  const handleOpenFile = async (file: File) => {
    const text = await file.text()
    setCode(text)
    setFileName(basename(file.name) || "main.logo")
    setActiveExample(null)
    execute(text)
  }

  const handleSaveFile = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = fileName.endsWith(".logo") ? fileName : `${fileName}.logo`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleUserModulesChange = (modules: ModuleMap) => {
    setUserModules(modules)
    execute(code)
  }

  const togglePlay = () => {
    if (playing) {
      canvasRef.current?.pause()
    } else {
      canvasRef.current?.play()
    }
  }

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* 顶栏 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="切换侧栏"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Code2 className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <h1 className="font-mono text-sm font-semibold">
                Logo<span className="text-primary">+</span> v2
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">在线 Turtle 解释器</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
            aria-label="切换侧栏"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </button>
          <ThemeToggle />
          <button
            onClick={() => openFileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
            title="打开 .logo 文件"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">打开</span>
          </button>
          <button
            onClick={handleSaveFile}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
            title="保存为 .logo 文件"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">保存</span>
          </button>
          <input
            ref={openFileRef}
            type="file"
            accept=".logo,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleOpenFile(file)
              e.target.value = ""
            }}
          />
          <button
            onClick={run}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            运行
          </button>
        </div>
      </header>

      {/* 主体 */}
      <div className="flex min-h-0 flex-1">
        {/* 侧栏 */}
        {sidebarOpen && (
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-sidebar lg:block">
            <ExamplesList activeId={activeExample} onSelect={handleSelectExample} />
            <div className="border-t border-border" />
            <ModuleManager userModules={userModules} onChange={handleUserModulesChange} />
            <div className="border-t border-border" />
            <LanguageReference />
          </aside>
        )}

        {/* 编辑器 + 调试区 */}
        <div className="flex min-w-0 flex-1 flex-col border-r border-border lg:max-w-[44%] xl:max-w-[40%]">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
            <span className="font-mono text-xs text-muted-foreground">{fileName}</span>
          </div>
          <div className="min-h-0 flex-[3]">
            <CodeEditor value={code} onChange={setCode} />
          </div>
          <div className="min-h-0 flex-[2] border-t border-border">
            <DebugPanel result={result} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* 画布区 */}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          {/* 画布工具栏 */}
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
            <div className="flex items-center gap-1">
              <button
                onClick={togglePlay}
                disabled={steps.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? "暂停" : "播放"}
              </button>
              <button
                onClick={() => canvasRef.current?.restart()}
                disabled={steps.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-40"
                aria-label="重新播放"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => canvasRef.current?.clear()}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
                aria-label="清空画布"
              >
                <Eraser className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
                {SPEED_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setSpeed(preset.value)}
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      speed === preset.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 画布 */}
          <div className="relative min-h-0 flex-1">
            <TurtleCanvas
              ref={canvasRef}
              steps={steps}
              speed={speed}
              onPlayingChange={setPlaying}
              onProgressChange={(current, total) => setProgress({ current, total })}
            />
            {steps.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">运行代码后，图形将在此处绘制</p>
              </div>
            )}
          </div>

          {/* 进度条 */}
          <div className="flex h-9 shrink-0 items-center gap-3 border-t border-border px-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-75"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {progress.current}/{progress.total} 步
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
