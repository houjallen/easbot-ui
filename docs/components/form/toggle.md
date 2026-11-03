# Toggle 切换按钮

> 可在按下 / 未按下两种状态间切换的按钮，基于 Radix Toggle 实现，提供 2 种样式与 3 种尺寸。

**导入**

```tsx
import { Toggle } from '@easbot/ui';
```

## 基础用法

```tsx
import { Toggle } from '@easbot/ui';

export default function App() {
  return <Toggle aria-label="加粗">B</Toggle>;
}
```

受控用法：

```tsx
import { useState } from 'react';
import { Toggle } from '@easbot/ui';

export default function App() {
  const [pressed, setPressed] = useState(false);

  return (
    <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="加粗">
      B
    </Toggle>
  );
}
```

## 变体

### variant（样式变体）

| 取值      | 说明                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| `default` | 默认样式，透明背景，hover 时显示 `--toggle-hover-background` 背景                                                    |
| `outline` | 边框样式，`border border-[var(--toggle-outline-border)]`，背景透明，hover 时显示 `--toggle-outline-hover-background` |

### size（尺寸变体）

| 取值      | 说明               |
| --------- | ------------------ |
| `default` | 默认，`h-10 px-3`  |
| `sm`      | 小号，`h-9 px-2.5` |
| `lg`      | 大号，`h-11 px-5`  |

## 属性

| 属性              | 类型                         | 默认值      | 说明                       |
| ----------------- | ---------------------------- | ----------- | -------------------------- |
| `variant`         | `'default' \| 'outline'`     | `'default'` | 样式变体，由 `cva` 定义    |
| `size`            | `'default' \| 'sm' \| 'lg'`  | `'default'` | 尺寸变体，由 `cva` 定义    |
| `className`       | `string`                     | —           | 自定义类名                 |
| `pressed`         | `boolean`                    | —           | 按下状态（受控模式）       |
| `defaultPressed`  | `boolean`                    | —           | 默认按下状态（非受控模式） |
| `onPressedChange` | `(pressed: boolean) => void` | —           | 按下状态变化回调           |
| `disabled`        | `boolean`                    | —           | 禁用状态                   |

本表只列组件自有属性；此外还透传 Radix `Toggle.Root` 的全部原生属性，如 `id` / `type` / `aria-label` / `data-*` / `on*` 事件。

## 无障碍

- 基于 Radix `Toggle.Root`，渲染为原生 `<button>`，按下的状态通过 `aria-pressed` 暴露。
- 支持 `Space` 与 `Enter` 键切换按压状态。
- 按下状态通过 `data-state="on"` / `data-state="off"` 属性暴露，按下时的背景与文字色由 `data-[state=on]:` 变体控制。
- 焦点样式使用 `focus-visible:ring-2 focus-visible:ring-[var(--toggle-ring)]` + `focus-visible:ring-offset-2`。
- 禁用态使用 `disabled:pointer-events-none` + `disabled:opacity-[var(--toggle-disabled-opacity)]`，同时阻止指针事件。
- **建议提供可访问名称**：当按钮内只有图标时，必须通过 `aria-label` 补充说明。

## 主题变量

| 变量                                | 说明                          |
| ----------------------------------- | ----------------------------- |
| `--toggle-background`               | 默认背景色                    |
| `--toggle-hover-background`         | hover 背景色                  |
| `--toggle-hover-foreground`         | hover 文字色                  |
| `--toggle-active-background`        | 按下（`data-state=on`）背景色 |
| `--toggle-active-foreground`        | 按下（`data-state=on`）文字色 |
| `--toggle-outline-border`           | `outline` 变体边框色          |
| `--toggle-outline-hover-background` | `outline` 变体 hover 背景色   |
| `--toggle-outline-hover-foreground` | `outline` 变体 hover 文字色   |
| `--toggle-ring`                     | 键盘焦点环颜色                |
| `--toggle-ring-offset`              | 焦点环偏移底色                |
| `--toggle-disabled-opacity`         | 禁用态透明度                  |

## 组合用法 / 注意事项

- **单选语义请用 `ToggleGroup`**：本组件是独立的二元开关（`aria-pressed`），若多个按钮互斥，请搭配 `ToggleGroup` 使用。
- **受控 / 非受控二选一**：同时传入 `pressed` 与 `defaultPressed` 会导致 React 警告，请只使用其中一种。
- **`className` 合并位置特殊**：`className` 在 `cva` 调用时传入（`toggleVariants({ variant, size, className })`），由 `cn` 统一处理冲突，依然是末位优先级。
- **`outline` 变体自带透明背景**：基础类中的 `bg-[var(--toggle-background)]` 会被 `bg-transparent` 覆盖。
- **默认文字样式固定**：`text-sm font-medium` 写在基础类中，不随 `size` 变化，`size` 只控制高度与内边距。

## 导出

| 导出名           | 类型                              | 说明                                               |
| ---------------- | --------------------------------- | -------------------------------------------------- |
| `Toggle`         | `React.ForwardRefExoticComponent` | 切换按钮组件，ref 指向 Radix `Toggle.Root`         |
| `toggleVariants` | `ReturnType<typeof cva>`          | 切换按钮 `cva` 变体定义                            |
| `ToggleProps`    | `type`                            | 切换按钮属性类型（Radix 属性 + 变体 + 自定义类名） |
