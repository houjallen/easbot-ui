/**
 * Progress 组件单元测试
 *
 * @description
 * 断言以组件真实 DOM 结构为准：
 * 进度条根节点为 `role="progressbar"`（`data-slot="progress"`），
 * 指示条为 `data-slot="progress-indicator"`，其位移通过 `transform` 表达。
 *
 * 说明：当前 `Progress` 直接透传 Radix `Progress.Root` 的原生 props，
 * **不支持** `indicatorClassName`（指示条类名硬编码），因此不对该能力做断言。
 */

import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Progress } from '../progress';

describe('Progress 组件', () => {
  it('应正确显示进度值', () => {
    render(<Progress value={60} />);
    const root = screen.getByRole('progressbar');
    const indicator = root.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-40%)' });
  });

  it('应处理不确定状态', () => {
    render(<Progress value={undefined} />);
    const root = screen.getByRole('progressbar');
    const indicator = root.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveClass('w-full'); // 不确定状态全宽
  });

  it('应应用自定义根节点样式', () => {
    render(<Progress value={50} className="custom-bg" />);

    const root = screen.getByRole('progressbar');
    expect(root).toHaveClass('custom-bg');
  });
});
