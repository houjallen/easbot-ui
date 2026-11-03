/**
 * 字体资源契约
 *
 * @description
 * 本库**不发布字体文件**，只定义**字体接入契约** ——
 * 变量名 + **字重清单**（含每个字重对应的**真实字体文件名**）+ 兜底栈。
 * 字重**取值**由应用层决定，但**字重与文件的对应关系**由本库定义，
 * 保证应用层声明 `@font-face` / `next/font/local` 时不会错配。
 *
 * ## 契约（唯一真值源）
 *
 * | 契约项         | 值                       | 说明                                        |
 * | -------------- | ------------------------ | ------------------------------------------- |
 * | 变量名         | `--font-source-han-sans` | 应用层把字体栈写进这个变量                  |
 * | 组件库消费方式 | `var(--font-source-han-sans, <兜底栈>)` | 兜底值形式，变量缺失时不失效        |
 * | 兜底栈         | 系统字体栈                | 未接入自定义字体时的默认表现                |
 * | 字重清单       | `SOURCE_HAN_SANS_FACES`  | **字重 ↔ 真实字体文件名**的对应表            |
 *
 * ## 字重清单的准确性（实测）
 *
 * 思源黑体各字重的真实 `usWeightClass`（读 OTF 头表 `OS/2` 实测，**非 CSS 关键字近似值**）：
 *
 * | 文件                           | usWeightClass | CSS `font-weight` | 常用档位 |
 * | ------------------------------ | ------------- | ----------------- | -------- |
 * | `SourceHanSansCN-ExtraLight.otf` | 250         | 250               | —        |
 * | `SourceHanSansCN-Light.otf`   | 300           | 300               | `light`  |
 * | `SourceHanSansCN-Normal.otf`  | 350           | 350               | —        |
 * | `SourceHanSansCN-Regular.otf` | 400           | 400               | `normal` |
 * | `SourceHanSansCN-Medium.otf`  | 500           | 500               | —        |
 * | `SourceHanSansCN-Bold.otf`    | 700           | 700               | `bold`   |
 * | `SourceHanSansCN-Heavy.otf`   | 900           | 900               | `black`  |
 *
 * ⚠️ **字重不得套用 CSS 关键字近似值** —— 家族名与字重必须一一对应，
 * 否则浏览器会做「合成加粗」（faux bold），字形发虚。
 *
 * ⚠️ **`Normal` 是 350，`Regular` 才是 400** —— 思源黑体命名反直觉，
 * 配错会让正文偏细。
 *
 * ## 应用层如何接入（三种方式，任选其一）
 *
 * ### 方式 A：Next.js `next/font/local`（推荐）
 *
 * ```ts
 * // app/fonts.ts
 * import localFont from 'next/font/local';
 *
 * export const sourceHanSans = localFont({
 *   src: [
 *     { path: './SourceHanSansCN/SourceHanSansCN-Regular.otf', weight: '400', style: 'normal' },
 *     { path: './SourceHanSansCN/SourceHanSansCN-Medium.otf', weight: '500', style: 'normal' },
 *     { path: './SourceHanSansCN/SourceHanSansCN-Bold.otf', weight: '700', style: 'normal' },
 *   ],
 *   display: 'swap',
 *   variable: '--font-source-han-sans', // ← 与本库的契约变量名一致
 *   preload: true,
 *   fallback: ['system-ui', 'arial'],
 * });
 * ```
 *
 * ```tsx
 * // app/layout.tsx
 * import { sourceHanSans } from './fonts';
 *
 * <html className={sourceHanSans.variable}>…</html>
 * ```
 *
 * ⚠️ **`next/font/local` 的 `weight` 只接受百位档位**（`'100'`…`'900'`）——
 * **不能**写 `'250'` / `'350'` / `'450'`（思源黑体的非百位字重）。
 * 应用层若要用这些中间档位，需改走**方式 B**（手写 `@font-face`）。
 *
 * 📌 **字重按需选用** —— 每个字重是**独立下载**（`font-display: swap`），
 * 全量 7 个约 **57 MB**，绝大多数应用只需 400 / 500 / 700。
 *
 * ### 方式 B：标准 `@font-face` + 静态资源目录
 *
 * 把字体文件放到应用的 `public/font/`，并在应用自己的 CSS 里声明
 * （**路径与 `FONT_DIR` 约定一致**）：
 *
 * ```css
 * @font-face {
 *   font-family: 'Source Han Sans CN';
 *   src: url('/font/SourceHanSansCN-Regular.otf') format('opentype');
 *   font-weight: 400;
 *   font-display: swap;
 * }
 *
 * :root {
 *   --font-source-han-sans: 'Source Han Sans CN', system-ui, sans-serif;
 * }
 * ```
 *
 * ### 方式 C：完全自定义字体
 *
 * 直接覆盖 `--font-source-han-sans`（或 `--font-sans`）为任意字体栈：
 *
 * ```css
 * :root {
 *   --font-sans: 'MyBrandFont', 'Microsoft YaHei', system-ui, sans-serif;
 * }
 * ```
 *
 * ## ⛔ 兜底值形式是硬性要求
 *
 * ```css
 * /* ❌ 断链 —— 变量缺失时整条声明失效（IACVT），连 system-ui 都拿不到
 * --font-sans: var(--font-source-han-sans), system-ui, -apple-system, …;
 *
 * /* ✅ 兜底值形式 —— 变量不存在时用回退栈
 * --font-sans: var(--font-source-han-sans, system-ui, -apple-system, …);
 * ```
 *
 * 本库 `styles.css`（`@layer base`）与 `themes/variables.css`（`@theme`）**两处**
 * 都必须是兜底值形式。
 *
 * @see {@link https://fonts.google.com/noto/specimen/Source+Han+Sans+CN} 授权说明
 */

/**
 * 字体栈 CSS 变量名 —— **本库与消费方之间的唯一契约**
 *
 * @description
 * 应用层把字体栈写进这个变量（无论用 `next/font/local` 还是手写 `@font-face`），
 * 本库的 `--font-sans` 即自动跟随。
 */
export const FONT_SANS_VARIABLE = '--font-source-han-sans';

/**
 * 字体家族名（`@font-face` 的 `font-family`）
 */
export const FONT_FAMILY = 'Source Han Sans CN';

/**
 * 字体文件在**消费方静态资源目录**下的路径前缀
 *
 * @description
 * 约定：消费方把字体文件放到 `public/font/`（Vite / Next.js 等约定为
 * `public/` 目录，部署后映射到站点根路径），故引用路径为 `/font/xxx`。
 *
 * ⚠️ **字体文件不随 npm 包发布** —— 由消费方自行放置到 `public/font/`。
 * 详见 [`spec/css-standard.md`](../../spec/css-standard.md) §1.7。
 */
export const FONT_DIR = '/font';

/**
 * 思源黑体字重清单 —— **字重 ↔ 真实字体文件名**的对应表
 *
 * @description
 * **7 个字重全集**（思源黑体官方字重体系），每个 OTF 约 8 MB。
 *
 * ⚠️ **字重取值来自字体自身的 `OS/2.usWeightClass`**（读 OTF 头表实测），
 * **不是** CSS 关键字近似值 —— 家族名与字重必须一一对应，
 * 否则浏览器会做「合成加粗」（faux bold），字形发虚。
 *
 * | 文件                           | usWeightClass | CSS `font-weight` | 常用档位 |
 * | ------------------------------ | ------------- | ----------------- | -------- |
 * | `SourceHanSansCN-ExtraLight.otf` | 250         | 250               | —        |
 * | `SourceHanSansCN-Light.otf`   | 300           | 300               | `light`  |
 * | `SourceHanSansCN-Normal.otf`  | 350           | 350               | —        |
 * | `SourceHanSansCN-Regular.otf` | 400           | 400               | `normal` |
 * | `SourceHanSansCN-Medium.otf`  | 500           | 500               | —        |
 * | `SourceHanSansCN-Bold.otf`    | 700           | 700               | `bold`   |
 * | `SourceHanSansCN-Heavy.otf`   | 900           | 900               | `black`  |
 *
 * ⚠️ **`Normal` 是 350，`Regular` 才是 400** —— 思源黑体的命名反直觉，
 * 极易配错（`Normal.otf` 当 400 用会让正文偏细）。
 *
 * 📌 **消费方按需选用** —— 每个字重是**独立下载**（`font-display: swap`），
 * 全量加载 7 个字重约 **57 MB**，绝大多数应用只需 400 / 500 / 700 三个。
 *
 * 如需精简，把字体文件放进应用的 `public/font/` 即可 ——
 * 本库的 `@font-face` 指向**约定路径**，多余的字重**不引用**就不会下载。
 */
export const SOURCE_HAN_SANS_FACES = [
  { weight: 250, fileName: 'SourceHanSansCN-ExtraLight.otf' },
  { weight: 300, fileName: 'SourceHanSansCN-Light.otf' },
  { weight: 350, fileName: 'SourceHanSansCN-Normal.otf' },
  { weight: 400, fileName: 'SourceHanSansCN-Regular.otf' },
  { weight: 500, fileName: 'SourceHanSansCN-Medium.otf' },
  { weight: 700, fileName: 'SourceHanSansCN-Bold.otf' },
  { weight: 900, fileName: 'SourceHanSansCN-Heavy.otf' },
] as const;

/** 思源黑体字重类型 */
export type SourceHanSansWeight = (typeof SOURCE_HAN_SANS_FACES)[number]['weight'];

/**
 * 系统兜底字体栈
 *
 * @description
 * 应用层**未**接入自定义字体时使用 —— 覆盖主流桌面 / 移动系统，
 * 并附 emoji 字体避免彩色字符回退成方块。
 */
export const FONT_FALLBACK_STACK = [
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  "'Segoe UI'",
  'Roboto',
  "'Helvetica Neue'",
  'Arial',
  'sans-serif',
  "'Apple Color Emoji'",
  "'Segoe UI Emoji'",
  "'Segoe UI Symbol'",
  "'Noto Color Emoji'",
] as const;

/**
 * 生成字体栈（`--font-source-han-sans` 的值）
 *
 * @param family 自定义字体家族名 —— 留空则只输出兜底栈
 * @returns 字体栈 CSS 值
 */
export function buildFontStack(family?: string): string {
  if (!family) return FONT_FALLBACK_STACK.join(', ');
  return `'${family}', ${FONT_FALLBACK_STACK.join(', ')}`;
}

/**
 * 生成单个字重的 `@font-face` CSS
 *
 * @param face 字重与文件名
 * @returns CSS 声明文本
 */
export function buildFontFace(face: { weight: number; fileName: string }): string {
  return `@font-face {
  font-family: '${FONT_FAMILY}';
  font-style: normal;
  font-weight: ${face.weight};
  font-display: swap;
  src: url('${FONT_DIR}/${face.fileName}') format('opentype');
}`;
}

/**
 * 生成字体契约 CSS（`dist/fonts.css` 的内容）
 *
 * @description
 * 产物结构：
 *
 * ```css
 * @font-face × 3
 * :root {
 *   --font-source-han-sans: 'Source Han Sans CN', <兜底栈>;
 * }
 * ```
 *
 * ⚠️ **字体文件不随包发布** —— 产物的 `@font-face` 指向**约定路径**
 * `/font/xxx`，应用层把字体文件放到 `public/font/` 即自动对应，
 * 无需改本库源码。
 *
 * ⚠️ **不在 `@layer` 内** —— `@font-face` 与 CSS 变量定义需在**未分层**上下文，
 * 否则消费方的 `@layer` 声明顺序可能把它们降级，导致 `@font-face` 不生效。
 *
 * @param family 自定义字体家族名 —— 留空则只输出兜底栈
 * @returns 完整的字体契约 CSS 文本
 */
export function buildFontsCss(family?: string): string {
  const faces = SOURCE_HAN_SANS_FACES.map((face) => buildFontFace(face));

  return [
    '/*',
    ' * 字体契约 —— 由 @easbot/ui 提供，框架无关',
    ' *',
    ' * ⚠️ **字体文件不随本包发布** —— 请自行把字体放到',
    ` *   public/${FONT_DIR.slice(1)}/ 目录（本文件的 @font-face 按该路径引用），`,
    ' *   并保留 SIL OFL 1.1 授权声明（见 font/LICENSE.txt）。',
    ' *',
    ' * 字体文件与字重的对应关系：',
    ...SOURCE_HAN_SANS_FACES.map((face) => ` *   ${face.weight} → ${face.fileName}`),
    ' *',
    ' * 接入方式（任选其一）：',
    ' *   A. Next.js next/font/local —— variable 写 --font-source-han-sans，',
    ' *      src 路径与上面的「字重 → 文件名」对应表一致',
    ' *   B. 直接用本文件的 @font-face（字体放到 public/font/ 即可）',
    ' *   C. 完全自定义 —— 覆盖 --font-sans 或 --font-source-han-sans',
    ' *',
    ` * 兜底栈：${FONT_FALLBACK_STACK.join(', ')}`,
    ' */',
    ...faces,
    ':root {',
    `  ${FONT_SANS_VARIABLE}: ${buildFontStack(family ?? FONT_FAMILY)};`,
    '}',
  ].join('\n\n');
}
