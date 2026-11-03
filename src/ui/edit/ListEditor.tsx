/**
 * 列表编辑器
 * 支持动态添加、删除、排序列表项
 */

import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { processUiMessage } from '../../utils/ui-message';
import { editMessages } from '../../utils/component-messages';
import { cn } from '../../utils/classnames';
import React, { useCallback, useState } from 'react';

export interface ListItem {
  id: string;
  value: any;
  label?: string;
}

export interface ListEditorProps {
  /** 当前值 */
  value?: any[];
  /** 值变更回调 */
  onChange: (value: any[]) => void;
  /** 字段名（用于表单场景，即使暂不使用也需按规范接收） */
  name?: string;
  /** 列表项类型 */
  itemType?: 'string' | 'number' | 'object';
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 最大项目数量 */
  maxItems?: number;
  /** 最小项目数量 */
  minItems?: number;
  /** 是否支持排序 */
  sortable?: boolean;
  /** 添加按钮文本 */
  addButtonText?: string;
  /** 自定义项目渲染器 */
  itemRenderer?: (item: ListItem, index: number, onUpdate: (newValue: any) => void, onRemove: () => void) => React.ReactNode;
  /** 弹层内容的自定义样式 */
  popoverContentStyle?: React.CSSProperties;
  /** 语言环境 */
  locale?: string;
}

/**
 * 列表编辑器组件
 */
export const ListEditor: React.FC<ListEditorProps> = ({
  value = [],
  onChange,
  name,
  itemType = 'string',
  placeholder,
  disabled = false,
  readOnly = false,
  className,
  maxItems,
  minItems = 0,
  sortable = false,
  addButtonText,
  itemRenderer,
  popoverContentStyle,
  locale = 'zh-CN',
}) => {
  const [open, setOpen] = useState(false);

  // 获取国际化消息
  const t = useCallback((key: string, params?: Record<string, any>) => processUiMessage(key, { locale, messages: editMessages }, params), [locale]);

  // 转换为内部格式
  const items: ListItem[] = React.useMemo(() => {
    return value.map((item, index) => ({
      id: `item-${index}`,
      value: item,
      label: typeof item === 'string' ? item : JSON.stringify(item),
    }));
  }, [value]);

  // 格式化显示值
  const formatDisplayValue = React.useCallback((): string => {
    if (!value || value.length === 0) return '';

    // 对于对象类型，显示对象数量
    if (itemType === 'object') {
      return `${value.length} ${t('propertyUnit')}`;
    }

    // 对于其他类型，显示前几个项目
    const displayItems = value.slice(0, 3);
    const displayText = displayItems.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ');

    return value.length > 3 ? `${displayText}... (${value.length} ${t('listItemsUnit')})` : displayText;
  }, [value, itemType, t]);

  // 添加新项目
  const handleAdd = useCallback(() => {
    if (maxItems && items.length >= maxItems) return;

    let newValue: any;
    switch (itemType) {
      case 'number':
        newValue = 0;
        break;
      case 'object':
        newValue = {};
        break;
      default:
        newValue = '';
    }

    const newItems = [...value, newValue];
    onChange(newItems);
  }, [value, onChange, itemType, maxItems, items.length]);

  // 更新项目
  const handleUpdate = useCallback(
    (index: number, newValue: any) => {
      const newItems = [...value];
      newItems[index] = newValue;
      onChange(newItems);
    },
    [value, onChange],
  );

  // 删除项目
  const handleRemove = useCallback(
    (index: number) => {
      if (items.length <= minItems) return;

      const newItems = value.filter((_, i) => i !== index);
      onChange(newItems);
    },
    [value, onChange, items.length, minItems],
  );

  // 移动项目
  const handleMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!sortable) return;

      const newItems = [...value];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      onChange(newItems);
    },
    [value, onChange, sortable],
  );

  // 拖拽处理
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (!sortable || disabled || readOnly) return;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== dropIndex) {
      handleMove(dragIndex, dropIndex);
    }
    setDragIndex(null);
  };

  // 默认项目渲染器
  const defaultItemRenderer = (item: ListItem, index: number, onUpdate: (newValue: any) => void, onRemove: () => void) => {
    return (
      <div
        key={item.id}
        className={cn('flex items-center gap-2 rounded-md border p-2', dragIndex === index && 'opacity-50', sortable && !disabled && !readOnly && 'cursor-move')}
        draggable={sortable && !disabled && !readOnly}
        onDragStart={() => handleDragStart(index)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
      >
        {sortable && !disabled && !readOnly && <Icon name="grip-vertical" className="text-muted-foreground" size={16} />}

        <div className="flex-1">
          {itemType === 'object' ? (
            <Input
              value={JSON.stringify(item.value)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate(parsed);
                } catch {
                  // 忽略解析错误，保持原值
                }
              }}
              placeholder={placeholder || t('listPlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          ) : (
            <Input
              type={itemType === 'number' ? 'number' : 'text'}
              value={item.value}
              onChange={(e) => {
                const newValue = itemType === 'number' ? (e.target.value === '' ? 0 : Number(e.target.value)) : e.target.value;
                onUpdate(newValue);
              }}
              placeholder={placeholder || t('listPlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          )}
        </div>

        {!disabled && !readOnly && items.length > minItems && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive" rightIcon={<Icon name="x" size={16} />} />
        )}
      </div>
    );
  };

  const renderItem = itemRenderer || defaultItemRenderer;

  // 弹出编辑器内容
  const renderEditorContent = () => (
    <div className="space-y-2 p-2">
      {items.map((item, index) =>
        renderItem(
          item,
          index,
          (newValue) => handleUpdate(index, newValue),
          () => handleRemove(index),
        ),
      )}

      {!disabled && !readOnly && (!maxItems || items.length < maxItems) && (
        <Button variant="outline" size="sm" onClick={handleAdd} className="w-full" disabled={disabled} leftIcon={<Icon name="plus" size={16} />}>
          {addButtonText || t('listAddItem')}
        </Button>
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('relative', className)}>
          <Input
            name={name}
            value={formatDisplayValue()}
            placeholder={value && value.length > 0 ? '' : placeholder || t('listPlaceholder')}
            disabled={disabled}
            readOnly={true}
            className="cursor-pointer"
            suffix={<Icon className={cn('cursor-pointer opacity-50 hover:opacity-100', disabled && 'cursor-not-allowed opacity-30')} name="function" size={16} />}
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

export default ListEditor;
