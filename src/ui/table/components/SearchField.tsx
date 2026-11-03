import React, { useState, useCallback, useEffect } from 'react';
import { useTableState } from '../context/TableContext';
import type { SearchFieldConfig, TableConfig, TableSize } from '../types/base';
import { SearchFieldRenderer } from './SearchFieldRenderer';

/**
 * 传统搜索字段组件 - 专门处理传统模式
 * 特点：维护本地状态，不立即触发搜索，等待搜索按钮点击时批量提交
 */
export interface SearchFieldProps {
  field: SearchFieldConfig;
  config: TableConfig;
  onLocalValueChange?: (fieldName: string, value: any) => void;
  resetTrigger?: number;
  size?: TableSize;
}

export const SearchField: React.FC<SearchFieldProps> = ({ field, config, onLocalValueChange, resetTrigger, size = 'md' }) => {
  const searchState = useTableState((state) => state.searchState);

  // 本地状态管理 - 用于存储用户输入但未提交的值（始终为数组格式）
  const [localValue, setLocalValue] = useState(() => {
    // 初始化时从searchState获取已有的值，统一转换为数组格式
    const fieldCondition = searchState[field.name];
    if (fieldCondition?.value) {
      return Array.isArray(fieldCondition.value) ? fieldCondition.value : [fieldCondition.value];
    }
    return [];
  });

  // 监听重置触发器，清空本地状态
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      const defaultValue: any[] = [];
      setLocalValue(defaultValue);
      // 通知父组件本地值已重置
      onLocalValueChange?.(field.name, defaultValue);
    }
  }, [resetTrigger, field.name, onLocalValueChange]);

  // 处理字段值变化 - 只更新本地状态，不触发搜索
  const handleFieldChange = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);
      // 通知父组件本地值发生变化
      onLocalValueChange?.(field.name, newValue);
    },
    [field.name, onLocalValueChange],
  );

  // 获取有效的占位符
  const getEffectivePlaceholder = () => {
    if (config.search?.showLabel === false) {
      return (field.label || field.placeholder) as string;
    }
    return field.placeholder as string;
  };

  return <SearchFieldRenderer field={field} value={localValue} onChange={handleFieldChange} placeholder={getEffectivePlaceholder()} size={size} />;
};
