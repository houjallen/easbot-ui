/**
 * Avatar 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证头像容器、图片与回退内容的渲染
 * 2. 状态测试 - 验证形状与状态指示点
 * 3. 交互测试 - 验证自定义类名透传
 * 4. 无障碍测试 - 验证图片的 alt 与 aria 属性
 *
 * 说明：`Avatar` 本身不提供 `img` 语义角色，也不内置 `data-testid`；
 * Radix 的 `AvatarImage` 只在图片**加载成功**后才渲染，
 * 而 jsdom 不会真实加载图片，因此图片场景统一通过 `AvatarFallback` 验证。
 */

import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

describe('Avatar 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('正确渲染默认头像容器', () => {
      const { container } = render(<Avatar />);
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('size-8');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('正确渲染头像图片容器', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="用户头像" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      );
      // jsdom 不会真实加载图片，因此图片节点不渲染，回退内容接管展示
      expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument();
      expect(screen.getByText('FB')).toBeInTheDocument();
    });

    it('图片加载失败时显示回退内容', () => {
      render(
        <Avatar>
          <AvatarImage src="/invalid.jpg" alt="用户头像" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByText('FB')).toBeInTheDocument();
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('正确应用圆形样式', () => {
      const { container } = render(<Avatar />);
      expect(container.querySelector('[data-slot="avatar"]')).toHaveClass('rounded-full');
    });

    it('正确应用方形样式', () => {
      const { container } = render(<Avatar shape="square" />);
      expect(container.querySelector('[data-slot="avatar"]')).toHaveClass('rounded-[var(--radius-md)]');
    });

    it('默认不显示状态指示点', () => {
      const { container } = render(<Avatar />);
      expect(container.querySelector('[data-slot="avatar"]')?.parentElement?.children).toHaveLength(1);
    });

    it('在开启showStatus后渲染状态指示点', () => {
      const { container } = render(<Avatar showStatus />);
      const wrapper = container.querySelector('[data-slot="avatar"]')?.parentElement;
      expect(wrapper?.children).toHaveLength(2);
    });

    it('正确应用状态指示点位置偏移', () => {
      const { container } = render(<Avatar showStatus statusPosition="top-right" />);
      const wrapper = container.querySelector('[data-slot="avatar"]')?.parentElement;
      const status = wrapper?.children[1];
      expect(status).toHaveClass('top-0');
      expect(status).toHaveClass('right-0');
    });

    it('正确应用自定义状态颜色', () => {
      const { container } = render(<Avatar showStatus statusColor="rgb(255, 0, 0)" />);
      const wrapper = container.querySelector('[data-slot="avatar"]')?.parentElement;
      const status = wrapper?.children[1] as HTMLElement | undefined;
      expect(status?.getAttribute('style')).toContain('background-color: rgb(255, 0, 0)');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('正确应用自定义类名', () => {
      const { container } = render(<Avatar className="custom-class" />);
      expect(container.querySelector('[data-slot="avatar"]')?.parentElement).toHaveClass('custom-class');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('回退内容应该提供可访问名称', () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="用户头像" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByText('FB')).toBeInTheDocument();
    });

    it('应该透传aria-label到头像容器', () => {
      const { container } = render(
        <Avatar aria-label="用户头像标签">
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      );
      expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
      expect(screen.getByLabelText('用户头像标签', { selector: 'span' })).toBeInTheDocument();
    });
  });
});
