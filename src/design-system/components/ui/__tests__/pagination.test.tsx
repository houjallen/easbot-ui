/**
 * Pagination 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证分页各子组件的渲染与类名
 * 2. 状态测试 - 验证当前页激活态与自定义类名覆盖
 * 3. 交互测试 - 验证点击回调与页码链接跳转
 * 4. 无障碍测试 - 验证导航语义、当前页标记与隐藏省略号
 * 5. 边界测试 - 验证空内容、自定义文案、缺省 size 等场景
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../pagination';

describe('Pagination 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染分页导航', () => {
      render(
        <Pagination>
          <PaginationContent />
        </Pagination>,
      );

      const nav = screen.getByRole('navigation', { name: '分页导航' });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('data-slot', 'pagination');
    });

    it('应该正确渲染分页内容列表', () => {
      render(
        <Pagination>
          <PaginationContent />
        </Pagination>,
      );

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('data-slot', 'pagination-content');
      expect(list).toHaveClass('flex');
      expect(list).toHaveClass('flex-row');
    });

    it('应该正确渲染分页项', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByRole('listitem')).toHaveAttribute('data-slot', 'pagination-item');
    });

    it('应该正确渲染页码链接', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const link = screen.getByRole('link', { name: '1' });
      expect(link).toHaveAttribute('data-slot', 'pagination-link');
      expect(link).toHaveAttribute('href', '/page/1');
      expect(link).toHaveClass('size-9');
    });

    it('应该正确渲染上一页链接', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const previous = screen.getByRole('link', { name: '转到上一页' });
      expect(previous).toHaveAttribute('data-slot', 'pagination-link');
      expect(previous).toHaveTextContent('上一页');
    });

    it('应该正确渲染下一页链接', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const next = screen.getByRole('link', { name: '转到下一页' });
      expect(next).toHaveAttribute('data-slot', 'pagination-link');
      expect(next).toHaveTextContent('下一页');
    });

    it('应该正确渲染省略号', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const ellipsis = document.querySelector('[data-slot="pagination-ellipsis"]');
      expect(ellipsis).toBeInTheDocument();
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Pagination className="custom-pagination">
          <PaginationContent />
        </Pagination>,
      );

      const nav = screen.getByRole('navigation', { name: '分页导航' });
      expect(nav).toHaveClass('custom-pagination');
      expect(nav).toHaveClass('mx-auto');
    });
  });

  describe('状态测试', () => {
    it('应该在激活页设置 aria-current 属性', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const link = screen.getByRole('link', { name: '1' });
      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveAttribute('data-active', 'true');
    });

    it('应该在非激活页不设置 aria-current 属性', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/2">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const link = screen.getByRole('link', { name: '2' });
      expect(link).not.toHaveAttribute('aria-current');
      expect(link).toHaveAttribute('data-active', 'false');
    });

    it('应该在激活页应用 outline 变体类名', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const link = screen.getByRole('link', { name: '1' });
      expect(link).toHaveClass('border');
      expect(link).toHaveClass('bg-background');
    });

    it('应该在非激活页应用 ghost 变体类名', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/2">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      const link = screen.getByRole('link', { name: '2' });
      expect(link).toHaveClass('hover:bg-accent');
    });

    it('应该在自定义类名与基础类名冲突时保留自定义类名', () => {
      render(
        <Pagination className="flex-row">
          <PaginationContent />
        </Pagination>,
      );

      const nav = screen.getByRole('navigation', { name: '分页导航' });
      expect(nav).toHaveClass('flex-row');
      expect(nav).not.toHaveClass('flex-col');
    });
  });

  describe('交互测试', () => {
    it('应该在点击页码链接时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" onClick={handleClick}>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      fireEvent.click(screen.getByRole('link', { name: '1' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在点击上一页时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" onClick={handleClick} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      fireEvent.click(screen.getByRole('link', { name: '转到上一页' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在点击下一页时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" onClick={handleClick} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      fireEvent.click(screen.getByRole('link', { name: '转到下一页' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在更新时替换页码内容', () => {
      const { rerender } = render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();

      rerender(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/2">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      expect(screen.getByRole('link', { name: '2' })).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 navigation 语义角色并带有可访问名称', () => {
      render(
        <Pagination>
          <PaginationContent />
        </Pagination>,
      );

      expect(screen.getByRole('navigation', { name: '分页导航' })).toBeInTheDocument();
    });

    it('应该为上一页与下一页提供可访问名称', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByRole('link', { name: '转到上一页' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '转到下一页' })).toBeInTheDocument();
    });

    it('应该隐藏省略号的装饰性内容', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByText('更多页')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="pagination-ellipsis"]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('应该透传 data-* 属性', () => {
      render(
        <Pagination data-testid="custom-pagination">
          <PaginationContent />
        </Pagination>,
      );

      expect(screen.getByTestId('custom-pagination')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的分页内容', () => {
      render(
        <Pagination>
          <PaginationContent />
        </Pagination>,
      );

      expect(screen.getByRole('list')).toBeEmptyDOMElement();
    });

    it('应该允许渲染自定义的上一页文案', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0">上页</PaginationPrevious>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByRole('link', { name: '转到上一页' })).toHaveTextContent('上页');
    });

    it('应该允许渲染自定义的下一页文案', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2">下页</PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByRole('link', { name: '转到下一页' })).toHaveTextContent('下页');
    });

    it('应该允许渲染没有 href 的页码链接', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink>无地址</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByText('无地址')).not.toHaveAttribute('href');
    });

    it('应该允许渲染自定义的省略号文案', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis>更多</PaginationEllipsis>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );

      expect(screen.getByText('更多')).toBeInTheDocument();
    });
  });
});
