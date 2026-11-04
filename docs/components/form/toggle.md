# Toggle 切换按钮

> 双态切换按钮，两种样式变体、三种尺寸。

---

**导入**

```tsx
import { Toggle } from '@easbot/ui';
```

## 基础用法

```tsx
import { Toggle } from '@easbot/ui';

export default function App() {
  return <Toggle>默认样式</Toggle>;
}
```

带图标与尺寸：

```tsx
import { Bold } from 'lucide-react';
import { Toggle } from '@easbot/ui';

<Toggle size="sm">
  <Bold className="mr-2 h-4 w-4" />
  加粗
</Toggle>;
```

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                       |
| ----------------- | ------------------------------------------ |
| `default`（默认） | 透明背景，hover 时显示 muted 背景          |
| `outline`         | 带边框的轮廓样式，hover 时显示 accent 背景 |

### size

| 取值              | 说明                               |
| ----------------- | ---------------------------------- |
| `default`（默认） | 默认，`h-9 min-w-9 px-2`（36px）   |
| `sm`              | 小，`h-8 min-w-8 px-1.5`（32px）   |
| `lg`              | 大，`h-10 min-w-10 px-2.5`（40px） |

`ToggleProps` 为 `React.ComponentProps<typeof Toggle>` 的类型别名，props 与 Radix `TogglePrimitive.Root` 一致（`pressed` / `defaultPressed` / `onPressedChange` / `disabled` / `className` / `aria-*` / `data-*` 等），组件未新增自有属性。

## 无障碍

- 底层 Radix Toggle 渲染为 `<button type="button">`，并注入 `aria-pressed`（当前按下状态）与 `data-state`（`on` / `off`）。
- 键盘操作：`Space` 与 `Enter` 均可切换按下状态。
- 禁用态使用原生 `disabled`，元素不可聚焦，屏幕阅读器播报「不可用」。
- 焦点样式使用 `focus-visible:border-ring` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。
- 组件内的 `<svg>` 图标被统一设置为 `pointer-events-none` 并固定为 `size-4`；图标本身是纯装饰，语义由 `aria-pressed` 承担。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Toggle` 直接等于设计系统层的 `Toggle`，`variant` / `size` 来自 `src/design-system/components/ui/toggle.tsx` 的 `toggleVariants`。
- **无自有 Props 接口**：`ToggleProps` 是 `React.ComponentProps<typeof Toggle>` 的类型别名，不额外扩展属性。
- **按下态使用 `data-[state=on]`**：`pressed` 为真时附加 `bg-accent text-accent-foreground`。
- **尺寸类由 `cva` 直接生成**，与 `Button` 的尺寸令牌系统（`src/ui/button/size-tokens.ts`）**不是同一套**。

## 导出

### 组件

| 导出名        | 说明 |
| ------------- | ---- |
| `Toggle`      |      |
| `ToggleProps` |      |
