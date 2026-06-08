"use client"

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react"
import { useTheme } from "@/components/theme-provider"
import type { TurtleStep, TurtleState } from "@/lib/logo/turtle-engine"

function readCanvasVar(name: "--canvas-grid" | "--canvas-turtle"): string {
  if (typeof window === "undefined") return name === "--canvas-grid" ? "rgba(0,0,0,0.06)" : "#22d3ee"
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || (name === "--canvas-grid" ? "rgba(0,0,0,0.06)" : "#22d3ee")
}

export interface TurtleCanvasHandle {
  play: () => void
  pause: () => void
  restart: () => void
  clear: () => void
}

interface TurtleCanvasProps {
  steps: TurtleStep[]
  speed: number // 每秒处理的步数倍率 (1 = 慢, 高 = 快)
  onPlayingChange?: (playing: boolean) => void
  onProgressChange?: (current: number, total: number) => void
}

// 把 turtle 坐标 (中心原点, y 向上) 转为 canvas 坐标 (左上原点, y 向下)
function project(x: number, y: number, w: number, h: number, scale: number, offset: { x: number; y: number }) {
  return {
    cx: w / 2 + (x + offset.x) * scale,
    cy: h / 2 - (y + offset.y) * scale,
  }
}

export const TurtleCanvas = forwardRef<TurtleCanvasHandle, TurtleCanvasProps>(function TurtleCanvas(
  { steps, speed, onPlayingChange, onProgressChange },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const progressRef = useRef<number>(0) // 已播放步数（浮点）
  const playingRef = useRef<boolean>(false)
  const [dpr, setDpr] = useState(1)
  const { resolvedTheme } = useTheme()

  // 计算所有点的包围盒，自动缩放居中
  const computeView = useCallback(
    (w: number, h: number) => {
      let minX = -10
      let maxX = 10
      let minY = -10
      let maxY = 10
      for (const step of steps) {
        if (step.type === "segment") {
          const s = step.segment
          minX = Math.min(minX, s.x1, s.x2)
          maxX = Math.max(maxX, s.x1, s.x2)
          minY = Math.min(minY, s.y1, s.y2)
          maxY = Math.max(maxY, s.y1, s.y2)
        }
      }
      const spanX = maxX - minX || 1
      const spanY = maxY - minY || 1
      const pad = 0.85
      const scale = Math.min((w * pad) / spanX, (h * pad) / spanY, 6)
      const offset = { x: -(minX + maxX) / 2, y: -(minY + maxY) / 2 }
      return { scale, offset }
    },
    [steps],
  )

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = container.clientWidth
    const h = container.clientHeight

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    // 背景网格
    ctx.strokeStyle = readCanvasVar("--canvas-grid")
    ctx.lineWidth = 1
    const grid = 28
    for (let x = (w / 2) % grid; x < w; x += grid) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = (h / 2) % grid; y < h; y += grid) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    const { scale, offset } = computeView(w, h)

    const played = progressRef.current
    const fullSteps = Math.floor(played)
    const frac = played - fullSteps

    // 记录最后状态用于绘制海龟
    let turtle: TurtleState | null = null

    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // 处理 clear：找到最后一次 clear 之前的段不绘制
    let startIndex = 0
    for (let i = 0; i < Math.min(fullSteps + 1, steps.length); i++) {
      if (steps[i].type === "clear") startIndex = i + 1
    }

    for (let i = startIndex; i < Math.min(fullSteps, steps.length); i++) {
      const step = steps[i]
      if (step.type === "segment") {
        const s = step.segment
        const p1 = project(s.x1, s.y1, w, h, scale, offset)
        const p2 = project(s.x2, s.y2, w, h, scale, offset)
        ctx.strokeStyle = s.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(p1.cx, p1.cy)
        ctx.lineTo(p2.cx, p2.cy)
        ctx.stroke()
      }
      turtle = step.type === "clear" ? step.state : (step as { to?: TurtleState; state?: TurtleState }).to ?? (step as { state?: TurtleState }).state ?? turtle
    }

    // 当前正在播放的步（部分动画）
    if (fullSteps < steps.length) {
      const step = steps[fullSteps]
      if (step.type === "segment") {
        const s = step.segment
        const p1 = project(s.x1, s.y1, w, h, scale, offset)
        const midX = s.x1 + (s.x2 - s.x1) * frac
        const midY = s.y1 + (s.y2 - s.y1) * frac
        const pm = project(midX, midY, w, h, scale, offset)
        ctx.strokeStyle = s.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(p1.cx, p1.cy)
        ctx.lineTo(pm.cx, pm.cy)
        ctx.stroke()
        turtle = {
          x: midX,
          y: midY,
          heading: step.to.heading,
          penDown: step.to.penDown,
          color: s.color,
        }
      } else {
        turtle = (step as { to?: TurtleState; state?: TurtleState }).to ?? (step as { state?: TurtleState }).state ?? turtle
      }
    } else if (turtle === null && steps.length === 0) {
      turtle = { x: 0, y: 0, heading: 0, penDown: true, color: readCanvasVar("--canvas-turtle") }
    }

    // 绘制海龟（三角形指示朝向）
    if (turtle) {
      const p = project(turtle.x, turtle.y, w, h, scale, offset)
      const angle = (-turtle.heading * Math.PI) / 180 // canvas y 向下，角度取反
      const size = 9
      ctx.save()
      ctx.translate(p.cx, p.cy)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(size, 0)
      ctx.lineTo(-size * 0.7, size * 0.6)
      ctx.lineTo(-size * 0.7, -size * 0.6)
      ctx.closePath()
      ctx.fillStyle = readCanvasVar("--canvas-turtle")
      ctx.strokeStyle = resolvedTheme === "dark" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)"
      ctx.lineWidth = 1
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }

    ctx.restore()
  }, [steps, dpr, computeView, resolvedTheme])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ratio = window.devicePixelRatio || 1
    setDpr(ratio)
    canvas.width = container.clientWidth * ratio
    canvas.height = container.clientHeight * ratio
    canvas.style.width = `${container.clientWidth}px`
    canvas.style.height = `${container.clientHeight}px`
  }, [])

  // 动画循环
  const lastTimeRef = useRef<number>(0)
  const loop = useCallback(
    (time: number) => {
      if (!playingRef.current) return
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = time
      // 速度：每秒推进的步数
      const stepsPerSecond = speed
      progressRef.current = Math.min(progressRef.current + dt * stepsPerSecond, steps.length)
      draw()
      onProgressChange?.(Math.floor(progressRef.current), steps.length)
      if (progressRef.current >= steps.length) {
        playingRef.current = false
        onPlayingChange?.(false)
        return
      }
      rafRef.current = requestAnimationFrame(loop)
    },
    [speed, steps.length, draw, onPlayingChange, onProgressChange],
  )

  const play = useCallback(() => {
    if (steps.length === 0) return
    if (progressRef.current >= steps.length) progressRef.current = 0
    playingRef.current = true
    lastTimeRef.current = 0
    onPlayingChange?.(true)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }, [steps.length, loop, onPlayingChange])

  const pause = useCallback(() => {
    playingRef.current = false
    cancelAnimationFrame(rafRef.current)
    onPlayingChange?.(false)
  }, [onPlayingChange])

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    progressRef.current = 0
    playingRef.current = true
    lastTimeRef.current = 0
    onPlayingChange?.(true)
    onProgressChange?.(0, steps.length)
    rafRef.current = requestAnimationFrame(loop)
  }, [loop, steps.length, onPlayingChange, onProgressChange])

  const clear = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    progressRef.current = 0
    playingRef.current = false
    onPlayingChange?.(false)
    onProgressChange?.(0, 0)
    draw()
  }, [draw, onPlayingChange, onProgressChange])

  useImperativeHandle(ref, () => ({ play, pause, restart, clear }), [play, pause, restart, clear])

  // 当 steps 改变：立即全量绘制结果（progress 设到末尾），父组件可调用 restart 播放动画
  useEffect(() => {
    progressRef.current = steps.length
    draw()
    onProgressChange?.(steps.length, steps.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps])

  useEffect(() => {
    resize()
    draw()
    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    draw()
  }, [dpr, draw])

  useEffect(() => {
    draw()
  }, [resolvedTheme, draw])

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
})
