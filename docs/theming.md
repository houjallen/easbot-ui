# 主题定制

> 本库所有视觉表现（颜色、圆角、尺寸、阴影、动效参数）均由 **CSS 自定义属性**驱动，
> 运行时切换 `data-theme` 即可换肤，**无需重新构建**。

---

## 主题机制

```html
<html data-theme="light">
  <!-- 亮色 -->
  <html data-theme="dark">
    <!-- 暗色 --></html
  ></html
>
```

| 文件                         | 选择器                      | 说明                 |
| ---------------------------- | --------------------------- | -------------------- |
| `src/theme/themes/light.css` | `:root[data-theme='light']` | 亮色主题变量（默认） |
| `src/theme/themes/dark.css`  | `:root[data-theme='dark']`  | 暗色主题变量         |

两套主题文件**变量名完全一致**（各 702 个声明），
构建后随包发布为 `dist/theme-light.css` / `dist/theme-dark.css`，可按需单独引入覆盖。

### 切换方式

```tsx
// 运行时切换
document.documentElement.setAttribute('data-theme', 'dark');
```

### `dark:` 变体的约定

Tailwind 默认的 `dark:` 走 `@media (prefers-color-scheme: dark)`（跟随系统），
与「由 `<html data-theme>` 显式切换」的机制冲突。
本库通过 `@custom-variant dark` 把 `dark:` **重定向**到 `[data-theme='dark']`：

```css
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
```

因此在消费方代码里写 `dark:bg-gray-800` 时，
它跟随的是 `data-theme` 属性，**不是**系统设置。

---

## 覆盖主题变量

### 方式一：直接覆盖 CSS 变量（推荐）

本库**不写内联样式**，所有样式都走 `var(--xxx)`。
因此定制主题只需覆盖变量，**不要**去覆盖类名：

```css
/* 你的全局样式文件，在引入 @easbot/ui/styles.css 之后 */
:root {
  /* 品牌主色 */
  --primary: hsl(262 83% 58%);
  --primary-foreground: hsl(0 0% 100%);
  --ring: hsl(262 83% 58%);

  /* 圆角 */
  --radius: 0.75rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;

  /* 按钮 */
  --button-default: hsl(262 83% 58%);
  --button-default-hover: hsl(262 83% 52%);
}
```

### 方式二：按主题分别覆盖

```css
:root[data-theme='light'] {
  --primary: hsl(262 83% 58%);
}

:root[data-theme='dark'] {
  --primary: hsl(262 90% 70%);
}
```

### 方式三：内联样式覆盖单个元素

```tsx
<Button style={{ '--button-default': 'hsl(200 90% 50%)' } as React.CSSProperties}>自定义</Button>
```

> 需要 TypeScript 时，把自定义属性断言为 `React.CSSProperties`。

---

## 语义 token 与 Tailwind 类

主题文件里的 `--primary` / `--gray-500` 等是**自定义 CSS 变量**，
Tailwind v4 不认识它们。若不注册成 token，`bg-primary` / `text-muted-foreground`
这类**语义类不会生成任何 CSS**（静默失效）。

本库在 `src/theme/styles.css` 里通过 `@theme inline` 完成注册：

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... 共 32 个语义 token */
}
```

因此消费方**可以直接使用**语义类：

```tsx
<div className="bg-primary text-primary-foreground border-border rounded-lg" />
```

### 灰阶 token 必须用 `hsl()` 包裹

主题文件里 `--gray-500` 存的是**裸 HSL 分量**（`240 4% 50%`），
注册时必须写成 `hsl(var(--gray-500))`：

```css
--color-gray-500: hsl(var(--gray-500));
```

直接 `var(--gray-500)` 会生成非法颜色值。

---

## 字体（opt-in）

样式与字体 CSS **一起导出**，**是否启用自定义字体由应用层决定**。

| 产物              | 内容                                                             |
| ----------------- | ---------------------------------------------------------------- |
| `dist/styles.css` | 主题变量 + 原子类；`--font-sans` 带**完整回退栈**                |
| `dist/fonts.css`  | 7 个 `@font-face`（思源黑体 7 个字重）+ `--font-source-han-sans` |

```ts
// 不引入 fonts.css —— 保持系统字体（默认）
import '@easbot/ui/styles.css';

// 引入 fonts.css —— 启用思源黑体
import '@easbot/ui/styles.css';
import '@easbot/ui/fonts.css';
```

> ⚠️ 每个字重约 **8 MB**，需**显式**引入，不要「顺带」打进样式入口。

### ⚠️ 字体文件需自行放置到 `public/font/`

**字体二进制不随 npm 包发布**（否则每个消费方都要多装 60 MB），
需**由应用层复制到自己的静态资源目录**，路径约定与 CSS 里的引用一致：

```
public/
└── font/
    ├── SourceHanSansCN-ExtraLight.otf   # weight 200
    ├── SourceHanSansCN-Light.otf        # weight 300
    ├── SourceHanSansCN-Normal.otf       # weight 400
    ├── SourceHanSansCN-Regular.otf      # weight 450
    ├── SourceHanSansCN-Medium.otf       # weight 500
    ├── SourceHanSansCN-Bold.otf         # weight 700
    ├── SourceHanSansCN-Heavy.otf        # weight 900
    └── LICENSE.txt                       # SIL OFL 1.1 授权声明（必须保留）
```

`dist/fonts.css` 里的 `@font-face` 按 `/font/xxx` 引用它们 ——
Vite / Next.js 等约定 `public/` 映射到站点根路径，故**无需改任何配置**。

> 📌 **字重范围由应用层决定** —— 字体不在 npm 包内，可按需只放 1~2 个常用字重。
>
> 📌 **字重必须一一对应** —— CSS 的 `font-weight` 取自字体自身的
> `OS/2.usWeightClass`（读 OTF 头表实测），**不套用 CSS 关键字近似值**，
> 否则浏览器会做「合成加粗」（faux bold），字形发虚。

### 自定义字体栈

覆盖 `--font-sans` 或 `--font-source-han-sans` 即可，无需改组件库源码：

```css
:root {
  --font-sans: 'MyBrandFont', 'Microsoft YaHei', system-ui, sans-serif;
}
```

> 📌 `--font-sans` 必须写成 **`var(--font-source-han-sans, <完整回退栈>)`** 的**兜底值形式**
> —— 直接写 `var(--font-source-han-sans), system-ui, …` 在变量缺失时会让**整条声明失效**
> （连 `system-ui` 都拿不到）。详见
> [`spec/css-standard.md` §1.7](../spec/css-standard.md)。

---

## 图标字体（opt-in）

`Icon` 组件的 `type="class"` 模式需要图标字体提供字形，同样**由应用层决定是否启用**。

| 产物                | 内容                                              |
| ------------------- | ------------------------------------------------- |
| `dist/iconfont.css` | 796 个图标类的 `content` 映射 + `@font-face` 声明 |

### ⚠️ 图标字体文件需自行放置到 `public/icon/`

**字体二进制不随 npm 包发布**，需复制到静态资源目录：

```
public/
└── icon/
    ├── iconfont.woff      # 主格式（覆盖 IE11+ 全部现代浏览器）
    ├── iconfont.ttf       # 兜底格式（老 Safari）
    ├── symbol.ttf         # officefont 的 Symbol 家族
    └── wingding.ttf       # officefont 的 Wingdings 家族
```

`dist/iconfont.css` 按 `/icon/xxx` 引用它们。

```ts
import '@easbot/ui/styles.css';
import '@easbot/ui/iconfont.css'; // ← 启用图标字体
```

```tsx
import { Icon, iconfontClassNames } from '@easbot/ui';

<Icon type="class" clazzName="iconfont icon-search" size={24} />;

// 796 个可用类名
iconfontClassNames.map((name) => <Icon key={name} type="class" clazzName={`iconfont ${name}`} />);
```

> ⚠️ **不引入 `iconfont.css` 时 `class` 模式渲染为空白** ——
> `name` / `url` 模式不受影响。
>
> 📌 图标字体是**独立产物**，不在 `dist/styles.css` 内 ——
> 需**显式**引入，不要「顺带」打进样式入口。

---

## 主题变量单独引入（可选）

`dist/styles.css` **已包含** light / dark 两套主题变量。
若只想**覆盖主题变量**、保留自己已有的原子类，可单独引入：

```ts
import '@easbot/ui/theme-light.css'; // 或 theme-dark.css
```

| 产物                   | 内容                                 |
| ---------------------- | ------------------------------------ |
| `dist/theme-light.css` | `:root[data-theme='light']` 主题变量 |
| `dist/theme-dark.css`  | `:root[data-theme='dark']` 主题变量  |

> 这两个文件是**特别提供**的可选产物 —— 常规用法只需 `import '@easbot/ui/styles.css';`。

---

## 完整变量清单

> 共 **692** 个变量声明，light / dark 一一对应。
> 下表按主题文件的小节分组，值列可直接复制到覆盖样式里。

### 基础色调

| 变量           | 亮色值            | 暗色值            |
| -------------- | ----------------- | ----------------- |
| `--background` | `hsl(0 0% 100%)`  | `hsl(240 10% 4%)` |
| `--foreground` | `hsl(240 10% 4%)` | `hsl(0 0% 100%)`  |

### 渐变效果

| 变量              | 亮色值             | 暗色值             |
| ----------------- | ------------------ | ------------------ |
| `--gradient-from` | `hsl(210 40% 96%)` | `hsl(210 40% 96%)` |
| `--gradient-to`   | `hsl(0 0% 100%)`   | `hsl(0 0% 100%)`   |

### 灰度变量

| 变量         | 亮色值       | 暗色值       |
| ------------ | ------------ | ------------ |
| `--gray-50`  | `240 5% 98%` | `240 6% 5%`  |
| `--gray-100` | `240 5% 96%` | `240 4% 9%`  |
| `--gray-200` | `240 4% 90%` | `240 4% 16%` |
| `--gray-300` | `240 4% 84%` | `240 4% 30%` |
| `--gray-400` | `240 4% 70%` | `240 4% 50%` |
| `--gray-500` | `240 4% 50%` | `240 4% 70%` |
| `--gray-600` | `240 4% 30%` | `240 4% 84%` |
| `--gray-700` | `240 4% 16%` | `240 4% 90%` |
| `--gray-800` | `240 4% 9%`  | `240 5% 96%` |
| `--gray-900` | `240 6% 5%`  | `240 5% 98%` |

### 圆角变量

| 变量            | 亮色值     | 暗色值     |
| --------------- | ---------- | ---------- |
| `--radius-sm`   | `0.375rem` | `0.375rem` |
| `--radius-md`   | `0.5rem`   | `0.5rem`   |
| `--radius-lg`   | `0.75rem`  | `0.75rem`  |
| `--radius-full` | `9999px`   | `9999px`   |
| `--radius`      | `0.5rem`   | `0.5rem`   |

### 主色调

| 变量                   | 亮色值           | 暗色值                   |
| ---------------------- | ---------------- | ------------------------ |
| `--primary`            | `hsl(240 6% 5%)` | `hsl(210 40% 98%)`       |
| `--primary-foreground` | `hsl(0 0% 100%)` | `hsl(222.2 47.4% 11.2%)` |

### 次要色调

| 变量                     | 亮色值            | 暗色值            |
| ------------------------ | ----------------- | ----------------- |
| `--secondary`            | `hsl(240 5% 96%)` | `hsl(240 4% 9%)`  |
| `--secondary-foreground` | `hsl(240 6% 5%)`  | `hsl(240 5% 98%)` |

### 破坏性操作

| 变量                       | 亮色值           | 暗色值           |
| -------------------------- | ---------------- | ---------------- |
| `--destructive`            | `hsl(0 84% 60%)` | `hsl(0 84% 60%)` |
| `--destructive-foreground` | `hsl(0 0% 100%)` | `hsl(0 0% 96%)`  |

### 状态颜色 - 更现代的色调

| 变量                   | 亮色值             | 暗色值             |
| ---------------------- | ------------------ | ------------------ |
| `--success`            | `hsl(145 80% 42%)` | `hsl(145 80% 42%)` |
| `--success-foreground` | `hsl(145 80% 20%)` | `hsl(144 70% 98%)` |
| `--warning`            | `hsl(45 93% 47%)`  | `hsl(45 93% 47%)`  |
| `--warning-foreground` | `hsl(45 93% 25%)`  | `hsl(45 90% 96%)`  |
| `--error`              | `hsl(0 84% 60%)`   | `hsl(0 84% 60%)`   |
| `--error-foreground`   | `hsl(0 84% 20%)`   | `hsl(0 0% 98%)`    |
| `--info`               | `hsl(210 92% 45%)` | `hsl(210 92% 45%)` |
| `--info-foreground`    | `hsl(210 92% 20%)` | `hsl(210 40% 98%)` |

### 卡片弹出层

| 变量                   | 亮色值              | 暗色值              |
| ---------------------- | ------------------- | ------------------- |
| `--popover`            | `var(--background)` | `var(--background)` |
| `--popover-foreground` | `var(--foreground)` | `var(--foreground)` |

### 遮罩层

| 变量        | 亮色值                       | 暗色值                       |
| ----------- | ---------------------------- | ---------------------------- |
| `--overlay` | `hsla(var(--gray-900), 0.8)` | `hsla(var(--gray-900), 0.9)` |

### 强调色

| 变量                  | 亮色值                 | 暗色值                 |
| --------------------- | ---------------------- | ---------------------- |
| `--accent`            | `hsl(var(--gray-100))` | `hsl(var(--gray-100))` |
| `--accent-foreground` | `hsl(var(--gray-900))` | `hsl(var(--gray-900))` |

### 静音/禁用状态

| 变量                 | 亮色值                 | 暗色值                 |
| -------------------- | ---------------------- | ---------------------- |
| `--muted`            | `hsl(var(--gray-100))` | `hsl(var(--gray-100))` |
| `--muted-foreground` | `hsl(var(--gray-500))` | `hsl(var(--gray-500))` |
| `--muted-background` | `hsl(var(--gray-100))` | `hsl(var(--gray-100))` |
| `--muted-border`     | `hsl(var(--gray-100))` | `hsl(var(--gray-100))` |

### 边框和输入框

| 变量                          | 亮色值                                                      | 暗色值                                                      |
| ----------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `--border`                    | `hsl(var(--gray-200))`                                      | `hsl(var(--gray-200))`                                      |
| `--input`                     | `color-mix(in srgb, hsl(var(--gray-100)) 40%, transparent)` | `color-mix(in srgb, hsl(var(--gray-100)) 20%, transparent)` |
| `--input-hover`               | `color-mix(in srgb, hsl(var(--gray-100)) 60%, transparent)` | `color-mix(in srgb, hsl(var(--gray-100)) 30%, transparent)` |
| `--input-focus`               | `var(--primary)`                                            | `var(--primary)`                                            |
| `--input-border-width`        | `1px`                                                       | `1px`                                                       |
| `--input-border-color`        | `hsl(var(--gray-400))`                                      | `hsl(var(--gray-400))`                                      |
| `--input-border-hover-color`  | `hsl(var(--gray-500))`                                      | `hsl(var(--gray-500))`                                      |
| `--input-border-focus-color`  | `var(--primary)`                                            | `var(--primary)`                                            |
| `--input-disabled`            | `hsl(var(--gray-100))`                                      | `hsl(var(--gray-100))`                                      |
| `--input-readonly`            | `hsl(var(--gray-100))`                                      | `hsl(var(--gray-100))`                                      |
| `--input-disabled-foreground` | `hsl(var(--gray-500))`                                      | `hsl(var(--gray-500))`                                      |
| `--ring`                      | `var(--primary)`                                            | `var(--primary)`                                            |

### 品牌色

| 变量                   | 亮色值                 | 暗色值                 |
| ---------------------- | ---------------------- | ---------------------- |
| `--brand-black`        | `hsl(var(--gray-900))` | `hsl(var(--gray-900))` |
| `--brand-white`        | `hsl(var(--gray-50))`  | `hsl(var(--gray-50))`  |
| `--brand-neutrals-100` | `hsl(var(--gray-100))` | `hsl(var(--gray-100))` |
| `--brand-neutrals-300` | `hsl(var(--gray-300))` | `hsl(var(--gray-300))` |
| `--brand-neutrals-600` | `hsl(var(--gray-600))` | `hsl(var(--gray-600))` |
| `--brand-neutrals-700` | `hsl(var(--gray-700))` | `hsl(var(--gray-700))` |
| `--brand-neutrals-800` | `hsl(var(--gray-800))` | `hsl(var(--gray-800))` |

### 环形效果

| 变量            | 亮色值          | 暗色值              |
| --------------- | --------------- | ------------------- |
| `--ring-offset` | `hsl(0 0% 98%)` | `hsl(240 10% 3.9%)` |

### 按钮样式

| 变量                                       | 亮色值                                                               | 暗色值                                                               |
| ------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `--button-default`                         | `var(--primary)`                                                     | `var(--primary)`                                                     |
| `--button-default-foreground`              | `var(--primary-foreground)`                                          | `var(--primary-foreground)`                                          |
| `--button-default-hover`                   | `color-mix(in srgb, var(--primary) 95%, transparent)`                | `color-mix(in srgb, var(--primary) 85%, transparent)`                |
| `--button-default-active`                  | `color-mix(in srgb, var(--primary) 90%, transparent)`                | `color-mix(in srgb, var(--primary) 70%, transparent)`                |
| `--button-default-disabled`                | `color-mix(in srgb, var(--primary) 50%, transparent)`                | `color-mix(in srgb, var(--primary) 50%, transparent)`                |
| `--button-default-disabled-foreground`     | `color-mix(in srgb, var(--primary-foreground) 50%, transparent)`     | `color-mix(in srgb, var(--primary-foreground) 50%, transparent)`     |
| `--button-primary`                         | `var(--primary)`                                                     | `var(--primary)`                                                     |
| `--button-primary-foreground`              | `var(--primary-foreground)`                                          | `var(--primary-foreground)`                                          |
| `--button-primary-hover`                   | `color-mix(in srgb, var(--primary) 90%, transparent)`                | `color-mix(in srgb, var(--primary) 90%, transparent)`                |
| `--button-primary-active`                  | `color-mix(in srgb, var(--primary) 80%, transparent)`                | `color-mix(in srgb, var(--primary) 80%, transparent)`                |
| `--button-primary-disabled`                | `color-mix(in srgb, var(--primary) 50%, transparent)`                | `color-mix(in srgb, var(--primary) 50%, transparent)`                |
| `--button-primary-disabled-foreground`     | `color-mix(in srgb, var(--primary-foreground) 50%, transparent)`     | `color-mix(in srgb, var(--primary-foreground) 50%, transparent)`     |
| `--button-secondary`                       | `var(--secondary)`                                                   | `var(--secondary)`                                                   |
| `--button-secondary-foreground`            | `var(--secondary-foreground)`                                        | `var(--secondary-foreground)`                                        |
| `--button-secondary-hover`                 | `color-mix(in srgb, var(--secondary) 95%, transparent)`              | `color-mix(in srgb, var(--secondary) 85%, transparent)`              |
| `--button-secondary-active`                | `color-mix(in srgb, var(--secondary) 90%, transparent)`              | `color-mix(in srgb, var(--secondary) 70%, transparent)`              |
| `--button-secondary-disabled`              | `color-mix(in srgb, var(--secondary) 50%, transparent)`              | `color-mix(in srgb, var(--secondary) 50%, transparent)`              |
| `--button-secondary-disabled-foreground`   | `color-mix(in srgb, var(--secondary-foreground) 50%, transparent)`   | `color-mix(in srgb, var(--secondary-foreground) 50%, transparent)`   |
| `--button-accent`                          | `var(--accent)`                                                      | `var(--accent)`                                                      |
| `--button-accent-foreground`               | `var(--accent-foreground)`                                           | `var(--accent-foreground)`                                           |
| `--button-accent-active`                   | `color-mix(in srgb, hsl(var(--gray-100)) 80%, transparent)`          | `color-mix(in srgb, var(--accent) 15%, transparent)`                 |
| `--button-accent-disabled`                 | `color-mix(in srgb, hsl(var(--gray-100)) 50%, transparent)`          | `color-mix(in srgb, hsl(var(--gray-100)) 50%, transparent)`          |
| `--button-accent-disabled-foreground`      | `color-mix(in srgb, hsl(var(--gray-900)) 50%, transparent)`          | `color-mix(in srgb, hsl(var(--gray-900)) 50%, transparent)`          |
| `--button-destructive`                     | `var(--destructive)`                                                 | `var(--destructive)`                                                 |
| `--button-destructive-foreground`          | `var(--destructive-foreground)`                                      | `var(--destructive-foreground)`                                      |
| `--button-destructive-disabled`            | `color-mix(in srgb, var(--destructive) 50%, transparent)`            | `color-mix(in srgb, var(--destructive) 50%, transparent)`            |
| `--button-destructive-disabled-foreground` | `color-mix(in srgb, var(--destructive-foreground) 50%, transparent)` | `color-mix(in srgb, var(--destructive-foreground) 50%, transparent)` |
| `--button-focus-ring`                      | `var(--primary)`                                                     | `var(--primary)`                                                     |
| `--button-focus-ring-offset`               | `var(--background)`                                                  | `var(--background)`                                                  |

### 按钮悬浮和激活状态

| 变量                          | 亮色值                                                      | 暗色值                                                    |
| ----------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| `--button-destructive-hover`  | `color-mix(in srgb, var(--destructive) 95%, transparent)`   | `color-mix(in srgb, var(--destructive) 90%, transparent)` |
| `--button-destructive-active` | `color-mix(in srgb, var(--destructive) 90%, transparent)`   | `color-mix(in srgb, var(--destructive) 80%, transparent)` |
| `--button-success-hover`      | `color-mix(in srgb, var(--success) 95%, transparent)`       | `color-mix(in srgb, var(--success) 85%, transparent)`     |
| `--button-success-active`     | `color-mix(in srgb, var(--success) 90%, transparent)`       | `color-mix(in srgb, var(--success) 70%, transparent)`     |
| `--button-warning-hover`      | `color-mix(in srgb, var(--warning) 95%, transparent)`       | `color-mix(in srgb, var(--warning) 85%, transparent)`     |
| `--button-warning-active`     | `color-mix(in srgb, var(--warning) 90%, transparent)`       | `color-mix(in srgb, var(--warning) 70%, transparent)`     |
| `--button-accent-hover`       | `color-mix(in srgb, hsl(var(--gray-100)) 90%, transparent)` | `color-mix(in srgb, var(--accent) 20%, transparent)`      |

### 复选框样式

| 变量                             | 亮色值                                       | 暗色值                                       |
| -------------------------------- | -------------------------------------------- | -------------------------------------------- |
| `--checkbox-default`             | `var(--primary)`                             | `var(--primary)`                             |
| `--checkbox-default-foreground`  | `var(--primary-foreground)`                  | `var(--primary-foreground)`                  |
| `--checkbox-border`              | `var(--border)`                              | `var(--border)`                              |
| `--checkbox-disabled`            | `hsl(var(--gray-100))`                       | `hsl(var(--gray-100))`                       |
| `--checkbox-disabled-foreground` | `hsl(var(--gray-500))`                       | `hsl(var(--gray-500))`                       |
| `--checkbox-hover-overlay`       | `color-mix(in srgb, black 8%, transparent)`  | `color-mix(in srgb, white 15%, transparent)` |
| `--checkbox-active-overlay`      | `color-mix(in srgb, black 15%, transparent)` | `color-mix(in srgb, white 25%, transparent)` |
| `--checkbox-focus-ring`          | `var(--primary)`                             | `var(--primary)`                             |
| `--checkbox-focus-ring-offset`   | `var(--background)`                          | `var(--background)`                          |
| `--checkbox-checked-bg`          | `var(--primary)`                             | `var(--primary)`                             |
| `--checkbox-checked-border`      | `var(--primary)`                             | `var(--primary)`                             |

### 表单和输入框状态

| 变量                        | 亮色值                      | 暗色值                      |
| --------------------------- | --------------------------- | --------------------------- |
| `--form-error`              | `var(--error)`              | `var(--error)`              |
| `--form-error-foreground`   | `var(--error-foreground)`   | `var(--error-foreground)`   |
| `--form-success`            | `var(--success)`            | `var(--success)`            |
| `--form-success-foreground` | `var(--success-foreground)` | `var(--success-foreground)` |
| `--form-warning`            | `var(--warning)`            | `var(--warning)`            |
| `--form-warning-foreground` | `var(--warning-foreground)` | `var(--warning-foreground)` |
| `--form-info`               | `var(--info)`               | `var(--info)`               |
| `--form-info-foreground`    | `var(--info-foreground)`    | `var(--info-foreground)`    |
| `--form-label`              | `var(--foreground)`         | `var(--foreground)`         |
| `--form-description`        | `var(--muted-foreground)`   | `var(--muted-foreground)`   |
| `--form-placeholder`        | `var(--muted-foreground)`   | `var(--muted-foreground)`   |
| `--form-error-message`      | `var(--error)`              | `var(--error)`              |
| `--form-success-message`    | `var(--success)`            | `var(--success)`            |
| `--form-warning-message`    | `var(--warning)`            | `var(--warning)`            |
| `--form-info-message`       | `var(--info)`               | `var(--info)`               |

### 标签样式

| 变量                  | 亮色值                    | 暗色值                    |
| --------------------- | ------------------------- | ------------------------- |
| `--label-text`        | `var(--foreground)`       | `var(--foreground)`       |
| `--label-disabled`    | `hsl(var(--gray-500))`    | `hsl(var(--gray-500))`    |
| `--label-required`    | `var(--destructive)`      | `var(--destructive)`      |
| `--label-description` | `var(--muted-foreground)` | `var(--muted-foreground)` |

### 卡片样式

| 变量                       | 亮色值                                                      | 暗色值                                                      |
| -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `--card`                   | `var(--background)`                                         | `var(--background)`                                         |
| `--card-background`        | `var(--background)`                                         | `var(--background)`                                         |
| `--card-foreground`        | `var(--foreground)`                                         | `var(--foreground)`                                         |
| `--card-border`            | `var(--border)`                                             | `var(--border)`                                             |
| `--card-hover`             | `var(--accent)`                                             | `var(--accent)`                                             |
| `--card-hover-foreground`  | `var(--accent-foreground)`                                  | `var(--accent-foreground)`                                  |
| `--card-active`            | `color-mix(in srgb, hsl(var(--gray-100)) 80%, transparent)` | `color-mix(in srgb, hsl(var(--gray-100)) 80%, transparent)` |
| `--card-active-foreground` | `var(--accent-foreground)`                                  | `var(--accent-foreground)`                                  |
| `--card-description`       | `hsl(var(--gray-600))`                                      | `hsl(var(--gray-400))`                                      |
| `--card-content`           | `var(--foreground)`                                         | `var(--foreground)`                                         |
| `--card-title`             | `var(--foreground)`                                         | `var(--foreground)`                                         |
| `--card-hover-shadow`      | `0 4px 12px hsl(var(--gray-900) / 12%)`                     | `0 4px 12px hsl(0 0% 0% / 40%)`                             |
| `--card-disabled-opacity`  | `0.5`                                                       | `0.5`                                                       |
| `--card-ripple-color`      | `var(--foreground)`                                         | `var(--foreground)`                                         |

### 导航菜单

| 变量                                      | 亮色值                                               | 暗色值                                               |
| ----------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `--navigation-menu-item-hover-bg`         | `var(--accent)`                                      | `var(--accent)`                                      |
| `--navigation-menu-item-hover-fg`         | `var(--accent-foreground)`                           | `var(--accent-foreground)`                           |
| `--navigation-menu-item-active-bg`        | `color-mix(in srgb, var(--accent) 80%, transparent)` | `color-mix(in srgb, var(--accent) 80%, transparent)` |
| `--navigation-menu-item-active-fg`        | `var(--accent-foreground)`                           | `var(--accent-foreground)`                           |
| `--navigation-menu-item-selected-bg`      | `var(--primary)`                                     | `var(--primary)`                                     |
| `--navigation-menu-item-selected-fg`      | `var(--primary-foreground)`                          | `var(--primary-foreground)`                          |
| `--navigation-menu-item-disabled-opacity` | `0.5`                                                | `0.5`                                                |
| `--navigation-menu-separator-color`       | `var(--border)`                                      | `var(--border)`                                      |
| `--navigation-menu-trigger-color`         | `var(--foreground)`                                  | `var(--foreground)`                                  |

### Menubar 组件样式

| 变量                          | 亮色值             | 暗色值             |
| ----------------------------- | ------------------ | ------------------ |
| `--menubar-height`            | `2.5rem`           | `2.5rem`           |
| `--menubar-radius`            | `var(--radius-md)` | `var(--radius-md)` |
| `--menubar-item-radius`       | `var(--radius-sm)` | `var(--radius-sm)` |
| `--menubar-item-font-size`    | `0.875rem`         | `0.875rem`         |
| `--menubar-content-min-width` | `12rem`            | `12rem`            |
| `--menubar-content-radius`    | `var(--radius-md)` | `var(--radius-md)` |
| `--menubar-submenu-radius`    | `var(--radius-md)` | `var(--radius-md)` |
| `--menubar-padding`           | `0.25rem`          | `0.25rem`          |
| `--menubar-item-spacing`      | `0.25rem`          | `0.25rem`          |
| `--menubar-item-padding-x`    | `0.75rem`          | `0.75rem`          |
| `--menubar-item-padding-y`    | `0.375rem`         | `0.375rem`         |
| `--menubar-submenu-min-width` | `8rem`             | `8rem`             |
| `--menubar-submenu-padding`   | `0.25rem`          | `0.25rem`          |
| `--menubar-content-padding`   | `0.25rem`          | `0.25rem`          |

### Avatar

| 变量                    | 亮色值                    | 暗色值                    |
| ----------------------- | ------------------------- | ------------------------- |
| `--avatar-border-width` | `2px`                     | `2px`                     |
| `--avatar-border-color` | `var(--background)`       | `var(--background)`       |
| `--avatar-background`   | `var(--muted)`            | `var(--muted)`            |
| `--avatar-foreground`   | `var(--muted-foreground)` | `var(--muted-foreground)` |

### Avatar Sizes

| 变量               | 亮色值   | 暗色值   |
| ------------------ | -------- | -------- |
| `--avatar-size-sm` | `2rem`   | `2rem`   |
| `--avatar-size-md` | `2.5rem` | `2.5rem` |
| `--avatar-size-lg` | `3rem`   | `3rem`   |

### Avatar Shapes

| 变量                     | 亮色值             | 暗色值             |
| ------------------------ | ------------------ | ------------------ |
| `--avatar-radius-circle` | `9999px`           | `9999px`           |
| `--avatar-radius-square` | `var(--radius-md)` | `var(--radius-md)` |

### Avatar 状态指示器

| 变量                      | 亮色值                        | 暗色值                        |
| ------------------------- | ----------------------------- | ----------------------------- |
| `--avatar-status-size`    | `0.75rem`                     | `0.75rem`                     |
| `--avatar-status-border`  | `2px solid var(--background)` | `2px solid var(--background)` |
| `--avatar-status-online`  | `var(--success)`              | `var(--success)`              |
| `--avatar-status-offline` | `var(--muted)`                | `var(--muted)`                |
| `--avatar-status-busy`    | `var(--destructive)`          | `var(--destructive)`          |
| `--avatar-status-away`    | `var(--warning)`              | `var(--warning)`              |

### Avatar Fallback

| 变量                            | 亮色值                    | 暗色值                    |
| ------------------------------- | ------------------------- | ------------------------- |
| `--avatar-fallback-background`  | `var(--muted)`            | `var(--muted)`            |
| `--avatar-fallback-foreground`  | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--avatar-fallback-font-size`   | `var(--text-sm)`          | `var(--text-sm)`          |
| `--avatar-fallback-font-weight` | `500`                     | `500`                     |

### Sheet 样式

| 变量                                 | 亮色值                                                                                                                | 暗色值                                                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `--sheet-overlay`                    | `color-mix(in srgb, black 80%, transparent)`                                                                          | `color-mix(in srgb, black 80%, transparent)`                                                                           |
| `--sheet-background`                 | `var(--background)`                                                                                                   | `var(--background)`                                                                                                    |
| `--sheet-foreground`                 | `var(--foreground)`                                                                                                   | `var(--foreground)`                                                                                                    |
| `--sheet-border`                     | `var(--border)`                                                                                                       | `var(--border)`                                                                                                        |
| `--sheet-shadow`                     | `0 4px 6px -1px color-mix(in srgb, black 10%, transparent), 0 2px 4px -1px color-mix(in srgb, black 6%, transparent)` | `0 4px 6px -1px color-mix(in srgb, black 20%, transparent), 0 2px 4px -1px color-mix(in srgb, black 10%, transparent)` |
| `--sheet-close-button-border-radius` | `2px`                                                                                                                 | `2px`                                                                                                                  |
| `--sheet-close-button-size`          | `16px`                                                                                                                | `16px`                                                                                                                 |

### Slider滑块样式

| 变量                        | 亮色值              | 暗色值              |
| --------------------------- | ------------------- | ------------------- |
| `--slider-thumb-size`       | `1.25rem`           | `1.25rem`           |
| `--slider-track-height`     | `0.5rem`            | `0.5rem`            |
| `--slider-track-background` | `var(--muted)`      | `var(--muted)`      |
| `--slider-range-background` | `var(--primary)`    | `var(--primary)`    |
| `--slider-thumb-background` | `var(--background)` | `var(--background)` |
| `--slider-thumb-border`     | `var(--primary)`    | `var(--primary)`    |
| `--slider-thumb-focus-ring` | `var(--ring)`       | `var(--ring)`       |
| `--slider-disabled-opacity` | `0.5`               | `0.5`               |

### Spinner 样式

| 变量                           | 亮色值                      | 暗色值                      |
| ------------------------------ | --------------------------- | --------------------------- |
| `--spinner-primary`            | `var(--primary)`            | `var(--primary)`            |
| `--spinner-primary-foreground` | `var(--primary-foreground)` | `var(--primary-foreground)` |
| `--spinner-destructive`        | `var(--destructive)`        | `var(--destructive)`        |
| `--spinner-success`            | `var(--success)`            | `var(--success)`            |
| `--spinner-warning`            | `var(--warning)`            | `var(--warning)`            |
| `--spinner-size-sm`            | `1rem`                      | `1rem`                      |
| `--spinner-size-md`            | `1.5rem`                    | `1.5rem`                    |
| `--spinner-size-lg`            | `2rem`                      | `2rem`                      |

### Skeleton 样式

| 变量                            | 亮色值                                        | 暗色值                                                       |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| `--skeleton-background`         | `var(--muted)`                                | `var(--muted)`                                               |
| `--skeleton-highlight`          | `color-mix(in srgb, var(--muted) 80%, white)` | `color-mix(in srgb, var(--muted) 80%, hsl(var(--gray-800)))` |
| `--skeleton-border-radius`      | `var(--radius-md)`                            | `var(--radius-md)`                                           |
| `--skeleton-animation-duration` | `1.5s`                                        | `1.5s`                                                       |

### Switch 样式

| 变量                                | 亮色值                                                 | 暗色值                                                 |
| ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `--switch-checked-background`       | `var(--primary)`                                       | `var(--primary)`                                       |
| `--switch-unchecked-background`     | `var(--input)`                                         | `var(--input)`                                         |
| `--switch-thumb-background`         | `var(--background)`                                    | `var(--background)`                                    |
| `--switch-focus-ring`               | `var(--ring)`                                          | `var(--ring)`                                          |
| `--switch-disabled-opacity`         | `0.5`                                                  | `0.5`                                                  |
| `--switch-thumb-shadow`             | `0 1px 2px color-mix(in srgb, black 10%, transparent)` | `0 1px 2px color-mix(in srgb, black 10%, transparent)` |
| `--switch-focus-ring-offset`        | `var(--ring-offset)`                                   | `var(--ring-offset)`                                   |
| `--switch-hover-background`         | `color-mix(in srgb, var(--accent) 20%, transparent)`   | `color-mix(in srgb, var(--accent) 20%, transparent)`   |
| `--switch-hover-border`             | `hsl(var(--gray-600))`                                 | `hsl(var(--gray-400))`                                 |
| `--switch-active-background`        | `color-mix(in srgb, var(--accent) 30%, transparent)`   | `color-mix(in srgb, var(--accent) 30%, transparent)`   |
| `--switch-checked-hover-background` | `color-mix(in srgb, var(--primary) 90%, transparent)`  | `color-mix(in srgb, var(--primary) 90%, transparent)`  |

### Switch 尺寸变量

| 变量                     | 亮色值     | 暗色值     |
| ------------------------ | ---------- | ---------- |
| `--switch-sm-height`     | `0.875rem` | `0.875rem` |
| `--switch-sm-width`      | `1.5rem`   | `1.5rem`   |
| `--switch-sm-thumb-size` | `0.5rem`   | `0.5rem`   |
| `--switch-md-height`     | `1.5rem`   | `1.5rem`   |
| `--switch-md-width`      | `2.75rem`  | `2.75rem`  |
| `--switch-md-thumb-size` | `1rem`     | `1rem`     |
| `--switch-lg-height`     | `1.75rem`  | `1.75rem`  |
| `--switch-lg-width`      | `3.25rem`  | `3.25rem`  |
| `--switch-lg-thumb-size` | `1.25rem`  | `1.25rem`  |

### 默认使用中等尺寸

| 变量                  | 亮色值                        | 暗色值                        |
| --------------------- | ----------------------------- | ----------------------------- |
| `--switch-height`     | `var(--switch-md-height)`     | `var(--switch-md-height)`     |
| `--switch-width`      | `var(--switch-md-width)`      | `var(--switch-md-width)`      |
| `--switch-thumb-size` | `var(--switch-md-thumb-size)` | `var(--switch-md-thumb-size)` |

### Table 样式

| 变量                         | 亮色值                                                        | 暗色值                                                         |
| ---------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| `--table-border`             | `var(--border)`                                               | `var(--border)`                                                |
| `--table-header-background`  | `var(--background)`                                           | `var(--background)`                                            |
| `--table-header-foreground`  | `var(--foreground)`                                           | `var(--foreground)`                                            |
| `--table-row-hover`          | `var(--muted)`                                                | `var(--muted)`                                                 |
| `--table-row-selected`       | `var(--muted)`                                                | `var(--muted)`                                                 |
| `--table-row-striped`        | `color-mix(in srgb, var(--muted-foreground) 5%, transparent)` | `color-mix(in srgb, var(--muted-foreground) 10%, transparent)` |
| `--table-footer-background`  | `var(--muted)`                                                | `var(--muted)`                                                 |
| `--table-caption-foreground` | `var(--muted-foreground)`                                     | `var(--muted-foreground)`                                      |
| `--table-font-size`          | `var(--text-sm)`                                              | `var(--text-sm)`                                               |

### Tabs 样式

| 变量                      | 亮色值                    | 暗色值                    |
| ------------------------- | ------------------------- | ------------------------- |
| `--tabs-border`           | `var(--border)`           | `var(--border)`           |
| `--tabs-text`             | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--tabs-text-active`      | `var(--foreground)`       | `var(--foreground)`       |
| `--tabs-text-hover`       | `var(--foreground)`       | `var(--foreground)`       |
| `--tabs-indicator`        | `var(--primary)`          | `var(--primary)`          |
| `--tabs-gap`              | `1.5rem`                  | `1.5rem`                  |
| `--tabs-border-width`     | `1px`                     | `1px`                     |
| `--tabs-indicator-height` | `2px`                     | `2px`                     |
| `--tabs-ring`             | `var(--ring)`             | `var(--ring)`             |
| `--tabs-ring-offset`      | `var(--background)`       | `var(--background)`       |

### Textarea 样式

| 变量                          | 亮色值                    | 暗色值                    |
| ----------------------------- | ------------------------- | ------------------------- |
| `--textarea-border`           | `var(--input)`            | `var(--input)`            |
| `--textarea-background`       | `var(--background)`       | `var(--background)`       |
| `--textarea-foreground`       | `var(--foreground)`       | `var(--foreground)`       |
| `--textarea-placeholder`      | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--textarea-ring`             | `var(--ring)`             | `var(--ring)`             |
| `--textarea-ring-offset`      | `var(--background)`       | `var(--background)`       |
| `--textarea-disabled-opacity` | `0.5`                     | `0.5`                     |
| `--textarea-min-height`       | `80px`                    | `80px`                    |
| `--textarea-padding`          | `0.5rem 0.75rem`          | `0.5rem 0.75rem`          |

### Toggle 样式

| 变量                                | 亮色值                     | 暗色值                     |
| ----------------------------------- | -------------------------- | -------------------------- |
| `--toggle-background`               | `transparent`              | `transparent`              |
| `--toggle-hover-background`         | `var(--muted)`             | `var(--muted)`             |
| `--toggle-hover-foreground`         | `var(--muted-foreground)`  | `var(--muted-foreground)`  |
| `--toggle-active-background`        | `var(--accent)`            | `var(--accent)`            |
| `--toggle-active-foreground`        | `var(--accent-foreground)` | `var(--accent-foreground)` |
| `--toggle-outline-border`           | `var(--input)`             | `var(--input)`             |
| `--toggle-outline-hover-background` | `var(--accent)`            | `var(--accent)`            |
| `--toggle-outline-hover-foreground` | `var(--accent-foreground)` | `var(--accent-foreground)` |
| `--toggle-ring`                     | `var(--ring)`              | `var(--ring)`              |
| `--toggle-ring-offset`              | `var(--background)`        | `var(--background)`        |
| `--toggle-disabled-opacity`         | `0.5`                      | `0.5`                      |

### Toast 样式

| 变量                             | 亮色值                                                    | 暗色值                                                    |
| -------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `--toast-background`             | `var(--background)`                                       | `var(--background)`                                       |
| `--toast-foreground`             | `var(--foreground)`                                       | `var(--foreground)`                                       |
| `--toast-border`                 | `var(--border)`                                           | `var(--border)`                                           |
| `--toast-destructive-background` | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--toast-destructive-border`     | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--toast-destructive-foreground` | `var(--destructive-foreground)`                           | `var(--destructive-foreground)`                           |
| `--toast-success-border`         | `var(--success)`                                          | `var(--success)`                                          |
| `--toast-success-background`     | `var(--success)`                                          | `var(--success)`                                          |
| `--toast-success-foreground`     | `var(--success-foreground)`                               | `var(--success-foreground)`                               |
| `--toast-warning-border`         | `var(--warning)`                                          | `var(--warning)`                                          |
| `--toast-warning-background`     | `var(--warning)`                                          | `var(--warning)`                                          |
| `--toast-warning-foreground`     | `var(--warning-foreground)`                               | `var(--warning-foreground)`                               |
| `--toast-info-border`            | `var(--info)`                                             | `var(--info)`                                             |
| `--toast-info-background`        | `var(--info)`                                             | `var(--info)`                                             |
| `--toast-info-foreground`        | `var(--info-foreground)`                                  | `var(--info-foreground)`                                  |
| `--toast-error-border`           | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--toast-error-background`       | `color-mix(in srgb, var(--destructive) 10%, transparent)` | `color-mix(in srgb, var(--destructive) 10%, transparent)` |
| `--toast-error-foreground`       | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--toast-padding`                | `0.75rem`                                                 | `0.75rem`                                                 |
| `--toast-gap`                    | `0.5rem`                                                  | `0.5rem`                                                  |
| `--toast-shadow`                 | `0 4px 12px color-mix(in srgb, black 10%, transparent)`   | `0 4px 12px color-mix(in srgb, black 10%, transparent)`   |
| `--toast-max-width`              | `420px`                                                   | `420px`                                                   |
| `--toast-z-index`                | `50`                                                      | `50`                                                      |

### 下拉菜单样式

| 变量                           | 亮色值                      | 暗色值                      |
| ------------------------------ | --------------------------- | --------------------------- |
| `--select-border`              | `var(--border)`             | `var(--border)`             |
| `--select-hover-foreground`    | `var(--accent-foreground)`  | `var(--accent-foreground)`  |
| `--select-selected-background` | `var(--primary)`            | `var(--primary)`            |
| `--select-selected-foreground` | `var(--primary-foreground)` | `var(--primary-foreground)` |
| `--select-placeholder`         | `var(--muted-foreground)`   | `var(--muted-foreground)`   |
| `--select-search-icon`         | `var(--muted-foreground)`   | `var(--muted-foreground)`   |
| `--select-search-border`       | `var(--border)`             | `var(--border)`             |
| `--select-empty-text`          | `var(--muted-foreground)`   | `var(--muted-foreground)`   |
| `--select-group-label`         | `var(--muted-foreground)`   | `var(--muted-foreground)`   |
| `--select-item-height`         | `36px`                      | `36px`                      |

### 选择器基础样式

| 变量                         | 亮色值                    | 暗色值                    |
| ---------------------------- | ------------------------- | ------------------------- |
| `--select-height`            | `2.5rem`                  | `2.5rem`                  |
| `--select-padding-x`         | `0.75rem`                 | `0.75rem`                 |
| `--select-padding-y`         | `0.5rem`                  | `0.5rem`                  |
| `--select-font-size`         | `var(--text-sm)`          | `var(--text-sm)`          |
| `--select-line-height`       | `1.25`                    | `1.25`                    |
| `--select-border-width`      | `1px`                     | `1px`                     |
| `--select-border-style`      | `solid`                   | `solid`                   |
| `--select-border-radius`     | `var(--radius-md)`        | `var(--radius-md)`        |
| `--select-icon-size`         | `1rem`                    | `1rem`                    |
| `--select-icon-color`        | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--select-border-color`      | `var(--border)`           | `var(--border)`           |
| `--select-background`        | `var(--background)`       | `var(--background)`       |
| `--select-foreground`        | `var(--foreground)`       | `var(--foreground)`       |
| `--select-placeholder-color` | `var(--muted-foreground)` | `var(--muted-foreground)` |

### Select 动画

| 变量                           | 亮色值        | 暗色值        |
| ------------------------------ | ------------- | ------------- |
| `--select-transition-duration` | `150ms`       | `150ms`       |
| `--select-transition-timing`   | `ease-in-out` | `ease-in-out` |

### 选择器状态

| 变量                             | 亮色值                             | 暗色值                             |
| -------------------------------- | ---------------------------------- | ---------------------------------- |
| `--select-focus-border-color`    | `var(--primary)`                   | `var(--primary)`                   |
| `--select-focus-ring`            | `var(--primary)`                   | `var(--primary)`                   |
| `--select-focus-ring-offset`     | `var(--ring-offset)`               | `var(--ring-offset)`               |
| `--select-disabled-foreground`   | `var(--input-disabled-foreground)` | `var(--input-disabled-foreground)` |
| `--select-hover-border-color`    | `var(--form-input-hover-border)`   | `var(--form-input-hover-border)`   |
| `--select-hover-background`      | `var(--form-input-hover-bg)`       | `var(--form-input-hover-bg)`       |
| `--select-disabled-background`   | `var(--input-disabled)`            | `var(--input-disabled)`            |
| `--select-disabled-border-color` | `var(--border)`                    | `var(--border)`                    |

### 下拉框样式

| 变量                             | 亮色值             | 暗色值             |
| -------------------------------- | ------------------ | ------------------ |
| `--select-dropdown-border-color` | `var(--border)`    | `var(--border)`    |
| `--select-dropdown-shadow`       | `var(--shadow-md)` | `var(--shadow-md)` |
| `--select-dropdown-max-height`   | `300px`            | `300px`            |
| `--select-dropdown-background`   | `var(--popover)`   | `var(--popover)`   |

### 选项样式

| 变量                                  | 亮色值                      | 暗色值                      |
| ------------------------------------- | --------------------------- | --------------------------- |
| `--select-option-height`              | `2.25rem`                   | `2.25rem`                   |
| `--select-option-padding-x`           | `0.75rem`                   | `0.75rem`                   |
| `--select-option-padding-y`           | `0.375rem`                  | `0.375rem`                  |
| `--select-option-background`          | `transparent`               | `transparent`               |
| `--select-option-hover-background`    | `var(--accent)`             | `var(--accent)`             |
| `--select-option-hover-foreground`    | `var(--accent-foreground)`  | `var(--accent-foreground)`  |
| `--select-option-selected-background` | `var(--primary)`            | `var(--primary)`            |
| `--select-option-selected-foreground` | `var(--primary-foreground)` | `var(--primary-foreground)` |
| `--select-option-disabled-opacity`    | `0.5`                       | `0.5`                       |
| `--select-option-disabled-background` | `transparent`               | `transparent`               |
| `--select-option-disabled-foreground` | `var(--muted-foreground)`   | `var(--muted-foreground)`   |

### 搜索框样式

| 变量                                | 亮色值                    | 暗色值                    |
| ----------------------------------- | ------------------------- | ------------------------- |
| `--select-search-height`            | `2.25rem`                 | `2.25rem`                 |
| `--select-search-background`        | `transparent`             | `transparent`             |
| `--select-search-border-color`      | `var(--border)`           | `var(--border)`           |
| `--select-search-border-width`      | `0 0 1px 0`               | `0 0 1px 0`               |
| `--select-search-placeholder-color` | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--select-search-icon-color`        | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--select-empty-text-color`         | `var(--muted-foreground)` | `var(--muted-foreground)` |

### 分组标签样式

| 变量                               | 亮色值                    | 暗色值                    |
| ---------------------------------- | ------------------------- | ------------------------- |
| `--select-group-label-color`       | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--select-group-label-font-size`   | `var(--text-sm)`          | `var(--text-sm)`          |
| `--select-group-label-font-weight` | `500`                     | `500`                     |
| `--select-group-label-line-height` | `1.25`                    | `1.25`                    |
| `--select-group-label-padding-y`   | `0.375rem`                | `0.375rem`                |

### 进度条样式

| 变量                             | 亮色值                         | 暗色值                         |
| -------------------------------- | ------------------------------ | ------------------------------ |
| `--progress-indicator`           | `var(--primary)`               | `var(--primary)`               |
| `--progress-indicator-success`   | `var(--success)`               | `var(--success)`               |
| `--progress-indicator-warning`   | `var(--warning)`               | `var(--warning)`               |
| `--progress-indicator-error`     | `var(--destructive)`           | `var(--destructive)`           |
| `--progress-height`              | `0.5rem`                       | `0.5rem`                       |
| `--progress-border-radius`       | `var(--radius-full)`           | `var(--radius-full)`           |
| `--progress-background`          | `var(--muted)`                 | `var(--muted)`                 |
| `--progress-transition-duration` | `300ms`                        | `300ms`                        |
| `--progress-transition-timing`   | `cubic-bezier(0.4, 0, 0.2, 1)` | `cubic-bezier(0.4, 0, 0.2, 1)` |

### 单选框样式

| 变量                        | 亮色值                                               | 暗色值                                               |
| --------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `--radio-indicator`         | `var(--primary)`                                     | `var(--primary)`                                     |
| `--radio-disabled-opacity`  | `0.5`                                                | `0.5`                                                |
| `--radio-focus-ring`        | `var(--ring)`                                        | `var(--ring)`                                        |
| `--radio-gap`               | `0.5rem`                                             | `0.5rem`                                             |
| `--radio-size`              | `1.25rem`                                            | `1.25rem`                                            |
| `--radio-background`        | `transparent`                                        | `transparent`                                        |
| `--radio-border`            | `hsl(var(--gray-400))`                               | `hsl(var(--gray-500))`                               |
| `--radio-hover-border`      | `hsl(var(--gray-600))`                               | `hsl(var(--gray-300))`                               |
| `--radio-hover-bg`          | `color-mix(in srgb, var(--accent) 20%, transparent)` | `color-mix(in srgb, var(--accent) 15%, transparent)` |
| `--radio-focus-border`      | `var(--primary)`                                     | `var(--primary)`                                     |
| `--radio-checked-border`    | `var(--primary)`                                     | `var(--primary)`                                     |
| `--radio-checked-bg`        | `transparent`                                        | `transparent`                                        |
| `--radio-indicator-size`    | `0.75rem`                                            | `0.75rem`                                            |
| `--radio-focus-ring-offset` | `var(--background)`                                  | `var(--background)`                                  |

### 提示框样式

| 变量                     | 亮色值                                                      | 暗色值                                                      |
| ------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `--tooltip-background`   | `var(--popover)`                                            | `var(--popover)`                                            |
| `--tooltip-foreground`   | `var(--popover-foreground)`                                 | `var(--popover-foreground)`                                 |
| `--tooltip-border`       | `var(--border)`                                             | `var(--border)`                                             |
| `--tooltip-z-index`      | `50`                                                        | `50`                                                        |
| `--tooltip-shadow`       | `0 2px 4px -2px color-mix(in srgb, black 20%, transparent)` | `0 2px 4px -2px color-mix(in srgb, black 20%, transparent)` |
| `--tooltip-padding-x`    | `0.75rem`                                                   | `0.75rem`                                                   |
| `--tooltip-padding-y`    | `0.5rem`                                                    | `0.5rem`                                                    |
| `--tooltip-slide-offset` | `2px`                                                       | `2px`                                                       |
| `--tooltip-font-size`    | `var(--text-sm)`                                            | `var(--text-sm)`                                            |

### Toast关闭按钮样式

| 变量                                    | 亮色值              | 暗色值              |
| --------------------------------------- | ------------------- | ------------------- |
| `--toast-close-text`                    | `var(--foreground)` | `var(--foreground)` |
| `--toast-close-hover-text`              | `var(--foreground)` | `var(--foreground)` |
| `--toast-close-destructive-text`        | `hsl(0, 84%, 80%)`  | `hsl(0, 84%, 60%)`  |
| `--toast-close-destructive-hover-text`  | `hsl(0, 84%, 95%)`  | `hsl(0, 84%, 75%)`  |
| `--toast-close-destructive-ring`        | `hsl(0, 84%, 65%)`  | `hsl(0, 84%, 45%)`  |
| `--toast-close-destructive-ring-offset` | `hsl(0, 84%, 40%)`  | `hsl(0, 84%, 30%)`  |

### 滚动区域样式

| 变量                                           | 亮色值                                                         | 暗色值                                                         |
| ---------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `--scroll-bar-width`                           | `0.625rem`                                                     | `0.625rem`                                                     |
| `--scroll-bar-padding`                         | `1px`                                                          | `1px`                                                          |
| `--scroll-bar-thumb-radius`                    | `9999px`                                                       | `9999px`                                                       |
| `--scroll-bar-thumb-color`                     | `hsl(var(--gray-400))`                                         | `hsl(var(--gray-400))`                                         |
| `--scroll-bar-thumb-max-size`                  | `25%`                                                          | `25%`                                                          |
| `--scroll-bar-transition`                      | `all 150ms ease`                                               | `all 150ms ease`                                               |
| `--scroll-bar-hover-bg`                        | `rgba(0, 0, 0, 0.05)`                                          | `rgba(255, 255, 255, 0.05)`                                    |
| `--scroll-bar-thumb-hover-color`               | `color-mix(in srgb, var(--scroll-bar-thumb-color) 70%, black)` | `color-mix(in srgb, var(--scroll-bar-thumb-color) 70%, white)` |
| `--alert-border-radius`                        | `var(--radius)`                                                | `var(--radius)`                                                |
| `--alert-padding`                              | `16px`                                                         | `16px`                                                         |
| `--alert-icon-size`                            | `16px`                                                         | `16px`                                                         |
| `--alert-icon-margin`                          | `16px`                                                         | `16px`                                                         |
| `--alert-close-button-size`                    | `16px`                                                         | `16px`                                                         |
| `--alert-close-button-opacity`                 | `0.7`                                                          | `0.7`                                                          |
| `--alert-close-button-hover-opacity`           | `1`                                                            | `1`                                                            |
| `--alert-title-font-size`                      | `14px`                                                         | `14px`                                                         |
| `--alert-title-font-weight`                    | `500`                                                          | `500`                                                          |
| `--alert-title-margin-bottom`                  | `4px`                                                          | `4px`                                                          |
| `--alert-description-font-size`                | `14px`                                                         | `14px`                                                         |
| `--alert-description-line-height`              | `1.5`                                                          | `1.5`                                                          |
| `--alert-close-button-focus-ring`              | `var(--ring)`                                                  | `var(--ring)`                                                  |
| `--alert-close-button-focus-ring-offset`       | `var(--ring-offset)`                                           | `var(--ring-offset)`                                           |
| `--alert-close-button-focus-ring-width`        | `2px`                                                          | `2px`                                                          |
| `--alert-close-button-focus-ring-offset-width` | `2px`                                                          | `2px`                                                          |
| `--alert-border-width`                         | `1px`                                                          | `1px`                                                          |
| `--alert-shadow`                               | `0 1px 2px color-mix(in srgb, black 10%, transparent)`         | `0 1px 2px color-mix(in srgb, black 10%, transparent)`         |

### 不同状态的样式

| 变量                             | 亮色值                                                    | 暗色值                                                    |
| -------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `--alert-default-border`         | `var(--border)`                                           | `var(--border)`                                           |
| `--alert-default-background`     | `var(--background)`                                       | `var(--background)`                                       |
| `--alert-default-foreground`     | `var(--foreground)`                                       | `var(--foreground)`                                       |
| `--alert-default-icon`           | `var(--muted-foreground)`                                 | `var(--muted-foreground)`                                 |
| `--alert-destructive-border`     | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--alert-destructive-background` | `color-mix(in srgb, var(--destructive) 10%, transparent)` | `color-mix(in srgb, var(--destructive) 10%, transparent)` |
| `--alert-destructive-foreground` | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--alert-destructive-icon`       | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--alert-success-border`         | `var(--success)`                                          | `var(--success)`                                          |
| `--alert-success-background`     | `color-mix(in srgb, var(--success) 10%, transparent)`     | `color-mix(in srgb, var(--success) 10%, transparent)`     |
| `--alert-success-foreground`     | `var(--success)`                                          | `var(--success)`                                          |
| `--alert-success-icon`           | `var(--success)`                                          | `var(--success)`                                          |
| `--alert-warning-border`         | `var(--warning)`                                          | `var(--warning)`                                          |
| `--alert-warning-background`     | `color-mix(in srgb, var(--warning) 10%, transparent)`     | `color-mix(in srgb, var(--warning) 10%, transparent)`     |
| `--alert-warning-foreground`     | `var(--warning)`                                          | `var(--warning)`                                          |
| `--alert-warning-icon`           | `var(--warning)`                                          | `var(--warning)`                                          |
| `--alert-info-border`            | `var(--info)`                                             | `var(--info)`                                             |
| `--alert-info-background`        | `color-mix(in srgb, var(--info) 10%, transparent)`        | `color-mix(in srgb, var(--info) 10%, transparent)`        |
| `--alert-info-foreground`        | `var(--info)`                                             | `var(--info)`                                             |
| `--alert-info-icon`              | `var(--info)`                                             | `var(--info)`                                             |

### 分隔线样式

| 变量                            | 亮色值          | 暗色值          |
| ------------------------------- | --------------- | --------------- |
| `--separator-background`        | `var(--border)` | `var(--border)` |
| `--separator-horizontal-height` | `1px`           | `1px`           |
| `--separator-vertical-width`    | `1px`           | `1px`           |

### 阴影 - 更精致的阴影效果

| 变量             | 亮色值                                                                                                                    | 暗色值                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `--shadow-sm`    | `0 1px 2px 0 color-mix(in srgb, black 5%, transparent)`                                                                   | `0 1px 2px 0 color-mix(in srgb, black 5%, transparent)`                                                                   |
| `--shadow`       | `0 1px 3px 0 color-mix(in srgb, black 10%, transparent), 0 1px 2px -1px color-mix(in srgb, black 10%, transparent)`       | `0 1px 3px 0 color-mix(in srgb, black 40%, transparent), 0 1px 2px -1px color-mix(in srgb, black 40%, transparent)`       |
| `--shadow-md`    | `0 4px 6px -1px color-mix(in srgb, black 10%, transparent), 0 2px 4px -2px color-mix(in srgb, black 10%, transparent)`    | `0 4px 6px -1px color-mix(in srgb, black 40%, transparent), 0 2px 4px -2px color-mix(in srgb, black 40%, transparent)`    |
| `--shadow-lg`    | `0 10px 15px -3px color-mix(in srgb, black 10%, transparent), 0 4px 6px -4px color-mix(in srgb, black 10%, transparent)`  | `0 10px 15px -3px color-mix(in srgb, black 40%, transparent), 0 4px 6px -4px color-mix(in srgb, black 40%, transparent)`  |
| `--shadow-xl`    | `0 20px 25px -5px color-mix(in srgb, black 10%, transparent), 0 8px 10px -6px color-mix(in srgb, black 10%, transparent)` | `0 20px 25px -5px color-mix(in srgb, black 40%, transparent), 0 8px 10px -6px color-mix(in srgb, black 40%, transparent)` |
| `--shadow-2xl`   | `0 25px 50px -12px color-mix(in srgb, black 25%, transparent)`                                                            | `0 25px 50px -12px color-mix(in srgb, black 25%, transparent)`                                                            |
| `--shadow-inner` | `inset 0 2px 4px 0 color-mix(in srgb, black 5%, transparent)`                                                             | `inset 0 2px 4px 0 color-mix(in srgb, black 5%, transparent)`                                                             |

### AlertDialog 基础样式

| 变量                                  | 亮色值                                                                                                                | 暗色值                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--alert-dialog-overlay-z-index`      | `50`                                                                                                                  | `50`                                                                                                                  |
| `--alert-dialog-content-z-index`      | `51`                                                                                                                  | `51`                                                                                                                  |
| `--alert-dialog-overlay-background`   | `color-mix(in srgb, black 90%, transparent)`                                                                          | `color-mix(in srgb, black 90%, transparent)`                                                                          |
| `--alert-dialog-shadow`               | `0 4px 6px -1px color-mix(in srgb, black 10%, transparent), 0 2px 4px -1px color-mix(in srgb, black 6%, transparent)` | `0 4px 6px -1px color-mix(in srgb, black 10%, transparent), 0 2px 4px -1px color-mix(in srgb, black 6%, transparent)` |
| `--alert-dialog-transition`           | `all 150ms ease-in-out`                                                                                               | `all 150ms ease-in-out`                                                                                               |
| `--alert-dialog-content-min-width`    | `20rem`                                                                                                               | `20rem`                                                                                                               |
| `--alert-dialog-content-max-width`    | `28rem`                                                                                                               | `28rem`                                                                                                               |
| `--alert-dialog-content-border-width` | `1px`                                                                                                                 | `1px`                                                                                                                 |
| `--alert-dialog-backdrop-filter`      | `blur(4px)`                                                                                                           | `blur(4px)`                                                                                                           |

### AlertDialog 尺寸

| 变量                               | 亮色值           | 暗色值           |
| ---------------------------------- | ---------------- | ---------------- |
| `--alert-dialog-sm-max-width`      | `24rem`          | `24rem`          |
| `--alert-dialog-sm-padding`        | `1rem 1.25rem`   | `1rem 1.25rem`   |
| `--alert-dialog-sm-gap`            | `0.75rem`        | `0.75rem`        |
| `--alert-dialog-default-max-width` | `28rem`          | `28rem`          |
| `--alert-dialog-default-padding`   | `1.25rem 1.5rem` | `1.25rem 1.5rem` |
| `--alert-dialog-default-gap`       | `1rem`           | `1rem`           |
| `--alert-dialog-lg-max-width`      | `36rem`          | `36rem`          |
| `--alert-dialog-lg-padding`        | `1.5rem 2rem`    | `1.5rem 2rem`    |
| `--alert-dialog-lg-gap`            | `1.25rem`        | `1.25rem`        |

### AlertDialog 变体样式

| 变量                                    | 亮色值                                                         | 暗色值                                                         |
| --------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `--alert-dialog-default-border`         | `var(--border)`                                                | `var(--border)`                                                |
| `--alert-dialog-default-background`     | `var(--background)`                                            | `var(--background)`                                            |
| `--alert-dialog-default-foreground`     | `var(--foreground)`                                            | `var(--foreground)`                                            |
| `--alert-dialog-destructive-border`     | `color-mix(in srgb, var(--destructive) 80%, transparent)`      | `color-mix(in srgb, var(--destructive) 80%, transparent)`      |
| `--alert-dialog-destructive-background` | `color-mix(in srgb, var(--destructive) 5%, var(--background))` | `color-mix(in srgb, var(--destructive) 5%, var(--background))` |
| `--alert-dialog-destructive-foreground` | `var(--destructive)`                                           | `var(--destructive)`                                           |
| `--alert-dialog-success-border`         | `var(--success)`                                               | `var(--success)`                                               |
| `--alert-dialog-success-background`     | `var(--background)`                                            | `var(--background)`                                            |
| `--alert-dialog-success-foreground`     | `var(--success)`                                               | `var(--success)`                                               |

### AlertDialog 布局

| 变量                        | 亮色值   | 暗色值   |
| --------------------------- | -------- | -------- |
| `--alert-dialog-header-gap` | `0.5rem` | `0.5rem` |
| `--alert-dialog-footer-gap` | `0.5rem` | `0.5rem` |

### AlertDialog 文字样式

| 变量                                     | 亮色值                    | 暗色值                    |
| ---------------------------------------- | ------------------------- | ------------------------- |
| `--alert-dialog-title-font-size`         | `1.125rem`                | `1.125rem`                |
| `--alert-dialog-title-font-weight`       | `600`                     | `600`                     |
| `--alert-dialog-title-line-height`       | `1.5`                     | `1.5`                     |
| `--alert-dialog-description-font-size`   | `0.875rem`                | `0.875rem`                |
| `--alert-dialog-description-color`       | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--alert-dialog-description-line-height` | `1.5`                     | `1.5`                     |

### Help Dialog 样式

| 变量                        | 亮色值        | 暗色值        |
| --------------------------- | ------------- | ------------- |
| `--help-dialog-icon-color`  | `var(--info)` | `var(--info)` |
| `--help-dialog-list-indent` | `1.5rem`      | `1.5rem`      |
| `--help-dialog-list-gap`    | `0.75rem`     | `0.75rem`     |

### Input 组件样式

| 变量                       | 亮色值             | 暗色值             |
| -------------------------- | ------------------ | ------------------ |
| `--input-radius`           | `var(--radius-md)` | `var(--radius-md)` |
| `--input-focus-ring-width` | `1.5px`            | `1.5px`            |

### Input 尺寸

| 变量                   | 亮色值     | 暗色值     |
| ---------------------- | ---------- | ---------- |
| `--input-sm-height`    | `2.25rem`  | `2.25rem`  |
| `--input-md-height`    | `2.75rem`  | `2.75rem`  |
| `--input-lg-height`    | `3rem`     | `3rem`     |
| `--input-sm-padding-x` | `0.75rem`  | `0.75rem`  |
| `--input-md-padding-x` | `1rem`     | `1rem`     |
| `--input-lg-padding-x` | `1.25rem`  | `1.25rem`  |
| `--input-sm-font-size` | `0.875rem` | `0.875rem` |
| `--input-lg-font-size` | `1.125rem` | `1.125rem` |

### Input 状态样式

| 变量                       | 亮色值                                                    | 暗色值                                                    |
| -------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `--input-error-bg`         | `color-mix(in srgb, var(--destructive) 10%, transparent)` | `color-mix(in srgb, var(--destructive) 10%, transparent)` |
| `--input-error-fg`         | `var(--destructive)`                                      | `var(--destructive)`                                      |
| `--input-error-hover-bg`   | `color-mix(in srgb, var(--destructive) 20%, transparent)` | `color-mix(in srgb, var(--destructive) 20%, transparent)` |
| `--input-success-bg`       | `color-mix(in srgb, var(--success) 10%, transparent)`     | `color-mix(in srgb, var(--success) 10%, transparent)`     |
| `--input-success-fg`       | `var(--success)`                                          | `var(--success)`                                          |
| `--input-success-hover-bg` | `color-mix(in srgb, var(--success) 20%, transparent)`     | `color-mix(in srgb, var(--success) 20%, transparent)`     |

### Navigation Menu 组件样式

| 变量                           | 亮色值             | 暗色值             |
| ------------------------------ | ------------------ | ------------------ |
| `--nav-menu-z-index`           | `10`               | `10`               |
| `--nav-menu-item-spacing`      | `0.25rem`          | `0.25rem`          |
| `--nav-menu-trigger-height`    | `2.5rem`           | `2.5rem`           |
| `--nav-menu-trigger-radius`    | `var(--radius-md)` | `var(--radius-md)` |
| `--nav-menu-trigger-padding-x` | `1rem`             | `1rem`             |
| `--nav-menu-trigger-padding-y` | `0.5rem`           | `0.5rem`           |
| `--nav-menu-trigger-font-size` | `0.875rem`         | `0.875rem`         |
| `--nav-menu-viewport-margin`   | `0.375rem`         | `0.375rem`         |
| `--nav-menu-viewport-radius`   | `var(--radius-md)` | `var(--radius-md)` |
| `--nav-menu-viewport-shadow`   | `var(--shadow-lg)` | `var(--shadow-lg)` |

### Popover 组件样式

| 变量                           | 亮色值                                                | 暗色值                                                |
| ------------------------------ | ----------------------------------------------------- | ----------------------------------------------------- |
| `--popover-z-index`            | `50`                                                  | `50`                                                  |
| `--popover-width`              | `18rem`                                               | `18rem`                                               |
| `--popover-radius`             | `var(--radius-md)`                                    | `var(--radius-md)`                                    |
| `--popover-padding`            | `1rem`                                                | `1rem`                                                |
| `--popover-shadow`             | `var(--shadow-md)`                                    | `var(--shadow-md)`                                    |
| `--popover-input-bg`           | `var(--background)`                                   | `var(--background)`                                   |
| `--popover-input-border`       | `var(--border)`                                       | `var(--border)`                                       |
| `--popover-input-text`         | `var(--foreground)`                                   | `var(--foreground)`                                   |
| `--popover-input-focus-border` | `var(--primary)`                                      | `var(--primary)`                                      |
| `--popover-input-focus-ring`   | `color-mix(in srgb, var(--primary) 30%, transparent)` | `color-mix(in srgb, var(--primary) 30%, transparent)` |

### Form 组件样式

| 变量                           | 亮色值                    | 暗色值                    |
| ------------------------------ | ------------------------- | ------------------------- |
| `--form-label-font-size`       | `0.875rem`                | `0.875rem`                |
| `--form-label-font-weight`     | `500`                     | `500`                     |
| `--form-label-line-height`     | `1`                       | `1`                       |
| `--form-description-font-size` | `0.875rem`                | `0.875rem`                |
| `--form-description-color`     | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--form-message-font-size`     | `0.875rem`                | `0.875rem`                |
| `--form-message-font-weight`   | `400`                     | `400`                     |
| `--form-message-error-color`   | `hsl(0 84% 40%)`          | `hsl(var(--gray-600))`    |
| `--form-message-error-bg`      | `hsl(0 100% 97%)`         | `hsl(0 70% 15%)`          |
| `--form-message-error-border`  | `hsl(0 84% 80%)`          | `hsl(0 70% 25%)`          |
| `--form-input-bg`              | `var(--background)`       | `var(--background)`       |
| `--form-input-border`          | `var(--border)`           | `var(--border)`           |
| `--form-input-text`            | `var(--foreground)`       | `var(--foreground)`       |
| `--form-input-placeholder`     | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--form-input-hover-bg`        | `var(--background)`       | `var(--background)`       |
| `--form-input-hover-border`    | `var(--border)`           | `var(--border)`           |
| `--form-input-focus-bg`        | `var(--background)`       | `var(--background)`       |
| `--form-input-focus-border`    | `var(--primary)`          | `var(--primary)`          |
| `--form-input-focus-text`      | `var(--foreground)`       | `var(--foreground)`       |
| `--form-input-radius`          | `var(--radius-md)`        | `var(--radius-md)`        |
| `--form-input-error-bg`        | `hsl(0 100% 97%)`         | `hsl(0 70% 15%)`          |
| `--form-input-error-border`    | `hsl(0 84% 80%)`          | `hsl(0 70% 25%)`          |
| `--form-input-error-text`      | `hsl(0 84% 40%)`          | `hsl(var(--gray-600))`    |
| `--form-input-success-bg`      | `hsl(145 80% 95%)`        | `hsl(145 80% 15%)`        |
| `--form-input-success-border`  | `hsl(145 80% 80%)`        | `hsl(145 80% 25%)`        |
| `--form-input-success-text`    | `hsl(145 80% 42%)`        | `hsl(145 80% 70%)`        |

### HoverCard 组件样式

| 变量                   | 亮色值                      | 暗色值                      |
| ---------------------- | --------------------------- | --------------------------- |
| `--hover-card-radius`  | `var(--radius-md)`          | `var(--radius-md)`          |
| `--hover-card-border`  | `var(--border)`             | `var(--border)`             |
| `--hover-card-bg`      | `var(--popover)`            | `var(--popover)`            |
| `--hover-card-fg`      | `var(--popover-foreground)` | `var(--popover-foreground)` |
| `--hover-card-padding` | `1rem`                      | `1rem`                      |
| `--hover-card-shadow`  | `var(--shadow-md)`          | `var(--shadow-md)`          |

### HoverCard 尺寸

| 变量                    | 亮色值  | 暗色值  |
| ----------------------- | ------- | ------- |
| `--hover-card-sm-width` | `12rem` | `12rem` |
| `--hover-card-md-width` | `16rem` | `16rem` |
| `--hover-card-lg-width` | `20rem` | `20rem` |

### HoverCard 暗色主题

| 变量                   | 亮色值                 | 暗色值                 |
| ---------------------- | ---------------------- | ---------------------- |
| `--hover-card-dark-bg` | `hsl(var(--gray-800))` | `hsl(var(--gray-800))` |
| `--hover-card-dark-fg` | `hsl(var(--gray-100))` | `hsl(var(--gray-100))` |

### Command 组件样式

| 变量                                 | 亮色值                     | 暗色值                     |
| ------------------------------------ | -------------------------- | -------------------------- |
| `--command-border`                   | `var(--border)`            | `var(--border)`            |
| `--command-input-height`             | `2.5rem`                   | `2.5rem`                   |
| `--command-input-bg`                 | `transparent`              | `transparent`              |
| `--command-input-placeholder`        | `var(--muted-foreground)`  | `var(--muted-foreground)`  |
| `--command-item-bg`                  | `transparent`              | `transparent`              |
| `--command-item-disabled-opacity`    | `0.5`                      | `0.5`                      |
| `--command-item-padding`             | `0.75rem`                  | `0.75rem`                  |
| `--command-empty-text`               | `var(--muted-foreground)`  | `var(--muted-foreground)`  |
| `--command-group-heading-color`      | `var(--muted-foreground)`  | `var(--muted-foreground)`  |
| `--command-separator-color`          | `var(--border)`            | `var(--border)`            |
| `--command-background`               | `var(--background)`        | `var(--background)`        |
| `--command-foreground`               | `var(--foreground)`        | `var(--foreground)`        |
| `--command-item-hover-bg`            | `var(--accent)`            | `var(--accent)`            |
| `--command-item-hover-fg`            | `var(--accent-foreground)` | `var(--accent-foreground)` |
| `--command-item-hover-shadow`        | `0 0 0 1px var(--accent)`  | `0 0 0 1px var(--accent)`  |
| `--command-dialog-content-padding`   | `0`                        | `0`                        |
| `--command-dialog-shadow`            | `var(--shadow-md)`         | `var(--shadow-md)`         |
| `--command-loading-bg`               | `var(--overlay)`           | `var(--overlay)`           |
| `--command-loading-bg-opacity`       | `0.7`                      | `0.7`                      |
| `--command-item-transition-duration` | `100ms`                    | `100ms`                    |
| `--command-item-transition-timing`   | `ease`                     | `ease`                     |
| `--command-input-focus-ring`         | `transparent`              | `transparent`              |

### DropdownMenu 组件样式

| 变量                        | 亮色值                      | 暗色值                      |
| --------------------------- | --------------------------- | --------------------------- |
| `--dropdown-menu-min-width` | `8rem`                      | `8rem`                      |
| `--dropdown-menu-bg`        | `var(--popover)`            | `var(--popover)`            |
| `--dropdown-menu-fg`        | `var(--popover-foreground)` | `var(--popover-foreground)` |
| `--dropdown-menu-border`    | `var(--border)`             | `var(--border)`             |
| `--dropdown-menu-radius`    | `var(--radius-md)`          | `var(--radius-md)`          |
| `--dropdown-menu-padding`   | `0.25rem`                   | `0.25rem`                   |
| `--dropdown-menu-shadow`    | `var(--shadow-md)`          | `var(--shadow-md)`          |

### DropdownMenu 尺寸

| 变量                           | 亮色值     | 暗色值     |
| ------------------------------ | ---------- | ---------- |
| `--dropdown-menu-sm-min-width` | `6rem`     | `6rem`     |
| `--dropdown-menu-md-min-width` | `8rem`     | `8rem`     |
| `--dropdown-menu-lg-min-width` | `10rem`    | `10rem`    |
| `--dropdown-menu-sm-font-size` | `0.75rem`  | `0.75rem`  |
| `--dropdown-menu-md-font-size` | `0.875rem` | `0.875rem` |
| `--dropdown-menu-lg-font-size` | `1rem`     | `1rem`     |

### DropdownMenu 项目样式

| 变量                                    | 亮色值                     | 暗色值                     |
| --------------------------------------- | -------------------------- | -------------------------- |
| `--dropdown-menu-item-padding-x`        | `0.5rem`                   | `0.5rem`                   |
| `--dropdown-menu-item-padding-y`        | `0.375rem`                 | `0.375rem`                 |
| `--dropdown-menu-item-radius`           | `var(--radius-sm)`         | `var(--radius-sm)`         |
| `--dropdown-menu-item-hover-bg`         | `var(--accent)`            | `var(--accent)`            |
| `--dropdown-menu-item-hover-fg`         | `var(--accent-foreground)` | `var(--accent-foreground)` |
| `--dropdown-menu-item-disabled-opacity` | `0.5`                      | `0.5`                      |

### DropdownMenu 标签和分隔线

| 变量                                 | 亮色值         | 暗色值         |
| ------------------------------------ | -------------- | -------------- |
| `--dropdown-menu-label-font-weight`  | `600`          | `600`          |
| `--dropdown-menu-separator-bg`       | `var(--muted)` | `var(--muted)` |
| `--dropdown-menu-shortcut-opacity`   | `0.6`          | `0.6`          |
| `--dropdown-menu-shortcut-font-size` | `0.75rem`      | `0.75rem`      |

### DropdownMenu 子菜单

| 变量                                    | 亮色值             | 暗色值             |
| --------------------------------------- | ------------------ | ------------------ |
| `--dropdown-menu-sub-trigger-icon-size` | `1rem`             | `1rem`             |
| `--dropdown-menu-sub-content-shadow`    | `var(--shadow-lg)` | `var(--shadow-lg)` |

### Dialog 组件样式

| 变量                       | 亮色值              | 暗色值              |
| -------------------------- | ------------------- | ------------------- |
| `--dialog-overlay-bg`      | `rgb(0 0 0)`        | `rgb(0 0 0)`        |
| `--dialog-overlay-opacity` | `0.5`               | `0.5`               |
| `--dialog-content-bg`      | `var(--background)` | `var(--background)` |
| `--dialog-content-fg`      | `var(--foreground)` | `var(--foreground)` |
| `--dialog-content-border`  | `var(--border)`     | `var(--border)`     |
| `--dialog-content-shadow`  | `var(--shadow-lg)`  | `var(--shadow-lg)`  |
| `--dialog-content-gap`     | `1rem`              | `1rem`              |
| `--dialog-content-padding` | `1.5rem`            | `1.5rem`            |
| `--dialog-content-radius`  | `var(--radius-lg)`  | `var(--radius-lg)`  |

### Dialog 尺寸

| 变量                    | 亮色值  | 暗色值  |
| ----------------------- | ------- | ------- |
| `--dialog-sm-max-width` | `400px` | `400px` |
| `--dialog-md-max-width` | `600px` | `600px` |
| `--dialog-lg-max-width` | `800px` | `800px` |

### Dialog 动画

| 变量                           | 亮色值        | 暗色值        |
| ------------------------------ | ------------- | ------------- |
| `--dialog-transition-duration` | `200ms`       | `200ms`       |
| `--dialog-transition-timing`   | `ease-in-out` | `ease-in-out` |

### Dialog 控制按钮

| 变量                               | 亮色值               | 暗色值               |
| ---------------------------------- | -------------------- | -------------------- |
| `--dialog-close-opacity`           | `0.7`                | `0.7`                |
| `--dialog-close-hover-opacity`     | `1`                  | `1`                  |
| `--dialog-close-focus-ring`        | `var(--ring)`        | `var(--ring)`        |
| `--dialog-close-focus-ring-offset` | `var(--ring-offset)` | `var(--ring-offset)` |

### Dialog 标题和描述

| 变量                             | 亮色值                    | 暗色值                    |
| -------------------------------- | ------------------------- | ------------------------- |
| `--dialog-title-font-size`       | `1.125rem`                | `1.125rem`                |
| `--dialog-title-font-weight`     | `600`                     | `600`                     |
| `--dialog-title-line-height`     | `1`                       | `1`                       |
| `--dialog-title-tracking`        | `-0.025em`                | `-0.025em`                |
| `--dialog-description-color`     | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--dialog-description-font-size` | `0.875rem`                | `0.875rem`                |

### Dialog 输入框样式

| 变量                          | 亮色值                    | 暗色值                    |
| ----------------------------- | ------------------------- | ------------------------- |
| `--dialog-input-bg`           | `var(--background)`       | `var(--background)`       |
| `--dialog-input-border`       | `var(--border)`           | `var(--border)`           |
| `--dialog-input-text`         | `var(--foreground)`       | `var(--foreground)`       |
| `--dialog-input-placeholder`  | `var(--muted-foreground)` | `var(--muted-foreground)` |
| `--dialog-input-focus-bg`     | `var(--background)`       | `var(--background)`       |
| `--dialog-input-focus-border` | `var(--ring)`             | `var(--ring)`             |
| `--dialog-input-focus-text`   | `var(--foreground)`       | `var(--foreground)`       |
| `--dialog-input-radius`       | `var(--radius-md)`        | `var(--radius-md)`        |

### Dialog dark主题

| 变量               | 亮色值                 | 暗色值                 |
| ------------------ | ---------------------- | ---------------------- |
| `--dialog-dark-bg` | `hsl(var(--gray-900))` | `hsl(var(--gray-900))` |
| `--dialog-dark-fg` | `hsl(var(--gray-50))`  | `hsl(var(--gray-50))`  |

### Dialog light主题

| 变量                | 亮色值                 | 暗色值                 |
| ------------------- | ---------------------- | ---------------------- |
| `--dialog-light-bg` | `hsl(var(--gray-50))`  | `hsl(var(--gray-50))`  |
| `--dialog-light-fg` | `hsl(var(--gray-900))` | `hsl(var(--gray-900))` |

### Badge 基础样式

| 变量                       | 亮色值             | 暗色值             |
| -------------------------- | ------------------ | ------------------ |
| `--badge-font-weight`      | `500`              | `500`              |
| `--badge-border-radius`    | `var(--radius)`    | `var(--radius)`    |
| `--badge-border-radius-sm` | `var(--radius-sm)` | `var(--radius-sm)` |
| `--badge-border-radius-lg` | `var(--radius-lg)` | `var(--radius-lg)` |

### Badge 尺寸

| 变量                        | 亮色值     | 暗色值     |
| --------------------------- | ---------- | ---------- |
| `--badge-sm-height`         | `1.25rem`  | `1.25rem`  |
| `--badge-sm-min-width`      | `1.25rem`  | `1.25rem`  |
| `--badge-sm-padding-x`      | `0.375rem` | `0.375rem` |
| `--badge-sm-padding-y`      | `0`        | `0`        |
| `--badge-sm-font-size`      | `0.75rem`  | `0.75rem`  |
| `--badge-default-height`    | `1.5rem`   | `1.5rem`   |
| `--badge-default-min-width` | `1.5rem`   | `1.5rem`   |
| `--badge-default-padding-x` | `0.5rem`   | `0.5rem`   |
| `--badge-default-padding-y` | `0`        | `0`        |
| `--badge-default-font-size` | `0.875rem` | `0.875rem` |
| `--badge-lg-height`         | `1.75rem`  | `1.75rem`  |
| `--badge-lg-min-width`      | `1.75rem`  | `1.75rem`  |
| `--badge-lg-padding-x`      | `0.75rem`  | `0.75rem`  |
| `--badge-lg-padding-y`      | `0`        | `0`        |
| `--badge-lg-font-size`      | `1rem`     | `1rem`     |

### Badge 变体样式

| 变量                         | 亮色值                          | 暗色值                          |
| ---------------------------- | ------------------------------- | ------------------------------- |
| `--badge-default-border`     | `hsl(var(--gray-300))`          | `hsl(var(--gray-200))`          |
| `--badge-default-bg`         | `hsl(var(--gray-100))`          | `hsl(var(--gray-100))`          |
| `--badge-default-text`       | `hsl(var(--gray-800))`          | `hsl(var(--gray-700))`          |
| `--badge-secondary-border`   | `transparent`                   | `transparent`                   |
| `--badge-secondary-bg`       | `var(--secondary)`              | `var(--secondary)`              |
| `--badge-secondary-text`     | `var(--secondary-foreground)`   | `var(--secondary-foreground)`   |
| `--badge-destructive-border` | `transparent`                   | `transparent`                   |
| `--badge-destructive-bg`     | `var(--destructive)`            | `var(--destructive)`            |
| `--badge-destructive-text`   | `var(--destructive-foreground)` | `var(--destructive-foreground)` |
| `--badge-outline-border`     | `hsl(var(--gray-400))`          | `hsl(var(--gray-500))`          |
| `--badge-outline-bg`         | `transparent`                   | `transparent`                   |
| `--badge-outline-text`       | `var(--foreground)`             | `hsl(var(--gray-200))`          |
| `--badge-success-border`     | `transparent`                   | `transparent`                   |
| `--badge-success-bg`         | `var(--success)`                | `var(--success)`                |
| `--badge-success-text`       | `var(--success-foreground)`     | `var(--success-foreground)`     |
| `--badge-warning-border`     | `transparent`                   | `transparent`                   |
| `--badge-warning-bg`         | `var(--warning)`                | `var(--warning)`                |
| `--badge-warning-text`       | `var(--warning-foreground)`     | `var(--warning-foreground)`     |
| `--badge-info-border`        | `transparent`                   | `transparent`                   |
| `--badge-info-bg`            | `var(--info)`                   | `var(--info)`                   |
| `--badge-info-text`          | `var(--info-foreground)`        | `var(--info-foreground)`        |

### Badge 点状标记

| 变量                        | 亮色值                  | 暗色值                  |
| --------------------------- | ----------------------- | ----------------------- |
| `--badge-dot-size`          | `0.5rem`                | `0.5rem`                |
| `--badge-dot-border-width`  | `2px`                   | `2px`                   |
| `--badge-dot-border-color`  | `var(--background)`     | `var(--background)`     |
| `--badge-dot-default-color` | `var(--primary)`        | `var(--primary)`        |
| `--badge-transition`        | `all 150ms ease-in-out` | `all 150ms ease-in-out` |

### Badge Animation

| 变量                          | 亮色值        | 暗色值        |
| ----------------------------- | ------------- | ------------- |
| `--badge-transition-duration` | `150ms`       | `150ms`       |
| `--badge-transition-timing`   | `ease-in-out` | `ease-in-out` |

---

## 变量分组速查

| 分组        | 前缀                                                                                 | 用途                       |
| ----------- | ------------------------------------------------------------------------------------ | -------------------------- |
| 基础色调    | `--background` `--foreground`                                                        | 页面底色与文字色           |
| 灰阶        | `--gray-50` … `--gray-900`                                                           | 10 级中性色（裸 HSL 分量） |
| 圆角        | `--radius*`                                                                          | 全局圆角尺度               |
| 语义色      | `--primary` `--secondary` `--destructive` `--success` `--warning` `--error` `--info` | 状态色                     |
| 边框 / 焦点 | `--border` `--ring` `--ring-offset` `--input*`                                       | 描边与焦点环               |
| 组件前缀    | `--button-*` `--card-*` `--dialog-*` `--toast-*` `--select-*` `--alert-*` …          | 各组件专属变量             |

> 各组件文档页末尾列出了该组件**实际使用**的变量，便于精确定制。

---

## 动画

本库使用 [`tw-animate-css`](https://github.com/adityathebe/tw-animate-css)
提供 v4 兼容的进出场动画类（`animate-in` / `fade-in-0` / `zoom-in-95` /
`slide-in-from-*`）。

自定义动画用 `@utility` 注册：

```css
@utility animate-ripple {
  animation: ripple 0.6s ease-out;
}
```

已内置：`animate-ripple`（水波纹反馈）、`animate-gradient`（渐变背景）。

---

## 滚动条样式

本库在 `@layer utilities` 中定义了 WebKit 滚动条样式
（跟随 `--muted-foreground`），dark 主题有对应覆盖。
消费方自定义滚动条时，可覆盖以下变量：

| 变量                             | 用途         |
| -------------------------------- | ------------ |
| `--scroll-bar-width`             | 滚动条宽度   |
| `--scroll-bar-padding`           | 滚动条内边距 |
| `--scroll-bar-thumb-radius`      | 滑块圆角     |
| `--scroll-bar-thumb-color`       | 滑块颜色     |
| `--scroll-bar-thumb-hover-color` | 滑块悬停颜色 |
| `--scroll-bar-thumb-max-size`    | 滑块最大占比 |
| `--scroll-bar-hover-bg`          | 轨道悬停背景 |

---

## 相关文档

- [快速开始](./getting-started.md)
- [组件文档索引](./README.md)
- [`spec/css-standard.md`](../spec/css-standard.md) —— CSS 变量与主题开发规范
