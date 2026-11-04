# Pagination 分页

> 分页导航条，用于在多页数据之间切换，支持页码、省略号与上一页 / 下一页。

---

**导入**

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@easbot/ui';

export default function App() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationPrevious
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-disabled={page === 1}
          className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
        />
        {[1, 2, 3].map((p) => (
          <PaginationItem key={p}>
            <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationEllipsis />
        <PaginationItem>
          <PaginationLink onClick={() => setPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
        <PaginationNext
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          aria-disabled={page === totalPages}
          className={page === totalPages ? 'pointer-events-none opacity-50' : undefined}
        />
      </PaginationContent>
    </Pagination>
  );
}
```

用真实链接跳转（服务端渲染场景推荐）：

```tsx
<Pagination>
  <PaginationContent>
    <PaginationPrevious href="?page=1" />
    <PaginationItem>
      <PaginationLink href="?page=1" isActive>
        1
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="?page=2">2</PaginationLink>
    </PaginationItem>
    <PaginationNext href="?page=2" />
  </PaginationContent>
</Pagination>
```

覆盖内置文案（语言 / 自定义）：

```tsx
<Pagination locale="en-US">
  <PaginationContent>
    <PaginationPrevious />
    <PaginationItem>
      <PaginationLink href="?page=1" isActive>
        1
      </PaginationLink>
    </PaginationItem>
    <PaginationNext />
  </PaginationContent>
</Pagination>
```

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `default`（默认） | 主色实心按钮（`bg-primary` / `text-primary-foreground`），阴影 `shadow-xs`                |
| `destructive`     | 危险色实心按钮（`bg-destructive` + 白色文字），暗色主题下为半透明红底                     |
| `outline`         | 边框样式、透明背景（`border bg-background`）；`PaginationLink` 在 `isActive` 时使用此取值 |
| `secondary`       | 次色实心按钮（`bg-secondary` / `text-secondary-foreground`）                              |
| `ghost`           | 幽灵按钮，hover 时显示 `bg-accent` 背景；`PaginationLink` 在非激活时使用此取值            |
| `link`            | 链接样式，主色文字 + hover 下划线                                                         |

### size

| 取值              | 说明                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------- |
| `default`（默认） | 默认，`h-9 px-4 py-2`（36px）；`PaginationPrevious` / `PaginationNext` 默认使用此尺寸 |
| `sm`              | 小，`h-8 gap-1.5 rounded-md px-3`（32px）                                             |
| `lg`              | 大，`h-10 rounded-md px-6`（40px）                                                    |
| `icon`            | 图标按钮，正方形 `size-9`（36px）；`PaginationLink` 默认使用此尺寸                    |

`PaginationProps` 是 `Pagination` 的属性类型（`React.ComponentProps<typeof Pagination> & UiMessageProps`），额外继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。
`PaginationContentProps` / `PaginationItemProps` / `PaginationLinkProps` / `PaginationPreviousProps` / `PaginationNextProps` / `PaginationEllipsisProps` 均为对应组件的属性类型别名 —— **无自有成员**，全部继承底层实现的原生属性。

本表只列组件自有属性；此外还透传 `<nav>` / `<ul>` / `<li>` / `<a>` / `<span>` 的全部原生属性（`id` / `style` / `href` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- `Pagination` 渲染为 `<nav>`，并注入 `aria-label`（内置 `pagination` 文案域的 `navLabel`：zh-CN「分页导航」/ en-US `pagination`），为读屏提供导航区域名称。
- `PaginationContent` 渲染为 `<ul>`，`PaginationItem` 渲染为 `<li>`，页码项在列表语义下被正确聚合成一个列表。
- `PaginationLink` 渲染为 `<a>`，激活项注入 `aria-current="page"` 与 `data-active="true"`；非激活项不写入 `aria-current`（但 `data-active` 仍会输出 `false`）。
- `PaginationPrevious` / `PaginationNext` 渲染为 `<a>`，并注入 `aria-label`（内置文案 `prevAriaLabel` / `nextAriaLabel`：zh-CN「转到上一页」/「转到下一页」）。
- `PaginationEllipsis` 渲染为 `<span aria-hidden="true">`，内部 `<span class="sr-only">` 提供「更多页」的文本补充；外层 `aria-hidden` 使图标与该文本整体不被读屏播报。
- `PaginationPrevious` / `PaginationNext` 的文字部分包在 `<span class="hidden sm:block">` 中 —— 小屏下只保留箭头图标，可访问名称由 `aria-label` 承担。
- **组件不提供禁用态**：`PaginationLink` 渲染的是 `<a>`，不支持原生 `disabled`；需要禁用时用 `aria-disabled="true"` 表达语义、用 `className="pointer-events-none opacity-50"` 表达视觉禁用。
- **无 `href` 的 `<a>` 不可聚焦**：若只绑定 `onClick` 而不传 `href`，键盘用户无法 Tab 到该页码；需要键盘可达请传 `href`。
- 焦点样式沿用设计系统层 `buttonVariants` 的 `focus-visible:border-ring` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。

## 注意事项

- **`src/ui` 层是设计系统层的薄封装**：除 `Pagination` / `PaginationPrevious` / `PaginationNext` / `PaginationEllipsis` 四个组件在**文案层**做了国际化包装外，`PaginationContent` / `PaginationItem` / `PaginationLink` 直接等于设计系统层 `src/design-system/components/ui/pagination.tsx` 的实现。
- **文案可覆盖顺序**：`children` > 组件传入的 `aria-label` > `locale` / `messages` 对应的内置文案；`Pagination` 根组件的 `aria-label` 缺省取 `navLabel`。
- **`en-US` 的 `navLabel` 是小写 `pagination`**：与 zh-CN「分页导航」语义一致但大小写风格不同（源码现状），如需 `Pagination` 请用 `messages` 覆盖。
- **`PaginationPrevious` / `PaginationNext` 的 children 必须是字符串**：设计系统层用模板字符串 `` `${children ?? t('prev')}` `` 渲染文字，传入 JSX 元素会被转成 `[object Object]`。
- **`PaginationEllipsis` 的 children 同理**，只能传字符串。
- **`PaginationPrevious` / `PaginationNext` 的 `size` 可被覆盖**：设计系统层内部先写死 `size="default"`，随后展开 `{...props}`，因此调用方传入的 `size` 优先级更高。
- **`PaginationLink` 的 variant 由 `isActive` 推导**：激活 → `outline`，非激活 → `ghost`；组件不提供 `variant` prop 直接切换。
- **`PaginationLink` 的 `size` 默认是 `icon`**（`size-9` 正方形），适合只放页码数字的场景。
- **`PaginationLink` 接受但不使用 `locale` / `messages`**：设计系统层的 `PaginationLink` 把这两个属性解构后丢弃（它本身不渲染任何文案），语言只对 `Pagination` / `PaginationPrevious` / `PaginationNext` / `PaginationEllipsis` 生效。
- **`Pagination` 根容器自带 `mx-auto flex w-full justify-center`**：分页条默认水平居中；再传 `className` 会合并到末位，自定义类名优先级最高。
- **没有「跳页输入框」「每页条数切换」等内建能力**：内置 `pagination` 文案域虽然提供了 `total` / `page` / `pageSize` / `itemsPerPage` / `jumpTo` / `go` / `jumpPrev` / `jumpNext` 等 key，但 `src/ui/pagination` 只消费了 `navLabel` / `prev` / `next` / `prevAriaLabel` / `nextAriaLabel` / `morePages`；其余 key 供表格组件（`src/ui/table` 有独立的 i18n 文案表）使用。
- **组件本身不管理分页状态**：页码、每页条数、跳转逻辑需由调用方自行维护（见上方示例）。

## 导出

### 组件

| 导出名                    | 说明 |
| ------------------------- | ---- |
| `Pagination`              |      |
| `PaginationContent`       |      |
| `PaginationContentProps`  |      |
| `PaginationEllipsis`      |      |
| `PaginationEllipsisProps` |      |
| `PaginationItem`          |      |
| `PaginationItemProps`     |      |
| `PaginationLink`          |      |
| `PaginationLinkProps`     |      |
| `PaginationNext`          |      |
| `PaginationNextProps`     |      |
| `PaginationPrevious`      |      |
| `PaginationPreviousProps` |      |
| `PaginationProps`         |      |
