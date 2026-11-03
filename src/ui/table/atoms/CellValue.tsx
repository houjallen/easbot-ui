/**
 * 表格单元格值渲染组件
 * 根据列类型渲染不同的值展示
 */

import { useTableLogic } from '../index';
import React from 'react';
import type { TableColumn } from '../types/base';
import { generateTableCell } from '../utils/field-generator';

/**
 * CellValue组件属性接口
 */
export interface CellValueProps {
  /** 单元格值 */
  value: any;
  /** 列配置 */
  column: TableColumn;
  /** 行数据 */
  record: Record<string, any>;
  /** 行索引 */
  index: number;
  /** 获取列值的函数 */
  getColumnValue?: (record: Record<string, any>, column: TableColumn) => any;
}

/**
 * 表格单元格值渲染组件
 * 根据列类型渲染不同的值展示
 */
export const CellValue: React.FC<CellValueProps> = ({ value, column, record, index, getColumnValue }) => {
  const tableLogic = useTableLogic();
  const t = tableLogic.i18n.t;
  const locale = tableLogic.i18n.locale;
  // 获取实际要显示的值（保持原有行为）
  const displayValue = getColumnValue ? getColumnValue(record, column) : value;

  // 统一通过 field-generator 的入口渲染
  // generateTableCell 内部已处理 column.render、自定义类型、image/file/boolean(trueValue/falseValue) 等
  return generateTableCell(column, displayValue, record, {
    context: 'static',
    maxTags: 3,
    t: t,
    locale: locale,
    // 按列配置生效：列开了 ellipsis 则强制加 title 提示
    ellipsis: column.ellipsis === true,
    tooltip: column.ellipsis === true ? true : undefined,
  });
};

CellValue.displayName = 'CellValue';
