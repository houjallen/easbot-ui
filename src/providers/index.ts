/**
 * Provider 出口
 *
 * @description
 * 组件库的上下文 Provider 统一出口。
 *
 * 分层说明：
 * - `src/providers/` —— **上下文 Provider**（语言 / 主题），
 *   消费方从包根导入即可使用。
 * - `src/design-system/` —— 设计系统层的**基础组件实现**与 Provider 组合
 *   （`DesignSystemProvider` 等），由 `design-system/index.tsx` 统一出口。
 * - `NotifyProvider` 属于**通知组件族**（组合 `Toaster` / `toast()`），
 *   归属 `src/ui/toast/`，由包根经 `ui` 层出口 —— 与「providers 层不依赖 ui 层」
 *   的依赖方向约束一致。
 */

export * from './locale-provider';
export * from './theme-provider';
