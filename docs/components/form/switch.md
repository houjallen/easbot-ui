# Switch 开关

> 在开 / 关两种状态间切换的控件，基于 Radix Switch 实现，提供 3 种尺寸。

**导入**

```tsx
import { Switch } from '@easbot/ui';
```

## 基础用法

```tsx
import { Switch } from '@easbot/ui';

export default function App() {
  return <Switch aria-label="启用通知" />;
}
```

受控用法：

```tsx
import { useState } from 'react';
import { Switch } from '@easbot/ui';

export default function App() {
  const [enabled, setEnabled] = useState(false);

  return <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="启用通知" />;
}
```

## 变体

### size（尺寸变体）

| 取值 | 说明                                                                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sm` | 小号，轨道 `h-[var(--switch-sm-height)] w-[var(--switch-sm-width)]`，滑块 `h-[var(--switch-sm-thumb-size)] w-[var(--switch-sm-thumb-size)]`         |
| `md` | 中号（默认），轨道 `h-[var(--switch-md-height)] w-[var(--switch-md-width)]`，滑块 `h-[var(--switch-md-thumb-size)] w-[var(--switch-md-thumb-size)]` |
| `lg` | 大号，轨道 `h-[var(--switch-lg-height)] w-[var(--switch-lg-width)]`，滑块 `h-[var(--switch-lg-thumb-size)] w-[var(--switch-lg-thumb-size)]`         |

> 滑块的选中位移按 `translate-x-[calc(var(--switch-<size>-width)_-_var(--switch-<size>-height))]` 计算，即「轨道宽度 - 轨道高度」。

## 属性

| 属性              | 类型                         | 默认值 | 说明                           |
| ----------------- | ---------------------------- | ------ | ------------------------------ |
| `size`            | `'sm' \| 'md' \| 'lg'`       | `'md'` | 尺寸变体，同时作用于轨道与滑块 |
| `checked`         | `boolean`                    | —      | 选中状态（受控模式）           |
| `defaultChecked`  | `boolean`                    | —      | 默认选中状态（非受控模式）     |
| `onCheckedChange` | `(checked: boolean) => void` | —      | 选中状态变化回调               |
| `disabled`        | `boolean`                    | —      | 禁用状态                       |
| `required`        | `boolean`                    | —      | 是否必选（原生表单校验）       |
| `name`            | `string`                     | —      | 表单字段名                     |
| `value`           | `string`                     | —      | 表单提交值                     |
| `className`       | `string`                     | —      | 自定义类名                     |

本表只列组件自有属性；此外还透传 Radix `Switch.Root` 的全部原生属性，如 `id` / `aria-label` / `aria-describedby` / `data-*` / `on*` 事件。

## 无障碍

- 基于 Radix `Switch.Root`，渲染为原生 `<button role="switch">`，选中状态通过 `aria-checked` 暴露。
- 支持 `Space` 与 `Enter` 键切换状态。
- 选中 / 未选中状态通过 `data-state="checked"` / `data-state="unchecked"` 属性暴露，便于外部定制样式。
- 焦点样式使用 `focus-visible:ring-2 focus-visible:ring-[var(--form-input-focus-border)]` + `focus-visible:ring-offset-2`。
- 禁用态使用原生 `disabled` 属性并降低透明度。
- **必须提供可访问名称**：组件不内置文案，请通过 `aria-label` 或 `aria-labelledby` 关联可见文本。

## 主题变量

| 变量                                | 说明                        |
| ----------------------------------- | --------------------------- |
| `--switch-sm-height`                | `sm` 轨道高度               |
| `--switch-sm-width`                 | `sm` 轨道宽度               |
| `--switch-sm-thumb-size`            | `sm` 滑块尺寸               |
| `--switch-md-height`                | `md` 轨道高度               |
| `--switch-md-width`                 | `md` 轨道宽度               |
| `--switch-md-thumb-size`            | `md` 滑块尺寸               |
| `--switch-lg-height`                | `lg` 轨道高度               |
| `--switch-lg-width`                 | `lg` 轨道宽度               |
| `--switch-lg-thumb-size`            | `lg` 滑块尺寸               |
| `--switch-thumb-background`         | 滑块背景色                  |
| `--switch-thumb-shadow`             | 滑块阴影                    |
| `--switch-hover-background`         | 未选中态 hover 背景色       |
| `--switch-hover-border`             | 未选中态 hover 边框色       |
| `--switch-active-background`        | 未选中态 active 背景色      |
| `--switch-checked-background`       | 选中态背景色与边框色        |
| `--switch-checked-hover-background` | 选中态 hover 背景色与边框色 |
| `--muted`                           | 未选中态轨道背景色          |
| `--border`                          | 未选中态轨道边框色          |
| `--background`                      | 焦点环偏移底色              |

## 组合用法 / 注意事项

- **组件本身不含标签**：`Switch` 只渲染开关本体，需要自行搭配 `<Label>` 或 `aria-label` 提供语义上下文。
- **受控 / 非受控二选一**：同时传入 `checked` 与 `defaultChecked` 会导致 React 警告，请只使用其中一种。
- **滑块位移依赖 CSS 变量计算**：如果自定义了 `--switch-*-width` / `--switch-*-height`，需保持「宽度 > 高度」，否则选中态滑块会溢出轨道。
- **`className` 作用于轨道根节点**：滑块样式由内部的 `thumbVariants` 控制，无法通过 `className` 直接覆盖。
- **尺寸变体只有一个维度**：`size` 同时决定轨道与滑块尺寸，没有单独配置滑块的入口。

## 导出

| 导出名                 | 类型                              | 说明                                                    |
| ---------------------- | --------------------------------- | ------------------------------------------------------- |
| `Switch`               | `React.ForwardRefExoticComponent` | 开关组件，ref 指向 Radix `Switch.Root`                  |
| `SwitchComponentProps` | `interface`                       | 开关组件属性接口（Radix 属性 + `size` 变体）            |
| `SwitchProps`          | `type`                            | 直接复用 `@radix-ui/react-switch` 的 `SwitchProps` 类型 |
