# Card 内容容器

> 把相关内容组织成一块带边框的卡片，配套提供头部、标题、描述、操作区、正文与底部区域。

---

**导入**

```tsx
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@easbot/ui';

export default function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>账户设置</CardTitle>
        <CardDescription>管理你的账户偏好</CardDescription>
      </CardHeader>
      <CardContent>这里是卡片正文。</CardContent>
      <CardFooter>这里是卡片底部。</CardFooter>
    </Card>
  );
}
```

头部右侧操作区：

```tsx
import { Button } from '@easbot/ui';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@easbot/ui';

export default function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>项目</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            设置
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>正文</CardContent>
    </Card>
  );
}
```

`CardProps` 等 7 个类型都是 `React.ComponentProps<'div'>` 的别名 —— **无自有成员**，全部继承 `<div>` 的原生属性（`id` / `className` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 各部件都是语义化的 `<div>`，**不设置** `role`；如需区域语义请自行传 `role="region"` 与 `aria-label`。
- `CardTitle` / `CardDescription` 同样是 `<div>`，**不是** `<h3>` / `<p>`；需要文档大纲层级时请自行包裹标题标签。
- 头部与底部是纯布局容器，不含任何可聚焦元素。
- 焦点样式由内部元素自行决定；卡片本身不可聚焦。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardAction` / `CardContent` / `CardFooter` 直接等于设计系统层 `src/design-system/components/ui/card.tsx` 的实现，未新增任何自有属性 —— props 与 Radix / DS 一致。
- **卡片间距由 `gap-6` 承担**：根容器是 `flex flex-col gap-6`，各子区域之间有 24px 间距；卡片自身的上下内边距为 `py-6`。
- **头部内边距为 `px-6`，正文与底部同样为 `px-6`**：三者的水平内边距一致，垂直内边距仅根容器有。
- **`CardHeader` 是两行网格**：`grid-rows-[auto_auto]`，第 1 行放标题、第 2 行放描述；若在头部内放入第 3 个元素会另起一行。
- **`CardAction` 依赖头部网格**：它使用 `col-start-2 row-start-1 row-span-2`，头部通过 `has-data-[slot=card-action]:grid-cols-[1fr_auto]` 自动让出第二列 —— 因此 `CardAction` 必须放在 `CardHeader` **内部**，放在外部不会产生右对齐效果。
- **`CardAction` 自带右对齐**（`justify-self-end`）与 `self-start`。
- **分隔线用「任意子元素带边框」触发**：头部与底部分别通过 `.border-b` / `.border-t` 选择器补 `pb-6` / `pt-6`，即在头部或底部直接加 `className="border-b"` 即可获得分隔线。
- **`CardDescription` 使用弱化前景色**（`text-muted-foreground text-sm`）。
- **卡片配色走 `bg-card` / `text-card-foreground`**，圆角为 `rounded-xl`，带 `shadow-sm`。
- **`className` 合并到末位**，自定义类名优先级最高。
- **没有 `variant` / `size` / `loading` / `disabled` 等扩展能力**，卡片仅提供容器语义与样式。

## 导出

### 组件

| 导出名                 | 说明 |
| ---------------------- | ---- |
| `Card`                 |      |
| `CardAction`           |      |
| `CardActionProps`      |      |
| `CardContent`          |      |
| `CardContentProps`     |      |
| `CardDescription`      |      |
| `CardDescriptionProps` |      |
| `CardFooter`           |      |
| `CardFooterProps`      |      |
| `CardHeader`           |      |
| `CardHeaderProps`      |      |
| `CardProps`            |      |
| `CardTitle`            |      |
| `CardTitleProps`       |      |
