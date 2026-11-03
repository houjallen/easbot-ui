/**
 * Switch 主题 token 一致性回归测试
 *
 * @description
 * 守护 **Switch thumb 与 track 的反差契约**。
 *
 * ## 历史事故（两轮反复）
 *
 * 1. **light 态状态类缺失** —— 源码只写了
 *    `dark:data-[state=checked]:bg-primary-foreground`，
 *    light 下 thumb 恒为 `bg-background`（白），
 *    checked 态（近黑轨道）配白 thumb → 反差不足、状态难辨。
 * 2. **改用 `bg-background` 修 1 后，dark 下更糟** ——
 *    `--background` 在 dark 是近黑，落在深色轨道上**完全看不出滑块**。
 *
 * ## 正确做法
 *
 * 参考 Material Design 1「Selection controls / Switch」：
 *
 * | 状态   | Light                          | Dark                           |
 * | ------ | ------------------------------ | ------------------------------ |
 * | Thumb  | Grey 50 #FAFAFA 100%           | Grey 400 #BDBDBD 100%          |
 * | Track  | #000000 38%                    | #FFFFFF 30%                    |
 *
 * 关键：**unchecked 的 thumb 不是背景色**，而是一个**不透明的中灰**；
 * 轨道是**半透明**的 —— 靠「实心 thumb + 半透明 track」拉开层次。
 *
 * 故 thumb 配色必须走**独立 token**（`--switch-thumb-*`），
 * 由 light.css / dark.css 分别赋值，组件侧**不得**使用 `bg-background`
 * 或 `dark:` 变体。
 *
 * 该缺陷无法被组件级单测捕获（jsdom 不解析 CSS 变量），
 * 故在此对**主题源码文本**做静态断言。
 *
 * @see {@link file://./src/theme/themes/light.css}
 * @see {@link file://./src/theme/themes/dark.css}
 * @see {@link file://./src/design-system/components/ui/switch.tsx}
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THEMES = join(__dirname, '..', 'src', 'theme', 'themes');
const DS = join(__dirname, '..', 'src', 'design-system', 'components', 'ui');

const lightCss = readFileSync(join(THEMES, 'light.css'), 'utf8');
const darkCss = readFileSync(join(THEMES, 'dark.css'), 'utf8');
const switchSource = readFileSync(join(DS, 'switch.tsx'), 'utf8');

/**
 * 去掉 JSX 注释（`// ...`）后再做类名断言。
 *
 * 📌 必须做 —— 组件源码里为了说明「为何不能用 `bg-background`」，
 *    注释中会引用 `bg-background` 字面量，不剥离会误判为「用了该类」。
 */
const stripLineComments = (src: string) => src.replace(/^\s*\/\/.*$/gm, '');

/** 取某主题下指定变量的值（未定义返回 undefined） */
const tokenValue = (css: string, name: string): string | undefined => css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1]?.trim();

describe('Switch 主题 token —— thumb / track 反差契约', () => {
  describe('token 定义', () => {
    it('light / dark 都必须定义 --switch-thumb-unchecked-background', () => {
      expect(tokenValue(lightCss, '--switch-thumb-unchecked-background')).toBeDefined();
      expect(tokenValue(darkCss, '--switch-thumb-unchecked-background')).toBeDefined();
    });

    it('light / dark 都必须定义 --switch-thumb-checked-background', () => {
      expect(tokenValue(lightCss, '--switch-thumb-checked-background')).toBeDefined();
      expect(tokenValue(darkCss, '--switch-thumb-checked-background')).toBeDefined();
    });

    it('light / dark 都必须定义 track 配色 token', () => {
      for (const name of ['--switch-checked-background', '--switch-unchecked-background']) {
        expect(tokenValue(lightCss, name)).toBeDefined();
        expect(tokenValue(darkCss, name)).toBeDefined();
      }
    });

    it('两套主题的 token 集合必须一致（避免只写一套）', () => {
      const names = (css: string) => new Set([...css.matchAll(/(--switch-[\w-]+)\s*:/g)].map((m) => m[1]));

      const light = names(lightCss);
      const dark = names(darkCss);

      // dark 不得有 light 没有的 token（反之亦然）
      expect([...dark].filter((n) => !light.has(n))).toEqual([]);
      expect([...light].filter((n) => !dark.has(n))).toEqual([]);
    });
  });

  describe('反差契约（关键不变量）', () => {
    it('unchecked thumb 不得指向 --background（dark 下 = 近黑，与轨道无反差）', () => {
      for (const [name, css] of [
        ['light', lightCss],
        ['dark', darkCss],
      ] as const) {
        const value = tokenValue(css, '--switch-thumb-unchecked-background');

        expect(value, `${name} 主题的 unchecked thumb 不应是背景色`).not.toBe('var(--background)');
      }
    });

    it('unchecked thumb 必须是**不透明**颜色（不能是 transparent / 半透明）', () => {
      for (const [name, css] of [
        ['light', lightCss],
        ['dark', darkCss],
      ] as const) {
        const value = tokenValue(css, '--switch-thumb-unchecked-background') ?? '';

        expect(value, `${name} 主题的 unchecked thumb 必须不透明`).not.toContain('transparent');
        expect(value).not.toContain('color-mix');
      }
    });

    it('checked thumb 必须与 checked track 互为反色', () => {
      // 本库约定：`--primary` / `--primary-foreground` 互为反色
      for (const [name, css] of [
        ['light', lightCss],
        ['dark', darkCss],
      ] as const) {
        expect(tokenValue(css, '--switch-checked-background')).toBe('var(--primary)');
        expect(tokenValue(css, '--switch-thumb-checked-background')).toBe('var(--primary-foreground)');
      }
    });

    it('unchecked track 必须指向半透明背景（而非实心边框色）', () => {
      // ⚠️ `--input` 已改为不透明**边框色**，
      //    若 track 指向它，unchecked 轨道会变成实心深色，视觉过重。
      for (const [name, css] of [
        ['light', lightCss],
        ['dark', darkCss],
      ] as const) {
        expect(tokenValue(css, '--switch-unchecked-background')).toBe('var(--input-background)');
      }
    });
  });

  describe('组件侧用法', () => {
    /** 去掉注释后的组件源码（用于类名断言） */
    const switchCode = stripLineComments(switchSource);

    /** 提取 thumb 的类名字符串 */
    const thumbClasses = (): string => switchCode.match(/data-slot="switch-thumb"[\s\S]*?className=\{cn\(\s*'([^']*)'/)?.[1] ?? '';

    it('thumb 不得使用 bg-background', () => {
      expect(thumbClasses()).not.toMatch(/(^|\s)bg-background(\s|$)/);
    });

    it('thumb 不得使用 dark: 变体（light / dark 走同一套 token）', () => {
      expect(thumbClasses()).not.toContain('dark:');
    });

    it('thumb 必须引用 --switch-thumb-* token', () => {
      expect(thumbClasses()).toContain('--switch-thumb-unchecked-background');
      expect(thumbClasses()).toContain('--switch-thumb-checked-background');
    });

    it('track 必须引用 --switch-* 语义 token', () => {
      const trackClasses = switchCode.match(/data-slot="switch"[\s\S]*?className=\{cn\(\s*'([^']*)'/)?.[1] ?? '';

      expect(trackClasses).toContain('--switch-checked-background');
      expect(trackClasses).toContain('--switch-unchecked-background');
    });
  });
});
