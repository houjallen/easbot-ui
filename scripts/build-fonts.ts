/**
 * 构建字体契约产物 —— 仅生成 `dist/fonts.css`（**不拷贝字体文件**）
 *
 * @description
 * 由 `package.json#build:fonts` 调用，输出：
 *
 * ```
 * dist/
 * └── fonts.css          # 字体栈变量 + 兜底栈（不含 @font-face）
 * ```
 *
 * ## ⚠️ 为什么**不**拷贝字体文件、也**不**声明 `@font-face`
 *
 * 字体二进制（思源黑体 3 个 OTF ≈ 24 MB）**不随 npm 包发布**：
 *
 * 1. **包体积** —— 24 MB 的字体让 npm 包从 1.5 MB 涨到 23.5 MB，
 *    而绝大多数消费方**根本不用**自定义字体（opt-in）；
 * 2. **字重不可保证** —— 字体文件不在包里，本库**无法**保证
 *    「400 / 500 / 700 三个字重都可用」，声明 `@font-face` 反而会误导；
 * 3. **授权** —— SIL OFL 1.1 要求「随字体分发时附带授权声明」，
 *    但**不要求**把字体本体塞进每个 npm 包 —— 消费方自行放置字体文件时，
 *    由**应用层**在自己的分发物里附带授权声明即可。
 *
 * 字体**二进制资源**保留在仓库内（`public/font/`），
 * 供维护者本地构建与自测使用 —— 与消费方的静态资源目录**同名同结构**。
 *
 * > 📌 **CSS 声明源在 `src/`**（`src/theme/fonts/fonts.ts`）——
 * > CSS 是**源码**（要参与构建、产出 `dist/fonts.css`），
 * > 而字体二进制是**静态资源**（要被浏览器按 URL 请求）→ 放 `public/`。
 *
 * ## 消费方如何接入
 *
 * 本库只定义**一个变量名**（`--font-source-han-sans`）+ **字重清单** + **兜底栈**。
 * 应用层把字体栈写进这个变量即可，三种方式任选：
 *
 * - **A. Next.js `next/font/local`** —— `variable: '--font-source-han-sans'`；
 * - **B. 直接用本产物的 `@font-face`** —— 字体放到 `public/font/` 即自动对应；
 * - **C. 完全自定义** —— 覆盖 `--font-sans` 或 `--font-source-han-sans`。
 *
 * 详见 [`spec/css-standard.md`](./spec/css-standard.md) §1.7。
 *
 * ## 幂等性
 *
 * 只写一个 CSS 文件，无目录需要清理。
 */

import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCE_HAN_SANS_FACES, buildFontsCss } from '../src/theme/fonts/fonts';

/** 仓库根目录 */
const root = process.cwd();

/** 字体资源目录（`public/font/`）—— 与消费方的静态资源目录同名同结构 */
const fontSrcDir = join(root, 'public', 'font');

/** 产物输出目录 */
const outDir = join(root, 'dist');

/** 产物 CSS 路径 */
const outCssFile = join(outDir, 'fonts.css');

function main(): void {
  // 1. 校验每个字重对应的字体文件存在（缺失时早失败，避免消费方拿到坏路径）
  for (const face of SOURCE_HAN_SANS_FACES) {
    const src = join(fontSrcDir, face.fileName);
    if (!existsSync(src)) {
      throw new Error(`[build:fonts] 字体文件不存在：${src}（字重 ${face.weight}）`);
    }
  }

  // 2. 生成 fonts.css
  writeFileSync(outCssFile, buildFontsCss(), 'utf8');

  console.log(`[build:fonts] 完成 —— fonts.css（${SOURCE_HAN_SANS_FACES.length} 个字重的 @font-face + 字体栈契约，字体文件不随包发布）→ dist/fonts.css`);
}

main();
