/**
 * Card 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证卡片及子组件的基本渲染与类名
 * 2. 状态测试 - 验证自定义类名覆盖与状态属性
 * 3. 交互测试 - 验证点击回调与嵌套结构
 * 4. 无障碍测试 - 验证语义角色与属性透传
 * 5. 边界测试 - 验证空 children、缺省子组件、className 合并
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';

describe('Card 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染卡片', () => {
      render(<Card>卡片内容</Card>);

      const card = screen.getByText('卡片内容');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('应该正确应用卡片基础类名', () => {
      render(<Card>卡片内容</Card>);

      const card = screen.getByText('卡片内容');
      expect(card).toHaveClass('flex');
      expect(card).toHaveClass('flex-col');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
    });

    it('应该正确渲染卡片头部', () => {
      render(
        <Card>
          <CardHeader>头部</CardHeader>
        </Card>,
      );

      expect(screen.getByText('头部')).toHaveAttribute('data-slot', 'card-header');
    });

    it('应该正确渲染卡片标题', () => {
      render(
        <Card>
          <CardTitle>标题</CardTitle>
        </Card>,
      );

      const title = screen.getByText('标题');
      expect(title).toHaveAttribute('data-slot', 'card-title');
      expect(title).toHaveClass('font-semibold');
    });

    it('应该正确渲染卡片描述', () => {
      render(
        <Card>
          <CardDescription>描述</CardDescription>
        </Card>,
      );

      const description = screen.getByText('描述');
      expect(description).toHaveAttribute('data-slot', 'card-description');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('应该正确渲染卡片内容区', () => {
      render(
        <Card>
          <CardContent>内容</CardContent>
        </Card>,
      );

      expect(screen.getByText('内容')).toHaveAttribute('data-slot', 'card-content');
    });

    it('应该正确渲染卡片底部', () => {
      render(
        <Card>
          <CardFooter>底部</CardFooter>
        </Card>,
      );

      expect(screen.getByText('底部')).toHaveAttribute('data-slot', 'card-footer');
    });

    it('应该正确渲染卡片操作区', () => {
      render(
        <Card>
          <CardAction>操作</CardAction>
        </Card>,
      );

      expect(screen.getByText('操作')).toHaveAttribute('data-slot', 'card-action');
    });

    it('应该正确合并自定义类名', () => {
      render(<Card className="custom-card">卡片</Card>);

      const card = screen.getByText('卡片');
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('bg-card');
    });
  });

  describe('状态测试', () => {
    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(<Card className="rounded-none">冲突</Card>);

      const card = screen.getByText('冲突');
      expect(card).toHaveClass('rounded-none');
      expect(card).not.toHaveClass('rounded-xl');
    });

    it('应该正确透传 data-state 状态属性', () => {
      render(<Card data-state="active">状态卡片</Card>);

      expect(screen.getByText('状态卡片')).toHaveAttribute('data-state', 'active');
    });

    it('应该正确透传 aria-invalid 无效态属性', () => {
      render(<Card aria-invalid="true">无效卡片</Card>);

      expect(screen.getByText('无效卡片')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('交互测试', () => {
    it('应该在点击卡片时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>可点击卡片</Card>);

      fireEvent.click(screen.getByText('可点击卡片'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该正确渲染完整的卡片组合结构', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>完整标题</CardTitle>
            <CardDescription>完整描述</CardDescription>
          </CardHeader>
          <CardContent>完整内容</CardContent>
          <CardFooter>完整底部</CardFooter>
        </Card>,
      );

      expect(screen.getByText('完整标题')).toBeInTheDocument();
      expect(screen.getByText('完整描述')).toBeInTheDocument();
      expect(screen.getByText('完整内容')).toBeInTheDocument();
      expect(screen.getByText('完整底部')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 card 语义角色', () => {
      render(
        <Card role="article" aria-label="文章卡片">
          文章卡片
        </Card>,
      );

      expect(screen.getByRole('article', { name: '文章卡片' })).toBeInTheDocument();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Card aria-label="信息卡片">内容</Card>);

      expect(screen.getByLabelText('信息卡片')).toBeInTheDocument();
    });

    it('应该透传 data-* 属性', () => {
      render(<Card data-testid="custom-card">内容</Card>);

      expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空卡片', () => {
      render(<Card aria-label="空卡片" />);

      expect(screen.getByLabelText('空卡片')).toHaveAttribute('data-slot', 'card');
    });

    it('应该允许渲染没有子组件的卡片头部', () => {
      render(
        <Card>
          <CardHeader />
        </Card>,
      );

      expect(document.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
    });

    it('应该允许渲染空字符串标题', () => {
      render(
        <Card>
          <CardTitle>{''}</CardTitle>
        </Card>,
      );

      expect(document.querySelector('[data-slot="card-title"]')).toBeEmptyDOMElement();
    });
  });
});
