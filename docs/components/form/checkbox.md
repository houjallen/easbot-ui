# Checkbox 复选框

> 基于 Radix Checkbox 的多选框，支持中间态、标签描述、错误提示与触摸波纹反馈。

**导入**

```tsx
import { Checkbox } from '@easbot/ui';
```

## 基础用法

```tsx
import { Checkbox } from '@easbot/ui';

export default function App() {
  return <Checkbox>选项文本</Checkbox>;
}
```

带描述与错误提示：

```tsx
import { Checkbox } from '@easbot/ui';

export default function App() {
  return (
    <Checkbox id="terms" description="这是一段描述文本" error="请先同意服务条款">
      同意服务条款
    </Checkbox>
  );
}
```

## 变体

### variant（样式变体）

| 取值          | 说明                                 |
| ------------- | ------------------------------------ |
| `default`     | 默认样式，灰阶边框，hover 时边框加深 |
| `success`     | 成功态，绿色边框，checked 时绿色填充 |
| `warning`     | 警告态，橙色边框，checked 时橙色填充 |
| `destructive` | 危险态，红色边框，checked 时红色填充 |

### size（尺寸变体）

| 取值      | 说明                                |
| --------- | ----------------------------------- |
| `sm`      | 小号，`h-3 w-3`，对勾图标 `h-2 w-2` |
| `default` | 默认，`h-4 w-4`，对勾图标 `h-3 w-3` |
| `lg`      | 大号，`h-5 w-5`，对勾图标 `h-4 w-4` |

## 属性

| 属性             | 类型                                                       | 默认值      | 说明                                           |
| ---------------- | ---------------------------------------------------------- | ----------- | ---------------------------------------------- |
| `variant`        | `'default' \| 'success' \| 'warning' \| 'destructive'`     | `'default'` | 样式变体，由 `cva` 定义                        |
| `size`           | `'sm' \| 'default' \| 'lg'`                                | `'default'` | 尺寸变体，由 `cva` 定义                        |
| `indeterminate`  | `boolean`                                                  | —           | 中间态控制，渲染 `Minus` 图标而非对勾          |
| `label`          | `string`                                                   | —           | 标签文本（与 `children` 二选一，`label` 优先） |
| `description`    | `string`                                                   | —           | 描述文本                                       |
| `error`          | `string`                                                   | —           | 错误信息                                       |
| `rippleColor`    | `string`                                                   | —           | 波纹颜色，缺省时使用 `currentColor`            |
| `disabled`       | `boolean`                                                  | —           | 禁用状态                                       |
| `onSwipe`        | `(direction: 'left' \| 'right' \| 'up' \| 'down') => void` | —           | 滑动回调（触摸位移阈值 30px）                  |
| `rippleDuration` | `number`                                                   | `600`       | 波纹动画时长（ms）                             |
| `enableRipple`   | `boolean`                                                  | `false`     | 是否启用水波纹效果                             |

本表只列组件自有属性；此外还透传 Radix `Checkbox.Root` 的全部原生属性，如 `id` / `name` / `value` / `checked` / `defaultChecked` / `onCheckedChange` / `required` / `aria-*` / `data-*`。

## 无障碍

- 基于 Radix `Checkbox.Root`，渲染为原生 `<button role="checkbox">`，支持 `Space` 键切换选中状态。
- 选中状态通过 `aria-checked`（`checked` / `unchecked` / `indeterminate`）暴露给屏幕阅读器。
- 传入 `error` 时自动设置 `aria-invalid={!!error}`。
- 传入 `error` 时自动设置 `aria-describedby={`${props.id}-error`}`（需同时提供 `id`）。
- 禁用态使用原生 `disabled` 属性，元素不可聚焦。
- 焦点样式使用 `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`。
- 标签区域使用原生 `<label htmlFor={props.id}>`，需要提供 `id` 才能与复选框建立点击关联。

## 主题变量

> 本组件源码中**没有直接书写 `var(--xxx)`**，全部通过 Tailwind 语义类引用主题 token。以下为语义类对应的 CSS 变量。

| 变量                   | 说明                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `--ring`               | 键盘焦点环颜色（`focus-visible:ring-ring`）                           |
| `--background`         | 焦点环偏移底色（`focus-visible:ring-offset-background`）              |
| `--primary`            | 选中态边框与背景色（`border-primary` / `bg-primary`）                 |
| `--primary-foreground` | 选中态对勾图标颜色（`text-primary-foreground`）                       |
| `--success`            | `success` 变体边框与选中背景色                                        |
| `--warning`            | `warning` 变体边框与选中背景色                                        |
| `--destructive`        | `destructive` 变体边框与选中背景色，以及错误文字色                    |
| `--accent`             | hover / active 背景色（`hover:bg-accent/20`、`active:bg-accent/30`）  |
| `--muted-foreground`   | 描述文本颜色（`text-muted-foreground`）                               |
| `--gray-300`           | 暗色主题下禁用态边框色（`dark:disabled:border-gray-600` 的 600 同理） |
| `--gray-400`           | 默认变体边框色（`border-gray-400`）                                   |
| `--gray-500`           | 暗色主题下默认变体边框色（`dark:border-gray-500`）                    |
| `--gray-600`           | 默认变体 hover 边框色（`hover:border-gray-600`）                      |

## 组合用法 / 注意事项

- **`label` 与 `children` 互斥**：`label` 存在时优先渲染 `label`，否则渲染 `children`；两者都为空且无 `description` / `error` 时，整块文本区域不渲染。
- **`indeterminate` 是受控的内部状态**：组件用 `useEffect` 把 `indeterminate` 属性同步到内部状态；用户切换选中状态时内部状态会被重置为 `false`。`checked` 属性仍由 Radix 管理，与 `indeterminate` 相互独立。
- **`id` 必填才能建立关联**：标签的 `htmlFor` 与错误信息的 `aria-describedby` 都基于 `props.id` 拼接，缺少 `id` 时标签点击与错误播报都不会生效。
- **波纹只在 `enableRipple` 为 `true` 时可见**：波纹元素始终会被创建，但当 `enableRipple` 为 `false` 时附加 `hidden` 类；`rippleDuration` 同时决定动画时长与清理延时。
- **`onSwipe` 只在触摸设备生效**：基于 `onTouchStart` / `onTouchEnd` 的位移差计算方向，阈值固定 30px。

## 导出

| 导出名          | 类型                              | 说明                                       |
| --------------- | --------------------------------- | ------------------------------------------ |
| `Checkbox`      | `React.ForwardRefExoticComponent` | 复选框组件，ref 指向 Radix `Checkbox.Root` |
| `CheckboxProps` | `interface`                       | 复选框属性接口                             |
