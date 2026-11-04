/**
 * 本地 addon 的共享常量
 *
 * @description
 * `eas-addon-locale` 的 **manager 端**与 **preview 端**共用同一份常量，
 * 保证「工具栏注册的全局键」与「preview 读取的全局键」**严格一致**——
 * 两端不一致时工具栏点击不会触发 preview 重渲染（典型的静默失效）。
 *
 * 命名规则参照 `@storybook/addon-themes`：
 * - `ADDON_ID` —— addon 唯一标识（`storybook/<name>` 命名空间）；
 * - `PARAM_KEY` —— parameters 键；
 * - `GLOBAL_KEY` —— globals 键（工具栏与 preview 通信的**唯一通道**）；
 * - `TOOL_ID` —— 工具栏按钮 ID。
 *
 * ⚠️ **globals 键不可与 Storybook 内置 globals 冲突** —— 内置保留
 * `locale` / `theme` / `viewport` / `backgrounds` 等，本 addon 使用
 * 自带命名空间的 `easLocale`，避免覆盖 Storybook 自身的语言设置能力。
 */

/** addon 唯一标识（`storybook/<name>` 命名空间） */
export const ADDON_ID = 'storybook/eas-locale';

/** parameters 键 —— story 级可覆盖默认值 */
export const PARAM_KEY = 'easLocale';

/** globals 键 —— 工具栏与 preview 通信的唯一通道 */
export const GLOBAL_KEY = 'easLocale';

/** 工具栏按钮 ID */
export const TOOL_ID = `${ADDON_ID}/locale-switcher`;

/**
 * 可选语言清单
 *
 * @description
 * 与 `src/utils/locale.ts` 的 `SUPPORTED_LOCALES` **保持一致**——
 * 该文件是本库 i18n 的唯一定义源（见 `spec/i18n-standard.md`）。
 *
 * 📌 这里刻意**不**从 `src/` import —— manager 端跑在 **Storybook 的
 * manager bundle** 里，不在 Vite / React 应用的模块图内，
 * 跨目录 import 会把整个 `src/utils` 依赖树拖进 manager bundle。
 * 故此处为**手工同步**的常量，改动 `SUPPORTED_LOCALES` 时必须同步此处。
 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;

/** 语言类型 */
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** 默认语言 */
export const DEFAULT_LOCALE: Locale = 'zh-CN';

/**
 * 语言显示名
 *
 * @description
 * 工具栏下拉选项上展示的名称。
 *
 * ⚠️ **刻意使用「语言自称」而非「英语名」** —— 惯例是每种语言
 * 用**自己**的语言称呼自己（中文用户看到「简体中文」而非「Chinese」，
 * 英文用户看到「English」而非「英语」），这是 i18n 的通用做法。
 * 因此这里**不能**按当前界面语言切换显示名，否则用户会看不懂选项。
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};

/**
 * 判断字符串是否为受支持的语言
 *
 * @param locale 待判断的语言标识
 * @returns 是否受支持
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * 规范化语言标识
 *
 * @description
 * 把任意语言标识归一到 `SUPPORTED_LOCALES` 中的某一项：
 * - `zh` / `zh-TW` / `zh-CN` → `zh-CN`
 * - `en` / `en-GB` / `en-US` → `en-US`
 * - 其他 → `DEFAULT_LOCALE`
 *
 * @param locale 待规范化的语言标识
 * @returns 受支持的语言标识
 */
export function normalizeLocale(locale: string | undefined): Locale {
  if (!locale) return DEFAULT_LOCALE;
  if (isSupportedLocale(locale)) return locale;
  const short = locale.split('-')[0];
  if (short === 'zh') return 'zh-CN';
  if (short === 'en') return 'en-US';
  return DEFAULT_LOCALE;
}
