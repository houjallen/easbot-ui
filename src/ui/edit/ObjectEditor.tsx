/**
 * 对象编辑器
 * 支持键值对形式的对象编辑
 */

import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { processUiMessage } from '../../utils/ui-message';
import { editMessages } from '../../utils/component-messages';
import { cn } from '../../utils/classnames';
import React, { useCallback, useState } from 'react';

export interface ObjectProperty {
  key: string;
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'object';
}

export interface ObjectEditorProps {
  /** 当前值 */
  value?: Record<string, any>;
  /** 值变更回调 */
  onChange: (value: Record<string, any>) => void;
  /** 字段名（用于表单场景，即使暂不使用也需按规范接收） */
  name?: string;
  /** 占位符 */
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 最大属性数量 */
  maxProperties?: number;
  /** 最小属性数量 */
  minProperties?: number;
  /** 添加按钮文本 */
  addButtonText?: string;
  /** 预定义的键列表 */
  predefinedKeys?: string[];
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
  /** 语言环境 */
  locale?: string;
  /** 结构化 schema（保留以便上层透传，即使当前未使用） */
  schema?: any;
}

/**
 * 对象编辑器组件
 */
export const ObjectEditor: React.FC<ObjectEditorProps> = ({
  value = {},
  onChange,
  name,
  keyPlaceholder,
  valuePlaceholder,
  disabled = false,
  readOnly = false,
  className,
  maxProperties,
  minProperties = 0,
  addButtonText,
  predefinedKeys = [],
  popoverContentStyle,
  locale = 'zh-CN',
  schema,
}) => {
  const [open, setOpen] = useState(false);

  // 获取国际化消息
  const t = useCallback((key: string, params?: Record<string, any>) => processUiMessage(key, { locale, messages: editMessages }, params), [locale]);

  // 转换为属性数组
  const properties: ObjectProperty[] = React.useMemo(() => {
    return Object.entries(value).map(([key, val]) => ({
      key,
      value: val,
      type: typeof val as any,
    }));
  }, [value]);

  // 格式化显示值
  const formatDisplayValue = React.useCallback((): string => {
    if (!value || Object.keys(value).length === 0) return '';

    // 显示对象属性数量
    const propertyCount = Object.keys(value).length;
    return `${propertyCount} ${t('propertyUnit')}`;
  }, [value, t]);

  // 添加新属性
  const handleAdd = useCallback(() => {
    if (maxProperties && properties.length >= maxProperties) return;

    // 生成唯一键名
    let newKey = 'property';
    let counter = 1;
    while (Object.hasOwn(value, newKey)) {
      newKey = `property${counter}`;
      counter++;
    }

    const newValue = { ...value, [newKey]: '' };
    onChange(newValue);
  }, [value, onChange, maxProperties, properties.length]);

  // 更新属性键
  const handleKeyChange = useCallback(
    (oldKey: string, newKey: string) => {
      if (oldKey === newKey || !newKey.trim()) return;

      const newValue = { ...value };
      if (Object.hasOwn(newValue, oldKey)) {
        newValue[newKey] = newValue[oldKey];
        delete newValue[oldKey];
        onChange(newValue);
      }
    },
    [value, onChange],
  );

  // 更新属性值
  const handleValueChange = useCallback(
    (key: string, newValue: any) => {
      const updatedValue = { ...value, [key]: newValue };
      onChange(updatedValue);
    },
    [value, onChange],
  );

  // 删除属性
  const handleRemove = useCallback(
    (key: string) => {
      if (properties.length <= minProperties) return;

      const newValue = { ...value };
      delete newValue[key];
      onChange(newValue);
    },
    [value, onChange, properties.length, minProperties],
  );

  // 智能类型转换
  const parseValue = (inputValue: string, currentType: string) => {
    if (!inputValue.trim()) return '';

    // 尝试解析为数字
    if (!Number.isNaN(Number(inputValue))) {
      return Number(inputValue);
    }

    // 尝试解析为布尔值
    if (inputValue.toLowerCase() === 'true') return true;
    if (inputValue.toLowerCase() === 'false') return false;

    // 尝试解析为对象或数组
    if ((inputValue.startsWith('{') && inputValue.endsWith('}')) || (inputValue.startsWith('[') && inputValue.endsWith(']'))) {
      try {
        return JSON.parse(inputValue);
      } catch {
        return inputValue;
      }
    }

    return inputValue;
  };

  // 弹出编辑器内容
  const renderEditorContent = () => (
    <div className="space-y-2 p-2">
      {properties.map((property, index) => (
        <div key={`${property.key}-${index}`} className="flex items-center gap-2 rounded-md border p-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            {/* 键输入 */}
            <Input
              value={property.key}
              onChange={(e) => handleKeyChange(property.key, e.target.value)}
              placeholder={keyPlaceholder || t('objectKeyPlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
              list={predefinedKeys.length > 0 ? 'predefined-keys' : undefined}
            />

            {/* 值输入 */}
            <Input
              value={typeof property.value === 'object' ? JSON.stringify(property.value) : String(property.value)}
              onChange={(e) => {
                const parsedValue = parseValue(e.target.value, property.type || 'string');
                handleValueChange(property.key, parsedValue);
              }}
              placeholder={valuePlaceholder || t('objectValuePlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          </div>

          {/* 类型指示器 */}
          <div className="min-w-[60px] text-center text-muted-foreground text-xs">{property.type}</div>

          {/* 删除按钮 */}
          {!disabled && !readOnly && properties.length > minProperties && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(property.key)}
              className="text-destructive hover:text-destructive"
              disabled={disabled}
              rightIcon={<Icon name="x" className="h-4 w-4" />}
            />
          )}
        </div>
      ))}

      {/* 预定义键的数据列表 */}
      {predefinedKeys.length > 0 && (
        <datalist id="predefined-keys">
          {predefinedKeys.map((key) => (
            <option key={key} value={key} />
          ))}
        </datalist>
      )}

      {/* 添加按钮 */}
      {!disabled && !readOnly && (!maxProperties || properties.length < maxProperties) && (
        <Button variant="outline" size="sm" onClick={handleAdd} className="w-full" disabled={disabled} leftIcon={<Icon name="plus" size={16} />}>
          {addButtonText || t('objectAddProperty')}
        </Button>
      )}
    </div>
  );

  // 📌 禁用态必须在 Popover 层兜底：`PopoverTrigger asChild` 的事件合并到外层 div，
  //    点击图标会冒泡到该 div 触发 Radix 打开弹层，仅靠 Input 守卫拦不住 Trigger。
  return (
    <Popover
      open={!disabled && open}
      onOpenChange={(nextOpen) => {
        if (!disabled) setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <div className={cn('relative', disabled && 'cursor-not-allowed', className)} aria-disabled={disabled || undefined}>
          <Input
            name={name}
            value={formatDisplayValue()}
            placeholder={properties.length > 0 ? '' : t('objectPlaceholder')}
            disabled={disabled}
            readOnly={true}
            className="cursor-pointer"
            suffix={<Icon className={cn('opacity-50', disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:opacity-100')} name="function" size={16} />}
            onClick={() => !disabled && setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" style={popoverContentStyle}>
        <div className="max-h-80 overflow-y-auto">{renderEditorContent()}</div>
        <div className="flex justify-end border-t p-2">
          <Button size="sm" onClick={() => setOpen(false)}>
            {t('confirm')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ObjectEditor;
