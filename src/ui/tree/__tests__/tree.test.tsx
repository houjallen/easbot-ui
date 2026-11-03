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
