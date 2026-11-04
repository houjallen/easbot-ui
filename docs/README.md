# @easbot/ui 使用文档

> 基于 **Radix UI** + **Tailwind CSS v4** 的 React 组件库，**56 个组件目录**、**919 个公开导出**。
> 全部组件自带**无障碍语义**与**内置双语文案**（zh-CN / en-US）。

---

## 文档结构

| 文档                             | 内容                                       |
| -------------------------------- | ------------------------------------------ |
| [快速开始](./getting-started.md) | 安装、引入样式、国际化、主题切换           |
| [主题定制](./theming.md)         | CSS 变量体系、暗色主题、自定义主题覆盖方法 |
| [表单组件](#表单组件)            | 输入与选择类组件                           |
| [浮层组件](#浮层组件)            | 模态、弹出层、菜单、通知类组件             |
| [数据展示](#数据展示)            | 布局、信息呈现类组件                       |
| [数据录入](#数据录入)            | 结构化数据选择与编辑                       |
| [导航布局](#导航布局)            | 应用框架与分页导航                         |
| [表格](#表格)                    | 功能完整的数据表格体系                     |

---

## 组件清单

### 表单组件（14）

| 组件                                               | 用途                              | 文档       |
| -------------------------------------------------- | --------------------------------- | ---------- |
| [`Button`](./components/form/button.md)            | 9 种 variant / 8 种 size / 加载态 | 按钮       |
| [`Input`](./components/form/input.md)              | 前后缀图标 / 错误态 / 加载态      | 输入框     |
| [`Textarea`](./components/form/textarea.md)        | 多行文本编辑                      | 多行输入   |
| [`Label`](./components/form/label.md)              | 与控件 htmlFor 关联               | 表单标签   |
| [`Checkbox`](./components/form/checkbox.md)        | 中间态 / 标签描述 / 错误提示      | 复选框     |
| [`RadioGroup`](./components/form/radio-group.md)   | 标签描述 / 错误提示 / 键盘导航    | 单选组     |
| [`Switch`](./components/form/switch.md)            | 二元状态切换                      | 开关       |
| [`Toggle`](./components/form/toggle.md)            | 双向状态按钮                      | 切换按钮   |
| [`ToggleGroup`](./components/form/toggle-group.md) | 单选 / 多选切换                   | 切换按钮组 |
| [`Slider`](./components/form/slider.md)            | 单点与范围选择                    | 滑块       |
| [`Select`](./components/form/select.md)            | 分组选项 / 禁用态                 | 选择器     |
| [`Combobox`](./components/form/combobox.md)        | 可搜索 / 多选 / 加载态            | 组合框     |
| [`Form`](./components/form/form.md)                | 基于 react-hook-form 的字段绑定   | 表单容器   |
| [`InputOTP`](./components/form/input-otp.md)       | 一次性密码输入                    | 验证码输入 |

### 浮层组件（14）

| 组件                                                        | 用途                            | 文档       |
| ----------------------------------------------------------- | ------------------------------- | ---------- |
| [`Dialog`](./components/overlay/dialog.md)                  | 3 种 size / 最大化 / 焦点锁定   | 对话框     |
| [`AlertDialog`](./components/overlay/alert-dialog.md)       | 变体 / 尺寸 / 加载态 / 便捷封装 | 确认对话框 |
| [`Sheet`](./components/overlay/sheet.md)                    | 四向弹出 / 响应式宽度           | 侧边抽屉   |
| [`Drawer`](./components/overlay/drawer.md)                  | 基于 vaul 的移动端抽屉          | 底部抽屉   |
| [`Popover`](./components/overlay/popover.md)                | 点击触发 / 自由定位             | 弹出层     |
| [`HoverCard`](./components/overlay/hover-card.md)           | 悬停展示信息                    | 悬停卡片   |
| [`Tooltip`](./components/overlay/tooltip.md)                | 延迟 / 方位 / 箭头动画          | 文字提示   |
| [`DropdownMenu`](./components/overlay/dropdown-menu.md)     | 子菜单 / 复选项 / 单选项        | 下拉菜单   |
| [`ContextMenu`](./components/overlay/context-menu.md)       | 右键触发的上下文菜单            | 右键菜单   |
| [`Menubar`](./components/overlay/menubar.md)                | 桌面应用风格菜单栏              | 菜单栏     |
| [`NavigationMenu`](./components/overlay/navigation-menu.md) | 视口 / 触发器 / 内容区          | 站点导航   |
| [`Command`](./components/overlay/command.md)                | cmdk 过滤 / 分组 / 加载态       | 命令面板   |
| [`Toast`](./components/overlay/toast.md)                    | 5 种 variant / 关闭 / 操作按钮  | 通知容器   |
| [`useToast`](./components/overlay/use-toast.md)             | 触发 / 更新 / 关闭 / 位置       | 通知调用   |

### 数据展示（12）

| 组件                                                | 用途                               | 文档       |
| --------------------------------------------------- | ---------------------------------- | ---------- |
| [`Alert`](./components/display/alert.md)            | 5 种 variant / 可关闭 / 自定义图标 | 提示条     |
| [`Avatar`](./components/display/avatar.md)          | 3 种 size / 2 种形状 / 在线状态    | 头像       |
| [`Badge`](./components/display/badge.md)            | 7 种 variant / 状态点 / 数字角标   | 徽章       |
| [`Card`](./components/display/card.md)              | 标题 / 描述 / 内容 / 页脚 / 操作区 | 内容容器   |
| [`Progress`](./components/display/progress.md)      | 0-100 进度 / 自定义指示器          | 进度条     |
| [`Skeleton`](./components/display/skeleton.md)      | 微光扫过动画                       | 骨架屏     |
| [`Spinner`](./components/display/spinner.md)        | 3 种 size / 6 种 variant           | 加载指示器 |
| [`Tabs`](./components/display/tabs.md)              | 受控模式 / 底部指示条              | 标签页     |
| [`ScrollArea`](./components/display/scroll-area.md) | 纵横滚动条 / 自定义滑块            | 滚动区域   |
| [`Separator`](./components/display/separator.md)    | 水平 / 垂直 / 装饰性               | 分隔线     |
| [`Typography`](./components/display/typography.md)  | 标题 / 正文 / 链接 / 表格 / 代码块 | 排版       |
| [`Tag`](./components/display/tag.md)                | 7 种 variant / 3 种 size / 可关闭  | 标签       |

### 数据录入（12）

| 组件                                                     | 用途                                | 文档         |
| -------------------------------------------------------- | ----------------------------------- | ------------ |
| [`Accordion`](./components/data-entry/accordion.md)      | 可折叠内容分组                      | 手风琴       |
| [`Collapsible`](./components/data-entry/collapsible.md)  | 单个可折叠区块                      | 折叠面板     |
| [`AspectRatio`](./components/data-entry/aspect-ratio.md) | 固定宽高比约束                      | 宽高比容器   |
| [`Breadcrumb`](./components/data-entry/breadcrumb.md)    | 层级路径导航                        | 面包屑       |
| [`Calendar`](./components/data-entry/calendar.md)        | 基于 react-day-picker               | 日历         |
| [`Carousel`](./components/data-entry/carousel.md)        | 基于 embla-carousel                 | 轮播         |
| [`Chart`](./components/data-entry/chart.md)              | 基于 recharts 的图表容器            | 图表容器     |
| [`Date`](./components/data-entry/date.md)                | 7 个输入组件 + 12 个视图 + 工具函数 | 日期时间选择 |
| [`Edit`](./components/data-entry/edit.md)                | 枚举 / 列表 / 对象三种编辑器        | 数据编辑器   |
| [`File`](./components/data-entry/file.md)                | 拖拽 / 列表 / 预览 / 裁剪           | 文件上传     |
| [`Icon`](./components/data-entry/icon.md)                | name / url / class 三种模式         | 图标         |
| [`Tree`](./components/data-entry/tree.md)                | 单选 / 多选 / 级联                  | 树形控件     |

### 导航布局（3）

| 组件                                                  | 用途                               | 文档       |
| ----------------------------------------------------- | ---------------------------------- | ---------- |
| [`Sidebar`](./components/navigation/sidebar.md)       | 折叠 / 图标模式 / 移动端抽屉       | 侧边栏     |
| [`Pagination`](./components/navigation/pagination.md) | 页码 / 上下页 / 省略号             | 分页       |
| [`Resizable`](./components/navigation/resizable.md)   | 拖拽调整宽度（横向 / 纵向 / 嵌套） | 可调整面板 |

### 表格（1）

| 组件                                   | 用途                             | 文档     |
| -------------------------------------- | -------------------------------- | -------- |
| [`Table`](./components/table/table.md) | 191 个导出 / 3 种形态 / 插件系统 | 数据表格 |

### 应用组件（2）

| 组件                                                     | 用途                           | 文档     |
| -------------------------------------------------------- | ------------------------------ | -------- |
| [`ThemeToggle`](./components/display/app-components.md)  | 主题切换（light / dark 两态）  | 应用组件 |
| [`LocaleToggle`](./components/display/app-components.md) | 语言切换（下拉菜单，母语显示） | 应用组件 |

### 表格子页（4 篇）

| 文档                                                   | 内容                                         |
| ------------------------------------------------------ | -------------------------------------------- |
| [Table 表格（总览）](./components/table/table.md)      | 三大形态对比 / 能力矩阵 / 快速上手           |
| [原子组件篇](./components/table/table-atoms.md)        | 21 个原子组件 + 虚拟列表                     |
| [插件系统篇](./components/table/table-plugins.md)      | 插件架构 / 18 个内置插件 / 自定义插件        |
| [Hook 与数据契约篇](./components/table/table-hooks.md) | Provider / 7 个 Hook / 数据契约 / 远端数据源 |

### 专题子页

| 文档                                                             | 内容                                       |
| ---------------------------------------------------------------- | ------------------------------------------ |
| [Date 视图组件篇](./components/data-entry/date-views.md)         | 12 个日期 / 时间视图组件                   |
| [Date 工具函数与 Hook 篇](./components/data-entry/date-utils.md) | 日期计算 / 校验 / 快捷选项 / 时区 / 国际化 |

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
详见 [快速开始](./getting-started.md#样式引入必须)。

### 国际化

组件库**自带**双语默认文案，通过 `LocaleProvider` 注入语言：

```tsx
import { LocaleProvider } from '@easbot/ui';

<LocaleProvider locale="zh-CN">
  <App />
</LocaleProvider>;
```

单个组件可用 `locale` / `messages` 属性覆盖。详见 [快速开始](./getting-started.md#国际化)。

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

库内也内置了 [Icon 组件](./components/data-entry/icon.md)，可用名称直接引用内置图标。

### 主题

所有颜色、尺寸、圆角、阴影均由 CSS 变量驱动，通过 `<html data-theme="light|dark">` 切换。
完整变量清单见 [主题定制](./theming.md)。

---

## 相关链接

- [Storybook 交互文档](https://houjallen.github.io/easbot-ui/) —— 可直接操作每个组件
- [GitHub 仓库](https://github.com/houjallen/easbot-ui)
- [npm 包](https://www.npmjs.com/package/@easbot/ui)
- [开发规范 `spec/`](../spec/spec-index.md) —— 贡献组件前必读
