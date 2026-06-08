"use client"

import { useRef } from "react"
import { FileUp, Trash2, Package } from "lucide-react"
import { SHARED_MODULES } from "@/lib/logo/examples"
import type { ModuleMap } from "@/lib/logo/modules"
import { basename } from "@/lib/logo/modules"

interface ModuleManagerProps {
  userModules: ModuleMap
  onChange: (modules: ModuleMap) => void
}

export function ModuleManager({ userModules, onChange }: ModuleManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const builtinNames = Object.keys(SHARED_MODULES)
  const userNames = Object.keys(userModules)

  const handleUpload = async (file: File) => {
    const text = await file.text()
    const name = basename(file.name)
    if (!name.endsWith(".logo")) {
      alert("请上传 .logo 文件")
      return
    }
    onChange({ ...userModules, [name]: text })
  }

  const handleDelete = (name: string) => {
    const next = { ...userModules }
    delete next[name]
    onChange(next)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          导入模块
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          <FileUp className="h-3 w-3" />
          上传
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".logo,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleUpload(file)
            e.target.value = ""
          }}
        />
      </div>

      <p className="px-4 pb-2 text-[11px] leading-relaxed text-muted-foreground">
        上传的 .logo 文件可通过 <code className="text-primary">IMPORT &quot;文件名.logo&quot;</code> 引入。
        也支持 <code className="text-primary">examples/shapes.logo</code> 这类路径。
      </p>

      <ul className="flex flex-col gap-0.5 px-2 pb-3">
        {builtinNames.map((name) => (
          <li
            key={`builtin-${name}`}
            className="flex items-center justify-between rounded-md px-3 py-2 text-xs bg-muted/40"
          >
            <div>
              <div className="font-mono text-foreground">{name}</div>
              <div className="text-[10px] text-muted-foreground">内置模块</div>
            </div>
          </li>
        ))}

        {userNames.length === 0 ? (
          <li className="px-3 py-2 text-xs text-muted-foreground">暂无用户模块，点击「上传」添加</li>
        ) : (
          userNames.map((name) => (
            <li
              key={`user-${name}`}
              className="flex items-center justify-between rounded-md px-3 py-2 text-xs hover:bg-muted/60"
            >
              <div>
                <div className="font-mono text-foreground">{name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {userModules[name].split("\n").length} 行
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(name)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`删除 ${name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
