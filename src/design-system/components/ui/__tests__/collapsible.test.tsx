/**
 * Collapsible 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与 data-slot
 * 2. 状态测试 - 验证展开/收起状态、禁用态
 * 3. 交互测试 - 验证点击与键盘触发的展开收起与回调
 * 4. 无障碍测试 - 验证 button 语义角色、aria-expanded、aria-controls、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空内容
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible';

describe('Collapsible 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染折叠面板结构', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByRole('button', { name: '展开' })).toHaveAttribute('data-slot', 'collapsible-trigger');
    });

    it('应该正确渲染根容器与内容面板', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(document.querySelector('[data-slot="collapsible"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="collapsible-content"]')).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger className="custom-trigger">展开</CollapsibleTrigger>
          <CollapsibleContent className="custom-content">折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByRole('button', { name: '展开' })).toHaveClass('custom-trigger');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为收起状态', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在默认展开状态下渲染 data-state 为 open', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('折叠内容')).toBeInTheDocument();
    });

    it('应该在禁用触发器上渲染 data-disabled 与 disabled 属性', () => {
      render(
        <Collapsible disabled>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      // Radix 的禁用态由 Collapsible 根节点的 `disabled` 上下文决定，
      // 触发器与内容面板都会继承 `data-disabled`。
      const trigger = screen.getByRole('button', { name: '展开' });
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在收起状态下不渲染内容面板', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.queryByText('折叠内容')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时展开内容', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(screen.getByText('折叠内容')).toBeInTheDocument();
    });

    it('应该在点击已展开的触发器时收起内容', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    it('应该在点击时触发 open 变更回调', () => {
      const handleOpenChange = vi.fn();
      render(
        <Collapsible onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      fireEvent.click(screen.getByRole('button', { name: '展开' }));

      expect(handleOpenChange).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('应该在再次点击时回调传出 false', () => {
      const handleOpenChange = vi.fn();
      render(
        <Collapsible defaultOpen onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      fireEvent.click(screen.getByRole('button', { name: '展开' }));

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('应该在按下空格键时展开内容', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      trigger.focus();
      // Radix 的 CollapsibleTrigger 只监听 `click`；真实浏览器在空格键上会合成 click 事件，
      // jsdom 不会合成，因此这里显式模拟浏览器的行为。
      fireEvent.keyDown(trigger, { key: ' ', code: 'Space' });
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('data-state', 'open');
    });

    it('应该在禁用触发器上不触发回调', () => {
      const handleOpenChange = vi.fn();
      render(
        <Collapsible onOpenChange={handleOpenChange}>
          <CollapsibleTrigger disabled>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      fireEvent.click(screen.getByRole('button', { name: '展开' }));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 button 语义角色', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByRole('button', { name: '展开' })).toBeInTheDocument();
    });

    it('应该通过 aria-expanded 暴露展开状态', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByRole('button', { name: '展开' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该通过 aria-controls 关联内容面板', () => {
      render(
        <Collapsible defaultOpen>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      const controls = trigger.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).toBeInTheDocument();
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该透传 aria-label 到触发器', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger aria-label="展开详情">展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByRole('button', { name: '展开详情' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的展开状态', () => {
      const handleOpenChange = vi.fn();
      render(
        <Collapsible open={false} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      const trigger = screen.getByRole('button', { name: '展开' });
      fireEvent.click(trigger);

      expect(handleOpenChange).toHaveBeenCalledWith(true);
      // 受控模式下展开状态由外部决定，组件本身不会自行变更
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    it('应该允许渲染没有内容面板的折叠面板', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>展开</CollapsibleTrigger>
        </Collapsible>,
      );

      expect(screen.getByRole('button', { name: '展开' })).toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger data-custom="value">展开</CollapsibleTrigger>
          <CollapsibleContent>折叠内容</CollapsibleContent>
        </Collapsible>,
      );

      expect(screen.getByRole('button', { name: '展开' })).toHaveAttribute('data-custom', 'value');
    });
  });
});
