// turtle-engine.ts — Turtle 图形引擎 (Web Canvas 版，移植自 turtle_engine.py)
// 不直接绘制，而是记录每一步操作，供 Canvas 动画逐帧回放。

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  // 手绘风格参数（可选，向后兼容）
  jitter?: number        // 抖动幅度（0-1）
  brushSize?: number     // 笔触粗细
  texture?: string       // 笔触纹理: "pen" | "pencil" | "marker" | "ink"
}

// 用于动画回放的离散步骤
export type TurtleStep =
  | { type: "segment"; segment: Segment; from: TurtleState; to: TurtleState }
  | { type: "move"; from: TurtleState; to: TurtleState } // 抬笔移动
  | { type: "turn"; from: TurtleState; to: TurtleState }
  | { type: "pen"; down: boolean; state: TurtleState }
  | { type: "color"; color: string; state: TurtleState }
  | { type: "texture"; texture: string; state: TurtleState }
  | { type: "sketch"; enabled: boolean; state: TurtleState }
  | { type: "brush"; size: number; state: TurtleState }
  | { type: "clear"; state: TurtleState }

export interface TurtleState {
  x: number
  y: number
  // 角度：0 表示朝右（东），逆时针为正（与标准 turtle 一致）
  heading: number
  penDown: boolean
  color: string
  texture: string        // 当前笔触纹理
  sketchMode: boolean    // 是否启用手绘模式
  brushSize: number      // 当前笔触粗细
}

export class TurtleEngine {
  x = 0
  y = 0
  heading = 0
  penDown = true
  color = "#e6e6e6"
  texture: string = "pen"
  sketchMode: boolean = false
  brushSize: number = 2

  segments: Segment[] = []
  steps: TurtleStep[] = []

  private snapshot(): TurtleState {
    return {
      x: this.x,
      y: this.y,
      heading: this.heading,
      penDown: this.penDown,
      color: this.color,
      texture: this.texture,
      sketchMode: this.sketchMode,
      brushSize: this.brushSize,
    }
  }

  private moveBy(distance: number): void {
    const from = this.snapshot()
    const rad = (this.heading * Math.PI) / 180
    const nx = this.x + distance * Math.cos(rad)
    const ny = this.y + distance * Math.sin(rad)
    if (this.penDown) {
      // 手绘模式：用折线模拟笔触的微抖动
      if (this.sketchMode) {
        this.addSketchSegment(this.x, this.y, nx, ny, this.color)
      } else {
        const segment: Segment = {
          x1: this.x,
          y1: this.y,
          x2: nx,
          y2: ny,
          color: this.color,
          brushSize: this.brushSize,
          texture: this.texture
        }
        this.segments.push(segment)
        this.x = nx
        this.y = ny
        this.steps.push({ type: "segment", segment, from, to: this.snapshot() })
      }
    } else {
      this.x = nx
      this.y = ny
      this.steps.push({ type: "move", from, to: this.snapshot() })
    }
  }

  // 手绘模式：把一段距离拆成多个小段，每段加随机扰动
  private addSketchSegment(x1: number, y1: number, x2: number, y2: number, color: string): void {
    const length = Math.hypot(x2 - x1, y2 - y1)
    const segs = Math.max(2, Math.ceil(length / 6)) // 每 6 像素一个微段
    const dx = (x2 - x1) / segs
    const dy = (y2 - y1) / segs
    const jitterAmount = 1.2 // 像素级抖动
    let prevX = x1
    let prevY = y1
    for (let i = 1; i <= segs; i++) {
      const jx = (Math.random() - 0.5) * jitterAmount
      const jy = (Math.random() - 0.5) * jitterAmount
      const cx = x1 + dx * i + jx
      const cy = y1 + dy * i + jy
      const segment: Segment = {
        x1: prevX,
        y1: prevY,
        x2: cx,
        y2: cy,
        color,
        jitter: 0.4,
        brushSize: this.brushSize,
        texture: this.texture,
      }
      this.segments.push(segment)
      this.steps.push({ type: "segment", segment, from: this.snapshot(), to: this.snapshot() })
      prevX = cx
      prevY = cy
    }
    this.x = x2
    this.y = y2
  }

  forward(distance: number): void {
    this.moveBy(distance)
  }

  backward(distance: number): void {
    this.moveBy(-distance)
  }

  // 标准 turtle: right 顺时针，由于 y 轴在 canvas 向下，统一在渲染层处理
  right(angle: number): void {
    const from = this.snapshot()
    this.heading -= angle
    this.steps.push({ type: "turn", from, to: this.snapshot() })
  }

  left(angle: number): void {
    const from = this.snapshot()
    this.heading += angle
    this.steps.push({ type: "turn", from, to: this.snapshot() })
  }

  penup(): void {
    this.penDown = false
    this.steps.push({ type: "pen", down: false, state: this.snapshot() })
  }

  pendown(): void {
    this.penDown = true
    this.steps.push({ type: "pen", down: true, state: this.snapshot() })
  }

  setColor(color: string): void {
    this.color = color
    this.steps.push({ type: "color", color, state: this.snapshot() })
  }

  setTexture(texture: string): void {
    this.texture = texture
    this.steps.push({ type: "texture", texture, state: this.snapshot() })
  }

  setSketchMode(enabled: boolean): void {
    this.sketchMode = enabled
    this.steps.push({ type: "sketch", enabled, state: this.snapshot() })
  }

  setBrushSize(size: number): void {
    this.brushSize = Math.max(0.5, size)
    this.steps.push({ type: "brush", size: this.brushSize, state: this.snapshot() })
  }

  clear(): void {
    this.segments = []
    this.steps.push({ type: "clear", state: this.snapshot() })
  }

  reset(): void {
    this.x = 0
    this.y = 0
    this.heading = 0
    this.penDown = true
    this.color = "#e6e6e6"
    this.texture = "pen"
    this.sketchMode = false
    this.brushSize = 2
    this.segments = []
    this.steps = []
  }
}
