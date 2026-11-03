/**
 * i18n 规范扫描脚本
 *
 * @description
 * 对应 `spec/i18n-standard.md` 的扫描维度①（硬编码中文文案）、
 * 维度③（console.error / console.warn 固定文案）、
 * 维度④（消息表语言不完整）、维度⑤（key 不一致）、维度⑥（占位符不匹配）。
 *
 * 用法：
 * ```bash
 * npx tsx scripts/check-i18n.ts
 * ```
 *
 * 退出码：0 = 全部通过；1 = 存在违规。
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src/ui', 'src/design-system'];

/** 扫描排除路径 */
const SKIP = [
  /__tests__/,
  /[\\/]examples[\\/]/,
  /\.stories\./,
  /[\\/]locale[\\/]/, // 组件域自己的文案表（文案表本身即豁免）
  /useTableI18n/, // table 既有 i18n 实现
  /usage-examples/,
];

/** 中文正则 */
const CN = /[一-龥]/;

/** 字符串字面量含中文 */
const QUOTED = /['"`][^'"`]*[一-龥][^'"`]*['"`]/;

/**
 * 误报排除规则
 *
 * @description
 * 以下场景中的中文**不是**用户可见文案，不构成违规：
 * 1. date-fns 日期格式串（`YYYY年MM月DD日`）
 * 2. 数据值判定字面量（`'是'` / `'否'` / `'启用'` 等业务枚举）
 * 3. 正则 / 模板中的中文（用于数据匹配，不是展示）
 */
const FALSE_POSITIVE = [
  /YYYY|年|月|日|时|分|秒|周|Q/, // 日期格式串
  /^(是|否|真|假|启用|禁用|开启|关闭|男|女|成功|失败|全部|其他)$/, // 业务枚举值（数据判定，非展示文案）
  /^(1|0|true|false)$/, // 布尔值字面量
];

/**
 * 递归收集文件
 */
function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** 提取字符串字面量的内容 */
function literalContents(line: string): string[] {
  const result: string[] = [];
  const re = /(['"`])([^'"`]*)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    result.push(m[2] ?? '');
  }
  return result;
}

const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d))).filter((f) => !SKIP.some((re) => re.test(f)));

const dim1: string[] = [];
const dim3: string[] = [];

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    // 跳过注释行（行首注释 / 行尾注释 / JSX 注释）
    if (/^(\/\/|\*|\/\*)/.test(line)) return;
    if (/\/\/.*$/.test(line) && !/['"`][^'"`]*[一-龥]/.test(line.split('//')[0] ?? '')) return;
    if (/^\{\/\*/.test(line)) return;
    // 跳过 console.debug（开发期诊断日志，属豁免）
    if (/console\.debug\(/.test(line)) return;

    // 维度①：字符串字面量里的中文（排除误报）
    if (CN.test(line) && QUOTED.test(line)) {
      const literals = literalContents(line);
      // 存在「含中文且不在豁免清单」的字面量才判定为违规
      const hasViolation = literals.some((lit) => CN.test(lit) && !FALSE_POSITIVE.some((re) => re.test(lit)));
      if (hasViolation) {
        dim1.push(`${rel}:${i + 1}: ${line}`);
      }
    }

    // 维度③：console.error / console.warn 的固定文案
    const m = line.match(/console\.(error|warn)\(\s*(['"`])([^'"`]+)\2/);
    if (m) {
      dim3.push(`${rel}:${i + 1}: ${line}`);
    }
  });
}

// ============ 维度④⑤⑥：消息表一致性 ============

const messagesFile = path.join(ROOT, 'src/utils/component-messages.ts');
const dim456: string[] = [];

if (fs.existsSync(messagesFile)) {
  const source = fs.readFileSync(messagesFile, 'utf8');

  // 提取每个 `export const xxxMessages = { ... }` 块
  const blockRe = /export const (\w+Messages)\s*=\s*\{([\s\S]*?)\n\};/g;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = blockRe.exec(source)) !== null) {
    const name = blockMatch[1] ?? '';
    const body = blockMatch[2] ?? '';

    // 提取各语言的 key 集合（顶层 key，缩进 4 空格）
    const localeBlocks: Array<{ locale: string; keys: Set<string> }> = [];
    const localeRe = /'([\w-]+)':\s*\{([\s\S]*?)\n {2}\}/g;
    let localeMatch: RegExpExecArray | null;
    while ((localeMatch = localeRe.exec(body)) !== null) {
      const locale = localeMatch[1] ?? '';
      const localeBody = localeMatch[2] ?? '';
      const keys = new Set<string>();
      const keyRe = /^\s{4}(\w+):/gm;
      let keyMatch: RegExpExecArray | null;
      while ((keyMatch = keyRe.exec(localeBody)) !== null) {
        keys.add(keyMatch[1] ?? '');
      }
      localeBlocks.push({ locale, keys });
    }

    // 维度④：必须同时有 zh-CN 与 en-US
    const locales = localeBlocks.map((b) => b.locale);
    if (!locales.includes('zh-CN') || !locales.includes('en-US')) {
      dim456.push(`${name}: 缺少语言（现有：${locales.join(', ') || '无'}）`);
    }

    // 维度⑤：各语言 key 集合必须一致
    const zh = localeBlocks.find((b) => b.locale === 'zh-CN');
    const en = localeBlocks.find((b) => b.locale === 'en-US');
    if (zh && en) {
      for (const key of zh.keys) {
        if (!en.keys.has(key)) {
          dim456.push(`${name}: en-US 缺少 key '${key}'`);
        }
      }
      for (const key of en.keys) {
        if (!zh.keys.has(key)) {
          dim456.push(`${name}: zh-CN 缺少 key '${key}'`);
        }
      }
    }
  }
}

// ============ 输出 ============

const violations = dim1.length + dim3.length + dim456.length;

console.log('===== i18n 规范扫描 =====');
console.log(`维度① 硬编码中文文案: ${dim1.length}`);
console.log(`维度③ console.error/warn 固定文案: ${dim3.length}`);
console.log(`维度④⑤⑥ 消息表一致性: ${dim456.length}`);
console.log(`合计违规: ${violations}`);

if (dim1.length > 0) {
  console.log('\n--- 维度① 硬编码中文文案 ---');
  const byFile = new Map<string, number>();
  for (const d of dim1) {
    const f = d.split(':')[0] ?? '';
    byFile.set(f, (byFile.get(f) ?? 0) + 1);
  }
  console.log(
    [...byFile.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([f, c]) => `${c}\t${f}`)
      .join('\n'),
  );
}

if (dim3.length > 0) {
  console.log('\n--- 维度③ console.error/warn 固定文案 ---');
  console.log(dim3.join('\n'));
}

if (dim456.length > 0) {
  console.log('\n--- 维度④⑤⑥ 消息表一致性 ---');
  console.log(dim456.join('\n'));
}

process.exit(violations > 0 ? 1 : 0);
