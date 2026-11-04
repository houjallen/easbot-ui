import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tag } from '../tag';

/**
 * Tag 组件单元测试
 *
 * 📌 回归重点：`asChild` 路径必须能正常渲染。
 *
 * ⚠️ **历史缺陷**：
 *    修复前 `asChild` 分支把 `{icon}` / `{children}` / `{closable 按钮}` 三个兄弟节点
 *    直接作为 Radix `Slot` 的 children，而 `Slot` 要求**单个** React 元素子节点，
 *    于是运行时抛错：
 *    `Slot failed to slot onto its children. Expected a single React element child or \`Slottable\`.`
 */
describe('Tag', () => {
  describe('渲染测试', () => {
    it('应该渲染标签文本', () => {
      render(<Tag>测试标签</Tag>);
      expect(screen.getByText('测试标签')).toBeInTheDocument();
    });

    it('应该渲染图标', () => {
      render(<Tag icon={<span data-testid="tag-icon">★</span>}>带图标</Tag>);
      expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
    });

    it('应该渲染关闭按钮', () => {
      render(<Tag closable>可关闭</Tag>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('应该透传 className', () => {
      const { container } = render(<Tag className="custom-tag">自定义</Tag>);
      // 📌 className 落在**根节点**上（文本节点在内层 span）
      expect(container.firstChild).toHaveClass('custom-tag');
    });
  });

  describe('asChild 回归测试', () => {
    it('应该把 props 合并到子元素而不是抛错', () => {
      // 📌 修复前：Slot 因多子节点抛错 → 渲染直接失败
      expect(() =>
        render(
          <Tag asChild>
            <a href="/target">链接标签</a>
          </Tag>,
        ),
      ).not.toThrow();
    });

    it('应该把子元素渲染为标签本体（而非多包裹一层 span）', () => {
      render(
        <Tag asChild>
          <a href="/target">链接标签</a>
        </Tag>,
      );
      const link = screen.getByRole('link', { name: '链接标签' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/target');
    });

    it('应该把 className 合并到渲染出的标签根节点', () => {
      const { container } = render(
        <Tag asChild className="as-child-tag">
          <a href="/target">链接标签</a>
        </Tag>,
      );
      // 📌 Radix `Slot` 把 props 合并到**单个**子元素上 ——
      //    本组件用 `<span>` 包裹内容以满足 Slot 的单子元素约束，
      //    因此 className 落在这个包裹层（也是标签的根节点）。
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('as-child-tag');
      // 📌 内容仍在包裹层内
      expect(root.querySelector('a')).toHaveAttribute('href', '/target');
    });

    it('带 closable 的 asChild 也不应抛错', () => {
      expect(() =>
        render(
          <Tag asChild closable>
            <a href="/target">可关闭链接</a>
          </Tag>,
        ),
      ).not.toThrow();
    });

    it('带 icon 的 asChild 也不应抛错', () => {
      expect(() =>
        render(
          <Tag asChild icon={<span>★</span>}>
            <a href="/target">带图标链接</a>
          </Tag>,
        ),
      ).not.toThrow();
    });
  });

  describe('交互测试', () => {
    it('点击关闭按钮应该触发 onClose', () => {
      let closed = false;
      render(
        <Tag closable onClose={() => (closed = true)}>
          可关闭
        </Tag>,
      );
      screen.getByRole('button').click();
      expect(closed).toBe(true);
    });
  });

  describe('无障碍测试', () => {
    it('关闭按钮应该有可访问名称', () => {
      render(<Tag closable>可关闭</Tag>);
      expect(screen.getByRole('button')).toHaveAccessibleName();
    });
  });
});
