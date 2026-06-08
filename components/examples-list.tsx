"use client"

import { EXAMPLES } from "@/lib/logo/examples"
import { Shapes } from "lucide-react"

interface ExamplesListProps {
  activeId: string | null
  onSelect: (id: string) => void
}

export function ExamplesList({ activeId, onSelect }: ExamplesListProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Shapes className="h-3.5 w-3.5" />
        示例程序
      </div>
      <ul className="flex flex-col gap-0.5 px-2 pb-2">
        {EXAMPLES.map((ex) => (
          <li key={ex.id}>
            <button
              onClick={() => onSelect(ex.id)}
              className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                activeId === ex.id
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="text-sm font-medium">{ex.name}</div>
              <div className="text-xs text-muted-foreground">{ex.description}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
