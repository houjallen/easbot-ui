/**
 * 日期 / 时间输入族「禁用态 + suffix 图标」回归测试
 *
 * @description
 * 这 6 个组件都用 `<PopoverTrigger asChild>` 包裹**外层 div**：
 * Radix 会把打开弹层的事件合并到该 div 上，因此即使 `<Input disabled>`
 * 与 suffix span 各自做了 `!disabled` 守卫，点击日历图标仍会冒泡到 div
 * 触发 Radix 打开弹层 —— 属于「主体禁用、配合图标仍可点击」缺陷。
 *
 * 修复：在 Popover 层做受控守卫
 * `open={!disabled && open}` + `onOpenChange` 内 `if (!disabled) setOpen(...)`。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ElementType } from 'react';
import { describe, expect, it } from 'vitest';
import { InputDate } from '../input-date';
import { InputDateRange } from '../input-date-range';
import { InputDateTime } from '../input-date-time';
import { InputDateTimeRange } from '../input-date-time-range';
import { InputTime } from '../input-time';
import { InputTimeRange } from '../input-time-range';

const cases: Array<{ name: string; Component: ElementType }> = [
  { name: 'InputDate', Component: InputDate },
  { name: 'InputDateRange', Component: InputDateRange },
  { name: 'InputDateTime', Component: InputDateTime },
  { name: 'InputDateTimeRange', Component: InputDateTimeRange },
  { name: 'InputTime', Component: InputTime },
  { name: 'InputTimeRange', Component: InputTimeRange },
];

describe.each(cases)('$name 禁用态弹层', ({ Component }) => {
  it('禁用时点击 suffix 图标不应打开弹层', async () => {
    const user = userEvent.setup();
    const { container } = render(<Component disabled />);
    const triggerIcon = container.querySelector('span[role="button"]');
    if (!triggerIcon) throw new Error('未找到 suffix 图标');

    expect(triggerIcon).toHaveAttribute('aria-disabled', 'true');
    expect(triggerIcon).toHaveAttribute('tabindex', '-1');
    await user.click(triggerIcon);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('未禁用时点击 suffix 图标仍应打开弹层（修复不得误伤）', async () => {
    const user = userEvent.setup();
    const { container } = render(<Component />);
    const triggerIcon = container.querySelector('span[role="button"]');
    if (!triggerIcon) throw new Error('未找到 suffix 图标');

    await user.click(triggerIcon);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
