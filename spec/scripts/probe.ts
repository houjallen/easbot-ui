/**
 * 规范探针（统一入口）—— spec/ 各规范 §M 扫描维度的**可复跑实现**
 *
 * @description
 * 定位见 [`spec/probe-script-standard.md`](../probe-script-standard.md)。
 * 与既有脚本的关系：
 *
 * - `a11y` / `api` / `perf` 域 → 转发 `pnpm check:spec`（[`check-spec.ts`](./check-spec.ts)）
 * - `i18n` 域 → 转发 `pnpm check:i18n`（[`check-i18n.ts`](./check-i18n.ts)）
 * - 其余域（component / css / arch / model / testing / annotation / baseline）→ 本文件实现
 *
 * 用法（必须在仓库根目录执行）：
 * ```bash
 * pnpm probe all                 # 一键全跑（含两个既有检查脚本）
 * pnpm probe component           # 按域单跑（名称见下表）
 * pnpm probe css --with-build    # css 探针附带产物检查（会触发 pnpm build:css）
 * ```
 *
 * 退出码：0 = 无 ERROR；1 = 存在 ERROR（`baseline` 为信息型探针，恒 0）。
 *
 * ## ERROR / WARN 语义（与 check-spec.ts 一致）
 *
 * - **ERROR** —— 可确定性判定的违规，必须修（阻塞退出码）。
 * - **WARN** —— 启发式判定或存量豁免（§M+2 登记），需人工确认；不阻塞提交。
 *
 * ⚠️ 本脚本**只读**（唯一例外：`css --with-build` 会产生 `dist/` 构建产物），
 * 不修改任何源码文件；零外部依赖（仅 `node:*` 内置模块）。
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

/** 仓库根目录（由脚本自身位置推导，不依赖 process.cwd） */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** 单条探针结果 */
interface Finding {
  /** 级别：ERROR 阻塞 / WARN 提示 */
  level: 'ERROR' | 'WARN';
  /** 相对路径（正斜杠；信息型为空串） */
  file: string;
  /** 行号（1 起；信息型为 0） */
  line: number;
  /** 描述 */
  message: string;
}

/** 单个探针的收集器 */
class Probe {
  readonly findings: Finding[] = [];
  constructor(readonly name: string) {}

  /**
   * 记录一条结果
   *
   * @param level 级别
   * @param file 相对路径（信息型传空串）
   * @param line 行号（信息型传 0）
   * @param message 描述
   */
  add(level: 'ERROR' | 'WARN', file: string, line: number, message: string): void {
    this.findings.push({ level, file, line, message });
  }

  /** ERROR 数 */
  get errors(): number {
    return this.findings.filter((f) => f.level === 'ERROR').length;
  }

  /** WARN 数 */
  get warns(): number {
    return this.findings.filter((f) => f.level === 'WARN').length;
  }
}

// ── 通用文件遍历工具 ───────────────────────────────────────────────────────

/**
 * 递归收集文件（绝对路径）
 *
 * @param dir 起始目录（绝对路径；不存在则返回空数组）
 * @param include 文件名需匹配
 * @param skip 完整路径命中任一则跳过
 */
function walkFiles(dir: string, include: RegExp, skip: RegExp[] = []): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (skip.some((re) => re.test(full))) continue;
    if (entry.isDirectory()) out.push(...walkFiles(full, include, skip));
    else if (include.test(entry.name)) out.push(full);
  }
  return out;
}

/** 转相对路径（正斜杠，供输出与豁免比对） */
function rel(abs: string): string {
  return path.relative(ROOT, abs).split(path.sep).join('/');
}

/** 读文件并按行拆分 */
function readLines(abs: string): string[] {
  return fs.readFileSync(abs, 'utf8').split(/\r?\n/);
}

/** 源码文件通用排除项：测试 / Story / 示例 */
const SKIP_IMPL = [/__tests__/, /[\\/]examples[\\/]/, /\.stories\./, /\.test\.tsx?$/];
const IMPL_TSX = /\.tsx$/;
const IMPL_TS = /\.(ts|tsx)$/;

// ═══════════════════════════════════════════════════════════════════════════
// probe: component —— component-standard 维度 ①②
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 组件目录契约探针
 *
 * @description
 * 维度① 4 件套：`src/ui/<c>/` 必须有实现 tsx + `index.ts`（或 `index.tsx`），
 * 测试与 Story 必须收纳在 `__tests__/` 子目录。
 * 维度② 实现文件禁止 `export default`（存量 42 处豁免 → WARN，改动即改 named export）。
 */
function probeComponent(): Probe {
  const probe = new Probe('component');
  const uiDir = path.join(ROOT, 'src', 'ui');
  for (const entry of fs.readdirSync(uiDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(uiDir, entry.name);

    // 维度①：入口 barrel（index.ts 或 index.tsx 二选一）
    const hasEntry = fs.existsSync(path.join(dir, 'index.ts')) || fs.existsSync(path.join(dir, 'index.tsx'));
    if (!hasEntry) {
      probe.add('ERROR', rel(dir), 0, `组件目录 ${entry.name}/ 缺 barrel 入口（index.ts / index.tsx）`);
    }

    // 维度①：至少一个实现 tsx
    const impls = walkFiles(dir, IMPL_TSX, [...SKIP_IMPL, /[\\/]hooks[\\/]/, /[\\/]locale[\\/]/, /[\\/]view[\\/]/, /[\\/]context[\\/]/]);
    if (impls.length === 0) {
      probe.add('ERROR', rel(dir), 0, `组件目录 ${entry.name}/ 缺实现 tsx`);
    }

    // 维度①：测试与 Story 必须在 __tests__/ 下
    const misplaced = walkFiles(dir, /\.(test\.tsx?|stories\.tsx)$/, [/__tests__/]);
    for (const f of misplaced) {
      probe.add('ERROR', rel(f), 0, '测试 / Story 未收纳到 __tests__/ 子目录');
    }

    // 维度②：实现文件 export default（存量豁免 → WARN）
    for (const f of impls) {
      readLines(f).forEach((raw, i) => {
        if (raw.trimStart().startsWith('*') || raw.trimStart().startsWith('//')) return;
        if (/^\s*export\s+default\s/.test(raw)) {
          probe.add('WARN', rel(f), i + 1, 'export default（存量豁免，改动即改 named export）');
        }
      });
    }
  }
  return probe;
}

// ═══════════════════════════════════════════════════════════════════════════
// probe: css —— css-standard 维度 ⑤⑥⑫（⑨ 需 --with-build）
// ═══════════════════════════════════════════════════════════════════════════

/** 解析主题文件中的 CSS 变量名集合 */
function themeVars(abs: string): Set<string> {
  const names = new Set<string>();
  for (const line of readLines(abs)) {
    const m = line.match(/^\s*(--[\w-]+)\s*:/);
    if (m) names.add(m[1] ?? '');
  }
  return names;
}

/**
 * 样式与主题探针
 *
 * @param withBuild true 时先跑 `pnpm build:css` 再检查产物（css 维度⑨）
 */
function probeCss(withBuild: boolean): Probe {
  const probe = new Probe('css');

  // 维度⑤：light / dark 变量集合一致性
  const lightPath = path.join(ROOT, 'src', 'theme', 'themes', 'light.css');
  const darkPath = path.join(ROOT, 'src', 'theme', 'themes', 'dark.css');
  if (fs.existsSync(lightPath) && fs.existsSync(darkPath)) {
    const light = themeVars(lightPath);
    const dark = themeVars(darkPath);
    const onlyLight = [...light].filter((v) => !dark.has(v));
    const onlyDark = [...dark].filter((v) => !light.has(v));
    for (const v of onlyLight) probe.add('ERROR', 'src/theme/themes/dark.css', 0, `变量 ${v} 仅存在于 light.css`);
    for (const v of onlyDark) probe.add('ERROR', 'src/theme/themes/light.css', 0, `变量 ${v} 仅存在于 dark.css`);
  } else {
    probe.add('ERROR', 'src/theme/themes/', 0, '缺 light.css 或 dark.css（主题双文件契约）');
  }

  // 维度⑫：编译入口唯一
  if (!fs.existsSync(path.join(ROOT, 'src', 'theme', 'styles.css'))) {
    probe.add('ERROR', 'src/theme/styles.css', 0, '缺唯一编译入口 src/theme/styles.css');
  }
  for (const legacy of ['src/styles.css', 'src/theme-light.css', 'src/theme-dark.css']) {
    if (fs.existsSync(path.join(ROOT, ...legacy.split('/')))) {
      probe.add('ERROR', legacy, 0, '旧编译入口仍存在（违反入口唯一性）');
    }
  }

  // 维度⑨（可选）：语义类必须真正生成 CSS / dark 变体不走系统偏好
  if (withBuild) {
    execSync('pnpm build:css', { cwd: ROOT, stdio: 'pipe' });
    const dist = path.join(ROOT, 'dist', 'styles.css');
    if (fs.existsSync(dist)) {
      const css = fs.readFileSync(dist, 'utf8');
      if (/prefers-color-scheme/.test(css)) {
        probe.add('ERROR', 'dist/styles.css', 0, 'dark 变体走了系统偏好（应为 data-theme）');
      }
      if (!/\.bg-primary\{/.test(css)) {
        probe.add('ERROR', 'dist/styles.css', 0, '语义类 .bg-primary 未生成（token 未 @theme inline 注册）');
      }
    } else {
      probe.add('ERROR', 'dist/styles.css', 0, 'pnpm build:css 未产出 dist/styles.css');
    }
  }
  return probe;
}

// ═══════════════════════════════════════════════════════════════════════════
// probe: arch —— architecture-standard 维度 ②③⑤⑥⑧ + code-quality ⑧⑨
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 架构与依赖探针
 *
 * @description
 * 维度② 支撑层（models / utils / hooks / providers）禁止反向依赖 ui / design-system；
 * 维度③ ui 层对 models 只允许 `import type`；
 * 维度⑤ 禁止 `@/` 路径别名；
 * 维度⑧ + code-quality⑨ dependencies 必须全部登记进 tsup external；
 * code-quality⑧ 依赖分区（react / radix 不得进 dependencies）。
 */
function probeArch(): Probe {
  const probe = new Probe('arch');

  // 维度②：依赖方向（范围 = 硬约束 1/2/4/5 的四个支撑层；src/components 是应用层，允许引用 ui）
  for (const layer of ['models', 'utils', 'hooks', 'providers']) {
    const files = walkFiles(path.join(ROOT, 'src', layer), IMPL_TS);
    for (const f of files) {
      readLines(f).forEach((raw, i) => {
        const m = raw.match(/from\s+['"](\.\.\/)+(ui|design-system)(\/|['"])/);
        if (m) {
          probe.add('ERROR', rel(f), i + 1, `支撑层 ${layer}/ 反向依赖 src/${m[2]}/（违反依赖方向）`);
        }
      });
    }
  }

  // 维度③：ui 层对 models 必须用 import type
  const uiFiles = walkFiles(path.join(ROOT, 'src', 'ui'), IMPL_TS, SKIP_IMPL);
  for (const f of uiFiles) {
    readLines(f).forEach((raw, i) => {
      if (/^import\s*\{[^}]*\}\s*from\s*'[^']*models/.test(raw) && !raw.includes('import type')) {
        probe.add('ERROR', rel(f), i + 1, 'models 只允许 import type（运行时导入会把 zod 打进 bundle）');
      }
    });
  }

  // 维度⑤：@/ 路径别名禁令
  const aliasScopes = ['src', 'tests', 'scripts', 'spec', '.storybook'].map((d) => path.join(ROOT, d)).filter((d) => fs.existsSync(d));
  for (const scope of aliasScopes) {
    for (const f of walkFiles(scope, /\.(ts|tsx)$/)) {
      readLines(f).forEach((raw, i) => {
        if (/from\s+['"]@\//.test(raw)) {
          probe.add('ERROR', rel(f), i + 1, '禁止 @/ 路径别名（一律用相对路径）');
        }
      });
    }
  }

  // 维度⑧ + code-quality ⑧⑨：依赖分区 + external 同步
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  const deps = Object.keys(pkg.dependencies ?? {});
  const tsupSource = fs.readFileSync(path.join(ROOT, 'tsup.config.ts'), 'utf8');
  for (const dep of deps) {
    if (dep === 'react' || dep === 'react-dom' || dep.startsWith('@radix-ui/')) {
      probe.add('ERROR', 'package.json', 0, `${dep} 不得在 dependencies（应属 peerDependencies）`);
    }
    if (!tsupSource.includes(`'${dep}'`)) {
      probe.add('ERROR', 'tsup.config.ts', 0, `依赖 ${dep} 未登记进 tsup external（会被打进 bundle）`);
    }
  }
  return probe;
}

// ═══════════════════════════════════════════════════════════════════════════
// probe: model —— model-standard 维度 ①③⑧⑨⑩
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 数据契约探针
 *
 * @description
 * 维度① `src/models/` 下禁止手写 interface（唯一合法先例：FilterRule 递归锚点）；
 * 维度③ 禁止 `.strict()` / `.strictObject()`；维度⑧ 禁止 `.nullable()`；
 * 维度⑨ zod 必须在 tsup external；维度⑩ 禁止 `JSON.parse(JSON.stringify())` 深拷贝。
 */
function probeModel(): Probe {
  const probe = new Probe('model');

  // 维度①：手写 interface（FilterRule 豁免）
  for (const f of walkFiles(path.join(ROOT, 'src', 'models'), IMPL_TS)) {
    readLines(f).forEach((raw, i) => {
      const m = raw.match(/^export\s+interface\s+(\w+)/);
      if (m && m[1] !== 'FilterRule') {
        probe.add('ERROR', rel(f), i + 1, `手写 interface ${m[1]}（应用 z.infer 派生）`);
      }
    });
  }

  // 维度③⑧⑩：全 src 扫描
  for (const f of walkFiles(path.join(ROOT, 'src'), IMPL_TS)) {
    readLines(f).forEach((raw, i) => {
      if (/\.strict\(\)|\.strictObject\(\)/.test(raw)) {
        probe.add('ERROR', rel(f), i + 1, '禁止 .strict() / .strictObject()（默认 strip 语义）');
      }
      if (/\.nullable\(\)/.test(raw)) {
        probe.add('ERROR', rel(f), i + 1, '禁止 .nullable()（用 .optional() 或 null 联合类型）');
      }
      if (/JSON\.parse\(JSON\.stringify\(/.test(raw) && !raw.trimStart().startsWith('*') && !raw.trimStart().startsWith('//')) {
        probe.add('ERROR', rel(f), i + 1, '禁止 JSON 深拷贝（用 structuredClone）');
      }
    });
  }

  // 维度⑨：zod 必须在 external
  const tsupSource = fs.readFileSync(path.join(ROOT, 'tsup.config.ts'), 'utf8');
  if (!tsupSource.includes(`'zod'`)) {
    probe.add('ERROR', 'tsup.config.ts', 0, 'zod 未登记进 tsup external');
  }
  return probe;
}

// ═══════════════════════════════════════════════════════════════════════════
// probe: testing —— testing-guidelines 维度 ② + polyfill 去重
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 测试规范探针
 *
 * @description
 * 维度② 测试文件禁止 `jest.*` / `@jest/globals`（必须 `vi.*`）；
 * polyfill 必须复用 `tests/polyfills.ts`（测试文件内自定义 stub → WARN，G4 存量）。
 */
function probeTesting(): Probe {
  const probe = new Probe('testing');
  const testFiles = walkFiles(path.join(ROOT, 'src'), /\.(test\.tsx?|test\.ts)$/);
  for (const f of testFiles) {
    readLines(f).forEach((raw, i) => {
      if (/\bjest\.|@jest\/globals/.test(raw)) {
        probe.add('ERROR', rel(f), i + 1, '测试必须用 vi.*（禁止 jest.* / @jest/globals）');
      }
      if (/class\s+ResizeObserver|class\s+IntersectionObserver/.test(raw)) {
        probe.add('WARN', rel(f), i + 1, '测试内自定义 stub（应复用 tests/polyfills.ts，G4 存量）');
      }
    });
  }
  return probe;
}

// ═══════════════════════════════════════════════════════════════════════════
// probe: annotation —— code-annotation-standard 维度 ①②⑦⑧
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 注解规范探针
 *
 * @description
 * 维度① 人称称呼禁令；维度② ADR / 决策编号引用禁令；
 * 维度⑦ `spec/` 路径引用禁令；维度⑧ 文件头块注释缺失（存量豁免 → WARN，改动即补）。
 */
function probeAnnotation(): Probe {
  const probe = new Probe('annotation');

  // 维度⑧：文件头块注释（实现 tsx，存量豁免 → WARN）
  for (const scope of ['ui', 'design-system']) {
    for (const f of walkFiles(path.join(ROOT, 'src', scope), IMPL_TSX, SKIP_IMPL)) {
      const head = readLines(f).slice(0, 3).join('\n');
      if (!head.includes('/**')) {
        probe.add('WARN', rel(f), 1, '缺文件头块注释（存量豁免，改动即补 —— annotation §M+2 H2）');
      }
    }
  }

  // 维度①②⑦：注释禁词（全 src 扫描）
  for (const f of walkFiles(path.join(ROOT, 'src'), IMPL_TS)) {
    readLines(f).forEach((raw, i) => {
      if (/\b(老侯|侯剑|小莫)\b/.test(raw)) {
        probe.add('ERROR', rel(f), i + 1, '注释禁止人称称呼（annotation 维度①）');
      }
      if (/ADR\s*\d{4}|决策\s*\d{4}/.test(raw)) {
        probe.add('ERROR', rel(f), i + 1, '注释禁止引用决策编号（annotation 维度②）');
      }
      if (/spec\/[a-z-]+\.md|spec\s*§/.test(raw)) {
        probe.add('ERROR', rel(f), i + 1, '注释禁止引用 spec 路径（annotation 维度⑦）');
      }
    });
  }
  return probe;
}

// ═══════════════════════════════════════════════════════════════════════════
// probe: baseline —— spec-index「全库现状」基线数字（信息型，恒 0 退出）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 基线数字探针
 *
 * @returns findings 恒空；数字走 stdout 表格
 */
function probeBaseline(): Probe {
  const probe = new Probe('baseline');
  const uiDir = path.join(ROOT, 'src', 'ui');
  const uiDirs = fs.readdirSync(uiDir, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
  const dsComponents = walkFiles(path.join(ROOT, 'src', 'design-system', 'components', 'ui'), IMPL_TSX, [/__tests__/]).length;
  const testFiles = walkFiles(path.join(ROOT, 'src'), /\.(test\.tsx?)$/).length;
  const storyFiles = walkFiles(path.join(ROOT, 'src'), /\.stories\.tsx$/).length;

  const impls = walkFiles(uiDir, IMPL_TSX, SKIP_IMPL);
  let edLines = 0;
  const edFiles = new Set<string>();
  for (const f of impls) {
    readLines(f).forEach((raw, i) => {
      if (/^\s*export\s+default\s/.test(raw)) {
        edLines += 1;
        edFiles.add(rel(f));
      }
    });
  }

  const boolRe = /^\s{2}(is|has|can|enable|show|hide|with|allow)[A-Z]\w*\??:\s*boolean/;
  const boolFiles = walkFiles(uiDir, IMPL_TS, [/__tests__/]).filter((f) => !/\.stories\./.test(f));
  let boolLines = 0;
  const boolFileSet = new Set<string>();
  for (const f of boolFiles) {
    readLines(f).forEach((raw, i) => {
      if (boolRe.test(raw)) {
        boolLines += 1;
        boolFileSet.add(rel(f));
      }
    });
  }

  let fvLines = 0;
  const fvFiles = new Set<string>();
  for (const f of walkFiles(path.join(ROOT, 'src'), /\.(ts|tsx|css)$/)) {
    readLines(f).forEach((raw, i) => {
      if (raw.includes('focus-visible')) {
        fvLines += 1;
        fvFiles.add(rel(f));
      }
    });
  }

  const reducedMotion: string[] = [];
  for (const f of walkFiles(path.join(ROOT, 'src'), /\.(ts|tsx|css)$/)) {
    if (readLines(f).some((l) => l.includes('prefers-reduced-motion'))) reducedMotion.push(rel(f));
  }

  // 文案域数 = component-messages.ts 中 `export const xxxMessages` 块数（排除聚合表 componentMessages）
  const messagesSource = fs.readFileSync(path.join(ROOT, 'src', 'utils', 'component-messages.ts'), 'utf8');
  const messageDomainNames = [...messagesSource.matchAll(/export const (\w+Messages)\s*=/g)].map((m) => m[1] ?? '');
  const messageDomains = messageDomainNames.filter((n) => n !== 'componentMessages').length;

  // 主题变量数
  const lightCount = themeVars(path.join(ROOT, 'src', 'theme', 'themes', 'light.css')).size;
  const darkCount = themeVars(path.join(ROOT, 'src', 'theme', 'themes', 'dark.css')).size;

  // external / dependencies / scripts
  const tsupSource = fs.readFileSync(path.join(ROOT, 'tsup.config.ts'), 'utf8');
  const externalBlock = tsupSource.match(/external:\s*string\[\]\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? '';
  const externalCount = (externalBlock.match(/'[^']+'/g) ?? []).length;
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  };

  console.log('===== 基线数字（供 spec-index「全库现状」刷新） =====');
  console.log(`公开组件目录 src/ui/          : ${uiDirs}`);
  console.log(`design-system 组件            : ${dsComponents}`);
  console.log(`测试文件                      : ${testFiles}`);
  console.log(`Story 文件                    : ${storyFiles}`);
  console.log(`export default（实现 tsx）    : ${edLines} 处 / ${edFiles.size} 文件`);
  console.log(`布尔 prop（src/ui ts+tsx）    : ${boolLines} 处 / ${boolFileSet.size} 文件`);
  console.log(`focus-visible（按行）         : ${fvLines} 行 / ${fvFiles.size} 文件`);
  console.log(
    `transition-all（实现文件）    : ${impls.filter((f) => readLines(f).some((l) => l.includes('transition-all'))).length} 文件（src/ui） / ${walkFiles(path.join(ROOT, 'src', 'design-system'), IMPL_TSX, SKIP_IMPL).filter((f) => readLines(f).some((l) => l.includes('transition-all'))).length} 文件（design-system）`,
  );
  console.log(`prefers-reduced-motion 位置   : ${reducedMotion.join(' | ') || '（无）'}`);
  console.log(`文案域数（xxxMessages 表）    : ${messageDomains}`);
  console.log(`主题变量 light / dark         : ${lightCount} / ${darkCount}`);
  console.log(`tsup external 包数            : ${externalCount}`);
  console.log(`dependencies / peerDeps / scripts : ${Object.keys(pkg.dependencies ?? {}).length} / ${Object.keys(pkg.peerDependencies ?? {}).length} / ${Object.keys(pkg.scripts ?? {}).length}`);
  console.log('> 刷新流程：把以上数字写回 spec-index「全库现状」并更新 baseline-date');
  return probe;
}

// ═══════════════════════════════════════════════════════════════════════════
// 转发既有检查脚本 + 汇总输出
// ═══════════════════════════════════════════════════════════════════════════

/** 本探针自身实现的域 */
const OWN_PROBES: Record<string, () => Probe> = {
  component: () => probeComponent(),
  css: () => probeCss(process.argv.includes('--with-build')),
  arch: () => probeArch(),
  model: () => probeModel(),
  testing: () => probeTesting(),
  annotation: () => probeAnnotation(),
  baseline: () => probeBaseline(),
};

/** 转发给既有脚本的域（返回退出码） */
const FORWARDED: Record<string, { command: string; label: string }> = {
  i18n: { command: 'pnpm check:i18n', label: 'check-i18n（i18n 维度 ①③④⑤⑥）' },
  spec: { command: 'pnpm check:spec', label: 'check-spec（a11y / component-api / react-performance / css⑮⑯⑰）' },
};

/** 打印单个探针结果 */
function printProbe(probe: Probe): void {
  console.log(`\n===== probe:${probe.name} =====`);
  if (probe.findings.length === 0) {
    console.log('OK（无违规）');
    return;
  }
  for (const f of probe.findings) {
    const loc = f.file ? `${f.file}${f.line > 0 ? `:${f.line}` : ''}` : '—';
    console.log(`${f.level === 'ERROR' ? '✗' : '·'} ${loc} - ${f.message}`);
  }
  console.log(`[probe:${probe.name}] ERROR ${probe.errors} / WARN ${probe.warns}`);
}

/** 命令入口 */
function main(): number {
  const name = process.argv[2] ?? 'all';
  const failed: string[] = [];

  if (name === 'all') {
    for (const key of Object.keys(OWN_PROBES)) {
      const probe = OWN_PROBES[key]!();
      printProbe(probe);
      if (probe.errors > 0) failed.push(probe.name);
    }
    for (const key of Object.keys(FORWARDED)) {
      const fwd = FORWARDED[key]!;
      console.log(`\n===== 转发 ${fwd.label} =====`);
      try {
        execSync(fwd.command, { cwd: ROOT, stdio: 'inherit' });
      } catch {
        failed.push(key);
      }
    }
  } else if (OWN_PROBES[name]) {
    const probe = OWN_PROBES[name]!();
    printProbe(probe);
    if (probe.errors > 0) failed.push(probe.name);
  } else if (FORWARDED[name]) {
    const fwd = FORWARDED[name]!;
    console.log(`===== 转发 ${fwd.label} =====`);
    try {
      execSync(fwd.command, { cwd: ROOT, stdio: 'inherit' });
    } catch {
      failed.push(name);
    }
  } else {
    console.log(`未知探针：${name}`);
    console.log(`可用：${[...Object.keys(OWN_PROBES), ...Object.keys(FORWARDED), 'all'].join(' | ')}`);
    return 2;
  }

  console.log('\n===== 探针汇总 =====');
  if (failed.length > 0) {
    console.log(`存在 ERROR 的探针：${failed.join(', ')}`);
    return 1;
  }
  console.log('全部通过');
  return 0;
}

process.exit(main());
