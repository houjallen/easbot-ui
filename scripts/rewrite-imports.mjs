import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';

/**
 * 批量重写 import 路径
 *
 * 用法：node scripts/rewrite-imports.mjs
 */

const SRC = 'src';
const ROOT = process.cwd();

/** 递归收集所有 ts / tsx 文件 */
function collect(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) collect(full, acc);
    else if (/\.tsx?$/.test(entry)) acc.push(full);
  }
  return acc;
}

/** 计算 from 当前文件到目标文件的相对路径（不含扩展名） */
function toRelative(fromFile, targetAbs) {
  const fromDir = dirname(fromFile);
  // 去掉目标文件的扩展名（TS 的 moduleResolution: Bundler 不接受显式 .ts 后缀）
  const withoutExt = targetAbs.replace(/\.(tsx?|jsx?)$/, '');
  let rel = relative(fromDir, withoutExt).split(sep).join('/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

/** 目标别名 → 绝对路径（相对 src） */
const ALIAS_MAP = {
  '@/lib/utils/classnames': 'src/utils/classnames.ts',
  '@/lib/utils/validation-rule': 'src/utils/validation-rule.ts',
  '@/lib/utils': 'src/utils/index.ts',
  '@/hooks': 'src/hooks/index.ts',
  '@/models': 'src/models/index.ts',
  '@/providers': 'src/providers/index.ts',
  '@/utils': 'src/utils/index.ts',
  '@repo/util/utils/UiMessageUtils': 'src/utils/ui-message.ts',
  '@repo/util/utils/clipboard': 'src/utils/clipboard.ts',
  '@repo/util/utils/is': 'src/utils/object.ts',
  '@repo/util/utils': 'src/utils/object.ts',
  '@repo/schema/types/table': 'src/models/table.ts',
  '@repo/schema/types': 'src/models/index.ts',
  '@repo/hooks/use-device': 'src/hooks/use-device.ts',
  '@repo/hooks/use-locale': 'src/hooks/use-locale.ts',
  '@repo/types/axios': 'src/models/axios.ts',
  '@repo/i18n': 'src/utils/locale.ts',
  '@repo/observability/error': 'src/utils/error.ts',
  // 表格模块的 barrel —— 上游用 `@/components/ui` 指代 src/ui/table
  '@/components/ui': 'src/ui/table/index.ts',
};

const files = collect(SRC);
let changed = 0;
const unresolved = new Map();

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  let content = original;

  // 1) 处理 @/components/ui/xxx 与 @repo/design-system/components/ui/xxx
  content = content.replace(
    /from\s+['"](@\/components\/ui\/[^'"]+|@repo\/design-system\/components\/ui\/[^'"]+)['"]/g,
    (_match, spec) => {
      const tail = spec.replace(/^@\/components\/ui\//, '').replace(/^@repo\/design-system\/components\/ui\//, '');
      const target = join(SRC, 'ui', tail);
      return `from '${toRelative(file, target)}'`;
    },
  );

  // 2) 处理 @repo/design-system/lib/utils
  content = content.replace(
    /from\s+['"]@repo\/design-system\/lib\/utils['"]/g,
    () => `from '${toRelative(file, join(SRC, 'design-system', 'lib', 'utils.ts'))}'`,
  );

  // 3) 处理其余别名
  for (const [alias, target] of Object.entries(ALIAS_MAP)) {
    // 跳过第 1/2 步已处理的带路径别名（`@/components/ui/xxx`、`@repo/design-system/...`）
    // 但保留精确别名 `@/components/ui`（表格 barrel）
    if (alias !== '@/components/ui') {
      if (alias.startsWith('@/components/ui/')) continue;
      if (alias.startsWith('@repo/design-system')) continue;
    }
    const pattern = new RegExp(
      `from\\s+['"]${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
      'g',
    );
    if (pattern.test(content)) {
      content = content.replace(
        pattern,
        `from '${toRelative(file, join(ROOT, target))}'`,
      );
    }
  }

  // 4) 记录仍未解析的别名
  const leftovers = content.match(/from\s+['"](@\/[^'"]+|@repo\/[^'"]+)['"]/g);
  if (leftovers) {
    for (const l of leftovers) {
      const alias = l.match(/['"]([^'"]+)['"]/)[1];
      unresolved.set(alias, (unresolved.get(alias) ?? 0) + 1);
    }
  }

  if (content !== original) {
    writeFileSync(file, content, 'utf8');
    changed++;
  }
}

console.log(`已改写 ${changed} / ${files.length} 个文件`);
if (unresolved.size) {
  console.log('\n未解析的别名：');
  for (const [alias, count] of [...unresolved].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count.toString().padStart(4)}  ${alias}`);
  }
}
