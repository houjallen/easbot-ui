# Tree 树形控件

> 层级数据展示与选择控件，支持单选、多选、展开 / 收起与禁用节点。

---

**导入**

```tsx
import { Tree } from '@easbot/ui';
```

## 基础用法

```tsx
import { Tree } from '@easbot/ui';
import type { TreeNodeData } from '@easbot/ui';

const data: TreeNodeData[] = [
  {
    id: '1',
    name: '父节点 1',
    iconName: 'folder',
    children: [
      { id: '1-1', name: '子节点 1.1', iconName: 'file' },
      { id: '1-2', name: '子节点 1.2', disabled: true },
    ],
  },
  { id: '2', name: '父节点 2' },
];

export default function App() {
  return (
    <div className="w-[300px]">
      <Tree data={data} />
    </div>
  );
}
```

单选（仅叶子节点可选）：

```tsx
import { useState } from 'react';
import type { TreeNodeData } from '@easbot/ui';

const [selected, setSelected] = useState<TreeNodeData | undefined>(undefined);

<Tree
  data={data}
  initialExpandedIds={new Set(['1'])}
  initialSelectedId="1-1"
  onSelectChange={(node) => setSelected(node)}
/>;
```

多选：

```tsx
<Tree
  data={data}
  isMultiSelectable
  initialExpandedIds={new Set(['1'])}
  initialSelectedIds={new Set(['1-1'])}
  onMultiSelectChange={(nodes) => console.log(nodes)}
/>
```

## 属性

继承自 `React.HTMLAttributes<HTMLDivElement>, UiMessageProps`。

| 属性                     | 类型                                        | 默认值 | 说明 |
| ------------------------ | ------------------------------------------- | ------ | ---- |
| `data`                   | `TreeNodeData[]`                            | —      | —    |
| `isSelectable?`          | `boolean`                                   | —      | —    |
| `initialSelectedId?`     | `string`                                    | —      | —    |
| `onSelectChange?`        | `(node: TreeNodeData \| undefined) => void` | —      | —    |
| `isMultiSelectable?`     | `boolean`                                   | —      | —    |
| `initialSelectedIds?`    | `Set<string>`                               | —      | —    |
| `onMultiSelectChange?`   | `(nodes: TreeNodeData[]) => void`           | —      | —    |
| `initialExpandedIds?`    | `Set<string>`                               | —      | —    |
| `allowNonLeafSelection?` | `boolean`                                   | —      | —    |

`TreeProps` 是 `Tree` 的属性接口，继承 `React.HTMLAttributes<HTMLDivElement>` 与 `UiMessageProps`（`locale` / `messages`）。

> 📌 `TreeNodeData`（`id` / `name` / `iconName?` / `children?` / `disabled?`）是**数据类型**而非 Props —— 它描述节点结构，通过 `TreeProps.data` 传入。

## 无障碍

- 节点行渲染为 `<div role="button">`，并注入 `aria-disabled`（等于「节点被禁用」**或**「该节点当前不可选中」）。
- 节点行的 `tabIndex` 为 `0`（可聚焦）或 `-1`（不可选中 / 被禁用）；源码注释说明「始终声明 button 语义 —— 保证无障碍工具能识别该节点为可交互元素」。
- 展开 / 收起按钮是原生 `<button type="button">`，带 `aria-label`（走内置 `tree` 文案域，zh-CN「展开节点」/「收起节点」，en-US `Expand node` / `Collapse node」），并根据是否有子节点切换 `tabIndex`。
- 节点图标（`iconName`）可点击切换展开状态，且带 `tabIndex`（禁用时为 `-1`）与键盘事件处理。
- 键盘操作：节点行上按 `Enter` 或 `Space` 会阻止默认行为并触发选中（仅在可选中时绑定 `onKeyDown`）；展开按钮上按 `Enter` / `Space` 切换展开状态。
- 多选模式下每个节点前有一个 `Checkbox`，支持键盘操作；复选框的 `onClick` 阻止冒泡，不会连带触发节点行的选中逻辑。
- 树**不使用 `role="tree"` / `role="treeitem"`**：整体是普通 `<div>` + 逐个 `role="button"` 的节点行，读屏会把它读成一系列按钮而非树结构。

## 注意事项

- **`src/ui` 层是独立实现**：`Tree` 不是设计系统层的 re-export，本库自有实现（依赖 `Checkbox` / `Collapsible` / `Icon`）。
- **默认仅叶子节点可选**：`isSelectable` 默认为 `true`，但 `allowNonLeafSelection` 默认为 `false` —— 单选模式下有子节点的父节点**不可选中**；需要选中父节点请显式传 `allowNonLeafSelection`。
- **`isMultiSelectable` 与 `isSelectable` 是两套模式**：`isMultiSelectable` 为真时**单选逻辑完全失效**（`isSelected` 恒为 `false`），改由复选框驱动；此时 `isSelectable` 不再影响多选行为。
- **多选的级联范围受 `allowNonLeafSelection` 影响**：为 `false` 时只作用于叶子节点；为 `true` 时父节点与全部后代一起参与计算（禁用节点始终被排除）。
- **父节点的复选框有三态**：`unchecked` / `checked` / `indeterminate`（部分后代被选中时）。
- **多选时点击父节点复选框会切换整棵子树**：若当前是 `checked` 或 `indeterminate`，则**取消**该子树内所有相关节点的选中；否则**全选**。
- **`onMultiSelectChange` 回传的是节点数组**：按 `selectedIds` 的顺序映射回 `TreeNodeData` 并过滤掉失效项。
- **组件完全非受控**：`initialSelectedId` / `initialSelectedIds` / `initialExpandedIds` 仅在**首次渲染**生效；后续状态由组件内部维护，**没有** `value` / `expandedIds` 之类的受控属性。需要受控请自行实现。
- **`data` 变化会重建节点索引表**：`flatDataMap` 由 `useMemo` 依赖 `data` 重算，用于 id → 节点的查找。
- **`id` 必须唯一**：`id` 是展开、选中与查找的唯一依据，重复会导致状态错乱。
- **`iconName` 取自全局图标注册表**：需使用 `Icon` 组件已注册的图标名（如 `folder` / `file`）；未注册的名称不会渲染图标（不报错）。
- **`disabled` 节点不可交互**：点击节点、点击图标、拖拽与多选都会被忽略，并显示 `opacity-50` + `cursor-not-allowed`。
- **展开 / 收起用 `Collapsible` 实现**：因此收起时子树内容会从 DOM 中卸载。
- **子节点缩进固定为 `pl-6`**（24px），不随层级变化计算。
- **节点行无内边距偏移**：`flex items-center rounded-md py-1.5 pr-2`，左侧不留白，靠图标位置对齐。
- **内置文案只有两条被使用**：`expandAriaLabel` / `collapseAriaLabel`（zh-CN「展开节点」/「收起节点」，en-US `Expand node` / `Collapse node`），来自内置 `tree` 文案域；`tree` 文案域中的 `expand` / `collapse` / `expandAll` / `collapseAll` / `noData` / `selectNode` 在本组件中**未被使用**（可能预留给其它组件或后续功能）。
- **不消费任何主题 CSS 变量。**

## 导出

### 组件

| 导出名         | 说明 |
| -------------- | ---- |
| `Tree`         |      |
| `TreeNodeData` |      |
| `TreeProps`    |      |
