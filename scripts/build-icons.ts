/**
 * 构建图标字体产物 —— 仅生成 `dist/iconfont.css`（**不拷贝字体文件**）
 *
 * @description
 * 由 `package.json#build:icons` 调用，输出：
 *
 * ```
 * dist/
 * └── iconfont.css        # @font-face + 全部 .icon-xxx:before 的 content 映射
 * ```
 *
 * 消费方 `import '@easbot/ui/iconfont.css'` 即启用图标字体；
 * **不引入**则 `Icon` 的 `type="class"` 模式没有字形（`name` / `url` 模式不受影响）。
 *
 * ## ⚠️ 为什么**不**拷贝字体文件
 *
 * 与 `build-fonts.ts` 同理 —— 字体二进制**不随 npm 包发布**：
 *
 * 1. **包体积** —— 图标字体 4 个文件 ≈ 0.44 MB，加上正文体 ≈ 24.5 MB；
 * 2. **绝大多数消费方不用** —— iconfont 是 opt-in，字体本体应**按需取用**；
 * 3. **版本独立** —— 字体文件很少变，单独分发（CDN / 静态资源目录）比
 *    塞进每次发布的 npm tarball 更经济。
 *
 * 图标字体**二进制资源**保留在仓库内（`public/icon/`），
 * 供维护者本地构建与自测使用 —— 与消费方的静态资源目录**同名同结构**。
 *
 * > 📌 **CSS 声明源在 `src/`**（`src/theme/styles/iconfont/`）——
 * > CSS 是**源码**（要参与构建、产出 `dist/iconfont.css`），
 * > 而字体二进制是**静态资源**（要被浏览器按 URL 请求）→ 放 `public/`。
 *
 * ## 消费方如何拿到字体文件
 *
 * 消费方**自行**把字体文件放到静态资源目录，并**覆盖**本库 CSS 里的 `url()`：
 *
 * ```css
 * /* 消费方自己的 CSS：覆盖 @font-face 的 src
 * @font-face {
 *   font-family: 'iconfont';
 *   src: url('/icon/iconfont.woff') format('woff');
 *   font-weight: normal;
 *   font-display: block;
 * }
 * ```
 *
 * 或直接用消费方自己的图标方案（Font Awesome / lucide 等），**不引入**本库的
 * `iconfont.css` 即可 —— `.icon-xxx` 的 `content` 映射也随之失效。
 *
 * ## 为什么要重写 CSS 而不是直接复制
 *
 * 原始 `public/icon/iconfont.source.css` 的字体路径是**相对当前文件**的
 * （`url(iconfont.eot)`）。产物里 CSS 位于 `dist/iconfont.css`、
 * 字体若放在消费方静态资源目录则层级完全不同 → 路径直接断链。
 *
 * 故本脚本**重新生成** CSS，把路径改为**约定的占位路径**（`/icon/xxx`），
 * 并同步：
 *
 * 1. 删掉 `eot` / `svg` 两个冗余格式（省 868 KB）；
 * 2. 补 `font-display: block`（避免字形闪烁）；
 * 3. 补 officefont 的 `font-display` 与 `format` 声明。
 *
 * ## 幂等性
 *
 * 只写一个 CSS 文件，无目录需要清理。
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ICONFONT_DIR, ICONFONT_FACES, OFFICEFONT_FACES, buildIconfontContentRules, buildIconfontFaces, buildOfficefontFaces, parseIconfontContentMap } from '../src/theme/styles/iconfont/icons';

/** 仓库根目录 */
const root = process.cwd();

/**
 * 图标字体**二进制资源**目录（`public/icon/`）
 *
 * ⚠️ 与消费方的静态资源目录**同名同结构** —— 产物的 `@font-face`
 * 按约定路径 `/icon/xxx` 引用它们。
 */
const iconFontDir = join(root, 'public', 'icon');

/** 图标字体**CSS 声明源**目录（`src/`）—— 参与构建，不进 `public/` */
const iconCssDir = join(root, 'src', 'theme', 'styles', 'iconfont');

/** 产物输出目录 */
const outDir = join(root, 'dist');

/** 产物 CSS 路径 */
const outCssFile = join(outDir, 'iconfont.css');

function main(): void {
  if (!existsSync(iconFontDir)) {
    throw new Error(`[build:icons] 图标字体资源目录不存在：${iconFontDir}`);
  }

  // 1. 读取原始 CSS（content 码点映射源），解析出「类名 → content」映射
  const sourceCssFile = join(iconCssDir, 'iconfont.css');
  if (!existsSync(sourceCssFile)) {
    throw new Error(`[build:icons] 图标字体源 CSS 不存在：${sourceCssFile}`);
  }
  const sourceCss = readFileSync(sourceCssFile, 'utf8');
  const contentMap = parseIconfontContentMap(sourceCss);
  if (contentMap.length === 0) {
    throw new Error(`[build:icons] 未从 ${sourceCssFile} 解析到任何图标类（content 映射为空）`);
  }

  // 2. 生成 iconfont.css
  const css = [
    '/*',
    ' * 图标字体（iconfont）—— 由 @easbot/ui 提供，框架无关',
    ' *',
    ' * 引入本文件即启用图标字体；不引入则 Icon 的 type="class" 模式没有字形。',
    ' *',
    ' * ⚠️ **字体文件不随本包发布** —— 请自行把字体放到静态资源目录，',
    ` *   并覆盖下面的 url()（默认约定路径为 ${ICONFONT_DIR}/ 目录）。`,
    ' */',
    '',
    buildIconfontFaces(),
    '',
    `/* 承载字形的类 —— 用法：<i class="iconfont icon-xxx" /> */`,
    '.iconfont {',
    `  font-family: '${'iconfont'}' !important;`,
    '  font-size: 16px;',
    '  font-style: normal;',
    '  -webkit-font-smoothing: antialiased;',
    '  -moz-osx-font-smoothing: grayscale;',
    '}',
    '',
    buildIconfontContentRules(contentMap),
    '',
    '/* ============================================================================',
    ' * officefont —— Office 文档类型图标（预留，当前无图标类使用）',
    ' * ========================================================================== */',
    '',
    buildOfficefontFaces(),
    '',
  ].join('\n');
  writeFileSync(outCssFile, css, 'utf8');

  // 3. 校验字体二进制存在（缺失时早失败，避免消费方拿到坏路径）
  for (const face of ICONFONT_FACES) {
    const src = join(iconFontDir, face.fileName);
    if (!existsSync(src)) {
      throw new Error(`[build:icons] 图标字体文件不存在：${src}`);
    }
  }
  for (const face of OFFICEFONT_FACES) {
    const src = join(iconFontDir, face.fileName);
    if (!existsSync(src)) {
      throw new Error(`[build:icons] officefont 字体文件不存在：${src}`);
    }
  }

  console.log(`[build:icons] 完成 —— iconfont.css（${contentMap.length} 个图标类，字体文件不随包发布）→ dist/iconfont.css`);
}

main();
