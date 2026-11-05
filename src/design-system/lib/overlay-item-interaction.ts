/**
 * 弹层可选项（菜单项 / 选项列表项）统一的鼠标指针与禁用态类名契约
 *
 * @description
 * 全局 `src/theme/styles/prefix.css` 只给 `button` / `[role=button]` 设置 cursor，
 * 而 Radix Menu / Select 的 Item 与 cmdk 的 Command.Item 渲染的都是 `<div>`，
 * **不受全局规则覆盖** —— 不显式声明就是默认箭头，用户无从判断能否点击。
 *
 * 统一契约（基准：`src/ui/combobox` 的 option、`select.tsx` 的 SelectItem）：
 * 1. 可用项：`cursor-pointer`
 * 2. 禁用项：`data-[disabled]:cursor-not-allowed` + `data-[disabled]:opacity-50`
 *
 * ⚠️ **禁用态禁用 `pointer-events-none`**（规范 `spec/css-standard.md` §4.9）：
 *    元素对鼠标透明后，浏览器解析光标命中的是下层 `body`，
 *    `cursor: not-allowed` **永远不会生效**。
 *    Radix（`onClick` / `onPointerUp` 内 `if (disabled) return`）与 cmdk
 *    （`onPointerMove` 跳过禁用项）都已在**事件层**拦截禁用项，
 *    CSS 层不需要、也不得再屏蔽指针事件。
 *
 * ⚠️ **禁用项不会被 focus**（Radix RovingFocusGroup `focusable: !disabled`），
 *    因此 `focus:bg-accent` 等高亮反馈天然不会出现在禁用项上，无需逐项关闭。
 */

/**
 * Radix 系弹层项的交互类（DropdownMenu / ContextMenu / Menubar / Select）
 *
 * ⚠️ 仅适用于「`data-disabled` 只在禁用时输出」的元素：
 * Radix 的实现是 `"data-disabled": disabled ? "" : void 0` ——
 * 可用项**没有**该属性，`data-[disabled]:` 变体（选择器 `[data-disabled]`）安全。
 */
export const overlayItemInteraction = 'cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50';

/**
 * cmdk（Command）弹层项的禁用态交互类
 *
 * ⚠️ 与 Radix 的关键差异：cmdk 的 Command.Item 输出 `"data-disabled": !!disabled`，
 * **可用项也会渲染 `data-disabled="false"`**（属性恒存在）——
 * 若用 `data-[disabled]:`（属性存在即匹配），禁用样式会**误伤所有可用项**。
 * 必须用 `data-[disabled=true]:` 按**属性值**精确匹配。
 */
export const cmdkItemInteraction = 'cursor-pointer data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50';
