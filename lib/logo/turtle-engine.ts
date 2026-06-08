// turtle-engine.ts — Turtle 图形引擎 (Web Canvas 版，移植自 turtle_engine.py)
// 不直接绘制，而是记录每一步操作，供 Canvas 动画逐帧回放。

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

// 用于动画回放的离散步骤
export type TurtleStep =
  | { type: "segment"; segment: Segment; from: TurtleState; to: TurtleState }
  | { type: "move"; from: TurtleState; to: TurtleState } // 抬笔移动
  | { type: "turn"; from: TurtleState; to: TurtleState }
  | { type: "pen"; down: boolean; state: TurtleState }
  | { type: "color"; color: string; state: TurtleState }
  | { type: "clear"; state: TurtleState }

export interface TurtleState {
  x: number
  y: number
  // 角度：0 表示朝右（东），逆时针为正（与标准 turtle 一致）
  heading: number
  penDown: boolean
  color: string
}

export class TurtleEngine {
  x = 0
  y = 0
  heading = 0
  penDown = true
  color = "#e6e6e6"

  segments: Segment[] = []
  steps: TurtleStep[] = []

  private snapshot(): TurtleState {
    return {
      x: this.x,
      y: this.y,
      heading: this.heading,
      penDown: this.penDown,
      color: this.color,
    }
  }

  private moveBy(distance: number): void {
    const from = this.snapshot()
    const rad = (this.heading * Math.PI) / 180
    const nx = this.x + distance * Math.cos(rad)
    const ny = this.y + distance * Math.sin(rad)
    if (this.penDown) {
      const segment: Segment = { x1: this.x, y1: this.y, x2: nx, y2: ny, color: this.color }
      this.segments.push(segment)
      this.x = nx
      this.y = ny
      this.steps.push({ type: "segment", segment, from, to: this.snapshot() })
    } else {
      this.x = nx
      this.y = ny
      this.steps.push({ type: "move", from, to: this.snapshot() })
    }
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
    this.segments = []
    this.steps = []
  }
}
