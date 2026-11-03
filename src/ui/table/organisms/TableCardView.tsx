import { AspectRatio } from '../../aspect-ratio';
import { Icon } from '../../icon';
import { TableCard } from '../atoms/TableCard';
import { TableCardContainer } from '../atoms/TableCardContainer';
import { useTableConfig, useTableContext, useTableState, useTableStateSelectors } from '../context/TableContext';
import { useTableLogic } from '../context/TableContext';
import type { CardConfig } from '../types';
import type { TableCardViewProps } from '../types/components';
import { cn } from '../../../utils/classnames';
import { deepMerge } from '../../../utils/object';
import { useCallback, useMemo } from 'react';
import { forwardRef } from 'react';

/**
 * 表格卡片视图组件
 */
export const TableCardView = forwardRef<
  HTMLDivElement,
  TableCardViewProps & {
    rowClassName?: string | ((record: Record<string, any>, index: number) => string);
  }
>(
  (
    {
      className,
      style,
      // 行样式类名
      rowClassName,
      cardConfig = {},
      onCheckedChange,
      onCardClick,
      onCardDoubleClick,
      ...props
    },
    ref,
  ) => {
    const tableContext = useTableContext();
    const tableConfig = useTableConfig();
    const contextState = useTableState();
    const getRowKey = tableContext.getRowKey;
    const selectedRowKeys = useTableStateSelectors.useSelectedRowKeys();
    const tableLogic = useTableLogic();
    // 智能合并配置：props优先，Context作为fallback
    const data = useMemo(() => {
      // 如果有Context且支持本地数据处理，直接使用getProcessedData获取处理后的数据
      if (contextState && tableLogic) {
        return tableLogic.getProcessedData();
      }

      // 否则使用原始数据：props优先，Context作为fallback
      return [];
    }, [contextState?.data, contextState, tableLogic]);

    // 合并配置 - 优先使用TableConfig中的统一属性
    const finalCardConfig = useMemo(
      () =>
        ({
          layout: 'grid' as const,
          columns: 'auto' as const,
          gap: 16,
          shadow: true,
          // 卡片特有的配置
          titleField: 'name',
          descriptionField: 'description',
          imageField: 'image',
          ...deepMerge(tableConfig?.card, cardConfig),
        }) as CardConfig,
      [tableConfig?.card, cardConfig],
    );

    // 从TableConfig获取统一的样式属性
    const tableSize = tableConfig?.size ?? 'md';
    const tableClickable = tableConfig?.clickable ?? false;
    const tableBordered = tableConfig?.bordered ?? true;
    const tableHoverable = tableConfig?.hoverable ?? true;
    const tableSelectable = tableConfig?.selectable ?? false;
    const tableFillContainer = tableConfig?.fillContainer ?? false;

    // 处理选择变化
    const handleSelectionChange = (record: Record<string, any>, index: number, selected: boolean) => {
      if (!tableConfig?.selectable) return;
      tableLogic.selection.toggleRowSelection(getRowKey(record, index));
      onCheckedChange?.(record, index, selected);
    };

    // 获取行样式类名
    const getRowClassName = useCallback(
      (record: Record<string, any>, index: number): string => {
        const baseClasses: string[] = [];

        if (rowClassName) {
          if (typeof rowClassName === 'function') {
            const customClass = rowClassName(record, index);
            if (customClass) baseClasses.push(customClass);
          } else {
            baseClasses.push(rowClassName);
          }
        }

        return baseClasses.join(' ');
      },
      [rowClassName],
    );

    // 获取卡片标题
    const getCardTitle = (record: Record<string, any>) => {
      if (finalCardConfig.titleField) {
        return record[finalCardConfig.titleField];
      }
      // 默认使用 name、title 或第一个字符串字段
      return record.name || record.title || Object.values(record).find((v) => typeof v === 'string');
    };

    // 获取卡片描述
    const getCardDescription = (record: Record<string, any>) => {
      if (finalCardConfig.descriptionField) {
        return record[finalCardConfig.descriptionField];
      }
      // 默认使用 description、desc 字段
      return record.description || record.desc;
    };

    // 获取卡片图片/图标
    const getCardImage = (record: Record<string, any>) => {
      if (finalCardConfig.imageField) {
        const imageValue = record[finalCardConfig.imageField];
        if (typeof imageValue === 'string') {
          // 如果是字符串，判断是否为图片URL
          if (imageValue.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
            return (
              <AspectRatio ratio={1} className="w-full">
                <img src={imageValue} alt="card" className="h-full w-full rounded object-cover" />
              </AspectRatio>
            );
          }
          // 否则作为图标名称
          return (
            <div className="flex h-full w-full items-center justify-center rounded bg-primary/10">
              <Icon name={imageValue} size={24} variant="default" />
            </div>
          );
        }
        return imageValue;
      }

      // 默认图标 - 使用我们的Icon组件
      return (
        <div className="flex h-full w-full items-center justify-center rounded bg-primary/10">
          <Icon name="file-text" size={24} variant="default" />
        </div>
      );
    };

    // 渲染卡片内容
    const renderCardContent = () => (
      <TableCardContainer
        className={className}
        style={style}
        layout={finalCardConfig.layout}
        size={tableSize}
        columns={finalCardConfig.columns}
        gap={finalCardConfig.gap}
        minWidth={finalCardConfig.minWidth}
        maxWidth={finalCardConfig.maxWidth}
        fillContainer={tableFillContainer}
        bordered={tableBordered}
        empty={data.length === 0}
      >
        {data.map((record, index) => {
          const rowKey = getRowKey(record, index);
          const isSelected = selectedRowKeys.includes(rowKey);

          // 使用自定义渲染函数
          if (typeof finalCardConfig.renderCard === 'function') {
            return <>{finalCardConfig.renderCard(record, tableContext, undefined)}</>;
          }

          // 默认卡片渲染
          return (
            <TableCard
              className={cn(getRowClassName(record, index))}
              key={rowKey}
              size={tableSize}
              clickable={tableClickable}
              shadow={finalCardConfig.shadow}
              bordered={tableBordered} // 使用TableConfig中的统一bordered
              hoverable={tableHoverable} // 使用TableConfig中的统一hoverable
              selectable={tableSelectable}
              selected={isSelected}
              record={record}
              index={index}
              title={(record, index) => getCardTitle(record)}
              description={(record, index) => getCardDescription(record)}
              image={(record, index) => getCardImage(record)}
              showActions={tableConfig?.rowActionable} // 显示操作区域，由 RowActionCell 统一处理
              onCheckedChange={handleSelectionChange}
              onCardClick={(record, index, event) => {
                finalCardConfig?.onCardClick?.(record, index);
                onCardClick?.(record, index, event);
              }}
              onCardDoubleClick={(record, index, event) => {
                onCardDoubleClick?.(record, index, event);
              }}
              renderCard={finalCardConfig.renderCard}
              minWidth={finalCardConfig?.minWidth}
            />
          );
        })}
      </TableCardContainer>
    );

    // 直接渲染，TableCardContainer会根据fillContainer自动处理ScrollArea
    return (
      <div ref={ref} className={cn('w-full', tableFillContainer && 'h-full', className)} {...props}>
        {renderCardContent()}
      </div>
    );
  },
);

TableCardView.displayName = 'TableCardView';
