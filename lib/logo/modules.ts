// modules.ts — IMPORT 模块解析与合并（浏览器端无真实文件系统）

import { SHARED_MODULES } from "./examples"

export type ModuleMap = Record<string, string>

/** 将路径规范为使用正斜杠 */
export function normalizePath(filename: string): string {
  return filename.replace(/\\/g, "/").trim()
}

/** 取路径最后一段作为模块名 */
export function basename(filename: string): string {
  const normalized = normalizePath(filename)
  const parts = normalized.split("/")
  return parts[parts.length - 1] || normalized
}

/**
 * 按多种候选键查找模块源码，兼容 final 项目中的路径写法：
 * - shapes.logo
 * - examples/shapes.logo
 */
export function resolveModuleSource(filename: string, modules: ModuleMap): string | null {
  const normalized = normalizePath(filename)
  const candidates = new Set<string>([
    normalized,
    normalized.replace(/^examples\//, ""),
    basename(normalized),
  ])

  for (const key of candidates) {
    if (key && key in modules) return modules[key]
  }
  return null
}

/** 合并内置模块与用户上传模块（用户模块可覆盖同名内置模块） */
export function buildModuleMap(userModules: ModuleMap = {}): ModuleMap {
  return { ...SHARED_MODULES, ...userModules }
}

export const USER_MODULES_STORAGE_KEY = "logo-user-modules"

export function loadUserModulesFromStorage(): ModuleMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(USER_MODULES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as ModuleMap
    }
  } catch {
    // ignore corrupt storage
  }
  return {}
}

export function saveUserModulesToStorage(modules: ModuleMap): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(USER_MODULES_STORAGE_KEY, JSON.stringify(modules))
}
