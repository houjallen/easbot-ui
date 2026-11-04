import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import { useGlobals } from 'storybook/preview-api';
import ThemeProvider from './providers/theme-provider';
import { GLOBAL_KEY, normalizeLocale } from './addon/eas-addon-locale/constants';
import { LocaleProvider, NotifyProvider } from '../src/providers';
import '../src/theme/styles.css';
// 图标字体 —— `Icon` 的 `type="class"` 模式依赖它提供字形。
//
// ⚠️ **必须显式引入**：`styles.css` **不含** iconfont（它是 opt-in 产物，
// 由 `pnpm build:icons` 生成到 `dist/iconfont.css`，不并入 `styles.css`）。
//
// 📌 这里引的是**源 CSS**（`src/theme/styles/iconfont/iconfont.css`）——
//    它携带 796 个 `.icon-xxx:before` 的 content 码点映射，
//    而**字体文件**由 `staticDirs` 映射的 `public/icon/` 提供（`/icon/xxx`）。
//    两者的分工与消费方拿到的 `dist/iconfont.css` 完全一致。
import '../src/theme/styles/iconfont/iconfont.css';
import '../src/theme/styles/iconfont/officefont.css';

/**
 * Storybook 全局预览配置
 *
 * 设计要点：
 *
 * 1. **零孤儿 import** —— 原配置 import 了 5 个本仓库不存在的模块
 *    （`@/components/providers/theme-provider` / `@/context/app-context` / `@/store` /
 *    `@/context/query-client`），导致 Storybook 启动即崩。本组件库不依赖任何应用级 Provider。
 *
 * 2. **引入组件样式** —— `../src/theme/styles.css` 是 Tailwind v4 源入口，
 *    由 Vite builder 现场编译（含主题变量与动画工具类）。
 *
 * 3. **主题切换用 `withThemeByClassName`** —— `@storybook/addon-themes` 在 `<html>`
 *    上切换 **class**（`class="light"` / `class="dark"`），并提供工具栏选择器。
 *
 * 4. **同时同步 `data-theme` 属性** —— 本库主题 CSS 的选择器约定是
 *    `:root[data-theme='light']` / `:root[data-theme='dark']`（**属性**选择器），
 *    与 addon 的 **class** 约定不是一回事。故在装饰器里同步写入 `data-theme`，
 *    让两套选择器同时命中 —— addon 负责工具栏与 class，本属性负责主题变量生效。
 *
 * 5. **`requestAnimationFrame` 延后写属性** —— 装饰器渲染期间 `<html>` 上
 *    可能尚未挂载 addon 写入的 class；延后一帧可确保读到的是最终主题，
 *    避免切换瞬间出现"class 已变、属性未变"的主题闪跳。
 *
 * 6. **语言切换用本地 addon `eas-addon-locale`** —— 工具栏上的
 *    `eas-language` 下拉（manager 端）通过 **globals 通道**（`easLocale`）把选中的语言
 *    传进来，本文件在装饰器里用 `useGlobals()` 读出并**归一化**，
 *    再包一层 **`LocaleProvider`**（`src/providers/locale-provider.tsx`）传给子树 ——
 *    与消费方的接入方式完全一致，story 内所有使用内置 i18n 的组件随之切换语言。
 *    `setLocale` **桥接回 globals**，使 story 内的 `LocaleToggle`
 *    等组件也能反向驱动工具栏状态（双向同步）。
 *
 *    📌 装饰器**有且仅有一处**挂载 `LocaleProvider` ——
 *    addon 的 `withLocale` **不挂载**（否则会出现两层嵌套的 `LocaleProvider`）。
 */
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      // 📌 语言从 **globals** 取（工具栏 `eas-addon-locale` 写入），
      //    归一化后包一层 `LocaleProvider` 传给子树 —— 与消费方接入方式一致。
      //
      // ⚠️ **必须优先读 `context.globals`** —— 装饰器的 `context` 参数
      //    会随 globals 变更而更新（`theme` 正是靠它同步的）；
      //    而装饰器顶层的 `useGlobals()` 返回的是**首次渲染**的快照，
      //    globals 变更后**不会**更新 —— 用它会导致「工具栏点了没反应」。
      const locale = normalizeLocale(context.globals?.[GLOBAL_KEY] as string | undefined);
      // `updateGlobals` 仅用于 `setLocale` 回写（story 内组件反向驱动工具栏）
      const [, updateGlobals] = useGlobals();
      return (
        <ThemeProvider
          attribute="data-theme" // 对于基于 data-theme 属性的主题至关重要
          theme={theme} // 在初始加载时设置主题
          enableSystem // 允许主题遵循系统偏好设置
          // storageKey="storybook-theme" // 可选：为 Storybook 使用不同的 localStorage 键名
          // DesignSystemProvider 的可选 URL 属性，如果在 Storybook 上下文中需要的话
          // privacyUrl="#"
          // termsUrl="#"
          // helpUrl="#"
        >
          <LocaleProvider
            locale={locale}
            setLocale={(next: string) => {
              updateGlobals({ [GLOBAL_KEY]: normalizeLocale(next) });
            }}
          >
            <NotifyProvider>
              {/*
               * 内容容器 —— 允许**超出时滚动**。
               *
               * 📌 `layout: 'centered'` 会给内容加 `display: inline-block` + 居中，
               *    对 `Table` 这类宽内容会撑破视口；这里改用 `max-w-full` +
               *    `overflow-auto` 的定宽容器，超出部分走滚动条而非溢出裁切。
               */}
              <div className="max-h-[80vh] w-full max-w-full overflow-auto p-8">
                <Story />
              </div>
            </NotifyProvider>
          </LocaleProvider>
        </ThemeProvider>
      );
    },
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
