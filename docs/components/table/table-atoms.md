# Table 原子组件

> `src/ui/table/atoms/` 提供的最小粒度构建块，可脱离 `BaseTable` 自由拼装表格 DOM。

---

**导入**

```tsx
import { TableContainer, TableGrid, TableHeader, TableBody, TableRow, TableCell } from '@easbot/ui';
```

## 基础用法

原子组件分成两类：

- **不依赖 `TableProvider`**（`TableGrid` / `TableHeader` / `TableBody` / `TableCell` / `TableFixedColumn` / `TableLoading`）：只负责渲染语义标签与样式类，可独立使用。
- **上下文感知层**（`TableContainer` / `TableRow` / `TableEmpty` / `TableError` / `TablePagination` / `TableSortButton` / `TableColumnFilter` / `TableColumnResizer` / `TableRowExpandButton` / `RowActionCell` / `ColumnHeaderActionCell` / `RowContextMenu` / `CellValue` / `TableCard` / `TableCardContainer`）：内部调用 `useTableContext` / `useTableConfig` / `useTableState` / `useTableLogic`，**必须在 `TableProvider` 内使用**。

> `TableLoading` 是例外中的例外：它不读 `TableContext`，而是用 `useComponentMessage('table')` 取文案，因此**不需要** Provider 即可使用。

最小可运行组合：

```tsx
import { TableProvider } from '@easbot/ui';
import { TableContainer, TableGrid, TableHeader, TableBody, TableRow, TableCell } from '@easbot/ui';

export default function App() {
  return (
    <TableProvider>
      <TableContainer bordered>
        <TableGrid>
          <TableHeader stickyHeader>
            <TableRow>
              <TableCell as="th">商品</TableCell>
              <TableCell as="th" align="center">
                价格
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>苹果</TableCell>
              <TableCell align="center">¥5.00</TableCell>
            </TableRow>
          </TableBody>
        </TableGrid>
      </TableContainer>
    </TableProvider>
  );
}
```

## 组件清单

| 组件                     | 渲染标签             | 依赖 Provider | 用途                                                  |
| ------------------------ | -------------------- | ------------- | ----------------------------------------------------- |
| `TableContainer`         | `<div>`              | ✔             | 表格容器：尺寸 / 密度 / 边框 / 粘性表头 / 滚动 / 全屏 |
| `TableGrid`              | `<table>`            | ✘             | 原生 table 封装 + `<colgroup>` 列宽                   |
| `TableHeader`            | `<thead>`            | ✘             | 表头容器，支持 `stickyHeader`                         |
| `TableBody`              | `<tbody>`            | ✘             | 表体容器，支持 `minHeight`                            |
| `TableRow`               | `<tr>`               | ✔（读配置）   | 行，支持选中 / 展开 / 可点击；自动包裹右键菜单        |
| `TableCell`              | `<td>` / `<th>`      | ✘             | 单元格，支持对齐 / 固定 / 截断 / 拖拽调整宽度         |
| `TableEmpty`             | `<div>`              | ✔             | 空状态（图标 + 描述 + 操作）                          |
| `TableError`             | `<div>`              | ✔             | 错误状态 + 「重新加载」按钮                           |
| `TableLoading`           | `<div>`              | ✘             | 加载蒙层（自包裹内容）                                |
| `TablePagination`        | `<div>` + Pagination | ✔             | 分页条：总数 / 每页条数 / 页码 / 跳页                 |
| `TableSortButton`        | `IconButton`         | ✔             | 列头排序按钮                                          |
| `TableColumnFilter`      | `IconButton` + 弹层  | ✔             | 列头筛选按钮 + 条件编辑弹层                           |
| `TableColumnResizer`     | `<div>`              | ✔             | 列宽拖拽手柄                                          |
| `TableRowExpandButton`   | `IconButton`         | ✔             | 行展开 / 收起按钮                                     |
| `TableFixedColumn`       | 克隆子元素           | ✘             | 固定列样式包装（克隆 `<td>` / `<th>` 注入 sticky）    |
| `CellValue`              | 按列类型渲染         | ✔             | 单元格值渲染（走 `field-generator`）                  |
| `RowActionCell`          | `<div>`              | ✔             | 行操作列（内联按钮 + 更多菜单）                       |
| `ColumnHeaderActionCell` | `<div>`              | ✔             | 列头操作区                                            |
| `RowContextMenu`         | `ContextMenu`        | ✔             | 行右键菜单                                            |
| `TableCard`              | `Card`               | ✔             | 单张数据卡片                                          |
| `TableCardContainer`     | `<div>`              | ✔             | 卡片网格 / 列表容器                                   |

## 关键 Props

### 容器与骨架

## 属性

继承自 `ComponentPropsWithoutRef<'div'>`。

| 属性             | 类型           | 默认值 | 说明                                       |
| ---------------- | -------------- | ------ | ------------------------------------------ |
| `size?`          | `TableSize`    | —      | 表格尺寸                                   |
| `density?`       | `TableDensity` | —      | 表格密度                                   |
| `bordered?`      | `boolean`      | —      | 是否显示边框 - 与 schema bordered 字段对应 |
| `striped?`       | `boolean`      | —      | 是否显示条纹                               |
| `stickyHeader?`  | `boolean`      | —      | 是否固定表头                               |
| `hoverable?`     | `boolean`      | —      | 是否启用悬停效果                           |
| `fillContainer?` | `boolean`      | —      | 是否填充满父容器                           |
| `scroll?`        | `ScrollConfig` | —      | 滚动配置 - 与 schema scroll 字段对应       |
| `fullscreen?`    | `boolean`      | —      | 是否全屏模式                               |
| `loading?`       | `boolean`      | —      | 加载配置                                   |
| `error?`         | `ReactNode`    | —      | 错误信息                                   |
| `empty?`         | `boolean`      | —      | 是否是空数据                               |

## 属性（TableGridProps）

继承自 `React.TableHTMLAttributes<HTMLTableElement>`。

| 属性             | 类型            | 默认值 | 说明             |
| ---------------- | --------------- | ------ | ---------------- |
| `fixedLayout?`   | `boolean`       | —      | 是否使用固定布局 |
| `tableMinWidth?` | `number`        | —      | 表格最小宽度     |
| `columnWidths?`  | `ColumnWidth[]` | —      | 列宽配置         |

## 属性（TableHeaderProps）

继承自 `ComponentPropsWithoutRef<'thead'>`。

| 属性                  | 类型           | 默认值 | 说明           |
| --------------------- | -------------- | ------ | -------------- |
| `stickyHeader?`       | `boolean`      | —      | 是否粘性定位   |
| `stickyHeaderOffset?` | `number`       | —      | 粘性定位偏移量 |
| `size?`               | `TableSize`    | —      | 表格尺寸       |
| `density?`            | `TableDensity` | —      | 表格密度       |

## 属性（TableBodyProps）

继承自 `ComponentPropsWithoutRef<'tbody'>`。

| 属性         | 类型               | 默认值 | 说明             |
| ------------ | ------------------ | ------ | ---------------- |
| `minHeight?` | `number \| string` | —      | 最小高度         |
| `size?`      | `TableSize`        | —      | 表格尺寸         |
| `density?`   | `TableDensity`     | —      | 表格密度         |
| `striped?`   | `boolean`          | —      | 是否显示条纹     |
| `hoverable?` | `boolean`          | —      | 是否启用悬停效果 |

## 属性（TableRowProps）

继承自 `ComponentPropsWithoutRef<'tr'>`。

| 属性         | 类型                  | 默认值 | 说明                            |
| ------------ | --------------------- | ------ | ------------------------------- |
| `selected?`  | `boolean`             | —      | 是否选中                        |
| `expanded?`  | `boolean`             | —      | 是否展开                        |
| `hoverable?` | `boolean`             | —      | 是否支持悬停效果                |
| `clickable?` | `boolean`             | —      | 是否可点击                      |
| `index?`     | `number`              | —      | 行索引                          |
| `record?`    | `Record<string, any>` | —      | 行数据记录 - 用于右键菜单等功能 |
| `size?`      | `TableSize`           | —      | 表格尺寸                        |
| `density?`   | `TableDensity`        | —      | 表格密度                        |

## 属性（TableCellProps）

继承自 `Omit<ComponentPropsWithoutRef<'td'>, 'align'>`。

| 属性          | 类型                      | 默认值 | 说明           |
| ------------- | ------------------------- | ------ | -------------- |
| `as?`         | `'td' \| 'th'`            | —      | 单元格类型     |
| `align?`      | `ColumnAlign`             | —      | 对齐方式       |
| `fixed?`      | `FixedPosition`           | —      | 是否固定       |
| `ellipsis?`   | `boolean`                 | —      | 是否截断文本   |
| `resizeable?` | `boolean`                 | —      | 是否可调整大小 |
| `onResize?`   | `(width: number) => void` | —      | 调整大小回调   |
| `size?`       | `TableSize`               | —      | 表格尺寸       |
| `density?`    | `TableDensity`            | —      | 表格密度       |

本表只列组件自有属性；此外 `TableContainer` 透传 `<div>` 的原生属性，`TableGrid` 透传 `<table>`、`TableHeader` 透传 `<thead>`、`TableBody` 透传 `<tbody>`、`TableRow` 透传 `<tr>`、`TableCell` 透传 `<td>` / `<th>` 的全部原生属性。

几个容易踩坑的默认值：

- `TableContainer` 的 `density` 默认是 `'comfortable'`，`size` 默认 `'md'`。
- `TableGrid` 的 `fixedLayout` 默认 `true`（输出 `table-fixed`），`tableMinWidth` 默认 `720`。
- `TableCell` 的 `align` 默认值是 `'start'` —— 但样式映射只识别 `'left'` / `'center'` / `'right'`（`ColumnAlign` 契约也是这三个取值），`'start'` **不命中任何对齐类名**（等价于不设对齐）。需要左对齐请显式传 `align="left"`。
- `TableCell` 的 `as` 默认 `'td'`；表头单元格请显式传 `as="th"`。

### 状态组件

## 属性

| 属性           | 类型                  | 默认值 | 说明       |
| -------------- | --------------------- | ------ | ---------- |
| `description?` | `ReactNode`           | —      | 描述文本   |
| `image?`       | `ReactNode`           | —      | 图片或图标 |
| `action?`      | `ReactNode`           | —      | 操作按钮   |
| `className?`   | `string`              | —      | 自定义样式 |
| `style?`       | `React.CSSProperties` | —      | —          |

## 属性（TableErrorProps）

继承自 `React.HTMLAttributes<HTMLDivElement>`。

| 属性       | 类型              | 默认值 | 说明       |
| ---------- | ----------------- | ------ | ---------- |
| `message?` | `React.ReactNode` | —      | 描述文本   |
| `image?`   | `React.ReactNode` | —      | 图片或图标 |
| `action?`  | `React.ReactNode` | —      | 操作按钮   |

## 属性（TableLoadingProps）

| 属性         | 类型                  | 默认值 | 说明             |
| ------------ | --------------------- | ------ | ---------------- |
| `spinning?`  | `boolean`             | —      | 是否显示加载状态 |
| `tip?`       | `ReactNode`           | —      | 加载文本         |
| `delay?`     | `number`              | —      | 延迟显示时间(ms) |
| `indicator?` | `ReactNode`           | —      | 自定义加载指示器 |
| `children?`  | `ReactNode`           | —      | 包装的内容       |
| `className?` | `string`              | —      | 自定义样式       |
| `style?`     | `React.CSSProperties` | —      | —                |

## 属性（TablePaginationProps）

| 属性                | 类型                         | 默认值 | 说明             |
| ------------------- | ---------------------------- | ------ | ---------------- |
| `pagination`        | `PaginationState`            | —      | 分页状态         |
| `config`            | `PaginationConfig`           | —      | 分页配置         |
| `onPageNoChange?`   | `(pageNo: number) => void`   | —      | 页码变化回调     |
| `onPageSizeChange?` | `(pageSize: number) => void` | —      | 每页条数变化回调 |
| `size?`             | `'sm' \| 'md' \| 'lg'`       | —      | 组件尺寸         |
| `className?`        | `string`                     | —      | 样式类名         |

`TableEmptyProps` / `TableErrorProps` / `TableLoadingProps` 均继承 `React.HTMLAttributes<HTMLDivElement>`。

`TablePaginationProps` 的真实字段（与 `types/components.ts` 中的同名接口**不同** —— 组件使用的是 `atoms/TablePagination.tsx` 内定义的那份）：

| 属性                | 类型                         | 说明                                                      |
| ------------------- | ---------------------------- | --------------------------------------------------------- |
| `pagination`        | `PaginationState`            | 当前分页状态（`pageNo` / `pageSize` / `total` / `show`）  |
| `config`            | `PaginationConfig`           | 分页配置（`layout` / `showTotal` / `pageSizeOptions` 等） |
| `onPageNoChange?`   | `(pageNo: number) => void`   | 页码变化                                                  |
| `onPageSizeChange?` | `(pageSize: number) => void` | 每页条数变化                                              |
| `size?`             | `'sm' \| 'md' \| 'lg'`       | 组件尺寸                                                  |
| `className?`        | `string`                     | 自定义类名                                                |

### 交互组件

## 属性

| 属性         | 类型                                                             | 默认值 | 说明           |
| ------------ | ---------------------------------------------------------------- | ------ | -------------- |
| `action?`    | `ActionConfig`                                                   | —      | 排序动作配置   |
| `column`     | `TableColumn`                                                    | —      | 列定义         |
| `className?` | `string`                                                         | —      | 自定义类名     |
| `onChange?`  | `(e?: React.MouseEvent, value?: SortState \| undefined) => void` | —      | 过滤值变化回调 |

## 属性（TableColumnFilterProps）

| 属性         | 类型                                                                   | 默认值 | 说明           |
| ------------ | ---------------------------------------------------------------------- | ------ | -------------- |
| `action?`    | `ActionConfig`                                                         | —      | 过滤器动作配置 |
| `column`     | `TableColumn`                                                          | —      | 列定义         |
| `onChange?`  | `(event?: React.MouseEvent, value?: FilterValue \| undefined) => void` | —      | 过滤值变化回调 |
| `className?` | `string`                                                               | —      | 自定义类名     |

## 属性（TableColumnResizerProps）

| 属性         | 类型          | 默认值 | 说明       |
| ------------ | ------------- | ------ | ---------- |
| `column`     | `TableColumn` | —      | 列定义     |
| `minWidth?`  | `number`      | —      | 最小宽度   |
| `maxWidth?`  | `number`      | —      | 最大宽度   |
| `className?` | `string`      | —      | 自定义类名 |

## 属性（TableRowExpandButtonProps）

| 属性         | 类型                          | 默认值 | 说明             |
| ------------ | ----------------------------- | ------ | ---------------- |
| `isExpanded` | `boolean`                     | —      | 当前行是否已展开 |
| `onToggle`   | `(expanded: boolean) => void` | —      | 展开/收起回调    |
| `record`     | `Record<string, any>`         | —      | 行记录数据       |
| `index`      | `number`                      | —      | 行索引           |
| `className?` | `string`                      | —      | 自定义类名       |
| `disabled?`  | `boolean`                     | —      | 是否禁用         |

## 属性（CellValueProps）

| 属性              | 类型                                                        | 默认值 | 说明           |
| ----------------- | ----------------------------------------------------------- | ------ | -------------- |
| `value`           | `any`                                                       | —      | 单元格值       |
| `column`          | `TableColumn`                                               | —      | 列配置         |
| `record`          | `Record<string, any>`                                       | —      | 行数据         |
| `index`           | `number`                                                    | —      | 行索引         |
| `getColumnValue?` | `(record: Record<string, any>, column: TableColumn) => any` | —      | 获取列值的函数 |

### 操作区组件

## 属性

| 属性         | 类型                  | 默认值 | 说明           |
| ------------ | --------------------- | ------ | -------------- |
| `record`     | `Record<string, any>` | —      | 当前行记录     |
| `rowIndex`   | `number`              | —      | 行索引         |
| `config?`    | `RowActionConfig`     | —      | 行操作配置     |
| `className?` | `string`              | —      | 自定义样式类名 |

## 属性（ColumnHeaderActionCellProps）

| 属性         | 类型                       | 默认值 | 说明           |
| ------------ | -------------------------- | ------ | -------------- |
| `column`     | `TableColumn`              | —      | 当前列配置     |
| `config?`    | `ColumnHeaderActionConfig` | —      | 列头操作配置   |
| `className?` | `string`                   | —      | 自定义样式类名 |

## 属性（RowContextMenuProps）

| 属性         | 类型                  | 默认值 | 说明                  |
| ------------ | --------------------- | ------ | --------------------- |
| `record`     | `Record<string, any>` | —      | 当前行记录            |
| `rowIndex`   | `number`              | —      | 行索引                |
| `config?`    | `ContextMenuConfig`   | —      | 右键菜单配置          |
| `children`   | `React.ReactNode`     | —      | 子组件 - 通常是表格行 |
| `className?` | `string`              | —      | 自定义样式类名        |

### 固定列与卡片

## 属性

| 属性                 | 类型               | 默认值 | 说明                                           |
| -------------------- | ------------------ | ------ | ---------------------------------------------- |
| `column`             | `TableColumn`      | —      | 列定义                                         |
| `bordered?`          | `boolean`          | —      | 是否有边框                                     |
| `fixedStyle?`        | `FixedColumnStyle` | —      | 固定列样式（由父组件计算并传入，避免重复计算） |
| `children`           | `React.ReactNode`  | —      | 子元素                                         |
| `isHeader?`          | `boolean`          | —      | 是否为表头                                     |
| `className?`         | `string`           | —      | 自定义类名                                     |
| `isLastLeftFixed?`   | `boolean`          | —      | 是否是最后一个左固定列                         |
| `isFirstRightFixed?` | `boolean`          | —      | 是否是第一个右固定列                           |

## 属性（TableCardProps）

继承自 `Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>`。

| 属性                 | 类型                                                                        | 默认值 | 说明             |
| -------------------- | --------------------------------------------------------------------------- | ------ | ---------------- |
| `size?`              | `TableSize`                                                                 | —      | 卡片尺寸         |
| `minWidth?`          | `number \| string`                                                          | —      | 最小宽度         |
| `maxWidth?`          | `number \| string`                                                          | —      | 最大宽度         |
| `shadow?`            | `boolean`                                                                   | —      | 是否显示阴影     |
| `selectable?`        | `boolean`                                                                   | —      | 是否显示选择框   |
| `clickable?`         | `boolean`                                                                   | —      | 是否可点击       |
| `bordered?`          | `boolean`                                                                   | —      | 是否显示边框     |
| `hoverable?`         | `boolean`                                                                   | —      | 是否可悬停       |
| `selected?`          | `boolean`                                                                   | —      | 是否选中         |
| `disabled?`          | `boolean`                                                                   | —      | 是否禁用         |
| `record?`            | `Record<string, any>`                                                       | —      | 卡片数据         |
| `index?`             | `number`                                                                    | —      | 数据索引         |
| `title?`             | `ReactNode \| ((record: Record<string, any>, index: number) => ReactNode)`  | —      | 卡片标题         |
| `description?`       | `ReactNode \| ((record: Record<string, any>, index: number) => ReactNode)`  | —      | 卡片描述         |
| `image?`             | `ReactNode \| ((record: Record<string, any>, index: number) => ReactNode)`  | —      | 卡片图片/图标    |
| `showActions?`       | `boolean`                                                                   | —      | 是否显示操作区域 |
| `renderCard?`        | `(record: Record<string, any>, index: number) => ReactNode`                 | —      | 自定义卡片内容   |
| `onCardClick?`       | `(record: Record<string, any>, index: number, e: React.MouseEvent) => void` | —      | 卡片点击回调     |
| `onCardDoubleClick?` | `(record: Record<string, any>, index: number, e: React.MouseEvent) => void` | —      | 卡片双击击回调   |
| `onCheckedChange?`   | `(record: Record<string, any>, index: number, selected: boolean) => void`   | —      | 选择变化回调     |

## 属性（TableCardContainerProps）

继承自 `React.HTMLAttributes<HTMLDivElement>`。

| 属性             | 类型                    | 默认值 | 说明                 |
| ---------------- | ----------------------- | ------ | -------------------- |
| `layout?`        | `CardLayoutMode`        | —      | 布局模式             |
| `size?`          | `TableSize`             | —      | 卡片尺寸             |
| `columns?`       | `number \| 'auto'`      | —      | 每行卡片数量         |
| `gap?`           | `number \| string`      | —      | 卡片间距             |
| `minWidth?`      | `number \| string`      | —      | 卡片最小宽度         |
| `maxWidth?`      | `number \| string`      | —      | 卡片最大宽度         |
| `fillContainer?` | `boolean`               | —      | 是否填充容器         |
| `bordered?`      | `boolean`               | —      | 是否显示容器边框     |
| `empty?`         | `boolean`               | —      | 是否为空数据状态     |
| `renderEmpty?`   | `() => React.ReactNode` | —      | 自定义空状态渲染函数 |

## 虚拟列表

`atoms/virtual-list/` 是一个**通用**的虚拟滚动实现（不绑定表格），表格的虚拟滚动模式（`displayMode: 'virtual'`）复用它。

**导入**

```tsx
import { VirtualList } from '@easbot/ui';
```

```tsx
import { VirtualList } from '@easbot/ui';

export default function App() {
  return (
    <VirtualList
      height={400}
      itemCount={10000}
      itemSize={48}
      overscanCount={8}
      renderItem={({ index, style }) => (
        <div style={style} className="border-b p-2">
          第 {index + 1} 行
        </div>
      )}
    />
  );
}
```

## 属性

继承自 `Omit<VirtualizationConfig, 'renderItem' | 'itemCount' | 'height'>`。

| 属性         | 类型           | 默认值 | 说明                    |
| ------------ | -------------- | ------ | ----------------------- |
| `height`     | `number`       | —      | 容器高度 - 必需参数     |
| `itemCount`  | `number`       | —      | 项目数量 - 必需参数     |
| `renderItem` | `ItemRenderer` | —      | 项目渲染函数 - 必需参数 |

`VirtualListProps` 继承 `Omit<VirtualizationConfig, 'renderItem' | 'itemCount' | 'height'>`，并把 `height` / `itemCount` / `renderItem` 改为必填。`VirtualList` 自身的默认值：`itemSize = 48`、`estimatedItemSize = 48`、`overscanCount = 3`、`scrollDirection = 'vertical'`、`scrollToAlignment = 'auto'`。

**虚拟列表相关 Hook**

| Hook                        | 用途                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `useVirtualScroll`          | 维护 `scrollOffset` / `isScrolling`（150ms 内无滚动即复位），并提供 `scrollToIndex`                                        |
| `useItemSizeCache`          | 动态行高的尺寸缓存：`getItemSize` / `setItemSize` / `setEstimatedSize` / `clearCache` / `getAverageSize` / `getCacheStats` |
| `useVirtualListPerformance` | 渲染次数与平均渲染耗时监控：`performanceMetrics` / `recordRender` / `resetMetrics`                                         |

**虚拟列表纯函数工具**

`calculateSizeAndPosition` / `calculateVisibleRange` / `calculateScrollToIndex` / `getTotalSize` / `createItemStyle` / `getScrollProp` / `getSizeProp` / `getOffsetProp` / `throttle` / `throttleReactEvent` —— 全部为无副作用纯函数，可单独使用。

**虚拟列表类型**

`VirtualAlignment`（`auto` / `start` / `center` / `end`）、`VirtualDirection`（`vertical` / `horizontal`）、`ScrollChangeReason`（`observed` / `requested`）、`ItemSizeGetter`、`ItemRenderer`、`ScrollEventData`、`ItemsRenderedEventData`、`SizeAndPositionData`、`VisibleRange`、`ScrollToIndexConfig`。

## 无障碍

- 原子组件使用原生语义标签（`<table>` / `<thead>` / `<tbody>` / `<tr>` / `<td>` / `<th>`），不额外注入 `role` —— 读屏器的表格导航依赖这些原生元素。
- 每个原子组件都输出 `data-slot`（`table` / `table-header` / `table-body` / `table-row` / `table-cell` / `table-head` / `table-container` / `table-card-container`），便于样式定位与自动化测试。
- `TableRow` 在 `clickable` 时注入 `cursor-pointer` 与 `focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2`；`<tr>` 本身没有 `tabindex`，键盘可达性需由消费方自行提供（`BaseTable` 内部通过单元格内的按钮承载交互）。
- `TableRowExpandButton` 与 `TableSortButton` 使用 `IconButton`，通过 `title` / `aria-label` 提供可访问名称。
- `TableEmpty` / `TableError` 的文本来自内置 i18n（`暂无数据` / `加载失败`），随 `LocaleProvider` 的语言切换。
- `TableError` 默认渲染一个「重新加载」按钮（`<button>`，键盘可达），点击后清除错误并触发 `actions.reload(true, true, true)`。
- 固定列通过 `position: sticky` 实现，**不改变** DOM 顺序 —— 读屏与键盘 Tab 顺序仍按文档流。

## 注意事项

- **`TableRow` 依赖 `TableProvider`**：内部调用 `useTableConfig()` 读取 `contextMenuable`，无 Provider 会抛错。
- **分页边界与跳页图标的指针契约**：`TablePagination` 首页/末页的前后页按钮用 `cursor-not-allowed` + `aria-disabled`（不用 `pointer-events-none`，否则禁止光标不生效，见 `spec/css-standard.md` §4.9）；跳页图标改为原生 `<button>`，裸 `<svg onClick>` 无键盘可达性。`RowContextMenu` 的自定义渲染分支与默认分支一致补 `cursor-not-allowed opacity-50`。
- **`TableContainer` 会切换滚动实现**：`fillContainer` 为 true，或 `scroll.x` / `scroll.y` 是数字 / 非 `'auto'` 字符串时，用 `ScrollArea` 包裹（`data-scroll-mode="custom"`）；否则用原生 `overflow`（`data-scroll-mode="native"`）。
- **`TableContainer` 的滚动尺寸会写死内联样式**：`scroll.x` 为数字时同时设置 `width` / `minWidth` / `maxWidth`；`scroll.y` 为数字时同时设置 `height` / `minHeight` / `maxHeight`。
- **`TableContainer` 在分页变化时自动滚回顶部**：仅当 `scroll.scrollToFirstRowOnChange`（默认 `true`）且处于自定义滚动模式时生效。
- **`TableCell` 的 `ellipsis` 会额外包一层 `<div class="truncate">`**，并给单元格加 `max-w-0`；这会**破坏 `table-fixed` 下的列宽计算**，慎用。
- **`TableCell` 默认 `whitespace-nowrap`**：长文本会溢出而非换行；展开行的详情单元格需要显式传 `className="whitespace-normal"`。
- **`TableCell` 的 `resizeable` 手柄是鼠标专用**：`onMouseDown` + `document` 级 `mousemove` 监听，没有键盘可达的等价操作；无障碍场景请用列管理插件调整列宽。
- **`TableColumnResizer` 排除内置列**：`__selection__` / `__expansion__` / `__rowaction__` 三类特殊列不允许调整宽度；隐藏列（`visible === false`）同样不渲染手柄。
- **`TableColumnResizer` 的最小 / 最大宽度优先级**：`column.minWidth` > `config.resize.minWidth` > 组件 `minWidth` prop（默认 80）；最大值同理（默认 800）。
- **`TableSortButton` 在 `config.sortable` 为 false 时返回 `null`**；列自身的 `sortable` 必须在 `TableColumn` 上显式声明为 `true` 才渲染。
- **`TableColumnFilter` 的操作符按列的 `dataType` 过滤**：数值 / 日期类型可用比较与区间操作符，字符串类型只有 `like` / `notlike` / `startwith` / `endwith` 等。
- **`TableFixedColumn` 用 `React.cloneElement` 注入样式**：子元素必须是**单个** React 元素，否则会抛错；`column.fixed` 未设置或未传 `fixedStyle` 时直接返回子元素。
- **`TableFixedColumn` 的固定层级**：内置选择列 `z-index: 60` > 展开列 `59` > 行操作列 `60`（右） > 用户固定列 `55 - index`。
- **`TableCard` 的 `title` / `description` / `image` 支持函数形式**：`(record, index) => ReactNode`，用于按行动态渲染。
- **`TableCardContainer` 在 `columns: 'auto'` 时用 `repeat(auto-fit, minmax(...))`**：卡片会折行，不会产生横向滚动条；`layout: 'list'` 时同样隐藏横向滚动条。
- **`TablePagination` 在移动端自动简化**：通过 `useDevice()` 检测移动端，强制 `simple = true`、`layout = ['pager']`、`position = 'center'`。
- **`TablePagination` 的 `pagination.show` 为 false 时返回 `null`** —— 分页状态的显隐字段名是 `show`（不是 `showPagination`）。
- **`TableLoading` 的 `spinning` 为 false 时只渲染 children**，不产生任何包裹 DOM。
- **`CellValue` 依赖 `useTableLogic()`**：必须在 `TableProvider` 内渲染；它把列的 `type`（`text` / `number` / `date` / `boolean` / `tag` / `image` / `link` / `json` / `actions` / `custom`）映射到不同的渲染分支。

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
