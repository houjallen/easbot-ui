# Avatar 头像

> 用于展示用户头像，支持图片 / 文字 / 图标三种内容形式，以及尺寸、形状与在线状态指示。

**导入**

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@easbot/ui';
```

## 基础用法

```tsx
<Avatar>
  <AvatarImage src="https://example.com/avatar.png" alt="用户头像" />
  <AvatarFallback>候</AvatarFallback>
</Avatar>
```

渲染结构：根节点为 `<span role="img" aria-label="用户头像">`（基于 Radix `Avatar.Root`），
`AvatarImage` 加载失败或未加载时 Radix 会自动显示 `AvatarFallback`。

## 组成部分

| 子组件           | 说明                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `AvatarImage`    | 头像图片，渲染为 `<img>`，加载失败时自动隐藏自身并显示 fallback  |
| `AvatarFallback` | 图片未就绪时的占位内容，渲染为 `<span>`，用于文字 / 图标首字缩写 |

## 变体

### size

| 取值 | 说明                           |
| ---- | ------------------------------ |
| `sm` | 小尺寸（`--avatar-size-sm`）   |
| `md` | 中等尺寸（`--avatar-size-md`） |
| `lg` | 大尺寸（`--avatar-size-lg`）   |

默认值：`md`。

### shape

| 取值     | 说明                                 |
| -------- | ------------------------------------ |
| `circle` | 圆形（`--avatar-radius-circle`）     |
| `square` | 圆角方形（`--avatar-radius-square`） |

默认值：`circle`。

### status

| 取值      | 说明                              |
| --------- | --------------------------------- |
| `online`  | 在线（`--avatar-status-online`）  |
| `offline` | 离线（`--avatar-status-offline`） |
| `busy`    | 忙碌（`--avatar-status-busy`）    |
| `away`    | 离开（`--avatar-status-away`）    |

默认值：`—`（不传则不渲染状态指示点）。

## 属性

| 属性           | 类型                                        | 默认值     | 说明                            |
| -------------- | ------------------------------------------- | ---------- | ------------------------------- |
| `size`         | `'sm' \| 'md' \| 'lg'`                      | `'md'`     | 头像尺寸                        |
| `shape`        | `'circle' \| 'square'`                      | `'circle'` | 头像形状                        |
| `status`       | `'online' \| 'offline' \| 'busy' \| 'away'` | —          | 状态指示类型                    |
| `statusOffset` | `[number \| string, number \| string]`      | `[0, 0]`   | 状态指示位置偏移 `[水平, 垂直]` |
| `className`    | `string`                                    | —          | 自定义类名，合并到根节点        |

本表只列组件自有属性；此外还透传 Radix `Avatar.Root`（`<span>`）的全部原生属性，如 `id` / `aria-*` / `data-*` / `on*` 事件。

`AvatarImage` 的属性类型为 `React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & { onError?: React.ReactEventHandler<HTMLImageElement> }`，
即透传 `<img>` 原生属性（含 Radix 的 `onLoadingStatusChange`），并额外提供 `onError` 回调。
`AvatarFallback` 的属性类型为 `React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>`，额外支持 Radix 的 `delayMs`。

### statusOffset 的实际映射

源码中 `statusOffset` 的类型标注为 `[水平, 垂直]`，但**实际映射到 CSS 的 `bottom` 与 `right`**：

```tsx
style={{ bottom: statusOffset[0], right: statusOffset[1] }}
```

也就是说数组的第 0 项作用于 `bottom`（垂直方向），第 1 项作用于 `right`（水平方向），
与「水平在前、垂直在后」的直觉顺序相反。状态点默认绝对定位在 `bottom-0 right-0`，
因此 `statusOffset={[2, 2]}` 表示向下、向右各偏移 `2px`（会移出头像边界外侧）。

## 导出

| 导出名               | 类型 | 说明                                                  |
| -------------------- | ---- | ----------------------------------------------------- |
| `Avatar`             | 组件 | 头像根组件，渲染为 `<span role="img">`                |
| `AvatarImage`        | 组件 | 图片子组件，渲染为 `<img>`                            |
| `AvatarFallback`     | 组件 | 占位子组件，渲染为 `<span>`                           |
| `AvatarProps`        | 类型 | `Avatar` 的 props 类型                                |
| `AvatarVariantProps` | 类型 | `class-variance-authority` 的 `VariantProps` 类型别名 |

## 无障碍

- 根节点固定设置 `role="img"` 与 `aria-label="用户头像"`，可被屏幕阅读器识别为一张图片。
- `AvatarImage` 默认 `alt="用户头像"`；如需更精确的描述，请通过 `alt` 覆盖。
- `AvatarImage` 加载失败时会把自身 `display` 置为 `none` 并回调 `onError`，Radix 随后显示 `AvatarFallback`。
- 状态指示点是纯装饰元素，带 `aria-hidden="true"`，同时带 `data-testid="avatar-status"` 便于测试定位。
- 状态颜色（在线 / 离线 / 忙碌 / 离开）仅靠颜色区分，若状态具有语义，建议在业务层补充文案说明。

## 主题变量

| 变量                            | 说明                                   |
| ------------------------------- | -------------------------------------- |
| `--avatar-size-sm`              | `size="sm"` 的宽高                     |
| `--avatar-size-md`              | `size="md"` 的宽高                     |
| `--avatar-size-lg`              | `size="lg"` 的宽高                     |
| `--avatar-radius-circle`        | `shape="circle"` 的圆角                |
| `--avatar-radius-square`        | `shape="square"` 的圆角                |
| `--avatar-border-width`         | 边框宽度（通过 `--border-width` 注入） |
| `--avatar-border-color`         | 边框颜色                               |
| `--avatar-background`           | 根节点背景色                           |
| `--avatar-foreground`           | 根节点文字颜色                         |
| `--avatar-status-size`          | 状态点尺寸                             |
| `--avatar-status-border`        | 状态点边框                             |
| `--avatar-status-online`        | `status="online"` 的填充色             |
| `--avatar-status-offline`       | `status="offline"` 的填充色            |
| `--avatar-status-busy`          | `status="busy"` 的填充色               |
| `--avatar-status-away`          | `status="away"` 的填充色               |
| `--avatar-fallback-background`  | 占位内容背景色                         |
| `--avatar-fallback-foreground`  | 占位内容文字色                         |
| `--avatar-fallback-font-size`   | 占位内容字号                           |
| `--avatar-fallback-font-weight` | 占位内容字重                           |

## 组合用法 / 注意事项

1. `AvatarImage` 与 `AvatarFallback` 建议成对使用：前者用于真实图片，后者用于图片未就绪 / 加载失败时的兜底。
2. 根节点已固定 `role="img"` 与 `aria-label`，若需要更具体的语义（如「张三的头像」），可通过
   `aria-label` 覆盖默认文案。
3. `statusOffset` 的数组顺序是「`bottom` 在前、`right` 在后」，调整时注意方向，不要按 `[水平, 垂直]` 理解。
4. 尺寸由 CSS 变量控制，若需要覆盖尺寸，用 `className` 传入 `h-*` / `w-*` 即可（`className` 合并在末位，优先级最高）。
