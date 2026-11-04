/**
 * `eas-addon-locale` —— 预览端（preview）
 *
 * @description
 * 监听工具栏写入的 `GLOBAL_KEY` 全局语言，并驱动
 * **`LocaleProvider`（`src/providers/locale-provider.tsx`）** 更新，
 * 使 story 内所有使用内置 i18n 的组件同步切换语言。
 *
 * ## 数据流
 *
 * ```
 * 工具栏 Select（manager）
 *   └─ updateGlobals({ easLocale: 'en-US' })
 *        └─ globals 通道（UPDATE_GLOBALS 事件）
 *             └─ useGlobals()（preview）
 *                  └─ LocaleProvider locale={...} setLocale={...}
 *                       └─ LocaleContext
 *                            └─ useLocale() / useComponentMessage()
 *                                 └─ 组件内置文案切换
 * ```
 *
 * ## 为什么语言存放在 `LocaleProvider` 而不是组件局部 state
 *
 * 1. **单一真值源** —— `LocaleProvider` 是本库公开的语言上下文出口
 *    （`src/providers`，见 `spec/i18n-standard.md`），Storybook 侧复用它
 *    而非另造一套，等于**同时验证了消费方的真实接入方式**；
 * 2. **context 参数传递** —— `setLocale` 通过 `LocaleContext` 下发，
 *    story 内的组件可调用 `useLocale().setLocale()` 局部改语言，
 *    与线上消费方行为一致；
 * 3. **持久化** —— `LocaleProvider` 内部把语言写入 `localStorage`
 *    （键 `eas-ui-locale`），刷新 Storybook 后语言不丢。
 *
 * ## 语言状态的两级存储
 *
 * | 层级         | 载体                             | 生命周期           | 职责                       |
 * | ------------ | -------------------------------- | ------------------ | -------------------------- |
 * | **会话级**   | Storybook globals（`easLocale`） | 当前 Storybook 会话 | 工具栏 ↔ preview 实时同步  |
 * | **持久级**   | `localStorage`（`eas-ui-locale`） | 跨会话            | 刷新后恢复上次选择          |
 *
 * globals 由 Storybook 写入 URL（可分享 / 可回退），`localStorage` 保证
 * 「关掉再打开 Storybook」仍是上次语言 —— 二者分工明确，互不覆盖。
 *
 * ## ⚠️ 为什么本文件**不**导出 `decorators`
 *
 * Storybook 会把 addon 的 preview 入口作为 **preview annotation** 自动加载，
 * 其导出的 `decorators` 会与 `.storybook/preview.tsx` 的装饰器**合并**。
 * 若本文件也导出 `decorators`，`withLocale` 会被应用**两次**
 * （外层来自 `preview.tsx`、内层来自本文件），
 * 产生两个嵌套的 `LocaleProvider` —— 虽然不报错，但属重复渲染。
 *
 * 故本文件**只导出** `withLocale`（装饰器本体）与 globals 配置。
 *
 * ## 📌 当前项目的挂载方式：**不挂载** `withLocale`
 *
 * 本项目在 `.storybook/preview.tsx` 的主题装饰器里**直接**包 `LocaleProvider`
 * （从 `useGlobals()` 取语言 + `setLocale` 桥接回 globals），
 * 因此 `withLocale` **未被挂载** —— 避免两层嵌套的 `LocaleProvider`。
 *
 * `withLocale` 保留为**可复用的备选实现**：其他项目若只想「一行挂载」，
 * 直接 `decorators: [withLocale, ...]` 即可。
 *
 * @example
 * ```ts
 * // .storybook/preview.tsx
 * import { withLocale } from './addon/eas-addon-locale/preview';
 *
 * decorators: [withLocale, ...]
 * ```
 */

import { useEffect } from 'react';
import { useGlobals } from 'storybook/preview-api';

import { LocaleProvider } from '../../../src/providers';
import { GLOBAL_KEY, normalizeLocale } from './constants';
/**
 * addon 参数（story 级可覆盖）
 *
 * @description
 * 与 manager 端 `EasLocaleParameters` 同名同义，
 * 供 story 用 `parameters.easLocale` 锁定或禁用语言切换。
 */
export interface EasLocaleParameters {
  /** 禁用语言切换 */
  disable?: boolean;
  /** 锁定当前语言（story 级强制指定，不允许切换） */
  localeOverride?: string;
}

/**
 * 语言状态装饰器
 *
 * @description
 * 把 globals 中的语言同步进 `LocaleProvider`。
 *
 * ⚠️ **`useGlobals` 必须在装饰器顶层调用** —— Storybook 的 hooks
 * 只能在装饰器函数体内使用（不能放在嵌套组件里再调用），
 * 否则拿不到 story 的 context。
 */
export const withLocale = (Story: () => React.ReactElement, context: { globals?: Record<string, unknown> }) => {
  const [globals, updateGlobals] = useGlobals();

  // globals 未就绪时回退到默认语言
  const rawLocale = (globals[GLOBAL_KEY] ?? context.globals?.[GLOBAL_KEY]) as string | undefined;
  const locale = normalizeLocale(rawLocale);

  // 📌 **回写规范化后的语言** —— 工具栏可能写入 `zh` / `en-GB` 这类
  //    非受支持标识，规范化后写回可让两侧始终保持同一份取值，
  //    避免「工具栏显示 A、组件渲染 B」的错位。
  useEffect(() => {
    if (rawLocale && rawLocale !== locale) {
      updateGlobals({ [GLOBAL_KEY]: locale });
    }
  }, [rawLocale, locale, updateGlobals]);

  return (
    <LocaleProvider
      locale={locale}
      setLocale={(next: string) => {
        updateGlobals({ [GLOBAL_KEY]: normalizeLocale(next) });
      }}
    >
      <Story />
    </LocaleProvider>
  );
};

/**
 * addon 的初始全局值
 *
 * @description
 * 声明 `easLocale` 全局量的初始值 —— Storybook 会把它写入 URL，
 * 使刷新页面后语言不丢。
 *
 * 📌 Storybook 的 `composeConfigs` 会用 `Object.assign` **合并**
 * 所有 preview 入口（含本 addon）导出的 `initialGlobals` / `globalTypes`，
 * 因此这里的声明**有效** —— `easLocale` 会进入 `allowedGlobalNames`，
 * 从而被 `filterAllowedGlobals` 放行（否则会被丢弃并打 warn）。
 */
export const initialGlobals = {
  [GLOBAL_KEY]: 'zh-CN',
};

/**
 * addon 的全局类型声明
 *
 * @description
 * 让 Storybook 知道 `easLocale` 是一个合法的 global，
 * 从而支持 URL 持久化与「恢复默认值」。
 */
export const globalTypes = {
  [GLOBAL_KEY]: {
    name: 'Language',
    description: '组件库内置 i18n 的当前语言（zh-CN / en-US）',
    defaultValue: 'zh-CN',
  },
};
