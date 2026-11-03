/**
 * 浮层表面（overlay surface）共享样式
 *
 * @description
 * 统一 **Dialog / AlertDialog / Drawer / Sheet / Toast** 五类浮层的
 * 视觉契约，避免各组件各写一套导致体验割裂。
 *
 * ## 统一契约（以 Dialog 为基准）
 *
 * | 项目          | 值                                    | 理由                                     |
 * | ------------- | ------------------------------------- | ---------------------------------------- |
 * | 容器圆角      | `rounded-lg`                          | 与 Card / Alert 一致；`--radius-lg`      |
 * | 容器内边距    | `p-6`（24px）                         | Dialog / AlertDialog 已是 `p-6`，Drawer 跟随 |
 * | 关闭按钮形状  | `rounded-xs`（方角）                  | **以 Dialog 为准**                        |
 * | 关闭按钮位置  | `absolute top-4 right-4`（16px）       | **以 Dialog 为准**（右上角，主流惯例）    |
 * | 关闭按钮视觉  | `opacity-70` → hover `opacity-100`    | 次要操作，避免与主内容抢注意力           |
 *
 * ## 为什么统一到 `rounded-xs`
 *
 * 此前 AlertDialog 用 `rounded-full`（圆形），与 Dialog / Drawer / Sheet 的
 * `rounded-xs`（方角）**互不一致**。现以 **Dialog 为基准**统一为 `rounded-xs`。
 *
 * ## 为什么关闭按钮要「右上角」而不是「右侧居中」
 *
 * 参考 Carbon Design System「Notification」：
 * 关闭按钮是通知的**独立解剖元素**（D. Close button），位于内容区之外；
 * Toast 内容通常多行且时长短，右上角是主流惯例
 * （shadcn/sonner 的 `closeIconPosition` 默认 `top-end`）。
 *
 * ⚠️ **但右上角 ≠ 可以压住内容** —— 浮层表面必须为关闭按钮**预留空间**：
 * - Dialog / AlertDialog / Drawer / Sheet：标题区加 `pr-`（右侧留白）；
 * - Toast：内容区加 `pr-`（右侧留白）。
 *
 * 否则长标题会延伸到按钮下方 —— 表现为「文字与关闭按钮重叠」。
 *
 * @see {@link file://./dialog.tsx}
 * @see {@link file://./alert-dialog.tsx}
 * @see {@link file://./drawer.tsx}
 * @see {@link file://./sheet.tsx}
 */

/**
 * 浮层表面容器类名
 *
 * @description
 * 圆角 + 内边距 —— Dialog / AlertDialog / Drawer / Sheet 共用。
 *
 * 📌 Drawer 的圆角是**方向相关**的（`rounded-t-lg` / `rounded-b-lg`），
 *    由调用方追加覆盖（`twMerge` 末位优先）。
 */
export const overlaySurfaceClass = 'rounded-lg p-4';

/**
 * 关闭按钮**位置**类名
 *
 * @description
 * 只管**位置**，不管形状与尺寸 ——
 * 因为「形状 / 尺寸」的实现载体不同：
 *
 * - 原生 `<button>` + `<XIcon>` 子元素（Dialog / Drawer / Sheet）：
 *   用 `overlayCloseButtonClass`（位置 + 形状 + 图标尺寸）；
 * - `CloseButton` 组件（AlertDialog / Toast）：
 *   它**自带** `rounded-md p-0.5` 与 `h-4 w-4` 图标，
 *   再叠加 `rounded-xs` 会被 `twMerge` 判为冲突并**丢弃**
 *   （`rounded-*` 属同一冲突组，末位优先）。
 *   故这类场景只叠加**位置** + 用 `!rounded-xs` 强制覆盖形状。
 */
export const overlayCloseButtonPositionClass = 'absolute top-4 right-4';

/**
 * 关闭按钮类名（原生 `<button>` + `<XIcon>` 场景）
 *
 * @description
 * 位置（`absolute top-4 right-4`）+ 形状（`rounded-xs` 方角）
 * + 尺寸（`size-6` / 24px 方形按钮盒）+ 视觉权重（`opacity-70` → hover `opacity-100`）。
 *
 * 📌 **形状统一为 `rounded-xs`**（以 Dialog 为准）——
 *    此前 AlertDialog 用 `rounded-full`（圆形），三者互不一致。
 *
 * 📌 **尺寸统一为 `size-6`（24px）** —— 按钮盒固定 24×24，
 *    图标仍为 `size-4`（16px）居中：
 *    - 与 `CloseButton` 场景（`overlayCloseIconButtonClass`）**像素级一致**；
 *    - 满足图标按钮点击热区 ≥ 24px 的可访问性要求；
 *    - 使 `overlayHeaderPrClass`（`pr-10` = 24 + 16）在一类实现中都成立。
 *
 * 📌 **内边距 `p-0`** —— 图标在 24px 方框内**居中**，
 *    不额外留白，避免「内边距过大导致按钮看起来偏大」。
 *
 * 📌 **不写 `data-[state=open]:bg-accent`** —— 关闭按钮自身没有
 *    `data-state="open"`（那是 Trigger / Overlay 才有的状态），
 *    该规则是历史遗留且语义错误，移除以免误判为「选中态」。
 */
export const overlayCloseButtonClass =
  'absolute top-4 right-4 inline-flex size-6 items-center justify-center rounded-xs p-0 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

/**
 * `CloseButton` 组件场景的关闭按钮类名
 *
 * @description
 * ⚠️ **必须用 `!rounded-xs`** —— `CloseButton` 的基础类含 `rounded-md`，
 *    `twMerge` 会把同组的 `rounded-xs` **丢弃**（末位优先原则），
 *    导致形状仍是 `rounded-md`，与 Dialog 不一致。
 *    `!` 前缀（Tailwind v4 语法）提高优先级，**后于** `twMerge` 生效。
 *
 * 📌 **`p-0`** —— `CloseButton` 基础类含 `p-0.5`（2px），
 *    与 Dialog（`p-0`，尺寸仅由图标决定）**不一致**。
 *    这里强制清零，使两类实现**像素级一致**。
 *
 * 📌 **`size-6`（24px）** —— 保证图标按钮的点击热区足够（可访问性要求 ≥ 24px）；
 *    配合 `p-0` + 图标 `size-4`，图标在 24px 方框内**居中**，
 *    与 Dialog 的 `size-4` 图标 + `top-4 right-4` 视觉重心相同。
 *
 * 📌 **图标 `size-4` + `shrink-0`** —— 与 Dialog 的 `[&_svg]:size-4` 完全一致；
 *    `CloseButton` 自带的 `h-4 w-4` 不含 `shrink-0`，
 *    在 flex 容器中可能被压缩，故此处强制覆盖。
 */
export const overlayCloseIconButtonClass =
  '!rounded-xs absolute top-4 right-4 inline-flex size-6 items-center justify-center p-0 opacity-70 transition-opacity hover:opacity-100 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none';

/**
 * 标题区右侧留白（为右上角关闭按钮预留空间）
 *
 * @description
 * 标题文本**不得延伸到关闭按钮下方** ——
 * 关闭按钮是 `absolute` 定位（不占布局空间），
 * 故标题区必须**显式预留右侧空间**。
 *
 * 📌 取值 = 关闭按钮占位（24px）+ 按钮到容器右边缘的间距（`right-4` = 16px）
 *    = 40px = `pr-10`。
 *
 * ⚠️ 这是「内容永不被压住」的**硬约束** ——
 *    缺了它，长标题会与关闭按钮重叠（用户反馈的缺陷）。
 */
export const overlayHeaderPrClass = 'pr-10';
