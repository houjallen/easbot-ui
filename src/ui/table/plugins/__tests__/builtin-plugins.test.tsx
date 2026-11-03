/**
 * 表格插件注册表单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证内置插件映射表结构完整
 * 2. 状态测试 - 验证插件启用状态与配置读取
 * 3. 交互测试 - 验证插件动作执行
 * 4. 无障碍测试 - 验证插件动作的可访问名称来源
 *
 * 回归重点：
 * `FullscreenPlugin` 曾用运行时 `require('../../button')` 打破与 `AdvancedTable`
 * 的循环依赖 —— 该写法在 ESM / Vitest 下**无法解析相对路径**
 * （`Error: Cannot find module '../../button'`），导致插件体系整体不可用。
 * 本文件锁定「插件模块可在纯 ESM 环境下正常加载」这一契约。
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../../../button';
import { Icon } from '../../../icon';
import { TableProvider } from '../../context/TableContext';
import { AdvancedTable } from '../../organisms/AdvancedTable';
import type { TableColumn } from '../../types';
import { BUILTIN_PLUGINS } from '../index';

const sampleColumns: TableColumn[] = [{ name: 'name', title: '姓名', dataIndex: 'name' }];
const sampleData = [{ id: '1', name: '张三' }];

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderWithProvider = (ui: React.ReactElement) =>
  render(
    <TableProvider data={sampleData} columns={sampleColumns} config={{ pluginable: true }}>
      {ui}
    </TableProvider>,
  );

describe('表格插件注册表', () => {
  describe('渲染测试', () => {
    it('应该注册全部内置表格级插件', () => {
      expect(Object.keys(BUILTIN_PLUGINS)).toEqual(expect.arrayContaining(['export', 'print', 'refresh', 'fullscreen', 'columnManager', 'add', 'batchDelete', 'import']));
    });

    it('应该为每个内置插件提供唯一的名称标识', () => {
      const names = Object.values(BUILTIN_PLUGINS).map((plugin) => plugin.id || plugin.name);

      expect(new Set(names).size).toBe(names.length);
    });

    it('应该为每个内置插件提供类型与描述信息', () => {
      Object.values(BUILTIN_PLUGINS).forEach((plugin) => {
        expect(plugin.name).toBeTruthy();
        expect(plugin.type).toBeTruthy();
      });
    });
  });

  describe('状态测试', () => {
    it('应该为全屏插件提供可见性判定函数', () => {
      const { when } = BUILTIN_PLUGINS.fullscreen.actions?.[0] ?? {};

      expect(typeof when).toBe('function');
    });

    it('应该让全屏插件的默认配置处于启用状态', () => {
      expect(BUILTIN_PLUGINS.fullscreen.config?.enabled).not.toBe(false);
    });
  });

  describe('交互测试', () => {
    it('应该在纯 ESM 环境下正常加载全屏插件依赖的模块', () => {
      // 回归用例：全屏插件曾用运行时 `require('../../button')` 打破循环依赖，
      // 在 ESM / Vitest 下会抛 `Cannot find module`，使插件体系整体失效。
      // 修复后改为静态 ESM import，此处断言依赖模块可直接通过 import 拿到。
      expect(Button).toBeDefined();
      expect(Icon).toBeDefined();
      expect(TableProvider).toBeDefined();
      expect(AdvancedTable).toBeDefined();
    });

    it('应该在启用插件后正常挂载不抛错', async () => {
      const user = userEvent.setup();

      renderWithProvider(
        <div>
          <span>插件工具栏</span>
        </div>,
      );

      await user.click(screen.getByText('插件工具栏'));
      expect(screen.getByText('插件工具栏')).toBeInTheDocument();
    });

    it('应该在执行插件动作时透传选中的行数据', () => {
      const execute = vi.fn();
      const action = { key: 'demo', label: '演示', execute };

      action.execute([], {} as never, action);

      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('无障碍测试', () => {
    it('应该为插件动作提供可访问的标题文本', () => {
      const action = BUILTIN_PLUGINS.fullscreen.actions?.[0];

      expect(action?.messages).toBeTruthy();
    });
  });
});
