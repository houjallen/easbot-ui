/**
 * 编辑器族「禁用态 + suffix 图标」回归测试
 *
 * @description
 * ListEditor / ObjectEditor 用 `<PopoverTrigger asChild>` 包裹外层 div，
 * Radix 把打开弹层的事件合并到该 div：即使 `<Input disabled>` 与 onClick
 * 内各自做了 `!disabled` 守卫，点击 suffix 图标仍会冒泡触发 Radix 打开弹层。
 *
 * 修复：Popover 层受控守卫
 * `open={!disabled && open}` + `onOpenChange` 内 `if (!disabled) setOpen(...)`。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ElementType } from 'react';
import { describe, expect, it } from 'vitest';
import { ListEditor } from '../ListEditor';
import { ObjectEditor } from '../ObjectEditor';

const cases: Array<{ name: string; Component: ElementType }> = [
  { name: 'ListEditor', Component: ListEditor },
  { name: 'ObjectEditor', Component: ObjectEditor },
];

describe.each(cases)('$name 禁用态弹层', ({ Component }) => {
  it('禁用时点击图标区域不应打开弹层', async () => {
    const user = userEvent.setup();
    const { container } = render(<Component disabled />);
    const triggerDiv = container.querySelector('div[aria-disabled="true"]');
    if (!triggerDiv) throw new Error('未找到触发器容器');

    expect(triggerDiv).toHaveClass('cursor-not-allowed');
    await user.click(triggerDiv);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('未禁用时点击仍应打开弹层（修复不得误伤）', async () => {
    const user = userEvent.setup();
    const { container } = render(<Component />);
    const triggerDiv = container.querySelector('input')?.parentElement;
    if (!triggerDiv) throw new Error('未找到触发器容器');

    await user.click(triggerDiv);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
