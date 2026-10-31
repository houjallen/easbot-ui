#!/usr/bin/env tsx
/**
 * CHANGELOG 自动生成脚本
 *
 * 基于 git commit 历史生成 CHANGELOG.md。
 *
 * 提交格式（AGENTS.md §Git 工作流）：
 *   - <type>(<scope>): <description>
 *   - [repo] <type>(<scope>): <description>
 *   - [auto] <summary>
 *
 * type 类型：
 *   - feat: 新功能
 *   - fix: 修复错误
 *   - docs: 文档更新
 *   - test: 测试相关
 *   - chore: 构建或工具变动
 *   - refactor: 重构
 *   - perf: 性能优化
 *   - ci: CI/CD 相关
 *
 * 使用方法：
 *   - 自动（基于 git tag）: pnpm exec tsx scripts/generate-changelog.ts
 *   - 手动指定版本: pnpm exec tsx scripts/generate-changelog.ts 0.3.32
 *   - 全量（不基于 tag）: pnpm exec tsx scripts/generate-changelog.ts --all
 *
 * 设计说明：
 *   原脚本针对 easbot skills 仓库设计（commit 前缀 `[skill: <name>]` / `[repo]`，
 *   仓库 URL 写死 `houjallen/agent-skills`）。本仓库是独立的组件库，
 *   改为标准的 conventional commits 解析，仓库 URL 从 package.json 读取。
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

/** commit 记录 */
interface Commit {
  /** 短 hash */
  hash: string;
  /** 提交归属：scope 名 / repo / auto */
  scope: string;
  /** type: feat / fix / docs / ... */
  type: string;
  /** 提交首行去掉前缀后的描述 */
  subject: string;
  /** 提交日期（YYYY-MM-DD） */
  date: string;
}

/** changelog 分组 */
interface ChangelogSection {
  title: string;
  emoji: string;
  commits: Commit[];
}

/** git tag 前缀（与包名 @easbot/ui 对应） */
const TAG_PREFIX = 'easbot-ui';

/**
 * 执行 git 命令
 *
 * @param args git 参数数组
 * @returns 标准输出（trim 后），失败返回空串
 */
function git(args: string[]): string {
  try {
    return execFileSync('git', args, { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

/**
 * 读取 package.json
 *
 * @returns 包名与版本号
 */
function readPackageJson(): { name: string; version: string } {
  try {
    const content = readFileSync('package.json', 'utf-8');
    const pkg = JSON.parse(content) as { name: string; version: string };
    return { name: pkg.name, version: pkg.version };
  } catch {
    return { name: '@easbot/ui', version: '0.0.0' };
  }
}

/**
 * 获取最近的版本 tag
 *
 * @returns tag 名，无则返回 null
 */
function getLatestVersionTag(): string | null {
  const tags = git(['tag', '-l', `${TAG_PREFIX}@*`, '--sort=-version:refname']);
  if (!tags) return null;
  return tags.split('\n').filter(Boolean)[0] ?? null;
}

/**
 * 解析 commit 首行
 *
 * 支持格式：
 *   - `<type>(<scope>): <subject>`
 *   - `<type>: <subject>`
 *   - `[repo] <type>(<scope>): <subject>`
 *   - `[repo] <type>: <subject>`
 *   - `[auto] <summary>`
 *
 * @param hash 短 hash
 * @param date 日期
 * @param message commit 首行
 * @returns 解析结果，不符合格式返回 null
 */
function parseCommit(hash: string, date: string, message: string): Commit | null {
  const typePattern = '(feat|fix|docs|test|chore|refactor|perf|ci)';
  const scopePattern = '([a-z][a-z0-9-]*)';

  // 1) [repo] <type>(<scope>): <subject>
  let m = message.match(new RegExp(`^\\[repo\\]\\s+${typePattern}\\(${scopePattern}\\):\\s+(.+)$`));
  if (m) {
    return makeCommit(hash, date, m[2] as string, `${m[1]}(${m[2]}): ${m[3]}`, m[1] as string);
  }

  // 2) [repo] <type>: <subject>
  m = message.match(new RegExp(`^\\[repo\\]\\s+${typePattern}:\\s+(.+)$`));
  if (m) {
    return makeCommit(hash, date, 'repo', `${m[1]}: ${m[2]}`, m[1] as string);
  }

  // 3) [auto] <summary>
  m = message.match(/^\[auto\]\s+(.+)$/);
  if (m) {
    return makeCommit(hash, date, 'auto', message, 'chore');
  }

  // 4) <type>(<scope>): <subject>
  m = message.match(new RegExp(`^${typePattern}\\(${scopePattern}\\):\\s+(.+)$`));
  if (m) {
    return makeCommit(hash, date, m[2] as string, `${m[1]}(${m[2]}): ${m[3]}`, m[1] as string);
  }

  // 5) <type>: <subject>
  m = message.match(new RegExp(`^${typePattern}:\\s+(.+)$`));
  if (m) {
    return makeCommit(hash, date, 'repo', `${m[1]}: ${m[2]}`, m[1] as string);
  }

  return null;
}

/**
 * 构造 commit 记录（过滤掉 release / version bump 自身的 commit）
 *
 * @param hash 短 hash
 * @param date 日期
 * @param scope 归属
 * @param subject 描述
 * @param type 类型
 * @returns commit 记录（type 为 `__skip__` 表示应跳过）
 */
function makeCommit(hash: string, date: string, scope: string, subject: string, type: string): Commit {
  // 过滤 release / version bump 自身的 commit（避免 changelog 自我引用）
  const lower = subject.toLowerCase();
  if (type === 'chore' && (lower.includes('release') || lower.includes('version'))) {
    return { hash, scope, type: '__skip__', subject, date };
  }
  return {
    hash: hash.trim(),
    scope: scope.trim(),
    type: type.trim(),
    subject: subject.trim(),
    date: date.trim(),
  };
}

/**
 * 获取 commits
 *
 * @param since 起始 tag（含之后），无则取全部
 * @param all 是否包含被过滤的 commit
 * @returns commit 列表
 */
function getCommits(since?: string, all = false): Commit[] {
  const args = ['log', '--pretty=format:%h|%ad|%s', '--date=short', '--no-merges'];
  if (since) {
    args.push(`${since}..HEAD`);
  }

  const output = git(args);
  if (!output) return [];

  const commits: Commit[] = [];
  for (const line of output.split('\n')) {
    if (!line.trim()) continue;
    const [hash, date, ...messageParts] = line.split('|');
    const message = messageParts.join('|');
    if (!hash || !date || !message) continue;

    const commit = parseCommit(hash, date, message);
    if (commit) {
      commits.push(commit);
    }
  }
  return all ? commits : commits.filter((c) => c.type !== '__skip__');
}

/**
 * 按 type 分组 commits
 *
 * @param commits commit 列表
 * @returns Map<type, commits>
 */
function groupCommitsByType(commits: Commit[]): Map<string, Commit[]> {
  const groups = new Map<string, Commit[]>();
  for (const commit of commits) {
    if (commit.type === '__skip__') continue;
    const existing = groups.get(commit.type) ?? [];
    existing.push(commit);
    groups.set(commit.type, existing);
  }
  return groups;
}

/**
 * type → 标题 / emoji
 *
 * @param type 类型
 * @returns 展示信息
 */
function getTypeInfo(type: string): { title: string; emoji: string } {
  const typeMap: Record<string, { title: string; emoji: string }> = {
    feat: { title: '新功能', emoji: '✨' },
    fix: { title: '修复', emoji: '🐛' },
    docs: { title: '文档', emoji: '📝' },
    test: { title: '测试', emoji: '✅' },
    chore: { title: '构建/工具', emoji: '🔧' },
    refactor: { title: '重构', emoji: '♻️' },
    perf: { title: '性能优化', emoji: '⚡' },
    ci: { title: 'CI/CD', emoji: '👷' },
  };
  return typeMap[type] ?? { title: type, emoji: '📦' };
}

/**
 * 生成 changelog 内容
 *
 * @param version 版本号
 * @param commits commit 列表
 * @returns markdown 内容
 */
function generateChangelogContent(version: string, commits: Commit[]): string {
  if (commits.length === 0) return '';

  const groups = groupCommitsByType(commits);
  const sections: ChangelogSection[] = [];

  const typeOrder = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'chore', 'ci'];
  for (const type of typeOrder) {
    const typeCommits = groups.get(type);
    if (typeCommits && typeCommits.length > 0) {
      const { title, emoji } = getTypeInfo(type);
      sections.push({ title, emoji, commits: typeCommits });
    }
  }

  const pkg = readPackageJson();
  const repoUrl = `https://github.com/houjallen/easbot-ui/commit`;

  let content = `## ${version}\n\n`;
  if (commits.length > 0) {
    content += `_${commits[0]?.date}_\n\n`;
  }

  for (const section of sections) {
    content += `### ${section.emoji} ${section.title}\n\n`;
    for (const commit of section.commits) {
      content += `- ${commit.subject} ([${commit.hash}](${repoUrl}/${commit.hash}))\n`;
    }
    content += '\n';
  }

  void pkg;
  return content;
}

/**
 * 读取现有 CHANGELOG.md
 *
 * @returns 现有内容（不存在则返回初始标题）
 */
function readExistingChangelog(): string {
  if (!existsSync('CHANGELOG.md')) {
    return '# EASBot UI 更新日志\n\n';
  }
  return readFileSync('CHANGELOG.md', 'utf-8');
}

/**
 * 更新 CHANGELOG.md
 *
 * @param version 版本号
 * @param newContent 新版本段落内容
 */
function updateChangelog(version: string, newContent: string): void {
  const existing = readExistingChangelog();
  const versionPattern = new RegExp(`^## ${version.replace(/\./g, '\\.')}$`, 'm');

  if (versionPattern.test(existing)) {
    // 版本已存在 → 替换该版本的内容
    const lines = existing.split('\n');
    const versionIndex = lines.indexOf(`## ${version}`);
    if (versionIndex !== -1) {
      let nextVersionIndex = lines.findIndex((line, index) => index > versionIndex && line.startsWith('## '));
      if (nextVersionIndex === -1) nextVersionIndex = lines.length;
      const before = lines.slice(0, versionIndex).join('\n');
      const after = lines.slice(nextVersionIndex).join('\n');
      writeFileSync('CHANGELOG.md', `${before}\n${newContent}${after}`, 'utf-8');
      return;
    }
  }

  // 版本不存在 → 在标题后插入
  const headerMatch = existing.match(/^#\s+.+$/m);
  if (headerMatch) {
    const headerEnd = existing.indexOf(headerMatch[0]) + headerMatch[0].length;
    const before = existing.substring(0, headerEnd);
    const after = existing.substring(headerEnd);
    writeFileSync('CHANGELOG.md', `${before}\n\n${newContent}${after}`, 'utf-8');
  } else {
    writeFileSync('CHANGELOG.md', `# EASBot UI 更新日志\n\n${newContent}${existing}`, 'utf-8');
  }
}

/**
 * 从 tag 中提取版本号
 *
 * @param tag tag 名
 * @returns 版本号，不匹配返回 null
 */
function extractVersionFromTag(tag: string): string | null {
  const match = tag.match(new RegExp(`^${TAG_PREFIX}@(.*)$`));
  return match ? (match[1] as string) : null;
}

/**
 * 主函数
 */
function main(): void {
  const args = process.argv.slice(2);
  const allMode = args.includes('--all');
  let version: string | null = null;

  if (args.length > 0 && !args[0]?.startsWith('--')) {
    version = args[0] as string;
    console.log(`   使用命令行指定的版本: ${version}`);
  } else {
    const pkg = readPackageJson();
    version = pkg.version;
    console.log(`   当前版本: ${version}`);
  }

  const latestTag = getLatestVersionTag();

  if (latestTag) {
    console.log(`   最近 tag: ${latestTag}`);
    if (!allMode && args.length === 0) {
      version = extractVersionFromTag(latestTag);
      console.log(`   从 tag 提取版本: ${version}`);
    }
  } else {
    console.log('   未找到版本 tag，将获取所有 commits');
  }

  const commits = getCommits(latestTag ?? undefined, allMode);
  console.log(`   找到 ${commits.length} 个符合格式的 commits`);

  if (commits.length === 0) {
    console.log('   没有新的 commits，跳过 CHANGELOG 生成');
    console.log('   提示：commit 消息需符合 <type>(<scope>): <description> 格式（AGENTS.md §Git 工作流）');
    return;
  }

  if (!version) {
    console.error('   ❌ 无法确定版本号');
    process.exit(1);
  }

  updateChangelog(version, generateChangelogContent(version, commits));
  console.log('✅ CHANGELOG.md 已更新');
}

main();
