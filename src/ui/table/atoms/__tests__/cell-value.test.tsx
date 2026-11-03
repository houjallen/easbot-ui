/**
 * CellValue 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证文本 / 数字类型列的值渲染
 * 2. 状态测试 - 验证空值占位、截断包裹与自定义取值函数
 * 3. 交互测试 - 验证列自定义渲染函数的内容透传
 * 4. 无障碍测试 - 验证截断提示的 title 属性与空值占位语义
 *
 * 测试载体说明：
 * `CellValue` 强依赖 `TableProvider`（内部调用 `useTableLogic`），
 * 因此所有用例都在真实 `TableProvider` 下渲染，避免用 mock 掩盖上下文契约。
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from '../../context/TableContext';
import type { TableColumn } from '../../types';
import { CellValue } from '../CellValue';

/**
 * 文本类型列定义
 */
const textColumn: TableColumn = {
  name: 'name',
  title: '姓名',
  dataIndex: 'name',
  type: 'text',
};

/**
 * 数字类型列定义
 */
const numberColumn: TableColumn = {
  name: 'age',
  title: '年龄',
  dataIndex: 'age',
  type: 'number',
};

/**
 * 渲染助手 —— 统一包一层 TableProvider
 */
const renderCellValue = (ui: React.ReactElement) => render(<TableProvider>{ui}</TableProvider>);

describe('CellValue 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染文本类型列的值', () => {
      renderCellValue(<CellValue value="张三" column={textColumn} record={{ name: '张三' }} index={0} />);

      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    it('应该渲染数字类型列的值', () => {
      renderCellValue(<CellValue value={18} column={numberColumn} record={{ age: 18 }} index={0} />);

      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('应该把值渲染在静态文本容器中', () => {
      const { container } = renderCellValue(<CellValue value="张三" column={textColumn} record={{ name: '张三' }} index={0} />);

      const staticText = container.querySelector('.text-sm');
      expect(staticText).toBeInTheDocument();
      expect(staticText).toHaveTextContent('张三');
    });
  });

  describe('状态测试', () => {
    it('应该在值为空时渲染占位符', () => {
      renderCellValue(<CellValue value={null} column={textColumn} record={{ name: null }} index={0} />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('应该在列开启截断时用带 title 的容器包裹内容', () => {
      const { container } = renderCellValue(<CellValue value="张三" column={{ ...textColumn, ellipsis: true }} record={{ name: '张三' }} index={0} />);

      const wrapper = container.querySelector('span.truncate');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('title', '张三');
      expect(wrapper).toHaveTextContent('张三');
    });

    it('应该在列未开启截断时不添加截断容器', () => {
      const { container } = renderCellValue(<CellValue value="张三" column={textColumn} record={{ name: '张三' }} index={0} />);

      expect(container.querySelector('span.truncate')).not.toBeInTheDocument();
    });

    it('应该优先使用 getColumnValue 提供的取值结果', () => {
      const getColumnValue = vi.fn((record: Record<string, any>, column: TableColumn) => record[`custom_${column.name}`]);

      renderCellValue(<CellValue value="原始值" column={textColumn} record={{ custom_name: '覆盖值' }} index={0} getColumnValue={getColumnValue} />);

      expect(getColumnValue).toHaveBeenCalledWith({ custom_name: '覆盖值' }, textColumn);
      expect(screen.getByText('覆盖值')).toBeInTheDocument();
      expect(screen.queryByText('原始值')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该渲染列自定义 render 函数的输出', () => {
      const renderColumn: TableColumn = {
        name: 'name',
        title: '姓名',
        dataIndex: 'name',
        type: 'text',
        render: (value: any, record: Record<string, any>) => <span className="custom-cell">{`${record.name}-${value}`}</span>,
      };

      renderCellValue(<CellValue value="张三" column={renderColumn} record={{ name: '张三' }} index={0} />);

      expect(screen.getByText('张三-张三')).toBeInTheDocument();
    });

    it('应该在列自定义 render 抛错时回退到默认文本渲染', () => {
      const renderColumn: TableColumn = {
        name: 'name',
        title: '姓名',
        dataIndex: 'name',
        type: 'text',
        render: () => {
          throw new Error('渲染失败');
        },
      };

      renderCellValue(<CellValue value="张三" column={renderColumn} record={{ name: '张三' }} index={0} />);

      // 渲染失败时回退到静态文本
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该为空值占位提供弱化样式', () => {
      const { container } = renderCellValue(<CellValue value={undefined} column={textColumn} record={{}} index={0} />);

      const placeholder = container.querySelector('.text-muted-foreground');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveTextContent('-');
    });

    it('应该把数值内容渲染为纯文本', () => {
      const { container } = renderCellValue(<CellValue value={18} column={numberColumn} record={{ age: 18 }} index={0} />);

      expect(container.querySelector('.text-sm')).toHaveTextContent('18');
    });
  });
});
