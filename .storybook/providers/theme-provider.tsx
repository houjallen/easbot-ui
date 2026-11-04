/**
 * Storybook 主题 Provider
 *
 * @description
 * **不依赖 `next-themes`** —— 原实现 `import { ThemeProvider as NextThemesProvider } from 'next-themes'`,
 * 但 `next-themes` **从未被安装**（既不在 `dependencies`，也不在 `devDependencies`），
 * 导致 Storybook 构建直接失败：
 *
 * ```
 * "next-themes" is imported by ".storybook/providers/theme-provider.tsx",
 * but could not be resolved – treating it as an external dependency
 * ```
 *
 * 改为复用库内**框架无关**的 `ThemeProvider`
 * （`src/providers/theme-provider.tsx`）——
 * 该实现明确声明"不依赖 `next-themes`"，本组件库同时支持 Next.js 与纯 React 应用，
 * 主题能力必须自实现，不能绑定任何框架运行时。
 *
 * 与 `withThemeByClassName` 的关系（两者共存、职责不同）：
 * - addon 在 `<html>` 上切换 **class**（`class="light"` / `class="dark"`），负责工具栏交互；
 * - 本库主题 CSS 的选择器是 `:root[data-theme='light']` / `:root[data-theme='dark']`
 *   （**属性**选择器），由 `ThemeProvider` 负责写入。
 *
 * 两者同时命中，主题变量才生效。
 */

export { ThemeProvider as default } from '../../src/providers/theme-provider';
