# Table 插件系统

> 以「贡献点 + 动作」的方式给表格扩展工具栏按钮、行操作、列头按钮与单元格操作，18 个内置插件开箱即用。

---

**导入**

```tsx
import { AdvancedTable, ExportPlugin, RefreshPlugin, type TablePlugin } from '@easbot/ui';
```

## 基础用法

插件通过 `config.plugin` 传入。**不传 `plugins` 时会自动加载全部内置插件**：

```tsx
import { AdvancedTable } from '@easbot/ui';

export default function App() {
  return <AdvancedTable data={data} columns={columns} />;
}
```

只启用部分插件：

```tsx
import { AdvancedTable, ExportPlugin, RefreshPlugin } from '@easbot/ui';
import type { TablePlugin } from '@easbot/ui';

const plugins: TablePlugin[] = [ExportPlugin, RefreshPlugin];

export default function App() {
  return (
    <AdvancedTable
      data={data}
      columns={columns}
      config={{
        pluginable: true,
        plugin: { plugins, config: { export: { formats: ['csv', 'json'] } } },
      }}
    />
  );
}
```

关闭某个内置插件（`config` 里对应插件 id 设为 `enabled: false`）：

```tsx
config={{
  pluginable: true,
  plugin: {
    config: {
      print: { enabled: false },
      moveRow: { enabled: false },
    },
  },
}}
```

> ✅ 字段名统一为 **`enabled`**，与 `TablePlugin['config']` 的类型声明一致 —— 传 `enabled: false` 即可关闭该插件。

## 插件架构

### 生命周期

```
useTablePlugin(tableContext, { plugins, context, config })
  ├── useEffect：插件列表变化时重新初始化
  │     ├── 注销已移除的插件 → 调用 plugin.destroy(context) → clearPluginState
  │     └── 注册新增的插件
  │           ├── 检查 dependencies（缺失则 console.warn 并跳过）
  │           ├── deepMerge(plugin.config, config[pluginId])
  │           └── config.enabled === false → 跳过
  │           └── 调用 plugin.init(context)
  └── 返回 UseTablePluginReturn
```

### 贡献点（Contribution Point）

插件通过 `action.position` 声明渲染位置。位置常量定义在 `types/hooks.ts` 的 `TablePluginContributionPoint` 枚举中（**该枚举未从包根导出**，仅内部使用）：

| 枚举值              | 字符串值           | 渲染位置                   |
| ------------------- | ------------------ | -------------------------- |
| `TOOLBAR_LEFT`      | `toolbar.left`     | 工具栏左侧（带文字标签）   |
| `TOOLBAR_RIGHT`     | `toolbar.right`    | 工具栏右侧（纯图标）       |
| `TOOLBAR`           | `toolbar`          | 工具栏通用（默认落到右侧） |
| `SEARCH_PANEL`      | `search.panel`     | 搜索面板                   |
| `TABLE_HEADER`      | `table.header`     | 表格头部                   |
| `TABLE_FOOTER`      | `table.footer`     | 表格底部                   |
| `ROW_ACTIONS`       | `row.actions`      | 行操作列                   |
| `ROW_CONTEXT_MENU`  | `row.contextMenu`  | 行右键菜单                 |
| `COLUMN_ACTIONS`    | `column.actions`   | 列操作                     |
| `COLUMN_HEADER`     | `column.header`    | 列头                       |
| `COLUMN_FOOTER`     | `column.footer`    | 列底部                     |
| `CELL_CONTENT`      | `cell.content`     | 单元格内容                 |
| `CELL_OVERLAY`      | `cell.overlay`     | 单元格覆盖层               |
| `CELL_CONTEXT_MENU` | `cell.contextMenu` | 单元格右键菜单             |
| `CELL_ACTIONS`      | `cell.actions`     | 单元格操作                 |

`position` 是**数组**，一个动作可以同时出现在多个位置（如 `EditRowPlugin` 同时出现在 `row.actions` 与 `row.contextMenu`）。

### 插件接口

`TablePlugin`（`types/hooks.ts`）的真实字段：

| 字段                   | 类型                                                 | 说明                                                          |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| `id?`                  | `string`                                             | 插件 ID（缺省用 `name` 作为键）                               |
| `name`                 | `string`                                             | 插件名（必填）                                                |
| `type?`                | `'data' \| 'ui' \| 'action' \| 'hybrid'`             | 插件类型                                                      |
| `positionType?`        | `'table' \| 'row' \| 'column' \| 'cell'`             | 位置层级 —— 决定 `execute` 收到的第一个参数是选中行还是当前行 |
| `description?`         | `string`                                             | 描述                                                          |
| `version?`             | `string`                                             | 版本                                                          |
| `dependencies?`        | `string[]`                                           | 依赖的插件 ID 列表                                            |
| `config?`              | `{ enabled?: boolean; [key: string]: any }`          | 插件配置                                                      |
| `features?`            | `string[]`                                           | 功能标记                                                      |
| `defaultState?`        | `any`                                                | 默认状态                                                      |
| `messages?`            | `TablePluginMessages`                                | 国际化消息（按 locale 分桶）                                  |
| `hooks?`               | `Record<string, (...args: any[]) => any>`            | 自定义钩子                                                    |
| `init?`                | `(context: TablePluginContext) => void`              | 初始化                                                        |
| `destroy?`             | `(context: TablePluginContext) => void`              | 销毁                                                          |
| `enable?` / `disable?` | `(context: TablePluginContext) => void`              | 启用 / 禁用                                                   |
| `updateConfig?`        | `(config: any, context: TablePluginContext) => void` | 更新配置                                                      |
| `transformData?`       | `(data, context) => data`                            | 数据转换（当前实现为恒等）                                    |
| `transformColumns?`    | `(columns, context) => columns`                      | 列转换（当前实现为恒等）                                      |
| `onEvent?`             | `(event: string, ...args: any[]) => void`            | 事件处理                                                      |
| `commands?`            | `TablePluginCommand[]`                               | 命令定义                                                      |
| `menus?`               | `TablePluginMenuItem[]`                              | 菜单项定义                                                    |
| `actions?`             | `TablePluginActionConfig[]`                          | **动作配置** —— 实际的 UI 渲染与交互定义                      |

> ⚠️ `types/hooks.ts` 中的 `TablePluginContext` / `TablePluginPosition` / `TablePluginType` 等类型**没有从包根导出**，自定义插件时需要从 `@easbot/ui` 外部导入会失败 —— 请在消费方自行定义最小类型，或直接用 `TablePlugin`（已导出）的结构字面量。

### 插件上下文

`TablePluginContext`（未从包根导出）包含：

| 字段                     | 说明                                                      |
| ------------------------ | --------------------------------------------------------- |
| `tableContext`           | `TableContextValue` —— 读取表格状态与操作                 |
| `updateState?`           | 更新本插件的状态（写入 `state.pluginStates[pluginId]`）   |
| `emit?` / `on?` / `off?` | 事件发射 / 订阅 / 退订                                    |
| `processMessage?`        | i18n 文案处理函数（由 `useHookTableLogic` 注入）          |
| `[key: string]: any`     | 扩展字段（实际注入 `pluginId` / `state` / `updateState`） |

### 动作配置

`actions` 数组的每一项是一个 `TablePlugin*ActionConfig`，继承 `ActionConfig`（`types/base.ts`）：

| 字段              | 类型                                     | 说明                                                                          |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `key`             | `string`                                 | **必填**，动作唯一标识，也是事件 key                                          |
| `label`           | `ReactNode \| (...args) => ReactNode`    | 显示文本（可以是 i18n key）                                                   |
| `icon`            | `ReactNode \| (...args) => ReactNode`    | 图标（字符串时按 `Icon` 的 name 渲染）                                        |
| `position`        | `TablePlugin*Position[]`                 | **必填**，贡献点数组                                                          |
| `priority?`       | `number`                                 | 优先级（越小越靠前，默认 100）                                                |
| `group?`          | `string`                                 | 分组（相邻不同组之间插入分隔线）                                              |
| `variant?`        | `TableActionVariant`                     | 按钮样式                                                                      |
| `size?`           | `TableSize`                              | 按钮尺寸                                                                      |
| `showLabel?`      | `boolean`                                | 是否显示文字标签                                                              |
| `showInMore?`     | `boolean`                                | 是否放进「更多」菜单                                                          |
| `disabled?`       | `boolean \| (...args) => boolean`        | 禁用状态                                                                      |
| `visible?`        | `boolean \| (...args) => boolean`        | 可见性                                                                        |
| `when?`           | `(...args) => boolean`                   | 启用条件                                                                      |
| `execute?`        | `(...args) => void \| Promise<void>`     | 执行逻辑                                                                      |
| `render?`         | `(...args) => ReactNode`                 | 自定义渲染                                                                    |
| `interaction?`    | `ActionInteractionModel`                 | 交互模型（confirm / prompt / modal / drawer / menu / page / direct / custom） |
| `eventConfig?`    | `ActionEventConfig`                      | 事件发射配置（`emit` / `timing` / `dataExtractor` / `eventName`）             |
| `isPluginAction?` | `boolean`                                | 标记为插件动作                                                                |
| `messages?`       | `Record<string, Record<string, string>>` | 动作级 i18n 覆盖                                                              |
| `tooltip?`        | `string`                                 | 工具提示                                                                      |
| `type?`           | `TableActionType \| ... \| string`       | 标准 action type（见 `src/models/table.ts`）                                  |
| `[key: string]`   | `any`                                    | 扩展字段                                                                      |

### 事件机制

内置插件在执行前后会通过 `tableLogic.actionEvents.emitAction(actionKey, data, context, action)` 发出事件。`actionKey` 就是动作的 `key`：

| 动作 key              | 发出插件                |
| --------------------- | ----------------------- |
| `table-export`        | `ExportPlugin`          |
| `table-print`         | `PrintPlugin`           |
| `table-refresh`       | `RefreshPlugin`         |
| `table-fullscreen`    | `FullscreenPlugin`      |
| `table-columnSetting` | `ColumnManagerPlugin`   |
| `table-add`           | `AddPlugin`             |
| `table-delete`        | `BatchDeletePlugin`     |
| `table-import`        | `ImportPlugin`          |
| `table-row-edit`      | `EditRowPlugin`         |
| `table-row-delete`    | `DeleteRowPlugin`       |
| `table-row-view`      | `ViewRowPlugin`         |
| `table-row-copy`      | `CopyRowPlugin`         |
| `table-row-move`      | `MoveRowPlugin`         |
| `table-row-enable`    | `ToggleEnableRowPlugin` |
| `table-column-sort`   | `SortPlugin`            |
| `table-column-filter` | `FilterPlugin`          |
| `table-cell-copy`     | `CellCopyPlugin`        |
| `table-cell-edit`     | `CellEditPlugin`        |

消费方监听事件并完成业务动作（详见 [Hook 与数据契约篇](./table-hooks.md#action-事件系统)）：

```tsx
import { useTableEventActions, useTableContext } from '@easbot/ui';
import { useEffect } from 'react';

// DeleteListener 必须渲染在 TableProvider 内部
function DeleteListener() {
  const tableContext = useTableContext();
  const { onAction } = useTableEventActions(tableContext);

  useEffect(() => {
    return onAction('table-row-delete', async (data) => {
      await api.deleteProduct(data.record.id);
      return { success: true };
    });
  }, [onAction]);

  return null;
}
```

## 内置插件清单（18 个）

### 表格级（`positionType: 'table'`）

| 插件                  | id              | 动作 key              | 贡献点          | 用途                                     |
| --------------------- | --------------- | --------------------- | --------------- | ---------------------------------------- |
| `ExportPlugin`        | `export`        | `table-export`        | `toolbar.right` | 导出 CSV / JSON（可导出全部或选中行）    |
| `PrintPlugin`         | `print`         | `table-print`         | `toolbar.right` | 打印表格（可只打印选中行）               |
| `RefreshPlugin`       | `refresh`       | `table-refresh`       | `toolbar.right` | 刷新数据（可配置自动刷新间隔）           |
| `FullscreenPlugin`    | `fullscreen`    | `table-fullscreen`    | `toolbar.right` | 全屏展示                                 |
| `ColumnManagerPlugin` | `columnManager` | `table-columnSetting` | `toolbar.right` | 列显示 / 隐藏 / 重置                     |
| `AddPlugin`           | `add`           | `table-add`           | `toolbar.left`  | 新增行（dialog / drawer / sheet / page） |
| `BatchDeletePlugin`   | `batchDelete`   | `table-delete`        | `toolbar.left`  | 批量删除选中行                           |
| `ImportPlugin`        | `import`        | `table-import`        | `toolbar.left`  | 导入 CSV / JSON 文件                     |

### 行级（`positionType: 'row'`）

| 插件                    | id           | 动作 key           | 贡献点                            | 用途                     |
| ----------------------- | ------------ | ------------------ | --------------------------------- | ------------------------ |
| `EditRowPlugin`         | `editRow`    | `table-row-edit`   | `row.actions` + `row.contextMenu` | 行编辑弹层               |
| `DeleteRowPlugin`       | `deleteRow`  | `table-row-delete` | `row.actions` + `row.contextMenu` | 删除行（可确认）         |
| `ViewRowPlugin`         | `viewRow`    | `table-row-view`   | `row.actions`                     | 查看行详情（只读弹层）   |
| `CopyRowPlugin`         | `copyRow`    | `table-row-copy`   | `row.actions`                     | 复制行（剪贴板 / 新行）  |
| `MoveRowPlugin`         | `moveRow`    | `table-row-move`   | `row.actions`                     | 上下移动行 ⚠️ 未默认启用 |
| `ToggleEnableRowPlugin` | `toggle-row` | `table-row-enable` | `row.contextMenu`                 | 切换行的启用 / 禁用状态  |

### 列头级（`positionType: 'column'`）

| 插件           | id              | 动作 key              | 贡献点          | 用途                      |
| -------------- | --------------- | --------------------- | --------------- | ------------------------- |
| `SortPlugin`   | `column-sort`   | `table-column-sort`   | `column.header` | 列头排序按钮（优先级 10） |
| `FilterPlugin` | `column-filter` | `table-column-filter` | `column.header` | 列头筛选按钮（优先级 20） |

### 单元格级（`positionType: 'cell'`）

| 插件             | id         | 动作 key          | 贡献点                                 | 用途         |
| ---------------- | ---------- | ----------------- | -------------------------------------- | ------------ |
| `CellCopyPlugin` | `cellCopy` | `table-cell-copy` | `row.contextMenu` + `cell.contextMenu` | 复制单元格值 |
| `CellEditPlugin` | `cellEdit` | `table-cell-edit` | `cell.contextMenu`                     | 单元格内编辑 |

## 插件配置

每个插件的配置放在 `config.plugin.config[pluginId]` 下（键名 = 插件 `id`）：

```tsx
config={{
  pluginable: true,
  plugin: {
    config: {
      export: { formats: ['csv', 'json'], filename: 'users', includeHeaders: true },
      print: { title: '用户清单', orientation: 'landscape', paperSize: 'A4' },
      refresh: { autoRefreshInterval: 60, resetToFirstPage: true, keepFilters: true },
      fullscreen: { title: '全屏表格', zIndex: 1000 },
      columnManager: { allowDragSort: true, allowReset: true, defaultHiddenColumns: ['remark'] },
      add: { position: 'top', autoEdit: true, mode: 'dialog' },
      batchDelete: { showConfirm: true, hardDelete: false },
      import: { acceptedFormats: ['.csv', '.json'], maxFileSize: 10, mode: 'append' },
      editRow: { mode: 'dialog', layout: 'grid', gridCols: 'auto' },
      deleteRow: { showConfirm: true, confirmTitle: '确认删除' },
      viewRow: { mode: 'drawer', side: 'right' },
      copyRow: { copyMode: 'clipboard', copyFormat: 'json' },
      'toggle-row': { statusField: 'enabled', enabledValue: true, disabledValue: false },
      'column-sort': { priority: 10 },
      'column-filter': { priority: 20 },
      cellCopy: { excludeColumns: ['password'] },
      cellEdit: { excludeColumns: ['id'], readOnlyColumns: ['createdAt'] },
    },
  },
}}
```

> 📌 `config.plugin.config` 的键名是插件的 **`id`**：`export` / `print` / `refresh` / `fullscreen` / `columnManager` / `add` / `batchDelete` / `import` / `editRow` / `deleteRow` / `viewRow` / `copyRow` / `moveRow` / `toggle-row` / `column-sort` / `column-filter` / `cellCopy` / `cellEdit`。注意 `SortPlugin` / `FilterPlugin` / `ToggleEnableRowPlugin` 的 id 与插件名不同（`column-sort` / `column-filter` / `toggle-row`）。

各插件配置的完整字段见源码 `src/ui/table/plugins/**`（每个插件文件顶部都有 `export interface XxxPluginConfig`），常用的配置类型：

> ⚠️ `EditRowPluginConfig` 与 `DeleteRowPluginConfig` **未从包根导出**（`plugins/index.ts` 只导出了 `ViewRowPluginConfig` / `CopyRowPluginConfig` / `MoveRowPluginConfig` / `ToggleEnableRowPluginState`）；`ToggleEnableRowPlugin` 的配置接口在源码中名为 `ToggleRowPluginConfig`，也未导出。需要这些类型时请从源码引用或自行声明。

## 自定义插件

一个最小可用的自定义插件：

```tsx
import { Button } from '@easbot/ui';
import type { TablePlugin } from '@easbot/ui';

const MyPlugin: TablePlugin = {
  id: 'myPlugin',
  name: 'myPlugin',
  type: 'action',
  positionType: 'table',
  version: '1.0.0',
  description: '自定义按钮插件',

  init: (context) => {
    context.updateState?.({ count: 0 });
  },

  destroy: (context) => {
    context.updateState?.({ count: 0 });
  },

  actions: [
    {
      key: 'table-my-action',
      label: '我的操作',
      icon: 'plus',
      position: ['toolbar.right'],
      priority: 50,
      isPluginAction: true,
      variant: 'ghost',
      type: 'table-custom',
      interaction: { type: 'direct' },
      eventConfig: { emit: true, timing: 'before' },

      when: (selectedRows) => selectedRows.length > 0,

      execute: async (selectedRows, context, action) => {
        const rows = context.tableContext.getSelectedRows();
        // 业务逻辑写在这里
      },

      render: (selectedRows, context, action) => (
        <Button variant="ghost" size="icon" title={action.tooltip}>
          +
        </Button>
      ),
    },
  ],
};

export default function App() {
  return (
    <AdvancedTable
      data={data}
      columns={columns}
      config={{ pluginable: true, plugin: { plugins: [MyPlugin] } }}
    />
  );
}
```

> ⚠️ `position` 的字面量必须是 `TablePluginPosition` 的字符串之一（`'toolbar.left'` / `'toolbar.right'` / `'toolbar'` / `'search.panel'` / `'table.header'` / `'table.footer'` / `'row.actions'` / `'row.contextMenu'` / `'column.actions'` / `'column.header'` / `'column.footer'` / `'cell.content'` / `'cell.overlay'` / `'cell.contextMenu'` / `'cell.actions'`）。

## 插件集合常量

| 常量                   | 内容                                                                                                                                                                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BUILTIN_PLUGINS`      | 全部 18 个内置插件的映射表（键为语义名：`export` / `print` / `refresh` / `fullscreen` / `columnManager` / `add` / `batchDelete` / `import` / `editRow` / `deleteRow` / `viewRow` / `copyRow` / `moveRow` / `toggleEnableRow` / `sort` / `filter` / `cellCopy` / `cellEdit`） |
| `defaultColumnPlugins` | `[SortPlugin, FilterPlugin]`                                                                                                                                                                                                                                                 |
| `defaultCellPlugins`   | `[CellCopyPlugin, CellEditPlugin]`                                                                                                                                                                                                                                           |
| `CELL_PLUGINS`         | `{ cellCopy: CellCopyPlugin, cellEdit: CellEditPlugin }`                                                                                                                                                                                                                     |

`CellPluginType` = `keyof typeof CELL_PLUGINS`（`'cellCopy' \| 'cellEdit'`）。

## 无障碍

- 插件渲染的工具栏按钮使用设计系统的 `Button`，自带 `focus-visible` 焦点环与 `disabled` 语义。
- 「更多」菜单使用 `DropdownMenu`（Radix primitives），具备键盘导航（上下方向键）、`Escape` 关闭与焦点回收。
- 行右键菜单与单元格右键菜单使用 `ContextMenu`（Radix primitives），`Shift + F10` / 菜单键可打开，右键菜单内的项可 Tab / 方向键访问。
- 插件动作的 `tooltip` 会作为 `title` 属性写入按钮，为读屏与悬停提示提供可访问名称。
- 插件的 `when` / `visible` 条件为 false 时按钮**完全不渲染**（而不是渲染为禁用态），避免读屏读到不可用操作。
- **组件库不管理焦点**：插件打开弹层后的焦点回收由所用的 `Dialog` / `Drawer` / `Sheet` 组件负责。

## 注意事项

- **插件系统默认关闭**：`config.pluginable` 必须为 `true`；`AdvancedTable` 已默认开启。
- **`config.enabled` 是插件开关**：判定与 `TablePlugin['config']` 的类型声明一致 —— 传 `enabled: false` 即可阻止插件注册。
- **不传 `plugins` 时加载全部内置插件**：`useTablePlugin` 内部常量 `DEFAULT_PLUGINS`（未导出）列出 17 个默认插件（`moveRow` 被注释掉未启用）。
- **`MoveRowPlugin` 未默认启用**：源码中标记 `TODO: 移动行插件功能未实现，暂时不开放`。
- **`positionType` 决定 `execute` 的第一个参数**：`table` 类型收到**选中行数组**；`row` / `column` 类型收到**当前行 / 当前列**（拿不到运行时数据）。
- **`config.plugin.config` 的键名是插件 `id`**（不是 `name`）：如 `SortPlugin` 的 id 是 `column-sort`，其配置应写在 `config: { 'column-sort': { ... } }`。
- **插件状态是深合并的**：`setPluginState` 走 `deepMerge`，`undefined` 会被跳过 —— 注销插件必须走专用的 `clearPluginState`，否则状态残留。
- **插件依赖缺失只警告不报错**：`console.warn` 后跳过注册，插件静默不生效。
- **插件 `init` 抛错会被捕获**：输出 `pluginInitFailed` 错误日志并跳过该插件，不会中断整个表格渲染。
- **`transformData` / `transformColumns` 当前是恒等实现**：`useTablePlugin` 返回的这两个方法直接返回入参，插件内定义的同名钩子不会被调用。
- **`executeHook` 当前是占位实现**：直接返回 `args` 数组。
- **插件的 `render` 不要在函数体内调用 Hook**：内置插件的做法是 `render` 返回一个 React 组件，由组件内部使用 Hook（见 `EditRowPlugin` 的 `EditRowComponent`）。
- **内置插件的文案走 `table` 文案域的 `plugin.<namespace>.*` key**：由 `getTablePluginMessages(namespace)` 从 `src/utils/component-messages.ts` 中提取。

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
