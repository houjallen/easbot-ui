/**
 * 主题资源层扩展主题索引
 *
 * @description
 * 本文件管理 **5 套扩展主题**（`variants/` 目录）——
 * 高对比度 / 柔和 / 深海 / 森林 / 护眼。
 *
 * ⚠️ **扩展主题当前不进构建产物** ——
 * 唯一编译入口 [`src/theme/styles.css`](../styles.css) 只 `@import` 了
 * `themes/light.css` 与 `themes/dark.css` 两套基础主题；
 * 本文件仅**声明**扩展主题的元信息，供消费方按需单独引入。
 *
 * 📌 **公开 API 的 `Theme` 类型是 2 值**（`light` / `dark`）——
 * 见 [`src/theme/index.ts`](../index.ts)（该文件是 barrel 导出面，
 * 经 `src/index.ts` 进入公开 API）。本文件的 7 值类型是**资源层**的，不对外暴露。
 */

import './variants/high-contrast.css';
import './variants/soft.css';
import './variants/deep-ocean.css';
import './variants/forest.css';
import './variants/eye-care.css';

/** 资源层主题标识（7 套，含 5 套扩展主题） */
export type ResourceTheme = 'light' | 'dark' | 'high-contrast' | 'soft' | 'deep-ocean' | 'forest' | 'eye-care';

/** 资源层主题中文名映射 */
export const resourceThemes: Record<ResourceTheme, string> = {
  light: '亮色',
  dark: '暗色',
  'high-contrast': '高对比度',
  soft: '柔和',
  'deep-ocean': '深海',
  forest: '森林',
  'eye-care': '护眼',
};
