# Typography 排版

> 一整套排版原语（标题 / 段落 / 列表 / 表格 / 代码块 …），统一管理字号、字重与间距。

---

**导入**

```tsx
import { Static, Typography } from '@easbot/ui';
```

## 基础用法

```tsx
import { Typography } from '@easbot/ui';

export default function App() {
  return (
    <article>
      <Typography.H1>标题一</Typography.H1>
      <Typography.H2>标题二</Typography.H2>
      <Typography.P>这是一段正文内容。</Typography.P>
      <Typography.Muted>这是一段次要说明文字。</Typography.Muted>
    </article>
  );
}
```

列表与引用：

```tsx
<Typography.List>
  {items.map((item) => (
    <Typography.ListItem key={item}>{item}</Typography.ListItem>
  ))}
</Typography.List>

<Typography.Blockquote>这是一段引用。</Typography.Blockquote>
```

表格：

```tsx
<Typography.Table>
  <Typography.TableHeader>
    <Typography.TableRow>
      <Typography.TableHead>名称</Typography.TableHead>
      <Typography.TableHead>状态</Typography.TableHead>
    </Typography.TableRow>
  </Typography.TableHeader>
  <Typography.TableBody>
    <Typography.TableRow>
      <Typography.TableCell>示例</Typography.TableCell>
      <Typography.TableCell>启用</Typography.TableCell>
    </Typography.TableRow>
  </Typography.TableBody>
</Typography.Table>
```

静态字段展示（`Static`）：

```tsx
import { Static } from '@easbot/ui';

export default function App() {
  return (
    <>
      <Static displayType="text">纯文本内容</Static>
      <Static displayType="link">/files/report.pdf</Static>
      <Static displayType="tag">{['已启用', '已停用']}</Static>
      <Static displayType="json">{{ a: 1 }}</Static>
    </>
  );
}
```

## 属性

继承自 `React.HTMLAttributes<HTMLDivElement>, UiMessageProps`。

| 属性           | 类型                                                                                           | 默认值 | 说明                                               |
| -------------- | ---------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| `isEmpty?`     | `boolean`                                                                                      | —      | 是否为空值                                         |
| `emptyText?`   | `string`                                                                                       | —      | 空值显示的文本                                     |
| `displayType?` | `'text' \| 'image' \| 'link' \| 'list' \| 'json' \| 'object' \| 'tag' \| 'html' \| 'textarea'` | —      | 展现类型：控制如何展示内容                         |
| `imageUrl?`    | `string`                                                                                       | —      | 图片URL（当displayType为image时使用）              |
| `imageName?`   | `string`                                                                                       | —      | 图片名称（当displayType为image时使用）             |
| `baseUrl?`     | `string`                                                                                       | —      | 基础URL（用于拼接相对路径）                        |
| `options?`     | `Array<{ label: string; value: string; disabled?: boolean }>`                                  | —      | 选项列表（用于tag类型）                            |
| `fixedHeight?` | `number`                                                                                       | —      | 固定高度（用于内容较多的类型）                     |
| `scrollable?`  | `boolean`                                                                                      | —      | 是否显示滚动条                                     |
| `maxTags?`     | `number`                                                                                       | —      | tag 最大展示数量（多余以 +n 展示）。不传则默认 3。 |

## 属性（LinkProps）

继承自 `React.AnchorHTMLAttributes<HTMLAnchorElement>`。

| 属性        | 类型      | 默认值 | 说明 |
| ----------- | --------- | ------ | ---- |
| `external?` | `boolean` | —      | —    |

`StaticProps` 是 `Static` 的属性接口（`React.HTMLAttributes<HTMLDivElement>` + `UiMessageProps`）；
`LinkProps` 是 `Typography.Link` 的属性接口（`React.AnchorHTMLAttributes<HTMLAnchorElement>`），自有成员只有 `external`。

本表只列组件自有属性；此外还透传对应原生元素的全部属性（`id` / `className` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 各排版原语渲染为语义化 HTML 标签：`H1` ~ `H6` 为 `<h1>` ~ `<h6>`，`P` / `Large` / `Small` / `Muted` 为 `<p>`，`Blockquote` 为 `<blockquote>`，`InlineCode` 为 `<code>`，`CodeBlock` 为 `<pre>`，`List` 为 `<ul>`，`OrderedList` 为 `<ol>`，`ListItem` 为 `<li>`，`Strong` 为 `<strong>`，`Em` 为 `<em>`，`Link` 为 `<a>`，表格系列为 `<table>` / `<thead>` / `<tbody>` / `<tfoot>` / `<tr>` / `<th>` / `<td>`。
- 标题层级由调用方选择 —— 组件不会根据上下文自动调整，页面大纲需自行保证层级连续。
- `Static` 的 `displayType="image"` 会渲染 `<img alt>`，`alt` 缺省时使用内置文案（zh-CN「图片」/ en-US `Image`，可用 `messages` 覆盖）。
- `Static` 的 `displayType="link"` 渲染的文件图标标记为 `aria-hidden="true"`，是纯装饰；文件名作为可读文本紧随其后。
- `Typography.Link` 传 `external` 时自动加上 `target="_blank"` 与 `rel="noopener noreferrer"`，避免新标签页反向控制原页面。

## 注意事项

- **裸组件名不导出，只能通过 `Typography` 对象访问**：源码注释说明 —— 该目录下的 `Table` / `Separator` / `ListItem` / `TableCell` 等裸组件名与本库其它公开组件（`src/ui/table`、`src/ui/separator`、`src/ui/edit`）**同名**，平铺导出会触发 TS2308「重复导出」冲突。因此消费方一律使用 `Typography.H1` / `Typography.Table` 这种聚合访问方式。
- **`Static` 单独导出**：它与其它组件无同名冲突，因此作为独立导出提供。
- **`Typography` 是聚合对象而非组件**：`Typography` 本身不能渲染，只用于访问其中的原语。
- **`Typography.Separator` 与包根的 `Separator` 是两个东西**：前者渲染 `<hr class="my-4 md:my-8">`（排版用分隔线），后者是语义化分隔线组件。
- **`Static` 的 `displayType` 决定渲染结构**：`text`（默认，纯文本）/ `image` / `link` / `list` / `json` / `object` / `tag` / `html` / `textarea`，共 9 种。
- **`Static` 的 `isEmpty` 优先级最高**：为真时直接渲染占位文案 `emptyText`（默认 `'-'`），不再走 `displayType` 分支。
- **`Static` 的 `displayType="html"` 使用 `dangerouslySetInnerHTML`**：直接插入 HTML 字符串，**必须**确保内容来自可信来源，否则存在 XSS 风险。
- **`Static` 的 `displayType="image"` 会拼接 `baseUrl`**：`imageUrl` 以 `http` 或 `data:` 开头时视为绝对地址，否则与 `baseUrl` 拼接；`baseUrl` 默认为空字符串。
- **`Static` 的 `displayType="link"` 同样拼接 `baseUrl`**，并强制加上 `download` 与 `target="_blank"`；链接文案取路径最后一段，缺失时使用内置文案（zh-CN「文件」/ en-US `File`）。
- **`Static` 的 `displayType="tag"` 默认最多展示 3 个标签**（`maxTags` 默认 `3`），多余的以 `+n` 聚合标签展示；每个标签带 `title` 提示完整内容。
- **`Static` 的 `displayType="tag"` 会按值推导标签配色**：`1` / `true` / `是` / `启用` / `开启` → `success`，`0` / `false` / `否` / `禁用` / `关闭` → `error`，其余为 `default`。
- **`Static` 的 `displayType="tag"` 支持 `options` 映射**：按 `value` 匹配 `options` 并用 `label` 替换展示文本。
- **`Static` 的 `fixedHeight` 与 `scrollable` 需配合使用**：只有同时设置 `fixedHeight` 与 `scrollable`（默认 `true`）才会出现内部滚动条。
- **`Static` 的 `json` / `object` 分支共用同一实现**：对象会被 `JSON.stringify(children, null, 2)` 序列化后放入 `<pre>`。
- **`Static` 的 `list` 分支**：`children` 必须是数组；数组元素为对象时优先取 `label` / `name` / `title`，都没有则退化为 `JSON.stringify`。
- **`Static` 的 `className` 合并到末位**，自定义类名优先级最高。
- **段落有默认上间距**：`P` 的样式包含 `[&:not(:first-child)]:mt-6`，非首个段落自动留出 24px 上间距。
- **表格外层有滚动容器**：`Typography.Table` 会被包进 `<div class="my-6 w-full overflow-y-auto">`，因此宽表格可横向滚动。

## 导出

### 组件

| 导出名        | 说明 |
| ------------- | ---- |
| `LinkProps`   |      |
| `Static`      |      |
| `StaticProps` |      |
| `Typography`  |      |
