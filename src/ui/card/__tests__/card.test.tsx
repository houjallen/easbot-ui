/**
 * Card 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证卡片与各子组件的基本渲染
 * 2. 状态测试 - 验证 data-slot 标识与自定义类名
 * 3. 交互测试 - 验证点击事件透传
 * 4. 无障碍测试 - 验证语义化容器属性
 *
 * 说明：`Card` 直接复用 design-system 的实现，仅提供容器语义与样式，
 * 不含 variant / size / loading / disabled / 波纹 等扩展能力，因此不对这些做断言。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';

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

    it('应该正确应用卡片基础样式', () => {
      render(<Card>默认卡片</Card>);
      const card = screen.getByText('默认卡片');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('py-6');
    });

    it('应该正确应用自定义类名', () => {
      render(<Card className="custom-class">自定义卡片</Card>);
      expect(screen.getByText('自定义卡片')).toHaveClass('custom-class');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应该为各子组件渲染data-slot标识', () => {
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

      expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="card-description"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="card-content"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="card-footer"]')).toBeInTheDocument();
    });

    it('CardHeader 应该有正确的样式', () => {
      render(
        <Card>
          <CardHeader>头部内容</CardHeader>
        </Card>,
      );
      expect(screen.getByText('头部内容')).toHaveClass('grid', 'items-start', 'gap-1.5', 'px-6');
    });

    it('CardDescription 应该有正确的样式', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>描述文本</CardDescription>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText('描述文本')).toHaveClass('text-muted-foreground', 'text-sm');
    });

    it('CardContent 应该有正确的内边距', () => {
      render(
        <Card>
          <CardContent>内容区域</CardContent>
        </Card>,
      );
      expect(screen.getByText('内容区域')).toHaveClass('px-6');
    });

    it('CardFooter 应该有正确的布局', () => {
      render(
        <Card>
          <CardFooter>底部区域</CardFooter>
        </Card>,
      );
      expect(screen.getByText('底部区域')).toHaveClass('flex', 'items-center', 'px-6');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('点击可点击的卡片应该触发回调', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>可点击卡片</Card>);

      fireEvent.click(screen.getByText('可点击卡片'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('不可点击的卡片不应该有交互样式', () => {
      render(<Card>普通卡片</Card>);
      const card = screen.getByText('普通卡片');
      expect(card).not.toHaveClass('cursor-pointer');
      expect(card).not.toHaveClass('hover:shadow-md');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该透传aria属性到卡片根节点', () => {
      render(
        <Card aria-label="信息卡片" role="region">
          <CardContent>区域内容</CardContent>
        </Card>,
      );

      const card = screen.getByRole('region');
      expect(card).toHaveAttribute('aria-label', '信息卡片');
    });
  });
});
