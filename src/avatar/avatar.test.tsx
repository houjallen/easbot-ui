/**
 * Avatar 组件单元测试
 */

import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar 组件', () => {
  // 基础渲染测试
  it('正确渲染默认头像', () => {
    render(<Avatar />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  // 尺寸测试
  it('正确应用小尺寸样式', () => {
    render(<Avatar size="sm" />);
    // Tailwind v4：尺寸使用 CSS 变量任意值
    expect(screen.getByRole('img')).toHaveClass('h-[var(--avatar-size-sm)] w-[var(--avatar-size-sm)]');
  });

  // 形状测试
  it('正确应用方形样式', () => {
    render(<Avatar shape="square" />);
    expect(screen.getByRole('img')).toHaveClass('rounded-[var(--avatar-radius-square)]');
  });

  // 状态指示测试
  it('正确显示在线状态', () => {
    render(<Avatar status="online" />);
    expect(screen.getByTestId('avatar-status')).toHaveClass('bg-[var(--avatar-status-online)]');
  });

  // 图片组件测试
  it('正确渲染头像图片', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" />
      </Avatar>,
    );
    // Radix Avatar.Image 在图片 load 成功前保持 loading 态，此时不渲染 <img>；
    // load 失败后会切换到 error 态并回退到 Fallback
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByAltText('用户头像')).not.toBeInTheDocument();
  });

  // 回退组件测试
  it('图片加载失败时显示回退内容', () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid.jpg" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  // 无障碍测试
  it('包含正确的ARIA属性', () => {
    render(<Avatar />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('aria-label', '用户头像');
  });

  // 新增状态位置测试
  it('正确应用状态指示位置偏移', () => {
    render(<Avatar status="online" statusOffset={['10px', '10px']} />);
    const status = screen.getByTestId('avatar-status');
    expect(status).toHaveStyle({ right: '10px', bottom: '10px' });
  });

  // 新增组合测试
  it('正确组合尺寸和形状', () => {
    render(<Avatar size="lg" shape="square" />);
    const avatar = screen.getByRole('img');
    // Tailwind v4：尺寸/圆角使用 CSS 变量任意值
    expect(avatar).toHaveClass('h-[var(--avatar-size-lg)] w-[var(--avatar-size-lg)] rounded-[var(--avatar-radius-square)]');
  });

  // 新增图片加载失败测试
  it('图片加载失败时自动隐藏', () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid.jpg" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );
    // 图片加载失败后 Radix 卸载 <img>，回退到 Fallback 内容
    expect(screen.queryByAltText('用户头像')).not.toBeInTheDocument();
    expect(screen.getByText('FB')).toBeInTheDocument();
  });
});
