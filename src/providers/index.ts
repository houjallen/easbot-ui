/**
 * Provider 出口
 *
 * @description
 * 组件库的上下文 Provider 统一出口。
 *
 * 分层说明：
 * - `src/providers/` —— **公开组件层**的上下文 Provider（语言 / 通知），
 *   消费方从包根导入即可使用。
 * - `src/design-system/providers/` —— 设计系统层的 Provider 组合
 *   （`ThemeProvider` 等），由 `DesignSystemProvider` 统一组合。
 */

export * from './locale-provider';
export * from './notify-provider';
