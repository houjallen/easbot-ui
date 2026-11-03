'use client';

import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps, UiMessages } from '../../utils/ui-message';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Checkbox } from '../checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible';
import { Icon } from '../icon';

// --- Types ---

export interface TreeNodeData {
  id: string;
  name: string;
  iconName?: string; // Use icon name from registry
  children?: TreeNodeData[];
  disabled?: boolean;
}

interface TreeNodeProps {
  node: TreeNodeData;
}

export interface TreeProps extends React.HTMLAttributes<HTMLDivElement>, UiMessageProps {
  data: TreeNodeData[];
  isSelectable?: boolean;
  initialSelectedId?: string;
  onSelectChange?: (node: TreeNodeData | undefined) => void;
  isMultiSelectable?: boolean;
  initialSelectedIds?: Set<string>;
  onMultiSelectChange?: (nodes: TreeNodeData[]) => void;
  initialExpandedIds?: Set<string>;
  allowNonLeafSelection?: boolean;
}

// --- Context ---

interface TreeContextType {
  selectedId: string | undefined;
  handleSelect: (id: string, node: TreeNodeData) => void;
  selectedIds: Set<string>;
  handleMultiSelect: (node: TreeNodeData) => void;
  isMultiSelectable: boolean;
  allowNonLeafSelection: boolean;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  isSelectable: boolean;
  getNode: (id: string) => TreeNodeData | undefined;
  getDescendants: (node: TreeNodeData) => TreeNodeData[];
  /** 语言标识（优先级高于 LocaleProvider） */
  locale?: string;
  /** 自定义文案（覆盖内置文案） */
  messages?: UiMessages;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
};

// --- Recursive TreeNode Component ---

const TreeNode: React.FC<TreeNodeProps> = ({ node }) => {
  const { selectedId, handleSelect, expandedIds, toggleExpand, isSelectable, isMultiSelectable, selectedIds, handleMultiSelect, getDescendants, allowNonLeafSelection, locale, messages } = useTree();
  const { t } = useComponentMessage('tree', { locale, messages });

  const isDisabled = !!node.disabled;
  const isSelected = isMultiSelectable ? false : selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isNodeSelectableInSingleMode = isSelectable && !isMultiSelectable && (allowNonLeafSelection || !hasChildren);

  const getMultiSelectState = () => {
    if (!isMultiSelectable) return 'unchecked';
    if (!hasChildren) {
      return selectedIds.has(node.id) ? 'checked' : 'unchecked';
    }

    const descendants = getDescendants(node).filter((d) => !d.disabled);

    const nodesToConsider = allowNonLeafSelection ? [node, ...descendants].filter((n) => !n.disabled) : descendants.filter((d) => !d.children || d.children.length === 0);

    if (nodesToConsider.length === 0) return 'unchecked';

    const selectedCount = nodesToConsider.filter((d) => selectedIds.has(d.id)).length;

    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === nodesToConsider.length) return 'checked';
    return 'indeterminate';
  };
  const multiSelectState = getMultiSelectState();

  const onNodeClick = () => {
    if (isDisabled) return;
    if (isNodeSelectableInSingleMode) {
      handleSelect(node.id, node);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNodeClick();
    }
  };

  const onToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    if (hasChildren) {
      toggleExpand(node.id);
    }
  };

  const onIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    if (hasChildren) {
      toggleExpand(node.id);
    } else if (!isMultiSelectable) {
      onNodeClick();
    }
  };

  const onIconKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onIconClick(e as any);
    }
  };

  return (
    <Collapsible open={isExpanded}>
      <div
        className={cn(
          'flex items-center rounded-md py-1.5 pr-2',
          isNodeSelectableInSingleMode && 'cursor-pointer',
          'hover:bg-accent hover:text-accent-foreground',
          isSelected && 'bg-accent text-accent-foreground',
          isDisabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={onNodeClick}
        onKeyDown={isNodeSelectableInSingleMode ? handleKeyDown : undefined}
        tabIndex={isNodeSelectableInSingleMode && !isDisabled ? 0 : -1}
        // 始终声明 button 语义 —— 保证无障碍工具能识别该节点为可交互元素
        role="button"
        aria-disabled={isDisabled || !isNodeSelectableInSingleMode}
      >
        <CollapsibleTrigger asChild>
          {/* 使用语义化 button 元素 —— 保证键盘可达性与屏幕阅读器可识别 */}
          <button
            type="button"
            className={cn('rounded-md p-1 hover:bg-muted-foreground/20', !hasChildren && 'invisible')}
            onClick={onToggleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onToggleClick(e as any);
            }}
            tabIndex={hasChildren && !isDisabled ? 0 : -1}
            aria-label={isExpanded ? t('collapseAriaLabel') : t('expandAriaLabel')}
          >
            <Icon name="chevron-right" className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-90')} />
          </button>
        </CollapsibleTrigger>

        {isMultiSelectable && (
          <Checkbox
            checked={multiSelectState === 'checked' ? true : multiSelectState === 'indeterminate' ? 'indeterminate' : false}
            onCheckedChange={() => handleMultiSelect(node)}
            className="mr-2"
            onClick={(e) => e.stopPropagation()}
            disabled={isDisabled}
          />
        )}

        {node.iconName && <Icon onClick={onIconClick} onKeyDown={onIconKeyDown} tabIndex={isDisabled ? -1 : 0} name={node.iconName} className="mr-2 h-4 w-4 cursor-pointer text-muted-foreground" />}
        <span className="select-none text-sm">{node.name}</span>
      </div>
      <CollapsibleContent className="pl-6">{hasChildren && node.children?.map((child) => <TreeNode key={child.id} node={child} />)}</CollapsibleContent>
    </Collapsible>
  );
};

// --- Main Tree Component ---

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      isSelectable = true,
      initialSelectedId,
      onSelectChange,
      isMultiSelectable = false,
      initialSelectedIds,
      onMultiSelectChange,
      initialExpandedIds = new Set(),
      allowNonLeafSelection = false,
      className,
      locale,
      messages,
      ...props
    },
    ref,
  ) => {
    const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds ?? new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(initialExpandedIds);

    const flatDataMap = useMemo(() => {
      const map = new Map<string, TreeNodeData>();
      function traverse(nodes: TreeNodeData[]) {
        nodes.forEach((node) => {
          map.set(node.id, node);
          if (node.children) {
            traverse(node.children);
          }
        });
      }
      traverse(data);
      return map;
    }, [data]);

    const getDescendants = useCallback((node: TreeNodeData): TreeNodeData[] => {
      const descendants: TreeNodeData[] = [];
      function traverse(nodes: TreeNodeData[]) {
        nodes.forEach((n) => {
          descendants.push(n);
          if (n.children) {
            traverse(n.children);
          }
        });
      }
      if (node.children) {
        traverse(node.children);
      }
      return descendants;
    }, []);

    const getNode = useCallback((id: string) => flatDataMap.get(id), [flatDataMap]);

    const handleSelect = useCallback(
      (id: string, node: TreeNodeData) => {
        setSelectedId(id);
        onSelectChange?.(node);
      },
      [onSelectChange],
    );

    const handleMultiSelect = useCallback(
      (node: TreeNodeData) => {
        if (node.disabled) return;

        const newSelectedIds = new Set(selectedIds);
        const descendants = getDescendants(node);
        const allNodesInSubtree = [node, ...descendants].filter((n) => !n.disabled);

        const nodesForStateCheck = allowNonLeafSelection ? allNodesInSubtree : allNodesInSubtree.filter((n) => !n.children || n.children.length === 0);
        if (nodesForStateCheck.length === 0) return;

        const selectedCount = nodesForStateCheck.filter((n) => newSelectedIds.has(n.id)).length;
        const state: 'checked' | 'unchecked' | 'indeterminate' = selectedCount === 0 ? 'unchecked' : selectedCount === nodesForStateCheck.length ? 'checked' : 'indeterminate';

        const targetNodes = allowNonLeafSelection ? allNodesInSubtree : allNodesInSubtree.filter((n) => !n.children || n.children.length === 0);

        if (state === 'checked' || state === 'indeterminate') {
          // 注意：回调必须用块体 —— 箭头函数简写会返回 Set.delete 的布尔值，
          // 违反 `lint/suspicious/useIterableCallbackReturn`
          targetNodes.forEach((n) => {
            newSelectedIds.delete(n.id);
          });
        } else {
          targetNodes.forEach((n) => {
            newSelectedIds.add(n.id);
          });
        }

        setSelectedIds(newSelectedIds);
        onMultiSelectChange?.(
          Array.from(newSelectedIds)
            .map((id) => getNode(id)!)
            .filter(Boolean),
        );
      },
      [selectedIds, getDescendants, onMultiSelectChange, getNode, allowNonLeafSelection],
    );

    const toggleExpand = useCallback((id: string) => {
      setExpandedIds((prev) => {
        const newExpandedIds = new Set(prev);
        if (newExpandedIds.has(id)) {
          newExpandedIds.delete(id);
        } else {
          newExpandedIds.add(id);
        }
        return newExpandedIds;
      });
    }, []);

    const contextValue = {
      selectedId,
      handleSelect,
      expandedIds,
      toggleExpand,
      isSelectable,
      selectedIds,
      handleMultiSelect,
      isMultiSelectable,
      allowNonLeafSelection,
      getNode,
      getDescendants,
      locale,
      messages,
    };

    return (
      <TreeContext.Provider value={contextValue}>
        <div ref={ref} className={cn('space-y-1', className)} {...props}>
          {data.map((node) => (
            <TreeNode key={node.id} node={node} />
          ))}
        </div>
      </TreeContext.Provider>
    );
  },
);

Tree.displayName = 'Tree';

export { Tree };
