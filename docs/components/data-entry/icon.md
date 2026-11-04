# Icon 图标

> 以字符串名渲染内置图标的通用组件，支持 `name`（注册表）/ `url`（外链）/ `class`（图标字体）三种模式，并提供纯图标按钮 `IconButton`。

---

**导入**

```tsx
import { Icon, IconButton, registerIcon, iconfontClassNames } from '@easbot/ui';
```

## 基础用法

`name` 模式是默认模式 —— 直接给出图标名即可渲染：

```tsx
import { Icon } from '@easbot/ui';

export default function App() {
  return (
    <div className="flex items-center gap-4">
      <Icon name="info" />
      <Icon name="check-circle" variant="success" size={24} />
      <Icon name="alert-triangle" variant="warning" size={24} />
      <Icon name="x-circle" variant="destructive" size={24} />
    </div>
  );
}
```

`url` 模式渲染为一个 `<img>`：

```tsx
<Icon url="https://example.com/logo.svg" name="logo" size={32} />
```

`class` 模式渲染为一个 `<i>`，用于图标字体（**需先引入 `@easbot/ui/iconfont.css`**，详见「注意事项」）：

```tsx
// ⚠️ 必须先在应用入口 import '@easbot/ui/iconfont.css';
<Icon type="class" clazzName="iconfont icon-search" size={24} />
```

纯图标按钮：

```tsx
import { IconButton } from '@easbot/ui';

<IconButton icon="edit" onClick={() => console.log('编辑')} />;
<IconButton icon="settings" shape="square" size={36} />;
```

自定义注册图标（消费方自己的 SVG 组件）：

```tsx
import type { SVGProps } from 'react';
import { Icon, registerIcon } from '@easbot/ui';

function MyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
    </svg>
  );
}

registerIcon('my-icon', MyIcon);

// ...
<Icon name="my-icon" />;
```

### 变体映射表（非 cva）

`Icon` **不使用 `cva`**：配色由一张普通映射表 `variantColor` 决定（该表未导出，消费方无法从包根 import）。

| variant       | 类名                        |
| ------------- | --------------------------- |
| `default`     | `text-[var(--foreground)]`  |
| `destructive` | `text-[var(--destructive)]` |
| `success`     | `text-[var(--success)]`     |
| `warning`     | `text-[var(--warning)]`     |
| `info`        | `text-[var(--info)]`        |

`IconButton` 的 `shape` 取值：`'circle'`（默认，`rounded-full`）/ `'square'`（`rounded-[var(--radius-md)]`）。

## 属性

## 属性

继承自 `UiMessageProps`。

| 属性         | 类型               | 默认值 | 说明                                        |
| ------------ | ------------------ | ------ | ------------------------------------------- |
| `type?`      | `IconType`         | —      | —                                           |
| `name?`      | `string`           | —      | —                                           |
| `url?`       | `string`           | —      | —                                           |
| `clazzName?` | `string`           | —      | —                                           |
| `variant?`   | `IconVariant`      | —      | // class 模式专用 className，避免与外层冲突 |
| `size?`      | `number \| string` | —      | —                                           |
| `children?`  | `React.ReactNode`  | —      | —                                           |

## 属性（IconButtonProps）

继承自 `Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>`。

| 属性         | 类型                                   | 默认值 | 说明                  |
| ------------ | -------------------------------------- | ------ | --------------------- |
| `icon?`      | `IconProps['name'] \| React.ReactNode` | —      | —                     |
| `iconType?`  | `IconProps['type']`                    | —      | // 图标名或自定义节点 |
| `shape?`     | `'circle' \| 'square'`                 | —      | // 新增：图标类型     |
| `variant?`   | `IconProps['variant']`                 | —      | —                     |
| `size?`      | `number \| string`                     | —      | —                     |
| `disabled?`  | `boolean`                              | —      | —                     |
| `className?` | `string`                               | —      | —                     |
| `children?`  | `ReactNode`                            | —      | —                     |

`IconProps` 继承 `UiMessageProps`（`locale` / `messages`，仅对带 i18n 文案的注册图标生效）。

`IconButtonProps` 继承 `Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>`。

本表只列组件自有属性；此外 `Icon` 还透传任意其它属性给内部元素（`id` / `className` / `aria-*` / `data-*` / `onClick` 等）。

## 内置图标注册表

`src/ui/icon/index.ts` 在**模块加载时**（即 `import '@easbot/ui'` 时）自动注册全部内置图标，共 **158 个名字**：

| 来源                    | 数量 | 命名前缀 | 示例                                                                                                                                      |
| ----------------------- | ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `lucide-react`          | 117  | 无       | `info` / `check-circle` / `alert-triangle` / `x-circle` / `upload` / `settings` / `calendar` / `clock` / `table-export` / `table-refresh` |
| `@radix-ui/react-icons` | 36   | `radix-` | `radix-sun` / `radix-moon` / `radix-person` / `radix-gear` / `radix-upload`                                                               |
| EAS 自定义 SVG          | 5    | `eas-`   | `eas-language` / `eas-refresh` / `eas-moon` / `eas-sun` / `eas-system`                                                                    |

> `lucide-react` 中有大量**语义别名**指向同一个图形（如 `cancel` → `X`、`delete` → `Trash`、`model` / `tenant` / `role` / `permissions` 均 → `Shield` / `Cpu` / `Building`），表格专用图标（`table-add` / `table-delete` / `table-sort-asc` …）也复用 lucide 图形。

`eas-moon` / `eas-sun` / `eas-system` **额外注册进 i18n 注册表**，因此它们的 `aria-label` 与 `<title>` 会读取内置 `icon` 文案域（`darkMode` / `lightMode` / `systemMode`，zh-CN + en-US 双语），并接受 `locale` / `messages` 覆盖。

### 运行时查询与注册

```tsx
import { getGlobalIconRegistry, registerIcon, registerI18nIcon } from '@easbot/ui';

// 查看当前已注册的全部图标名
console.log([...getGlobalIconRegistry().keys()]);
```

- `getGlobalIconRegistry()` 返回全局注册表的 **`Map` 实例本身**（不是副本）—— 可以直接 `get` / `has`，但**不要**直接 `set`（绕过校验）。
- `registerIcon(name, Component)` 注册普通 SVG 组件（类型 `React.ComponentType<React.SVGProps<SVGSVGElement>>`）。
- `registerI18nIcon(name, Component)` 注册**带 i18n 文案**的图标（类型 `React.ComponentType<EasIconComponentProps>`），只有这类组件会收到 `locale` / `messages`。

## 图标字体（`iconfont`）

`iconfontClassNames` 是 **796 个**图标字体类名的字符串数组（形如 `icon-bmr-clickhouse`、`icon-edap-tool-add`），自动生成，**请勿手动修改**。

```tsx
import { Icon, iconfontClassNames } from '@easbot/ui';

iconfontClassNames.map((name) => <Icon key={name} type="class" clazzName={`iconfont ${name}`} />);
```

> ⚠️ **类名清单只是字符串** —— 字形由 iconfont 字体提供。**未引入 `@easbot/ui/iconfont.css` 时 `class` 模式渲染为空白**（`<i>` 元素存在但没有字形）。

## 无障碍

- `Icon` 的根元素是 `<span class="eas-icon">`，带 `display: inline-flex` 与 `line-height: 1`；组件**不设置 `role`**。
- `name` 模式下的 SVG 图标**不统一带 `aria-hidden`**：
  - **lucide** 图标自带 `aria-hidden="true"`（lucide 默认渲染），对读屏是纯装饰。
  - **radix** 图标（`radix-*`）**不设** `aria-hidden` —— 若图标旁没有可见文本，读屏会把 SVG 当作无名称的图形元素播报。
  - **EAS 自定义图标**中 `eas-language` / `eas-refresh` 带 `aria-hidden="true"`；`eas-moon` / `eas-sun` / `eas-system` 反而带 `aria-label` + `<title>`（见下文「带 i18n 文案」）。
  - 消费方自己 `registerIcon` 注册的图标**行为完全取决于实现**。
- `url` 模式渲染 `<img>`，其 `alt` 取 `name`（未传 `name` 时退化为字符串 `'icon'`）—— **务必传 `name`**，否则读屏会念出无意义的「icon」。
- `url` 模式固定注入 `draggable={false}`（禁止拖拽图片）。
- `class` 模式渲染 `<i>` 并**强制注入 `aria-hidden="true"`** —— 图标字体图标永远对读屏隐藏；如需可访问名称，请在外层元素上写 `aria-label` 或包裹文本。
- `variant` 只改**外层 `<span>` 的文字色**，通过 `currentColor` 传递给内部 SVG，因此变体配色同时影响描边与填充。
- `IconButton` 渲染为原生 `<button type="button">`，天然键盘可达；`disabled` 时使用原生 `disabled` 属性并附加 `cursor-not-allowed opacity-50`（**不**用 `pointer-events-none` —— 那会让元素对鼠标完全透明，浏览器命中下层元素，`cursor: not-allowed` 将永不生效）。
- `IconButton` 的焦点指示使用 `outline-none focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2` —— 仅键盘导航时显示，且用 `outline`（绘制在元素之外）而非 `ring`（紧贴边缘会被误读为选中态）。
- `IconButton` 传 `icon` 为**字符串**时，图标尺寸自动取 `size * 0.6`（数字 `size` 时）；传 React 节点时**完全由调用方决定尺寸**。

## 注意事项

- **`class` 模式依赖图标字体**：必须额外 `import '@easbot/ui/iconfont.css';`（包导出面已提供 `./iconfont.css` 子路径）。该文件**不并入** `dist/styles.css`，是 opt-in 产物。
- **`clazzName` 而不是 `className`**：`class` 模式的图标字体类名必须写在 `clazzName` 上（拼写为 `clazzName`），源码会把它与 `restProps.className` 用 `cn()` 合并后写到 `<i>` 上。
- **`type` 会覆盖自动推断**：未显式传 `type` 时，源码按 `url` → `clazzName` → `name` 的顺序推断；若显式传了 `type="name"` 却只给了 `url`，则**不会渲染任何内容**（`inner` 保持 `null`）。
- **`name` 找不到时静默失败**：未注册的名字**不会报错**，只是渲染一个空的 `<span>`。注册表在 `import '@easbot/ui'` 时填充 —— 若绕过包根导入（如只 deep import 源码路径），注册表会是空的。
- **`variant` 不会透传到 DOM**：`IconProps` 的索引签名 `[key: string]: any` 会让解构出的 `variant` 退化为 `any`，源码在解构处**显式标注类型**并把它从 `restProps` 中剔除 —— 因此不会触发 React 未知属性告警。消费方自定义 `Icon` 封装时也应遵循同样做法。
- **`locale` / `messages` 同样不会透传到普通 SVG**：普通 lucide / radix 图标不接收这两个属性（否则 React 会告警），只有 i18n 注册表里的图标会收到。
- **`IconButton` 默认是 ghost 风格**：无静态背景 / 边框 / 阴影，仅 `hover` 时给出 `bg-accent` 反馈 —— 与全库 `CloseButton` / `Button variant="ghost"` 保持一致。需要实体背景请用 `className="bg-muted"` 覆盖（`cn()` 为 twMerge，末位类名优先级最高）。
- **`IconButton` 的 `size` 是像素 / CSS 长度**（默认 `32`），**不是** `Button` 的尺寸 token（`sm` / `md` / `lg`）。
- **`IconButton` 的 `icon` 可以是任意 React 节点**：此时 `variant` 与 `iconType` 对该节点**无效**（只对字符串 `icon` 生效）。
- **`Icon` 的 `children` 只在 `class` 模式有意义**：`name` / `url` 模式下 `children` 被忽略。
- **`Icon` 的 `ref` 指向外层 `<span>`**（不是内部 SVG），源码内部用 `ref as any` 转发。
- **`size` 同时作用于三处**：外层 `<span>` 的 `font-size`、内部 SVG 的 `width` / `height`、`<img>` 的 `width` / `height`。
- **`className` 合并到外层 `<span>`**（`name` / `url` 模式）；`class` 模式下 `className` 会被合并到内部 `<i>` 上。
- **图标数量为 158（去重后）**：117 个 lucide 名字 + 36 个 radix 名字 + 5 个 EAS 名字。lucide 侧存在别名（多个名字指向同一图形），因此**不同名**数量少于实际图形数。

## 主题变量

本组件直接消费以下 CSS 变量（完整清单见 [主题定制](../../theming.md)）：

- `--destructive`
- `--foreground`
- `--info`
- `--radius-md`
- `--success`
- `--warning`

## 导出

### 组件

| 导出名                  | 说明 |
| ----------------------- | ---- |
| `EasIconComponentProps` |      |
| `Icon`                  |      |
| `IconButton`            |      |
| `IconButtonProps`       |      |
| `IconProps`             |      |
| `IconType`              |      |
| `IconVariant`           |      |

### 类型与工具函数

| 导出名                  | 说明 |
| ----------------------- | ---- |
| `getGlobalIconRegistry` |      |
| `iconfontClassNames`    |      |
| `registerI18nIcon`      |      |
| `registerIcon`          |      |
