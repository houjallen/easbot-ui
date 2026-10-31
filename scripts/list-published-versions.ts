#!/usr/bin/env tsx
/**
 * 查询 package.json 在 npm 上的最新发布版本号
 *
 * 功能说明：
 * - 遍历本仓库的 package.json（当前为单包仓库 —— 仅根目录）
 * - 通过 `pnpm view` 获取每个包在 npm 上的 dist-tags.latest
 * - 与本地 package.json 的 version 比对，标注是否已发布到 npm
 *
 * 使用方法：
 *   pnpm publish:list              # 人类可读表格输出
 *   pnpm publish:list -- --json    # JSON 输出到 stdout
 *   pnpm publish:list -- -o out.json
 *
 * 命令行参数：
 *   --json                 输出 JSON（默认人类可读）
 *   --output, -o <path>    将 JSON 结果写入文件
 *   --registry <url>       指定 npm registry（默认 https://registry.npmjs.org）
 *   --help, -h             显示帮助
 *
 * 设计说明：
 *   原脚本使用了未安装的 `@easbot/utils` 的 `Glob` / `Shell` / `Semver`，
 *   运行即 ReferenceError。现改为零外部依赖（node 内置 child_process + 自实现版本比较）。
 */

import { writeFileSync } from 'node:fs';
import process from 'node:process';
import { collectWorkspacePackages, readPackageJson, runPnpm, toRelativePosix } from './lib/package-discovery';

/** 单个 package 的最新发布版本状态 */
interface PackageLatestStatus {
  /** 包名 */
  name: string;
  /** package.json 相对路径 */
  path: string;
  /** 本地 package.json 的 version */
  localVersion: string;
  /** npm 上 dist-tags.latest 的版本号（若无则 null） */
  latest: string | null;
  /** 本地版本是否已发布（localVersion === latest） */
  publishedLocally: boolean;
  /** 获取信息失败时的错误信息（若有） */
  error?: string;
}

/** CLI 选项 */
interface CliOptions {
  json: boolean;
  output: string | undefined;
  registry: string;
}

/**
 * 解析命令行参数
 *
 * @param argv 参数数组
 * @returns 解析结果
 */
function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    json: false,
    output: undefined,
    registry: 'https://registry.npmjs.org',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--output' || arg === '-o') {
      const value = argv[++i];
      if (!value) throw new Error('--output 需要一个文件路径参数');
      opts.output = value;
    } else if (arg === '--registry') {
      const value = argv[++i];
      if (!value) throw new Error('--registry 需要一个 URL 参数');
      opts.registry = value;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`未知参数: ${arg}`);
    }
  }

  return opts;
}

/** 打印帮助信息 */
function printHelp(): void {
  console.log(`list-published-versions.ts

查询 package.json 在 npm 上的最新发布版本号。

用法:
  tsx scripts/list-published-versions.ts [选项]

选项:
  --json                 输出 JSON 格式（默认人类可读表格）
  --output, -o <path>    将结果写入文件（搭配 --json 使用）
  --registry <url>       指定 npm registry（默认 https://registry.npmjs.org）
  --help, -h             显示帮助

示例:
  tsx scripts/list-published-versions.ts
  tsx scripts/list-published-versions.ts --json --output publish-status.json
`);
}

/**
 * 比较两个 semver 版本号是否相等。
 *
 * 只比较 `major.minor.patch` 主干部分，忽略预发布 / 构建元信息
 * （npm 的 dist-tags.latest 总是稳定版，本地可能是预发布版）。
 *
 * @param a 版本号 A
 * @param b 版本号 B
 * @returns 相等返回 true
 */
function semverEquals(a: string, b: string): boolean {
  const parse = (v: string): [number, number, number] | null => {
    const match = v.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) return null;
    return [Number.parseInt(match[1] as string, 10), Number.parseInt(match[2] as string, 10), Number.parseInt(match[3] as string, 10)];
  };

  const left = parse(a);
  const right = parse(b);
  if (!left || !right) return a === b;

  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2];
}

/**
 * 通过 pnpm view 获取 dist-tags.latest 版本号
 *
 * @param pkgName 包名
 * @param registry npm registry 地址
 * @returns 查询结果
 */
function fetchLatestVersion(pkgName: string, registry: string): { latest: string | null; error?: string } {
  try {
    const stdout = runPnpm(['view', pkgName, 'dist-tags.latest', '--registry', registry]);

    if (!stdout) {
      return { latest: null, error: '包尚未发布到 npm' };
    }

    const firstLine = stdout.split(/\r?\n/)[0]?.trim() ?? '';
    if (!firstLine || firstLine === 'undefined' || firstLine === 'null') {
      return { latest: null, error: 'npm 未返回 latest 版本号' };
    }
    return { latest: firstLine };
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr ?? '';
    const stdout = (error as { stdout?: string }).stdout ?? '';
    const message = error instanceof Error ? error.message : String(error);
    // 「包尚未发布」的判定需覆盖三种形态：
    // - npm：`E404`
    // - pnpm：`ERR_PNPM_FETCH_404` + `is not in the npm registry`
    // - 部分版本 pnpm 把该提示写到 stdout 而非 stderr
    const notFound = [stderr, stdout, message].some(
      (text) => text.includes('E404') || text.includes('ERR_PNPM_FETCH_404') || text.includes('is not in the npm registry') || text.includes('Not Found - 404'),
    );
    if (notFound) {
      return { latest: null, error: '包尚未发布到 npm' };
    }
    return { latest: null, error: stderr.trim() || stdout.trim() || message };
  }
}

/**
 * 分析单个 package 的最新发布版本
 *
 * @param pkgJsonPath package.json 的绝对路径
 * @param registry npm registry 地址
 * @param cwd 项目根目录（用于计算相对路径）
 * @returns 分析结果
 */
function analyzePackage(pkgJsonPath: string, registry: string, cwd: string): PackageLatestStatus {
  const pkg = readPackageJson(pkgJsonPath);
  const relPath = toRelativePosix(cwd, pkgJsonPath);

  if (!pkg) {
    return {
      name: relPath,
      path: relPath,
      localVersion: '?',
      latest: null,
      publishedLocally: false,
      error: '无法读取 package.json',
    };
  }

  const { latest, error } = fetchLatestVersion(pkg.name, registry);

  return {
    name: pkg.name,
    path: relPath,
    localVersion: pkg.version,
    latest,
    publishedLocally: latest !== null && semverEquals(latest, pkg.version),
    error,
  };
}

/**
 * 人类可读表格输出
 *
 * @param statuses 分析结果列表
 */
function printTable(statuses: PackageLatestStatus[]): void {
  console.log('\n📦 EASBot UI — npm 最新发布版本\n');

  // 按「中文字符 × 2 + 英文 × 1」的视觉宽度估算列宽（终端等宽字体下中文占 2 格）
  const visualWidth = (s: string): number => {
    let w = 0;
    for (const ch of s) {
      w += /[　-鿿＀-￯]/.test(ch) ? 2 : 1;
    }
    return w;
  };

  const nameWidth = Math.max(8, ...statuses.map((s) => visualWidth(s.name)));
  const verWidth = Math.max(8, ...statuses.map((s) => visualWidth(s.localVersion)));
  const latestWidth = Math.max(11, ...statuses.map((s) => visualWidth(s.latest ?? '-')));

  const padEndVisual = (s: string, width: number): string => {
    const diff = width - visualWidth(s);
    return diff > 0 ? s + ' '.repeat(diff) : s;
  };

  const header = `${padEndVisual('包名', nameWidth)}  ${padEndVisual('本地版本', verWidth)}  ${padEndVisual('npm latest', latestWidth)}  状态`;
  console.log(header);
  console.log('-'.repeat(visualWidth(header) + 6));

  let published = 0;
  let unpublished = 0;
  let errored = 0;

  for (const s of statuses) {
    const status = s.error ? `⚠️  ${s.error}` : s.publishedLocally ? '✅ 已发布' : '⬜ 未发布';

    if (s.publishedLocally) published++;
    else if (s.error) errored++;
    else unpublished++;

    console.log(`${padEndVisual(s.name, nameWidth)}  ${padEndVisual(s.localVersion, verWidth)}  ${padEndVisual(s.latest ?? '-', latestWidth)}  ${status}`);
  }

  console.log('');
  console.log(`📊 总计: ${statuses.length} 个 package，${published} 个已发布本地版本，${unpublished} 个本地版本待发布，${errored} 个查询异常`);
}

/**
 * 生成 JSON 输出结构
 *
 * @param statuses 分析结果列表
 * @returns JSON 可序列化对象
 */
function toJsonOutput(statuses: PackageLatestStatus[]): Record<string, unknown> {
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total: statuses.length,
      localVersionPublished: statuses.filter((s) => s.publishedLocally).length,
      localVersionNotPublished: statuses.filter((s) => !s.publishedLocally && !s.error).length,
      errors: statuses.filter((s) => Boolean(s.error)).length,
    },
    packages: statuses.map((s) => ({
      name: s.name,
      path: s.path,
      localVersion: s.localVersion,
      latest: s.latest,
      publishedLocally: s.publishedLocally,
      error: s.error ?? null,
    })),
  };
}

/**
 * 主函数
 */
function main(): void {
  let opts: CliOptions;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ 参数错误: ${msg}`);
    printHelp();
    process.exit(1);
  }

  const cwd = process.cwd();
  const paths = collectWorkspacePackages(cwd);
  if (paths.length === 0) {
    console.error('❌ 未找到任何 package.json');
    process.exit(1);
  }

  console.log(`🔍 正在查询 ${paths.length} 个 package 的 npm 最新版本（registry: ${opts.registry}）...`);

  const statuses: PackageLatestStatus[] = [];
  for (const p of paths) {
    const status = analyzePackage(p, opts.registry, cwd);
    statuses.push(status);
    process.stdout.write(`· ${status.name.padEnd(25)} ${status.localVersion.padEnd(10)} `);
    process.stdout.write(status.publishedLocally ? '✅\n' : status.error ? '⚠️\n' : '⬜\n');
  }

  if (opts.json || opts.output) {
    const json = JSON.stringify(toJsonOutput(statuses), null, 2);
    if (opts.output) {
      writeFileSync(opts.output, `${json}\n`, 'utf-8');
      console.log(`\n💾 已写入: ${opts.output}`);
    }
    if (opts.json && !opts.output) console.log(json);
  } else {
    printTable(statuses);
  }
}

main();
