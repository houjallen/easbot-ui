/**
 * 语言切换按钮（Locale Toggle）
 *
 * @description
 * 点击弹出语言下拉菜单，在受支持的语言间切换。
 *
 * 设计要点：
 * 1. **语言显示名始终用母语** —— 简体中文显示「简体中文」，英文显示「English」，
 *    用户能一眼认出母语（语言选择器的通行做法）。
 * 2. **当前语言用圆点标记** —— 选中项右侧显示 `bg-primary` 小圆点。
 * 3. **状态来源是 `useLocale()`** —— 读 Provider 注入的语言，切换走 `setLocale`。
 * 4. **组件自己记住选中值** —— 用本地 `state` 记录当前选中项，
 *    初始值取自 `useLocale()`；用户选择后**先**更新本地 state（UI 立即反馈），
 *    **再**通过 `setLocale` 同步回 store / globals。
 *    外部语言变化（如 Storybook 工具栏切换 globals）时同步该 state。
 * 5. **下拉项仅在语言不同时才触发切换** —— 避免无意义的重复写入。
 * 6. **文案走内置文案表** —— `locale` 域（`localeMessages`），语言由 `LocaleProvider` 决定，
 *    无需消费方传入 `locale` / `messages`。
 *
 * @example
 * ```tsx
 * <LocaleToggle />
 * ```
 */

'use client';

import * as React from 'react';

import { useLocale } from '../../hooks/use-locale';
import { LOCALE_MESSAGE_KEYS, SUPPORTED_LOCALES } from '../../utils/locale';
import { useComponentMessage } from '../../utils/use-component-message';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { IconButton } from '../../ui/icon';

/**
 * 语言切换按钮属性
 */
export interface LocaleToggleProps {
  /** 触发器图标尺寸（像素） */
  size?: number;
  /** 附加类名 */
  className?: string;
  /** 下拉内容对齐方式 */
  align?: 'start' | 'center' | 'end';
}

/**
 * 语言切换按钮
 *
 * @param props 组件属性
 * @returns 下拉菜单触发器
 */
export const LocaleToggle = React.memo(function LocaleToggle({ size = 32, className, align = 'end' }: LocaleToggleProps) {
  const { locale: contextLocale, setLocale } = useLocale();
  const { t } = useComponentMessage('locale');

  // 📌 **组件自己记住选中值** —— 初始值来自 `useLocale()`（即 Provider 注入的语言），
  //    用户选择后立即更新本地 state（UI 无需等待外部回传即可响应），
  //    同时通过 `setLocale` 同步回 store / globals。
  const [selected, setSelected] = React.useState<string>(contextLocale);

  // 外部语言变化时（如 Storybook 工具栏切换 globals）同步选中值。
  //    依赖 `contextLocale` 而非 `selected` —— 避免用户刚选完就被旧值覆盖。
  React.useEffect(() => {
    setSelected(contextLocale);
  }, [contextLocale]);

  const handleSelect = React.useCallback(
    (next: string) => {
      if (next === selected) return;
      // 先更新本地选中值（UI 立即反馈），再同步到 store
      setSelected(next);
      setLocale?.(next);
    },
    [selected, setLocale],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon="eas-language" size={size} aria-label={t('toggleLabel')} className={className} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="max-h-[400px] w-[240px] overflow-y-auto">
        {SUPPORTED_LOCALES.map((item) => {
          const label = t(LOCALE_MESSAGE_KEYS[item]);
          const isActive = item === selected;

          return (
            <DropdownMenuItem key={item} onClick={() => handleSelect(item)} className="flex cursor-pointer items-center gap-2 px-4 py-2">
              <span className="min-w-[100px] font-medium">{label}</span>
              {isActive && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

LocaleToggle.displayName = 'LocaleToggle';
