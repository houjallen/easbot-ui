import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import '../src/styles.css';

/**
 * Storybook 全局预览配置
 *
 * 设计要点：
 *
 * 1. **零孤儿 import** —— 原配置 import 了 5 个本仓库不存在的模块
 *    （`@/components/providers/theme-provider` / `@/context/app-context` / `@/store` /
 *    `@/context/query-client`），导致 Storybook 启动即崩。本组件库不依赖任何应用级 Provider。
 *
 * 2. **引入组件样式** —— `../src/styles.css` 是 Tailwind v4 源入口，
 *    由 Vite builder 现场编译（含主题变量与动画工具类）。
 *
 * 3. **主题切换** —— `withThemeByClassName` 在 `<html>` 上切换 `light` / `dark` class，
 *    与 `src/theme-light.css` / `src/theme-dark.css` 的选择器约定一致
 *    （light 用 `:root[data-theme='light']`，dark 用 `:root[data-theme='dark']`）。
 */
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      // 使用 requestAnimationFrame 确保在下一帧更新
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', theme);
      });
      return (
        <div className="p-8">
          <Story />
        </div>
      );
    },
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
