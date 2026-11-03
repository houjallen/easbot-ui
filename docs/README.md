# @easbot/ui 使用文档

> 基于 **Radix UI** + **Tailwind CSS v4** 的 React 组件库，34 个开箱即用的无障碍组件。

本文档覆盖**全部 34 个组件**与 `useToast` hook，包含每个组件的完整属性表、变体、
无障碍行为、主题变量与可运行示例。

---

## 文档结构

| 文档                              | 内容                                         |
| --------------------------------- | -------------------------------------------- |
| [快速开始](./getting-started.md)  | 安装、引入样式、Next.js App Router、主题切换 |
| [主题定制](./theming.md)          | CSS 变量体系、暗色主题、自定义主题覆盖方法   |
| [表单组件](./components/form/)    | 输入与选择类组件                             |
| [浮层组件](./components/overlay/) | 模态、弹出层、菜单、通知类组件               |
| [数据展示](./components/display/) | 布局、信息呈现类组件                         |

---

## 组件清单（34 个）

### 表单组件（11）

| 组件                                             | 用途               | 文档                                   |
| ------------------------------------------------ | ------------------ | -------------------------------------- |
| [`Button`](./components/form/button.md)          | 触发操作的主按钮   | 8 种 variant / 5 种 size / 移动端手势  |
| [`Input`](./components/form/input.md)            | 单行文本输入       | 3 种 variant / 3 种 size / 前后缀图标  |
| [`Textarea`](./components/form/textarea.md)      | 多行文本输入       | 自动高度 / 自定义滚动条 / 字数限制     |
| [`Label`](./components/form/label.md)            | 表单标签           | 必填标记 / 禁用态 / `htmlFor` 关联     |
| [`Checkbox`](./components/form/checkbox.md)      | 多选框             | 中间态 / 标签描述 / 错误提示 / 滑动    |
| [`RadioGroup`](./components/form/radio-group.md) | 单选组             | 标签描述 / 错误提示 / 键盘导航         |
| [`Switch`](./components/form/switch.md)          | 开关               | 3 种 size / 受控与非受控               |
| [`Toggle`](./components/form/toggle.md)          | 双向状态按钮       | 2 种 variant / 3 种 size               |
| [`Slider`](./components/form/slider.md)          | 数值滑块           | 单点与范围 / 垂直方向 / 步进           |
| [`Select`](./components/form/select.md)          | 下拉选择           | 单选多选 / 搜索过滤 / 分组选项         |
| [`Form`](./components/form/form.md)              | 表单容器与字段绑定 | 基于 react-hook-form / 错误态 / 描述态 |

### 浮层组件（12）

| 组件                                                        | 用途             | 文档                                  |
| ----------------------------------------------------------- | ---------------- | ------------------------------------- |
| [`Dialog`](./components/overlay/dialog.md)                  | 模态对话框       | 3 种 size / 最大化 / 焦点锁定         |
| [`AlertDialog`](./components/overlay/alert-dialog.md)       | 确认与警告对话框 | 3 种 variant / 3 种 size / 加载态     |
| [`Sheet`](./components/overlay/sheet.md)                    | 侧边抽屉         | 四向弹出 / 响应式宽度                 |
| [`Popover`](./components/overlay/popover.md)                | 点击浮层         | 定位 / 偏移 / 内置输入框样式          |
| [`HoverCard`](./components/overlay/hover-card.md)           | 悬停浮层         | 3 种 size / 淡入淡出动画              |
| [`Tooltip`](./components/overlay/tooltip.md)                | 文字提示         | 延迟 / 方位 / 箭头方向动画            |
| [`DropdownMenu`](./components/overlay/dropdown-menu.md)     | 下拉菜单         | 子菜单 / 复选项 / 单选项 / 分组       |
| [`Menubar`](./components/overlay/menubar.md)                | 桌面菜单栏       | 子菜单 / 复选项 / 单选项 / 快捷键提示 |
| [`NavigationMenu`](./components/overlay/navigation-menu.md) | 站点导航菜单     | 视口 / 触发器 / 内容区                |
| [`Command`](./components/overlay/command.md)                | 命令面板         | cmdk 过滤 / 分组 / 加载态             |
| [`Toast`](./components/overlay/toast.md)                    | 轻提示容器与结构 | 3 种 variant / 关闭 / 操作按钮        |
| [`useToast`](./components/overlay/use-toast.md)             | Toast 调用 hook  | 触发 / 更新 / 关闭 / 位置             |

### 数据展示（11）

| 组件                                                | 用途           | 文档                                |
| --------------------------------------------------- | -------------- | ----------------------------------- |
| [`Alert`](./components/display/alert.md)            | 内联提示条     | 5 种 variant / 可关闭 / 自定义图标  |
| [`Avatar`](./components/display/avatar.md)          | 用户头像       | 3 种 size / 2 种形状 / 4 种在线状态 |
| [`Badge`](./components/display/badge.md)            | 徽章与计数标记 | 7 种 variant / 3 种 size / 数字封顶 |
| [`Card`](./components/display/card.md)              | 内容容器       | 5 种 variant / 3 种 size / 可点击   |
| [`Progress`](./components/display/progress.md)      | 进度条         | 0-100 进度 / 自定义指示器样式       |
| [`Skeleton`](./components/display/skeleton.md)      | 骨架屏占位     | 微光扫过动画                        |
| [`Spinner`](./components/display/spinner.md)        | 加载指示器     | 3 种 size / 5 种 variant            |
| [`Table`](./components/display/table.md)            | 数据表格       | 斑马纹 / 固定表头 / 选中行          |
| [`Tabs`](./components/display/tabs.md)              | 标签页         | 受控模式 / 底部指示条               |
| [`ScrollArea`](./components/display/scroll-area.md) | 自定义滚动区域 | 纵横滚动条 / 自定义滑块             |
| [`Separator`](./components/display/separator.md)    | 分隔线         | 水平 / 垂直 / 装饰性                |

---

## 通用约定

### 导入方式

所有组件从包根导出，**不需要**从子路径导入：

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@easbot/ui';
```

### 样式引入（必须）

```tsx
import '@easbot/ui/styles.css';
```

样式在组件库构建期已编译成纯 CSS，消费方**无需**安装或配置 Tailwind。
详见 [快速开始](./getting-started.md#样式引入)。

### className 覆盖

所有组件都接受 `className`，且**总是透传到最外层 DOM 节点**（末位合并，优先级最高）：

```tsx
<Button className="w-full">全宽按钮</Button>
```

### ref 转发

所有基于 Radix primitives 的组件都通过 `React.forwardRef` 转发 ref 到对应的 DOM 元素。

### 图标

图标库**唯一使用 [`lucide-react`](https://lucide.dev/)**，必须具名导入：

```tsx
import { Loader2 } from 'lucide-react';
```

### 主题

所有颜色、尺寸、圆角、阴影均由 CSS 变量驱动，通过 `<html data-theme="light|dark">` 切换。
完整变量清单见 [主题定制](./theming.md)。

### 组件目录规范

每个组件目录包含 4 件套（实现 / 测试 / story / 导出入口），
详见 [`spec/component-standard.md`](../spec/component-standard.md)。

---

## 相关链接

- [Storybook 交互文档](https://houjallen.github.io/easbot-ui/) —— 可直接操作每个组件
- [GitHub 仓库](https://github.com/houjallen/easbot-ui)
- [npm 包](https://www.npmjs.com/package/@easbot/ui)
- [开发规范 `spec/`](../spec/spec-index.md) —— 贡献组件前必读
