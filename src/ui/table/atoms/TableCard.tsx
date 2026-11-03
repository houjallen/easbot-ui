import { Card, CardContent, CardFooter } from '../../card';
import { Checkbox } from '../../checkbox';
import { RowActionCell } from './RowActionCell';
import { useTableConfig, useTableContext } from '../context';
import type { TableSize } from '../types';
import { cn } from '../../../utils/classnames';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';

/**
 * 表格卡片组件属性
 */
export interface TableCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 卡片尺寸 */
  size?: TableSize;
  /** 最小宽度 */
  minWidth?: number | string;
  /** 最大宽度 */
  maxWidth?: number | string;
  /** 是否显示阴影 */
  shadow?: boolean;
  /** 是否显示选择框 */
  selectable?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否可悬停 */
  hoverable?: boolean;
  /** 是否选中 */
  selected?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 卡片数据 */
  record?: Record<string, any>;
  /** 数据索引 */
  index?: number;
  /** 卡片标题 */
  title?: ReactNode | ((record: Record<string, any>, index: number) => ReactNode);
  /** 卡片描述 */
  description?: ReactNode | ((record: Record<string, any>, index: number) => ReactNode);
  /** 卡片图片/图标 */
  image?: ReactNode | ((record: Record<string, any>, index: number) => ReactNode);
  /** 是否显示操作区域 */
  showActions?: boolean;
  /** 自定义卡片内容 */
  renderCard?: (record: Record<string, any>, index: number) => ReactNode;
  /** 卡片点击回调 */
  onCardClick?: (record: Record<string, any>, index: number, e: React.MouseEvent) => void;
  /** 卡片双击击回调 */
  onCardDoubleClick?: (record: Record<string, any>, index: number, e: React.MouseEvent) => void;
  /** 选择变化回调 */
  onCheckedChange?: (record: Record<string, any>, index: number, selected: boolean) => void;
}

/**
 * 表格卡片组件
 */
export const TableCard = forwardRef<HTMLDivElement, TableCardProps>(
  (
    {
      className,
      style,
      size = 'md',
      shadow = true,
      selectable = false,
      clickable = false,
      bordered = true,
      hoverable = true,
      selected = false,
      disabled = false,
      record,
      index = 0,
      minWidth = 240,
      maxWidth,
      title,
      description,
      image,
      showActions = true,
      onCardClick,
      onCardDoubleClick,
      onCheckedChange,
      renderCard,
      children,
      ...props
    },
    ref,
  ) => {
    const tableContext = useTableContext();
    const tableConfig = useTableConfig();
    // 处理卡片点击
    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || !record) return;
      onCardClick?.(record, index, e);
    };

    // 处理卡片双击
    const handleCardDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || !record) return;
      onCardDoubleClick?.(record, index, e);
    };

    // 处理选择变化
    const handleSelectionChange = (checked: boolean | 'indeterminate') => {
      if (disabled || !record) return;
      onCheckedChange?.(record, index, checked === true);
    };

    return (
      <Card
        ref={ref}
        className={cn(
          // 基础样式
          'relative transition-all duration-200',

          // 尺寸样式 - 覆盖Card默认的py-6
          {
            'py-3': size === 'sm',
            'py-4': size === 'md',
            'py-6': size === 'lg',
          },

          // 边框样式 - Card默认有border
          !bordered && 'border-0',

          // 悬停样式
          hoverable && !disabled && 'hover:bg-muted/50',

          // 选中样式
          selected && 'border-primary bg-muted/80',

          // 阴影样式 - Card默认有shadow-sm
          shadow ? 'shadow-sm' : 'shadow-none',

          // 禁用样式
          disabled && 'cursor-not-allowed opacity-50',

          // 可点击样式
          clickable && !disabled && 'cursor-pointer',

          // EAS表格选项卡扩展样式
          'eas-table-card',

          // 自定义类名
          className,
        )}
        style={{
          minWidth,
          maxWidth,
          ...style,
        }}
        onDoubleClick={(e) => {
          handleCardDoubleClick(e);
        }}
        onClick={(e) => {
          handleCardClick(e);
        }}
        {...props}
      >
        {/* 选择框 */}
        {selectable && (
          <div className="absolute top-2 right-2 z-10">
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelectionChange}
              disabled={disabled}
              className={cn('cursor-pointer border-gray-300 focus:ring-1 focus:ring-primary', size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')}
            />
          </div>
        )}

        {/* 卡片内容 */}
        <CardContent className="flex-1 space-y-3">
          {/* 图片/图标区域 */}
          {image && (
            <div className="flex justify-center">
              <div
                className={cn('flex items-center justify-center rounded-full', {
                  'h-8 w-8': size === 'sm',
                  'h-12 w-12': size === 'md',
                  'h-16 w-16': size === 'lg',
                })}
              >
                {typeof image === 'function' ? image(record || {}, index) : image}
              </div>
            </div>
          )}

          {/* 标题区域 */}
          {title && (
            <div className="text-center">
              <h3
                className={cn('truncate font-medium text-foreground', {
                  // 统一使用 text-sm，符合 DS 规范，只通过其他样式区分尺寸
                  'text-sm': true,
                })}
              >
                {typeof title === 'function' ? title(record || {}, index) : title}
              </h3>
            </div>
          )}

          {/* 描述区域 */}
          {description && (
            <div className="text-center">
              <p
                className={cn('text-muted-foreground', {
                  // 统一使用 text-sm，符合 DS 规范
                  'text-sm': true,
                })}
              >
                {typeof description === 'function' ? description(record || {}, index) : description}
              </p>
            </div>
          )}

          {/* 自定义内容 */}
          {children}
        </CardContent>

        {/* 操作区域 - 使用 RowActionCell 复用插件系统 */}
        {showActions && tableConfig?.rowAction && record && (
          <CardFooter className="border-t pt-3 pb-3">
            <div className="flex w-full justify-center">
              <RowActionCell
                record={record}
                rowIndex={index}
                config={{
                  actions: tableConfig?.rowAction?.actions,
                  maxVisible: tableConfig?.rowAction?.maxVisible,
                  showLabel: true, // 卡片中显示操作标签
                  size: 'sm', // 根据卡片尺寸调整按钮大小
                }}
                className="justify-center" // 居中显示操作按钮
              />
            </div>
          </CardFooter>
        )}
      </Card>
    );
  },
);

TableCard.displayName = 'TableCard';
