/**
 * Tabs 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证标签页结构与内容渲染
 * 2. 交互测试 - 验证标签切换行为
 * 3. 状态测试 - 验证禁用态与垂直布局
 * 4. 无障碍测试 - 验证 tab / tablist / tabpanel 语义角色
 *
 * 说明：Radix 的 `TabsTrigger` 通过 `onMouseDown`（且 `button === 0`）激活标签，
 * 而不是 `onClick` —— 这样可以避免拖动文本时误触发切换。
 * 因此测试必须派发 `mouseDown` 才能命中真实的激活路径。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

/**
 * 激活标签
 *
 * @description
 * Radix 的 `TabsTrigger` 通过 `onMouseDown`（且 `button === 0`）激活标签，
 * 而不是 `onClick` —— 这样可以避免拖动文本时误触发切换。
 * 因此测试必须派发 `mouseDown` 才能命中真实的激活路径。
 */
const activateTab = (tab: HTMLElement): void => {
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
};

describe('Tabs 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    it('应正确渲染标签页结构', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">标签1</TabsTrigger>
            <TabsTrigger value="tab2">标签2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">内容1</TabsContent>
          <TabsContent value="tab2">内容2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '标签1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '标签2' })).toBeInTheDocument();
      expect(screen.getByText('内容1')).toBeInTheDocument();
    });

    it('应默认激活defaultValue对应的标签', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">标签1</TabsTrigger>
            <TabsTrigger value="tab2">标签2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">内容1</TabsContent>
          <TabsContent value="tab2">内容2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tab', { name: '标签1' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: '标签2' })).toHaveAttribute('aria-selected', 'false');
    });
  });

  // 交互测试
  describe('交互测试', () => {
    it('应正确切换标签内容', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">标签1</TabsTrigger>
            <TabsTrigger value="tab2">标签2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">内容1</TabsContent>
          <TabsContent value="tab2">内容2</TabsContent>
        </Tabs>,
      );

      activateTab(screen.getByRole('tab', { name: '标签2' }));

      expect(screen.getByText('内容2')).toBeInTheDocument();
      expect(screen.queryByText('内容1')).not.toBeInTheDocument();
    });
  });

  // 状态测试
  describe('状态测试', () => {
    it('应禁用交互', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1" disabled>
              禁用标签
            </TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      expect(screen.getByRole('tab', { name: '禁用标签' })).toBeDisabled();
    });

    it('应支持垂直布局', () => {
      const { container } = render(
        <Tabs orientation="vertical">
          <TabsList className="flex-col" />
        </Tabs>,
      );
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应包含正确的ARIA属性', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="test">测试标签</TabsTrigger>
          </TabsList>
        </Tabs>,
      );
      expect(screen.getByRole('tab')).toHaveAttribute('aria-selected');
    });

    it('应暴露tabpanel语义角色', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">标签1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">内容1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });
});
