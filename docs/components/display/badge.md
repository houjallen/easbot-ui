# Badge 徽章

> 展示状态、计数或标签信息的小型标记，支持纯标签、数字角标与状态圆点三种互斥渲染模式。

---

**导入**

```tsx
import { Badge, badgeVariants } from '@easbot/ui';
```

## 基础用法

```tsx
import { Badge } from '@easbot/ui';

export default function App() {
  return <Badge>默认徽章</Badge>;
}
```

数字角标（超出封顶值显示 `99+`）：

```tsx
<Badge count={5}>通知</Badge>
<Badge count={99} overflowCount={9}>超出封顶</Badge>
<Badge count={0} showZero>显示零值</Badge>
```

状态圆点：

```tsx
<Badge dot>
  <User size={20} />
</Badge>
```

渲染为子元素（不生成 `<span>`）：

```tsx
import { Button } from '@easbot/ui';

<Badge asChild variant="outline">
  <Button size="sm">按钮徽章</Button>
</Badge>;
```

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| `default`（默认） | 主色实心徽章（`bg-primary` / `text-primary-foreground`），边框透明     |
| `secondary`       | 次色实心徽章（`bg-secondary` / `text-secondary-foreground`），边框透明 |
| `destructive`     | 危险色实心徽章（`bg-destructive` / 白色文字），暗色主题下为半透明红底  |
| `outline`         | 描边样式，仅文字色，背景透明，hover 时变为 `bg-accent`                 |
| `success`         | 成功样式，绿色边框 + 浅绿底 + 深绿文字                                 |
| `warning`         | 警告样式，黄色边框 + 浅黄底 + 深黄文字                                 |
| `info`            | 信息样式，蓝色边框 + 浅蓝底 + 深蓝文字                                 |

## 属性

继承自 `React.ComponentProps<typeof DSBadge>, VariantProps<typeof dsBadgeVariants>`。

| 属性                 | 类型               | 默认值 | 说明                         |
| -------------------- | ------------------ | ------ | ---------------------------- |
| `asChild?`           | `boolean`          | —      | 是否作为子组件渲染（Slot）。 |
| `dot?`               | `boolean`          | —      | 是否显示状态点（dot）。      |
| `dotColor?`          | `string`           | —      | 状态点颜色。                 |
| `count?`             | `number`           | —      | 数字角标值。                 |
| `overflowCount?`     | `number`           | —      | 溢出值。                     |
| `showZero?`          | `boolean`          | —      | 是否显示零值。               |
| `animationDuration?` | `number`           | —      | 动画持续时间。               |
| `offset?`            | `[number, number]` | —      | 偏移量。                     |

`BadgeProps` 是 `Badge` 的属性接口，继承设计系统层 `Badge` 的全部原生属性与 `VariantProps<typeof dsBadgeVariants>`。

本表只列组件自有属性；此外还透传 `<span>` 的全部原生属性（`id` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

### 圆点配色映射表（非 cva）

`variant` 在圆点模式下不决定样式，而是查表 `badgeVariantStyleMap` 决定圆点的背景色与边框色：

| variant       | 背景色                   | 边框色                    |
| ------------- | ------------------------ | ------------------------- |
| `destructive` | `var(--color-red-50)`    | `var(--color-red-400)`    |
| `success`     | `var(--color-green-50)`  | `var(--color-green-400)`  |
| `warning`     | `var(--color-yellow-50)` | `var(--color-yellow-400)` |
| `info`        | `var(--color-blue-50)`   | `var(--color-blue-400)`   |
| `outline`     | `var(--color-gray-50)`   | `var(--color-gray-300)`   |
| `secondary`   | `var(--color-gray-100)`  | `var(--color-gray-400)`   |
| `default`     | `var(--color-gray-100)`  | `var(--color-gray-200)`   |

> 传入 `dotColor` 时圆点背景色改用 `dotColor`，边框色仍按上表取。

## 无障碍

- `Badge` 本身不设置 `role`，作为普通文本 / 标记元素呈现。
- 数字角标模式下，数字文本即为徽章内容，屏幕阅读器会直接读出（如「5」）。
- 圆点模式下的圆点 `<span>` **没有** `aria-hidden`，也没有文本内容，属于纯视觉元素；若圆点承载了语义（如「有未读消息」），请在业务层补充可见文案或 `aria-label`。
- 圆点 / 徽章的颜色若用于表达状态，请不要只依赖颜色区分语义。

## 注意事项

- **三种模式互斥，优先级为 `dot` > 数字角标 > 纯标签**：源码中 `dot` 分支最先 `return`；`dot` 为真时 `count` 完全不生效。
- **纯标签模式渲染 `<span>`**：底层设计系统层 `Badge` 的默认根元素是 `<span>`（`asChild` 时替换为子元素）。
- **数字角标模式会多包一层 `<span class="relative inline-block align-middle">`**：`children` 被包裹在容器内，绝对定位的徽标 `<span>` 是它的兄弟节点；此时 `className` 作用于**徽标本身**，而不是容器。
- **圆点模式透传 `className` 与原生属性**：`className` 合并到圆点容器（`relative inline-block align-middle`）末位，`...props`（`id` / `data-*` / `aria-*` / `onClick` 等）一并挂到该容器 —— 与数字角标模式保持一致的行为契约。
- **圆点模式下 `ref` 挂到圆点容器**：三种模式（dot / 数字角标 / 纯标签）均支持 ref 转发。
- **`offset` 语义**：数组第 0 项作用于 `right`、第 1 项作用于 `top`（源码为 `style={{ right: x, top: y }}`），默认 `[-4, -4]` 表示向左上偏移，使徽标挂在目标元素右上角；传入非长度为 2 的数组会回退为 `[-4, -4]`。
- **`count` 的解析规则**：`undefined` / `null` → 不显示；`NaN` 或负数 → 不显示；`0` 且未开启 `showZero` → 不显示；大于 `overflowCount`（默认 `99`）→ 显示 `${overflowCount}+`。
- **`count` 兼容字符串**：类型声明为 `number`，但实现会先按 `Number.parseInt` 解析字符串，非法字符串会被判定为无效值。
- **`animationDuration` 写入 `transitionDuration`**（默认 `300` 毫秒），仅影响徽标的颜色过渡动画时长。
- **数字角标有最小宽度 `min-w-[20px]`** 并带 `opacity-85`，与「状态点统一透明度 0.85」的策略保持一致。
- **圆点尺寸固定 `8px`**，边框 `1.5px`。
- **`asChild` 只在纯标签模式下生效**：数字角标与圆点模式会自行渲染 `<span>` 容器，`asChild` 不参与。
- **纯标签模式会透传 `asChild` 给设计系统层**：因此 `Slot` 用法生效，徽章样式会落到子元素上。
- **`className` 合并到末位**，自定义类名优先级最高。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--color-blue-400`
- `--color-blue-50`
- `--color-gray-100`
- `--color-gray-200`
- `--color-gray-300`
- `--color-gray-400`
- `--color-gray-50`
- `--color-green-400`
- `--color-green-50`
- `--color-red-400`
- `--color-red-50`
- `--color-yellow-400`
- `--color-yellow-50`

## 导出

### 组件

| 导出名       | 说明 |
| ------------ | ---- |
| `Badge`      |      |
| `BadgeProps` |      |

### 类型与工具函数

| 导出名          | 说明 |
| --------------- | ---- |
| `badgeVariants` |      |
