/**
 * 规范扫描脚本（统一入口）
 *
 * @description
 * 覆盖以下规范文档中**可自动判定**的扫描维度：
 *
 * - [`a11y-interaction-standard.md`](../a11y-interaction-standard.md)
 *   维度 ② ③ ④ ⑤ ⑥ ⑧ ⑩ ⑪ ⑫
 * - [`component-api-standard.md`](../component-api-standard.md)
 *   维度 ① ② ③ ④ ⑤ ⑦ ⑧ ⑩
 * - [`react-performance-standard.md`](../react-performance-standard.md)
 *   维度 ① ② ③ ⑨
 * - [`css-standard.md`](../css-standard.md)
 *   维度 ⑮ ⑯ ⑰
 *
 * 用法（必须在仓库根目录执行）：
 * ```bash
 * pnpm check:spec          # 或 npx tsx spec/scripts/check-spec.ts
 * ```
 *
 * 退出码：0 = 无 ERROR；1 = 存在 ERROR。
 *
 * ## ERROR / WARN 的区别
 *
 * - **ERROR** —— 可**确定性**判定的违规（正则即可确认），必须修。
 * - **WARN** —— **启发式**判定或**存量豁免**，需人工确认；不阻塞提交。
 *
 * ⚠️ **存量豁免机制** —— `EXEMPTIONS` 登记了各规范 §M+2 的豁免对象。
 * 豁免对象仍会被**列出**（便于「改动即补」时定位），但**不计入 ERROR**。
 * 豁免清单清空后，对应条目即自动升级为 ERROR。
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();

/** 扫描目录 */
const SCAN_DIRS = ['src/ui', 'src/design-system'];

/** 扫描排除路径 */
const SKIP = [/__tests__/, /[\\/]examples[\\/]/, /\.stories\./, /\.test\.tsx?$/];

/**
 * 存量豁免清单
 *
 * @description
 * 键为相对路径（正斜杠），值为豁免原因。
 * 登记来源见各规范文档的 §M+2 豁免清单。
 */
/**
 * 存量豁免清单（值为理由数组 —— 同一文件可能命中多条豁免）
 *
 * @description
 * 键为相对路径（正斜杠），值为豁免理由列表（按豁免编号 H1~H7 / G-* 分条）。
 * 登记来源见各规范文档的 §M+2 豁免清单。
 */
const EXEMPTIONS: Record<string, string[]> = {
  // ── a11y H3：focus-visible:ring 未配 ring-offset（21 个文件） ──
  'src/design-system/components/ui/accordion.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset', 'a11y H6 · 存量 transition-all'],
  'src/design-system/components/ui/badge.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/button.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset', 'a11y H6 · 存量 transition-all'],
  'src/design-system/components/ui/checkbox.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/input.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/navigation-menu.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset', 'a11y H6 · 存量 transition-all'],
  'src/design-system/components/ui/radio-group.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/resizable.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/scroll-area.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/select.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/sidebar.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset', 'a11y H6 · 存量 transition-all'],
  'src/design-system/components/ui/slider.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/switch.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset', 'a11y H6 · 存量 transition-all'],
  'src/design-system/components/ui/tabs.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/textarea.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/design-system/components/ui/toggle.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/ui/button/close-button.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/ui/combobox/combobox.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/ui/radio-group/radio-group.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/ui/scroll-area/scroll-area.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],
  'src/ui/switch/switch.tsx': ['a11y H3 · 存量 focus-visible:ring 无 offset'],

  // ── a11y H5：outline-none 无 focus-visible 替代（2 个文件） ──
  'src/design-system/components/ui/input-otp.tsx': ['a11y H5 · Radix 内部实现，存量豁免', 'a11y H6 · 存量 transition-all'],
  'src/design-system/components/ui/menubar.tsx': ['a11y H5 · Radix roving tabindex 管理焦点'],

  // ── a11y H6：transition-all（12 处；与 H3/H5 重叠的已并入上方数组） ──
  'src/design-system/components/ui/progress.tsx': ['a11y H6 · 存量 transition-all'],
  'src/ui/button/button.tsx': ['a11y H6 · 存量 transition-all'],
  'src/ui/toast/toast.tsx': ['a11y H6 · 存量 transition-all'],
  'src/ui/table/atoms/TableColumnResizer.tsx': ['a11y H6 · 存量 transition-all'],
  'src/ui/table/atoms/TableCard.tsx': ['a11y H6 · 存量 transition-all', 'api H2 · 存量 show* 布尔'],
  'src/ui/table/atoms/TableRow.tsx': ['a11y H6 · 存量 transition-all'],

  // ── api H1 / H2：show* 前缀布尔（表格配置契约 + 存量） ──
  'src/ui/table/types/base.ts': ['api H2 · 表格配置契约层，受控例外'],
  'src/ui/table/types/components.ts': ['api H2 · 表格配置契约层，受控例外'],
  'src/ui/table/atoms/TableFixedColumn.tsx': ['api H2 · 存量 show* 布尔', 'api H4 · 刻意单子节点约束'],
  'src/ui/table/utils/field-generator.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/components/EditRowModal.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/components/EditModal.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/components/EditForm.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/atoms/RowActionCell.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/atoms/ColumnHeaderActionCell.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/atoms/TableRowExpandButton.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/ColumnManagerPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/AddPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/BatchDeletePlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/ImportPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/RefreshPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/row/DeleteRowPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/row/MoveRowPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/row/ViewRowPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/plugins/row/EditRowPlugin.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/utils/date-renderer.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/file/types.ts': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/embedded-date-picker.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/enhanced-date-picker.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/view/types.ts': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/input-time.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/input-time-range.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/input-date-time.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/input-date-time-range.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/input-date.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/date-picker.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/date/validation.ts': ['api H2 · 存量 show* 布尔'],
  'src/ui/alert/alert.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/alert-dialog/alert-dialog.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/alert-dialog/alert-dialog-modal.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/avatar/avatar.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/badge/badge.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/tree/tree.tsx': ['api H2 · 存量 show* 布尔'],
  'src/ui/table/hooks/useTablePagination.ts': ['api H2 · 存量 show* 布尔'],

  // ── api G-P2：barrel 运行时循环导入（2 处） ──
  'src/ui/table/atoms/TableCardContainer.tsx': ['api G-P2 · barrel 运行时循环，待修'],
  'src/ui/table/atoms/CellValue.tsx': ['api G-P2 · barrel 运行时循环，待修'],

  // ── react H3：recharts 命名空间导入（1 处） ──
  'src/design-system/components/ui/chart.tsx': ['react H3 · recharts 命名空间豁免'],
};

/** 违规级别 */
type Level = 'ERROR' | 'WARN';

/** 单条违规记录 */
interface Violation {
  /** 所属维度（显示用） */
  dimension: string;
  /** 违规级别 */
  level: Level;
  /** 相对路径 */
  file: string;
  /** 行号（1 起） */
  line: number;
  /** 违规描述 */
  message: string;
}

/** 收集结果 */
const violations: Violation[] = [];

/**
 * 记录一条违规
 *
 * @param dimension 维度标识
 * @param level 级别
 * @param file 相对路径
 * @param line 行号
 * @param message 描述
 */
function report(dimension: string, level: Level, file: string, line: number, message: string): void {
  violations.push({ dimension, level, file, line, message });
}

/**
 * 判断某文件是否在豁免清单中
 *
 * @param file 相对路径
 * @returns 豁免理由（多条以「；」拼接）；未豁免则返回 null
 */
function exemptionOf(file: string): string | null {
  const reasons = EXEMPTIONS[file];
  return reasons && reasons.length > 0 ? reasons.join('；') : null;
}

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

/** 扫描到的源文件（含相对路径与内容） */
const sources = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)))
  .filter((f) => !SKIP.some((re) => re.test(f)))
  .map((f) => {
    const content = fs.readFileSync(f, 'utf8');
    return {
      /** 相对路径（正斜杠） */
      rel: path.relative(ROOT, f).split(path.sep).join('/'),
      /** 文件内容 */
      content,
      /** 逐行内容 */
      lines: content.split(/\r?\n/),
    };
  });

// ═══════════════════════════════════════════════════════════════════════════
// a11y-interaction-standard
// ═══════════════════════════════════════════════════════════════════════════

/** 维度②：outline-none 无 focus-visible 替代 */
for (const src of sources) {
  const hasBare = /(?<!focus-visible:)outline-none/.test(src.content) || /focus:outline-none/.test(src.content);
  const hasReplacement = /focus-visible:(outline|ring)/.test(src.content);
  if (hasBare && !hasReplacement) {
    const line = src.lines.findIndex((l) => /outline-none/.test(l)) + 1;
    report('a11y ②', 'ERROR', src.rel, line, 'outline-none 无 focus-visible 替代（违反 WCAG 2.4.7）');
  }
}

/**
 * 维度③：禁止用 focus: 表达焦点
 *
 * @description
 * 三种形态分别判定：
 *
 * 1. `focus:outline-none` / `focus:outline-hidden` + **同行有** `focus-visible:*`
 *    → ✅ 合规（有意设计：避免鼠标点击后焦点圈常驻，见 a11y H1）
 * 2. `focus:bg-*` → ⚠️ **WARN** —— 多为「网格 / 菜单项的键盘导航选中高亮」
 *    （Radix 惯例），需人工确认是否属于独立触发器
 * 3. `focus:ring-*` / `focus:border-*` → ❌ **ERROR** —— 焦点环在鼠标点击后常驻
 */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*') || raw.trimStart().startsWith('//')) return;
    if (!/focus:(ring|border|outline|bg-)/.test(raw)) return;

    // 形态 1：焦点框移除 + 同行的 focus-visible 替代 → 合规
    if (/focus:outline-(none|hidden)/.test(raw) && /focus-visible:/.test(raw)) return;

    if (/focus:(ring|border)-/.test(raw)) {
      // 形态 3：区分「焦点指示」与「状态取色覆盖」
      //
      // - `focus:ring-[var(--xxx)]` / `focus:border-[var(--xxx)]`
      //   → **状态取色覆盖**（错误 / 成功态的焦点**颜色**），
      //     焦点**指示本身**由基类的 `focus-visible:ring-[3px]` 负责。
      //     这是合法模式（见 a11y §3.1 的取色覆盖说明）→ 不判违规。
      // - `focus:ring-2` / `focus:ring-[3px]` / `focus:border-2`（**宽度**）
      //   → **焦点指示本身** → 鼠标点击后常驻 → 违规。
      const isColorOverride = /focus:(ring|border)-\[var\(--/.test(raw);
      if (isColorOverride) return;

      report('a11y ③', 'ERROR', src.rel, i + 1, '用 focus:ring/border 表达焦点指示（鼠标点击后焦点环常驻）');
      return;
    }

    // 形态 2：focus:bg-* —— 键盘导航选中高亮（Radix 惯例）
    report('a11y ③', 'WARN', src.rel, i + 1, '用 focus:bg-* 表达高亮（需确认是菜单项 / 网格选中态，而非独立触发器）');
  });
}

/** 维度④：focus-visible:ring 必须配 ring-offset */
for (const src of sources) {
  if (/focus-visible:ring/.test(src.content) && !/focus-visible:ring-offset/.test(src.content)) {
    const line = src.lines.findIndex((l) => /focus-visible:ring/.test(l)) + 1;
    report('a11y ④', 'ERROR', src.rel, line, 'focus-visible:ring 未配 ring-offset（视觉等同描边）');
  }
}

/** 维度⑤ / css ⑮：禁止 transition-all */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*') || raw.trimStart().startsWith('//')) return;
    if (raw.includes('transition-all')) {
      report('a11y ⑤ / css ⑮', 'ERROR', src.rel, i + 1, 'transition-all 必须收窄为具体属性');
    }
  });
}

/** 维度⑥：动效必须有 reduced-motion 降级（styles.css 侧） */
const stylesPath = path.join(ROOT, 'src/theme/styles.css');
if (fs.existsSync(stylesPath)) {
  const styles = fs.readFileSync(stylesPath, 'utf8');
  if (!/prefers-reduced-motion/.test(styles)) {
    report('a11y ⑥ / css ⑯', 'ERROR', 'src/theme/styles.css', 1, '唯一编译入口缺 prefers-reduced-motion 兜底');
  }
}

/** 维度⑧：禁止正数 tabIndex */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (/tabIndex=\{[1-9]/.test(raw)) {
      report('a11y ⑧', 'ERROR', src.rel, i + 1, '正数 tabIndex 会打乱 Tab 顺序');
    }
  });
}

/** 维度⑩：禁止 ... 三点省略号（文案表） */
const messagesPath = path.join(ROOT, 'src/utils/component-messages.ts');
if (fs.existsSync(messagesPath)) {
  fs.readFileSync(messagesPath, 'utf8')
    .split(/\r?\n/)
    .forEach((raw, i) => {
      const m = raw.match(/'([^']*\.\.\.[^']*)'/);
      // 排除日期格式串（YYYY-MM-DD HH:mm:ss 不是省略号）
      if (m && !/\d{4}-\d{2}-\d{2}/.test(m[1] ?? '')) {
        report('a11y ⑩ / i18n ⑨', 'ERROR', 'src/utils/component-messages.ts', i + 1, '省略号必须用 … 而非 ...');
      }
    });
}

/** 维度⑪：禁止 aria-label 硬编码文案 */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*') || raw.trimStart().startsWith('//')) return;
    const m = raw.match(/aria-label=['"]([^'"]{2,})['"]/);
    if (m) {
      report('a11y ⑪ / i18n ⑩', 'ERROR', src.rel, i + 1, `aria-label 硬编码文案："${m[1]}"（必须走 useComponentMessage）`);
    }
  });
}

/** 维度⑫：禁止 user-scalable=no / maximum-scale */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (/user-scalable|maximum-scale|minimum-scale/.test(raw)) {
      report('a11y ⑫', 'ERROR', src.rel, i + 1, '禁止禁用用户缩放');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// component-api-standard
// ═══════════════════════════════════════════════════════════════════════════

/** 维度①：单组件布尔 prop 数量超阈值（> 5） */
for (const src of sources) {
  // 表格配置契约层不受此维度约束（§1.4 受控例外）
  if (src.rel.includes('/table/') || src.rel.endsWith('/types.ts')) continue;
  const matches = src.content.match(/^\s{2}(is|has|can|enable|show|hide|with|allow)[A-Z]\w*\??:\s*boolean/gm);
  if (matches && matches.length > 5) {
    report('api ①', 'WARN', src.rel, 1, `布尔 prop ${matches.length} 个（阈值 5，建议收敛为 variant 或配置对象）`);
  }
}

/** 维度②：禁止 show* / hide* 布尔前缀（新增代码） */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*') || raw.trimStart().startsWith('//')) return;
    if (/^\s{2}(show|hide|with|allow)[A-Z]\w*\??:\s*boolean/.test(raw)) {
      report('api ②', 'ERROR', src.rel, i + 1, '新增代码禁止 show*/hide*/with*/allow* 布尔前缀');
    }
  });
}

/** 维度③：禁止互斥布尔并存 */
for (const src of sources) {
  const hasShow = /\bshow(Label|Icon|Separator|Confirm|Cancel)\b/.test(src.content);
  const hasHide = /\bhide(Label|Icon|Separator|Confirm|Cancel)\b/.test(src.content);
  if (hasShow && hasHide) {
    report('api ③', 'ERROR', src.rel, 1, '互斥布尔并存（showXxx 与 hideXxx 同时存在）');
  }
}

/** 维度④：受控 / 非受控必须配对 */
for (const src of sources) {
  const hasControlled = /^\s{2}(value|open|checked)\??:/m.test(src.content);
  const hasDefault = /^\s{2}default(Value|Open|Checked)\??:/m.test(src.content);
  if (hasControlled && !hasDefault) {
    report('api ④', 'WARN', src.rel, 1, '有受控 prop 但无对应 defaultXxx');
  }
}

/** 维度⑤：renderXxx 不得与 children 争同一位置 */
for (const src of sources) {
  if (/render[A-Z]\w*\??:/.test(src.content) && /children\??:/.test(src.content)) {
    report('api ⑤', 'WARN', src.rel, 1, 'renderXxx 与 children 可能争同一位置（需人工确认）');
  }
}

/** 维度⑦：禁止 barrel 运行时循环导入 */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*')) return;
    // import type 不产生运行时循环 —— 豁免
    if (raw.includes('import type')) return;
    if (/^import\s*\{[^}]*\}\s*from\s*'(\.\.\/)*(index|\.)'/.test(raw)) {
      report('api ⑦ / arch ⑬', 'ERROR', src.rel, i + 1, '从目录 barrel 的运行时导入（循环依赖）');
    }
  });
}

/** 维度⑧：禁止 Children.only（asChild 分支风险） */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (/React\.Children\.only|\bChildren\.only/.test(raw)) {
      report('api ⑧', 'ERROR', src.rel, i + 1, 'Children.only 在多兄弟节点时抛错');
    }
  });
}

/** 维度⑩：禁止 renderXxx 做结构组合（非表格） */
for (const src of sources) {
  if (src.rel.includes('/table/')) continue;
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*')) return;
    if (/^\s{2}render[A-Z]\w*\??:/.test(raw)) {
      report('api ⑩', 'ERROR', src.rel, i + 1, 'renderXxx 仅限「数据项渲染」，不可用于结构组合');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// react-performance-standard
// ═══════════════════════════════════════════════════════════════════════════

/** 维度①：禁止在组件内部定义组件 */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    // 缩进 2 空格 + 大写开头 + 箭头函数或 function 声明
    if (/^\s{2}(const|function)\s+[A-Z]\w*\s*=/.test(raw) || /^\s{2}function\s+[A-Z]\w*\s*\(/.test(raw)) {
      report('react ①', 'WARN', src.rel, i + 1, '疑似在组件内部定义组件（每次渲染新类型 → 子树重挂载）');
    }
  });
}

/** 维度②：禁止渲染期 DOM 测量 */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*')) return;
    if (/getBoundingClientRect\(\)|offsetHeight|offsetWidth/.test(raw)) {
      report('react ②', 'WARN', src.rel, i + 1, 'DOM 测量调用点（需确认在 effect / 事件处理器内，而非渲染期）');
    }
  });
}

/** 维度③：禁止第三方库命名空间导入 */
for (const src of sources) {
  src.lines.forEach((raw, i) => {
    if (raw.trimStart().startsWith('*')) return;
    const m = raw.match(/import\s+\*\s+as\s+\w+\s+from\s+'([^']+)'/);
    if (!m) return;
    const pkg = m[1] ?? '';
    // react / @radix-ui 是 peer external 且官方推荐命名空间用法 —— 豁免
    if (pkg === 'react' || pkg.startsWith('@radix-ui/')) return;
    report('react ③', 'ERROR', src.rel, i + 1, `第三方库命名空间导入：${pkg}（丢失 tree-shaking）`);
  });
}

/** 维度⑨：Context 值必须按变化频率分层 */
for (const src of sources) {
  const m = src.content.match(/createContext<([^>]+)>\(/);
  if (!m) continue;
  const typeName = (m[1] ?? '').trim();
  // 扁平大对象（无 state/actions/config 分层）—— 启发式
  if (!/state|actions|config|value/i.test(typeName) && /Props|Value/.test(typeName)) {
    report('react ⑨', 'WARN', src.rel, 1, `Context 值类型「${typeName}」未见 state/actions/config 分层（需人工确认）`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 豁免判定 + 输出
// ═══════════════════════════════════════════════════════════════════════════

/** 应用豁免：豁免对象的违规降级为 WARN */
for (const v of violations) {
  const reason = exemptionOf(v.file);
  if (reason && v.level === 'ERROR') {
    v.level = 'WARN';
    v.message = `[豁免] ${v.message} —— ${reason}`;
  }
}

/** 按维度分组 */
const groups = new Map<string, Violation[]>();
for (const v of violations) {
  const list = groups.get(v.dimension) ?? [];
  list.push(v);
  groups.set(v.dimension, list);
}

const errors = violations.filter((v) => v.level === 'ERROR');
const warns = violations.filter((v) => v.level === 'WARN');

console.log('===== 规范扫描 =====');
console.log(`ERROR: ${errors.length}`);
console.log(`WARN:  ${warns.length}（含存量豁免与启发式候选，需人工确认）`);

if (violations.length > 0) {
  console.log('\n--- 明细 ---');
  for (const [dimension, list] of [...groups.entries()].sort()) {
    const dimErrors = list.filter((v) => v.level === 'ERROR').length;
    console.log(`\n[${dimension}] ${list.length} 项（ERROR ${dimErrors}）`);
    for (const v of list) {
      console.log(`  ${v.level === 'ERROR' ? '✗' : '·'} ${v.file}:${v.line} - ${v.message}`);
    }
  }
}

console.log('\n--- 维度汇总 ---');
for (const [dimension, list] of [...groups.entries()].sort()) {
  const dimErrors = list.filter((v) => v.level === 'ERROR').length;
  console.log(`${dimension}: ${list.length}（ERROR ${dimErrors}）`);
}

process.exit(errors.length > 0 ? 1 : 0);
