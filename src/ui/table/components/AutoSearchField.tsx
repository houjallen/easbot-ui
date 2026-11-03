import { useTableLogic } from '../context/TableContext';
import { isEmpty } from '../../../utils/object';
import React from 'react';
import { useTableState } from '../context/TableContext';
import type { TableSize } from '../types/base';
import type { TableConfig } from '../types/base';
import type { SearchCondition, SearchFieldConfig } from '../types/base';
import { SearchFieldRenderer } from './SearchFieldRenderer';

/**
 * 自动搜索字段组件 - 专门处理autoSearch模式
 * 特点：onChange时立即触发搜索，状态直接同步到searchLogic
 */
export interface AutoSearchFieldProps {
  field: SearchFieldConfig;
  config: TableConfig;
  size?: TableSize;
}

export const AutoSearchField: React.FC<AutoSearchFieldProps> = ({ field, config, size = 'md' }) => {
  const searchState = useTableState((state) => state.searchState);
  const searchLogic = useTableLogic().search;

  // 从searchState获取当前字段的值（始终为数组格式）
  const fieldCondition = searchState[field.name];
  const currentValue = (() => {
    if (fieldCondition?.value) {
      return Array.isArray(fieldCondition.value) ? fieldCondition.value : [fieldCondition.value];
    }
    return [];
  })();

  // 处理字段值变化 - 立即更新搜索条件并触发搜索
  const handleFieldChange = (newValue: any) => {
    if (isEmpty(newValue)) {
      searchLogic.removeSearchCondition(field.name);
    } else {
      // 根据字段类型确定操作符
      let operator = field.op || 'like';
      if (field.type === 'range') {
        // range类型强制使用between操作符
        if (field.dataType === 'number' || field.dataType === 'int' || field.dataType === 'float' || field.dataType === 'long' || field.dataType === 'double') {
          operator = 'between';
        } else if (field.dataType === 'date') {
          operator = 'between';
        } else {
          // 其他数据类型不支持range，使用like
          operator = 'like';
        }
      }

      // 在提交时对数值范围进行归一化（仅 numeric range，非 date）
      const normalizedValue = Array.isArray(newValue) ? [...newValue] : [newValue];
      if (field.type === 'range' && ['number', 'int', 'float', 'long', 'double'].includes(field.dataType as any) && normalizedValue.length >= 2) {
        const a = normalizedValue[0];
        const b = normalizedValue[1];
        const isNum = (v: any) => typeof v === 'number' && !Number.isNaN(v);
        if (isNum(a) && isNum(b) && a > b) {
          normalizedValue[0] = b;
          normalizedValue[1] = a;
        }
      }

      const condition: SearchCondition = {
        field: field.dataIndex || [field.name],
        operator: operator,
        value: normalizedValue,
        type: field.dataType || 'string',
      };
      searchLogic.setSearchCondition(field.name, condition);
    }
  };

  // 获取有效的占位符
  const getEffectivePlaceholder = () => {
    if (config.search?.showLabel === false) {
      return (field.label || field.placeholder) as string;
    }
    return field.placeholder as string;
  };

  return <SearchFieldRenderer field={field} value={currentValue} onChange={handleFieldChange} placeholder={getEffectivePlaceholder()} size={size} />;
};
