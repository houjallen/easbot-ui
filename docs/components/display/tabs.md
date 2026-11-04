# Tabs 标签页

> 在同一区域切换多组内容，支持受控 / 非受控两种模式与横向、纵向两种排列。

---

**导入**

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@easbot/ui';
```

## 基础用法

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@easbot/ui';

export default function App() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">账户</TabsTrigger>
        <TabsTrigger value="password">密码</TabsTrigger>
      </TabsList>
      <TabsContent value="account">账户设置内容</TabsContent>
      <TabsContent value="password">密码设置内容</TabsContent>
    </Tabs>
  );
}
```

受控用法：

```tsx
import { useState } from 'react';

const [value, setValue] = useState('music');

<Tabs value={value} onValueChange={setValue}>
  <TabsList>
    <TabsTrigger value="music">音乐</TabsTrigger>
    <TabsTrigger value="videos">视频</TabsTrigger>
  </TabsList>
  <TabsContent value="music">音乐内容</TabsContent>
  <TabsContent value="videos">视频内容</TabsContent>
</Tabs>;
```

纵向排列：

```tsx
<Tabs defaultValue="a" orientation="vertical">
  <TabsList className="flex flex-col gap-2">
    <TabsTrigger value="a">A</TabsTrigger>
    <TabsTrigger value="b">B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">内容 A</TabsContent>
  <TabsContent value="b">内容 B</TabsContent>
</Tabs>
```

`TabsProps` / `TabsListProps` / `TabsTriggerProps` / `TabsContentProps` 均为 `React.ComponentProps<typeof 对应组件>` 的类型别名 —— **无自有成员**，全部继承 Radix `TabsPrimitive` 对应部件的原生属性。

## 无障碍

- `TabsList` 渲染为 `<div role="tablist">`，并注入 `aria-orientation`（`horizontal` / `vertical`）。
- `TabsTrigger` 渲染为原生 `<button type="button" role="tab">`，并注入 `aria-selected`、`aria-controls`（指向对应内容面板）、`data-state`（`active` / `inactive`）。
- `TabsContent` 渲染为 `<div role="tabpanel">`，并注入 `aria-labelledby`（指回触发器）、`data-state`（`active` / `inactive`）；非激活面板带 `hidden`，不会出现在无障碍树中。
- 键盘操作：方向键（`ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown`）在触发器之间移动焦点，`Home` / `End` 跳到首 / 末项，`Enter` / `Space` 激活。
- 触发器列表本身可聚焦（`tabIndex={0}`），焦点样式使用 `focus-visible:border-ring` + `focus-visible:ring-[3px]`，仅键盘可见焦点才显示。
- 禁用的触发器使用原生 `disabled`，元素不可聚焦，屏幕阅读器播报「不可用」。

## 注意事项

- **`src/ui` 层是纯 re-export**：`Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` 直接等于设计系统层 `src/design-system/components/ui/tabs.tsx` 的实现，props 与 Radix `Tabs` 对应部件完全一致。
- **`value` / `defaultValue` 必须成对使用**：非受控用 `defaultValue`，受控用 `value` + `onValueChange`；两者都需与各 `TabsTrigger` / `TabsContent` 的 `value` 匹配。
- **触发器与内容靠 `value` 关联**：不匹配的 `TabsContent` 永远不会被激活。
- **默认布局是横向**：`Tabs` 根容器是 `flex flex-col gap-2`，`TabsList` 是 `inline-flex h-9 w-fit`；横向铺满请传 `className="grid w-full grid-cols-2"`。
- **`TabsList` 高度固定 `h-9`**（36px），触发器高度为 `h-[calc(100%-1px)]`。
- **激活态样式靠 `data-[state=active]`**：激活项变为 `bg-background` + `shadow-sm`，暗色主题下激活文字色单独覆盖。
- **面板切换带动画**：非激活面板保留在 DOM 中（`hidden`），首次激活会有过渡动画。
- **图标尺寸由组件约束**：触发器内的 `<svg>` 被统一设置为 `size-4` 且 `pointer-events-none`。
- **禁用项需显式传 `disabled`**：组件不提供自动禁用逻辑。

## 导出

### 组件

| 导出名             | 说明 |
| ------------------ | ---- |
| `Tabs`             |      |
| `TabsContent`      |      |
| `TabsContentProps` |      |
| `TabsList`         |      |
| `TabsListProps`    |      |
| `TabsProps`        |      |
| `TabsTrigger`      |      |
| `TabsTriggerProps` |      |
