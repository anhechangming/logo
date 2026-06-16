// examples.ts — 示例程序库 + 可被 IMPORT 的共享模块

export interface Example {
  id: string
  name: string
  description: string
  code: string
}

const SHAPES_MODULE = `TO square
    REPEAT 4 [
        FD 100
        RT 90
    ]
END

TO triangle
    REPEAT 3 [
        FD 120
        RT 120
    ]
END

TO star
    REPEAT 5 [
        FD 200
        RT 144
    ]
END`

// 可通过 IMPORT "shapes.logo" 或 IMPORT "examples/shapes.logo" 导入
export const SHARED_MODULES: Record<string, string> = {
  "shapes.logo": SHAPES_MODULE,
  "examples/shapes.logo": SHAPES_MODULE,
}

export const EXAMPLES: Example[] = [
  {
    id: "square",
    name: "正方形",
    description: "REPEAT 循环绘制四边形",
    code: `; 用 REPEAT 画一个正方形
COLOR "#22d3ee"
REPEAT 4 [
    FD 120
    RT 90
]`,
  },
  {
    id: "star",
    name: "五角星",
    description: "经典五角星，外角 144 度",
    code: `; 五角星
COLOR "#facc15"
REPEAT 5 [
    FD 200
    RT 144
]`,
  },
  {
    id: "flower",
    name: "螺旋花朵",
    description: "嵌套 REPEAT + 旋转的花瓣",
    code: `; 旋转的花朵
COLOR "#f472b6"
REPEAT 36 [
    REPEAT 4 [
        FD 100
        RT 90
    ]
    RT 10
]`,
  },
  {
    id: "spiral",
    name: "递增螺旋",
    description: "WHILE 循环 + 变量递增",
    code: `; 不断变长的螺旋
LET step = 5
COLOR "#34d399"
WHILE step < 150 [
    FD step
    RT 91
    LET step = step + 5
]`,
  },
  {
    id: "for-poly",
    name: "FOR 多边形",
    description: "FOR 计数循环 + 表达式计算",
    code: `; 用 FOR 画一个递增边长的图案
COLOR "#60a5fa"
FOR i 1 12 [
    FD i * 18
    RT 90
]`,
  },
  {
    id: "main",
    name: "综合演示 (main)",
    description: "与 final 项目 main.logo 一致：导入 + 条件 + 循环",
    code: `; 与 Python 版 examples/main.logo 等价的综合演示
IMPORT "examples/shapes.logo"

LET size = 100

IF size > 50 [
    COLOR red
    square
]

LET counter = 0

WHILE counter < 3 [
    COLOR blue
    triangle
    LET counter = counter + 1
]

FOR i 1 5 [
    COLOR "#00AA00"
    FD 50
    RT 72
]

COLOR "#FF8800"
star`,
  },
  {
    id: "procedures",
    name: "过程与导入",
    description: "IMPORT 模块 + 自定义过程 + 条件循环",
    code: `; 导入共享形状库
IMPORT "shapes.logo"

LET size = 100

IF size > 50 [
    COLOR "#ef4444"
    square
]

LET counter = 0
WHILE counter < 3 [
    COLOR "#3b82f6"
    triangle
    RT 120
    LET counter = counter + 1
]

COLOR "#f59e0b"
star`,
  },
  {
    id: "sun",
    name: "放射太阳",
    description: "抬笔落笔 + 颜色变换",
    code: `; 放射状线条
FOR i 1 36 [
    COLOR "#fbbf24"
    FD 150
    PU
    BK 150
    PD
    RT 10
]`,
  },
  {
    id: "nested-squares",
    name: "嵌套方块",
    description: "FOR + 变量驱动的同心方块",
    code: `; 同心旋转方块
COLOR "#a3e635"
FOR i 1 18 [
    REPEAT 4 [
        FD i * 10
        RT 90
    ]
    RT 20
]`,
  },
  {
    id: "sketch-demo",
    name: "手绘风格演示",
    description: "SKETCH 模式 + 笔触纹理效果",
    code: `; 手绘风格示例
; 先画精确的框架
COLOR "#95a5a6"
REPEAT 4 [
    FD 150
    RT 90
]

; 开启手绘模式
SKETCH ON
TEXTURE "pencil"
BRUSH 3

; 画手绘风格的花朵
COLOR "#e74c3c"
REPEAT 12 [
    REPEAT 4 [
        FD 80
        RT 90
    ]
    RT 30
]

; 切换到马克笔效果
TEXTURE "marker"
BRUSH 5
COLOR "#3498db"
PU
RT 90
FD 200
LT 90
PD
REPEAT 6 [
    FD 100
    RT 60
]

; 关闭手绘模式
SKETCH OFF`,
  },
  {
    id: "sketch-tree",
    name: "手绘树木",
    description: "用手绘模式画一棵艺术感的树",
    code: `; 手绘风格的树
SKETCH ON
TEXTURE "pencil"
BRUSH 4

; 树干
COLOR "#8b4513"
REPEAT 2 [
    FD 80
    RT 90
    FD 20
    RT 90
]

; 树冠
PU
FD 40
LT 90
FD 10
RT 90
PD

COLOR "#2ecc71"
BRUSH 6
TEXTURE "marker"

REPEAT 18 [
    FD 50
    BK 50
    RT 20
]

SKETCH OFF`,
  },
  {
    id: "sketch-house",
    name: "手绘房子",
    description: "结合精确线条和手绘风格",
    code: `; 手绘风格的房子
; 房子主体（精确线条）
COLOR "#e67e22"
REPEAT 4 [
    FD 120
    RT 90
]

; 屋顶（手绘风格）
SKETCH ON
TEXTURE "ink"
BRUSH 3
COLOR "#c0392b"
LT 45
FD 85
RT 90
FD 85

; 门（马克笔效果）
SKETCH OFF
PU
BK 85
RT 135
FD 40
RT 90
FD 30
PD

SKETCH ON
TEXTURE "marker"
BRUSH 2
COLOR "#34495e"
REPEAT 4 [
    FD 40
    RT 90
]

SKETCH OFF`,
  },
]

export const DEFAULT_CODE = EXAMPLES[2].code
