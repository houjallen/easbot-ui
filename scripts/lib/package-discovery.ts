#!/usr/bin/env tsx
/**
 * scripts/lib/package-discovery.ts
 *
 * 组件库脚本的公共依赖发现逻辑。
 *
 * 设计说明：
 *
 * 1. **零外部依赖** —— 原脚本 import 了 `@easbot/utils` 的 `Glob` / `Filesystem` / `Shell` / `Semver`，
 *    但该包在本仓库**从未安装**（本仓库是独立的单包组件库，不是 easbot monorepo 的子包），
 *    脚本运行即抛 `ReferenceError`。这里改用 node 内置模块实现，零依赖。
 *
 * 2. **单包语义** —— 本仓库只有一个 npm 包（根目录 package.json），
 *    `pnpm-workspace.yaml` 未声明 `packages:` 字段，不存在 `skills/**` 或 `packages/**` 子目录。
 */

/** node 内置模块导入 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * 解析可在 Node 子进程里直接启动的 pnpm 可执行文件名。
 *
 * 设计说明：
 *
 * Windows 上 `pnpm` 在 PATH 里通常同时存在 `pnpm`（shell 脚本）、`pnpm.cmd`（批处理）
 * 与 `pnpm.ps1`（PowerShell 脚本）。`execFileSync` 走的是 CreateProcess，
 * **无法**执行 `.ps1`，也**无法**直接执行无扩展名的 shell 脚本 ——
 * 必须显式用 `pnpm.cmd`（Windows）或 `pnpm`（POSIX）。
 *
 * @param platform 平台标识（默认取当前平台）
 * @returns 可执行文件名
 */
export function resolvePnpmBin(platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

/**
 * 执行 pnpm 子命令并返回标准输出。
 *
 * @param args pnpm 参数数组
 * @param cwd 工作目录（默认当前目录）
 * @returns 标准输出（已 trim）
 * @throws 子进程退出码非 0 时抛出
 */
export function runPnpm(args: string[], cwd: string = process.cwd()): string {
  return execFileSync(resolvePnpmBin(), args, {
    encoding: 'utf-8',
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    // Windows 下 .cmd 需要 shell 才能启动
    shell: process.platform === 'win32',
  }).trim();
}

/** package.json 的最小结构 */
export interface PackageManifest {
  name: string;
  version: string;
  [key: string]: unknown;
}

/**
 * 递归收集目录下的 package.json 文件（返回相对 cwd 的 POSIX 路径）。
 *
 * @param rootDir 扫描根目录的绝对路径
 * @param maxDepth 最大递归深度（防止异常深的目录树）
 * @returns 相对路径数组，如 `['package.json']`
 */
export function findPackageJsonFiles(rootDir: string, maxDepth = 3): string[] {
  const results: string[] = [];

  const walk = (dir: string, depth: number): void => {
    if (depth > maxDepth) return;

    let entries: ReturnType<typeof readdirSync>;
    try {
      entries = readdirSync(dir, { withFileTypes: true }) as unknown as ReturnType<typeof readdirSync>;
    } catch {
      return;
    }

    for (const entry of entries as unknown as Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>) {
      // 跳过构建产物与依赖目录
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;

      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, depth + 1);
      } else if (entry.isFile() && entry.name === 'package.json') {
        results.push(fullPath);
      }
    }
  };

  walk(rootDir, 0);
  return results;
}

/**
 * 读取并解析 package.json。
 *
 * @param filePath package.json 的绝对路径
 * @returns 解析后的对象（失败时返回 null）
 */
export function readPackageJson(filePath: string): PackageManifest | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as PackageManifest;
  } catch {
    return null;
  }
}

/**
 * 收集本仓库需要版本同步的 package.json 列表。
 *
 * 当前为单包仓库 —— 只包含根目录 package.json。
 * 若未来拆分出 workspace 子包，在此处追加对应路径即可。
 *
 * @param cwd 项目根目录
 * @returns package.json 绝对路径数组
 */
export function collectWorkspacePackages(cwd: string): string[] {
  const rootManifest = join(cwd, 'package.json');
  return existsSync(rootManifest) ? [rootManifest] : [];
}

/**
 * 把绝对路径转成相对 cwd 的 POSIX 风格路径（便于跨平台日志输出）。
 *
 * @param cwd 项目根目录
 * @param target 目标绝对路径
 * @returns 相对路径（使用 `/` 分隔）
 */
export function toRelativePosix(cwd: string, target: string): string {
  return relative(cwd, target).split(sep).join('/');
}

/**
 * 判断路径是否为目录。
 *
 * @param target 目标路径
 * @returns 是目录返回 true
 */
export function isDirectory(target: string): boolean {
  try {
    return statSync(target).isDirectory();
  } catch {
    return false;
  }
}
