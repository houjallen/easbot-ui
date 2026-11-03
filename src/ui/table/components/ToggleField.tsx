import { Button } from '../../button';
import { ScrollArea } from '../../scroll-area';
import { useTableLogic } from '../context/TableContext';
import { useTableState } from '../context/TableContext';
import type { TableConfig, TableSize } from '../types/base';
import type { SearchCondition, SearchFieldConfig } from '../types/base';
import { ToggleGroup, ToggleGroupItem } from '../../toggle-group';
import { cn } from '../../../utils/classnames';
import { isEmpty } from '../../../utils/object';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import React from 'react';

/**
 * Toggle字段组件 - 专门处理filterMultiple模式
 * 特点：立即搜索，显示为标签按钮形式
 */
export interface ToggleFieldProps {
  field: SearchFieldConfig;
  config: TableConfig;
  size?: TableSize;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({ field, config, size = 'md' }) => {
  const searchState = useTableState((state) => state.searchState);
  const tableLogic = useTableLogic();
  const searchLogic = tableLogic.search;
  const { t } = tableLogic.i18n;

  // 从上下文获取当前字段的搜索条件
  const fieldCondition = searchState[field.name];
  const selectedValues = Array.isArray(fieldCondition?.value) ? fieldCondition.value : [];
  const originalOptions = field.options || [];
  const isMultiple = field.multiple === true;

  // 完全基于上下文searchState来判断是否为"全部"状态
  const isAllSelected = !fieldCondition || isEmpty(fieldCondition.value);

  // 处理字段值变化 - filterMultiple模式立即触发搜索
  const handleFieldChange = (newValue: any) => {
    if (isEmpty(newValue)) {
      searchLogic.removeSearchCondition(field.name);
    } else {
      const condition: SearchCondition = {
        field: field.dataIndex || [field.name],
        operator: field.op || 'like',
        value: Array.isArray(newValue) ? newValue : [newValue],
        type: field.dataType || 'string',
      };
      searchLogic.setSearchCondition(field.name, condition);
    }
  };

  // 渲染"全部"按钮
  const renderAllButton = () => (
    <Button
      variant={isAllSelected ? 'default' : 'outline'}
      size={size}
      onClick={() => handleFieldChange(undefined)}
      className={cn('h-8 min-w-[64px]', isAllSelected ? 'bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-accent hover:text-accent-foreground')}
    >
      {t('search.all')}
    </Button>
  );

  // 渲染选项按钮
  const renderOptionButtons = () => {
    const toggleItems = originalOptions.map((option) => (
      <ToggleGroupItem
        key={option.value}
        value={String(option.value)}
        disabled={(option as any).disabled}
        className={cn(
          'min-w-[64px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          selectedValues.some((v) => String(v) === String(option.value)) && !(option as any).disabled ? 'bg-primary/5' : '',
        )}
      >
        {option.label}
      </ToggleGroupItem>
    ));

    if (isMultiple) {
      // 多选模式 - 值始终是数组
      const currentValues = selectedValues.map((v) => String(v));
      return (
        <ToggleGroup
          size={size === 'md' ? 'default' : size}
          type="multiple"
          value={currentValues}
          onValueChange={(values) => handleFieldChange(Array.isArray(values) ? values : [])}
          className="justify-start"
        >
          {toggleItems}
        </ToggleGroup>
      );
    } else {
      // 单选模式 - 组件接收单值，但存储为数组
      const currentValue = selectedValues.length > 0 ? String(selectedValues[0]) : '';
      return (
        <ToggleGroup size={size === 'md' ? 'default' : size} type="single" value={currentValue} onValueChange={(value) => handleFieldChange(value ? [value] : [])} className="justify-start">
          {toggleItems}
        </ToggleGroup>
      );
    }
  };

  // 检查字段是否支持选择模式
  if (!field.options || field.options.length === 0) {
    const locale = tableLogic.i18n?.locale;
    return <div className="py-2 text-center text-muted-foreground text-sm">{processUiMessage('search.optionsMissing', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' })}</div>;
  }

  return (
    <div className="flex items-center gap-2">
      {/* "全部"按钮 */}
      {renderAllButton()}

      {/* 选项按钮区域 - 使用滚动容器 */}
      <ScrollArea className="flex-1">
        <div className="flex items-center">{renderOptionButtons()}</div>
      </ScrollArea>
    </div>
  );
};
