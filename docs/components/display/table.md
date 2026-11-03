# Table 数据表格

> 用于结构化数据展示，提供响应式横向滚动、斑马纹与悬停高亮等能力。

**导入**

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@easbot/ui';
```

## 基础用法

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>发票编号</TableHead>
      <TableHead>金额</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>¥250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

渲染结构：`Table` 内部**自动包了一层** `<div class="relative w-full overflow-auto">` 做横向滚动，
真正的 `<table>` 在这层容器内部：

```html
<div class="relative w-full overflow-auto">
  <table class="w-full caption-bottom ...">...</table>
</div>
```

## 组成部分

| 子组件         | 渲染元素    | 说明                                                     |
| -------------- | ----------- | -------------------------------------------------------- |
| `TableHeader`  | `<thead>`   | 表头容器，行底部有边框，背景 / 文字使用表头专用变量      |
| `TableBody`    | `<tbody>`   | 表体容器，最后一行去掉下边框                             |
| `TableFooter`  | `<tfoot>`   | 表尾容器，顶部有边框，背景使用表尾变量，字体加粗         |
| `TableRow`     | `<tr>`      | 行，行底部有边框，悬停高亮，支持 `data-[state=selected]` |
| `TableHead`    | `<th>`      | 表头单元格，固定高度 `h-12`，左对齐                      |
| `TableCell`    | `<td>`      | 数据单元格，内边距 `p-4`，垂直居中                       |
| `TableCaption` | `<caption>` | 表格标题，顶部间距 `mt-4`，使用弱化文字色                |

## 变体

### striped

| 取值    | 说明                                                    |
| ------- | ------------------------------------------------------- |
| `true`  | 偶数行（`tbody` 内 `tr:nth-child(even)`）使用斑马纹背景 |
| `false` | 不启用斑马纹（默认值）                                  |

## 属性

| 属性        | 类型      | 默认值  | 说明                   |
| ----------- | --------- | ------- | ---------------------- |
| `striped`   | `boolean` | `false` | 是否启用斑马纹行背景   |
| `className` | `string`  | —       | `<table>` 的自定义类名 |

本表只列组件自有属性；此外还透传 `<table>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

各子组件的属性类型：

| 子组件         | 属性类型                                        |
| -------------- | ----------------------------------------------- |
| `TableHeader`  | `React.HTMLAttributes<HTMLTableSectionElement>` |
| `TableBody`    | `React.HTMLAttributes<HTMLTableSectionElement>` |
| `TableFooter`  | `React.HTMLAttributes<HTMLTableSectionElement>` |
| `TableRow`     | `React.HTMLAttributes<HTMLTableRowElement>`     |
| `TableHead`    | `React.ThHTMLAttributes<HTMLTableCellElement>`  |
| `TableCell`    | `React.TdHTMLAttributes<HTMLTableCellElement>`  |
| `TableCaption` | `React.HTMLAttributes<HTMLTableCaptionElement>` |

## 导出

| 导出名              | 类型 | 说明                         |
| ------------------- | ---- | ---------------------------- |
| `Table`             | 组件 | 表格根组件（外层含滚动容器） |
| `TableHeader`       | 组件 | 表头容器                     |
| `TableBody`         | 组件 | 表体容器                     |
| `TableFooter`       | 组件 | 表尾容器                     |
| `TableHead`         | 组件 | 表头单元格                   |
| `TableRow`          | 组件 | 行                           |
| `TableCell`         | 组件 | 数据单元格                   |
| `TableCaption`      | 组件 | 表格标题                     |
| `TableProps`        | 类型 | `Table` 的 props 类型        |
| `TableHeaderProps`  | 类型 | `TableHeader` 的 props 类型  |
| `TableBodyProps`    | 类型 | `TableBody` 的 props 类型    |
| `TableFooterProps`  | 类型 | `TableFooter` 的 props 类型  |
| `TableHeadProps`    | 类型 | `TableHead` 的 props 类型    |
| `TableRowProps`     | 类型 | `TableRow` 的 props 类型     |
| `TableCellProps`    | 类型 | `TableCell` 的 props 类型    |
| `TableCaptionProps` | 类型 | `TableCaption` 的 props 类型 |

## 无障碍

- 使用原生 `<table>` / `<thead>` / `<tbody>` / `<tfoot>` / `<tr>` / `<th>` / `<td>` / `<caption>` 语义标签，
  屏幕阅读器可按表格结构播报行列关系。
- `TableHead` 渲染为 `<th>`，位于 `<thead>` 中时浏览器会自动赋予列头语义。
- 排序表头请在 `TableHead` 内放置 `<button>` 并提供 `aria-sort` 属性，组件本身不提供排序能力。
- 选中行请在 `TableRow` 上设置 `data-state="selected"`，行会应用 `--table-row-selected` 背景色。
- 横向滚动容器为纯 `<div>`，没有 `tabindex`，键盘用户无法直接聚焦滚动区域；
  若表格较宽且内容重要，建议同时提供「精简视图」或让单元格内容可选择 / 可聚焦。

## 主题变量

| 变量                         | 说明                              |
| ---------------------------- | --------------------------------- |
| `--table-font-size`          | 表格字号                          |
| `--table-border`             | 表格边框颜色                      |
| `--table-header-background`  | 表头背景色                        |
| `--table-header-foreground`  | 表头文字颜色                      |
| `--table-footer-background`  | 表尾背景色                        |
| `--table-row-hover`          | 行悬停背景色（以 50% 透明度叠加） |
| `--table-row-selected`       | 选中行背景色                      |
| `--table-row-striped`        | 斑马纹行背景色                    |
| `--table-caption-foreground` | 表格标题文字色                    |

## 组合用法 / 注意事项

1. **外层滚动容器已内置**：`Table` 会自动渲染 `<div class="relative w-full overflow-auto">`，
   无需再手动包一层；若需要固定表头，请在这个滚动容器内部使用 `sticky top-0` 的 `TableHeader`。
2. **`striped` 只作用于 `tbody`**：斑马纹选择器是 `[&_tbody_tr:nth-child(even)]`，
   `tfoot` 中的行不会受影响。
3. **单元格支持 `role=checkbox` 场景**：`TableHead` / `TableCell` 内置了
   `[&:has([role=checkbox])]:pr-0` 规则，放入复选框时自动去掉右侧内边距。
4. **列宽控制**：表格默认 `w-full`，具体列宽请通过 `TableHead` / `TableCell` 的 `className`
   设置（如 `w-[200px]`），长内容建议配合 `truncate`。
5. **空状态**：组件不提供空状态占位，请用 [`Skeleton`](./skeleton.md) 或自定义行渲染。
