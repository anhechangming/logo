"use client"

import { BookOpen } from "lucide-react"

interface RefItem {
  syntax: string
  desc: string
}

interface RefGroup {
  title: string
  items: RefItem[]
}

const GROUPS: RefGroup[] = [
  {
    title: "绘图命令",
    items: [
      { syntax: "FD n / FORWARD n", desc: "前进 n 像素" },
      { syntax: "BK n / BACK n", desc: "后退 n 像素" },
      { syntax: "RT a", desc: "右转 a 度" },
      { syntax: "LT a", desc: "左转 a 度" },
      { syntax: "PU", desc: "抬笔（移动不绘制）" },
      { syntax: "PD", desc: "落笔（恢复绘制）" },
      { syntax: "COLOR red / COLOR \"#f00\"", desc: "设置画笔颜色" },
      { syntax: "CLEAR", desc: "清空画布" },
    ],
  },
  {
    title: "手绘风格",
    items: [
      { syntax: "SKETCH ON / SKETCH OFF", desc: "开启/关闭手绘模式（线条抖动效果）" },
      { syntax: "TEXTURE \"pencil\"", desc: "设置笔触纹理：pen（默认）/ pencil（铅笔）/ marker（马克笔）/ ink（墨水笔）" },
      { syntax: "BRUSH 5", desc: "设置笔触粗细（默认 2）" },
    ],
  },
  {
    title: "变量与表达式",
    items: [
      { syntax: "LET x = 10 + 5", desc: "定义/赋值变量" },
      { syntax: "+ - * /", desc: "四则运算，支持括号" },
      { syntax: "> < >= <= == !=", desc: "比较运算符" },
    ],
  },
  {
    title: "控制流",
    items: [
      { syntax: "REPEAT n [ ... ]", desc: "固定次数循环" },
      { syntax: "WHILE cond [ ... ]", desc: "条件循环" },
      { syntax: "FOR i a b [ ... ]", desc: "计数循环 i 从 a 到 b" },
      { syntax: "IF cond [ ... ]", desc: "条件执行" },
    ],
  },
  {
    title: "过程与模块",
    items: [
      { syntax: "TO name ... END", desc: "定义过程" },
      { syntax: "name", desc: "调用过程" },
      { syntax: 'IMPORT "shapes.logo"', desc: "导入模块（侧栏可上传 .logo 文件）" },
      { syntax: 'IMPORT "examples/shapes.logo"', desc: "支持带目录的路径写法" },
      { syntax: "; 注释", desc: "单行注释" },
    ],
  },
]

export function LanguageReference() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        语法速查
      </div>
      <div className="flex flex-col gap-4 px-4 pb-4">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="mb-1.5 text-xs font-semibold text-foreground">{group.title}</h3>
            <ul className="flex flex-col gap-1.5">
              {group.items.map((item) => (
                <li key={item.syntax} className="text-xs">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">
                    {item.syntax}
                  </code>
                  <p className="mt-0.5 text-muted-foreground">{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
