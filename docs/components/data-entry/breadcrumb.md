# Breadcrumb 面包屑

> 展示当前页面在层级结构中的位置，标注父级路径并标记当前页。

---

**导入**

```tsx
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@easbot/ui';
```

## 基础用法

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@easbot/ui';

export default function App() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">首页</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">产品</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>详情</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

层级过多时用省略号折叠：

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">首页</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>详情</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

自定义分隔符：

```tsx
<BreadcrumbSeparator>
  <span className="text-muted-foreground">→</span>
</BreadcrumbSeparator>
```

`BreadcrumbProps` / `BreadcrumbListProps` / `BreadcrumbItemProps` / `BreadcrumbLinkProps` / `BreadcrumbPageProps` / `BreadcrumbSeparatorProps` / `BreadcrumbEllipsisProps` 均为 `React.ComponentProps<typeof 对应组件>` 的类型别名 —— **无自有成员**；其中 `BreadcrumbProps` 与 `BreadcrumbEllipsisProps` 额外交叉了 `UiMessageProps`（`locale` / `messages`），用于覆盖内置文案。

## 无障碍

- `Breadcrumb` 渲染为 `<nav>`，并注入 `aria-label` —— 未显式传入时取内置 `breadcrumb` 文案域的「面包屑导航」（en-US 为 `breadcrumb`）；调用方传入的 `aria-label` 优先。
- `BreadcrumbList` 渲染为 `<ol>`，`BreadcrumbItem` 渲染为 `<li>` —— 使用有序列表语义表达层级顺序。
- `BreadcrumbPage` 渲染为 `<span>` 并注入 `aria-current="page"`。源码注释说明：当前页不可点击，故**不**使用 `role="link"`（避免引入不可聚焦的交互角色），仅以 `aria-current` 标注。
- `BreadcrumbSeparator` 与 `BreadcrumbEllipsis` 均标记 `role="presentation"` + `aria-hidden="true"`，对读屏不可见。
- `BreadcrumbEllipsis` 内部虽然渲染了一个 `sr-only` 的「更多」文本（走内置文案，可被 `messages` 覆盖），但它位于 `aria-hidden="true"` 的祖先容器内 —— 因此**读屏实际不会播报**它，仅对视觉用户有意义。若需要省略号可被读屏感知，请自行在 `BreadcrumbItem` 内补充可读文本。
- `BreadcrumbLink` 渲染为原生 `<a>`，可直接被键盘聚焦与激活；支持 `asChild` 替换为任意元素（如路由库的 `Link`）。
- 组件不注入任何焦点样式，链接的焦点环取决于浏览器 / 全局样式。

## 注意事项

- **`src/ui` 层做了 i18n 透传**：`Breadcrumb` 与 `BreadcrumbEllipsis` 是薄封装，把 `locale` / `messages` 透传给设计系统层；其余子组件是纯 re-export。
- **内置文案只有两条**：`navLabel`（导航区域的 `aria-label`，zh-CN「面包屑导航」/ en-US `breadcrumb`）与 `more`（省略号的读屏文本，zh-CN「更多」/ en-US `More`），均来自内置 `breadcrumb` 文案域，可通过 `messages` 覆盖。
- **`BreadcrumbLink` 的 `asChild` 需要显式传**：组件用 `Slot` 实现，默认渲染 `<a>`；传 `asChild` 后由子元素决定最终标签。
- **分隔符默认是 `ChevronRight`**：`BreadcrumbSeparator` 未传 `children` 时渲染 lucide 的 `ChevronRight` 图标；传了 `children` 则完全替换。
- **分隔符的图标尺寸被限制为 `size-3.5`**：通过 `[&>svg]:size-3.5` 约束，自定义图标也会被强制到这个尺寸。
- **列表会自动换行**：`BreadcrumbList` 使用 `flex flex-wrap`，层级多时自动折行，不会溢出容器。
- **根组件不渲染任何可见元素**：`<nav>` 本身没有样式，间距由 `BreadcrumbList` 的 `gap-1.5 sm:gap-2.5` 提供。
- **颜色默认是弱化的**：`BreadcrumbList` 使用 `text-muted-foreground`，当前页 `BreadcrumbPage` 单独用 `text-foreground` 提亮。
- **不消费任何主题 CSS 变量。**

## 导出

### 组件

| 导出名                     | 说明 |
| -------------------------- | ---- |
| `Breadcrumb`               |      |
| `BreadcrumbEllipsis`       |      |
| `BreadcrumbEllipsisProps`  |      |
| `BreadcrumbItem`           |      |
| `BreadcrumbItemProps`      |      |
| `BreadcrumbLink`           |      |
| `BreadcrumbLinkProps`      |      |
| `BreadcrumbList`           |      |
| `BreadcrumbListProps`      |      |
| `BreadcrumbPage`           |      |
| `BreadcrumbPageProps`      |      |
| `BreadcrumbProps`          |      |
| `BreadcrumbSeparator`      |      |
| `BreadcrumbSeparatorProps` |      |
