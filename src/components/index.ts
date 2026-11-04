/**
 * 应用组件出口
 *
 * @description
 * **应用层组件** —— 由本库的基础 UI 组件与 Provider 组合而成的**可直接使用**的成品组件。
 *
 * 与 `src/ui/` 的分工：
 *
 * | 层                | 定位                                                       |
 * | ----------------- | ---------------------------------------------------------- |
 * | `src/ui/`         | **基础 UI 组件** —— 原子级、可组合，消费方自行组装         |
 * | `src/components/` | **应用组件** —— 开箱即用的成品，消费方直接 `import` 使用    |
 *
 * 判定标准：该组件是否**自带业务语义**（如「切换主题」「切换语言」）。
 * 是 → 放 `src/components/`；否（纯视觉原子）→ 放 `src/ui/`。
 *
 * @example
 * ```tsx
 * import { LocaleToggle, ThemeToggle } from '@easbot/ui';
 *
 * <ThemeToggle />
 * <LocaleToggle />
 * ```
 */

export * from './locale-toggle';
export * from './theme-toggle';
