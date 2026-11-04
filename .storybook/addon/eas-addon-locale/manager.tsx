/**
 * `eas-addon-locale` —— 工具栏端（manager）
 *
 * @description
 * 在 Storybook 工具栏上提供一个**语言切换下拉**，按 Storybook 官方 addon
 * 规范实现（结构与式样参照 `@storybook/addon-themes`）：
 *
 * - `addons.register(ADDON_ID, ...)` 注册 addon；
 * - `addons.add(TOOL_ID, { type: types.TOOL, ... })` 在工具栏挂载控件；
 * - 控件通过 **`updateGlobals`** 写入 `GLOBAL_KEY`，preview 端监听该
 *   global 并驱动 `LocaleProvider` 更新 —— 这是 Storybook 官方推荐的
 *   「toolbar → preview」通信方式（globals 通道）。
 *
 * ## 为什么用 globals 而不是自定义事件
 *
 * Storybook 的 globals 是 **manager ↔ preview 双向同步**的内建通道：
 * manager 侧 `updateGlobals()` 发出 `UPDATE_GLOBALS`，
 * preview 侧 `useGlobals()` 自动收到并触发重渲染。
 * 自定义事件（`addons.getChannel().emit(...)`）是**单向**的，
 * preview 端需额外 `useChannel` 订阅，且不自带「story 级 globals 覆盖」能力。
 *
 * ## 为什么用下拉（Select）而不是直接切换按钮
 *
 * `@storybook/addon-themes` 的规则是：**两个**值时用按钮直接切换，
 * **多于两个**时用下拉。本 addon 支持的语言数量可扩展，
 * 故统一用下拉 —— 两种以上语言时按钮无法表达「切到哪个」。
 *
 * ## 图标
 *
 * 使用本库自带的 **`eas-language`** 图标（`EasLanguageIcon`），
 * 与组件库内的 `Icon name="eas-language"` 是同一份实现 ——
 * 工具栏与组件的视觉语言保持一致。
 *
 * ## ⚠️ 为什么显式 `import * as React`
 *
 * Storybook 的 **manager bundle** 由 esbuild 打包，且使用 **classic JSX**
 * （`jsx: "react"` → `React.createElement`），**不是** Vite/preview 侧的
 * automatic runtime。故本文件**必须**显式引入 React，否则 JSX 编译后
 * 找不到 `React.createElement` 而在运行时报错。
 *
 * @example
 * ```ts
 * // .storybook/main.ts
 * addons: [easAddonLocalePath]
 * ```
 */

import * as React from 'react';

import { EasLanguageIcon } from '../../../src/ui/icon/svg/eas-icon';
import { Select } from 'storybook/internal/components';
import { addons, types, useGlobals, useParameter } from 'storybook/manager-api';

import { ADDON_ID, TOOL_ID, DEFAULT_LOCALE, GLOBAL_KEY, LOCALE_LABELS, PARAM_KEY, SUPPORTED_LOCALES } from './constants';
import type { Locale } from './constants';

/**
 * addon 参数（story 级可覆盖）
 */
export interface EasLocaleParameters {
  /** 禁用工具栏控件 */
  disable?: boolean;
  /** 锁定当前语言（story 级强制指定，不允许切换） */
  localeOverride?: string;
}

/**
 * 语言切换下拉
 *
 * @description
 * 渲染工具栏控件；选中后通过 `updateGlobals` 写入全局语言。
 */
const LocaleSwitcher = React.memo(function LocaleSwitcher() {
  const [{ [GLOBAL_KEY]: currentLocale }, updateGlobals] = useGlobals();
  const parameters = useParameter<Partial<EasLocaleParameters>>(PARAM_KEY, {});

  // story 级锁定：不允许切换（与 addon-themes 的 `themeOverride` 同思路）
  if (parameters.localeOverride) return null;
  if (parameters.disable) return null;

  const active = (currentLocale ?? DEFAULT_LOCALE) as Locale;

  return (
    <Select
      ariaLabel="Language"
      tooltip="Switch language"
      icon={<EasLanguageIcon width={14} height={14} />}
      // 📌 `defaultOptions` 是 **初始选中项**（非受控）——
      //    与 addon-themes 的 `Select` 用法完全一致。
      defaultOptions={active}
      options={SUPPORTED_LOCALES.map((locale) => ({
        title: LOCALE_LABELS[locale],
        value: locale,
      }))}
      onSelect={(selected) => updateGlobals({ [GLOBAL_KEY]: selected })}
    />
  );
});

// 注册 addon 与工具栏控件
addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    title: 'Language',
    type: types.TOOL,
    match: ({ viewMode, tabId }) => !!viewMode?.match(/^(story|docs)$/) && !tabId,
    render: LocaleSwitcher,
    paramKey: PARAM_KEY,
  });
});
