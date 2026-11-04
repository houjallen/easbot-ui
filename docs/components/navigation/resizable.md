# Resizable 可调整面板

> 可拖拽调整尺寸的面板组，支持横向 / 纵向布局、嵌套组合与最小 / 最大尺寸约束。

---

> ✅ **已从包根导出**：`src/ui/index.ts` 已含 `export * from './resizable'`，
> `ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle` 及其 Props 类型均可直接 `import`。

**导入**

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@easbot/ui';
```

## 基础用法

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@easbot/ui';

export default function App() {
  return (
    <ResizablePanelGroup orientation="horizontal" style={{ height: 240 }}>
      <ResizablePanel defaultSize={40} minSize={20}>
        左侧面板
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>右侧面板</ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

纵向布局：

```tsx
<ResizablePanelGroup orientation="vertical" style={{ height: 300 }}>
  <ResizablePanel defaultSize={50}>上面板</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={50}>下面板</ResizablePanel>
</ResizablePanelGroup>
```

嵌套面板组：

```tsx
<ResizablePanelGroup orientation="horizontal" style={{ height: 320 }}>
  <ResizablePanel defaultSize={30}>左</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={70}>
    <ResizablePanelGroup orientation="vertical" style={{ height: '100%' }}>
      <ResizablePanel defaultSize={50}>上</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>下</ResizablePanel>
    </ResizablePanelGroup>
  </ResizablePanel>
</ResizablePanelGroup>
```

约束尺寸与折叠：

```tsx
<ResizablePanelGroup orientation="horizontal" style={{ height: 240 }}>
  <ResizablePanel defaultSize={30} minSize={15} maxSize={50} collapsible>
    可折叠面板
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={70}>右侧面板</ResizablePanel>
</ResizablePanelGroup>
```

`ResizablePanelGroupProps` / `ResizablePanelProps` / `ResizableHandleProps` 均为对应组件的属性类型别名 —— **无自有成员**，全部继承 `react-resizable-panels` v4 对应部件的原生属性：

- `ResizablePanelGroupProps` ← `GroupProps`（`orientation` / `defaultLayout` / `onLayoutChange` / `onLayoutChanged` / `disabled` / `disableCursor` / `groupRef` / `elementRef` / `resizePreviewMode` / `resizeTargetMinimumSize` / `id` / `style` 等）
- `ResizablePanelProps` ← `PanelProps`（`defaultSize` / `minSize` / `maxSize` / `collapsible` / `collapsedSize` / `collapsedThreshold` / `groupResizeBehavior` / `disabled` / `onResize` / `panelRef` / `elementRef` / `id` / `style` 等）
- `ResizableHandleProps` ← `SeparatorProps` **+** 自有属性 `withHandle`（`boolean`）

本表只列组件自有属性；此外还透传 `<div>` 的全部原生属性（`id` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- `ResizableHandle` 渲染为 `<div role="separator">`，并注入 `aria-orientation`（**垂直于**面板组的拖拽方向：横向分组时为 `vertical`，纵向分组时为 `horizontal`）、`aria-valuenow` / `aria-valuemin` / `aria-valuemax`（当前尺寸与上下限）、`aria-controls`（指向被控制的面板 id）、`aria-disabled`（禁用时为 `true`）。
- `ResizableHandle` 默认 `tabIndex={0}` —— **可聚焦**，是分隔条的键盘操作入口；禁用时底层会移除 `tabIndex`。
- 键盘操作：`ArrowLeft` / `ArrowRight`（横向分组）与 `ArrowUp` / `ArrowDown`（纵向分组）每次调整 5%；`Home` 收缩到最小、`End` 扩展到最大；`Enter` 折叠 / 展开可折叠面板；`F6` / `Shift + F6` 在相邻分隔条之间移动焦点。
- 拖拽把手 `withHandle` 渲染的是 `GripVerticalIcon`（`lucide-react`），纯装饰，语义由 `role="separator"` 与 `aria-valuenow` 承担。
- `ResizablePanel` 渲染为 `<div data-panel>`，禁用时注入 `data-disabled`。
- `ResizablePanelGroup` 渲染为 `<div data-group>`。
- 焦点样式使用 `focus-visible:ring-1` + `focus-visible:ring-ring` + `focus-visible:ring-offset-1`，仅键盘可见焦点才显示。

## 注意事项

- **✅ 已从包根导出**：`src/ui/index.ts` 已含 `export * from './resizable'`，`ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle` 及其 Props 类型均可直接从包根 import。
- **`src/ui` 层是纯 re-export**：`ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle` 直接等于设计系统层 `src/design-system/components/ui/resizable.tsx` 的实现，props 与 `react-resizable-panels` v4 一致。
- **基于 `react-resizable-panels` v4**：v4 将旧版的 `PanelGroup` / `PanelResizeHandle` 更名为 `Group` / `Separator`，并把 `direction` 改为 `orientation` —— 因此这里用的是 `orientation`（`'horizontal'` / `'vertical'`，默认 `'horizontal'`），**不是** v3 的 `direction`。
- **设计系统层的 `data-[group-orientation=vertical]:*` 类名在 v4 下不会命中**：v4 的分组根元素只输出 `data-group`，**不再**输出 `data-group-orientation`（v3 输出的是 `data-panel-group` / `data-panel-group-direction`）。因此 `ResizablePanelGroup` 上的 `data-[group-orientation=vertical]:flex-col` 与 `ResizableHandle` 上的纵向样式（`data-[group-orientation=vertical]:h-px` / `w-full` 等）均为**失效类名** —— 纵向布局实际由底层注入的内联 `flex-direction: column` 生效，分隔条的横向外观需自行补样式。
- **必须显式设置分组高度**：`ResizablePanelGroup` 的根元素带有内联 `height: 100%` / `width: 100%` / `overflow: hidden` / `display: flex` / `flex-direction`，其中 `display` 与 `flex-direction` **不可被 `style` 覆盖**（仅 `height` / `width` 可覆盖）—— 因此必须给 `ResizablePanelGroup` 显式设置高度（如 `style={{ height: 240 }}`），否则高度为 0 看不见面板。
- **尺寸单位规则**：`defaultSize` / `minSize` / `maxSize` 传数字时按**像素**解释，传不带单位的字符串（如 `"50"`）按**百分比**解释，带明确单位（`px` / `%` / `em` / `rem` / `vh` / `vw`）时按该单位解释。
- **`defaultSize` 省略时按面板数量自动分配**：不传 `defaultSize` 时由底层根据组内面板总数平均分配（实测两个面板各得 `flex: 50 1 0px`）。
- **`className` 的落点与直觉不同**：`ResizablePanel` 的 `className` 会被加到**内层** `<div>` 上（底层说明这是为了避免样式干扰 Flex 布局），外层 `<div data-panel>` 不带任何类名；`ResizablePanelGroup` 的 `className` 加在分组根元素上。
- **`withHandle` 是 `ResizableHandle` 的唯一自有属性**：`true` 时在分隔条中央渲染一个带边框的握把图标（`GripVerticalIcon`）。
- **拖拽光标由底层接管**：底层会在拖拽时设置自定义光标样式；如需关闭，传入 `disableCursor`。
- **分组必须至少包含一个保留相对尺寸的面板**：`groupResizeBehavior` 默认是 `'preserve-relative-size'`；若全部面板都设为 `'preserve-pixel-size'`，底层无法计算剩余空间。
- **`ResizableHandle` 必须是 `ResizablePanelGroup` 的直接子元素**：底层说明分隔条元素必须是父分组的直接 DOM 子节点，否则不会被注册为分隔条。
- **双击分隔条会把相邻面板恢复到默认尺寸**：传入 `disableDoubleClick` 可关闭该行为。
- **没有 `variant` / `size` 等样式变体**，组件不消费主题 CSS 变量（仅使用 `bg-border` / `ring-ring` 等语义类）。

## 导出

### 组件

| 导出名                     | 说明 |
| -------------------------- | ---- |
| `ResizableHandle`          |      |
| `ResizableHandleProps`     |      |
| `ResizablePanel`           |      |
| `ResizablePanelGroup`      |      |
| `ResizablePanelGroupProps` |      |
| `ResizablePanelProps`      |      |
