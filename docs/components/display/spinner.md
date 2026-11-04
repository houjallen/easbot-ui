# Spinner 加载指示器

> 旋转的加载指示图标，支持 3 种尺寸与 6 种配色变体。

---

**导入**

```tsx
import { Spinner, spinnerVariants } from '@easbot/ui';
```

## 基础用法

```tsx
import { Spinner } from '@easbot/ui';

export default function App() {
  return <Spinner />;
}
```

尺寸与配色：

```tsx
<Spinner size="sm" />
<Spinner size="lg" variant="success" />
<Spinner variant="destructive" />
```

配合按钮使用：

```tsx
import { Button } from '@easbot/ui';

<Button loading>提交中</Button>;
```

## 变体

### size

| 取值         | 说明                        |
| ------------ | --------------------------- |
| `sm`         | 小，`--eas-size-xs`         |
| `md`（默认） | 中，`--eas-size-sm`（默认） |
| `lg`         | 大，`--eas-size-md`         |

### variant

| 取值              | 说明                         |
| ----------------- | ---------------------------- |
| `default`（默认） | 默认前景色（`--foreground`） |
| `primary`         | 主色（`--primary`）          |
| `destructive`     | 危险色（`--destructive`）    |
| `success`         | 成功色（`--success`）        |
| `warning`         | 警告色（`--warning`）        |
| `info`            | 信息色（`--info`）           |

`SpinnerProps` 是 `Spinner` 的属性接口，继承 `React.HTMLAttributes<SVGSVGElement>` 与 `VariantProps<typeof spinnerVariants>` —— **无自有成员**。

本表只列组件自有属性；此外还透传 `<svg>` 的全部原生属性（`id` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- 组件统一注入 `role="status"`、`aria-live="polite"` 与 `aria-busy="true"`，读屏会在该区域变化时礼貌播报。
- 组件**没有内置可见文案**：如需读屏播报「加载中」，请传 `aria-label`（如 `aria-label="加载中"`）或在其外层包裹带文本的容器。
- 图形本身是内联 SVG（`<circle>` + `<path>`），颜色继承 `currentColor`，因此变体配色同时会影响图形描边与填充。

## 注意事项

- **`spinnerVariants` 的基础类是 `animate-spin`**：旋转动画由组件内置，无需额外配置；若传入 `className="animate-ping"` 会覆盖该动画。
- **尺寸使用 `h` / `w` + CSS 变量**：三个尺寸分别绑定 `--eas-size-xs` / `--eas-size-sm` / `--eas-size-md`，实际像素由主题变量决定。
- **变体只改文字色**：通过 `text-[var(--xxx)]` 设置 `currentColor`，不影响 SVG 内部 `opacity-25` / `opacity-75` 的层次。
- **尺寸方向独立于配色**：`size` 与 `variant` 可自由组合。
- **组件是纯 SVG，无 Portal、无 Provider 依赖**：可直接放在按钮、表格行等任意位置。
- **`className` 合并到末位**，自定义类名优先级最高。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--destructive`
- `--eas-size-md`
- `--eas-size-sm`
- `--eas-size-xs`
- `--foreground`
- `--info`
- `--primary`
- `--success`
- `--warning`

## 导出

### 组件

| 导出名         | 说明 |
| -------------- | ---- |
| `Spinner`      |      |
| `SpinnerProps` |      |

### 类型与工具函数

| 导出名            | 说明 |
| ----------------- | ---- |
| `spinnerVariants` |      |
