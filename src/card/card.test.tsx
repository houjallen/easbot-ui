/**
 * Card 组件单元测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 变体测试 - 验证不同样式变体的应用
 * 3. 交互测试 - 验证点击和加载状态
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { vi } from 'vitest';

describe('Card 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染基础卡片', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>标题</CardTitle>
            <CardDescription>描述</CardDescription>
          </CardHeader>
          <CardContent>内容</CardContent>
          <CardFooter>底部</CardFooter>
        </Card>,
      );

      expect(screen.getByText('标题')).toBeInTheDocument();
      expect(screen.getByText('描述')).toBeInTheDocument();
      expect(screen.getByText('内容')).toBeInTheDocument();
      expect(screen.getByText('底部')).toBeInTheDocument();
    });

    it('应该正确渲染加载状态', () => {
      render(
        <Card loading>
          <CardContent>加载中的内容</CardContent>
        </Card>,
      );
      expect(screen.getByText('加载中的内容').parentElement).toHaveClass('animate-pulse');
    });
  });

  // 变体测试
  describe('变体测试', () => {
    it('应该正确应用默认变体样式', () => {
      render(<Card variant="default">默认卡片</Card>);
      expect(screen.getByText('默认卡片')).toHaveClass('border-border');
    });

    it('应该正确应用成功变体样式', () => {
      render(<Card variant="success">成功卡片</Card>);
      // Tailwind v4：语义类已替换为 CSS 变量任意值
      expect(screen.getByText('成功卡片')).toHaveClass('text-success');
    });

    it('应该正确应用警告变体样式', () => {
      render(<Card variant="warning">警告卡片</Card>);
      expect(screen.getByText('警告卡片')).toHaveClass('text-warning');
    });

    it('应该正确应用不同尺寸', () => {
      render(<Card size="lg">大号卡片</Card>);
      expect(screen.getByText('大号卡片')).toHaveClass('p-8');
    });

    it('应该正确应用悬浮效果', () => {
      render(<Card hover>可悬浮卡片</Card>);
      expect(screen.getByText('可悬浮卡片')).toHaveClass('hover:shadow-[var(--card-hover-shadow)]');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('点击可点击的卡片应该触发回调', () => {
      const handleClick = vi.fn();
      render(
        <Card clickable onClick={handleClick}>
          可点击卡片
        </Card>,
      );

      fireEvent.click(screen.getByText('可点击卡片'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('可点击的卡片应该渲染为按钮元素', () => {
      render(<Card clickable>可点击卡片</Card>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      // 未显式指定 type 时，button 元素不会自动带上 type 属性
      expect(screen.getByRole('button').tagName).toBe('BUTTON');
    });

    it('不可点击的卡片不应该有交互样式', () => {
      render(<Card>普通卡片</Card>);
      const card = screen.getByText('普通卡片');
      expect(card).not.toHaveClass('cursor-pointer');
      expect(card).not.toHaveClass('hover:shadow-md');
    });
  });

  // 子组件测试
  describe('子组件测试', () => {
    it('CardHeader 应该有正确的样式', () => {
      render(
        <Card>
          <CardHeader>头部内容</CardHeader>
        </Card>,
      );
      expect(screen.getByText('头部内容')).toHaveClass('flex', 'flex-col', 'space-y-1.5');
    });

    it('CardTitle 应该渲染为 h3 元素', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>标题文本</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('CardDescription 应该有正确的样式', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>描述文本</CardDescription>
          </CardHeader>
        </Card>,
      );
      // Tailwind v4：语义类已替换为 CSS 变量任意值
      expect(screen.getByText('描述文本')).toHaveClass('text-sm', 'text-[var(--card-description)]');
    });

    it('CardContent 应该有正确的内边距', () => {
      render(
        <Card>
          <CardContent>内容区域</CardContent>
        </Card>,
      );
      expect(screen.getByText('内容区域')).toHaveClass('p-6', 'pt-0');
    });

    it('CardFooter 应该有正确的布局', () => {
      render(
        <Card>
          <CardFooter>底部区域</CardFooter>
        </Card>,
      );
      expect(screen.getByText('底部区域')).toHaveClass('flex', 'items-center');
    });
  });

  // 新增禁用状态测试
  describe('禁用状态测试', () => {
    it('应该正确应用禁用样式', () => {
      render(<Card disabled>禁用卡片</Card>);
      const card = screen.getByText('禁用卡片');
      // Tailwind v4：禁用透明度使用 CSS 变量任意值
      expect(card).toHaveClass('opacity-[var(--card-disabled-opacity)]');
      expect(card).toHaveClass('pointer-events-none');
    });

    it('禁用状态下不应触发点击事件', () => {
      const handleClick = vi.fn();
      render(
        <Card clickable disabled onClick={handleClick}>
          禁用可点击卡片
        </Card>,
      );
      fireEvent.click(screen.getByText('禁用可点击卡片'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // 新增波纹效果测试
  describe('交互效果测试', () => {
    it('点击应产生波纹效果', () => {
      render(<Card clickable>可点击卡片</Card>);
      const card = screen.getByText('可点击卡片');
      fireEvent.click(card, { clientX: 100, clientY: 100 });
      expect(card.querySelectorAll('.animate-ripple').length).toBe(1);
    });

    it('应该自动清理波纹元素', async () => {
      render(
        <Card clickable rippleDuration={100}>
          测试卡片
        </Card>,
      );
      fireEvent.click(screen.getByText('测试卡片'));

      await waitFor(
        () => {
          expect(screen.queryByTestId('ripple')).toBeNull();
        },
        { timeout: 200 },
      );
    });

    it('向右滑动应触发回调', () => {
      const handleSwipe = vi.fn();
      render(<Card onSwipe={handleSwipe}>滑动测试</Card>);

      const card = screen.getByText('滑动测试');
      fireEvent.touchStart(card, { touches: [{ clientX: 0, clientY: 0 }] });
      fireEvent.touchEnd(card, { changedTouches: [{ clientX: 50, clientY: 0 }] });

      expect(handleSwipe).toHaveBeenCalledWith('right');
    });
  });
});
