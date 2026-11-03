/**
 * 主题层级（z-index）回归测试
 *
 * @description
 * 守护 **弹层「透底」** 类问题的根因防线。
 *
 * ## 历史事故
 *
 * `src/theme/styles/prefix.css` 里为了让 Radix 弹层 wrapper 覆盖掉
 * Radix 自己的内联 `z-index`，写的是：
 *
 * ```css
 * z-index: var(--eas-z-index-context-menu, var(--eas-z-index-dropdown)) important;
 * ```
 *
 * 裸 `important`（缺 `!`）是**非法 CSS** —— 浏览器**静默丢弃整条声明**
 * 且**不报任何错**。后果：
 *
 * 1. wrapper 保留 Radix 内联的 `z-index: 50`；
 * 2. 宿主页面上任意高层级容器（Storybook 的 `#storybook-root` 为
 *    `z-index: 1300`）都盖在弹层之上；
 * 3. 表现为「弹层透底，能看见下层文字」。
 *
 * 该缺陷**不会**被组件级单测捕获（jsdom 无法解析 CSS 变量，
 * 且样式断言只看 className），故在此对**源码文本**做静态断言。
 *
 * @see {@link file://./src/theme/styles/prefix.css}
 * @see {@link file://./src/theme/themes/variables.css}
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'src');

const PREFIX_CSS_PATH = join(SRC, 'theme', 'styles', 'prefix.css');
const VARIABLES_CSS_PATH = join(SRC, 'theme', 'themes', 'variables.css');

const prefixCss = readFileSync(PREFIX_CSS_PATH, 'utf8');
const variablesCss = readFileSync(VARIABLES_CSS_PATH, 'utf8');

/**
 * 去掉 CSS 注释，避免注释里的文字干扰匹配。
 *
 * 📌 必须做 —— `prefix.css` 的注释里会引用 `!important` / `important` 字样
 *    （如「此处必须是 `!important`（带感叹号）」），不剥离会误判。
 */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const prefixCssNoComment = stripComments(prefixCss);

describe('主题层级 —— prefix.css 弹层层级兜底', () => {
  describe('语法合法性', () => {
    it('z-index 声明不得出现裸 important（缺感叹号的非法写法）', () => {
      // 匹配 `important` 前一个字符不是 `!` 的情况
      const bareImportant = prefixCssNoComment.match(/[^!]\bimportant\b/g) ?? [];

      expect(bareImportant).toEqual([]);
    });

    it('与 Radix 内联 z-index 竞争的 popper / menu 规则必须带 !important', () => {
      // 📌 只有 popper / menu 规则需要 `!important` ——
      //    Radix 把 `z-index` 写在 **inline style** 上，优先级高于任何选择器。
      //    对话框类（dialog / alert-dialog）走的是组件内的
      //    `z-[var(--eas-z-index-dialog)]` 工具类，prefix.css 里的规则只是**兜底**，
      //    无需 `!important`（加了反而会盖掉消费方的自定义层级）。
      const rules = prefixCssNoComment.match(/(?:body[^{]*popper[^{]*|body[^{]*menu-content[^{]*)\{[^}]*\}/g) ?? [];

      expect(rules.length).toBeGreaterThan(0);
      for (const rule of rules) {
        const decls = rule.match(/z-index:[^;]+;/g) ?? [];
        for (const decl of decls) {
          expect(decl.trimEnd().endsWith('!important;')).toBe(true);
        }
      }
    });
  });

  describe('Popper 弹层层级', () => {
    it('必须为 popper wrapper 声明层级（覆盖 Radix 内联 z-index: 50）', () => {
      expect(prefixCssNoComment).toContain('[data-radix-popper-content-wrapper]');
    });

    it('popper wrapper 与菜单内容层必须使用同一层级变量', () => {
      // wrapper 与 content 若层级不一致，内容层会被 wrapper 背景遮挡
      const wrapperRule = prefixCssNoComment.match(/body \[data-radix-popper-content-wrapper\]\s*\{[^}]*\}/)?.[0];
      const contentRule = prefixCssNoComment.match(/body \[data-radix-menu-content\],\s*body \[data-slot='dropdown-menu-content'\]\s*\{[^}]*\}/)?.[0];

      expect(wrapperRule).toBeDefined();
      expect(contentRule).toBeDefined();

      const varOf = (rule: string) => rule.match(/var\((--eas-z-index-[\w-]+)/)?.[1];
      expect(varOf(wrapperRule as string)).toBe(varOf(contentRule as string));
    });

    it('popper 层级必须高于 dialog 内容层（保证 Dialog 内的下拉不被面板压住）', () => {
      const popperZ = Number(variablesCss.match(/--eas-z-index-popper:\s*(\d+)/)?.[1]);
      const dialogZ = Number(variablesCss.match(/--eas-z-index-dialog:\s*(\d+)/)?.[1]);

      expect(popperZ).toBeGreaterThan(dialogZ);
    });

    it('popper 层级必须高于 --eas-z-index-max 的兜底值之外（留出层级空间）', () => {
      const popperZ = Number(variablesCss.match(/--eas-z-index-popper:\s*(\d+)/)?.[1]);
      const maxZ = Number(variablesCss.match(/--eas-z-index-max:\s*(\d+)/)?.[1]);

      // 需高于 dialog(1400) 且不超过 max(1500)
      expect(popperZ).toBeGreaterThan(1400);
      expect(popperZ).toBeLessThanOrEqual(maxZ);
    });
  });

  describe('层级变量定义', () => {
    it('--eas-z-index-popper 必须已定义', () => {
      expect(variablesCss).toMatch(/--eas-z-index-popper:\s*\d+/);
    });

    it('light / dark 两套主题的层级变量保持一致', () => {
      // 层级变量在 variables.css 中单点定义（两套主题共用），
      // 此处断言其不在 light.css / dark.css 中被重复覆盖 —— 避免主题切换后层级漂移。
      for (const theme of ['light.css', 'dark.css'] as const) {
        const themeCss = readFileSync(join(SRC, 'theme', 'themes', theme), 'utf8');
        expect(themeCss).not.toMatch(/--eas-z-index-popper\s*:/);
      }
    });
  });
});
