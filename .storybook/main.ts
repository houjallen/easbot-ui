import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

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
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes', '@storybook/addon-links', '@storybook/addon-onboarding'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Docs',
  },
  viteFinal: async (viteConfig) => {
    // 启用 Tailwind v4 编译（见文件头注释第 4 条）
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push(tailwindcss());

    if (viteConfig.resolve) {
      viteConfig.resolve.alias = {
        ...viteConfig.resolve.alias,
        '@': path.resolve(import.meta.dirname, '../src'),
      };
    }
    return viteConfig;
  },
};

export default config;
