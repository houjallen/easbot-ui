# Button 按钮

> 触发一个操作或事件的通用按钮，内置加载态、禁用态、左右图标与移动端手势支持。

**导入**

```tsx
import { Button } from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';

export default function App() {
  return <Button onClick={() => console.log('clicked')}>点击我</Button>;
}
```

带图标与加载态：

```tsx
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@easbot/ui';

export default function App() {
  return (
    <>
      <Button leftIcon={<Mail />}>发送邮件</Button>
      <Button loading>提交中</Button>
    </>
  );
}
```

## 变体

### variant（样式变体）

| 取值          | 说明                                   |
| ------------- | -------------------------------------- |
| `default`     | 默认样式，现代简约风格（主色实心按钮） |
| `secondary`   | 次要样式，浅色背景                     |
| `destructive` | 危险操作，红色实心按钮                 |
| `outline`     | 边框样式，透明背景 + 边框              |
| `ghost`       | 幽灵按钮，无背景，hover 时显示背景     |
| `link`        | 链接样式，主色文字 + hover 下划线      |
| `success`     | 成功样式，绿色实心按钮                 |
| `warning`     | 警告样式，橙色实心按钮                 |

### size（尺寸变体）

| 取值      | 说明                                         |
| --------- | -------------------------------------------- |
| `default` | 默认尺寸，`h-10 px-4 py-2 text-sm`           |
| `sm`      | 小型按钮，`h-9 px-3 rounded-md text-xs`      |
| `lg`      | 大型按钮，`h-11 px-8 rounded-md text-base`   |
| `icon`    | 图标按钮，正方形 `h-10 w-10 rounded-lg`      |
| `mobile`  | 移动端优化尺寸，`h-12 px-5 py-2.5 text-base` |

## 属性

| 属性                | 类型                                                                                                    | 默认值      | 说明                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| `variant`           | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost' \| 'link' \| 'success' \| 'warning'` | `'default'` | 按钮样式变体，由 `cva` 定义                                     |
| `size`              | `'default' \| 'sm' \| 'lg' \| 'icon' \| 'mobile'`                                                       | `'default'` | 按钮尺寸变体，由 `cva` 定义                                     |
| `asChild`           | `boolean`                                                                                               | `false`     | 是否作为子元素渲染（使用 Radix `Slot`，不渲染 `<button>` 标签） |
| `loading`           | `boolean`                                                                                               | `false`     | 是否显示加载状态；同时会把按钮置为禁用                          |
| `leftIcon`          | `React.ReactNode`                                                                                       | —           | 左侧图标，加载状态下不渲染                                      |
| `rightIcon`         | `React.ReactNode`                                                                                       | —           | 右侧图标，加载状态下不渲染                                      |
| `rippleColor`       | `string`                                                                                                | —           | 波纹效果颜色，缺省时使用 `currentColor`                         |
| `hapticFeedback`    | `boolean`                                                                                               | `false`     | 是否启用触觉反馈（调用 `navigator.vibrate`）                    |
| `pressureSensitive` | `boolean`                                                                                               | `false`     | 是否启用压力感应（按压时按 `touch.force` 缩放）                 |
| `longPressDelay`    | `number`                                                                                                | `500`       | 长按触发时间（毫秒）                                            |
| `onLongPress`       | `() => void`                                                                                            | —           | 长按回调（触屏设备）                                            |
| `onSwipe`           | `(direction: 'left' \| 'right' \| 'up' \| 'down') => void`                                              | —           | 滑动回调（触屏设备，位移阈值 5px）                              |
| `enableRipple`      | `boolean`                                                                                               | `false`     | 是否启用水波纹效果                                              |
| `disabled`          | `boolean`                                                                                               | —           | 禁用状态；与 `loading` 取或，`true` 时按钮不可点击              |
| `swipeThreshold`    | `number`                                                                                                | —           | 自定义滑动检测阈值（像素）                                      |
| `pressureConfig`    | `{ min?: number; max?: number; sensitivity?: number }`                                                  | —           | 压力感应配置                                                    |

本表只列组件自有属性；此外还透传 `<button>` 的全部原生属性，如 `id` / `type` / `disabled` / `aria-*` / `data-*` / `on*` 事件。

## 无障碍

- 组件统一注入 `role="button"`、`aria-disabled`（等于 `disabled || loading`）与 `aria-busy`（等于 `loading`）。
- 加载状态下若未显式传入 `aria-label`，会自动补 `aria-label="加载中"`；自定义的 `aria-label` 优先级更高。
- 键盘操作：`Enter` 与 `Space` 键会阻止默认行为并触发一次 `click`，与原生 `<button>` 行为一致。
- 焦点样式使用 `focus-visible:ring-2` + `ring-offset-2`，仅键盘可见焦点才显示。
- 加载图标与左右图标容器均标记 `aria-hidden="true"`，避免屏幕阅读器重复朗读装饰性图形。

## 主题变量

| 变量                                     | 说明                                              |
| ---------------------------------------- | ------------------------------------------------- |
| `--radius`                               | 按钮圆角                                          |
| `--ring`                                 | 键盘焦点环颜色                                    |
| `--ring-offset`                          | 焦点环偏移底色                                    |
| `--button-default`                       | `default` 变体背景色                              |
| `--button-default-foreground`            | `default` 变体文字色                              |
| `--button-default-hover`                 | `default` 变体 hover 背景色                       |
| `--button-default-active`                | `default` 变体 active 背景色                      |
| `--button-default-disabled`              | `default` 变体禁用背景色                          |
| `--button-default-disabled-foreground`   | `default` 变体禁用文字色                          |
| `--button-secondary`                     | `secondary` 变体背景色                            |
| `--button-secondary-foreground`          | `secondary` 变体文字色                            |
| `--button-secondary-hover`               | `secondary` 变体 hover 背景色                     |
| `--button-secondary-active`              | `secondary` 变体 active 背景色                    |
| `--button-secondary-disabled`            | `secondary` 变体禁用背景色                        |
| `--button-secondary-disabled-foreground` | `secondary` 变体禁用文字色                        |
| `--destructive`                          | `destructive` 变体背景色                          |
| `--destructive-foreground`               | `destructive` 变体文字色                          |
| `--button-destructive-hover`             | `destructive` 变体 hover 背景色                   |
| `--button-destructive-active`            | `destructive` 变体 active 背景色                  |
| `--border`                               | `outline` 变体边框色                              |
| `--background`                           | `outline` 变体背景色                              |
| `--accent`                               | `outline` / `ghost` 变体 hover 背景色             |
| `--accent-foreground`                    | `outline` / `ghost` 变体 hover 文字色             |
| `--button-accent-hover`                  | `outline` / `ghost` 变体暗色主题下的 hover 背景色 |
| `--primary`                              | `link` 变体文字色                                 |
| `--success`                              | `success` 变体背景色                              |
| `--success-foreground`                   | `success` 变体文字色                              |
| `--button-success-hover`                 | `success` 变体 hover 背景色                       |
| `--button-success-active`                | `success` 变体 active 背景色                      |
| `--warning`                              | `warning` 变体背景色                              |
| `--warning-foreground`                   | `warning` 变体文字色                              |
| `--button-warning-hover`                 | `warning` 变体 hover 背景色                       |
| `--button-warning-active`                | `warning` 变体 active 背景色                      |

## 组合用法 / 注意事项

- **`loading` 会强制禁用**：`disabled={disabled || loading}`，点击事件在 `isDisabled` 时不会触发，无法通过 `disabled={false}` 覆盖。
- **`size="default"` 在移动端会被自动替换为 `"mobile"`**：组件检测到触屏设备（`ontouchstart` / `navigator.maxTouchPoints`）时，`finalSize` 会从 `default` 切换为 `mobile`；显式传入其它尺寸不受影响。
- **`asChild` 会替换根元素**：此时不会渲染 `<button>` 标签，`role="button"` 等无障碍属性仍会注入到子元素上，子元素需要自行处理 `disabled`。
- **`className` 合并到末位**：`cn(buttonVariants({ ... }), 'relative overflow-hidden')` 后再拼接 `className`，自定义类名优先级最高。
- **运行时 CSS 变量**：鼠标移动时组件会在元素上写入 `--mask-x` / `--mask-y` 两个百分比变量，用于自定义径向高亮遮罩；本组件源码自身未消费这两个变量。

## 导出

| 导出名                    | 类型                                  | 说明                                   |
| ------------------------- | ------------------------------------- | -------------------------------------- |
| `Button`                  | `React.ForwardRefExoticComponent`     | 按钮组件，ref 指向 `HTMLButtonElement` |
| `buttonVariants`          | `ReturnType<typeof cva>`              | 按钮 `cva` 变体定义，可用于二次封装    |
| `ButtonProps`             | `interface`                           | 按钮属性接口                           |
| `SwipeDirection`          | `'left' \| 'right' \| 'up' \| 'down'` | 滑动方向类型                           |
| `PressureSensitiveConfig` | `interface`                           | 压力感应配置类型                       |
