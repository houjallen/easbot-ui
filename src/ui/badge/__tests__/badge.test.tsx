import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../badge';

/**
 * Badge 组件单元测试
 *
 * 📌 回归重点：圆点（dot）模式必须透传 `className` / 原生属性 / `ref`。
 *
 * ⚠️ **历史缺陷**：
 *    修复前 dot 分支直接 `return`，导致
 *    ① `className` 被静默吞掉（解构出来但从不使用）；
 *    ② 全部原生属性（`id` / `data-*` / `aria-*` / `onClick` / `title`）丢失；
 *    ③ `ref` 不挂载到任何节点。
 *    对比同文件的 count 分支 —— 三者都是支持的。
 */
describe('Badge', () => {
  describe('渲染测试', () => {
    it('渲染默认 Badge', () => {
      render(<Badge>测试徽章</Badge>);
      expect(screen.getByText('测试徽章')).toBeInTheDocument();
    });

    it('应该渲染数字角标', () => {
      render(<Badge count={5}>内容</Badge>);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('count 超过 overflowCount 应该显示溢出标记', () => {
      render(
        <Badge count={150} overflowCount={99}>
          内容
        </Badge>,
      );
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('count 为 0 且未开启 showZero 时不显示角标', () => {
      render(<Badge count={0}>内容</Badge>);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('dot 模式回归测试', () => {
    it('应该渲染圆点', () => {
      const { container } = render(<Badge dot>内容</Badge>);
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    });

    it('应该透传 className', () => {
      const { container } = render(
        <Badge dot className="custom-dot-badge">
          内容
        </Badge>,
      );
      // 📌 className 必须落在根节点上（消费方据此给外层容器定尺寸）
      expect(container.firstChild).toHaveClass('custom-dot-badge');
    });

    it('应该透传原生属性（id / data-* / aria-*）', () => {
      render(
        <Badge dot id="my-badge" data-testid="dot-badge" aria-label="状态标记">
          内容
        </Badge>,
      );
      const badge = screen.getByTestId('dot-badge');
      expect(badge).toHaveAttribute('id', 'my-badge');
      expect(badge).toHaveAttribute('aria-label', '状态标记');
    });

    it('应该透传事件处理器', () => {
      let clicked = false;
      render(
        <Badge dot onClick={() => (clicked = true)}>
          内容
        </Badge>,
      );
      screen.getByText('内容').click();
      expect(clicked).toBe(true);
    });

    it('应该挂载 ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Badge dot ref={ref}>
          内容
        </Badge>,
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current).not.toBeNull();
    });
  });

  describe('属性透传测试', () => {
    it('默认模式应该透传 className', () => {
      render(<Badge className="plain-badge">内容</Badge>);
      expect(screen.getByText('内容')).toHaveClass('plain-badge');
    });

    it('count 模式应该透传 className', () => {
      render(
        <Badge count={3} className="count-badge">
          内容
        </Badge>,
      );
      expect(screen.getByText('3')).toHaveClass('count-badge');
    });
  });
});
