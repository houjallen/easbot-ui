import { Button } from '../../button';
import { Collapsible, CollapsibleContent } from '../../collapsible';
import { Icon } from '../../icon';
import { Label } from '../../label';
import { useTableConfig, useTableLogic, useTableState } from '../context/TableContext';
import type { SearchConfig } from '../types';
import type { TableConfig, TableSize } from '../types';
import { cn } from '../../../utils/classnames';
import { deepMerge, isEmpty } from '../../../utils/object';
import React, { useState, useCallback } from 'react';
import { AutoSearchField } from '../components/AutoSearchField';
import { SearchField } from '../components/SearchField';
import { ToggleField } from '../components/ToggleField';
import type { SearchCondition, SearchFieldConfig } from '../types/base';

/**
 * 搜索字段输入组件 - 根据模式选择合适的组件
 */
const SearchFieldInput: React.FC<{
  field: SearchFieldConfig;
  config: TableConfig;
  onLocalValueChange?: (fieldName: string, value: any) => void;
  resetTrigger?: number;
  size?: TableSize;
}> = ({ field, config, onLocalValueChange, resetTrigger, size }) => {
  const { filterMultiple = false } = config.search || {};
  const autoSearch = config.search?.autoSearch || false;

  // 根据模式选择合适的组件
  if (filterMultiple) {
    // filterMultiple模式：使用ToggleField
    return <ToggleField field={field} config={config} size={size} />;
  } else if (autoSearch) {
    // 即时搜索模式：使用AutoSearchField
    return <AutoSearchField field={field} config={config} size={size} />;
  } else {
    // 传统模式：使用SearchField
    return <SearchField field={field} config={config} onLocalValueChange={onLocalValueChange} resetTrigger={resetTrigger} size={size} />;
  }
};

interface SearchPanelProps {
  config?: SearchConfig;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 搜索面板组件 - 重构版本
 */
export const SearchPanel: React.FC<SearchPanelProps> = ({ config = {}, className }) => {
  const tableConfig = useTableConfig();
  const searchState = useTableState((state) => state.searchState);
  const tableLogic = useTableLogic();
  const searchLogic = tableLogic.search;
  const { t } = tableLogic.i18n;

  const [isCollapsed, setIsCollapsed] = useState(tableConfig.search?.defaultCollapsed ?? false);

  // 本地搜索值状态 - 用于传统模式收集输入
  const [localSearchValues, setLocalSearchValues] = useState<Record<string, any>>({});

  // 重置触发器 - 用于通知SearchField组件重置
  const [resetTrigger, setResetTrigger] = useState(0);

  // 获取搜索字段配置
  const searchFields = tableConfig.search?.fields || [];
  const searchConfig = deepMerge(tableConfig.search || {}, config) as SearchConfig;
  const { show = true, mode = 'grid', showLabel = true, minFieldWidth = 320, size = tableConfig.size ?? 'md' } = searchConfig;

  // 处理传统模式下的本地值变化
  const handleLocalValueChange = useCallback((fieldName: string, value: any) => {
    setLocalSearchValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  // 执行搜索 - 传统模式下批量提交所有字段的搜索条件
  const handleSearch = useCallback(() => {
    // 遍历本地状态，将所有字段的值转换为搜索条件
    Object.entries(localSearchValues).forEach(([fieldName, value]) => {
      const field = searchFields.find((f) => f.name === fieldName);
      if (!field) return;

      if (isEmpty(value)) {
        searchLogic.removeSearchCondition(fieldName);
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
        const normalizedValue = Array.isArray(value) ? [...value] : [value];
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
        searchLogic.setSearchCondition(fieldName, condition);
      }
    });
  }, [localSearchValues, searchFields, searchLogic]);

  // 重置搜索
  const handleReset = useCallback(() => {
    // 清空本地状态
    setLocalSearchValues({});
    // 清空上下文状态
    searchLogic.clearSearch();
    // 触发SearchField组件重置
    setResetTrigger((prev) => prev + 1);
  }, [searchLogic]);

  // 获取字段当前值
  const getFieldValue = useCallback(
    (fieldName: string) => {
      const condition = searchState[fieldName];
      if (!condition?.value) return undefined;

      // 处理数组值
      if (Array.isArray(condition.value)) {
        return condition.value.length === 1 ? condition.value[0] : condition.value;
      }
      return condition.value;
    },
    [searchState],
  );

  if (tableConfig.searchable === false || !show || searchFields.length === 0) {
    return null;
  }

  // 计算字段的实际最小宽度
  const getFieldMinWidth = (field: SearchFieldConfig) => {
    if (searchConfig.filterMultiple) {
      return 320; // 默认宽度
    }
    return field.minWidth || minFieldWidth;
  };

  // 计算网格列数
  const getGridCols = () => {
    if (mode === 'list' || searchConfig.filterMultiple) return 1;
    return 'auto-fit';
  };

  // 计算网格模板列
  const getGridTemplateColumns = () => {
    if (mode === 'list' || searchConfig.filterMultiple) return undefined;

    // 获取有效的搜索字段
    const validFields = searchFields.filter((field) => !(searchConfig.filterMultiple && isEmpty(field.options)));

    // 当使用auto-fit模式时，让浏览器根据容器宽度和字段最小宽度自动决定列数
    if (getGridCols() === 'auto-fit') {
      // 在auto-fit模式下，我们需要确保每个字段都有足够的空间
      // 找出所有字段中最大的最小宽度，确保所有字段都能正常显示
      const maxMinWidth = validFields.reduce((max, field) => Math.max(max, getFieldMinWidth(field)), minFieldWidth);
      return `repeat(auto-fit, minmax(${maxMinWidth}px, 1fr))`;
    }

    // 为每个字段创建一个minmax表达式，使用各自的最小宽度
    const columnsTemplate = validFields.map((field) => `minmax(${getFieldMinWidth(field)}px, 1fr)`).join(', ');

    return columnsTemplate ? `repeat(${validFields.length}, ${columnsTemplate})` : undefined;
  };

  return (
    <Collapsible className="shrink-0" open={!isCollapsed} onOpenChange={setIsCollapsed}>
      <CollapsibleContent>
        <div className={cn('eas-table-search-container flex gap-2 py-2', searchConfig.className, className)} style={searchConfig.style}>
          {/* 搜索字段区域 */}
          <div
            className={cn(mode === 'grid' && !searchConfig.filterMultiple ? 'grid gap-2' : 'flex flex-col gap-2')}
            style={
              mode === 'grid' && !searchConfig.filterMultiple
                ? {
                    gridTemplateColumns: getGridTemplateColumns(),
                    width: '100%',
                  }
                : undefined
            }
          >
            {searchFields
              .filter((field) => !(searchConfig.filterMultiple && isEmpty(field.options)))
              .map((field) => {
                const fieldMinWidth = getFieldMinWidth(field);
                return (
                  <div key={field.name} className={cn('flex items-center gap-2')} style={{ minWidth: fieldMinWidth }}>
                    {showLabel && (
                      <Label htmlFor={field.name} className={cn('min-w-[64px] whitespace-nowrap font-medium text-foreground', `eas-table-search-field-${size}`)}>
                        {field.label}
                      </Label>
                    )}
                    <div className="w-full min-w-0 flex-1">
                      <SearchFieldInput field={field} config={tableConfig} onLocalValueChange={handleLocalValueChange} resetTrigger={resetTrigger} size={size} />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 按钮区域 - filterMultiple 模式和 autoSearch 模式下不显示按钮 */}
          {!searchConfig.filterMultiple && (
            <div
              className={cn('flex flex-shrink-0 items-start justify-end gap-2', {
                'w-[200px]': !searchConfig?.autoSearch,
                'w-[100px]': searchConfig?.autoSearch,
              })}
            >
              {!searchConfig?.autoSearch && (
                <Button onClick={handleSearch} className="flex-1" size={size} leftIcon={<Icon name="search" size={16} className="text-primary-foreground" />}>
                  {t('search.search')}
                </Button>
              )}
              <Button variant="outline" onClick={handleReset} className="flex-1" size={size} leftIcon={<Icon name="refresh-cw" size={16} />}>
                {t('search.reset')}
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SearchPanel;
