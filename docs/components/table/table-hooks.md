# Table Hook 与数据契约

> 表格的状态管理（Context）、逻辑 Hook（分页 / 插件 / 国际化 / 事件 / 业务参数 / 远端数据）与核心数据契约（`TableColumn` / `TableConfig`）。

---

**导入**

```tsx
import {
  TableProvider,
  useTableContext,
  useTableLogic,
  type TableColumn,
  type TableConfig,
} from '@easbot/ui';
```

## 基础用法

`TableProvider` 是表格状态的唯一来源：

```tsx
import { TableProvider, useTableState } from '@easbot/ui';

export default function App() {
  return (
    <TableProvider data={data} columns={columns} config={{ rowKey: 'id', size: 'md' }}>
      <Table />
      <SelectedInfo />
    </TableProvider>
  );
}

function SelectedInfo() {
  const selectedRowKeys = useTableState((state) => state.selectedRowKeys);
  return <div>已选 {selectedRowKeys.length} 行</div>;
}
```

## 上下文（`context/`）

### `TableProvider`

## 属性

| 属性          | 类型                    | 默认值 | 说明                                                                 |
| ------------- | ----------------------- | ------ | -------------------------------------------------------------------- |
| `children`    | `React.ReactNode`       | —      | —                                                                    |
| `data?`       | `Record<string, any>[]` | —      | —                                                                    |
| `columns?`    | `TableColumn[]`         | —      | —                                                                    |
| `config?`     | `TableConfig`           | —      | —                                                                    |
| `loading?`    | `boolean`               | —      | —                                                                    |
| `error?`      | `string \| null`        | —      | —                                                                    |
| `pagination?` | `PaginationState`       | —      | 直接传入的分页信息（优先于 config.pagination），供外部数据源驱动分页 |

`TableProvider` 会为 `config` 填充大量默认值（`createInitialState`），常用默认项：

| 配置项               | 默认值                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rowKey`             | `'id'`                                                                                                                                                                 |
| `displayMode`        | `'table'`                                                                                                                                                              |
| `size` / `density`   | `'md'` / `'default'`                                                                                                                                                   |
| `showHeader`         | `true`                                                                                                                                                                 |
| `stickyHeader`       | `true`（偏移量 `0`）                                                                                                                                                   |
| `paginable`          | `true`（分页默认开启）                                                                                                                                                 |
| `fixedLayout`        | `true`（Grid 固定布局）                                                                                                                                                |
| `scroll`             | `{ x: 'auto', y: 'auto', tableMinWidth: 720, scrollToFirstRowOnChange: true }`                                                                                         |
| `virtualization`     | `{ threshold: 100, height: 400, itemHeight: 48, estimatedItemSize: 48, overscanCount: 8, scrollDirection: 'vertical', scrollToAlignment: 'auto', stickyHeader: true }` |
| `search`             | `{ show: true, showLabel: true, autoSearch: false, maxConditions: 5, collapsible: true, defaultCollapsed: false, mode: 'grid', minFieldWidth: 320, fields: [] }`       |
| `toolbar`            | `{ show: false, maxVisible: 3, showLabel: false, size: 'sm', left: [], right: [] }`                                                                                    |
| `statusBar`          | `{ show: true, size: 'sm' }`                                                                                                                                           |
| `resize`             | `{ minWidth: 80 }`                                                                                                                                                     |
| `rowAction`          | `{ actions: [], maxVisible: 3, showLabel: false, showSeparator: true, width: 160, size: 'sm' }`                                                                        |
| `contextMenu`        | `{ actions: [], size: 'md', showIcon: true, showSeparator: true, align: 'start' }`                                                                                     |
| `columnHeaderAction` | `{ actions: [], maxVisible: 3, showLabel: false, showSeparator: true }`                                                                                                |
| `dataMode`           | `{ sort: 'remote', filter: 'remote', search: 'remote', pagination: 'remote', clearSelectedOnPagination: true }`                                                        |
| `i18n.locale`        | `'zh-CN'`（兜底）                                                                                                                                                      |
| `storePage`          | `{ debounceDelay: 300, triggerOnInit: false }`                                                                                                                         |

### Context Hook

| Hook                      | 返回值                     | 说明                                       |
| ------------------------- | -------------------------- | ------------------------------------------ |
| `useTableContext()`       | `TableContextValue`        | 无 Provider 时抛错                         |
| `useTableState()`         | `TableState`               | 返回完整状态                               |
| `useTableState(selector)` | `selector(state)` 的返回值 | 支持精确订阅，避免全量重渲染               |
| `useTableConfig()`        | `TableConfig`              | 只读配置                                   |
| `useTableActions()`       | `TableActions`             | 全部状态操作                               |
| `useTableLogic()`         | `UseTableLogicReturn`      | 逻辑层（排序 / 筛选 / 分页 / 插件 / 事件） |
| `useHasTableContext()`    | `boolean`                  | 判断是否在 Provider 内（**不抛错**）       |
| `useTableStateSelectors`  | 一组选择器 Hook            | 见下表                                     |

`useTableStateSelectors` 提供细粒度选择器（每个都是一个独立 Hook）：

`useData` / `useColumns` / `useSelectedRowKeys` / `useSelectedCount` / `useIsAllSelected` / `useIsPartialSelected` / `useExpandedRowKeys` / `useExpandedCount` / `useSortState` / `useSortField` / `useSortOrder` / `useFilterState` / `useActiveFilters` / `useSearchState` / `useHasActiveSearch` / `useColumnWidths` / `useLoading` / `useError` / `usePagination` / `usePluginState(pluginId)` / `usePluginStates` / `useConfig` / `useRowKey` / `useSize` / `useDensity` / `useSelectable` / `useSortable` / `useFilterable` / `useExpandable` / `useResizeable` / `usePaginable`

### `TableState`

`TableState`（`context/TableContext.tsx`）的字段：

| 字段              | 类型                                                           | 说明                           |
| ----------------- | -------------------------------------------------------------- | ------------------------------ |
| `config`          | `TableConfig`                                                  | 合并默认值后的最终配置         |
| `data`            | `Record<string, any>[]`                                        | 当前数据                       |
| `columns`         | `TableColumn[]`                                                | 当前列配置                     |
| `selectedRowKeys` | `(string \| number)[]`                                         | 选中的行键                     |
| `expandedRowKeys` | `(string \| number)[]`                                         | 展开的行键                     |
| `sortState`       | `{ columnName: string \| null; order: SortDirection \| null }` | 排序状态                       |
| `filterState`     | `FilterState`                                                  | 筛选状态（键为 `column.name`） |
| `searchState`     | `SearchState`                                                  | 搜索状态（键为字段 name）      |
| `columnWidths`    | `Record<string, number>`                                       | 列宽（键为 `column.name`）     |
| `loading`         | `boolean`                                                      | 加载态                         |
| `error`           | `string \| null`                                               | 错误信息                       |
| `pagination`      | `PaginationState`                                              | 分页状态                       |
| `pluginStates`    | `Record<string, any>`                                          | 各插件的私有状态               |
| `lastQueryParams` | `BusinessQueryParams`                                          | 最后一次提交的业务查询参数     |

### `TableActions`

`TableActions` 提供全部状态操作（`useTableActions()` 获取）：

| 分组    | 方法                                                                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 配置    | `updateConfig(config)`                                                                                                                                         |
| 数据    | `setData(data)` / `updateItem(rowKey, updates)` / `removeItem(rowKey)` / `addItem(item, index?)` / `setColumns(columns)` / `updateColumn(columnName, updates)` |
| 选择    | `setSelectedRowKeys(keys)` / `toggleRowSelection(key)` / `selectAll()` / `clearSelection()`                                                                    |
| 展开    | `setExpandedRowKeys(keys)` / `toggleRowExpansion(key)` / `expandAll()` / `collapseAll()`                                                                       |
| 排序    | `setSort(columnName, order)` / `setSortState(state)` / `clearSort()`                                                                                           |
| 筛选    | `setFilter(columnKey, value)` / `setFilterState(state)` / `clearFilter(columnKey?)`                                                                            |
| 搜索    | `setSearchCondition(fieldKey, condition)` / `removeSearchConditionByField(fieldKey)` / `setSearchState(state)` / `clearSearch()`                               |
| 插件    | `setPluginState(pluginId, state)` / `getPluginState(pluginId)` / `clearPluginState(pluginId)` / `clearAllPluginStates()`                                       |
| 列宽    | `setColumnWidth(columnKey, width)` / `resetColumnWidths()`                                                                                                     |
| 分页    | `updatePagination(pagination)`                                                                                                                                 |
| UI 状态 | `setLoading(loading)` / `setError(error)`                                                                                                                      |
| 业务    | `updateLastQueryParams(params)`                                                                                                                                |
| 重置    | `reset(data?, columns?, config?)` / `reload(resetToFirstPage?, keepFilters?, keepSorting?)`                                                                    |

> `reload` 的默认参数是 `(false, true, true)` —— 不重置到第一页、保留筛选、保留排序；返回 `Promise<boolean>`。

## 逻辑 Hook（`hooks/`）

### `useHookTableLogic`

`useHookTableLogic(tableContext, options?)` 是**唯一的逻辑实例**（由 `TableProvider` 内部调用并挂到 `context.tableLogic`）。它返回 `UseTableLogicReturn`：

| 分组                 | 方法                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`              | `TableState`                                                                                                                                                                                                                        |
| `actions`            | `TableActions`                                                                                                                                                                                                                      |
| `selection`          | `selectAll()` / `clearSelection()` / `toggleRowSelection(key)` / `getSelectedRows()` / `isAllSelected()` / `isIndeterminate()`                                                                                                      |
| `sort`               | `setSort(columnName, order)` / `toggleSort(columnName)` / `getSortedData(inputData?)` / `isLocalMode()`                                                                                                                             |
| `filter`             | `setFilter(columnName, value)` / `clearFilter(columnName?)` / `getFilteredData(inputData?)` / `isLocalMode()`                                                                                                                       |
| `search`             | `setSearchCondition(fieldKey, condition)` / `removeSearchCondition(fieldKey)` / `setSearchState(state)` / `clearSearch()` / `getSearchedData(inputData?)` / `isLocalMode()` / `getSearchConditionCount()` / `hasSearchConditions()` |
| `expansion`          | `expandAll()` / `collapseAll()` / `toggleRowExpansion(key, record)`                                                                                                                                                                 |
| `resize`             | `setColumnWidth(field, width)` / `resetColumnWidths()`                                                                                                                                                                              |
| `pagination`         | `UseTablePaginationLogicReturn`（见下）                                                                                                                                                                                             |
| `plugin`             | `UseTablePluginReturn`（见 [插件系统篇](./table-plugins.md)）                                                                                                                                                                       |
| `i18n`               | `UseTableI18nReturn`                                                                                                                                                                                                                |
| `storePage`          | `UseTableStorePageReturn`                                                                                                                                                                                                           |
| `actionEvents`       | `UseTableActionsReturn`                                                                                                                                                                                                             |
| `columnWidths`       | `Array<{ width?: number; minWidth?: number; maxWidth?: number }>` —— 供 `<colgroup>` 使用                                                                                                                                           |
| `getProcessedData()` | 按 搜索 → 筛选 → 排序 → 分页 的顺序返回处理后的数据（本地模式）                                                                                                                                                                     |

**`getProcessedData` 的处理顺序**固定为：搜索 → 筛选 → 排序 → 分页。远程模式下对应步骤直接跳过。

### `useTablePagination`

```tsx
import { useTablePagination } from '@easbot/ui';
```

| 方法 / 字段                     | 说明                                                  |
| ------------------------------- | ----------------------------------------------------- |
| `pagination`                    | 当前 `PaginationState`                                |
| `paginationConfig`              | 归一化后的 `PaginationConfig`（含默认 layout / 选项） |
| `setPageNo(pageNo)`             | 设置页码                                              |
| `setPageSize(pageSize)`         | 设置每页条数（**自动重置到第 1 页**）                 |
| `setTotal(total)`               | 设置总数                                              |
| `setShowPagination(show?)`      | 设置分页条显隐（写入 `pagination.show`）              |
| `updatePagination(pagination?)` | 合并更新分页状态                                      |
| `getPaginationProps()`          | 返回可直接透传给分页组件的属性集合                    |
| `getPaginatedData(data)`        | 本地分页（远程模式下原样返回）                        |
| `showPagination`                | 是否应显示分页条（`paginable && pagination.show`）    |

`paginationConfig` 的默认值：`showSizeChanger: true`、`showQuickJumper: true`、`pageSizeOptions: [10, 20, 50, 100]`、`showTotal: true`、`showPagination: true`、`simple: false`、`position: 'right'`、`layout: ['total', 'perPage', 'pager', 'go']`、`maxButtons: 5`。

### `useTableI18n`

```tsx
import { useTableI18n } from '@easbot/ui';

const {
  t,
  locale,
  messages,
  setLocale,
  getLocalizedText,
  translateWithMessages,
  getSupportedLocales,
  isLocaleSupported,
} = useTableI18n({
  locale: 'en-US',
});
```

- `t(key, params?)` 支持点号路径（如 `'pagination.totalInfo'`）与 `{param}` 插值；找不到 key 时**返回 key 本身**。
- 默认内置 `zh-CN` + `en-US` 两套文案。
- 未显式传 `locale` 时会跟随客户端语言（`getLocaleOnClient`），并在客户端语言变化时同步。

### `useTableEventActions`

Action 事件系统（详见下文「Action 事件系统」）：

| 方法                                            | 说明                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| `emitAction(actionKey, data, context, action?)` | 触发事件，返回 `ActionEmitResult`              |
| `onAction(actionKey, handler, options?)`        | 注册监听器，返回取消订阅函数                   |
| `offAction(actionKey, listenerId?)`             | 移除监听器（不传 id 则移除该 key 的全部）      |
| `offAllActions(filter?)`                        | 批量移除，返回 `{ removedKeys, totalRemoved }` |
| `getRegisteredActionKeys()`                     | 查看已注册的 action                            |
| `hasActionListeners(actionKey)`                 | 是否有监听器                                   |
| `getActionListenerCount(actionKey)`             | 监听器数量                                     |

监听器选项 `ActionListenerOptions`：`once` / `priority`（越小越先执行）/ `condition` / `debounce` / `throttle`。

### `useTableStorePage`

业务参数提交 Hook —— 监听表格状态变化，把分页 / 排序 / 筛选 / 搜索参数提交给外部系统。

| 字段 / 方法                      | 说明                                                 |
| -------------------------------- | ---------------------------------------------------- |
| `currentParams`                  | 当前参数 `{ pagination, sort, filter, search, ... }` |
| `submitParams(customParams?)`    | 手动提交一次参数                                     |
| `resetParams()`                  | 重置（内部调用 `actions.reset()`）                   |
| `isSubmitting`                   | 是否正在提交                                         |
| `toDataStorePageSchema(params?)` | 转换为 `DataStorePage` 格式                          |

配置项（`TableStorePageConfig`，也可用 `config.storePage` 传）：`onParamsChange` / `onPageChange` / `debounceDelay`（默认 300ms）/ `triggerOnInit`（默认 false）/ `extractParams` / `compareParams`。

**自动提交规则**：参数变化后经防抖延迟提交；提交前会**清空选择与展开状态**（`dataMode.clearSelectedOnPagination !== false` 时），避免跨页误操作。

**比较规则**（默认 `compareParams`）：分页只比较 `pageNo` / `pageSize` / `reloadTrigger`（**忽略 `total`**，避免后端回写 total 触发二次请求）；排序双方都为空时视为相等；筛选 / 搜索做深度比较。

### `useTableRemoteData`

远端数据 Hook —— 把 `useTableStorePage` 产出的分页契约接到消费方注入的 `fetcher`。

```tsx
import { TableProvider, useTableRemoteData, useTableContext } from '@easbot/ui';

export default function App() {
  return (
    <TableProvider columns={columns}>
      <RemoteTable />
    </TableProvider>
  );
}

// 必须在 TableProvider 内部使用 —— 该 Hook 需要读写 TableContext
function RemoteTable() {
  const tableContext = useTableContext();
  const { data, loading, error, total, refresh } = useTableRemoteData(tableContext, {
    fetcher: async ({ pageNo, pageSize, sorting, filter, params }) => {
      const res = await api.getUsers({ pageNo, pageSize, sorting, filter, ...params });
      return { list: res.rows, total: res.total }; // 需解包成 { list, total }
    },
    onError: (err) => toast.error(err.message),
  });

  return <div>{loading ? '加载中' : `${data.length} / ${total}`}</div>;
}
```

| 选项 / 返回值                          | 说明                                         |
| -------------------------------------- | -------------------------------------------- |
| `fetcher`（必填）                      | 请求函数；需把响应解包成 `{ list?, total? }` |
| `defaultPageSize`                      | 默认每页条数（默认 10）                      |
| `autoLoad`                             | 是否在初始化时自动请求（默认 true）          |
| `onError` / `onSuccess`                | 请求失败 / 成功回调                          |
| `data` / `loading` / `error` / `total` | 状态回写（已同步进 `TableContext`）          |
| `refresh()`                            | 复用上次查询条件重新请求                     |
| `submitParams(customParams?)`          | 手动触发一次参数提交                         |

**注意**：`useTableRemoteData` 内部会把 `data` / `loading` / `error` / `total` **回写进 `TableContext`**，因此通常应与 `TableProvider` 配合使用（在 Provider 内部使用该 Hook）。

## 数据契约（`types/`）

### `TableColumn`

`TableColumn` 继承 `UniversalFieldConfig`，是列配置的完整契约：

| 字段                                                            | 类型                                                                                                         | 说明                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `name`                                                          | `string`                                                                                                     | **必填**，列唯一标识                     |
| `title`                                                         | `string`                                                                                                     | **必填**，列标题                         |
| `dataIndex`                                                     | `string`                                                                                                     | **必填**，数据字段（支持 `'a.b'` 嵌套）  |
| `type?`                                                         | `'text' \| 'number' \| 'date' \| 'boolean' \| 'tag' \| 'image' \| 'link' \| 'json' \| 'actions' \| 'custom'` | 列类型，决定渲染方式                     |
| `dataType?`                                                     | `DataType`                                                                                                   | 数据类型（后端交互用，默认 `string`）    |
| `dateType?`                                                     | `DateComponentType`                                                                                          | 日期组件类型（`dataType === 'date'` 时） |
| `description?` / `tooltip?`                                     | `string`                                                                                                     | 描述 / 提示                              |
| `width?` / `minWidth?` / `maxWidth?`                            | `number \| string` / `number` / `number`                                                                     | 列宽约束                                 |
| `fixed?`                                                        | `'left' \| 'right'`                                                                                          | 固定位置                                 |
| `align?`                                                        | `'left' \| 'center' \| 'right'`                                                                              | 对齐方式                                 |
| `visible?`                                                      | `boolean`                                                                                                    | 是否可见（`false` 时不渲染该列）         |
| `sortable?`                                                     | `boolean`                                                                                                    | 是否可排序                               |
| `sorter?`                                                       | `boolean \| ((a, b, sortState?) => number)`                                                                  | 自定义排序器                             |
| `onSort?`                                                       | `(field: string, order: SortDirection \| null) => void`                                                      | 排序回调（回调的是 `dataIndex`）         |
| `filterable?`                                                   | `boolean`                                                                                                    | 是否可筛选                               |
| `filterer?`                                                     | `(value: any, record) => boolean`                                                                            | 自定义筛选器                             |
| `onFilter?`                                                     | `(columnName: string, value: FilterValue \| undefined) => boolean`                                           | 筛选回调                                 |
| `filterMultiple?` / `filterOp?`                                 | `boolean` / `FilterOperator`                                                                                 | 多选筛选 / 默认操作符                    |
| `ellipsis?`                                                     | `boolean`                                                                                                    | 是否截断文本（会加 `title` 提示）        |
| `render?`                                                       | `(value, record, index) => ReactNode`                                                                        | 自定义渲染                               |
| `formatter?` / `parser?`                                        | `(value, record) => string` / `(value: string, record) => any`                                               | 格式化 / 解析（互逆）                    |
| `editable?` / `readOnly?`                                       | `boolean`                                                                                                    | 是否可编辑 / 只读                        |
| `editRender?`                                                   | `(value, onChange, column?, record?) => ReactNode`                                                           | 自定义编辑渲染                           |
| `editConfig?`                                                   | `EditorConfig`                                                                                               | 编辑器配置                               |
| `resizeable?`                                                   | `boolean`                                                                                                    | 是否可调整列宽                           |
| `colSpan?` / `rowSpan?`                                         | `number \| string`                                                                                           | 合并单元格                               |
| `group?`                                                        | `string`                                                                                                     | 列分组                                   |
| `attrs?` / `styles?`                                            | `Record<string, any>`                                                                                        | 列属性 / 列样式                          |
| `className?` / `style?`                                         | `string` / `React.CSSProperties`                                                                             | 类名 / 内联样式                          |
| `headerStyle?` / `cellStyle?`                                   | `React.CSSProperties`                                                                                        | 表头 / 单元格样式                        |
| `options?`                                                      | `Array<{ label: string; value: string; disabled?: boolean }>`                                                | 选项列表（枚举 / 多选）                  |
| `dateConfig?` / `enumConfig?` / `listConfig?` / `objectConfig?` | `DateConfig` / `EnumConfig` / `ListConfig` / `ObjectConfig`                                                  | 各类型的细粒度配置                       |
| `placeholder?`                                                  | `string \| string[]`                                                                                         | 占位符                                   |
| `multiple?`                                                     | `boolean`                                                                                                    | 是否多选                                 |

### `TableConfig`

`TableConfig` 是表格的总配置（`BaseTableProps` 继承它）。字段分组：

| 分组     | 字段                                                                                                                                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 基础     | `rowKey` / `displayMode` / `tableId` / `size` / `density` / `bordered` / `striped` / `hoverable` / `clickable` / `showHeader` / `stickyHeader` / `stickyHeaderOffset` / `fixedLayout`                                                                                                                                    |
| 功能开关 | `selectable` / `sortable` / `filterable` / `searchable` / `expandable` / `resizeable` / `fixedable` / `virtualizable` / `paginable` / `contextMenuable` / `rowActionable` / `columnHeaderActionable` / `toolbarable` / `statusBarable` / `pluginable` / `cacheable` / `persistable` / `memoizationable` / `deferredable` |
| 配置块   | `selection` / `sort` / `filter` / `search` / `expansion` / `resize` / `pagination` / `toolbar` / `statusBar` / `rowAction` / `columnHeaderAction` / `contextMenu` / `card` / `scroll` / `virtualization` / `i18n` / `plugin` / `cache` / `dataMode` / `storePage` / `api` / `upload`                                     |
| 其他     | `persistent`（`'local' \| 'session' \| 'none'`）/ `style` / `eventListeners`                                                                                                                                                                                                                                             |

`TableConfig` 中**未导出**的类型别名（源码中定义但未从包根导出）：`ActionConfig` / `ActionInteractionModel` / `ActionEventConfig` / `ActionEventData` / `TableActionConfig` / `TableRowActionConfig` / `TableCellActionConfig` / `TableColumnActionConfig` / `RowActionConfig` / `ColumnActionConfig` / `ContextMenuConfig` / `ToolbarConfig` / `StatusBarConfig` / `SearchConfig` / `SearchFieldConfig` / `PaginationConfig` / `CardConfig` / `ResizeConfig` / `I18nConfig` / `PluginConfig` / `CacheConfig` / `DataModeConfig` / `EmptyConfig` / `LoadingConfig` / `BusinessQueryParams` / `TableStorePageConfig` / `EditorConfig` / `EditorType` / `DateConfig` / `EnumConfig` / `ListConfig` / `ObjectConfig` / `FieldRules` / `GetRowKey` / `TableColumnType` / `DataType` / `FilterValue` / `FilterState` / `SearchCondition` / `SearchState` / `SortState` / `PaginationState` / `SelectionType` / `TableTheme` / `TableVariant` / `TableDisplayMode` / `CardLayoutMode` / `CardSize` / `TableActionVariant` / `ContextMenuAlign` / `ToolbarActionConfig` / `ToolbarActionPosition` / `UniversalFieldConfig` / `PerformanceConfig` / `StyleConfig` / `TableEventListenerConfig`。

> 📌 从包根**已导出**的表格类型只有这些：`TableColumn` / `TableConfig` / `TableSize` / `TableDensity` / `ColumnAlign` / `FixedPosition` / `SortDirection` / `DateComponentType` / `ScrollConfig` / `VirtualizationConfig` / `SelectionConfig` / `ExpansionConfig` / `SortConfig` / `FilterConfig` / `TablePlugin` / `UseTablePluginOptions` / `UseTablePluginReturn` / `TableState` / `TableActions` / `TableContextValue` / `TableProviderProps` / `TableStorePageOptions` / `UseTableStorePageReturn` / `UseTableRemoteDataOptions` / `UseTableRemoteDataReturn` / `TableFetchParams` / `TableFetchResult` / `TableFetcher` / `TableDataSourceApi` / `TableDataSourceOptions` / `TableDataSourceState`。

### 核心枚举

| 类型                | 取值                                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TableSize`         | `'sm' \| 'md' \| 'lg'`                                                                                                                                                       |
| `TableDensity`      | `'compact' \| 'default' \| 'comfortable'`                                                                                                                                    |
| `ColumnAlign`       | `'left' \| 'center' \| 'right'`                                                                                                                                              |
| `FixedPosition`     | `'left' \| 'right'`                                                                                                                                                          |
| `SortDirection`     | `'asc' \| 'desc'`                                                                                                                                                            |
| `SelectionType`     | `'single' \| 'multiple'`                                                                                                                                                     |
| `TableColumnType`   | `'text' \| 'number' \| 'date' \| 'boolean' \| 'tag' \| 'image' \| 'link' \| 'json' \| 'actions' \| 'custom'`                                                                 |
| `DataType`          | `'string' \| 'number' \| 'int' \| 'float' \| 'long' \| 'double' \| 'boolean' \| 'date' \| 'enum' \| 'list' \| 'object'`                                                      |
| `FilterOperator`    | `'eq' \| 'ne' \| 'gt' \| 'ge' \| 'lt' \| 'le' \| 'like' \| 'notlike' \| 'between' \| 'notbetween' \| 'in' \| 'notin' \| 'isnull' \| 'isnotnull' \| 'startwith' \| 'endwith'` |
| `DateComponentType` | `'date' \| 'date-range' \| 'datetime' \| 'datetime-range' \| 'time' \| 'time-range'`                                                                                         |

### 动作契约（`ActionConfig`）

所有操作（工具栏 / 行操作 / 列头操作 / 单元格操作 / 右键菜单）共用 `ActionConfig` 基类，按层级派生出 `TableActionConfig` / `TableRowActionConfig` / `TableCellActionConfig` / `TableColumnActionConfig` / `ContextMenuActionConfig`，差异只在 `when` / `execute` / `render` 的**第一个参数类型**：

| 层级     | `when` / `execute` / `render` 第一个参数         |
| -------- | ------------------------------------------------ |
| 表格级   | `selectedRows?: Record<string, any>[]`（选中行） |
| 行级     | `record?: Record<string, any>`（当前行）         |
| 列级     | `column?: TableColumn`（当前列）                 |
| 单元格级 | `record?` + `column?`                            |

`ActionConfig` 的 `interaction`（`ActionInteractionModel`）支持 9 种交互类型：`'confirm'` / `'prompt'` / `'modal'` / `'drawer'` / `'dialog'` / `'menu'` / `'page'` / `'direct'` / `'custom'`。

### Action 事件系统

`ActionEventData`（事件负载）：

| 字段               | 类型                                                        | 说明                       |
| ------------------ | ----------------------------------------------------------- | -------------------------- |
| `record?`          | `Record<string, any>`                                       | 行操作时的当前行           |
| `selectedRows?`    | `Record<string, any>[]`                                     | 工具栏操作时的选中行       |
| `rowIndex?`        | `number`                                                    | 行索引                     |
| `originalEvent?`   | `React.MouseEvent`                                          | 原始事件对象               |
| `payload?`         | `any`                                                       | 自定义数据                 |
| `timestamp?`       | `number`                                                    | 事件时间戳                 |
| `source?`          | `'plugin' \| 'user' \| 'system'`                            | 事件来源                   |
| `interactionType?` | `ActionInteractionModel['type']`                            | 交互类型                   |
| `hardDelete?`      | `boolean`                                                   | 是否物理删除（仅删除操作） |
| `result?`          | `{ success: boolean; data?: any; error?: Error \| string }` | 操作结果（after 事件）     |

监听器可以通过 `config.eventListeners` 声明式注册：

```tsx
config={{
  eventListeners: {
    'table-row-delete': {
      actionKey: 'table-row-delete',
      handler: async (data) => {
        await api.delete(data.record.id);
        return { success: true };
      },
      options: { once: false, priority: 1 },
    },
  },
}}
```

## 远端数据源

`store/tableDataSource.ts` 提供一个**不绑定任何 HTTP 客户端**的数据容器：

```tsx
import { createTableDataSource, toFetchParams } from '@easbot/ui';

const dataSource = createTableDataSource({
  fetcher: async ({ pageNo, pageSize, sorting, filter, params }) => {
    const res = await api.getUsers({ pageNo, pageSize, sorting, filter, ...params });
    return { list: res.rows, total: res.total };
  },
  defaultPageSize: 20,
  onError: (err) => console.error(err),
});

const unsubscribe = dataSource.subscribe((state) => {
  console.log(state.data, state.total, state.loading);
});

await dataSource.fetch({ pageNo: 2 });
await dataSource.reload(); // 复用上次查询条件
dataSource.setData(rows);
dataSource.setTotal(100);
dataSource.destroy();
```

**契约类型**

| 类型                     | 说明                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `TableFetchParams`       | 请求参数：`pageNo` / `pageSize` / `sorting?` / `filter?` / `params?`                         |
| `TableFetchResult`       | 响应契约：`list?` / `total?` / `pageNo?` / `pageSize?` + 透传字段                            |
| `TableFetcher`           | `(params, context?: { signal?: AbortSignal }) => Promise<TableFetchResult>`                  |
| `TableDataSourceState`   | 状态快照：`data` / `loading` / `error` / `total` / `pageNo` / `pageSize`                     |
| `TableDataSourceOptions` | 配置：`fetcher` / `defaultPageSize` / `defaultTotal` / `onSuccess` / `onError`               |
| `TableDataSourceApi`     | 操作接口：`getState` / `subscribe` / `fetch` / `reload` / `setData` / `setTotal` / `destroy` |

**关键行为**

- **请求参数先落地**：`fetch` 时先把参数写入内部 `lastParams`，保证 `reload()` 能复用上次查询条件，不依赖后端回传。
- **竞态保护**：每次请求递增序号，响应回来时校验序号，**过期响应直接丢弃**；同时通过 `AbortController` 主动中止上一次在途请求。
- **四态统一管理**：`data` / `loading` / `error` / `total` 由容器维护。
- **`toFetchParams(page)`**：把 `DataStorePage` 转成 `TableFetchParams`，剔除响应侧字段（`list` / `total` / `fields` / `context`）。

## 业务工具函数

`utils/businessUtils.ts` 提供本地数据处理的纯函数（可直接在消费方复用）：

| 函数                                                             | 作用                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| `executeFilterCondition(recordValue, operator, value, dataType)` | 单个筛选条件求值                                      |
| `applyFilterConditions(record, filterState, getFieldValue?)`     | 一组筛选条件求值（AND 组合）                          |
| `applySearchConditions(record, searchState, getFieldValue?)`     | 搜索条件求值                                          |
| `applyTableFilter(data, filterState, options?)`                  | 对数据集应用筛选                                      |
| `applyTableSearch(data, searchState, options?)`                  | 对数据集应用搜索                                      |
| `applyTableSort(data, sortState?, columns?)`                     | 对数据集应用排序（按 `column.sorter` 或 `dataIndex`） |
| `applyTablePagination(data, paginationState?)`                   | 本地分页                                              |
| `processTableData(data, options)`                                | 按 搜索 → 筛选 → 排序 → 分页 依次处理                 |
| `filterData`                                                     | `processTableData` 的别名                             |

> `processTableData` 的入参形状：`{ filterState, searchState, sortState, paginationState, dataMode, columns }`。

## 无障碍

- 所有 Hook 本身**不产生 DOM**，无障碍由渲染层（表格语义结构、`role="checkbox"` 的选择框、带 `title` / `aria-label` 的图标按钮）承担。
- `useTableEventActions` 的监听器回调可以返回 `{ success: boolean }`；在 `interactionType` 为 `'confirm'` / `'prompt'` 时，某个监听器抛错会**中断后续监听器**（避免确认被多次执行）。
- `useTableStorePage` 的 `debounceDelay` 默认 300ms —— 连续输入时不会每敲一个字符就发一次请求。
- `useTableRemoteData` 的 `fetcher` 收到 `context.signal`，组件卸载时会 `destroy()` 数据源并中止在途请求，避免竞态与内存泄漏。

## 注意事项

- **所有 Context Hook 都必须在 `TableProvider` 内使用**：`useTableContext` / `useTableLogic` / `useTableActions` / `useTableConfig` 在无 Provider 时抛 `useTableContext must be used within a TableProvider`；`useHasTableContext` 是唯一不抛错的。
- **`useTableState(selector)` 的 `selector` 每次渲染都会重建**：`useMemo` 的依赖包含 `selector`，因此每次渲染都会重新计算（只影响引用相等性，不影响正确性）。需要稳定引用时请用 `useCallback` 包裹，或改用 `useTableStateSelectors`。
- **`TableActions` 每次状态变化都会重建**：`actions` 用 `useMemo([state])` 记忆化。把它放进 `useEffect` 依赖数组会形成「state 变化 → actions 变化 → 副作用重跑 → dispatch → state 变化」的死循环 —— `useTableRemoteData` 内部用 ref 持有最新 actions 来规避这个问题，消费方也应如此。
- **排序 / 筛选 / 搜索 / 分页变更会自动重置到第 1 页**（`actions` 中对应 setter 内部实现）。
- **本地模式与远程模式由 `dataMode` 决定**：`'remote'` 时组件库**不改动数据**，只写状态；`'local'` 时才用上文的纯函数处理数据。
- **`dataMode` 默认为全 `'remote'`**：`AdvancedTable` 也一样 —— 本地场景必须显式覆盖。
- **`clearSelectedOnPagination` 默认为 `true`**：查询条件变化时会清空选择与展开状态，避免跨页误操作；设为 `false` 可保留。
- **`pagination.show` 是分页条显隐的唯一字段**：写 `showPagination` 无效（`PaginationConfig` 里虽然也有 `showPagination` 字段，但 `useTablePagination` 的 `setShowPagination` 写的是 `show`）。
- **`useTableStorePage` 的 `compareParams` 忽略分页 `total`**：避免后端回写 total 触发二次请求。
- **`useTableStorePage` 的 `isSubmitting` 用 ref 维护**：返回的值在同一次渲染内可能滞后，提交密集场景请以 `submitParams` 的 Promise 为准。
- **数据类型映射**：表格侧的 `DataType` 中的通用 `'number'` 在转成后端 `FilterDataType` 时统一收敛为 `'double'`（后端契约不含通用数字类型）。
- **多字段搜索会生成 OR 规则组**：单个字段直接生成表达式，多字段生成 `logic: 'or'` 的子规则组。
- **`TableProvider` 的 `data` / `columns` 变化会被监听并写回内部状态**（用 `deepValueEqual` 比较），无需手动调 `setData`。
- **`TableProvider` 的 `pagination` prop 优先于 `config.pagination`**，用于外部数据源驱动分页。
- **`state.pluginStates` 的更新是深合并**：`undefined` 会被跳过，无法通过 `updatePluginState(id, { x: undefined })` 删除字段。

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
