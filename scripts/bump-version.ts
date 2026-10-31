#!/usr/bin/env tsx
/**
 * 手动版本升级脚本
 *
 * 升级根 package.json 的版本号，同步 README 顶部版本段，并生成 CHANGELOG.md。
 *
 * 使用方法:
 *   pnpm version:patch   # 升级补丁版本 (0.3.31 -> 0.3.32)
 *   pnpm version:minor   # 升级次版本 (0.3.31 -> 0.4.0)
 *   pnpm version:major   # 升级主版本 (0.3.31 -> 1.0.0)
 *
 * 副作用:
 *   1. 写入根 package.json 的 version 字段
 *   2. 同步 README.md / README.en.md 顶部的「版本 / Version」段
 *   3. 生成 CHANGELOG.md（若生成脚本存在）
 *   4. 创建 git tag（不自动 commit —— commit 由使用者自行决定）
 *
 * 设计说明:
 *   - 原脚本引用了未安装的 `@easbot/utils` 的 `Glob`（且从未 import），运行即 ReferenceError。
 *     现改为零外部依赖（node 内置模块 + scripts/lib/package-discovery.ts）。
 *   - 原 tag 前缀为 `easbot-skills@`，与本包 `@easbot/ui` 不符，现统一为 `easbot-ui@`。
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectWorkspacePackages, readPackageJson, toRelativePosix } from './lib/package-discovery';

/** 版本号格式验证（semver） */
const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;

/** 版本升级类型 */
type BumpType = 'major' | 'minor' | 'patch';

/** git tag 前缀（与包名 @easbot/ui 对应） */
const TAG_PREFIX = 'easbot-ui';

/**
 * 解析版本号
 *
 * @param version 语义化版本字符串
 * @returns 解析结果，格式非法时返回 null
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(VERSION_REGEX);
  if (!match) return null;
  return {
    major: Number.parseInt(match[1] as string, 10),
    minor: Number.parseInt(match[2] as string, 10),
    patch: Number.parseInt(match[3] as string, 10),
  };
}

/**
 * 升级版本号
 *
 * @param version 当前版本号
 * @param type 升级类型
 * @returns 升级后的版本号
 */
function bumpVersion(version: string, type: BumpType): string {
  const parsed = parseVersion(version);
  if (!parsed) {
    throw new Error(`Invalid version format: ${version}`);
  }

  switch (type) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
}

/**
 * 执行 git 命令
 *
 * @param args git 参数数组
 * @returns 标准输出（trim 后）
 */
function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf-8' }).trim();
}

/**
 * 检查 git tag 是否存在
 *
 * @param tag tag 名
 * @returns 存在返回 true
 */
function tagExists(tag: string): boolean {
  try {
    const out = execFileSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out.length > 0;
  } catch {
    return false;
  }
}

/**
 * 检查是否有未提交的更改（忽略未跟踪文件）
 *
 * @returns 有未提交更改返回 true
 */
function hasUncommittedChanges(): boolean {
  return git(['status', '--porcelain', '--untracked-files=no']).length > 0;
}

/** README 版本锚定段定义 */
const README_SYNC = {
  zh: {
    heading: '## 版本',
    bodyLine: (v: string): string => `v${v}`,
    section: (v: string): string => `## 版本\n\nv${v}\n`,
  },
  en: {
    heading: '## Version',
    bodyLine: (v: string): string => `v${v}`,
    section: (v: string): string => `## Version\n\nv${v}\n`,
  },
} as const;

/** README 语言 */
type ReadmeLang = 'zh' | 'en';

/** README 同步结果 */
interface ReadmeSyncResult {
  file: string;
  action: 'updated' | 'inserted' | 'unchanged' | 'skipped-no-file';
  oldVersion?: string;
  newVersion: string;
}

/**
 * 同步单个 README 的版本锚定段。
 *
 * 规则：
 * 1. 找到 `## 版本`（zh）或 `## Version`（en）段
 * 2. 该段从标题行开始，直到下一个 `## ` / `### ` / `---` 行 / EOF（取最先）
 * 3. 替换整段内容为 `${heading}\n\nv<new>`，保留后续内容不动
 * 4. 若段不存在：在第一个 `## ` 二级标题之前插入新段
 *
 * @param filePath README 绝对路径
 * @param newVersion 新版本号
 * @param lang 语言
 * @returns 同步结果
 */
function syncReadmeVersion(filePath: string, newVersion: string, lang: ReadmeLang): ReadmeSyncResult {
  const cfg = README_SYNC[lang];

  if (!existsSync(filePath)) {
    return { file: filePath, action: 'skipped-no-file', newVersion };
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const headingIdx = lines.findIndex((line) => line.trim() === cfg.heading);

  if (headingIdx >= 0) {
    // 段结束 = 下一个 `## ` / `### ` / `---` 行 / EOF（取最先）
    let endIdx = lines.length;
    for (let i = headingIdx + 1; i < lines.length; i++) {
      const trimmed = lines[i]?.trim() ?? '';
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed === '---') {
        endIdx = i;
        break;
      }
    }

    const oldBlock = lines.slice(headingIdx, endIdx).join('\n');
    const oldVersion = oldBlock.match(/v(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?(?:\+[a-zA-Z0-9.-]+)?)/)?.[1];

    const newBlock = `${cfg.heading}\n\n${cfg.bodyLine(newVersion)}`;
    const newLines = [...lines.slice(0, headingIdx), ...newBlock.split('\n'), ...lines.slice(endIdx)];
    writeFileSync(filePath, newLines.join('\n'), 'utf-8');

    return {
      file: filePath,
      action: oldVersion === newVersion ? 'unchanged' : 'updated',
      oldVersion,
      newVersion,
    };
  }

  // 段不存在 → 在第一个 `## ` 之前插入
  const firstH2Idx = lines.findIndex((line) => /^## /.test(line));
  const insertIdx = firstH2Idx >= 0 ? firstH2Idx : lines.length;
  const newLines = [...lines.slice(0, insertIdx), cfg.section(newVersion), ...lines.slice(insertIdx)];
  writeFileSync(filePath, newLines.join('\n'), 'utf-8');

  return { file: filePath, action: 'inserted', newVersion };
}

/**
 * 同步所有 README 的版本锚定段。
 *
 * @param newVersion 新版本号
 * @returns 同步结果列表
 */
export function syncAllReadmes(newVersion: string): ReadmeSyncResult[] {
  const cwd = process.cwd();
  return [syncReadmeVersion(join(cwd, 'README.md'), newVersion, 'zh'), syncReadmeVersion(join(cwd, 'README.en.md'), newVersion, 'en')];
}

/**
 * 主函数
 */
function main(): void {
  const bumpType = process.argv[2] as BumpType | undefined;

  if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('❌ 请指定升级类型: major, minor, 或 patch');
    console.error('\n使用方法:');
    console.error('  pnpm version:patch   # 升级补丁版本 (0.3.31 -> 0.3.32)');
    console.error('  pnpm version:minor   # 升级次版本 (0.3.31 -> 0.4.0)');
    console.error('  pnpm version:major   # 升级主版本 (0.3.31 -> 1.0.0)');
    process.exit(1);
  }

  if (hasUncommittedChanges()) {
    console.error('❌ 有未提交的更改，请先提交或暂存所有更改');
    console.error('   运行 git status 查看详情');
    process.exit(1);
  }

  const cwd = process.cwd();
  const rootManifest = join(cwd, 'package.json');
  const rootPkg = readPackageJson(rootManifest);

  if (!rootPkg) {
    console.error('❌ 无法读取根 package.json');
    process.exit(1);
  }

  const oldVersion = rootPkg.version;
  const newVersion = bumpVersion(oldVersion, bumpType);
  const tag = `${TAG_PREFIX}@${newVersion}`;

  console.log(`🚀 手动版本升级 (${bumpType})`);
  console.log(`   当前版本: ${oldVersion}`);
  console.log(`   新版本: ${newVersion}`);

  if (tagExists(tag)) {
    console.error(`\n❌ Tag 已存在: ${tag}`);
    console.error('   请手动指定不同的版本号或删除已存在的 tag');
    process.exit(1);
  }

  // 更新 package.json
  const packages = collectWorkspacePackages(cwd);
  console.log(`\n📦 更新 ${packages.length} 个 package.json 文件:`);

  for (const pkgPath of packages) {
    const pkg = readPackageJson(pkgPath);
    if (!pkg) {
      console.error(`   ❌ 读取 ${pkgPath} 失败`);
      process.exit(1);
    }
    pkg.version = newVersion;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
    console.log(`   ✅ ${toRelativePosix(cwd, pkgPath)} (${pkg.name})`);
  }

  // 同步 README 版本段
  console.log('\n📝 同步 README 版本锚定段...');
  const readmeResults = syncAllReadmes(newVersion);
  for (const r of readmeResults) {
    const icon = r.action === 'updated' ? '✏️  updated' : r.action === 'inserted' ? '➕ inserted' : r.action === 'unchanged' ? '✅ unchanged' : '⏭️  skipped';
    const verInfo = r.action !== 'skipped-no-file' ? (r.oldVersion ? ` (${r.oldVersion} → ${r.newVersion})` : ` → v${r.newVersion}`) : '';
    console.log(`   ${icon} ${toRelativePosix(cwd, r.file)}${verInfo}`);
  }

  // 生成 CHANGELOG
  console.log('\n📝 生成 CHANGELOG.md...');
  const changelogScript = join(cwd, 'scripts', 'generate-changelog.ts');
  if (existsSync(changelogScript)) {
    try {
      execFileSync('npx', ['tsx', 'scripts/generate-changelog.ts', newVersion], { stdio: 'inherit' });
      console.log('   ✅ CHANGELOG.md 已更新');
    } catch (error) {
      console.warn('   ⚠️  生成 CHANGELOG.md 失败:', error);
    }
  } else {
    console.log('   ⏭️  未找到生成脚本，跳过');
  }

  // 创建 git tag（不自动 commit —— commit 交由使用者决定）
  try {
    git(['tag', '-a', tag, '-m', `chore(release): ${TAG_PREFIX}@${newVersion}`]);
    console.log(`\n✅ 版本升级完成`);
    console.log(`   版本: ${oldVersion} -> ${newVersion}`);
    console.log(`   Tag: ${tag}`);
    console.log('\n接下来执行:');
    console.log('   git add package.json README.md README.en.md CHANGELOG.md');
    console.log(`   git commit -m "chore(release): ${TAG_PREFIX}@${newVersion}"`);
    console.log('   git push && git push --tags');
  } catch (error) {
    console.error('   ❌ 创建 tag 失败:', error);
    process.exit(1);
  }
}

main();
