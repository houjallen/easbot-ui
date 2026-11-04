# ToggleGroup 切换按钮组

> 一组互斥或可多选的切换按钮，共享同一套变体与尺寸。

---

**导入**

```tsx
import { ToggleGroup, ToggleGroupItem } from '@easbot/ui';
```

## 基础用法

```tsx
import { ToggleGroup, ToggleGroupItem } from '@easbot/ui';

export default function App() {
  return (
    <ToggleGroup type="single" defaultValue="python">
      <ToggleGroupItem value="python">Python</ToggleGroupItem>
      <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
      <ToggleGroupItem value="ruby">Ruby</ToggleGroupItem>
    </ToggleGroup>
  );
}
```

多选模式：

```tsx
<ToggleGroup type="multiple" defaultValue={['python', 'javascript']}>
  <ToggleGroupItem value="python">Python</ToggleGroupItem>
  <ToggleGroupItem value="javascript">JavaScript</ToggleGroupItem>
</ToggleGroup>
```

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                       |
| ----------------- | ------------------------------------------ |
| `default`（默认） | 透明背景，hover 时显示 muted 背景          |
| `outline`         | 带边框的轮廓样式，hover 时显示 accent 背景 |

### size

| 取值              | 说明                               |
| ----------------- | ---------------------------------- |
| `default`（默认） | 默认，`h-9 min-w-9 px-2`（36px）   |
| `sm`              | 小，`h-8 min-w-8 px-1.5`（32px）   |
| `lg`              | 大，`h-10 min-w-10 px-2.5`（40px） |

`ToggleGroupProps` / `ToggleGroupItemProps` 均为 `React.ComponentProps<typeof ...>` 的类型别名，props 与 Radix `ToggleGroupPrimitive.Root` / `ToggleGroupPrimitive.Item` 一致（`type` / `value` / `defaultValue` / `onValueChange` / `orientation` / `rovingFocus` / `disabled` / `className` / `aria-*` / `data-*` 等），组件未新增自有属性。

## 无障碍

- `type="single"` 时组容器渲染为 `role="radiogroup"`，`type="multiple"` 时渲染为 `role="toolbar"`。
- 单选模式下每个 `ToggleGroupItem` 渲染为 `role="radio"` 并注入 `aria-checked`；多选模式下沿用 Radix Toggle 的 `aria-pressed`。
- 键盘操作：`Tab` 进入组内后由 **roving focus** 管理焦点，方向键在组内移动；`Space` / `Enter` 切换选中状态。
- 禁用态使用原生 `disabled`，元素不可聚焦，屏幕阅读器播报「不可用」。
- 组内的 `<svg>` 图标统一为 `pointer-events-none` 且固定 `size-4`，是纯装饰元素。

## 注意事项

- **`type` 是必填项**：Radix 在缺少 `type` 时会直接抛错 `Missing prop 'type' expected on 'ToggleGroup'`。
- **变体优先级：上下文 > 单项自身**：`ToggleGroup` 通过 Context 下发 `variant` / `size`，单项自身设置的同名属性**会被上下文覆盖**（`context?.variant ?? variant`）。
- **Context 默认值是 `undefined`**：源码注释说明这是刻意的 —— 若 Context 填了具体值，单项自身的 `variant` / `size` 就永远失效。
- **`variant` / `size` 来自设计系统层**：`src/ui/toggle-group` 是纯 re-export，实际取值见 `src/design-system/components/ui/toggle.tsx` 的 `toggleVariants`。
- **组内会覆盖尺寸的 `min-w`**：源码注释说明 `min-w-0` 会让 `sm` / `lg` 尺寸失效，因此组内只保留不影响尺寸语义的布局类（`flex-1 shrink-0 rounded-none shadow-none` 等），首末项分别补 `first:rounded-l-md` / `last:rounded-r-md`。
- **容器宽度自适应**：组容器默认 `flex w-fit items-center`，宽度随内容收缩。

## 导出

### 组件

| 导出名                 | 说明 |
| ---------------------- | ---- |
| `ToggleGroup`          |      |
| `ToggleGroupItem`      |      |
| `ToggleGroupItemProps` |      |
| `ToggleGroupProps`     |      |
