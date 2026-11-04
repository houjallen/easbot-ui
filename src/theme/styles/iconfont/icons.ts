/**
 * 图标字体（iconfont）产物定义
 *
 * @description
 * 本模块是图标字体的**唯一声明源**（字体清单 + CSS 生成函数），
 * 供 `scripts/build-icons.ts` 生成 `dist/iconfont.css`。
 *
 * ## 交付形态
 *
 * ```
 * dist/
 * └── iconfont.css          # @font-face + 全部 .icon-xxx:before 的 content 映射
 * ```
 *
 * 消费方 `import '@easbot/ui/iconfont.css'` 即启用图标字体；
 * **不引入**则 `Icon` 的 `type="class"` 模式没有字形（不影响 `name` / `url` 模式）。
 *
 * ## 资源位置（`public/icon/`）
 *
 * | 文件                            | 角色                                       |
 * | ------------------------------- | ------------------------------------------ |
 * | `iconfont.source.css`           | **content 码点映射源**（796 个图标类）      |
 * | `officefont.source.css`         | officefont 家族声明源                      |
 * | `iconfont.woff` / `iconfont.ttf`| 图标字体主格式 + 兜底格式                  |
 * | `symbol.ttf` / `wingding.ttf`    | officefont 的 Symbol / Wingdings 家族      |
 *
 * ⚠️ **字体文件不随 npm 包发布** —— 由消费方自行放置到 `public/icon/`，部署后映射到站点根路径。
 *
 * ## 为什么只保留 woff + ttf
 *
 * 原始资源有 4 个格式（`eot` / `woff` / `ttf` / `svg`）：
 *
 * | 格式   | 体积   | 保留理由                                     |
 * | ------ | ------ | -------------------------------------------- |
 * | woff   | 113 KB | **主格式** —— 覆盖 IE11+ 全部现代浏览器      |
 * | ttf    | 192 KB | **兜底** —— 老 Safari 不支持 woff             |
 * | eot    | 174 KB | 仅 IE8- 需要，现代浏览器**完全不用**         |
 * | svg    | 694 KB | SVG 字体已被 WOFF2 取代，**且体积最大**       |
 *
 * 删掉 `eot` + `svg` 共省 **868 KB**，不损失任何现代浏览器支持。
 */

/**
 * 图标字体的家族名（`@font-face` 的 `font-family`）
 *
 * ⚠️ 消费方通过 `class="iconfont icon-xxx"` 使用 —— `.iconfont` 类负责声明
 * `font-family: iconfont`，**必须**与本常量一致。
 */
export const ICONFONT_FAMILY = 'iconfont';

/**
 * 图标字体文件在**消费方静态资源目录**下的路径前缀
 *
 * @description
 * 约定：消费方把图标字体放到 `public/icon/`（Vite / Next.js 等约定为
 * `public/` 目录，部署后映射到站点根路径），故引用路径为 `/icon/xxx`。
 *
 * ⚠️ **字体文件不随 npm 包发布** —— 由消费方自行放置到 `public/icon/`，部署后映射到站点根路径。
 */
export const ICONFONT_DIR = '/icon';

/**
 * 图标字体文件清单
 *
 * ⚠️ `format` 必须与文件真实格式一致，否则浏览器会下载后丢弃。
 */
export const ICONFONT_FACES = [
  { fileName: 'iconfont.woff', format: 'woff' },
  { fileName: 'iconfont.ttf', format: 'truetype' },
] as const;

/**
 * officefont（Office 文档类型图标）字体文件清单
 *
 * officefont 声明两个独立家族 —— `Wingdings` 与 `Symbol`，
 * 二者都来自 Office 字体集，本组件库仅作**预留**（当前无图标类使用）。
 */
export const OFFICEFONT_FACES = [
  { family: 'Wingdings', fileName: 'wingding.ttf' },
  { family: 'Symbol', fileName: 'symbol.ttf' },
] as const;

export type IconfontFace = (typeof ICONFONT_FACES)[number];
export type OfficefontFace = (typeof OFFICEFONT_FACES)[number];

/**
 * 生成 iconfont.css 的 `@font-face` 段落
 *
 * ⚠️ **必须列出所有格式**（而非只写最优的那个）——
 * 浏览器会按顺序挑选第一个**能解析**的格式，逐个回退。
 */
export function buildIconfontFaces(): string {
  const srcList = ICONFONT_FACES.map((face) => `url('${ICONFONT_DIR}/${face.fileName}') format('${face.format}')`).join(',\n    ');
  return `@font-face {
  font-family: '${ICONFONT_FAMILY}';
  font-style: normal;
  font-weight: normal;
  font-display: block;
  src: ${srcList};
}`;
}

/**
 * 生成 officefont.css 的 `@font-face` 段落
 *
 * ⚠️ officefont 的字体文件与 iconfont 主字体**同目录**（消费方的 `public/icon/`），
 * 但文件名不同（`symbol.ttf` / `wingding.ttf`），不会冲突。
 */
export function buildOfficefontFaces(): string {
  return OFFICEFONT_FACES.map(
    (face) => `@font-face {
  font-family: '${face.family}';
  font-style: normal;
  font-weight: normal;
  font-display: block;
  src: url('${ICONFONT_DIR}/${face.fileName}') format('truetype');
}`,
  ).join('\n\n');
}

/**
 * 读取图标字体的 `content` 映射（类名 → unicode 码点）
 *
 * @param sourceCss 原始 `iconfont.css` 全文
 * @returns 按源码顺序排列的 `[类名, content]` 列表
 */
export function parseIconfontContentMap(sourceCss: string): Array<[string, string]> {
  const result: Array<[string, string]> = [];
  // 匹配形如 `.icon-xxx:before { content: '\e91b'; }` 的规则
  const rulePattern = /\.([\w-]+):before\s*\{\s*content:\s*'([^']*)'\s*;?\s*\}/g;
  let match = rulePattern.exec(sourceCss);
  while (match !== null) {
    // ⚠️ `noUncheckedIndexedAccess` 下捕获组是 `string | undefined`，
    // 但正则的两个捕获组**必然存在**（模式要求二者各匹配一次）。
    const [, className, content] = match;
    if (className !== undefined && content !== undefined) {
      result.push([className, content]);
    }
    match = rulePattern.exec(sourceCss);
  }
  return result;
}

/**
 * 生成图标类的 `content` 映射段落
 *
 * @param contentMap `[类名, content]` 列表
 */
export function buildIconfontContentRules(contentMap: Array<[string, string]>): string {
  return contentMap.map(([className, content]) => `.${className}:before {\n  content: '${content}';\n}`).join('\n\n');
}
