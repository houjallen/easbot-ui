import { Select } from '../../select';
import { useTableConfig, useTableState } from '../context/TableContext';
import { useTableLogic } from '../context/TableContext';
import { cn } from '../../../utils/classnames';
import { isEmpty } from '../../../utils/object';
import { tableMessages } from '../../../utils/component-messages';
import { processUiMessage } from '../../../utils/ui-message';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../../button';
import { Checkbox } from '../../checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../dialog';
import { Icon, IconButton } from '../../icon';
import { Input } from '../../input';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
import type { FilterOperator } from '../types/base';
import type { ActionConfig, FilterValue, TableColumn } from '../types/base';
// 引入统一字段渲染器（最小化改动：仅在值输入处接入，保持现有结构不变）
import { renderBooleanInput, renderDateInput, renderEnumInput, renderNumberInput, renderTextInput } from '../utils/field-generator';

/**
 * 过滤操作符定义 - 与后端FilterExpression保持一致
 */
const FILTER_OPERATORS = {
  // 基础比较操作符
  eq: {
    key: 'eq',
    types: ['string', 'number', 'int', 'float', 'long', 'double', 'boolean', 'date', 'enum'],
  },
  ne: {
    key: 'ne',
    types: ['string', 'number', 'int', 'float', 'long', 'double', 'boolean', 'date', 'enum'],
  },

  // 数值比较操作符
  gt: {
    key: 'gt',
    types: ['number', 'int', 'float', 'long', 'double', 'date'],
  },
  ge: {
    key: 'ge',
    types: ['number', 'int', 'float', 'long', 'double', 'date'],
  },
  lt: {
    key: 'lt',
    types: ['number', 'int', 'float', 'long', 'double', 'date'],
  },
  le: {
    key: 'le',
    types: ['number', 'int', 'float', 'long', 'double', 'date'],
  },

  // 文本操作符
  like: { key: 'like', types: ['string'] },
  notlike: { key: 'notlike', types: ['string'] },
  startwith: { key: 'startwith', types: ['string'] },
  endwith: { key: 'endwith', types: ['string'] },

  // 范围操作符
  between: {
    key: 'between',
    types: ['number', 'int', 'float', 'long', 'double', 'date'],
  },
  notbetween: {
    key: 'notbetween',
    types: ['number', 'int', 'float', 'long', 'double', 'date'],
  },

  // 列表操作符
  in: {
    key: 'in',
    types: ['string', 'number', 'int', 'float', 'long', 'double', 'enum', 'list'],
  },
  notin: {
    key: 'notin',
    types: ['string', 'number', 'int', 'float', 'long', 'double', 'enum', 'list'],
  },

  // 空值操作符
  isnull: {
    key: 'isnull',
    types: ['string', 'number', 'int', 'float', 'long', 'double', 'boolean', 'date', 'enum', 'list', 'object'],
  },
  isnotnull: {
    key: 'isnotnull',
    types: ['string', 'number', 'int', 'float', 'long', 'double', 'boolean', 'date', 'enum', 'list', 'object'],
  },
} as const;

// 数据类型映射 - 与后端FilterExpression保持一致
const DATA_TYPES = {
  text: 'string', // 前端text类型映射到后端string类型
  number: 'number', // 通用数字类型
  int: 'int', // 整数类型
  float: 'float', // 浮点数类型
  long: 'long', // 长整型
  double: 'double', // 双精度浮点型
  boolean: 'boolean', // 布尔类型
  date: 'date', // 日期类型
  select: 'enum', // 选择类型映射到枚举类型
  enum: 'enum', // 枚举类型
  list: 'list', // 列表类型
  object: 'object', // 对象类型
} as const;

// 移除硬编码的操作符标签，改为使用i18n
export interface TableColumnFilterProps {
  /** 过滤器动作配置 */
  action?: ActionConfig;
  /** 列定义 */
  column: TableColumn;
  /** 过滤值变化回调 */
  onChange?: (event?: React.MouseEvent, value?: FilterValue | undefined) => void;
  /** 自定义类名 */
  className?: string;
}

// 当在弹层中使用时，需要自定义样式以提升 z-index
// 注意：这里不能使用 useMemo，因为这是普通函数而不是React组件
const popoverContentProps = {
  popoverContentStyle: {
    zIndex: 'calc(var(--eas-z-index-dialog, 1400) + 20)',
  } as React.CSSProperties,
};

/**
 * 表格列过滤器组件
 * 根据列类型和editor配置自动生成合适的过滤器
 */
export const TableColumnFilter: React.FC<TableColumnFilterProps> = ({ action, column, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [operator, setOperator] = useState<FilterOperator>(column.filterOp || 'eq');
  // 方案B：filter 场景内部状态也统一为数组，空值为 []
  const [filterValue, setFilterValue] = useState<any[]>([]);
  const tableConfig = useTableConfig();
  const tableLogic = useTableLogic();
  const showInMore = action?.showInMore === true;
  const { t, locale } = tableLogic.i18n;

  // 从表格状态中获取当前列的筛选值和激活状态
  const contextState = useTableState();
  const value = contextState?.filterState?.[column.name];
  // 筛选值可能尚未设置或已被清空，统一回退为 0 长度
  const active = (value?.value?.length ?? 0) > 0;

  // 初始化组件状态：从 FilterValue 对象转换为内部状态
  useEffect(() => {
    if (value) {
      setOperator(value.op);

      if (value.op === 'isnull' || value.op === 'isnotnull') {
        // 空值操作符不需要值
        setFilterValue([]);
      } else if (value.op === 'between' || value.op === 'notbetween') {
        // 方案B：范围值统一存放到一个数组中
        setFilterValue(Array.isArray(value.value) ? value.value : []);
      } else if (value.op === 'in' || value.op === 'notin') {
        // in/notin 操作符使用数组值
        setFilterValue(Array.isArray(value.value) ? value.value : isEmpty(value.value) ? [] : [value.value]);
      } else {
        // 其他操作符：统一外部为数组格式
        setFilterValue(Array.isArray(value.value) ? value.value : isEmpty(value.value) ? [] : [value.value]);
      }
    } else {
      // 重置为默认状态
      // 有 filterOptions 时默认使用 'in' 操作符，否则使用 'eq'
      const defaultOperator = column.options && column.options.length > 0 ? 'in' : 'eq';
      setOperator(defaultOperator);
      setFilterValue([]);
    }
  }, [value, column.options]);

  // 获取列数据类型，优先使用dataType，fallback到type映射
  const dataType = column.dataType || 'string';

  // 获取适用于该数据类型的操作符
  const availableOperators = Object.entries(FILTER_OPERATORS)
    .filter(([operatorKey, config]) => {
      // 如果有 filterOptions，总是包含 in/notin 操作符
      if (column.options && column.options.length > 0 && ['in', 'notin'].includes(operatorKey)) {
        return true;
      }

      // filterMultiple 模式下，只允许 in/notin 操作符
      if (column.filterMultiple && column.options && column.options.length > 0) {
        return ['in', 'notin'].includes(operatorKey);
      }

      // 其他情况按数据类型过滤
      return (config.types as readonly string[]).includes(dataType);
    })
    .map(([op]) => op as FilterOperator);

  // 操作符选项
  const operatorOptions = availableOperators.map((op) => ({
    label: t(`filter.operators.${op}`),
    value: op,
  }));

  // 应用过滤器
  const handleApplyFilter = useCallback(
    (e: React.MouseEvent) => {
      try {
        // 验证筛选值
        if (operator === 'between' || operator === 'notbetween') {
          const hasTwo = Array.isArray(filterValue) && filterValue.length >= 2;
          const v0 = hasTwo ? filterValue[0] : undefined;
          const v1 = hasTwo ? filterValue[1] : undefined;
          const isEmptyVal = (v: any) => v === undefined || v === null || v === '';
          if (!hasTwo || isEmptyVal(v0) || isEmptyVal(v1)) {
            console.warn(processUiMessage('betweenRequiresTwoValues', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }));
            return;
          }
        }

        // 统一从数组状态中收集值
        const values: any[] = Array.isArray(filterValue) ? [...filterValue] : filterValue != null ? [filterValue as any] : [];
        // 方案B：不再使用第二个值，range 由 filterValue 数组承载

        // between/notbetween 数值类型范围：提交前归一化顺序
        if ((operator === 'between' || operator === 'notbetween') && ['number', 'int', 'float', 'long', 'double'].includes(dataType) && values.length >= 2) {
          const a = values[0];
          const b = values[1];
          const isNum = (v: any) => typeof v === 'number' && !Number.isNaN(v);
          if (isNum(a) && isNum(b) && a > b) {
            values[0] = b;
            values[1] = a;
          }
        }

        const newValue: FilterValue = {
          field: column.dataIndex || column.name, // dataIndex 是数据字段映射，用于从记录中获取数据
          op: operator,
          value: values,
          type: dataType, // 设置数据类型，与column.dataType保持一致
          format: typeof column.format === 'string' ? undefined : column.format,
        };
        tableLogic.filter.setFilter(column.name, newValue);
        onChange?.(e, newValue);
        setOpen(false);
      } catch (error) {
        console.error(processUiMessage('applyFilterFailed', { locale, messages: tableMessages, fallbackLocale: 'zh-CN' }, { error: String(error) }), error);
        // 可以在这里添加用户友好的错误提示
      }
    },
    [operator, filterValue, onChange, column.format, tableLogic.filter.setFilter, dataType, column.name, column.dataIndex, locale],
  );

  // 清除过滤器
  const handleClearFilter = useCallback(
    (e: React.MouseEvent) => {
      // 重置为默认操作符：有 filterOptions 时默认使用 'in'，否则使用 'eq'
      const defaultOperator = column.options && column.options.length > 0 ? 'in' : 'eq';
      setOperator(defaultOperator);
      setFilterValue([]);
      tableLogic.filter.clearFilter(column.name);
      onChange?.(e, undefined);
      setOpen(false);
    },
    [onChange, column.name, column.options, tableLogic.filter],
  );

  // 渲染 filterMultiple 模式的筛选输入组件
  const renderMultipleFilterInput = () => {
    const selectedValues = Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : [];
    const availableOptions = column.options!.filter((option) => !option.disabled);
    const allSelected = availableOptions.length > 0 && availableOptions.every((option) => selectedValues.includes(option.value));
    const someSelected = selectedValues.length > 0;

    // 全选/取消全选处理
    const handleSelectAll = () => {
      if (allSelected) {
        // 取消全选
        setFilterValue([]);
      } else {
        // 全选
        setFilterValue(availableOptions.map((option) => option.value));
      }
    };

    return (
      <div className="space-y-3">
        {/* 选中状态和全选控制 */}
        {availableOptions.length > 1 && (
          <div className="flex items-center justify-between border-border border-b pb-2">
            <span className="text-muted-foreground text-xs">
              {t('filter.messages.selectedCount', {
                count: selectedValues.length,
                total: availableOptions.length,
              })}
            </span>
            <Button variant="ghost" onClick={handleSelectAll} className="text-primary text-xs transition-colors hover:text-primary/80">
              {allSelected ? t('filter.actions.deselectAll') : t('filter.actions.selectAll')}
            </Button>
          </div>
        )}

        {/* 选项列表 */}
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {column.options!.map((option) => (
            <div
              key={option.value}
              className={cn(
                'flex items-center space-x-2 rounded p-2 transition-colors',
                option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted/50',
                selectedValues.includes(option.value) && !option.disabled ? 'bg-primary/5' : '',
              )}
            >
              <Checkbox
                id={`filter-option-${option.value}`}
                checked={selectedValues.includes(option.value)}
                disabled={option.disabled}
                onCheckedChange={(checked) => {
                  const newSelectedValues = [...selectedValues];
                  if (checked) {
                    // 添加选项
                    if (!newSelectedValues.includes(option.value)) {
                      newSelectedValues.push(option.value);
                    }
                  } else {
                    // 移除选项
                    const index = newSelectedValues.indexOf(option.value);
                    if (index > -1) {
                      newSelectedValues.splice(index, 1);
                    }
                  }
                  setFilterValue(newSelectedValues);
                }}
              />
              <label htmlFor={`filter-option-${option.value}`} className={cn('flex-1 cursor-pointer text-sm', option.disabled ? 'cursor-not-allowed text-muted-foreground' : '')}>
                {option.label}
              </label>
              {selectedValues.includes(option.value) && !option.disabled && <Icon name="check" className="h-3 w-3 text-primary" />}
            </div>
          ))}
          {column.options!.length === 0 && <div className="py-4 text-center text-muted-foreground text-sm">{t('filter.messages.noOptions')}</div>}
        </div>
      </div>
    );
  };

  // 检查是否应该使用 filterMultiple 模式
  const shouldUseMultipleMode = () => {
    // 1. 显式设置了 filterMultiple 且有选项
    if (column.filterMultiple && column.options && column.options.length > 0) {
      return true;
    }
    // 2. 操作符为 in/notin 且有选项时自动启用
    if ((operator === 'in' || operator === 'notin') && column.options && column.options.length > 0) {
      return true;
    }
    return false;
  };

  // 渲染过滤值输入组件
  const renderFilterInput = () => {
    // 检查是否应该使用 filterMultiple 模式
    if (shouldUseMultipleMode()) {
      return renderMultipleFilterInput();
    }

    // 如果列定义了editor，优先使用editor
    if (column.editRender) {
      const onChange = (val: any) => setFilterValue(val);
      const editorElement = column.editRender(filterValue, onChange, column) as React.ReactElement;
      return React.cloneElement(editorElement, {
        value: filterValue,
        onChange: (val: any) => setFilterValue(val),
        className: 'w-full',
      } as any);
    }

    // 根据数据类型渲染不同的输入组件（统一接入 field-generator，保留无 options 备选方案）
    switch (dataType) {
      case 'number':
      case 'int':
      case 'float':
      case 'long':
      case 'double':
        // between/notbetween 统一使用单控件 range
        if (operator === 'between' || operator === 'notbetween') {
          // 组合现有两个值为一个数组，优先使用 filterValue 内已有的两个元素
          const combinedRange = (() => {
            if (Array.isArray(filterValue) && filterValue.length >= 2) {
              return [filterValue[0], filterValue[1]];
            } else if (Array.isArray(filterValue)) {
              return filterValue;
            } else if (isEmpty(filterValue)) {
              return [];
            } else {
              return [filterValue];
            }
          })();

          return (
            <div className="w-full">
              {renderNumberInput(column as any, {
                context: 'filter',
                isRangeMode: true,
                value: combinedRange,
                onChange: (val: any) => {
                  // 直接存到 filterValue 统一为数组，清空第二值
                  const next = Array.isArray(val) ? val : isEmpty(val) ? [] : [val];
                  setFilterValue(next);
                },
                placeholder: [t('filter.placeholders.minValue'), t('filter.placeholders.maxValue')],
                className: 'w-full',
                wrapperClassName: 'w-full',
              })}
            </div>
          );
        }
        // 非范围操作符：保持单值（数组桥接）
        return (
          <div className="w-full">
            {renderNumberInput(column as any, {
              context: 'filter',
              value: Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : [],
              onChange: (val: any) => setFilterValue(Array.isArray(val) ? val : isEmpty(val) ? [] : [val]),
              placeholder: t('filter.placeholders.number'),
              className: 'w-full',
              wrapperClassName: 'w-full',
            })}
          </div>
        );

      case 'date':
        // between/notbetween 统一使用单控件 date-range
        if (operator === 'between' || operator === 'notbetween') {
          const combinedRange = (() => {
            if (Array.isArray(filterValue) && filterValue.length >= 2) {
              return [filterValue[0], filterValue[1]];
            } else if (Array.isArray(filterValue)) {
              return filterValue;
            } else if (isEmpty(filterValue)) {
              return [];
            } else {
              return [filterValue];
            }
          })();

          // 强制使用日期范围交互
          const dateRangeField = {
            ...column,
            dateType: 'date-range' as const,
            dataType: 'date' as const,
          } as any;

          return (
            <div className="w-full">
              {renderDateInput(dateRangeField, {
                context: 'filter',
                isRangeMode: true,
                value: combinedRange,
                onChange: (val: any) => {
                  const next = Array.isArray(val) ? val : isEmpty(val) ? [] : [val];
                  setFilterValue(next);
                },
                placeholder: t('filter.placeholders.select'),
                className: 'w-full',
                wrapperClassName: 'w-full',
              })}
            </div>
          );
        }
        // 非范围操作符：保持单值（数组桥接）
        return (
          <div className="w-full">
            {renderDateInput(column as any, {
              context: 'filter',
              value: Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : [],
              onChange: (val: any) => setFilterValue(Array.isArray(val) ? val : isEmpty(val) ? [] : [val]),
              placeholder: t('filter.placeholders.select'),
              className: 'w-full',
              wrapperClassName: 'w-full',
            })}
          </div>
        );

      case 'boolean':
        return (
          <div className="w-full">
            {renderBooleanInput(column as any, {
              context: 'filter',
              value: Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : [],
              onChange: (val: any) => setFilterValue(Array.isArray(val) ? val : isEmpty(val) ? [] : [val]),
              placeholder: t('filter.placeholders.select'),
              className: 'w-full',
              wrapperClassName: 'w-full',
            })}
          </div>
        );

      case 'enum':
      case 'list':
        // 对于枚举和列表类型，支持多值选择
        if (isEmpty(column.options)) {
          // 没有预定义选项时提供输入框作为备用方案
          return (
            <Input
              value={Array.isArray(filterValue) ? filterValue.join(', ') : filterValue}
              onChange={(e) => {
                const val = e.target.value;
                // 支持逗号分隔的多值输入
                if (val.includes(',')) {
                  setFilterValue(
                    val
                      .split(',')
                      .map((v) => v.trim())
                      .filter((v) => v),
                  );
                } else if (isEmpty(val)) {
                  setFilterValue([]);
                } else {
                  setFilterValue([val]);
                }
              }}
              placeholder={t('filter.placeholders.listInput')}
              className="w-full"
            />
          );
        } else {
          // 有预定义选项时使用统一枚举渲染器
          const enumField = {
            ...column,
            // 控制多选：沿用现有策略（filterMultiple 或 in/notin）
            editConfig: {
              ...(column.editConfig || {}),
              multiple: shouldUseMultipleMode(),
            },
          } as any;
          return (
            <div className="w-full">
              {renderEnumInput(enumField, {
                context: 'filter',
                value: Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : [],
                onChange: (val: any) => setFilterValue(Array.isArray(val) ? val : isEmpty(val) ? [] : [val]),
                placeholder: shouldUseMultipleMode() ? t('filter.placeholders.selectMultiple') : t('filter.placeholders.select'),
                className: 'w-full',
                wrapperClassName: 'w-full',
              })}
            </div>
          );
        }

      default: // string
        return (
          <div className="w-full">
            {renderTextInput(column as any, {
              context: 'filter',
              value: Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : [],
              onChange: (val: any) => setFilterValue(Array.isArray(val) ? val : isEmpty(val) ? [] : [val]),
              placeholder: t('filter.placeholders.text'),
              className: 'w-full',
              wrapperClassName: 'w-full',
            })}
          </div>
        );
    }
  };

  // 渲染筛选内容
  const renderFilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* 操作符选择 */}
        <div>
          <span className="mb-1 block font-medium text-muted-foreground text-xs">{t('filter.labels.condition')}</span>
          <Select
            value={operator}
            onValueChange={(value) => {
              const newOperator = value as FilterOperator;
              setOperator(newOperator);

              // 切换操作符时重置值
              if (newOperator === 'isnull' || newOperator === 'isnotnull') {
                // 空值操作符不需要值
                setFilterValue([]);
              } else if (newOperator === 'between' || newOperator === 'notbetween') {
                // 方案B：范围由单控件维护数组，这里无需处理第二值
              } else if (newOperator === 'in' || newOperator === 'notin') {
                // in/notin 操作符使用数组值，自动启用多选模式
                setFilterValue(Array.isArray(filterValue) ? filterValue : filterValue != null ? [filterValue as any] : []);
              } else {
                // 其他操作符：保持数组格式（单值操作也用数组承载第一项或空）
                setFilterValue(Array.isArray(filterValue) ? (filterValue.length > 0 ? [filterValue[0]] : []) : filterValue != null ? [filterValue as any] : []);
              }
            }}
            options={operatorOptions}
            className="w-full"
            // 使用新的属性设置 z-index
            {...popoverContentProps}
          />
        </div>

        {/* 过滤值输入 */}
        {operator !== 'isnull' && operator !== 'isnotnull' && (
          <div>
            <span className="mb-1 block font-medium text-muted-foreground text-xs">{operator === 'between' ? t('filter.labels.startValue') : t('filter.labels.value')}</span>
            {renderFilterInput()}
          </div>
        )}

        {/* 方案B：范围类统一为单控件，且 between 仅对 number/date 可选，因此无需第二个值输入区域 */}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-2 border-t pt-2">
        <Button variant="outline" size="sm" onClick={handleClearFilter}>
          {t('filter.labels.clear')}
        </Button>
        <Button size="sm" onClick={(e) => handleApplyFilter(e)}>
          {t('filter.labels.apply')}
        </Button>
      </div>
    </div>
  );

  // 渲染触发器按钮
  const renderTrigger = () => {
    // const commonProps = {
    //   title: t('clickSetFilter'),
    //   className: cn(
    //     active ? 'shrink-0 bg-primary text-primary' : 'shrink-0',
    //     className,
    //   ),
    // };

    if (showInMore) {
      return (
        <Button variant="ghost" size={tableConfig?.size} className={cn(active ? 'shrink-0 bg-primary/10' : 'shrink-0', className)} leftIcon={<Icon name={'filter'} size={16} />}>
          {t('filterText')}
        </Button>
      );
    }

    return <IconButton icon="filter" size={20} shape="square" variant="default" className={cn(active ? 'shrink-0 bg-primary/10' : 'shrink-0', className)} />;
  };

  // 根据 showInMore 决定使用 Dialog 还是 Popover
  if (showInMore) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('filter.labels.filterTitle', { column: column.title })}</DialogTitle>
          </DialogHeader>
          {renderFilterContent()}
        </DialogContent>
      </Dialog>
    );
  }

  // 使用 Popover 渲染
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h4 className="mb-4 font-medium leading-none">{t('filter.labels.filterTitle', { column: column.title })}</h4>
          {renderFilterContent()}
        </div>
      </PopoverContent>
    </Popover>
  );
};
