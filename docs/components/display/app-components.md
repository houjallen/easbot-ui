# 应用组件（主题 / 语言切换）

> 面向应用层的**开箱即用**成品组件 —— 由本库的基础 UI 组件与 Provider 组合而成，
> 消费方直接 `import` 使用，无需自行组装。

---

## 与 `src/ui/` 的分工

| 层                | 定位                               | 判定标准                       |
| ----------------- | ---------------------------------- | ------------------------------ |
| `src/ui/`         | **基础 UI 组件** —— 原子级、可组合 | 纯视觉，无业务语义             |
| `src/components/` | **应用组件** —— 开箱即用的成品     | **自带业务语义**（切换主题等） |

---

## `ThemeToggle`

在**浅色**与**深色**两种主题间一键切换的图标按钮。

```tsx
import { ThemeToggle } from '@easbot/ui';

<ThemeToggle />;
```

### 属性

| 属性         | 类型                   | 默认值     | 说明             |
| ------------ | ---------------------- | ---------- | ---------------- |
| `size?`      | `number`               | `32`       | 图标尺寸（像素） |
| `shape?`     | `'circle' \| 'square'` | `'circle'` | 按钮形状         |
| `className?` | `string`               | —          | 附加类名         |

### 行为

- **只支持 light / dark 两态** —— 不含 `system`（跟随系统）。需要三态时请用 `useTheme()` 自行组合下拉菜单。
- **图标语义 = 点击后将进入的主题** —— 当前为浅色时显示月亮图标（点击进入深色），当前为深色时显示太阳图标（点击回到浅色）。
- **状态来源是 `useTheme()`** —— 读 `resolvedTheme`（实际生效的主题），而非 `theme`（可能是 `'system'`）。
- **组件自己记住当前主题** —— 用本地 `state` 记录实际生效的主题，初始值取自 `useTheme()`；
  用户点击后**先**更新本地 state（UI 立即反馈），**再**通过 `setTheme` 同步回 Provider / localStorage。
  外部主题变化（如 Storybook 工具栏切换 globals）时同步该 state。
- **持久化由 `ThemeProvider` 负责** —— `setTheme` 会写入 `localStorage`。

### 无障碍

- 渲染为原生 `<button type="button">`，天然键盘可达。
- `aria-label` 取自内置 `theme` 文案域（`toggleLabel`），语言由 `LocaleProvider` 决定。

---

## `LocaleToggle`

点击弹出语言下拉菜单，在受支持的语言间切换。

```tsx
import { LocaleToggle } from '@easbot/ui';

<LocaleToggle />;
```

### 属性

| 属性         | 类型                           | 默认值  | 说明                   |
| ------------ | ------------------------------ | ------- | ---------------------- |
| `size?`      | `number`                       | `32`    | 触发器图标尺寸（像素） |
| `align?`     | `'start' \| 'center' \| 'end'` | `'end'` | 下拉内容对齐方式       |
| `className?` | `string`                       | —       | 附加类名               |

### 行为

- **语言显示名始终用母语** —— 简体中文显示「简体中文」，英文显示「English」。
- **当前语言用圆点标记** —— 选中项右侧显示 `bg-primary` 小圆点。
- **状态来源是 `useLocale()`** —— 读 Provider 注入的语言，切换走 `setLocale`。
- **组件自己记住选中值** —— 用本地 `state` 记录当前选中项，初始值取自 `useLocale()`；
  用户选择后**先**更新本地 state（UI 立即反馈），**再**通过 `setLocale` 同步回 store。
- **下拉项仅在语言不同时才触发切换** —— 避免无意义的重复写入。
- **支持的语言列表** 由 `SUPPORTED_LOCALES` 常量决定（当前 `zh-CN` / `en-US`）。

### 无障碍

- 触发器为原生 `<button type="button">`（包在 `DropdownMenuTrigger asChild` 内），键盘可达。
- `aria-label` 取自内置 `locale` 文案域（`toggleLabel`）。
- 下拉菜单由 Radix `DropdownMenu` 渲染，具备焦点陷阱、`Escape` 关闭与焦点回收。

---

## `useTheme`

读取当前主题并提供切换能力。定义在 `src/hooks/use-theme.ts`，从 `src/providers/` 导入 Context。

```tsx
import { useTheme } from '@easbot/ui';

function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme, enableSystem } = useTheme();

  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      {resolvedTheme}
    </button>
  );
}
```

### 返回值

| 字段            | 类型                     | 说明                                  |
| --------------- | ------------------------ | ------------------------------------- |
| `theme`         | `Theme`                  | 当前主题（可能是 `'system'`）         |
| `resolvedTheme` | `'light' \| 'dark'`      | 实际生效的主题（`system` 已解析）     |
| `setTheme`      | `(theme: Theme) => void` | 设置主题（由 `ThemeProvider` 持久化） |
| `enableSystem`  | `boolean`                | 是否启用 system 主题                  |

### 降级行为

**无 `ThemeProvider` 时自动降级** —— 直接读 `<html>` 上的 `data-theme` 属性：

| 字段            | 降级值                   |
| --------------- | ------------------------ |
| `theme`         | 读到的 `light` / `dark`  |
| `resolvedTheme` | 读到的 `light` / `dark`  |
| `setTheme`      | **空实现**（不做任何事） |
| `enableSystem`  | `false`                  |

> 📌 降级路径让组件在「没有 Provider 的局部子树」里也能渲染（不至于抛错），
> 但**切换不会生效** —— 需要切换能力就必须包 `ThemeProvider`。

---

## 注意事项

- **`ThemeToggle` 只切换两态** —— 需要「跟随系统」第三态请用 `useTheme()` 自行组合。
- **`useTheme()` 无 Provider 时 `setTheme` 是空实现** —— 静默失败，不抛错、不警告。
- **两个组件都自带 `state` 记忆** —— 选中值 / 当前主题初始取自 Hook，点击后先本地更新再回写 Provider，
  保证 UI 即时响应；外部变化（如 Storybook globals）时通过 `useEffect` 同步回来。
- **文案走内置文案表** —— `theme` 域 / `locale` 域，语言由 `LocaleProvider` 决定，
  **无需**消费方传入 `locale` / `messages`。

---

## 导出

### 组件

| 导出名         | 说明                              |
| -------------- | --------------------------------- |
| `LocaleToggle` | 语言切换按钮（下拉菜单）          |
| `ThemeToggle`  | 主题切换按钮（light / dark 两态） |

### Hook

| 导出名     | 说明                                             |
| ---------- | ------------------------------------------------ |
| `useTheme` | 读取当前主题并提供切换能力（无 Provider 时降级） |

### 属性类型

| 导出名              | 说明                  |
| ------------------- | --------------------- |
| `LocaleToggleProps` | `LocaleToggle` 的属性 |
| `ThemeToggleProps`  | `ThemeToggle` 的属性  |
