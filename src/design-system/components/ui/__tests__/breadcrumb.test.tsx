/**
 * Breadcrumb 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证面包屑各子组件的渲染与类名
 * 2. 状态测试 - 验证当前页状态与自定义类名覆盖
 * 3. 交互测试 - 验证点击回调与 asChild 渲染模式
 * 4. 无障碍测试 - 验证导航语义、当前页标记与隐藏装饰
 * 5. 边界测试 - 验证省略号分隔符、自定义分隔符、空列表等场景
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../breadcrumb';

describe('Breadcrumb 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染面包屑导航', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>首页</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      const nav = screen.getByRole('navigation', { name: '面包屑导航' });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('data-slot', 'breadcrumb');
    });

    it('应该正确渲染面包屑列表', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>首页</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('data-slot', 'breadcrumb-list');
      expect(list).toHaveClass('flex');
      expect(list).toHaveClass('flex-wrap');
      expect(list).toHaveClass('text-muted-foreground');
    });

    it('应该正确渲染面包屑项', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>首页</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(screen.getByRole('listitem')).toHaveAttribute('data-slot', 'breadcrumb-item');
    });

    it('应该正确渲染面包屑链接', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home">首页</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      const link = screen.getByRole('link', { name: '首页' });
      expect(link).toHaveAttribute('data-slot', 'breadcrumb-link');
      expect(link).toHaveAttribute('href', '/home');
    });

    it('应该正确渲染当前页面', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>详情</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      const page = screen.getByText('详情');
      expect(page).toHaveAttribute('data-slot', 'breadcrumb-page');
      expect(page).toHaveAttribute('aria-current', 'page');
    });

    it('应该正确渲染分隔符', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>,
      );

      const separator = document.querySelector('[data-slot="breadcrumb-separator"]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });

    it('应该正确渲染省略号', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbEllipsis />
          </BreadcrumbList>
        </Breadcrumb>,
      );

      const ellipsis = document.querySelector('[data-slot="breadcrumb-ellipsis"]');
      expect(ellipsis).toBeInTheDocument();
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <BreadcrumbList className="custom-list">
          <BreadcrumbItem>首页</BreadcrumbItem>
        </BreadcrumbList>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('custom-list');
      expect(list).toHaveClass('flex');
    });
  });

  describe('状态测试', () => {
    it('应该正确透传分隔符的 role 属性', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(document.querySelector('[data-slot="breadcrumb-separator"]')).toHaveAttribute('role', 'presentation');
    });

    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(
        <BreadcrumbList className="flex-col">
          <BreadcrumbItem>首页</BreadcrumbItem>
        </BreadcrumbList>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('flex-col');
      expect(list).not.toHaveClass('flex-row');
    });
  });

  describe('交互测试', () => {
    it('应该在点击链接时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" onClick={handleClick}>
                首页
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      fireEvent.click(screen.getByRole('link', { name: '首页' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在 asChild 模式下渲染子元素而非 a', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button type="button">自定义按钮</button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      const button = screen.getByRole('button', { name: '自定义按钮' });
      expect(button).toHaveAttribute('data-slot', 'breadcrumb-link');
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('应该在 asChild 模式下仍能触发点击回调', () => {
      const handleClick = vi.fn();
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild onClick={handleClick}>
                <button type="button">自定义按钮</button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      fireEvent.click(screen.getByRole('button', { name: '自定义按钮' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 navigation 语义角色并带有可访问名称', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>首页</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(screen.getByRole('navigation', { name: '面包屑导航' })).toBeInTheDocument();
    });

    it('应该以 aria-current 标注当前页面而非暴露 link 语义角色', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>详情</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      // 当前页不可点击，组件刻意不使用 role="link"（避免引入不可聚焦的交互角色），
      // 仅以 aria-current 标注当前页语义。
      expect(screen.getByText('详情')).toHaveAttribute('aria-current', 'page');
      expect(screen.queryByRole('link', { name: '详情' })).not.toBeInTheDocument();
    });

    it('应该隐藏省略号的装饰性内容', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbEllipsis />
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(screen.getByText('更多')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="breadcrumb-ellipsis"]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('应该透传 data-* 属性', () => {
      render(
        <Breadcrumb data-testid="custom-breadcrumb">
          <BreadcrumbList>
            <BreadcrumbItem>首页</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(screen.getByTestId('custom-breadcrumb')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的面包屑列表', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList />
        </Breadcrumb>,
      );

      expect(screen.getByRole('list')).toBeEmptyDOMElement();
    });

    it('应该允许渲染自定义分隔符内容', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('应该允许渲染没有 href 的面包屑链接', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>无链接地址</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(screen.getByText('无链接地址')).not.toHaveAttribute('href');
    });

    it('应该允许渲染没有文字的当前页面', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage aria-label="当前页" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
      );

      expect(screen.getByLabelText('当前页')).toHaveAttribute('aria-current', 'page');
    });
  });
});
