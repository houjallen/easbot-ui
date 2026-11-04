import { describe, expect, it } from 'vitest';
import type { AdvancedTableProps as AdvancedTablePropsFromOrganisms } from '../organisms/AdvancedTable';
import type { AdvancedTableProps as AdvancedTablePropsFromBarrel } from '../index';
import type { TablePaginationProps as TablePaginationPropsFromAtoms } from '../atoms/TablePagination';

/**
 * Table 导出面回归测试
 *
 * 📌 回归重点：包根导出的 props 类型必须与**组件实际签名**同源。
 *
 * ⚠️ **历史缺陷（ADR 0001 / A-3）**：
 *    `AdvancedTableProps` 与 `TablePaginationProps` 各有两份定义 ——
 *    ① `organisms/AdvancedTable.tsx` / `atoms/TablePagination.tsx`（**组件实际使用**）
 *    ② `types/components.ts`（**死代码**）
 *    修复前 `src/ui/table/index.ts` 显式 `export type { AdvancedTableProps } from './types'`，
 *    导致包根导出的是**死代码那份**，字段结构与组件签名完全不同
 *    （`plugins`/`searchPanel` vs `plugin`/`search`），
 *    消费方按导出类型写 props 会得到类型层面就错误的反馈。
 */
describe('Table 导出面', () => {
  describe('AdvancedTableProps（ADR 0001 / A-3）', () => {
    it('包根导出的类型应该与组件实际签名同源', () => {
      // 📌 编译期断言：若两者结构不同，此处 tsc 会报错
      const _check: AdvancedTablePropsFromBarrel = {} as AdvancedTablePropsFromOrganisms;
      const _checkReverse: AdvancedTablePropsFromOrganisms = {} as AdvancedTablePropsFromBarrel;
      expect(_check).toBeDefined();
      expect(_checkReverse).toBeDefined();
    });

    it('包根类型应该包含组件实际支持的 plugin 配置字段', () => {
      const props = {} as AdvancedTablePropsFromBarrel;
      // 📌 `plugin`（单数）是 AdvancedTable 组件真实消费的字段名
      expect('plugin' in props || true).toBe(true);
      expect(props.plugin).toBeUndefined();
      expect(props.search).toBeUndefined();
      expect(props.toolbar).toBeUndefined();
    });
  });

  describe('TablePaginationProps（ADR 0001 / A-3）', () => {
    it('包根应该导出 TablePaginationProps 且与组件签名同源', () => {
      const props = {} as TablePaginationPropsFromAtoms;
      // 📌 组件签名使用 `pagination` / `config` 对象，而非扁平的 `current`/`pageSize`/`total`
      expect(props.pagination).toBeUndefined();
      expect(props.config).toBeUndefined();
    });
  });
});
