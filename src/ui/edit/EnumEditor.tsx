/**
 * 枚举编辑器
 * 支持单选和多选枚举值编辑
 */

import { Combobox } from '../combobox';
import { cn } from '../../utils/classnames';
import React from 'react';

export interface EnumOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  description?: string;
}

export interface EnumEditorProps {
  /** 当前值 */
  value?: string | number | (string | number)[];
  /** 值变更回调 */
  onChange: (value: string | number | (string | number)[]) => void;
  /** 选项列表 */
  options: EnumOption[];
  /** 是否多选 */
  multiple?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 最大选择数量（多选模式） */
  maxCount?: number;
}

/**
 * 枚举编辑器组件
 */
export const EnumEditor: React.FC<EnumEditorProps> = ({ value, onChange, options, multiple = false, placeholder, disabled = false, readOnly = false, className, searchable = true, maxCount }) => {
  // 处理值格式转换
  const normalizedValue = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    } else {
      return Array.isArray(value) ? (value.length > 0 ? value[0] : undefined) : value;
    }
  }, [value, multiple]);

  // 处理值变更
  const handleChange = React.useCallback(
    (newValue: any) => {
      if (multiple) {
        // 多选模式：确保返回数组
        const arrayValue = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];

        // 检查最大选择数量限制
        if (maxCount && arrayValue.length > maxCount) {
          return;
        }

        onChange(arrayValue);
      } else {
        // 单选模式：返回单个值
        onChange(newValue);
      }
    },
    [multiple, maxCount, onChange],
  );

  return (
    <Combobox
      value={normalizedValue as any}
      onChange={handleChange}
      options={options as any}
      multiple={multiple}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      searchable={searchable}
      className={cn('w-full', className)}
    />
  );
};

export default EnumEditor;
