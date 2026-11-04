/**
 * Combobox 组件
 *
 * @description
 * 一个灵活的组合框组件，允许用户从预设选项列表中选择，支持文本输入进行搜索和过滤。
 * 主要特性包括：
 * 1. 单选或多选模式
 * 2. 通过输入文本动态搜索和过滤选项
 * 3. 支持选项分组展示
 * 4. 加载状态、禁用状态以及不同的视觉变体（如错误、成功）
 */

import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../command';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import * as React from 'react';
import { ScrollArea } from '../scroll-area';

// 选项接口
interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// 分组接口
interface SelectGroup {
  label: string;
  options: SelectOption[];
}

// 样式变体定义
//
// 📌 **边框用 `border-input`，与 `SelectTrigger` 完全一致** ——
//    `border-input` 解析到主题令牌 `--input`，而 `--input` 现在指向
//    `--input-border-color`（`gray-400`，**不透明**）→ 边框清晰可见。
//
//    📌 历史问题：此前 `--input` 是
//    `color-mix(in srgb, hsl(var(--gray-100)) 40%, transparent)`
//    —— 96% 亮色 × 40% 透明度，铺在 `--background` 上**几乎不可见**，
//    表现为「默认样式没生效 / 没有边框」。已在 light.css / dark.css 修正。
//
// 📌 其余类名与 `design-system/components/ui/select.tsx` 的 `SelectTrigger` 对齐，
//    保证 Combobox 与 Select 在同一页面下视觉一致。
const selectVariants = cva(
  'flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input-background/30 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-[var(--destructive)] focus-visible:ring-[var(--destructive)]',
        success: 'border-[var(--success)] focus-visible:ring-[var(--success)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// 导出变体类型
export type SelectVariant = NonNullable<VariantProps<typeof selectVariants>['variant']>;

// 组件属性定义
interface EunComboboxProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'value' | 'onChange' | 'size'>, Omit<VariantProps<typeof selectVariants>, 'size'>, UiMessageProps {
  /**
   * @title 触发按钮的自定义 className
   */
  triggerClassName?: string;
  /**
   * @title 弹层内容的自定义 className
   */
  popoverContentClassName?: string;
  /**
   * @title 弹层内容的自定义样式
   */
  popoverContentStyle?: React.CSSProperties;
  /**
   * @title 组合框的变体样式（兼容旧用法，推荐使用 error/success 布尔值）
   * @default default
   */
  variant?: VariantProps<typeof selectVariants>['variant'];
  /**
   * @title 错误状态，边框高亮为错误色
   */
  error?: boolean;
  /**
   * @title 错误信息文案
   * @description
   * 传入后在触发器下方以 `text-destructive` 样式展示错误详情。
   * 需配合 `error`（或 `variant="error"`）使用 —— 仅 `error` 时只有边框高亮，无文案。
   */
  errorMessage?: string;
  /**
   * @title 成功状态，边框高亮为成功色
   */
  success?: boolean;
  /** 选项列表 */
  options: (SelectOption | SelectGroup)[];
  /** 当前选中值 */
  value?: string | number | (string | number)[];
  /** 值变化回调 */
  onChange?: (value: string | number | (string | number)[]) => void;
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
}

type EunComboboxRef = HTMLButtonElement;

const EunCombobox = React.forwardRef<EunComboboxRef, EunComboboxProps>(
  (
    {
      variant = 'default', // 兼容旧用法，推荐直接用 error/success
      error = false,
      success = false,
      errorMessage,
      triggerClassName,
      popoverContentClassName,
      popoverContentStyle,
      options,
      value,
      onChange,
      placeholder,
      disabled = false,
      loading = false,
      multiple = false,
      searchable = false,
      className,
      onSearch,
      label,
      description,
      locale,
      messages,
      ...props
    },
    ref,
  ) => {
    // 状态管理
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');

    // 组件文案（占位符 / 加载态 / 空状态）来自内置文案表
    const { t } = useComponentMessage('select', { locale, messages });
    const finalPlaceholder = placeholder ?? t('placeholder');

    // 非受控模式下的内部选中值
    // `value` 为可选 prop，若完全依赖它推导选中项，非受控多选将无法累积选择结果，
    // 因此这里保留一份内部状态，受控时以 `value` 为准。
    const [uncontrolledValues, setUncontrolledValues] = React.useState<(string | number)[]>([]);
    const isControlled = value !== undefined && value !== null;

    const currentSelectedValues = React.useMemo(() => {
      if (isControlled) {
        return Array.isArray(value) ? value : [value as string | number];
      }
      return uncontrolledValues;
    }, [isControlled, value, uncontrolledValues]);

    // Refs
    const listRef = React.useRef<HTMLDivElement>(null);

    // Remove useEffect that syncs props.value to internal state, as we now derive from props directly.

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
      (optionValue: string | number) => {
        // 转换回原始类型
        const originalTypeValue = allOptions.find((opt) => String(opt.value) === String(optionValue))?.value ?? optionValue;

        if (multiple) {
          const newValues = currentSelectedValues.includes(originalTypeValue)
            ? currentSelectedValues.filter((v) => String(v) !== String(originalTypeValue))
            : [...currentSelectedValues, originalTypeValue];

          // 非受控模式下同步内部状态，保证多次选择可以累积
          if (!isControlled) {
            setUncontrolledValues(newValues);
          }
          onChange?.(newValues);
        } else {
          // Single select logic
          if (!isControlled) {
            setUncontrolledValues([originalTypeValue]);
          }
          onChange?.(originalTypeValue);
          setOpen(false); // Always close on single select interaction
        }
      },
      [multiple, onChange, currentSelectedValues, allOptions, isControlled],
    );

    // 处理搜索
    const handleSearch = React.useCallback(
      (value: string) => {
        setSearchValue(value);
        onSearch?.(value);
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
    const renderOptions = () => {
      if (filteredOptions.length === 0 && !loading) return null; // No options to display

      return (
        <>
          {filteredOptions.map((itemOrGroup, index) => {
            if ('options' in itemOrGroup) {
              // This is a SelectOptionGroup
              return (
                <CommandGroup key={itemOrGroup.label || `group-${index}`} heading={itemOrGroup.label} className={cn('px-1 py-1')}>
                  {itemOrGroup.options.map((option) => (
                    <CommandItem
                      key={String(option.value)}
                      value={String(option.value)} // cmdk uses this for filtering and selection state
                      onSelect={() => {
                        if (!option.disabled) {
                          handleSelect(option.value);
                        }
                      }}
                      disabled={option.disabled}
                      className={cn(
                        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none',
                        !option.disabled &&
                          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
                        option.disabled && 'cursor-not-allowed opacity-50',
                      )}
                      data-testid={`combobox-option-${String(option.value)}`}
                    >
                      {multiple && currentSelectedValues.some((v) => String(v) === String(option.value)) && <Check className="h-4 w-4" />}
                      <span className="truncate">{option.label}</span>
                      {!multiple && currentSelectedValues.some((v) => String(v) === String(option.value)) && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            } else {
              // This is a direct SelectOption
              const option = itemOrGroup;
              return (
                <CommandItem
                  key={String(option.value)}
                  value={String(option.value)}
                  onSelect={() => {
                    if (!option.disabled) {
                      handleSelect(option.value);
                    }
                  }}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none',
                    !option.disabled &&
                      'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
                    option.disabled && 'cursor-not-allowed opacity-50',
                  )}
                  data-testid={`combobox-option-${String(option.value)}`}
                >
                  {multiple && currentSelectedValues.some((v) => String(v) === String(option.value)) && <Check className="h-4 w-4" />}
                  <span className="truncate">{option.label}</span>
                  {!multiple && currentSelectedValues.some((v) => String(v) === String(option.value)) && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              );
            }
          })}
        </>
      );
    };

    // 渲染「移除某个已选项」的控件
    //
    // 📌 **必须用 `<span role="button">`，不能用 `<button>`** ——
    //    触发器本身就是 `<button>`，嵌套 `<button>` 是非法 HTML：
    //    React 会告警 "In HTML, <button> cannot be a descendant of <button>"，
    //    SSR 场景还会触发 hydration 错误。
    //    改用 `<span role="button">` + `tabIndex` + `onKeyDown`，
    //    既规避非法嵌套，又保持键盘可达（符合 spec §3.7 无障碍要求 1/2）。
    const renderRemoveControl = (option: SelectOption) => (
      <span
        role="button"
        tabIndex={0}
        aria-label={t('removeOption')}
        className="ml-1 inline-flex items-center justify-center"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSelect(option.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleSelect(option.value);
          }
        }}
      >
        <X className="h-3 w-3 cursor-pointer hover:text-primary-foreground/80" aria-hidden="true" />
      </span>
    );

    // 渲染选中值的显示
    const renderSelectedValue = () => {
      if (currentSelectedValues.length === 0) {
        return <span className="text-muted-foreground">{finalPlaceholder}</span>;
      }

      if (multiple) {
        const selectedOptions = currentSelectedValues.map((val) => allOptions.find((opt) => String(opt.value) === String(val))).filter(Boolean) as SelectOption[];

        if (selectedOptions.length === 0) {
          return <span className="text-muted-foreground">{finalPlaceholder}</span>;
        }

        // 如果只有一个选项，直接显示
        if (selectedOptions.length === 1) {
          // `noUncheckedIndexedAccess` 下索引访问可能为 undefined，
          // 但此处已由 `length === 1` 保证非空
          const option = selectedOptions[0]!;
          return (
            <div className="flex items-center gap-1">
              <span className={cn('flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs', 'bg-primary text-primary-foreground')}>
                {option.label}
                {renderRemoveControl(option)}
              </span>
            </div>
          );
        }

        // 多个选项时，显示第一个 + 数量
        // `noUncheckedIndexedAccess` 下索引访问可能为 undefined，
        // 但此处已由 `length >= 1` 保证非空
        const firstOption = selectedOptions[0]!;
        const remainingCount = selectedOptions.length - 1;

        return (
          <div className="flex min-w-0 items-center gap-1">
            <span className={cn('flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs', 'bg-primary text-primary-foreground')}>
              <span className="max-w-[80px] truncate">{firstOption.label}</span>
              {renderRemoveControl(firstOption)}
            </span>
            {remainingCount > 0 && <span className="whitespace-nowrap text-muted-foreground text-xs">+{remainingCount}</span>}
          </div>
        );
      }

      // 单选模式
      const selectedLabels = allOptions.filter((opt) => currentSelectedValues.some((v) => String(v) === String(opt.value))).map((opt) => opt.label);
      return selectedLabels.length > 0 ? <span className="truncate text-foreground">{selectedLabels[0]}</span> : <span className="text-muted-foreground">{finalPlaceholder}</span>;
    };

    // 为下拉列表创建唯一ID
    const listId = React.useId();

    return (
      // 📌 **`className` 作用于外层容器** ——
      //    此前 `className` 被解构出来却从未使用，消费方传的类名被静默丢弃，
      //    只能靠 `triggerClassName` 给内层 button 加样式，无法给外层 wrapper 加样式。
      //    `cn()` 保证调用方类名在末位 → 优先级最高（符合 spec 的 className 末位约定）。
      <div className={cn('grid w-full gap-1.5', className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn('font-medium text-sm leading-none', {
              'cursor-not-allowed opacity-70': disabled,
              'text-destructive': error,
            })}
          >
            {label}
          </label>
        )}

        {description && <p className="text-muted-foreground text-sm">{description}</p>}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {/*
             * 📌 **直接用原生 `button`，不用 `Button` 组件** ——
             *    `Button` 会把所有 children 包进
             *    `<div class="flex items-center justify-center">`，
             *    Combobox 传入「文字 + 图标」两个子元素时：
             *    1. 外层的 `justify-between` 被内层 `justify-center` 覆盖 →
             *       图标紧贴文字而不是靠右；
             *    2. 内层 `span` 无宽度约束 → 文字的 `flex-1` 失效 →
             *       图标被挤到文字下方换行。
             *    触发器需要「左右分布」的布局，原生 `button` 才能精确控制。
             */}
            <button
              id={id}
              ref={ref}
              type="button"
              disabled={disabled || loading}
              aria-busy={loading || undefined}
              aria-invalid={!!error}
              aria-expanded={open}
              aria-controls={listId}
              aria-haspopup="dialog"
              role="combobox"
              className={cn(
                selectVariants({
                  variant: !error && !success ? (variant as any) : error ? 'error' : 'success',
                }),
                triggerClassName,
              )}
              {...props}
            >
              <span className="min-w-0 flex-1 truncate text-left">{renderSelectedValue()}</span>
              <span className="ml-2 shrink-0">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              'w-[var(--radix-popover-trigger-width)] p-0',
              'rounded-md border bg-popover text-popover-foreground shadow-md',
              // Adding animation classes similar to DsSelectContent
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
              'z-50 min-w-[8rem]',
              popoverContentClassName,
            )}
            style={popoverContentStyle}
          >
            <Command className={cn('flex flex-col')} shouldFilter={!searchable} loop>
              {searchable && (
                <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                  <CommandInput
                    value={searchValue}
                    onValueChange={handleSearch}
                    placeholder={t('searchPlaceholder')}
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
              <ScrollArea className="max-h-72">
                <CommandList className={cn('overflow-x-auto overflow-y-auto')}>
                  {loading && <div className="p-6 text-center text-sm">{t('loading')}</div>}
                  {!loading && filteredOptions.length === 0 && searchValue && <CommandEmpty className={cn('py-6 text-center text-sm')}>{t('noResults')}</CommandEmpty>}
                  {renderOptions()} {/* This should return CommandGroup/CommandItem */}
                </CommandList>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>

        {/*
         * 📌 **错误文案用 `errorMessage`** ——
         *    此前这里渲染的是 `error`（boolean），React 渲染 boolean 为文本节点时
         *    **不输出任何内容** → 这段错误提示实际恒为空。
         *    现在渲染消费方传入的 `errorMessage` 文案；未传时整段不渲染。
         */}
        {errorMessage && <p className="font-medium text-destructive text-sm">{errorMessage}</p>}
      </div>
    );
  },
);

EunCombobox.displayName = 'EunCombobox';

export { EunCombobox as Combobox };

export type { EunComboboxProps as ComboboxProps, EunComboboxRef as ComboboxRef, SelectOption as ComboboxOption, SelectGroup as ComboboxGroup };
