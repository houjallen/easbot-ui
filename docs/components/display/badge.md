# Badge 徽标

> 用于展示状态、计数或标签信息的小型组件，支持纯标签、数字计数徽标与状态圆点三种互斥渲染模式。

**导入**

```tsx
import { Badge } from '@easbot/ui';
```

## 基础用法

```tsx
<Badge>默认徽标</Badge>
```

纯标签模式渲染为 `<div>`；数字与圆点模式会渲染为包裹 `children` 的 `<span>`（详见「渲染模式」）。

## 组成部分

`Badge` 为单组件，无子组件。

## 渲染模式

`Badge` 根据 `dot` / `count` 的取值决定渲染结构，三种模式**互斥**，
优先级为 `dot` > 数字计数 > 纯标签：

| 模式     | 触发条件                       | DOM 结构                                                                                |
| -------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| 圆点模式 | `dot` 为 `true`                | `<span class="relative inline-block">` 包裹 `children`，内含一个绝对定位的圆点 `<span>` |
| 计数模式 | `count` 有值且解析后为合法正数 | `<span class="relative inline-block">` 包裹 `children`，内含一个绝对定位的徽标 `<span>` |
| 标签模式 | 以上都不满足                   | 直接渲染 `<div>`，内容为 `children`                                                     |

其中 `count` 的解析规则：

1. `count` 为 `undefined` → 不进入计数模式。
2. `count` 为字符串时按 `Number.parseInt(count, 10)` 解析；解析结果为 `NaN` 或 `< 0` → 不进入计数模式。
3. 解析结果为 `0` 且 `showZero` 为 `false`（默认）→ 不进入计数模式（不渲染任何徽标）。
4. 解析结果 `> overflowCount`（默认 `99`）→ 显示 `${overflowCount}+`，即 `99+`。
5. 其余情况显示数字本身。

> 注意：圆点模式与计数模式下，`className` / `variant` / `size` 等样式只作用于**徽标本身**（内层 `<span>`），
> 外层包裹 `<span>` 固定为 `relative inline-block`；圆点模式更是完全不应用 `className` 与原生属性。

## 变体

### variant

| 取值          | 说明                            |
| ------------- | ------------------------------- |
| `default`     | 默认灰底样式                    |
| `secondary`   | 次要样式                        |
| `destructive` | 危险样式                        |
| `outline`     | 描边样式（透明背景 + 灰色边框） |
| `success`     | 成功样式                        |
| `warning`     | 警告样式                        |
| `info`        | 信息样式                        |

默认值：`default`。

### size

| 取值      | 说明                                    |
| --------- | --------------------------------------- |
| `sm`      | 小号（高度 `--badge-sm-height`）        |
| `default` | 默认号（高度 `--badge-default-height`） |
| `lg`      | 大号（高度 `--badge-lg-height`）        |

默认值：`default`。

### rounded

| 取值      | 说明                                 |
| --------- | ------------------------------------ |
| `none`    | 无圆角                               |
| `sm`      | 小圆角（`--badge-border-radius-sm`） |
| `default` | 默认圆角（`--badge-border-radius`）  |
| `lg`      | 大圆角（`--badge-border-radius-lg`） |
| `full`    | 全圆角（`rounded-full`）             |

默认值：`default`。

### dot

| 取值    | 说明                                     |
| ------- | ---------------------------------------- |
| `true`  | 渲染状态圆点模式（圆点为纯装饰，无文字） |
| `false` | 不渲染圆点（默认值）                     |

## 属性

| 属性                | 类型                                                                                         | 默认值      | 说明                                                            |
| ------------------- | -------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| `variant`           | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'success' \| 'warning' \| 'info'` | `'default'` | 徽标视觉变体                                                    |
| `size`              | `'sm' \| 'default' \| 'lg'`                                                                  | `'default'` | 徽标尺寸                                                        |
| `rounded`           | `'none' \| 'sm' \| 'default' \| 'lg' \| 'full'`                                              | `'default'` | 徽标圆角                                                        |
| `dot`               | `boolean`                                                                                    | `false`     | 是否显示点状标记                                                |
| `count`             | `number \| string`                                                                           | —           | 显示的数字或文本（支持负数自动归零）                            |
| `overflowCount`     | `number`                                                                                     | `99`        | 封顶数字，超出后显示 `${overflowCount}+`                        |
| `showZero`          | `boolean`                                                                                    | `false`     | 数值为 `0` 时是否展示                                           |
| `dotColor`          | `` `#${string}` \| `var(--${string})` ``                                                     | —           | 状态点的自定义颜色（支持 CSS 变量）                             |
| `offset`            | `[number, number]`                                                                           | `[-4, -4]`  | 数字徽标 / 圆点的位置偏移量 `[水平, 垂直]`                      |
| `animationDuration` | `number`                                                                                     | —           | 动画持续时间（ms），写入 `--enter-duration` / `--exit-duration` |
| `className`         | `string`                                                                                     | —           | 自定义类名（**仅标签模式与计数模式生效**，圆点模式会丢弃）      |
| `children`          | `React.ReactNode`                                                                            | —           | 徽标内容 / 被包裹的元素                                         |

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

> 透传属性的落点随模式变化：标签模式透传到 `<div>`，计数模式透传到内层徽标 `<span>`，
> 圆点模式**不透传**任何原生属性（外层包裹 `<span>` 与圆点 `<span>` 均未接收 `...props`）。

## 导出

| 导出名          | 类型 | 说明                                                          |
| --------------- | ---- | ------------------------------------------------------------- |
| `Badge`         | 组件 | 徽标组件，`React.forwardRef`                                  |
| `badgeVariants` | 常量 | `cva` 变体定义（`variant` / `size` / `rounded` 三个维度）     |
| `BadgeProps`    | 类型 | `Badge` 的 props 类型                                         |
| `VariantProps`  | 类型 | `class-variance-authority` 的 `VariantProps` 类型（重新导出） |

## 无障碍

- `Badge` 本身不设置 `role`，作为普通文本 / 标记元素呈现。
- 计数模式下，数字文本即为徽标内容，屏幕阅读器会直接读出（如「5」）。
- 圆点模式下的圆点 `<span>` **没有** `aria-hidden`，也没有文本内容，属于纯视觉元素；
  如果圆点承载了语义（如「有未读消息」），请在业务层补充可见文案或 `aria-label`。
- 圆点 / 徽标的颜色若用于表达状态，请不要只依赖颜色区分语义。

## 主题变量

| 变量                         | 说明                          |
| ---------------------------- | ----------------------------- |
| `--badge-font-weight`        | 徽标字重                      |
| `--badge-border-radius`      | 默认圆角                      |
| `--badge-border-radius-sm`   | 小圆角                        |
| `--badge-border-radius-lg`   | 大圆角                        |
| `--badge-default-border`     | `default` 变体边框色          |
| `--badge-default-bg`         | `default` 变体背景色          |
| `--badge-default-text`       | `default` 变体文字色          |
| `--badge-secondary-border`   | `secondary` 变体边框色        |
| `--badge-secondary-bg`       | `secondary` 变体背景色        |
| `--badge-secondary-text`     | `secondary` 变体文字色        |
| `--badge-destructive-border` | `destructive` 变体边框色      |
| `--badge-destructive-bg`     | `destructive` 变体背景色      |
| `--badge-destructive-text`   | `destructive` 变体文字色      |
| `--badge-outline-border`     | `outline` 变体边框色          |
| `--badge-outline-bg`         | `outline` 变体背景色          |
| `--badge-outline-text`       | `outline` 变体文字色          |
| `--badge-success-border`     | `success` 变体边框色          |
| `--badge-success-bg`         | `success` 变体背景色          |
| `--badge-success-text`       | `success` 变体文字色          |
| `--badge-warning-border`     | `warning` 变体边框色          |
| `--badge-warning-bg`         | `warning` 变体背景色          |
| `--badge-warning-text`       | `warning` 变体文字色          |
| `--badge-info-border`        | `info` 变体边框色             |
| `--badge-info-bg`            | `info` 变体背景色             |
| `--badge-info-text`          | `info` 变体文字色             |
| `--badge-sm-height`          | `size="sm"` 的高度            |
| `--badge-sm-min-width`       | `size="sm"` 的最小宽度        |
| `--badge-sm-padding-x`       | `size="sm"` 的左右内边距      |
| `--badge-sm-padding-y`       | `size="sm"` 的上下内边距      |
| `--badge-sm-font-size`       | `size="sm"` 的字号            |
| `--badge-default-height`     | `size="default"` 的高度       |
| `--badge-default-min-width`  | `size="default"` 的最小宽度   |
| `--badge-default-padding-x`  | `size="default"` 的左右内边距 |
| `--badge-default-padding-y`  | `size="default"` 的上下内边距 |
| `--badge-default-font-size`  | `size="default"` 的字号       |
| `--badge-lg-height`          | `size="lg"` 的高度            |
| `--badge-lg-min-width`       | `size="lg"` 的最小宽度        |
| `--badge-lg-padding-x`       | `size="lg"` 的左右内边距      |
| `--badge-lg-padding-y`       | `size="lg"` 的上下内边距      |
| `--badge-lg-font-size`       | `size="lg"` 的字号            |
| `--badge-dot-size`           | 状态圆点尺寸                  |
| `--badge-dot-border-width`   | 状态圆点边框宽度              |
| `--badge-dot-border-color`   | 状态圆点边框颜色              |
| `--badge-dot-default-color`  | 状态圆点默认颜色              |

## 组合用法 / 注意事项

1. **三种模式互斥**：`dot` 为 `true` 时会直接走圆点分支，`count` 不再生效；`count` 缺失 / 非法 / 为 `0` 且未开启
   `showZero` 时才会退化为纯标签模式。
2. **计数封顶**：默认 `overflowCount={99}`，`count={100}` 显示 `99+`，需要展示完整数字请显式传 `overflowCount`。
3. **`count={0}` 默认不展示**：需要显示 `0` 时传 `showZero`；负数会被视为非法值并退化为纯标签模式。
4. **`offset` 语义**：数组第 0 项作用于 `right`、第 1 项作用于 `top`（源码为 `style={{ right: x, top: y }}`），
   默认 `[-4, -4]` 表示向左上偏移，使徽标挂在目标元素右上角。
5. **DOM 结构差异**：纯标签模式渲染 `<div>`，而数字 / 圆点模式渲染 `<span>`，
   在 flex / grid 布局中排版行为可能不同，需要时用 `className` 自行调整。
6. **`dotColor` 同时作用于类名与内联样式**：传入 `#hex` 或 `var(--xxx)` 时，圆点会以 `bg-[${dotColor}]` 生成类名，
   同时写入内联 `backgroundColor`，自定义颜色建议使用 `var(--xxx)` 形式以便跟随主题切换。
7. **圆点模式丢弃 `className` 与原生属性**：源码中圆点分支直接 `return`，未把 `className` / `...props`
   挂到任何元素上，因此圆点模式下 `className` 与 `id` / `data-*` 等属性**不会生效**。
8. **`animationDuration` 未设默认值时不合法**：源码用 `animationDuration! / 2` 计算退场时长，
   未传该属性时内联样式会写入 `--enter-duration: undefinedms` 与 `--exit-duration: NaNms`。
   需要动画效果时请显式传数值。
9. **`count` 支持字符串**：`count="12"` 会被 `Number.parseInt` 解析为 `12`；
   但 `count="abc"` 会被判定为非法值并退化为纯标签模式。
