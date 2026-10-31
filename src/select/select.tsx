/**
 * Select 组件
 *
 * @description
 * 简化版 Select 组件，支持以下特性：
 * 1. 单选/多选模式
 * 2. 可搜索过滤
 * 3. 分组选项
 */

import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { cn } from '../utils/classnames';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import * as React from 'react';

// 选项接口
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// 分组接口
export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

// 样式变体定义
const selectVariants = cva(
  [
    'flex w-full items-center justify-between',
    'border',
    'border-[var(--form-input-border)]',
    'rounded-[var(--form-input-radius)]',
    'bg-[var(--form-input-bg)]',
    'text-[var(--form-input-text)]',
    'placeholder:text-[var(--form-input-placeholder)]',
    'focus:outline-none focus:ring-0',
    'focus:border-[var(--form-input-focus-border)]',
    'focus:bg-[var(--form-input-focus-bg)]',
    'focus:text-[var(--form-input-focus-text)]',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'hover:border-[var(--form-input-hover-border)]',
    'hover:bg-[var(--form-input-hover-bg)]',
    'transition-all duration-200',
  ].join(' '),
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus:ring-destructive',
        success: 'border-success focus:ring-success',
      },
      size: {
        sm: 'h-8 px-2 py-1 text-xs',
        default: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// 导出变体类型
export type SelectVariant = NonNullable<VariantProps<typeof selectVariants>['variant']>;
export type SelectSize = NonNullable<VariantProps<typeof selectVariants>['size']>;

// 组件属性定义
export interface SelectProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'value' | 'onChange'>, VariantProps<typeof selectVariants> {
  /** 选项列表 */
  options: (SelectOption | SelectGroup)[];
  /** 当前选中值 */
  value?: string | string[];
  /** 值变化回调 */
  onChange?: (value: string | string[]) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 搜索回调 */
  onSearch?: (value: string) => void;
  /** 标签文本 */
  label?: string;
  /** 描述文本 */
  description?: string;
  /** 错误信息 */
  error?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      variant = 'default',
      size = 'default',
      options,
      value,
      onChange,
      placeholder = '请选择',
      disabled = false,
      loading = false,
      multiple = false,
      searchable = false,
      className,
      onSearch,
      label,
      description,
      error,
      ...props
    },
    ref,
  ) => {
    // 状态管理
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const [selectedValues, setSelectedValues] = React.useState<string[]>(() => {
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    });

    // Refs
    const listRef = React.useRef<HTMLDivElement>(null);

    // 生成唯一ID
    const id = React.useId();

    // 计算所有选项
    const allOptions = React.useMemo(() => {
      const flatOptions: SelectOption[] = [];
      options.forEach((option) => {
        if ('options' in option) {
          flatOptions.push(...option.options);
        } else {
          flatOptions.push(option);
        }
      });
      return flatOptions;
    }, [options]);

    // 处理选择
    const handleSelect = React.useCallback(
      (optionValue: string) => {
        let newValues: string[];

        if (multiple) {
          newValues = selectedValues.includes(optionValue) ? selectedValues.filter((v) => v !== optionValue) : [...selectedValues, optionValue];
        } else {
          newValues = [optionValue];
          setOpen(false);
        }

        setSelectedValues(newValues);

        if (onChange) {
          onChange(multiple ? newValues : newValues[0] || '');
        }
      },
      [multiple, onChange, selectedValues],
    );

    // 处理搜索
    const handleSearch = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        if (onSearch) {
          onSearch(value);
        }
      },
      [onSearch],
    );

    // 过滤选项
    const filteredOptions = React.useMemo(() => {
      if (!searchValue.trim()) return options;

      return options
        .map((option) => {
          if ('options' in option) {
            const filteredGroupOptions = option.options.filter((opt) => opt.label.toLowerCase().includes(searchValue.toLowerCase()));
            return filteredGroupOptions.length > 0 ? { ...option, options: filteredGroupOptions } : null;
          }

          return option.label.toLowerCase().includes(searchValue.toLowerCase()) ? option : null;
        })
        .filter(Boolean) as (SelectOption | SelectGroup)[];
    }, [options, searchValue]);

    // 渲染选项
    const renderOptions = React.useCallback(() => {
      return filteredOptions.map((group) => {
        // 渲染分组
        if ('options' in group) {
          return (
            <div key={group.label} className="px-1 py-1">
              <div className="px-2 py-1.5 text-sm font-semibold text-[var(--select-group-label-color)]">{group.label}</div>
              <div className="pl-2">
                {group.options.map((option) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={selectedValues.includes(option.value)}
                    aria-disabled={option.disabled}
                    tabIndex={option.disabled ? -1 : 0}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    onKeyDown={(event) => {
                      // 键盘可达性：Enter / Space 触发选择
                      if (option.disabled) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSelect(option.value);
                      }
                    }}
                    className={cn(
                      'flex items-center justify-between',
                      'h-[var(--select-option-height)]',
                      'px-[var(--select-option-padding-x)]',
                      'py-[var(--select-option-padding-y)]',
                      'cursor-pointer',
                      'hover:bg-[var(--select-option-hover-background)]',
                      'hover:text-[var(--select-option-hover-foreground)]',
                      selectedValues.includes(option.value) ? 'bg-[var(--select-option-selected-background)] text-[var(--select-option-selected-foreground)]' : '',
                      option.disabled && 'opacity-[var(--select-option-disabled-opacity)] pointer-events-none',
                    )}
                  >
                    <span className="flex-1 whitespace-nowrap">{option.label}</span>
                    {selectedValues.includes(option.value) && <Check className="h-4 w-4 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 渲染单个选项
        return (
          <div
            key={group.value}
            role="option"
            aria-selected={selectedValues.includes(group.value)}
            aria-disabled={group.disabled}
            tabIndex={group.disabled ? -1 : 0}
            onClick={() => !group.disabled && handleSelect(group.value)}
            onKeyDown={(event) => {
              // 键盘可达性：Enter / Space 触发选择
              if (group.disabled) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleSelect(group.value);
              }
            }}
            className={cn(
              'flex items-center gap-2',
              'h-[var(--select-option-height)]',
              'px-[var(--select-option-padding-x)]',
              'py-[var(--select-option-padding-y)]',
              'cursor-pointer',
              'hover:bg-[var(--select-option-hover-background)]',
              'hover:text-[var(--select-option-hover-foreground)]',
              selectedValues.includes(group.value) ? 'bg-[var(--select-option-selected-background)] text-[var(--select-option-selected-foreground)]' : '',
              group.disabled && 'opacity-[var(--select-option-disabled-opacity)] pointer-events-none',
            )}
          >
            <span className="flex-1 whitespace-nowrap">{group.label}</span>
            {selectedValues.includes(group.value) && <Check className="h-4 w-4 flex-shrink-0" />}
          </div>
        );
      });
    }, [filteredOptions, handleSelect, selectedValues]);

    // 渲染选中值的显示
    const renderSelectedValue = () => {
      if (selectedValues.length === 0) {
        return <span className="text-[var(--select-placeholder-color)]">{placeholder}</span>;
      }

      if (multiple) {
        return (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((val) => {
              const option = allOptions.find((opt) => opt.value === val);
              if (!option) return null;

              return (
                <span key={val} className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-sm', 'bg-[var(--select-option-selected-background)]', 'text-[var(--select-option-selected-foreground)]')}>
                  {option.label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(val);
                    }}
                  />
                </span>
              );
            })}
          </div>
        );
      }

      // 单选模式
      const selectedOption = allOptions.find((opt) => opt.value === selectedValues[0]);
      return selectedOption ? selectedOption.label : placeholder;
    };

    // 为下拉列表创建唯一ID
    const listId = React.useId();

    return (
      <div className="grid w-full gap-1.5">
        {label && (
          <label htmlFor={id} className={cn('text-sm font-medium leading-none', { 'cursor-not-allowed opacity-70': disabled, 'text-destructive': error })}>
            {label}
          </label>
        )}

        {description && <p className="text-sm text-muted-foreground">{description}</p>}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id={id}
              ref={ref}
              type="button"
              role="combobox"
              aria-controls={listId}
              aria-expanded={open}
              disabled={disabled || loading}
              aria-invalid={!!error}
              className={cn(selectVariants({ variant, size }), error && 'border-destructive', className)}
              {...props}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate text-left">{renderSelectedValue()}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </>
              )}
            </button>
          </PopoverTrigger>
          {open && (
            <PopoverContent
              className={cn(
                'p-0 w-[var(--radix-popover-trigger-width)]',
                'bg-[var(--select-dropdown-background)]',
                'border-[var(--select-dropdown-border-color)]',
                'shadow-[var(--select-dropdown-shadow)]',
              )}
              align="start"
              sideOffset={5}
            >
              <div className="w-full">
                {searchable && (
                  <div
                    className={cn(
                      'flex items-center px-3',
                      'h-[var(--select-search-height)]',
                      'bg-[var(--select-search-background)]',
                      'border-[var(--select-search-border-width)]',
                      'border-[var(--select-search-border-color)]',
                    )}
                  >
                    <Search className={cn('mr-2 shrink-0', 'h-[var(--select-icon-size)] w-[var(--select-icon-size)]', 'text-[var(--select-search-icon-color)]')} />
                    <input
                      type="text"
                      placeholder="搜索..."
                      value={searchValue}
                      onChange={handleSearch}
                      className={cn('h-[var(--select-search-height)] w-full', 'focus:outline-none', 'placeholder:text-[var(--select-search-placeholder-color)]', 'bg-transparent border-none')}
                    />
                  </div>
                )}
                <div className="relative overflow-hidden" style={{ maxHeight: 'var(--select-dropdown-max-height)' }}>
                  <div
                    id={listId}
                    ref={listRef}
                    className={cn('h-full w-full', 'overflow-x-auto overflow-y-auto', 'scrollbar-thin', 'scrollbar-thumb-[var(--scroll-bar-thumb-color)]', 'scrollbar-track-transparent')}
                    role="listbox"
                    aria-multiselectable={multiple}
                    style={{
                      maxHeight: 'var(--select-dropdown-max-height)',
                    }}
                  >
                    <div className="py-1">{filteredOptions.length === 0 ? <div className="py-6 text-center text-sm text-[var(--select-empty-text-color)]">无匹配结果</div> : renderOptions()}</div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          )}
        </Popover>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
