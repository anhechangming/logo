# Logo+ v2 语言解释器设计与实现
一个基于 Python 实现的增强型 Logo 语言解释器，完整实现编译器经典架构，支持变量、控制流、过程定义、文件导入与交互式编程

## 目录
- [项目简介](#一项目简介)
- [系统架构设计](#二系统架构设计)
- [语言特性设计](#三语言特性设计)
- [核心模块设计](#四核心模块设计)
- [运行方式](#五运行方式)
- [示例程序](#六示例程序)
- [项目亮点](#七项目亮点答辩重点)
- [课程设计总结](#八课程设计总结)

---

## 一、项目简介
Logo+ v2 是基于 Python 手写实现的增强版 Logo 语言解释器，严格遵循**经典编译器架构**：
```
源代码 (Source Code)
↓
词法分析 (Lexer)
↓
语法分析 (Parser)
↓
抽象语法树 (AST)
↓
解释执行 (Interpreter)
↓
图形绘制 (Turtle Graphics)
```

本项目完整实现了从源码解析到图形输出的全流程，扩展了标准 Logo 语言的能力，新增**变量系统、条件语句、循环结构、过程定义、文件导入、交互式解释器**等高级特性。

---

## 二、系统架构设计
### 2.1 整体架构
```
Logo 源代码
↓
词法分析器 (Lexer) → 生成 Token 流
↓
语法分析器 (Parser) → 生成抽象语法树 (AST)
↓
解释器 (Interpreter) → 遍历执行 AST
↓
Turtle 图形引擎 → 渲染输出图形
```

### 2.2 模块职责
| 模块文件 | 核心作用 |
|----------|----------|
| lexer.py | 词法分析，将源码转换为 Token 流 |
| parser.py | 语法分析，基于递归下降解析生成 AST |
| ast_nodes.py | 定义所有 AST 节点类型 |
| interpreter.py | 遍历执行 AST，管理变量/过程 |
| turtle_engine.py | 封装 Python 原生 turtle，提供绘图接口 |
| repl.py | 交互式命令行解释器 |
| utils.py | 通用工具与调试函数 |
| main.py | 项目主入口，处理命令行参数 |
| token_types.py | 统一定义所有 Token 类型 |
| exceptions.py | 自定义异常体系，错误处理 |

---

## 三、语言特性设计
### 3.1 基础绘图命令
```logo
FD 100    # 前进 100 像素
BK 50     # 后退 50 像素
RT 90     # 右转 90 度
LT 90     # 左转 90 度
PU        # 抬笔（不绘制）
PD        # 落笔（绘制）
```

### 3.2 变量系统
支持变量定义、赋值与表达式计算：
```logo
LET size = 100
FD size

# 支持四则运算、括号优先级
LET a = 10 + 20 * 3
LET b = (10 + 20) * 3
```

### 3.3 条件语句
支持完整比较运算符：`<`、`>`、`<=`、`>=`、`==`、`!=`
```logo
IF size > 50 [
    FD size
]
```

### 3.4 循环结构
1. **REPEAT 固定次数循环**
```logo
REPEAT 4 [
    FD 100
    RT 90
]
```
2. **WHILE 条件循环**
```logo
LET i = 0
WHILE i < 10 [
    FD 10
    LET i = i + 1
]
```
3. **FOR 计数循环**
```logo
FOR i 1 5 [
    FD 50
    RT 72
]
```

### 3.5 过程定义（自定义函数）
```logo
TO square
    REPEAT 4 [
        FD 100
        RT 90
    ]
END

# 调用过程
square
```

### 3.6 文件导入
支持模块化代码复用：
```logo
IMPORT "shapes.logo"
square
triangle
```

### 3.7 颜色系统
支持颜色名称与十六进制色值：
```logo
COLOR red
COLOR "#FF0000"
COLOR "#00AA00"
```

### 3.8 表达式支持
- 四则运算：`+`、`-`、`*`、`/`
- 括号优先级
- 变量参与计算
- 数字常量计算

---

## 四、核心模块设计
### 4.1 Lexer（词法分析器）
- 功能：识别关键字、变量名、数字、字符串、运算符
- 特性：行列定位、注释支持、错误定位
- 输出：标准化 Token 流

### 4.2 Parser（语法分析器）
- 算法：**递归下降解析**
- 支持解析：程序、语句、表达式、代码块、函数调用
- 输出：结构化抽象语法树 (AST)

### 4.3 AST 设计
核心节点类型：
- `ProgramNode`：程序根节点
- `CommandNode`：基础绘图命令
- `RepeatNode/IfNode/WhileNode/ForNode`：控制流节点
- `AssignmentNode`：变量赋值
- `ProcedureNode/ProcedureCallNode`：过程定义与调用
- `BinaryOpNode/UnaryOpNode`：表达式运算
- `ColorNode/ImportNode`：扩展功能节点

### 4.4 Interpreter（解释器）
- 核心：AST 深度优先遍历执行
- 管理：变量表、过程表
- 功能：控制流跳转、表达式计算、Turtle 引擎调用

### 4.5 Turtle Engine
封装原生 turtle 库，提供稳定绘图接口：
- 移动：forward/backward
- 转向：left/right
- 画笔：penup/pendown
- 样式：set_color/reset

### 4.6 REPL 交互系统
启动方式：`python main.py`
支持特性：
- 实时执行代码
- 多行代码块输入（TO...END/REPEAT/IF）
- 历史命令记录
- EXIT 安全退出

---

## 五、运行方式
### 5.1 启动交互式 REPL
```bash
python main.py
```

### 5.2 执行 Logo 脚本文件
```bash
python main.py examples/main.logo
```

### 5.3 查看词法分析 Token
```bash
python main.py examples/main.logo --tokens
```

### 5.4 查看语法分析 AST
```bash
python main.py examples/main.logo --ast
```

### 5.5 开启执行追踪模式
```bash
python main.py examples/main.logo --trace
```

---

## 六、示例程序
### square.logo（正方形）
```logo
REPEAT 4 [
    FD 100
    RT 90
]
```

### triangle.logo（三角形）
```logo
REPEAT 3 [
    FD 120
    RT 120
]
```

### star.logo（五角星）
```logo
REPEAT 5 [
    FD 200
    RT 144
]
```

### shapes.logo（过程库）
```logo
TO square
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
END
```

### main.logo（综合演示）
```logo
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
star
```

---

## 七、项目亮点
1. **完整控制流支持**
   实现 IF/REPEAT/WHILE/FOR 四大控制结构，满足复杂逻辑编程
2. **支持不同笔触**
3. **动态变量系统**
   支持变量定义、赋值、表达式计算与优先级解析
4. **自定义过程系统**
   支持 TO...END 过程定义与调用，实现代码封装复用
5. **文件模块化导入**
   支持 IMPORT 导入外部 Logo 文件，实现模块化开发
7. **交互式 REPL 环境**
   支持逐行执行、多行块输入，学习调试更便捷
8. **完善调试工具**
   支持 Token 打印、AST 可视化、执行追踪，便于调试与教学

---

## 八、课程设计总结
本项目成功实现了一个**功能完整、架构标准**的 Logo+ v2 语言解释器，从源代码到图形输出的全流程均基于 Python 手写完成。

### 核心技术掌握
1. 编译原理核心流程：词法分析、语法分析、解释执行
2. 递归下降语法分析算法的设计与实现
3. 抽象语法树 (AST) 的节点设计与遍历执行
4. 解释器模式与语言执行模型
5. 变量/过程/控制流的运行时管理

### 扩展能力
在标准 Logo 基础上，扩展了**变量系统、条件判断、循环结构、过程定义、文件导入**等高级特性，兼具教学性与实用性，是编译原理与编程语言设计的优秀实践项目。