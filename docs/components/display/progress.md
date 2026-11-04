# Progress 进度条

> 展示任务完成度，支持确定进度与不确定（加载中）两种状态。

---

**导入**

```tsx
import { Progress } from '@easbot/ui';
```

## 基础用法

```tsx
import { Progress } from '@easbot/ui';

export default function App() {
  return <Progress value={60} />;
}
```

不确定状态（不传 `value`）：

```tsx
<Progress value={undefined} />
```

自定义配色与尺寸（通过 `className` 覆盖）：

```tsx
<Progress value={60} className="[&_[data-slot=progress-indicator]]:bg-green-500" />
<Progress value={30} className="h-3" />
```

`ProgressProps` 是 `Progress` 的属性类型（`React.ComponentProps<typeof Progress>`），**无自有成员**，全部继承 Radix `ProgressPrimitive.Root` 的原生属性（`value` / `max` / `getValueLabel` / `aria-label` / `aria-valuetext` / `className` / `data-*` 等）。

## 无障碍

- 底层 Radix `ProgressPrimitive.Root` 渲染为 `<div role="progressbar">`，并注入 `aria-valuemin`（`0`）/ `aria-valuemax`（等于 `max`）/ `aria-valuenow`（等于 `value`，不确定状态下不渲染）。
- 注入 `data-state`（`indeterminate` / `loading` / `complete`），供样式与测试定位使用。
- 可通过 `getValueLabel` 自定义读屏播报的百分比文案，也可直接传 `aria-label` 说明进度条代表什么。
- 进度条不可聚焦，本身无键盘交互；`value` 变化由调用方驱动。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Progress` 直接等于设计系统层 `src/design-system/components/ui/progress.tsx` 的实现，props 与 Radix `Progress` 完全一致。
- **进度通过 `transform` 表达**：指示条的位移是 `translateX(-${100 - value}%)`，因此 `value` 应传入 `0 ~ max` 范围内的数值；超出范围会产生越界位移。
- **`value` 为 `undefined` 时不确定**：此时指示条保持 `w-full` 全宽，状态标记为 `indeterminate`。
- **默认 `max` 为 `100`**：`aria-valuemax` 与位移计算都基于 `max`；传入 `max={200}` 时 `value={60}` 表示 30%。
- **轨道高度固定 `h-2`**：需要更粗的进度条请用 `className="h-3"` 覆盖。
- **指示条类名是硬编码的**：组件**不支持** `indicatorClassName`，改色需通过 `className` 配合 `[&_[data-slot=progress-indicator]]:` 选择器（如上例）。
- **配色走主色**：轨道为 `bg-primary/20`，指示条为 `bg-primary`；主题变量 `--progress-indicator-success` / `--progress-indicator-warning` 不由本组件直接引用。
- **宽度撑满父容器**（`w-full`），自身不带固定宽度。
- **组件不支持禁用态**：如需表达「禁用」，请自行叠加 `opacity-50 cursor-not-allowed`。

## 导出

### 组件

| 导出名          | 说明 |
| --------------- | ---- |
| `Progress`      |      |
| `ProgressProps` |      |
