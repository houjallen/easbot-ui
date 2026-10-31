#!/usr/bin/env tsx
/**
 * scripts/clean-test-fixtures.ts
 *
 * 清理测试过程中残留的临时文件 / 目录。
 *
 * 使用方法：
 *   pnpm exec tsx scripts/clean-test-fixtures.ts
 *
 * 清理范围（保守优先，宁可漏清不可误删）：
 *   - dot-prefix 目录：.test-* / .tmp-* / .*-tmp-* / .vitest-*
 *   - 已知临时文件后缀：v*.json（vitest --outputFile 模式报告）
 *
 * 安全保证：只删除 dot-prefix 文件 / 目录 + 已知后缀的临时文件，
 * 绝不碰 setup.ts / *.test.tsx 这类真实源文件。
 *
 * 设计说明：
 *   原脚本 import 了未安装的 `@easbot/utils` 的 `Glob` / `Filesystem`，运行即 ReferenceError。
 *   现改为零外部依赖（node 内置 fs 递归遍历）。
 */

import { readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** 项目根目录 */
const PKG_ROOT = process.cwd();

/**
 * 扫描根目录（相对 PKG_ROOT）。
 *
 * 只扫描 src / tests 两个目录 —— 组件库没有 examples / skills 目录。
 */
const SCAN_ROOTS = [join(PKG_ROOT, 'src'), join(PKG_ROOT, 'tests')];

/** 需要跳过的目录名 */
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'storybook-static', 'coverage']);

/**
 * 判断路径名是否符合"测试临时文件 / 目录"命名规则（取最后一段 basename）。
 *
 * 规则（保守优先，宁可漏清不可误删）：
 *  - dot-prefix 目录：`.test-*` / `.tmp-*` / `.*-tmp-*` / `.vitest-*`
 *  - 已知临时文件后缀：`v*.json`（vitest --outputFile 模式报告）
 *
 * @param name basename
 * @returns 命中返回 true
 */
function isTestTempEntry(name: string): boolean {
  if (name.startsWith('.test-')) return true;
  if (name.startsWith('.vitest-')) return true;
  if (name.startsWith('.tmp')) return true;
  if (name.startsWith('.') && name.includes('-tmp-')) return true;
  if (/^v[a-z0-9_-]*\.json$/i.test(name) && name.length <= 32) return true;
  return false;
}

/**
 * 递归收集待清理的临时条目。
 *
 * @param root 扫描根目录
 * @param collected 收集结果（原地累加）
 * @param depth 当前递归深度
 */
function collectTempEntries(root: string, collected: string[], depth = 0): void {
  if (depth > 20) return;

  let entries: ReturnType<typeof readdirSync>;
  try {
    entries = readdirSync(root, { withFileTypes: true }) as unknown as ReturnType<typeof readdirSync>;
  } catch {
    return;
  }

  for (const entry of entries as unknown as Array<{ name: string; isDirectory(): boolean }>) {
    const fullPath = join(root, entry.name);

    if (entry.isDirectory()) {
      // 目录：命中命名规则 → 整目录删除；否则递归进去
      if (isTestTempEntry(entry.name)) {
        collected.push(fullPath);
      } else {
        if (SKIP_DIRS.has(entry.name)) continue;
        collectTempEntries(fullPath, collected, depth + 1);
      }
    } else if (isTestTempEntry(entry.name)) {
      collected.push(fullPath);
    }
  }
}

/** 主流程 */
let totalCleaned = 0;
let totalFailed = 0;
const cleanedByRoot: Record<string, number> = {};

for (const root of SCAN_ROOTS) {
  const collected: string[] = [];
  collectTempEntries(root, collected);

  let rootCleaned = 0;
  for (const fullPath of collected) {
    // 双保险：basename 必须命中临时命名规则
    const basename = fullPath.split(/[/\\]/).pop() ?? '';
    if (!isTestTempEntry(basename)) continue;

    try {
      const stat = statSync(fullPath);
      rmSync(fullPath, { recursive: stat.isDirectory(), force: true });
      rootCleaned++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[clean-test-fixtures] failed to remove ${fullPath}: ${message}`);
      totalFailed++;
    }
  }

  if (rootCleaned > 0) {
    cleanedByRoot[relative(PKG_ROOT, root).split(sep).join('/')] = rootCleaned;
    totalCleaned += rootCleaned;
  }
}

if (totalCleaned > 0) {
  console.log(`[clean-test-fixtures] cleaned up ${totalCleaned} leftover entries:`);
  for (const [root, n] of Object.entries(cleanedByRoot)) {
    console.log(`  - ${root} (${n})`);
  }
}

if (totalFailed > 0) {
  process.exit(1);
}
