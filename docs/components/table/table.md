# Table 表格

> 提供表格 / 卡片 / 虚拟滚动三种形态的数据展示，内置分页、排序、筛选、搜索、列宽调整与可扩展的插件体系。

---

**导入**

```tsx
import {
  AdvancedTable,
  EnhancedTable,
  BaseTable,
  type TableColumn,
  type TableConfig,
} from '@easbot/ui';
```

## 基础用法

最常见的用法是 `AdvancedTable` —— 它自带搜索面板、工具栏与状态栏，并把数据、列、配置统一交给内部的 `TableProvider`：

```tsx
import { AdvancedTable } from '@easbot/ui';
import type { TableColumn } from '@easbot/ui';

const columns: TableColumn[] = [
  { name: 'name', title: '姓名', dataIndex: 'name' },
  { name: 'role', title: '角色', dataIndex: 'role', align: 'center' },
];

const data = [
  { id: '1', name: '张三', role: '管理员' },
  { id: '2', name: '李四', role: '访客' },
];

export default function App() {
  return <AdvancedTable data={data} columns={columns} />;
}
```

需要完全自定义结构时，用 `BaseTable` + 原子组件自由拼装（详见 [原子组件篇](./table-atoms.md)）：

```tsx
import {
  BaseTable,
  TableContainer,
  TableGrid,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@easbot/ui';

export default function App() {
  return (
    <BaseTable
      data={[{ id: '1', name: '张三' }]}
      columns={[{ name: 'name', title: '姓名', dataIndex: 'name' }]}
      config={{ bordered: true, striped: true }}
    />
  );
}
```

## 三大表格形态对比

`src/ui/table/` 提供三个层级递进的有机体组件，选择哪一个取决于你需要多少「开箱即用」能力：

| 形态         | 组件            | 自带 Provider           | 搜索面板 | 工具栏 | 状态栏 | 插件系统 | 典型场景                                     |
| ------------ | --------------- | ----------------------- | -------- | ------ | ------ | -------- | -------------------------------------------- |
| **原子组合** | `BaseTable`     | ✘（必须外部提供）       | ✘        | ✘      | ✘      | ✘        | 自定义表头 / 表体 / 行内操作                 |
| **增强表格** | `EnhancedTable` | ✔（无 Provider 时自建） | ✘        | ✘      | ✘      | ✘        | 需要 `TableContext` 状态，但布局由自己控制   |
| **高级表格** | `AdvancedTable` | ✔（无 Provider 时自建） | ✔¹       | ✔²     | ✘³     | ✔        | 后台管理列表 —— 搜索 + 工具栏 + 插件开箱即用 |

> ¹ 搜索面板还需配置 `search.fields`（有字段才渲染）；未配置时 `SearchPanel` 返回 `null`。
> ² `AdvancedTable` 在 `toolbarable` 且消费方未显式关闭时自动打开 `toolbar.show`。
> ³ `AdvancedTable` **不默认开启** `statusBarable`，需要显式传 `config={{ statusBarable: true }}`。

**选择建议**

- **默认选 `AdvancedTable`**：它已经把「搜索面板 + 工具栏 + 表格主体 + 状态栏」四段式布局拼好，且默认开启 `selectable` / `sortable` / `filterable` / `resizeable` / `pluginable` / `searchable` / `toolbarable`。
- **需要自定义区域布局时选 `EnhancedTable`**：它只负责把 `TableContext` 的数据与状态接到 `BaseTable` 上，不渲染任何外围面板。
- **只想要一份纯表格 DOM 时选 `BaseTable`**：注意 `BaseTable` **强依赖 `TableProvider`**（内部调用 `useTableContext`），单独使用会抛错。
- **`TableCardView` / `TableVirtualBody` 不是独立入口**：它们由 `BaseTable` 依据 `config.displayMode`（`'table'` / `'card'` / `'virtual'`）自动切换。

## 能力矩阵

| 能力     | 开关字段（`TableConfig`） | 默认值                               | 说明                                                                                   |
| -------- | ------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| 行选择   | `selectable`              | `false`（`AdvancedTable` 为 `true`） | 配合 `selection.type`（`single` / `multiple`）                                         |
| 排序     | `sortable`                | `false`（`AdvancedTable` 为 `true`） | 依赖 `SortPlugin` 在列头渲染排序按钮                                                   |
| 筛选     | `filterable`              | `false`（`AdvancedTable` 为 `true`） | 依赖 `FilterPlugin` 在列头渲染筛选按钮                                                 |
| 搜索     | `searchable`              | `false`（`AdvancedTable` 为 `true`） | 配合 `search.fields` 定义搜索字段                                                      |
| 工具栏   | `toolbarable`             | `false`（`AdvancedTable` 为 `true`） | 需 `toolbar.show !== false` 才会真正渲染                                               |
| 状态栏   | `statusBarable`           | `false`                              | 显示服务端模式 / 缓存 / 持久化 / 行数 / 插件数（`AdvancedTable` 也不默认开启）         |
| 展开行   | `expandable`              | `false`                              | 配合 `expansion.type`（`single` / `multiple`）                                         |
| 列宽调整 | `resizeable`              | `false`（`AdvancedTable` 为 `true`） | 拖拽列头右侧手柄调整列宽                                                               |
| 固定列   | `fixedable`               | `false`                              | 列配置 `fixed: 'left' \| 'right'`                                                      |
| 虚拟滚动 | `virtualizable`           | `false`                              | 需同时 `displayMode: 'virtual'`；数据量 ≥ `virtualization.threshold`（默认 100）才启用 |
| 右键菜单 | `contextMenuable`         | `false`                              | 行级右键菜单                                                                           |
| 行操作列 | `rowActionable`           | `false`                              | 行内操作按钮列，超出 `rowAction.maxVisible` 的进「更多」菜单                           |
| 列头操作 | `columnHeaderActionable`  | `false`                              | 列头右侧的操作按钮                                                                     |
| 插件系统 | `pluginable`              | `false`（`AdvancedTable` 为 `true`） | 插件不注册、不渲染                                                                     |
| 分页     | `paginable`               | `true`                               | `pagination` 配置页码 / 每页条数 / 布局                                                |

## 数据流与上下文

表格的所有状态都收敛在 `TableProvider` 里，通过 `TableContext` 下发：

```
TableProvider (config / data / columns / loading / error / pagination)
  └── TableContextValue { state, actions, tableLogic, getRowKey, ... }
        ├── BaseTable / EnhancedTable / AdvancedTable  → 渲染 DOM
        ├── Toolbar / SearchPanel / StatusBar           → 渲染外围面板
        └── useTableLogic()                            → 逻辑层（排序 / 筛选 / 分页 / 插件 / 事件）
```

`tableLogic` 是**唯一的逻辑实例**（`useHookTableLogic` 创建），包含 `selection` / `sort` / `filter` / `search` / `expansion` / `resize` / `pagination` / `plugin` / `i18n` / `storePage` / `actionEvents` 十一个模块。详见 [Hook 与数据契约篇](./table-hooks.md)。

## 本地模式与远程模式

`config.dataMode` 决定排序 / 筛选 / 搜索 / 分页是在**前端**还是**后端**完成：

| 模式值             | 行为                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `'local'`          | 组件库用 `applyTableSort` / `applyTableFilter` / `applyTableSearch` / `applyTablePagination` 在前端处理数据 |
| `'remote'`（默认） | 组件库**不改动**数据，只把状态写进 `state`，由消费方监听并自行请求后端                                      |

> ⚠️ `AdvancedTable` 的默认 `dataMode` 四个子项**全部是 `'remote'`** —— 打开即用的场景必须显式改成 `'local'`，否则排序 / 筛选 / 分页看起来「没反应」。

配合远端数据源使用（`useTableRemoteData` + `createTableDataSource`）见 [Hook 与数据契约篇](./table-hooks.md#远端数据源)。

## 快速上手：带搜索与工具栏

```tsx
import { AdvancedTable } from '@easbot/ui';
import type { TableColumn } from '@easbot/ui';

const columns: TableColumn[] = [
  { name: 'name', title: '姓名', dataIndex: 'name', sortable: true, filterable: true },
  { name: 'role', title: '角色', dataIndex: 'role' },
];

export default function App() {
  return (
    <AdvancedTable
      data={data}
      columns={columns}
      search={{
        show: true,
        fields: [{ name: 'name', label: '姓名', type: 'text', dataIndex: ['name'] }],
      }}
      toolbar={{ show: true, left: [{ key: 'add', label: '新增', icon: 'plus' }] }}
      config={{
        dataMode: { sort: 'local', filter: 'local', search: 'local', pagination: 'local' },
      }}
    />
  );
}
```

> 📌 `search.fields` 的元素类型 `SearchFieldConfig` **未从包根导出**（它只作为 `SearchConfig.fields` 的嵌套类型存在）。
> 需要单独标注类型时，请从 `TableConfig['search']['fields'][number]` 取。

## 属性

三个表格形态的核心 Props：

## 属性

继承自 `TableConfig`。

| 属性                  | 类型                                                                            | 默认值 | 说明                                     |
| --------------------- | ------------------------------------------------------------------------------- | ------ | ---------------------------------------- |
| `data`                | `Record<string, any>[]`                                                         | —      | 数据源                                   |
| `columns`             | `TableColumn[]`                                                                 | —      | 列配置 - 与 schema columns 字段对应      |
| `showHeader?`         | `boolean`                                                                       | —      | 表头配置                                 |
| `stickyHeader?`       | `boolean`                                                                       | —      | —                                        |
| `stickyHeaderOffset?` | `number`                                                                        | —      | —                                        |
| `loading?`            | `boolean`                                                                       | —      | 加载配置                                 |
| `error?`              | `ReactNode`                                                                     | —      | 错误信息                                 |
| `empty?`              | `ReactNode \| EmptyConfig`                                                      | —      | 空状态配置                               |
| `selectable?`         | `boolean`                                                                       | —      | 选择配置 - 与 schema selection 字段对应  |
| `selection?`          | `SelectionConfig`                                                               | —      | —                                        |
| `sortable?`           | `boolean`                                                                       | —      | 排序配置                                 |
| `sort?`               | `SortState`                                                                     | —      | —                                        |
| `filterable?`         | `boolean`                                                                       | —      | 筛选配置                                 |
| `filter?`             | `FilterState`                                                                   | —      | —                                        |
| `expandable?`         | `boolean`                                                                       | —      | 展开配置 - 与 schema expandable 字段对应 |
| `expansion?`          | `ExpansionConfig`                                                               | —      | —                                        |
| `resizeable?`         | `boolean`                                                                       | —      | 列宽调整配置                             |
| `resize?`             | `ResizeConfig`                                                                  | —      | —                                        |
| `paginable?`          | `boolean`                                                                       | —      | 分页配置                                 |
| `pagination?`         | `PaginationState`                                                               | —      | —                                        |
| `onRowClick?`         | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | 事件回调                                 |
| `onRowDoubleClick?`   | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | —                                        |
| `onRowMouseEnter?`    | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | —                                        |
| `onRowMouseLeave?`    | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | —                                        |
| `className?`          | `string`                                                                        | —      | 样式配置                                 |
| `style?`              | `React.CSSProperties`                                                           | —      | —                                        |
| `children?`           | `ReactNode`                                                                     | —      | 子组件                                   |

## 属性（EnhancedTableProps）

| 属性                | 类型                                                                            | 默认值 | 说明                                |
| ------------------- | ------------------------------------------------------------------------------- | ------ | ----------------------------------- |
| `data?`             | `Record<string, any>[]`                                                         | —      | 数据源                              |
| `columns?`          | `TableColumn[]`                                                                 | —      | 列配置 - 与 schema columns 字段对应 |
| `loading?`          | `boolean`                                                                       | —      | 加载配置                            |
| `error?`            | `ReactNode`                                                                     | —      | 错误信息                            |
| `empty?`            | `ReactNode \| EmptyConfig`                                                      | —      | 空状态配置                          |
| `config?`           | `TableConfig`                                                                   | —      | 表格配置                            |
| `onRowClick?`       | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | 事件回调                            |
| `onRowDoubleClick?` | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | —                                   |
| `onRowMouseEnter?`  | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | —                                   |
| `onRowMouseLeave?`  | `(record: Record<string, any>, index: number, event: React.MouseEvent) => void` | —      | —                                   |
| `className?`        | `string`                                                                        | —      | 样式配置                            |
| `style?`            | `React.CSSProperties`                                                           | —      | —                                   |
| `children?`         | `ReactNode`                                                                     | —      | 子组件                              |

## 属性（AdvancedTableProps）

| 属性                 | 类型                                | 默认值 | 说明 |
| -------------------- | ----------------------------------- | ------ | ---- |
| `data?`              | `any[]`                             | —      | —    |
| `columns?`           | `TableColumn[]`                     | —      | —    |
| `plugin?`            | `PluginConfig`                      | —      | —    |
| `toolbar?`           | `ToolbarConfig`                     | —      | —    |
| `search?`            | `SearchConfig`                      | —      | —    |
| `config?`            | `TableConfig`                       | —      | —    |
| `loading?`           | `boolean`                           | —      | —    |
| `error?`             | `string \| null`                    | —      | —    |
| `className?`         | `string`                            | —      | —    |
| `style?`             | `React.CSSProperties`               | —      | —    |
| `onRowClick?`        | `(row: any, index: number) => void` | —      | —    |
| `onRowDoubleClick?`  | `(row: any, index: number) => void` | —      | —    |
| `onSelectionChange?` | `(selectedRows: any[]) => void`     | —      | —    |

`BaseTableProps` 继承 `TableConfig`（因此 `size` / `density` / `bordered` / `striped` / `scroll` / `selection` / `sort` / `filter` / `expansion` / `resize` / `pagination` 等配置字段可直接写在 props 上）。

`AdvancedTableProps` 的唯一定义源是 `organisms/AdvancedTable.tsx`（`plugin` / `toolbar` / `search` / `config` / `onSelectionChange`）—— 与组件实际签名**同源**，包根导入拿到的就是这一份。

`TableCardView` 与 `TableVirtualBody` 的属性：

## 属性

| 属性                      | 类型                                                                         | 默认值 | 说明                              |
| ------------------------- | ---------------------------------------------------------------------------- | ------ | --------------------------------- |
| `virtualizationConfig?`   | `Partial<VirtualizationConfig>`                                              | —      | 虚拟化配置                        |
| `renderRow`               | `(params: { index: number; style: React.CSSProperties }) => React.ReactNode` | —      | 渲染单行的函数 - 由BaseTable提供  |
| `itemCount`               | `number`                                                                     | —      | 数据总数                          |
| `shouldUseVirtualization` | `boolean`                                                                    | —      | 是否启用虚拟滚动                  |
| `fallbackRender`          | `() => React.ReactNode`                                                      | —      | 降级渲染函数 - 当不使用虚拟滚动时 |

`SearchPanel` / `Toolbar` / `StatusBar` 的属性：

## 属性

| 属性                 | 类型                    | 默认值 | 说明           |
| -------------------- | ----------------------- | ------ | -------------- |
| `config?`            | `ToolbarConfig`         | —      | 工具栏配置     |
| `className?`         | `string`                | —      | 自定义样式类名 |
| `extraLeftActions?`  | `ToolbarActionConfig[]` | —      | 额外的左侧动作 |
| `extraRightActions?` | `ToolbarActionConfig[]` | —      | 额外的右侧动作 |

## 属性（TableStatusBarProps）

| 属性         | 类型              | 默认值 | 说明           |
| ------------ | ----------------- | ------ | -------------- |
| `config?`    | `StatusBarConfig` | —      | —              |
| `className?` | `string`          | —      | 自定义样式类名 |

> ⚠️ `SearchPanelProps` **未从包根导出**（`organisms/SearchPanel.tsx` 内定义但未在 barrel 中 re-export）。

## 导出概览

> 完整导出清单（191 项）由 `src/ui/table/index.ts` 自动生成。下表按模块归类说明各导出的用途。

| 模块            | 主要导出                                                                                                                                                                                                                                                                                                                                                                                     | 用途                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **有机体**      | `BaseTable` / `EnhancedTable` / `AdvancedTable` / `TableCardView` / `TableVirtualBody` / `SearchPanel` / `Toolbar`                                                                                                                                                                                                                                                                           | 三个表格形态 + 外围面板                                |
| **分子**        | `StatusBar`                                                                                                                                                                                                                                                                                                                                                                                  | 表格状态栏                                             |
| **原子组件**    | `TableContainer` / `TableGrid` / `TableHeader` / `TableBody` / `TableRow` / `TableCell` / `TableEmpty` / `TableError` / `TableLoading` / `TablePagination` / `TableSortButton` / `TableColumnFilter` / `TableColumnResizer` / `TableRowExpandButton` / `TableFixedColumn` / `CellValue` / `RowActionCell` / `ColumnHeaderActionCell` / `RowContextMenu` / `TableCard` / `TableCardContainer` | 最小粒度构建块 —— 详见 [原子组件篇](./table-atoms.md)  |
| **虚拟列表**    | `VirtualList` / `useVirtualScroll` / `useItemSizeCache` / `useVirtualListPerformance` + 尺寸计算工具                                                                                                                                                                                                                                                                                         | 通用虚拟滚动容器                                       |
| **功能组件**    | `SearchField` / `AutoSearchField` / `SearchFieldRenderer` / `ToggleField` / `EditForm` / `EditModal` / `EditRowModal`                                                                                                                                                                                                                                                                        | 搜索字段渲染与行编辑弹层                               |
| **上下文 Hook** | `TableProvider` / `useTableContext` / `useTableState` / `useTableConfig` / `useTableActions` / `useTableLogic` / `useTableStateSelectors` / `useHasTableContext`                                                                                                                                                                                                                             | 状态读写入口                                           |
| **逻辑 Hook**   | `useTablePagination` / `useTablePlugin` / `useTableI18n` / `useTableEventActions` / `useTableStorePage` / `useTableRemoteData` / `useHookTableLogic`                                                                                                                                                                                                                                         | 分页 / 插件 / 国际化 / 事件 / 业务参数 / 远端数据      |
| **内置插件**    | `ExportPlugin` / `PrintPlugin` / `RefreshPlugin` / `FullscreenPlugin` / `ColumnManagerPlugin` / `AddPlugin` / `BatchDeletePlugin` / `ImportPlugin` / `EditRowPlugin` / `DeleteRowPlugin` / `ViewRowPlugin` / `CopyRowPlugin` / `MoveRowPlugin` / `ToggleEnableRowPlugin` / `SortPlugin` / `FilterPlugin` / `CellCopyPlugin` / `CellEditPlugin`                                               | 18 个内置插件 —— 详见 [插件系统篇](./table-plugins.md) |
| **插件集合**    | `BUILTIN_PLUGINS` / `defaultColumnPlugins` / `defaultCellPlugins` / `CELL_PLUGINS`                                                                                                                                                                                                                                                                                                           | 插件映射表                                             |
| **数据契约**    | `TableColumn` / `TableConfig` / `TablePlugin` / `TableState` / `TableActions` / `TableContextValue` / `TableProviderProps` / `UseTablePluginOptions` / `UseTablePluginReturn`                                                                                                                                                                                                                | 核心类型 —— 详见 [Hook 与数据契约篇](./table-hooks.md) |
| **远端数据源**  | `createTableDataSource` / `toFetchParams` / `TableFetcher` / `TableFetchParams` / `TableFetchResult` / `TableDataSourceApi` / `TableDataSourceOptions` / `TableDataSourceState`                                                                                                                                                                                                              | 服务端分页数据容器                                     |
| **业务工具**    | `applyTableSort` / `applyTableFilter` / `applyTableSearch` / `applyTablePagination` / `processTableData` / `filterData` / `executeFilterCondition` / `applyFilterConditions` / `applySearchConditions`                                                                                                                                                                                       | 本地数据处理纯函数                                     |
| **日期工具**    | `formatDateValue` / `renderDateComponent` / `getDateDisplayValue` / `DEFAULT_FORMAT` / `parseFormatDateToTimeStamp` / `parseTimeStampToFormatDate`                                                                                                                                                                                                                                           | 日期格式化与解析                                       |
| **固定列工具**  | `calculateFixedColumnStyles` / `getTableFixedStyles` / `useTableColumnResize`                                                                                                                                                                                                                                                                                                                | 固定列偏移量计算与列宽调整 Hook                        |

## 无障碍

- 表格使用原生 `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>` 语义结构，读屏器可正确识别行列关系。
- 选择列使用 `role="checkbox"` 的 `Checkbox`，可访问名称分别为「全选」与「选择第 N 行」（由 `useTableI18n` 的内置文案提供）。
- 表头单元格透传 `data-column`（列的 `name`），便于自动化测试与样式定位。
- 行可点击时注入 `cursor-pointer` 与 `focus-visible:outline-2 focus-visible:outline-ring`，键盘焦点可见。
- 排序按钮 / 展开按钮使用 `IconButton`，通过 `title` 提供「点击升序排序 / 点击降序排序 / 点击清除排序」等操作提示。
- 排序 / 筛选 / 展开按钮均为原生 `<button>`，天然键盘可达；展开按钮额外注入 `aria-label`。
- 空状态 / 错误状态 / 加载状态都有可读文本（`暂无数据` / `加载中...` / `加载失败`），错误态默认提供「重新加载」按钮。
- **组件库不管理焦点**：翻页 / 排序后焦点不会自动移动，需要时由消费方自行处理。

## 注意事项

- **`BaseTable` 强依赖 `TableProvider`**：`useTableContext()` 在没有 Provider 时会抛 `useTableContext must be used within a TableProvider`；`EnhancedTable` / `AdvancedTable` 在没有 Provider 时会自动包一层。
- **`AdvancedTable` 在已有 Provider 时会同步 props**：`TableConfigSync` 在挂载后把 `config` / `data` / `columns` / `loading` / `error` 写回外层 Provider（**仅首次**），此后消费方对 Provider 状态的修改优先。
- **✅ `AdvancedTableProps` 现在只有一份定义**：唯一定义源是 `organisms/AdvancedTable.tsx`（含 `plugin` / `toolbar` / `search` / `config` / `onSelectionChange`），与组件实际签名**同源**；包根 `import type { AdvancedTableProps } from '@easbot/ui'` 拿到的就是这一份。历史上有过第二份定义在 `types/components.ts`（含 `plugins` / `serverSide` / `caching` / `export` / `persistence`），字段结构不同且从未被组件消费，已在 ADR 0001 中移除。
- **`TablePaginationProps` 从包根导出**：唯一定义源是 `atoms/TablePagination.tsx`（用 `pagination` / `config` 对象描述分页状态）；此前包根完全看不到该类型，消费方无法为分页组件标注 props 类型。
- **关闭单个插件用 `plugin.config[<插件 id>].enabled`**：插件的开关字段是 `enabled`（不是 `enable`），如 `plugin={{ config: { fullscreen: { enabled: false } } }}` → 不注册 `fullscreen` 插件。键名是**插件 id**（`fullscreen` / `export` / `import` / `print` / `refresh` / `add` / `batchDelete` / `columnManager` / `column-sort` / `column-filter` / `editRow` / `deleteRow` / `viewRow` / `copyRow` / `moveRow` / `toggle-row` / `cellCopy` / `cellEdit`）。注意与 `plugin.enabled`（**整体**开关插件系统）区分。
- **`AdvancedTable` 的 `onSelectionChange` prop 实际不生效**：它会被透传到 `EnhancedTable` 但没有任何消费方读取；需要感知选择变化请用 `config.selection.onSelectionChange`（签名 `(selectedRowKeys, selectedRows) => void`）或 `useTableState` / `useTableStateSelectors.useSelectedRowKeys()`。
- **`AdvancedTable` 的默认 `dataMode` 是全 `remote`**：本地场景需显式覆盖，见上文「本地模式与远程模式」。
- **`toolbarable: true` 不等于会渲染工具栏**：`TableProvider` 默认 `toolbar.show = false`，`Toolbar` 在 `show` 为 false 时返回 `null`；`AdvancedTable` 会在 `toolbarable` 且消费方未显式关闭时自动把 `toolbar.show` 打开。
- **搜索面板需要 `search.fields`**：`SearchPanel` 在 `searchFields.length === 0` 时返回 `null`。
- **组件库不替你删数据**：删除 / 新增 / 编辑的最终数据变更必须由消费方完成；内置的 `DeleteRowPlugin` 等只负责发出 `table-row-delete` 事件。
- **`className` 合并到末位**，自定义类名优先级最高。
- **状态栏文案依赖 `table` 文案域**：`StatusBar` 用的是 `useComponentMessage('table')`，其中的 `localMode` / `cache` / `persistence` / `totalRows` / `selectedRows` / `pluginCount` 等 key 需在 `src/utils/component-messages.ts` 中存在，否则会直接显示 key 本身。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--background`
- `--border`
- `--eas-z-index-context-menu`
- `--eas-z-index-dialog`
- `--eas-z-index-dropdown`
- `--muted`

## 导出

### 组件

| 导出名                       | 说明 |
| ---------------------------- | ---- |
| `AddPlugin`                  |      |
| `AddPluginConfig`            |      |
| `AdvancedTable`              |      |
| `AdvancedTableProps`         |      |
| `AutoSearchField`            |      |
| `AutoSearchFieldProps`       |      |
| `BUILTIN_PLUGINS`            |      |
| `BaseTable`                  |      |
| `BaseTableProps`             |      |
| `BatchDeletePlugin`          |      |
| `BatchDeletePluginConfig`    |      |
| `CELL_PLUGINS`               |      |
| `CellCopyPlugin`             |      |
| `CellCopyPluginConfig`       |      |
| `CellCopyPluginState`        |      |
| `CellEditPlugin`             |      |
| `CellEditPluginConfig`       |      |
| `CellEditPluginState`        |      |
| `CellPluginType`             |      |
| `CellValue`                  |      |
| `ColumnAlign`                |      |
| `ColumnHeaderActionCell`     |      |
| `ColumnManagerPlugin`        |      |
| `ColumnManagerPluginConfig`  |      |
| `CopyRowPlugin`              |      |
| `CopyRowPluginConfig`        |      |
| `DEFAULT_FORMAT`             |      |
| `DateComponentType`          |      |
| `DateRendererProps`          |      |
| `DeleteRowPlugin`            |      |
| `EditForm`                   |      |
| `EditFormProps`              |      |
| `EditModal`                  |      |
| `EditModalProps`             |      |
| `EditRowModal`               |      |
| `EditRowModalProps`          |      |
| `EditRowPlugin`              |      |
| `EnhancedTable`              |      |
| `EnhancedTableProps`         |      |
| `ExpansionConfig`            |      |
| `ExportPlugin`               |      |
| `ExportPluginConfig`         |      |
| `FilterConfig`               |      |
| `FilterPlugin`               |      |
| `FilterPluginConfig`         |      |
| `FilterPluginState`          |      |
| `FixedPosition`              |      |
| `FullscreenPlugin`           |      |
| `FullscreenPluginConfig`     |      |
| `ImportPlugin`               |      |
| `ImportPluginConfig`         |      |
| `ItemRenderer`               |      |
| `ItemSizeGetter`             |      |
| `ItemsRenderedEventData`     |      |
| `MoveRowPlugin`              |      |
| `MoveRowPluginConfig`        |      |
| `PrintPlugin`                |      |
| `PrintPluginConfig`          |      |
| `RefreshPlugin`              |      |
| `RefreshPluginConfig`        |      |
| `RowActionCell`              |      |
| `RowContextMenu`             |      |
| `ScrollChangeReason`         |      |
| `ScrollConfig`               |      |
| `ScrollEventData`            |      |
| `ScrollToIndexConfig`        |      |
| `SearchField`                |      |
| `SearchFieldProps`           |      |
| `SearchFieldRenderer`        |      |
| `SearchFieldRendererProps`   |      |
| `SearchPanel`                |      |
| `SelectionConfig`            |      |
| `SizeAndPositionData`        |      |
| `SortConfig`                 |      |
| `SortDirection`              |      |
| `SortPlugin`                 |      |
| `SortPluginConfig`           |      |
| `SortPluginState`            |      |
| `StatusBar`                  |      |
| `TableActions`               |      |
| `TableBody`                  |      |
| `TableBodyProps`             |      |
| `TableCard`                  |      |
| `TableCardContainer`         |      |
| `TableCardView`              |      |
| `TableCell`                  |      |
| `TableCellProps`             |      |
| `TableColumn`                |      |
| `TableColumnFilter`          |      |
| `TableColumnResizer`         |      |
| `TableConfig`                |      |
| `TableContainer`             |      |
| `TableContainerProps`        |      |
| `TableContextValue`          |      |
| `TableDataSourceApi`         |      |
| `TableDataSourceOptions`     |      |
| `TableDataSourceState`       |      |
| `TableDensity`               |      |
| `TableEmpty`                 |      |
| `TableError`                 |      |
| `TableFetchParams`           |      |
| `TableFetchResult`           |      |
| `TableFetcher`               |      |
| `TableFixedColumn`           |      |
| `TableGrid`                  |      |
| `TableGridProps`             |      |
| `TableHeader`                |      |
| `TableHeaderProps`           |      |
| `TableLoading`               |      |
| `TablePagination`            |      |
| `TablePaginationProps`       |      |
| `TablePlugin`                |      |
| `TableProvider`              |      |
| `TableProviderProps`         |      |
| `TableRow`                   |      |
| `TableRowExpandButton`       |      |
| `TableRowProps`              |      |
| `TableSize`                  |      |
| `TableSortButton`            |      |
| `TableState`                 |      |
| `TableStatusBarProps`        |      |
| `TableStorePageOptions`      |      |
| `TableVirtualBody`           |      |
| `TableVirtualBodyProps`      |      |
| `ToggleEnableRowPlugin`      |      |
| `ToggleEnableRowPluginState` |      |
| `ToggleField`                |      |
| `ToggleFieldProps`           |      |
| `Toolbar`                    |      |
| `ToolbarProps`               |      |
| `UseTablePluginOptions`      |      |
| `UseTablePluginReturn`       |      |
| `UseTableRemoteDataOptions`  |      |
| `UseTableRemoteDataReturn`   |      |
| `UseTableStorePageReturn`    |      |
| `ViewRowPlugin`              |      |
| `ViewRowPluginConfig`        |      |
| `VirtualAlignment`           |      |
| `VirtualDirection`           |      |
| `VirtualList`                |      |
| `VirtualListProps`           |      |
| `VirtualizationConfig`       |      |
| `VisibleRange`               |      |

### 类型与工具函数

| 导出名                       | 说明 |
| ---------------------------- | ---- |
| `applyFilterConditions`      |      |
| `applySearchConditions`      |      |
| `applyTableFilter`           |      |
| `applyTablePagination`       |      |
| `applyTableSearch`           |      |
| `applyTableSort`             |      |
| `calculateFixedColumnStyles` |      |
| `calculateScrollToIndex`     |      |
| `calculateSizeAndPosition`   |      |
| `calculateVisibleRange`      |      |
| `createItemStyle`            |      |
| `createTableDataSource`      |      |
| `defaultCellPlugins`         |      |
| `defaultColumnPlugins`       |      |
| `executeFilterCondition`     |      |
| `filterData`                 |      |
| `formatDateValue`            |      |
| `getDateDisplayValue`        |      |
| `getOffsetProp`              |      |
| `getScrollProp`              |      |
| `getSizeProp`                |      |
| `getTableFixedStyles`        |      |
| `getTotalSize`               |      |
| `parseFormatDateToTimeStamp` |      |
| `parseTimeStampToFormatDate` |      |
| `processTableData`           |      |
| `renderDateComponent`        |      |
| `throttle`                   |      |
| `throttleReactEvent`         |      |
| `toFetchParams`              |      |
| `useHasTableContext`         |      |
| `useHookTableLogic`          |      |
| `useItemSizeCache`           |      |
| `useTableActions`            |      |
| `useTableColumnResize`       |      |
| `useTableConfig`             |      |
| `useTableContext`            |      |
| `useTableEventActions`       |      |
| `useTableI18n`               |      |
| `useTableLogic`              |      |
| `useTablePagination`         |      |
| `useTablePlugin`             |      |
| `useTableRemoteData`         |      |
| `useTableState`              |      |
| `useTableStateSelectors`     |      |
| `useTableStorePage`          |      |
| `useVirtualListPerformance`  |      |
| `useVirtualScroll`           |      |
