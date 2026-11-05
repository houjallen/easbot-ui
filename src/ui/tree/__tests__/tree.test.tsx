/**
 * Tree 组件单元测试
 *
 * @description
 * 断言以组件真实 DOM 结构为准：
 * 1. 节点行为 `<div role="button">` 承载选中态（选中时附加 `bg-accent`）；
 * 2. 展开/折叠由节点行内首个 `<button>`（折叠触发器）驱动；
 * 3. 单选模式下**默认仅叶子节点可选**（`allowNonLeafSelection` 默认为 false），
 *    父节点需显式开启 `allowNonLeafSelection` 才可被选中。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, vi } from 'vitest';
import { Tree } from '../tree';
import type { TreeNodeData } from '../tree';

const testTreeData: TreeNodeData[] = [
  {
    id: '1',
    name: 'Parent 1',
    iconName: 'folder',
    children: [
      { id: '1-1', name: 'Child 1.1', iconName: 'file' },
      { id: '1-2', name: 'Child 1.2', iconName: 'file' },
    ],
  },
  {
    id: '2',
    name: 'Parent 2',
    iconName: 'folder',
  },
];

describe('Tree 组件', () => {
  test('应正确渲染初始节点', () => {
    render(<Tree data={testTreeData} />);
    expect(screen.getByText('Parent 1')).toBeInTheDocument();
    expect(screen.getByText('Parent 2')).toBeInTheDocument();
    expect(screen.queryByText('Child 1.1')).not.toBeInTheDocument();
  });

  test('点击叶子节点应能选中', () => {
    const handleSelect = vi.fn();
    render(<Tree data={testTreeData} initialExpandedIds={new Set(['1'])} onSelectChange={handleSelect} />);

    const childNode = screen.getByText('Child 1.1');
    fireEvent.click(childNode);

    // 选中样式挂在节点行为容器上
    expect(childNode.closest('div[role="button"]')).toHaveClass('bg-accent');
    // 回调携带被选中的节点数据
    expect(handleSelect).toHaveBeenCalledWith(testTreeData[0]?.children?.[0]);
  });

  test('默认模式下父节点不可选中', () => {
    const handleSelect = vi.fn();
    render(<Tree data={testTreeData} onSelectChange={handleSelect} />);

    const parent1Node = screen.getByText('Parent 1');
    fireEvent.click(parent1Node);

    expect(parent1Node.closest('div[role="button"]')).not.toHaveClass('bg-accent');
    expect(handleSelect).not.toHaveBeenCalled();
  });

  test('开启 allowNonLeafSelection 后父节点可被选中', () => {
    const handleSelect = vi.fn();
    render(<Tree data={testTreeData} allowNonLeafSelection onSelectChange={handleSelect} />);

    const parent1Node = screen.getByText('Parent 1');
    fireEvent.click(parent1Node);

    expect(parent1Node.closest('div[role="button"]')).toHaveClass('bg-accent');
    expect(handleSelect).toHaveBeenCalledWith(testTreeData[0]);
  });

  test('点击 chevron 应能展开/折叠子节点', () => {
    render(<Tree data={testTreeData} />);
    const parent1Node = screen.getByText('Parent 1');
    const row = parent1Node.closest('div');
    const triggerDiv = row?.firstElementChild;

    expect(triggerDiv).toBeInTheDocument();
    fireEvent.click(triggerDiv!);

    expect(screen.getByText('Child 1.1')).toBeInTheDocument();
    expect(screen.getByText('Child 1.2')).toBeInTheDocument();

    fireEvent.click(triggerDiv!);
    expect(screen.queryByText('Child 1.1')).not.toBeInTheDocument();
  });

  test('应支持不可选模式', () => {
    const handleSelect = vi.fn();
    render(<Tree data={testTreeData} isSelectable={false} onSelectChange={handleSelect} />);
    const parent1Node = screen.getByText('Parent 1');
    fireEvent.click(parent1Node);
    expect(parent1Node.closest('div')).not.toHaveClass('bg-accent');
    expect(handleSelect).not.toHaveBeenCalled();
  });

  /**
   * 禁用节点与配合图标
   *
   * @description
   * 回归背景：禁用节点的两个前置图标原来一个是不带 `disabled` 的手写 button、
   * 一个是带 `tabIndex=0` 的裸 SVG（恒 `cursor-pointer`），
   * 只靠「回调内 return」拦业务逻辑 —— 仍可点击、可聚焦、
   * 鼠标点击后出现浏览器默认焦点方框（看起来像 border）。
   * 现统一改用 `IconButton`：ghost 无边框 + 原生 `disabled`。
   */
  describe('禁用节点与配合图标', () => {
    const disabledTreeData: TreeNodeData[] = [
      {
        id: 'd1',
        name: 'Disabled Parent',
        iconName: 'folder',
        disabled: true,
        children: [{ id: 'd1-1', name: 'Hidden Child' }],
      },
    ];

    test('禁用节点的两个图标按钮应原生 disabled、not-allowed 且无 border', () => {
      render(<Tree data={disabledTreeData} />);
      const row = screen.getByText('Disabled Parent').closest('div[role="button"]');
      const iconButtons = row?.querySelectorAll('button');

      // 展开箭头 + 节点图标，均应为 IconButton
      expect(iconButtons).toHaveLength(2);
      iconButtons?.forEach((button) => {
        expect(button).toBeDisabled();
        expect(button).toHaveClass('cursor-not-allowed');
        // IconButton 是 ghost：默认无 border，焦点用 outline 而非浏览器默认方框
        expect(button.className).not.toMatch(/(^|\s)border(\s|$)/);
        expect(button).toHaveClass('outline-none');
      });

      expect(row).toHaveClass('cursor-not-allowed');
      expect(row).not.toHaveClass('cursor-pointer');
      expect(row).not.toHaveClass('hover:bg-accent');
    });

    test('点击禁用节点的展开图标不应展开子节点', () => {
      render(<Tree data={disabledTreeData} />);
      const row = screen.getByText('Disabled Parent').closest('div[role="button"]');

      const expandButton = row?.querySelectorAll('button')[0];
      expect(expandButton).toBeInTheDocument();
      fireEvent.click(expandButton as HTMLElement);
      expect(screen.queryByText('Hidden Child')).not.toBeInTheDocument();
    });

    test('点击禁用节点的图标与行都不应触发 onSelectChange', () => {
      const handleSelect = vi.fn();
      render(<Tree data={disabledTreeData} onSelectChange={handleSelect} allowNonLeafSelection />);
      const row = screen.getByText('Disabled Parent').closest('div[role="button"]')!;
      const nodeIconButton = row.querySelectorAll('button')[1];

      fireEvent.click(nodeIconButton!);
      fireEvent.click(row);
      fireEvent.keyDown(row, { key: 'Enter' });

      expect(handleSelect).not.toHaveBeenCalled();
      expect(row).not.toHaveClass('bg-accent');
    });

    test('可用节点的图标按钮不应 disabled', () => {
      render(<Tree data={testTreeData} />);
      const row = screen.getByText('Parent 1').closest('div[role="button"]');
      const iconButtons = row?.querySelectorAll('button');

      expect(iconButtons).toHaveLength(2);
      iconButtons?.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    test('真禁用节点应标记 aria-disabled 且无悬停反馈', () => {
      render(<Tree data={disabledTreeData} />);
      const row = screen.getByText('Disabled Parent').closest('div[role="button"]');

      expect(row).toHaveAttribute('aria-disabled', 'true');
      expect(row).toHaveClass('opacity-50');
      expect(row).not.toHaveAttribute('data-unselectable');
      expect(row).not.toHaveClass('hover:bg-accent');
    });

    /**
     * 「不可选中」与「禁用」必须是两种状态
     *
     * @description
     * 回归背景：有子节点且 `allowNonLeafSelection=false` 时父节点「不可选中」，
     * 但它**没有禁用**（仍可展开、仍可读）。此前用 `aria-disabled` 表达「不可选中」，
     * 导致屏幕阅读器播报「不可用」、光标变 `not-allowed`，宿主若再按 `aria-disabled`
     * 上样式，整行 label 会变成禁用灰 —— 就是截图里「父节点没禁用、label 却是禁用态」。
     */
    test('未禁用但「不可选中」的父节点不得显示禁用视觉', () => {
      render(<Tree data={testTreeData} />);
      const row = screen.getByText('Parent 1').closest('div[role="button"]');

      expect(row).toHaveAttribute('data-unselectable', 'true');
      expect(row).not.toHaveAttribute('aria-disabled');
      expect(row).not.toHaveClass('opacity-50');
      expect(row).not.toHaveClass('cursor-not-allowed');
      // 点击无动作 → 不给 hover 高亮，也不显示 pointer
      expect(row).not.toHaveClass('hover:bg-accent');
      // label 自身不得携带任何禁用样式
      expect(screen.getByText('Parent 1').className).toBe('select-none text-sm');
    });

    test('多选模式下的行不得被标记为禁用', () => {
      render(<Tree data={testTreeData} isMultiSelectable />);
      const row = screen.getByText('Parent 1').closest('div[role="button"]');

      expect(row).not.toHaveAttribute('aria-disabled');
      expect(row).not.toHaveClass('opacity-50');
      expect(row).not.toHaveClass('cursor-not-allowed');
    });

    test('allowNonLeafSelection 开启时父节点可选中并保留悬停反馈', () => {
      render(<Tree data={testTreeData} allowNonLeafSelection />);
      const row = screen.getByText('Parent 1').closest('div[role="button"]');

      expect(row).toHaveClass('cursor-pointer');
      expect(row).toHaveClass('hover:bg-accent');
      expect(row).not.toHaveAttribute('data-unselectable');
      expect(row).not.toHaveAttribute('aria-disabled');
    });
  });

  test('键盘 Enter 或 Space 键应能选中节点', () => {
    const handleSelect = vi.fn();
    render(<Tree data={testTreeData} allowNonLeafSelection onSelectChange={handleSelect} />);
    const parent2Node = screen.getByText('Parent 2');

    parent2Node.focus();
    fireEvent.keyDown(parent2Node, { key: 'Enter', code: 'Enter' });

    expect(handleSelect).toHaveBeenCalledWith(testTreeData[1]);
    expect(handleSelect).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(parent2Node, { key: ' ', code: 'Space' });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });
});
