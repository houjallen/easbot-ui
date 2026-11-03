import { useTableContext } from '../context';
import { renderFieldByType } from '../utils/field-generator';
import type { FieldGeneratorConfig } from '../utils/field-generator';
import cn from '../../../utils/classnames';
import React from 'react';
import type { SearchFieldConfig, TableSize } from '../types/base';

/**
 * 共享的表单输入组件渲染逻辑
 * 用于AutoSearchField和SearchField组件
 */
export interface SearchFieldRendererProps {
  field: SearchFieldConfig;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  size?: TableSize;
}

export const SearchFieldRenderer: React.FC<SearchFieldRendererProps> = ({ field, value, onChange, placeholder, size = 'md' }) => {
  const tableContext = useTableContext();
  const { t } = tableContext.tableLogic.i18n;

  // 获取有效的占位符 - 根据showLabel设置生成正确的提示
  const getEffectivePlaceholder = () => {
    const showLabel = tableContext?.state?.config?.search?.showLabel ?? true;

    // 如果有明确传入的placeholder，优先使用
    if (placeholder) {
      return placeholder;
    }

    // 如果field有placeholder，使用field的placeholder
    if (field.placeholder) {
      return Array.isArray(field.placeholder) ? field.placeholder[0] : field.placeholder;
    }

    // 如果showLabel为false，需要组合label作为placeholder
    if (!showLabel && field.label) {
      return t('search.placeholders.enterField', { field: field.label });
    }

    // 默认返回空字符串
    return '';
  };

  // 获取range类型的占位符
  const getRangePlaceholder = (index: 0 | 1) => {
    const effectivePlaceholder = placeholder || field.placeholder;

    if (Array.isArray(effectivePlaceholder)) {
      return effectivePlaceholder[index] || '';
    }

    // 当showLabel为false时，需要组合label + placeholder
    if (effectivePlaceholder) {
      const minMaxText = index === 0 ? t('filter.placeholders.minValue') : t('filter.placeholders.maxValue');
      return `${effectivePlaceholder} ${minMaxText}`;
    }

    return index === 0 ? t('filter.placeholders.minValue') : t('filter.placeholders.maxValue');
  };

  // 构建通用的 fieldGeneratorConfig - 只包含必要的扩展配置
  const buildFieldGeneratorConfig = (extraConfig?: Partial<FieldGeneratorConfig>): FieldGeneratorConfig => {
    const effectivePlaceholder = getEffectivePlaceholder();
    return {
      value,
      onChange,
      context: 'search' as const,
      placeholder: effectivePlaceholder || undefined,
      className: cn('w-full', `eas-table-search-field-${size}`),
      wrapperClassName: 'w-full min-w-0',
      size,
      t,
      ...extraConfig,
    };
  };

  // 统一使用 field-generator 处理所有类型
  switch (field.type) {
    case 'text':
    case 'number':
    case 'boolean':
    case 'date':
    case 'date-range':
      return renderFieldByType(field, buildFieldGeneratorConfig());

    case 'select': {
      // 确保 multiple 属性正确传递
      const selectFieldConfig = {
        ...field,
        editConfig: {
          ...field.editConfig,
          multiple: field.multiple,
        },
      };
      return renderFieldByType(selectFieldConfig, buildFieldGeneratorConfig());
    }

    case 'range': {
      // range类型处理
      const fieldDataType = field.dataType || 'string';

      if (['number', 'int', 'float', 'long', 'double'].includes(fieldDataType)) {
        // 数字范围
        const rangeFieldConfig = {
          ...field,
          editConfig: {
            ...field.editConfig,
            type: 'range' as const,
          },
        };
        return renderFieldByType(
          rangeFieldConfig,
          buildFieldGeneratorConfig({
            isRangeMode: true,
            placeholder: [getRangePlaceholder(0), getRangePlaceholder(1)],
          }),
        );
      } else if (fieldDataType === 'date') {
        // 日期范围
        const dateRangeFieldConfig = {
          ...field,
          dateType: 'date-range' as const,
          dataType: 'date' as const,
          editConfig: {
            ...field.editConfig,
            type: 'range' as const,
          },
        };
        // 处理日期范围的特殊placeholder
        const effectivePlaceholder = placeholder || field.placeholder;
        const rangePlaceholder = Array.isArray(effectivePlaceholder) ? effectivePlaceholder.join(' - ') : getEffectivePlaceholder();

        return renderFieldByType(
          dateRangeFieldConfig,
          buildFieldGeneratorConfig({
            placeholder: rangePlaceholder,
          }),
        );
      } else {
        // 其他类型降级为文本输入
        return renderFieldByType(field, buildFieldGeneratorConfig());
      }
    }

    default:
      // 默认使用文本输入
      return renderFieldByType(field, buildFieldGeneratorConfig());
  }
};
