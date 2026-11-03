/**
 * Tabs 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证激活态、禁用态
 * 3. 交互测试 - 验证点击与方向键触发的标签切换与回调
 * 4. 无障碍测试 - 验证 tab/tablist/tabpanel 语义角色、aria-selected、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、空标签列表
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

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
  describe('渲染测试', () => {
    it('应该正确渲染标签页结构', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList aria-label="设置分类">
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tab', { name: '账号' })).toHaveAttribute('data-slot', 'tabs-trigger');
      expect(screen.getByRole('tablist', { name: '设置分类' })).toHaveAttribute('data-slot', 'tabs-list');
      expect(screen.getByRole('tabpanel')).toHaveAttribute('data-slot', 'tabs-content');
    });

    it('应该正确应用 TabsList 默认类名', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      const list = screen.getByRole('tablist');
      expect(list).toHaveClass('inline-flex');
      expect(list).toHaveClass('h-9');
      expect(list).toHaveClass('rounded-lg');
      expect(list).toHaveClass('bg-muted');
      expect(list).toHaveClass('text-muted-foreground');
    });

    it('应该正确应用 TabsTrigger 默认类名', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      const trigger = screen.getByRole('tab', { name: '账号' });
      expect(trigger).toHaveClass('inline-flex');
      expect(trigger).toHaveClass('rounded-md');
      expect(trigger).toHaveClass('border');
      expect(trigger).toHaveClass('border-transparent');
      expect(trigger).toHaveClass('text-foreground');
    });

    it('应该正确应用 TabsContent 默认类名', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tabpanel')).toHaveClass('flex-1');
      expect(screen.getByRole('tabpanel')).toHaveClass('outline-none');
    });

    it('应该正确合并自定义类名', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList className="custom-list">
            <TabsTrigger value="account" className="custom-trigger">
              账号
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tablist')).toHaveClass('custom-list');
      expect(screen.getByRole('tab', { name: '账号' })).toHaveClass('custom-trigger');
    });
  });

  describe('状态测试', () => {
    it('应该默认激活 defaultValue 对应的标签', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
          <TabsContent value="security">安全面板</TabsContent>
        </Tabs>,
      );

      const account = screen.getByRole('tab', { name: '账号' });
      const security = screen.getByRole('tab', { name: '安全' });

      expect(account).toHaveAttribute('data-state', 'active');
      expect(account).toHaveAttribute('aria-selected', 'true');
      expect(security).toHaveAttribute('data-state', 'inactive');
      expect(security).toHaveAttribute('aria-selected', 'false');
    });

    it('应该只渲染激活标签对应的内容面板', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
          <TabsContent value="security">安全面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tabpanel')).toHaveTextContent('账号面板');
      expect(screen.queryByText('安全面板')).not.toBeInTheDocument();
    });

    it('应该在禁用标签上渲染 data-disabled 与 disabled 属性', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security" disabled>
              安全
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      const security = screen.getByRole('tab', { name: '安全' });
      expect(security).toBeDisabled();
      expect(security).toHaveAttribute('data-disabled');
      expect(security).toHaveAttribute('aria-selected', 'false');
    });

    it('应该在激活标签上应用 data-[state=active] 状态类名', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tab', { name: '账号' })).toHaveClass('data-[state=active]:bg-background');
    });
  });

  describe('交互测试', () => {
    it('应该在点击标签时触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <Tabs onValueChange={handleValueChange} defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
          <TabsContent value="security">安全面板</TabsContent>
        </Tabs>,
      );

      activateTab(screen.getByRole('tab', { name: '安全' }));

      expect(handleValueChange).toHaveBeenCalledTimes(1);
      expect(handleValueChange).toHaveBeenCalledWith('security');
    });

    it('应该在点击后切换激活标签与内容面板', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
          <TabsContent value="security">安全面板</TabsContent>
        </Tabs>,
      );

      const security = screen.getByRole('tab', { name: '安全' });
      activateTab(security);

      expect(security).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('安全面板');
    });

    it('应该在按下右方向键时激活下一个标签', async () => {
      const handleValueChange = vi.fn();
      render(
        <Tabs onValueChange={handleValueChange} defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
          <TabsContent value="security">安全面板</TabsContent>
        </Tabs>,
      );

      const account = screen.getByRole('tab', { name: '账号' });
      account.focus();
      fireEvent.keyDown(account, { key: 'ArrowRight' });

      // Radix 的 roving focus 通过 setTimeout 异步移动焦点，
      // 焦点落位后触发 Tabs 的 onFocus → 自动激活 → onValueChange
      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('security');
      });
    });

    it('应该在按下左方向键时激活上一个标签', async () => {
      const handleValueChange = vi.fn();
      render(
        <Tabs onValueChange={handleValueChange} defaultValue="security">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
          <TabsContent value="security">安全面板</TabsContent>
        </Tabs>,
      );

      const security = screen.getByRole('tab', { name: '安全' });
      security.focus();
      fireEvent.keyDown(security, { key: 'ArrowLeft' });

      // Radix 的 roving focus 通过 setTimeout 异步移动焦点，
      // 焦点落位后触发 Tabs 的 onFocus → 自动激活 → onValueChange
      await waitFor(() => {
        expect(handleValueChange).toHaveBeenCalledWith('account');
      });
    });

    it('应该在禁用标签上不触发值变更回调', () => {
      const handleValueChange = vi.fn();
      render(
        <Tabs onValueChange={handleValueChange} defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security" disabled>
              安全
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      activateTab(screen.getByRole('tab', { name: '安全' }));
      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 tablist 语义角色', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('应该暴露 tab 与 tabpanel 语义角色', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tab', { name: '账号' })).toBeInTheDocument();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('应该通过 aria-selected 暴露标签的激活状态', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tab', { name: '账号' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: '安全' })).toHaveAttribute('aria-selected', 'false');
    });

    it('应该支持标签通过键盘获得焦点', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      const trigger = screen.getByRole('tab', { name: '账号' });
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('应该透传 aria-label 到标签列表', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList aria-label="设置分类">
            <TabsTrigger value="account">账号</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tablist', { name: '设置分类' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的值', () => {
      const handleValueChange = vi.fn();
      render(
        <Tabs value="account" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="account">账号</TabsTrigger>
            <TabsTrigger value="security">安全</TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
          <TabsContent value="security">安全面板</TabsContent>
        </Tabs>,
      );

      activateTab(screen.getByRole('tab', { name: '安全' }));

      expect(handleValueChange).toHaveBeenCalledWith('security');
      // 受控模式下激活值由外部决定，组件本身不会自行变更
      expect(screen.getByRole('tab', { name: '账号' })).toHaveAttribute('data-state', 'active');
    });

    it('应该允许渲染没有标签列表的标签页', () => {
      render(
        <Tabs defaultValue="account">
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tabpanel')).toHaveTextContent('账号面板');
    });

    it('应该透传额外的 data-* 属性到标签触发器', () => {
      render(
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account" data-custom="value">
              账号
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">账号面板</TabsContent>
        </Tabs>,
      );

      expect(screen.getByRole('tab', { name: '账号' })).toHaveAttribute('data-custom', 'value');
    });
  });
});
