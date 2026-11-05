'use client';

import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps, UiMessages } from '../../utils/ui-message';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Checkbox } from '../checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible';
import { Icon, IconButton } from '../icon';

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
  // ⚠️ 禁用节点**不得**判定为可选 —— 否则仍会拼 `cursor-pointer`、绑定 keydown、
  //    并让两个配合图标看起来可交互（禁用态只作用于主体 div 的历史 bug）。
  const isNodeSelectableInSingleMode = isSelectable && !isDisabled && !isMultiSelectable && (allowNonLeafSelection || !hasChildren);

  // 📌 **「不可选中」≠「禁用」** —— 二者是两种独立状态，此前共用 `aria-disabled`，
  //    导致有子节点的父节点（`allowNonLeafSelection=false` 时不可选）被读成禁用：
  //    屏幕阅读器播报「不可用」、全局 `[role=button][aria-disabled=true]` 把光标变成
  //    `not-allowed`，宿主若再按 `aria-disabled` 上样式就会整行灰化（label 变禁用色）。
  //    现在 `aria-disabled` 只表达真禁用，「不可选中」改用 `data-unselectable` 单独表达。
  const isRowUnselectable = !isDisabled && !isNodeSelectableInSingleMode;

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

  // 📌 禁用态由 `IconButton` 的**原生 `disabled`** 承担（浏览器直接阻止
  //    click / 键盘激活 / 聚焦），比「回调内 return」更彻底：
  //    后者拦得住业务逻辑，却拦不住事件派发、hover、focus 与光标反馈。
  //    保留 `stopPropagation` 避免点击图标冒泡到节点行触发选中。
  const onToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleExpand(node.id);
    }
  };

  const onIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleExpand(node.id);
    } else if (!isMultiSelectable) {
      onNodeClick();
    }
  };

  return (
    <Collapsible open={isExpanded}>
      <div
        className={cn(
          'flex items-center rounded-md py-1.5 pr-2',
          // 只有「确实可选中」的行才给可点击反馈；不可选中的行（有子节点但未开启
          // allowNonLeafSelection / 多选模式 / 未开启 isSelectable）点击无动作，
          // 给 hover 高亮与 pointer 会让用户误以为可点。
          isNodeSelectableInSingleMode && 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
          isSelected && 'bg-accent text-accent-foreground',
          // 真禁用：唯一需要 `opacity-50` + `not-allowed` 的状态
          isDisabled && 'cursor-not-allowed opacity-50',
          isRowUnselectable && 'cursor-default',
        )}
        onClick={onNodeClick}
        onKeyDown={isNodeSelectableInSingleMode ? handleKeyDown : undefined}
        tabIndex={isNodeSelectableInSingleMode ? 0 : -1}
        // 始终声明 button 语义 —— 保证无障碍工具能识别该节点为可交互元素
        role="button"
        // 📌 仅真禁用才标 `aria-disabled`；「不可选中」用 `data-unselectable` 表达，
        //    避免被读成「禁用」并触发 `not-allowed` 光标 / 宿主禁用态样式。
        aria-disabled={isDisabled || undefined}
        data-unselectable={isRowUnselectable ? 'true' : undefined}
      >
        <CollapsibleTrigger asChild>
          {/* 📌 统一改用 `IconButton`：ghost 默认无边框、焦点用 `focus-visible:outline`
              （鼠标点击不出现方框）、原生 `disabled` 直接阻断点击/聚焦/光标反馈。
              此前手写 button 无 `disabled` 属性、裸 SVG 带 tabIndex 会出现浏览器默认焦点框。 */}
          <IconButton
            size={24}
            shape="square"
            disabled={isDisabled || !hasChildren}
            icon={<Icon name="chevron-right" className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-90')} />}
            className={cn('rounded-md hover:bg-muted-foreground/20', !hasChildren && 'invisible')}
            onClick={onToggleClick}
            aria-label={isExpanded ? t('collapseAriaLabel') : t('expandAriaLabel')}
          />
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

        {/* 📌 节点图标同样改 `IconButton`：禁用时原生 disabled 生效，
            取代此前「裸 SVG + 恒 cursor-pointer + 回调内 return」的不完整拦截。 */}
        {node.iconName && (
          <IconButton
            size={20}
            shape="square"
            disabled={isDisabled}
            icon={<Icon name={node.iconName} className="h-4 w-4 text-muted-foreground" />}
            className="mr-2"
            onClick={onIconClick}
            aria-label={node.name}
          />
        )}
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
