/**
 * @easbot/ui 公开 API 出口
 *
 * @description
 * 本文件是 **tsup 的唯一构建入口**（见 `tsup.config.ts` 的 `input`）。
 * 所有对外暴露的组件 / 类型 / Schema 必须在此 barrel 导出，
 * 否则不会进入 `dist/index.d.ts` 与 `dist/index.mjs`。
 *
 * 导出分层：
 * 1. `models` —— 数据契约（Zod Schema + 推导类型），消费方传入配置时的运行时校验器
 * 2. `utils` —— 通用工具函数
 * 3. `ui` —— UI 组件（`src/ui/**` 是本库的**公开组件层**，与 `src/design-system/components/ui/**`
 *    的基础实现层并存；同名组件以 `src/ui` 版本为准，它额外附带 Props 类型）
 * 4. `design-system` —— 设计系统 Provider 组合（主题 / Tooltip / Toast）
 * 5. `hooks` —— 通用 React Hook（`useDevice` / `useLocale`）
 * 6. `providers` —— 上下文 Provider（`LocaleProvider`）
 *
 * @remarks
 * `src/design-system/components/ui/sonner` 的 `Toaster` 已在 `design-system/index.tsx` 内被
 * `DesignSystemProvider` 组合引用，无需重复导出。
 */

/* ---------- 数据契约（Zod Schema） ---------- */
export * from './models';

/* ---------- 通用工具 ---------- */
export * from './utils';

/* ---------- UI 组件 ---------- */
export * from './ui';

/* ---------- 设计系统 Provider ---------- */
export * from './design-system';

/* ---------- 通用 Hook ---------- */
export * from './hooks';

/* ---------- 上下文 Provider ---------- */
export * from './providers';
