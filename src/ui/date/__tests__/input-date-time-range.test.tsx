/**
 * InputDateTimeRange 组件测试
 *
 * @description
 * InputDateTimeRange 由「开始时间 / 结束时间」两块独立的 InputDateTime 面板组成，
 * 每块面板内部提供「时间 / 日期」两个标签页：
 * - 「时间」标签页默认激活，展示时分秒选择器
 * - 「日期」标签页展示日 / 月 / 年三级视图（通过视图标题逐级进入，不是独立标签页）
 *
 * 由于 Radix Popover 的触发器走 `onPointerDown` 路径，浮层必须用
 * `@testing-library/user-event` 触发，且内容通过 portal 异步挂载，需用 findBy 查询。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InputDateTimeRange } from '../input-date-time-range';

/** 打开外层范围弹层 */
async function openRangePopover(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('textbox'));
  await screen.findByText('开始时间');
  await screen.findByText('结束时间');
}

/** 打开范围内第一块（开始时间）的日期时间弹层 */
async function openFirstDateTimePopover(user: ReturnType<typeof userEvent.setup>) {
  const innerInputs = screen.getAllByPlaceholderText('请选择日期');
  const firstInput = innerInputs[0];
  if (!firstInput) throw new Error('未找到开始时间面板的输入框');
  await user.click(firstInput);
  await screen.findByRole('button', { name: '时间' });
  await screen.findByRole('button', { name: '日期' });
}

describe('InputDateTimeRange', () => {
  it('应该渲染范围输入框与占位符', () => {
    render(<InputDateTimeRange />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', '请选择范围');
  });

  it('打开后应该展示开始时间与结束时间两块面板', async () => {
    const user = userEvent.setup();
    render(<InputDateTimeRange />);

    await openRangePopover(user);

    expect(screen.getByText('开始时间')).toBeInTheDocument();
    expect(screen.getByText('结束时间')).toBeInTheDocument();
    // 两块面板各提供一个日期时间输入框
    expect(screen.getAllByPlaceholderText('请选择日期')).toHaveLength(2);
  });

  it('应该展示当前选择与确认取消操作', async () => {
    const user = userEvent.setup();
    render(<InputDateTimeRange />);

    await openRangePopover(user);

    expect(screen.getByText(/当前选择/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument();
  });

  it('日期时间面板应该提供时间与日期两个标签页', async () => {
    const user = userEvent.setup();
    render(<InputDateTimeRange />);

    await openRangePopover(user);
    await openFirstDateTimePopover(user);

    expect(screen.getByRole('button', { name: '时间' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '日期' })).toBeInTheDocument();
    // 不存在「季度」标签页
    expect(screen.queryByRole('button', { name: '季度' })).not.toBeInTheDocument();
  });

  it('默认应该激活时间标签页', async () => {
    const user = userEvent.setup();
    render(<InputDateTimeRange />);

    await openRangePopover(user);
    await openFirstDateTimePopover(user);

    // 激活态标签页使用 default 变体（bg-primary / text-primary-foreground）
    const timeTab = screen.getByRole('button', { name: '时间' });
    expect(timeTab).toHaveClass('bg-primary');
    expect(timeTab).toHaveClass('text-primary-foreground');

    // 时间标签页默认展示小时选择
    expect(screen.getByText('时')).toBeInTheDocument();
  });

  it('应该能够在时间与日期标签页之间切换', async () => {
    const user = userEvent.setup();
    render(<InputDateTimeRange />);

    await openRangePopover(user);
    await openFirstDateTimePopover(user);

    // 切换到日期标签页
    const dateTab = screen.getByRole('button', { name: '日期' });
    await user.click(dateTab);
    expect(dateTab).toHaveClass('bg-primary');
    expect(dateTab).toHaveClass('text-primary-foreground');

    // 日期视图展示日 / 月 / 年三级标题（点击标题逐级进入）
    // 视图标题形如「2026年11月」，点击后可进入月视图再进入年视图
    const viewTitle = screen.getByRole('button', { name: /^\d{4}年\d{1,2}月$/ });
    expect(viewTitle).toBeInTheDocument();
  });
});
