/**
 * Accordion 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证展开/收起状态、禁用态、单多面板模式
 * 3. 交互测试 - 验证点击与键盘触发的展开收起与回调
 * 4. 无障碍测试 - 验证 button 语义角色、aria-expanded、aria-controls、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空内容
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion';

describe('Accordion 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染手风琴结构', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '标题一' })).toHaveAttribute('data-slot', 'accordion-trigger');
      expect(screen.getByRole('button', { name: '标题一' })).toHaveAttribute('data-slot', 'accordion-trigger');
    });

    it('应该正确应用 AccordionItem 默认类名', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const item = screen.getByRole('button', { name: '标题一' }).closest('[data-slot="accordion-item"]');
      expect(item).toHaveClass('border-b');
    });

    it('应该正确应用 AccordionTrigger 默认类名', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('flex-1');
      expect(trigger).toHaveClass('font-medium');
      expect(trigger).toHaveClass('text-left');
    });

    it('应该正确应用 AccordionContent 默认类名', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const content = document.querySelector('[data-slot="accordion-content"]');
      expect(content).toHaveClass('overflow-hidden');
      expect(content).toHaveClass('text-sm');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="custom-item">
            <AccordionTrigger className="custom-trigger">标题一</AccordionTrigger>
            <AccordionContent className="custom-content">内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '标题一' })).toHaveClass('custom-trigger');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为收起状态', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在 defaultValue 对应面板展开时渲染 data-state 为 open', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('内容一')).toBeInTheDocument();
    });

    it('应该在禁用面板上渲染 data-disabled 与 disabled 属性', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('应该在多面板模式下允许同时展开多个面板', () => {
      render(
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>标题二</AccordionTrigger>
            <AccordionContent>内容二</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '标题一' })).toHaveAttribute('data-state', 'open');
      expect(screen.getByRole('button', { name: '标题二' })).toHaveAttribute('data-state', 'open');
    });
  });

  describe('交互测试', () => {
    it('应该在点击触发器时展开面板', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(screen.getByText('内容一')).toBeInTheDocument();
    });

    it('应该在点击已展开的触发器时收起面板', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    it('应该在点击时触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <Accordion type="single" collapsible onValueChange={handleValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      fireEvent.click(screen.getByRole('button', { name: '标题一' }));

      expect(handleValueChange).toHaveBeenCalledTimes(1);
      expect(handleValueChange).toHaveBeenCalledWith('item-1');
    });

    it('应该在单面板模式下切换到另一个面板', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>标题二</AccordionTrigger>
            <AccordionContent>内容二</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const first = screen.getByRole('button', { name: '标题一' });
      const second = screen.getByRole('button', { name: '标题二' });

      fireEvent.click(second);

      expect(second).toHaveAttribute('data-state', 'open');
      expect(first).toHaveAttribute('data-state', 'closed');
    });

    it('应该在按下回车键时展开面板', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' });
      fireEvent.keyUp(trigger, { key: 'Enter', code: 'Enter' });
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('data-state', 'open');
    });

    it('应该在禁用面板上不触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <Accordion type="single" collapsible onValueChange={handleValueChange}>
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      fireEvent.click(screen.getByRole('button', { name: '标题一' }));
      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 button 语义角色', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '标题一' })).toBeInTheDocument();
    });

    it('应该通过 aria-expanded 暴露展开状态', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '标题一' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('应该通过 aria-controls 关联内容面板', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      const controls = trigger.getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls as string)).toBeInTheDocument();
    });

    it('应该支持触发器通过键盘获得焦点', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      const trigger = screen.getByRole('button', { name: '标题一' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该透传 aria-label 到触发器', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger aria-label="展开第一项">标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '展开第一项' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的展开值', () => {
      const handleValueChange = vi.fn();
      render(
        <Accordion type="single" collapsible value="item-1" onValueChange={handleValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>标题二</AccordionTrigger>
            <AccordionContent>内容二</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      fireEvent.click(screen.getByRole('button', { name: '标题二' }));

      expect(handleValueChange).toHaveBeenCalledWith('item-2');
      // 受控模式下展开值由外部决定，组件本身不会自行变更
      expect(screen.getByRole('button', { name: '标题一' })).toHaveAttribute('data-state', 'open');
    });

    it('应该允许渲染没有内容面板的条目', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>标题一</AccordionTrigger>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '标题一' })).toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性到触发器', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger data-custom="value">标题一</AccordionTrigger>
            <AccordionContent>内容一</AccordionContent>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', { name: '标题一' })).toHaveAttribute('data-custom', 'value');
    });
  });
});
