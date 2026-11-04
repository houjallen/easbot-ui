import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 解析本地 addon 的绝对路径
 *
 * @description
 * 本地 addon 在 `addons` 里用**相对路径**书写，由本函数包装成绝对路径。
 *
 * ## ⚠️ 为什么**必须**转成绝对路径
 *
 * Storybook 解析 addon 入口时走 `resolveAddonName()`，其内部逻辑是：
 * - **相对路径**（`'./addon/eas-addon-locale'`）→ 交给 Node 的模块解析器，
 *   会当作**包名**去找 → 解析失败 → 该 addon 被**静默跳过**（只打一条 warn）；
 * - **绝对路径** → 直接按目录读取 `package.json` 的 `exports`，
 *   正确解析出 `manager` / `preview` 入口。
 *
 * 实测（Storybook 10.6.5）确认：相对路径返回 `undefined`（解析失败），
 * 绝对路径返回 `{ managerEntries: [...], previewAnnotations: [...] }`。
 *
 * ## ⚠️ 为什么函数名**不能**叫 `getAbsolutePath`
 *
 * `getAbsolutePath` 是 Storybook 的**保留名** —— 它通过**函数名**识别
 * （`getAbsolutePathWrapperName`），一旦命中就会：
 * 1. 把 `addons` 里的**所有**字符串（含 `@storybook/addon-docs` 等包名）
 *    都改写成 `getAbsolutePath('...')` 调用；
 * 2. 其官方实现用 `import.meta.resolve(value + '/package.json')` ——
 *    对**包名**（如 `@storybook/addon-docs`）会解析失败，
 *    导致那些 addon 被**静默跳过**，并触发
 *    「Could not resolve addon ... Is it installed?」的误导性告警；
 * 3. 触发 `storybook add` 的自动改写逻辑，往 `addons` 里**塞进**
 *    `@storybook/addon-vitest`（本项目**明确不装**该 addon，见
 *    `spec/storybook-standard.md` 维度 ⑨）。
 *
 * 故此处用**自定义名字** `resolveLocalAddon`，只服务于本地 addon 这一处。
 *
 * @param value 相对路径（相对于 `.storybook/` 目录）
 * @returns 绝对路径
 */
function resolveLocalAddon(value: string): string {
  return join(dirname(fileURLToPath(import.meta.url)), value);
}

/**
 * Storybook 配置（组件库模式）
 *
 * 设计要点：
 *
 * 1. **builder = @storybook/react-vite** —— 原配置写的是 `@storybook/react` + `webpackFinal`，
 *    但 package.json 从未安装 `@storybook/builder-webpack5`，导致 Storybook 无法启动。
 *    改用 Vite builder（Storybook 10 的默认推荐），内部自带 Vite，无需额外 vite.config.ts。
 *
 * 2. **stories glob 匹配真实布局** —— 原配置指向 `../src/components/ui/**`，
 *    该目录不存在 → 匹配不到任何 story。真实布局是 `src/<component>/<component>.stories.tsx`。
 *
 * 3. **不装 addon-vitest** —— addon-vitest 走浏览器模式（`@vitest/browser` + playwright），
 *    需要下载浏览器二进制，CI 沉重且脆弱。本项目已有独立的 Vitest 单测链路（jsdom），
 *    两者并存属于重复建设。
 *
 * 4. **必须注册 `@tailwindcss/vite` 插件** —— 本项目**没有** `vite.config.ts`，
 *    Storybook 内置的 Vite 也不会自动启用 Tailwind。缺了插件时：
 *    - `src/styles.css` 里的 `@import 'tailwindcss'` 被 Vite 当**普通 CSS** 处理，
 *      展开成 `node_modules/tailwindcss/index.css` 原文；
 *    - 该文件末尾的 `@layer utilities { @tailwind utilities; }` 是 **Tailwind 编译期指令**，
 *      只有 Tailwind 编译器才会展开它 —— Vite 不认识，于是**原样保留**（inert）；
 *    - 结果：**零个原子类被生成**，`border` / `bg-primary` / `rounded-md` 等全部失效，
 *      页面只剩浏览器默认样式（表现为「组件没有边框、没有圆角、样式全丢」）。
 *
 *    注册插件后由 Tailwind 编译器接管，产物与 `pnpm build:css`（CLI）一致。
 *
 * 5. **`staticDirs` 映射 `public/`** —— 字体资源（`public/font/`、`public/icon/`）
 *    由消费方自行放置（**不随 npm 包发布**），本库 CSS 按约定路径 `/font/xxx`
 *    与 `/icon/xxx` 引用它们。Storybook 需把 `public/` 映射到站点根路径，
 *    否则 `iconfont` / `officefont` 两个 story 的图标**全是空白**。
 *    （消费方侧：Vite / Next.js 默认把 `public/` 映射到根路径，无需额外配置。）
 *
 * 6. **保留 `@storybook/addon-themes`** —— 提供工具栏主题选择器，
 *    配合 `preview.tsx` 的 `withThemeByClassName` 使用。
 *    ⚠️ 该 addon 切的是 `<html>` 上的 **class**，而本库主题 CSS 用的是
 *    `:root[data-theme='dark']`（**属性**）—— 两者需同时生效，
 *    故 `preview.tsx` 里额外同步了 `data-theme` 属性。
 *
 * 7. **不注册 `@` 路径别名** —— 项目规范明确要求**禁止** `@/` 别名、
 *    一律用相对路径（见 `AGENTS.md` 规则 11）。原配置注册的 `@` 别名
 *    与该规范冲突，且实际**无任何文件**使用它（story 全部走相对路径），
 *    故直接移除，避免"别名可用"的错觉引导后续代码违规。
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-links',
    '@storybook/addon-onboarding',
    // 本地 addon —— 工具栏中英文切换（详见 `.storybook/addon/eas-addon-locale/`）
    // ⚠️ **必须**用绝对路径（`resolveLocalAddon`）—— 相对路径会被 Storybook
    //    当作**包名**解析而静默跳过该 addon。
    resolveLocalAddon('./addon/eas-addon-locale'),
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Docs',
  },
  // 静态资源目录 —— `public/font/` → `/font/xxx`、`public/icon/` → `/icon/xxx`
  // （与消费方的 `public/` 约定保持一致，使 Storybook 与线上一致）
  staticDirs: ['../public'],
  viteFinal: async (viteConfig) => {
    // 启用 Tailwind v4 编译（见文件头注释第 4 条）
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push(tailwindcss());

    return viteConfig;
  },
};

export default config;
