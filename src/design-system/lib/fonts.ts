/**
 * 字体类名
 *
 * @description
 * **不依赖 `geist/font/*`** —— 该包通过框架专属的构建插件注入字体，
 * 会把本组件库绑定到特定框架（Next.js）。本组件库同时支持 Next.js 与纯 React 应用，
 * 因此字体只以**类名**形式暴露，由消费方自行引入 `@font-face` 资源。
 *
 * 若消费方希望使用 Geist，可在应用侧引入 `geist` 并把
 * `GeistSans.variable` / `GeistMono.variable` 追加到本文件的类名之后。
 */

import { cn } from './utils';

/**
 * 基础字体类名
 *
 * @description
 * `font-sans` 依赖 `--font-sans` 变量（见 `src/theme/fonts/fonts.ts`），
 * 未定义时回退到系统字体栈。
 */
export const fonts = cn('touch-manipulation font-sans antialiased');
