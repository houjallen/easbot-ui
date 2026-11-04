# Switch 开关

> 布尔状态切换控件，一键在开 / 关之间切换。

---

**导入**

```tsx
import { Label, Switch } from '@easbot/ui';
```

## 基础用法

```tsx
import { Label, Switch } from '@easbot/ui';

export default function App() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">飞行模式</Label>
    </div>
  );
}
```

受控用法：

```tsx
import { useState } from 'react';

const [checked, setChecked] = useState(false);

<Switch checked={checked} onCheckedChange={setChecked} id="notifications" />;
```

## 变体

### variant

| 取值              | 说明                                                   |
| ----------------- | ------------------------------------------------------ |
| `default`（默认） | 默认样式，开启时轨道为主色，滑块为反色                 |
| `destructive`     | 危险色，开启 / 关闭时轨道与滑块均改用 destructive 配色 |

`SwitchProps` 为 `EunSwitchProps` 的别名。`EunSwitchProps` 全部继承自 Radix `SwitchPrimitive.Root` 与 `eunSwitchVariants`，无自有成员。

本表只列组件自有属性；此外还透传 Radix Switch 的全部原生属性（`id` / `name` / `value` / `checked` / `defaultChecked` / `required` / `form` / `onCheckedChange` / `aria-*` / `data-*` 等）。

## 无障碍

- 底层 Radix Switch 渲染为 `<button type="button" role="switch">`，并注入 `aria-checked`、`aria-required`、`data-state`（`checked` / `unchecked`）。
- 键盘操作：`Space` 与 `Enter` 均可切换状态（原生 `<button>` 行为）。
- 禁用态使用原生 `disabled`，元素不可聚焦，屏幕阅读器播报「不可用」。
- 焦点样式使用 `focus-visible:border-ring` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。
- 滑块（`SwitchPrimitive.Thumb`）是纯装饰元素（`pointer-events-none`），状态由 `role="switch"` 的 `aria-checked` 表达。

## 注意事项

- **滑块与轨道必须形成反差**：源码注释强调 —— unchecked 状态的轨道使用不透明的 `--input-border-color`（若边框也透明，控件在白底上会完全失去边界）；checked 状态轨道本身是不透明主色，边框保持透明。
- **unchecked 的滑块不能用 `bg-background`**：源码注释指出 dark 主题下 `--background` 是近黑色，落在深色轨道上会完全看不出滑块 —— 因此 unchecked 滑块固定使用不透明中灰 `--switch-thumb-unchecked-background`。
- **配色全部走语义 token**（`--switch-*`），light / dark 同一套定义，组件侧不需要 `dark:` 变体。
- **`destructive` 变体不改焦点环颜色**：源码注释说明焦点环仍沿用默认 `ring` 主题色，暂未覆盖。
- **组件本身不渲染标签**：需要文字说明时请配合 `Label` 并通过 `id` / `htmlFor` 关联。
- **表单联动**：`Checkbox` / `Switch` / `RadioGroup` 在 `<form>` 内会渲染一个隐藏的原生 `<input>`（`type="checkbox"` / `type="radio"`，`aria-hidden="true"`），保证原生表单提交与 `form.reset()` 可用。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--input-border-color`
- `--switch-checked-background`
- `--switch-thumb-checked-background`
- `--switch-thumb-unchecked-background`
- `--switch-unchecked-background`

## 导出

### 组件

| 导出名           | 说明 |
| ---------------- | ---- |
| `EunSwitchProps` |      |
| `Switch`         |      |
| `SwitchProps`    |      |
| `SwitchRef`      |      |
