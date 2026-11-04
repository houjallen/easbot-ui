# Sidebar 侧边栏

> 应用级侧边导航栏，支持展开 / 折叠（滑出或折叠成图标）、左右两侧摆放，以及移动端自动切换为抽屉。

---

**导入**

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@easbot/ui';
```

## 基础用法

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@easbot/ui';

export default function App() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>导航</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>主菜单</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>仪表盘</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>项目</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>设置</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>主内容区</SidebarInset>
    </SidebarProvider>
  );
}
```

触发按钮放在内容区（图标折叠时补足可读文本）：

```tsx
import { PanelLeft } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@easbot/ui';

<SidebarProvider>
  <SidebarTrigger>
    <PanelLeft className="h-4 w-4" />
    <span className="sr-only">切换侧边栏</span>
  </SidebarTrigger>
</SidebarProvider>;
```

## 部件族

本组件共 47 个公开导出，按职责分为 6 组：

| 部件族              | 导出                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **根容器**          | `SidebarProvider`、`Sidebar`、`SidebarInset`                                                                          |
| **触发器 / 拖拽条** | `SidebarTrigger`、`SidebarRail`                                                                                       |
| **骨架容器**        | `SidebarHeader`、`SidebarContent`、`SidebarFooter`、`SidebarSeparator`、`SidebarInput`                                |
| **分组**            | `SidebarGroup`、`SidebarGroupLabel`、`SidebarGroupAction`、`SidebarGroupContent`                                      |
| **菜单**            | `SidebarMenu`、`SidebarMenuItem`、`SidebarMenuButton`、`SidebarMenuAction`、`SidebarMenuBadge`、`SidebarMenuSkeleton` |
| **子菜单**          | `SidebarMenuSub`、`SidebarMenuSubItem`、`SidebarMenuSubButton`                                                        |
| **状态 Hook**       | `useSidebar`                                                                                                          |

### 根容器

`SidebarProvider` 是**必用**的上下文提供者，它负责状态、Cookie 持久化、快捷键与 Tooltip 环境：

```tsx
import { useState } from 'react';
import { Sidebar, SidebarProvider } from '@easbot/ui';

export default function App() {
  const [open, setOpen] = useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} defaultOpen>
      <Sidebar collapsible="icon">侧边栏内容</Sidebar>
    </SidebarProvider>
  );
}
```

`Sidebar` 自身控制外观：`side`（停靠侧）、`variant`（视觉变体）、`collapsible`（折叠方式）：

```tsx
<Sidebar side="right" variant="floating" collapsible="icon">
  侧边栏内容
</Sidebar>
```

### 触发器与拖拽条

`SidebarTrigger` 有两种形态 —— **不传 `children`** 时渲染带图标的默认按钮；**传了 `children`** 时渲染 `<div role="button">` 并自行接管键盘事件：

```tsx
import { PanelLeft } from 'lucide-react';
import { SidebarTrigger } from '@easbot/ui';

// 形态一：默认图标按钮
<SidebarTrigger />

// 形态二：自定义内容
<SidebarTrigger>
  <PanelLeft className="h-4 w-4" />
  <span className="sr-only">切换侧边栏</span>
</SidebarTrigger>
```

`SidebarRail` 是贴在侧边栏边缘的窄条，作为鼠标 / 触摸的辅助切换入口：

```tsx
import { SidebarRail } from '@easbot/ui';

<SidebarRail />;
```

### 分组

分组用于把菜单切成若干语义区块，`SidebarGroupLabel` 是组标题，`SidebarGroupAction` 是标题右侧的操作按钮：

```tsx
import { Plus } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@easbot/ui';

<SidebarGroup>
  <SidebarGroupLabel>项目</SidebarGroupLabel>
  <SidebarGroupAction>
    <Plus className="h-4 w-4" />
    <span className="sr-only">新建项目</span>
  </SidebarGroupAction>
  <SidebarGroupContent>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive>项目 A</SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroupContent>
</SidebarGroup>;
```

### 菜单与子菜单

菜单项的徽标、悬停操作与图标折叠态下的提示：

```tsx
import { Settings } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@easbot/ui';

<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton isActive size="lg" tooltip="仪表盘">
      <Settings />
      仪表盘
    </SidebarMenuButton>
    <SidebarMenuBadge>12</SidebarMenuBadge>
    <SidebarMenuAction showOnHover>
      <span className="sr-only">设置</span>
    </SidebarMenuAction>
  </SidebarMenuItem>

  {/* 加载占位 */}
  <SidebarMenuItem>
    <SidebarMenuSkeleton showIcon />
  </SidebarMenuItem>
</SidebarMenu>;
```

子菜单（两级导航）：

```tsx
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@easbot/ui';

<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton>设置</SidebarMenuButton>
    <SidebarMenuSub>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton isActive>账户</SidebarMenuSubButton>
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton>通知</SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  </SidebarMenuItem>
</SidebarMenu>;
```

### 读取侧边栏状态

```tsx
import { useSidebar } from '@easbot/ui';

function Toolbar() {
  const { open, setOpen, toggleSidebar, isMobile, state } = useSidebar();

  return (
    <button type="button" onClick={toggleSidebar}>
      {state === 'expanded' ? '收起' : '展开'}
      {isMobile ? '（移动端）' : ''}
    </button>
  );
}
```

## 变体（继承自设计系统层）

### variant

| 取值              | 说明                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`（默认） | 默认样式，hover 时显示 `sidebar-accent` 背景与 `sidebar-accent-foreground` 文字                                                                               |
| `outline`         | 背景色 + 1px 描边（`shadow-[0_0_0_1px_hsl(var(--sidebar-border))]`），hover 时描边转为 `sidebar-accent`；⚠️ 该描边因嵌套 `hsl()` 而失效，实际只剩背景与 hover |

### size

| 取值              | 说明                                                 |
| ----------------- | ---------------------------------------------------- |
| `default`（默认） | 默认，`h-8 text-sm`（32px）                          |
| `sm`              | 小，`h-7 text-xs`（28px）                            |
| `lg`              | 大，`h-12 text-sm`（48px），图标折叠模式下内边距归零 |

`SidebarProps` 是 `Sidebar` 的属性类型（`React.ComponentProps<'div'> & { side / variant / collapsible } & UiMessageProps`），额外继承 `UiMessageProps`（`locale` / `messages`）用于覆盖内置文案。
`SidebarProviderProps` 是 `SidebarProvider` 的属性类型（`React.ComponentProps<'div'> & { defaultOpen / open / onOpenChange }`）。
其余类型均为对应子组件的属性类型别名 —— **无自有成员**，全部继承底层实现的原生属性。

本表只列组件自有属性；此外还透传 `<div>` / `<ul>` / `<li>` / `<button>` / `<a>` / `<input>` / `<main>` 的全部原生属性（`id` / `style` / `aria-*` / `data-*` / `on*` 事件等）。

## 无障碍

- `SidebarTrigger`（无 `children` 时）渲染为原生 `<button>`，内部带 `<span class="sr-only">` 提供可访问名称（内置 `sidebar` 文案域 `toggleLabel`：zh-CN「切换侧边栏」/ en-US `Toggle Sidebar`）；图标 `PanelLeftIcon` 为纯装饰。
- `SidebarTrigger`（传了 `children` 时）渲染为 `<div role="button" tabIndex={0}>`，并自行处理 `Enter` / `Space` 键触发点击 —— 与原生按钮行为对齐。
- `SidebarRail` 渲染为原生 `<button>`，带 `aria-label` 与 `title`（同为内置文案 `toggleLabel`），但 `tabIndex={-1}` —— **不进入 Tab 顺序**，属于鼠标 / 触摸辅助入口。
- 键盘快捷键：`Ctrl + B`（macOS 为 `Cmd + B`）切换侧边栏，监听在 `window` 上。
- 移动端侧边栏以 `Sheet`（Radix Dialog）形态渲染，包含隐藏的 `SheetTitle`（zh-CN「侧边栏」/ en-US `Sidebar`）与 `SheetDescription`（zh-CN「展示移动端侧边栏。」/ en-US `Displays the mobile sidebar.`），供读屏正确命名抽屉；打开时焦点移入并锁定，关闭后归还。
- `SidebarMenuButton` 的 `tooltip` 在**折叠态且非移动端**时才显示（`hidden={state !== 'collapsed' || isMobile}`），用于图标折叠模式下补足可读文本。
- `SidebarMenuButton` / `SidebarMenuSubButton` 渲染为原生 `<button>` / `<a>`，激活项通过 `data-active="true"` 表达视觉高亮（未提供 `aria-current`）。
- `SidebarInset` 渲染为 `<main>`，为主内容区提供地标语义。
- `SidebarSeparator` 基于 Radix Separator，**默认 `decorative={true}`**，因此渲染为 `role="none"`（纯视觉分隔，不进入无障碍树）；需要语义分隔时请传 `decorative={false}`。
- 焦点样式使用 `focus-visible:ring-2`，仅键盘可见焦点才显示。

## 注意事项

- **`SidebarProvider` 是必需的上下文提供者**：`Sidebar` / `SidebarTrigger` / `SidebarRail` / `SidebarMenuButton` 全部依赖它提供的 `SidebarContext`；不在 `SidebarProvider` 内调用 `useSidebar()` 会抛出 `useSidebar must be used within a SidebarProvider.`。
- **`useSidebar()` 的返回值**：`state`（`'expanded'` / `'collapsed'`）、`open`、`setOpen`、`openMobile`、`setOpenMobile`、`isMobile`、`toggleSidebar`。
- **`open` 与 `defaultOpen` 只影响桌面端**：移动端抽屉状态由内部的 `openMobile` 独立控制，`open={false}` **不会**让移动端抽屉保持打开。
- **`toggleSidebar` 在移动端切换的是抽屉**：`isMobile` 为真时切换 `openMobile`，否则切换 `open`。
- **展开态会写入 Cookie**：`setOpen` 执行时写入 `sidebar_state`（`path=/`，`max-age` 7 天）；源码注释说明该行为用于跨会话保持展开态，cookie 写入失败不影响组件功能，消费方也可改用受控 `open` prop 自行持久化。
- **`collapsible` 有三个取值**：`'offcanvas'`（默认，完全滑出视口）、`'icon'`（折叠成图标条，宽度 `var(--sidebar-width-icon)`）、`'none'`（不可折叠，始终展开，且不会渲染 `data-collapsible` 等状态属性）。
- **`data-collapsible` 只在折叠态写入**：`data-collapsible={state === 'collapsed' ? collapsible : ''}` —— 展开态该属性为空字符串，CSS 里的 `group-data-[collapsible=icon]:*` 规则因此只在折叠时生效。
- **`variant` 有三个取值**：`'sidebar'`（默认，普通侧边栏）、`'floating'`（悬浮卡片样式，带圆角 / 边框 / 阴影）、`'inset'`（内嵌样式，配合 `SidebarInset` 形成圆角内容区）。
- **`side` 决定停靠侧**：`'left'`（默认）/ `'right'`；`offcanvas` 折叠时会滑向对应方向。
- **移动端会切换为 `Sheet` 抽屉**：`Sidebar` 在 `isMobile` 为真时（UA 匹配移动端关键字**或**视口宽度 ≤ 768px）渲染为 `Sheet` + `SheetContent`，宽度固定为 `18rem`（`--sidebar-width` 被内联覆盖），桌面端宽度为 `16rem`。
- **`collapsible="none"` 时不渲染移动端抽屉**：源码中 `collapsible === 'none'` 的分支最先 return，直接渲染一个普通 `<div>`。
- **`SidebarProvider` 内置了 `TooltipProvider delayDuration={0}`**：因此 `SidebarMenuButton` 的 `tooltip` 无需额外包裹 `TooltipProvider`。
- **`SidebarTrigger` 传 `children` 时会渲染 `<div>` 而非 `<button>`**：源码会剔除 `type` / `variant` / `size` / `onClick` 等 Button 专属属性，避免非法 DOM 属性。
- **`SidebarTrigger` 的 `onClick` 与内部切换都会执行**：先调用调用方的 `onClick`，再调用 `toggleSidebar()` —— 无法通过阻止默认行为取消切换。
- **`SidebarTrigger` 的 `asChild` 在传了 `children` 时完全失效**：源码先判断 `children`，有则走「渲染 `<div>`」分支并直接 `return` —— `asChild` 不会被读取，子元素原样放进 `<div>` 内（实测渲染为 `<div role="button"><button type="button">自定义</button></div>`）。不传 `children` 时 `asChild` 才生效（走 Radix `Slot`），此时组件内部的图标与 `sr-only` 文本会**覆盖**子元素的原有内容 —— 若要保留自定义内容，请改用「传 `children`」形态。
- **`SidebarRail` 的 `aria-label` / `title` / `onClick` 可被覆盖**：源码把 `{...props}` 放在最后展开，调用方传入的同名属性优先级更高。
- **`SidebarMenuButton` 的 `variant` / `size` 取自设计系统层** `sidebarMenuButtonVariants`（见上表），不随 `Sidebar` 的 `variant` 变化。
- **`outline` 变体的 1px 描边实际不生效（源码缺陷）**：类名写作 `shadow-[0_0_0_1px_hsl(var(--sidebar-border))]`，但主题变量 `--sidebar-border` / `--sidebar-accent` 的值本身已经是**完整颜色**（如 `--sidebar-border: hsl(240 4% 90%)`，编译后为 `#e4e4e7`），再套一层 `hsl()` 得到 `hsl(#e4e4e7)` —— 非法颜色值会让整条 `box-shadow` 声明失效。因此该变体实际只剩背景色（`bg-background`）与 hover 效果，描边需自行用 `className` 补（如 `border border-sidebar-border`）。
- **`SidebarMenuButton` 的 `tooltip` 接受字符串或 TooltipContent 属性对象**：传字符串时内部转成 `{ children: tooltip }`；仅在折叠态且非移动端显示。
- **`SidebarMenuAction` 的 `showOnHover` 默认 `false`**：开启后仅在菜单项 hover / 聚焦时显示（`md:opacity-0` + `group-hover/menu-item:opacity-100`）。
- **`SidebarMenuSkeleton` 的宽度是随机的**：`useMemo` 生成 50%~90% 之间的随机宽度，**SSR 场景下会导致 hydration 不一致**。
- **`SidebarMenuSubButton` 的 `size` 取值只有 `'sm'` / `'md'`**，且不改变字号（统一 `text-sm`）。
- **图标折叠模式下多个子组件会隐藏**：`SidebarGroupAction` / `SidebarMenuAction` / `SidebarMenuBadge` / `SidebarMenuSub` / `SidebarMenuSubButton` 在 `group-data-[collapsible=icon]` 下隐藏；`SidebarGroupLabel` 变为透明并上移（`-mt-8 opacity-0`）；`SidebarContent` 关闭滚动（`overflow-hidden`）。
- **`Sidebar` 根容器的 `className` 落点随场景变化**：桌面端落在 `sidebar-container`（固定定位层）；移动端落在 `Sheet` 的根元素（**不是** `SheetContent`）；`collapsible="none"` 时落在普通 `<div>` 上 —— 最外层的 `sidebar-wrapper` 的 `className` 由 `SidebarProvider` 接收。
- **`SidebarProvider` 会向根节点注入 CSS 变量**：`--sidebar-width: 16rem` 与 `--sidebar-width-icon: 3rem`，并允许调用方通过 `style` 覆盖。
- **`src/ui` 层是设计系统层的薄封装**：`Sidebar` / `SidebarTrigger` / `SidebarRail` 仅在**文案层**透传 `locale` / `messages`；其余 23 个子组件直接等于设计系统层 `src/design-system/components/ui/sidebar.tsx` 的实现。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--sidebar-accent`
- `--sidebar-border`
- `--sidebar-width`
- `--sidebar-width-icon`

## 导出

### 组件

| 导出名                      | 说明 |
| --------------------------- | ---- |
| `Sidebar`                   |      |
| `SidebarContent`            |      |
| `SidebarContentProps`       |      |
| `SidebarFooter`             |      |
| `SidebarFooterProps`        |      |
| `SidebarGroup`              |      |
| `SidebarGroupAction`        |      |
| `SidebarGroupActionProps`   |      |
| `SidebarGroupContent`       |      |
| `SidebarGroupContentProps`  |      |
| `SidebarGroupLabel`         |      |
| `SidebarGroupLabelProps`    |      |
| `SidebarGroupProps`         |      |
| `SidebarHeader`             |      |
| `SidebarHeaderProps`        |      |
| `SidebarInput`              |      |
| `SidebarInputProps`         |      |
| `SidebarInset`              |      |
| `SidebarInsetProps`         |      |
| `SidebarMenu`               |      |
| `SidebarMenuAction`         |      |
| `SidebarMenuActionProps`    |      |
| `SidebarMenuBadge`          |      |
| `SidebarMenuBadgeProps`     |      |
| `SidebarMenuButton`         |      |
| `SidebarMenuButtonProps`    |      |
| `SidebarMenuItem`           |      |
| `SidebarMenuItemProps`      |      |
| `SidebarMenuProps`          |      |
| `SidebarMenuSkeleton`       |      |
| `SidebarMenuSkeletonProps`  |      |
| `SidebarMenuSub`            |      |
| `SidebarMenuSubButton`      |      |
| `SidebarMenuSubButtonProps` |      |
| `SidebarMenuSubItem`        |      |
| `SidebarMenuSubItemProps`   |      |
| `SidebarMenuSubProps`       |      |
| `SidebarProps`              |      |
| `SidebarProvider`           |      |
| `SidebarProviderProps`      |      |
| `SidebarRail`               |      |
| `SidebarRailProps`          |      |
| `SidebarSeparator`          |      |
| `SidebarSeparatorProps`     |      |
| `SidebarTrigger`            |      |
| `SidebarTriggerProps`       |      |

### 类型与工具函数

| 导出名       | 说明 |
| ------------ | ---- |
| `useSidebar` |      |
