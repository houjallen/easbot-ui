/**
 * useTableI18n Hook 单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证默认语言、合并后的文案表与支持的语言列表
 * 2. 状态测试 - 验证 t 的点号路径解析、参数插值与找不到时的 key 回退
 * 3. 交互测试 - 验证 setLocale 切换语言与 onLocaleChange 回调
 * 4. 无障碍测试 - 验证表格无障碍相关文案（选择 / 展开 / 操作列）的本地化结果
 *
 * 测试载体说明：
 * `useTableI18n` 是独立 Hook（不依赖 TableContext），用 `renderHook` 直接挂载即可。
 *
 * 关键约束：
 * - 未显式传入 `locale` 时，语言取自客户端（`getLocaleOnClient()`），
 *   因此用例通过覆写 `navigator.language` 把客户端语言固定为 `zh-CN`，保证断言稳定。
 * - `t` 找不到对应文案时回退为 **key 本身**，而不是空字符串。
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTableI18n } from '../useTableI18n';

describe('useTableI18n Hook', () => {
  beforeEach(() => {
    // 固定客户端语言为 zh-CN —— `getLocaleOnClient()` 在没有 Cookie 时回退到浏览器语言
    Object.defineProperty(navigator, 'language', { value: 'zh-CN', configurable: true });
  });

  afterEach(() => {
    // 还原浏览器语言，避免污染其它用例
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
  });

  describe('渲染测试', () => {
    it('应该在没有传入 locale 时使用客户端语言作为默认语言', () => {
      const { result } = renderHook(() => useTableI18n());

      expect(result.current.locale).toBe('zh-CN');
    });

    it('应该优先使用显式传入的 locale', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'en-US' }));

      expect(result.current.locale).toBe('en-US');
    });

    it('应该返回与当前语言匹配的合并文案表', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      expect(result.current.messages.selectAll).toBe('全选');
      expect(result.current.messages.emptyText).toBe('暂无数据');
    });

    it('应该返回英文语言下的文案表', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'en-US' }));

      expect(result.current.messages.selectAll).toBe('Select All');
      expect(result.current.messages.emptyText).toBe('No Data');
    });

    it('应该返回内置支持的语言列表', () => {
      const { result } = renderHook(() => useTableI18n());

      expect(result.current.getSupportedLocales()).toEqual(['zh-CN', 'en-US']);
    });

    it('应该把自定义文案合并进当前语言的文案表', () => {
      const { result } = renderHook(() =>
        useTableI18n({
          locale: 'zh-CN',
          messages: { 'zh-CN': { customText: '自定义文案' } },
        }),
      );

      expect(result.current.messages.customText).toBe('自定义文案');
      // 内置文案不被覆盖
      expect(result.current.messages.selectAll).toBe('全选');
    });
  });

  describe('状态测试', () => {
    it('应该通过点号路径解析嵌套文案', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      expect(result.current.t('pagination.total')).toBe('共 {total} 条');
      expect(result.current.t('rowAction.title')).toBe('操作');
    });

    it('应该在文案中插值参数', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      expect(result.current.t('pagination.total', { total: 35 })).toBe('共 35 条');
      expect(result.current.t('pagination.totalInfo', { total: 35, from: 1, to: 10 })).toBe('共 35 条，第 1-10 条');
    });

    it('应该在找不到文案时回退为 key 本身', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      expect(result.current.t('notExistKey')).toBe('notExistKey');
      expect(result.current.t('not.exist.path')).toBe('not.exist.path');
    });

    it('应该通过 getLocalizedText 读取文案并在缺失时回退为 key', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      expect(result.current.getLocalizedText('selectAll')).toBe('全选');
      expect(result.current.getLocalizedText('notExistKey')).toBe('notExistKey');
    });

    it('应该用 translateWithMessages 按自定义文案表翻译', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      const custom = { greeting: '你好，{name}' };

      expect(result.current.translateWithMessages('greeting', custom, { name: '小莫' })).toBe('你好，小莫');
      expect(result.current.translateWithMessages('missing', custom)).toBe('missing');
    });

    it('应该判断语言是否受支持', () => {
      const { result } = renderHook(() => useTableI18n());

      expect(result.current.isLocaleSupported('en-US')).toBe(true);
      expect(result.current.isLocaleSupported('zh-CN')).toBe(true);
      expect(result.current.isLocaleSupported('xx-XX')).toBe(false);
    });
  });

  describe('交互测试', () => {
    it('应该在切换语言后更新当前语言与文案', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      expect(result.current.t('selectAll')).toBe('全选');

      act(() => {
        result.current.setLocale('en-US');
      });

      expect(result.current.locale).toBe('en-US');
      expect(result.current.t('selectAll')).toBe('Select All');
    });

    it('应该在切换语言时触发 onLocaleChange 回调', () => {
      const onLocaleChange = vi.fn();
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN', onLocaleChange }));

      act(() => {
        result.current.setLocale('en-US');
      });

      expect(onLocaleChange).toHaveBeenCalledTimes(1);
      expect(onLocaleChange).toHaveBeenCalledWith('en-US');
    });

    it('应该在自定义文案表新增语言后把它列入支持列表', () => {
      const { result } = renderHook(() =>
        useTableI18n({
          locale: 'zh-CN',
          messages: { 'fr-FR': { selectAll: 'Tout sélectionner' } },
        }),
      );

      expect(result.current.getSupportedLocales()).toContain('fr-FR');
      expect(result.current.isLocaleSupported('fr-FR')).toBe(true);
    });
  });

  describe('无障碍测试', () => {
    it('应该本地化表格的无障碍相关文案', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'zh-CN' }));

      // 选择 / 展开行等文案被渲染层用于构建可访问名称
      expect(result.current.t('selectRow', { index: 3 })).toBe('选择第 3 行');
      expect(result.current.t('expandRow')).toBe('展开行');
      expect(result.current.t('collapseRow')).toBe('收起行');
      expect(result.current.t('actions')).toBe('操作');
    });

    it('应该在英文语言下返回对应的无障碍文案', () => {
      const { result } = renderHook(() => useTableI18n({ locale: 'en-US' }));

      expect(result.current.t('selectRow', { index: 3 })).toBe('Select Row 3');
      expect(result.current.t('expandRow')).toBe('Expand Row');
      expect(result.current.t('collapseRow')).toBe('Collapse Row');
    });
  });
});
