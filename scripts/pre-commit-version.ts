#!/usr/bin/env tsx
/**
 * Git pre-commit hook —— 版本管理辅助脚本
 *
 * 用途：
 *   在提交前可选地自动升级版本号并打 tag。
 *
 * 环境变量：
 *   ENABLE_VERSION_BUMP=1           # 启用自动版本升级（默认禁用）
 *   VERSION_BUMP=major|minor|patch  # 指定升级类型，默认为 patch
 *
 * 设计说明：
 *   - 原脚本 import 了未安装的 `@easbot/utils`，且扫描本仓库不存在的 `packages/` 目录。
 *     现改为零外部依赖 + 单包语义。
 *   - 不自动 `git commit` —— commit 由 husky / 使用者完成，避免与 husky 形成递归调用。
 */

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectWorkspacePackages, readPackageJson } from './lib/package-discovery';

/** 版本号格式验证（semver） */
const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;

/** 版本升级类型 */
type BumpType = 'major' | 'minor' | 'patch';

/** git tag 前缀（与包名 @easbot/ui 对应） */
const TAG_PREFIX = 'easbot-ui';

/**
 * 升级版本号
 *
 * @param version 当前版本号
 * @param type 升级类型
 * @returns 升级后的版本号
 */
function bumpVersion(version: string, type: BumpType): string {
  const match = version.match(VERSION_REGEX);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }

  const major = Number.parseInt(match[1] as string, 10);
  const minor = Number.parseInt(match[2] as string, 10);
  const patch = Number.parseInt(match[3] as string, 10);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
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
 * 主函数
 */
function main(): void {
  // 默认禁用 —— 需显式设置 ENABLE_VERSION_BUMP=1 才启用
  if (process.env.ENABLE_VERSION_BUMP !== '1') {
    console.log('ℹ️  版本升级已禁用（默认）');
    console.log('   使用 ENABLE_VERSION_BUMP=1 启用自动版本升级');
    process.exit(0);
  }

  const bumpType = (process.env.VERSION_BUMP as BumpType | undefined) ?? 'patch';
  if (!['major', 'minor', 'patch'].includes(bumpType)) {
    console.error(`❌ 无效的升级类型: ${bumpType}`);
    console.error('   支持的类型: major, minor, patch');
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

  console.log(`\n🚀 统一版本升级 (${bumpType})`);
  console.log(`   当前版本: ${oldVersion}`);
  console.log(`   新版本: ${newVersion}`);

  if (tagExists(tag)) {
    console.error(`\n❌ Tag 已存在: ${tag}`);
    process.exit(1);
  }

  // 更新 package.json
  const packages = collectWorkspacePackages(cwd);
  console.log(`\n📦 更新 ${packages.length} 个 package.json 文件:`);

  for (const pkgPath of packages) {
    const pkg = readPackageJson(pkgPath);
    if (!pkg) continue;
    pkg.version = newVersion;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
    console.log(`   ✅ ${pkg.name} -> ${newVersion}`);
  }

  // 生成 CHANGELOG
  const changelogScript = join(cwd, 'scripts', 'generate-changelog.ts');
  if (existsSync(changelogScript)) {
    try {
      execFileSync('npx', ['tsx', 'scripts/generate-changelog.ts', newVersion], { stdio: 'inherit' });
      console.log('   ✅ CHANGELOG.md 已更新');
    } catch (error) {
      console.warn('   ⚠️  生成 CHANGELOG.md 失败:', error);
    }
  }

  // 创建 tag
  try {
    execFileSync('git', ['tag', '-a', tag, '-m', `chore(release): ${TAG_PREFIX}@${newVersion}`]);
    console.log(`\n✅ 版本升级完成`);
    console.log(`   Tag: ${tag}`);
    console.log('\n接下来执行:');
    console.log('   git add package.json CHANGELOG.md');
    console.log(`   git commit -m "chore(release): ${TAG_PREFIX}@${newVersion}"`);
    console.log('   git push && git push --tags');
  } catch (error) {
    console.error('   ❌ 创建 tag 失败:', error);
    process.exit(1);
  }
}

main();
