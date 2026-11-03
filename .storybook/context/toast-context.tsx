/**
 * Storybook 通知上下文
 *
 * @description
 * Storybook 侧的 `useToastContext()` **直接转发**到库内公开的
 * `NotifyProvider`（`src/providers`）—— 组件库已在 `src/providers` 沉淀了
 * 完整的语义化通知能力（`notify.info` / `success` / `warning` / `error`），
 * 无需在 `.storybook` 内再造一层。
 *
 * ⚠️ 原实现 `import { createContext, useContext } from 'use-context-selector'`，
 * 但 `use-context-selector` **从未被安装**（既不在 `dependencies`，也不在 `devDependencies`），
 * 与 `next-themes` 一样会导致 Storybook 构建失败。
 *
 * 改为直接透传库内的 `useNotify()` —— 它内部用 React 内置的 `useContext`，
 * 本场景只是"读一次 context 值"，用不上 `use-context-selector` 的选择器优化。
 */

import { useNotify } from '../../src/providers';

/** 通知 API */
export type NotifyApi = ReturnType<typeof useNotify>['notify'];

/** 通知上下文值 */
export type ToastContextValue = ReturnType<typeof useNotify>;

/**
 * 读取通知上下文
 *
 * @description
 * 转发到库内 `useNotify()` —— 返回的 `notify` / `close`
 * 与库内 `NotifyProvider` 完全同源。
 *
 * @returns 通知 API 与关闭方法
 */
export function useToastContext(): ToastContextValue {
  return useNotify();
}
