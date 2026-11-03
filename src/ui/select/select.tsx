import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import { Select as DsSelect, SelectGroup as DsSelectGroup } from '../../design-system/components/ui/select';
import {
  SelectContent as DsSelectContent,
  SelectItem as DsSelectItem,
  SelectLabel as DsSelectLabel,
  SelectTrigger as DsSelectTrigger,
  SelectValue as DsSelectValue,
} from '../../design-system/components/ui/select';
import * as React from 'react';
import { useOptionalFormField } from '../form/form'; // 自动感知表单上下文

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface EunSelectProps extends UiMessageProps {
  options?: SelectOption[];
  groups?: SelectGroup[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  popoverContentClassName?: string;
  popoverContentStyle?: React.CSSProperties;
  size?: 'sm' | 'default';
  name?: string;
  required?: boolean;
  error?: boolean;
  success?: boolean;
  /** 无障碍标签 —— 透传到触发器（combobox） */
  'aria-label'?: string;
  /** 无障碍描述关联 id —— 透传到触发器（combobox） */
  'aria-labelledby'?: string;
  /** 无障碍描述 id —— 透传到触发器（combobox） */
  'aria-describedby'?: string;
}

const Select = React.forwardRef<React.ElementRef<typeof DsSelectTrigger>, EunSelectProps>((props, ref) => {
  const {
    options,
    groups,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    disabled,
    className,
    contentClassName,
    popoverContentClassName,
    popoverContentStyle,
    size = 'default',
    name,
    required,
    error: errorProp,
    success: successProp,
    locale,
    messages,
    // 无障碍属性需要落到触发器（combobox）上 —— Radix Select 的 Root 不渲染 DOM，
    // 直接透传给 Root 会被丢弃，因此这里单独取出后传给 SelectTrigger
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...restProps
  } = props;

  // 占位符文案来自内置文案表
  const { t } = useComponentMessage('select', { locale, messages });
  const finalPlaceholder = placeholder ?? t('placeholder');

  // 自动感知表单校验状态（与 Input 组件一致）
  let error = errorProp;
  let success = successProp;
  const formField = useOptionalFormField();
  if (formField) {
    // react-hook-form 的字段状态用 `invalid` 表达校验失败
    if (typeof error === 'undefined') error = !!formField.invalid;
    // 成功态 = 已被校验过且当前无错误
    if (typeof success === 'undefined') success = formField.isTouched && !formField.invalid;
  }

  const renderOptions = (opts: SelectOption[]) => {
    return opts.map((option) => (
      <DsSelectItem key={option.value} value={option.value} disabled={option.disabled}>
        {option.label}
      </DsSelectItem>
    ));
  };

  return (
    <DsSelect value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} name={name} required={required} {...restProps}>
      <DsSelectTrigger
        ref={ref}
        className={cn('w-full', error ? 'border-[var(--destructive)] focus:ring-[var(--destructive)]' : success ? 'border-[var(--success)] focus:ring-[var(--success)]' : '', className)}
        size={size}
        disabled={disabled}
        aria-invalid={error || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        <DsSelectValue placeholder={finalPlaceholder} />
      </DsSelectTrigger>
      <DsSelectContent className={cn(contentClassName, popoverContentClassName)} style={popoverContentStyle}>
        {options && renderOptions(options)}
        {groups?.map((group) => (
          <DsSelectGroup key={group.label}>
            <DsSelectLabel>{group.label}</DsSelectLabel>
            {renderOptions(group.options)}
          </DsSelectGroup>
        ))}
      </DsSelectContent>
    </DsSelect>
  );
});

Select.displayName = 'EunSelect';

export { Select };
export type { EunSelectProps as SelectProps };
