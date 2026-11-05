# Button 按钮

> 触发一个操作或事件的通用按钮，支持 9 种样式变体、8 种尺寸、加载态与左右图标。

---

**导入**

```tsx
import { Button, CloseButton, buttonVariants } from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';

export default function App() {
  return (
    <>
      <Button onClick={() => console.log('clicked')}>点击我</Button>
      <Button variant="destructive">删除</Button>
      <Button loading>提交中</Button>
    </>
  );
}
```

带图标：

```tsx
import { Mail } from 'lucide-react';
import { Button } from '@easbot/ui';

<Button leftIcon={<Mail />}>发送邮件</Button>;
```

渲染为子元素（不生成 `<button>`）：

```tsx
<Button asChild variant="link">
  <a href="/login">登录</a>
</Button>
```

## 变体

### variant

| 取值              | 说明                              |
| ----------------- | --------------------------------- |
| `default`（默认） | 主色实心按钮                      |
| `secondary`       | 次色实心按钮                      |
| `destructive`     | 危险操作，红色实心                |
| `outline`         | 边框样式，透明背景                |
| `ghost`           | 幽灵按钮，hover 时显示背景        |
| `link`            | 链接样式，主色文字 + hover 下划线 |
| `success`         | 成功态，绿色                      |
| `warning`         | 警告态，黄色                      |
| `info`            | 信息态，蓝色                      |

### size

| 取值         | 说明                                         |
| ------------ | -------------------------------------------- |
| `xs`         | 超小，`h-6`（24px），用于表格操作按钮        |
| `sm`         | 小，`h-8`（32px）                            |
| `default`    | 默认，`h-9`（36px）                          |
| `md`（默认） | 中等，`h-9`（36px），与 `default` 等价       |
| `lg`         | 大，`h-10`（40px）                           |
| `xl`         | 超大，`h-11`（44px），符合无障碍最小触摸区域 |
| `icon`       | 图标按钮，正方形 `w-8`（32px）               |
| `mobile`     | 移动端，`h-12`（48px）                       |

## 属性

继承自 `React.ButtonHTMLAttributes<HTMLButtonElement>, Omit<VariantProps<typeof buttonVariants>, 'size'>`。

| 属性         | 类型                   | 默认值 | 说明                                                              |
| ------------ | ---------------------- | ------ | ----------------------------------------------------------------- |
| `asChild?`   | `boolean`              | —      | 是否作为子元素渲染                                                |
| `loading?`   | `boolean`              | —      | 是否显示加载状态                                                  |
| `leftIcon?`  | `React.ReactNode`      | —      | 左侧图标                                                          |
| `rightIcon?` | `React.ReactNode`      | —      | 右侧图标                                                          |
| `size?`      | `ButtonSize`           | —      | 按钮尺寸 - 使用统一的尺寸令牌系统                                 |
| `shape?`     | `'circle' \| 'square'` | —      | 按钮形状：`circle` 圆形 / `square` 方形圆角；不传保持默认圆角矩形 |

## 属性（CloseButtonProps）

继承自 `React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants>`。

| 属性             | 类型     | 默认值 | 说明 |
| ---------------- | -------- | ------ | ---- |
| `iconClassName?` | `string` | —      | —    |

本表只列组件自有属性；此外还透传 `<button>` 的全部原生属性（`id` / `type` / `onClick` / `aria-*` / `data-*` 等）。

- **各变体的悬停反馈必须肉眼可辨**：hover 强度与 `Button` / `IconButton` 同基准 —— `default` / `outline` / `ghost` 为 `bg-accent`，`secondary` 为 `bg-secondary/80`，`destructive` 为 `bg-destructive/20`，语义色（success / warning / info）为浅色 100 档，`link` 为下划线。此前 default/secondary/outline 用 `bg-accent/20`（约 2% 灰，白底上不可见）、destructive 用 `/10`，悬停时用户以为「没有 mouse over」。
- **hover 均带 `not-disabled:` 前缀**：`:hover` 对 `button:disabled` 依然命中，裸 `hover:` 会让禁用关闭按钮悬停仍浮出背景（见 `spec/css-standard.md` §4.9.3）。

## 无障碍

- 组件统一注入 `role="button"`、`aria-disabled`（等于 `disabled || loading`）与 `aria-busy`（等于 `loading`）。
- 调用方显式传入的 `aria-busy` / `aria-disabled` / `role` **优先**于组件推导值。
- 键盘操作：`Enter` 与 `Space` 会阻止默认行为并触发一次 `click`。
- 加载图标与左右图标容器均标记 `aria-hidden="true"`。
- 焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。

## 注意事项

- **`loading` 会强制禁用**：`disabled={disabled || loading}`，无法通过 `disabled={false}` 覆盖。
- **尺寸由令牌系统生成**：`size` 的实际类名来自 `src/ui/button/size-tokens.ts` 的 `buttonSizeTokens`，`cva` 的 `size` 分组本身为空串。
- **所有 variant 的 hover 都带 `not-disabled:` 前缀**：`:hover` 对 `button:disabled` 依然命中，裸 `hover:bg-primary/90` 会让禁用按钮悬停时背景仍变化（视觉上「禁用还亮着」）。用 `not-disabled:hover:` 而非 `enabled:hover:`，是为了让 `asChild` 渲染的 `<a>` 链接按钮保留 hover（见 `spec/css-standard.md` §4.9.3）。
- **未知尺寸会回退**：传入未登记的 `size` 时输出 `console.warn` 并回退到 `md`。
- **`asChild` 会替换根元素**：此时不渲染 `<button>`，`role="button"` 等属性注入到子元素，子元素需自行处理 `disabled`。
- **`className` 合并到末位**，自定义类名优先级最高。
- 全部尺寸的字号统一为 `text-sm`（14px），与设计系统保持一致。

## 导出

### 组件

| 导出名        | 说明 |
| ------------- | ---- |
| `Button`      |      |
| `ButtonProps` |      |
| `CloseButton` |      |

### 类型与工具函数

| 导出名                | 说明 |
| --------------------- | ---- |
| `buttonVariants`      |      |
| `closeButtonVariants` |      |
