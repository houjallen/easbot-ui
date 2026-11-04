# Tooltip 文字提示

> 悬停或聚焦时显示的简短文字说明，用于补充控件的语义。

---

**导入**

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import { Button } from '@easbot/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@easbot/ui';

export default function App() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">悬停查看</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>这是一个基本提示信息</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

延迟显示：

```tsx
<Tooltip delayDuration={500}>
  <TooltipTrigger asChild>
    <Button variant="outline">延迟显示</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>延迟 500 毫秒后显示提示信息。</p>
  </TooltipContent>
</Tooltip>
```

## 无障碍

- 底层 Radix Tooltip 渲染为 `<div role="tooltip">`，并注入 `data-state`（`delayed-open` / `instant-open` / `closed`）/ `data-side`（弹出方向）。
- 触发器渲染为原生 `<button type="button">`，并注入 `aria-describedby`（指向提示内容）/ `data-state`。
- 键盘操作：焦点进入触发器即显示提示，`Esc` 关闭，关闭后焦点归还触发元素 —— 键盘用户不依赖鼠标悬停。
- 提示内容是非模态的，不会抢走焦点，也不锁定焦点。
- 提示容器使用 `text-balance` 排版，箭头（`TooltipPrimitive.Arrow`）是纯装饰元素。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Tooltip` / `TooltipTrigger` / `TooltipContent` / `TooltipProvider` 直接等于设计系统层的实现（`src/design-system/components/ui/tooltip.tsx`），组件未新增自有属性，props 与 Radix `Tooltip` 对应部件完全一致（`open` / `defaultOpen` / `onOpenChange` / `delayDuration` / `skipDelayDuration` / `disableHoverableContent` / `side` / `align` / `sideOffset` / `className` / `aria-*` / `data-*` 等）。
- **`Tooltip` 内部已自动包一层 `TooltipProvider`**：设计系统层把 `<TooltipProvider>` 写在 `Tooltip` 内部，因此**单个** `Tooltip` 无需外部 Provider 也能工作；批量使用多个 Tooltip 时建议在外层统一包一个 `TooltipProvider` 以共享延迟设置。
- **`TooltipProvider` 的 `delayDuration` 默认 `0`**：即悬停立即显示；可传 `delayDuration={500}` 延迟。
- **`TooltipContent` 的 `sideOffset` 默认 `0`**：提示紧贴触发器。
- **`TooltipContent` 内部已自带 `TooltipPrimitive.Portal`**，无需再手动包裹。
- **宽度自适应**：`w-fit` —— 提示宽度随内容变化，不做固定宽度。
- **配色为反色**：`bg-primary text-primary-foreground`，与 Popover / HoverCard 的 `bg-popover` 不同。
- **`TooltipProvider` 的全局配置**：项目内 `DesignSystemProvider` 已内置一层 `TooltipProvider`（`src/design-system/index.tsx`），使用该 Provider 时无需重复包裹。

## 导出

### 组件

| 导出名                 | 说明 |
| ---------------------- | ---- |
| `Tooltip`              |      |
| `TooltipContent`       |      |
| `TooltipContentProps`  |      |
| `TooltipProps`         |      |
| `TooltipProvider`      |      |
| `TooltipProviderProps` |      |
| `TooltipTrigger`       |      |
| `TooltipTriggerProps`  |      |
