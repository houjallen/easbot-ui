import { Button } from '../../button';
import { Icon } from '../../icon';
import { Input } from '../../input';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '../../pagination';
import { Select } from '../../select';
import { useTableContext } from '../context';
import type { PaginationConfig, PaginationState } from '../types';
import { cn } from '../../../utils/classnames';
import { useDevice } from '../../../hooks/use-device';
import React, { useCallback, useMemo, useRef } from 'react';

export interface TablePaginationProps {
  /** 分页状态 */
  pagination: PaginationState;
  /** 分页配置 */
  config: PaginationConfig;
  /** 页码变化回调 */
  onPageNoChange?: (pageNo: number) => void;
  /** 每页条数变化回调 */
  onPageSizeChange?: (pageSize: number) => void;
  /** 组件尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 样式类名 */
  className?: string;
}

/**
 * 表格分页组件
 * 提供完整的分页功能，包括页码跳转、每页条数选择、总数显示等
 */
export const TablePagination: React.FC<TablePaginationProps> = ({ pagination, config = {}, onPageNoChange, onPageSizeChange, size = 'md', className }) => {
  const pageInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useDevice();
  const tableContext = useTableContext();
  const { t } = tableContext.tableLogic.i18n;
  const paginationCfg = useMemo(() => {
    const cfg = {
      ...config,
    };
    // 移动端自动 simple 模式和 layout 简化
    if (isMobile) {
      cfg.simple = true;
      cfg.layout = ['pager'];
      cfg.position = 'center';
      // cfg.maxButtons = 3;
    }
    return cfg;
  }, [isMobile, config]);

  const {
    showSizeChanger = true,
    showQuickJumper = true,
    pageSizeOptions = [10, 20, 50, 100],
    showTotal = true,
    simple = false,
    position = 'right',
    layout = ['total', 'perPage', 'pager', 'go'],
    maxButtons = 5,
  } = useMemo(() => paginationCfg, [paginationCfg]);

  const { pageNo = 1, pageSize = 10, total = 0, show = true } = pagination;
  // 计算总页数
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  // 页码变化处理
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      onPageNoChange?.(newPage);
      if (pageInputRef.current) {
        pageInputRef.current.value = '';
      }
    },
    [totalPages, onPageNoChange],
  );

  // 每页条数变化处理
  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newSize = Number(value);
      if (newSize !== pageSize) {
        onPageSizeChange?.(newSize);
      }
    },
    [pageSize, onPageSizeChange],
  );

  // 渲染省略号按钮
  const renderEllipsis = useCallback(
    (key: string, jumpPage: number, direction: 'prev' | 'next') => {
      const gap = 5; // 跳转页数
      const targetPage = direction === 'prev' ? Math.max(1, pageNo - gap) : Math.min(totalPages, pageNo + gap);

      return (
        <PaginationItem key={key}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(targetPage)}
            className={cn('eas-pagination-button group relative flex min-w-[2.5rem] items-center justify-center', `eas-pagination-button-${size}`)}
            title={direction === 'prev' ? t('pagination.prev5') : t('pagination.next5')}
          >
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0">...</span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">{direction === 'prev' ? '«' : '»'}</span>
          </Button>
        </PaginationItem>
      );
    },
    [pageNo, totalPages, handlePageChange, t, size],
  );

  // 生成页码按钮 - 采用 amis 的分页算法
  const renderPager = useCallback(() => {
    // if (simple) return null;

    const pageButtons: React.ReactNode[] = [];

    // 页码全部显示 [1, 2, 3, 4]
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(
          <PaginationItem key={i}>
            <Button
              variant={i === pageNo ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(i)}
              className={cn(
                'eas-pagination-button border',
                `eas-pagination-button-${size}`,
                i === pageNo ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {i}
            </Button>
          </PaginationItem>,
        );
      }
    }
    // 当前为1234页时， [1, 2, 3, 4, 5, ... 12]
    else if (pageNo <= maxButtons - 3) {
      // 显示前面的页码
      for (let i = 1; i <= maxButtons - 2; i++) {
        pageButtons.push(
          <PaginationItem key={i}>
            <Button
              variant={i === pageNo ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(i)}
              className={cn(
                'eas-pagination-button border',
                `eas-pagination-button-${size}`,
                i === pageNo ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {i}
            </Button>
          </PaginationItem>,
        );
      }
      // 添加省略号
      pageButtons.push(renderEllipsis('next-ellipsis', totalPages, 'next'));
      // 添加最后一页
      pageButtons.push(
        <PaginationItem key={totalPages}>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} className={cn('eas-pagination-button', `eas-pagination-button-${size}`)}>
            {totalPages}
          </Button>
        </PaginationItem>,
      );
    }
    // [1, ..., 5, 6, 7, 8, 9]
    else if (pageNo > totalPages - (maxButtons - 3)) {
      // 添加第一页
      pageButtons.push(
        <PaginationItem key={1}>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} className={cn('eas-pagination-button', `eas-pagination-button-${size}`)}>
            1
          </Button>
        </PaginationItem>,
      );
      // 添加省略号
      pageButtons.push(renderEllipsis('prev-ellipsis', 1, 'prev'));
      // 显示后面的页码
      const start = totalPages - (maxButtons - 3);
      for (let i = start; i <= totalPages; i++) {
        pageButtons.push(
          <PaginationItem key={i}>
            <Button
              variant={i === pageNo ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(i)}
              className={cn(
                'eas-pagination-button border',
                `eas-pagination-button-${size}`,
                i === pageNo ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {i}
            </Button>
          </PaginationItem>,
        );
      }
    }
    // [1, ... 4, 5, 6, ... 10]
    else {
      // 添加第一页
      pageButtons.push(
        <PaginationItem key={1}>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} className={cn('eas-pagination-button', `eas-pagination-button-${size}`)}>
            1
          </Button>
        </PaginationItem>,
      );
      // 添加前省略号
      pageButtons.push(renderEllipsis('prev-ellipsis', 1, 'prev'));

      // 显示中间的页码
      const start = Math.max(3, pageNo - 1);
      const end = Math.min(totalPages - 2, pageNo + 1);
      for (let i = start; i <= end; i++) {
        pageButtons.push(
          <PaginationItem key={i}>
            <Button
              variant={i === pageNo ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(i)}
              className={cn(
                'eas-pagination-button border',
                `eas-pagination-button-${size}`,
                i === pageNo ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {i}
            </Button>
          </PaginationItem>,
        );
      }

      // 添加后省略号
      pageButtons.push(renderEllipsis('next-ellipsis', totalPages, 'next'));
      // 添加最后一页
      pageButtons.push(
        <PaginationItem key={totalPages}>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} className={cn('eas-pagination-button', `eas-pagination-button-${size}`)}>
            {totalPages}
          </Button>
        </PaginationItem>,
      );
    }

    return pageButtons;
  }, [
    // simple,
    pageNo,
    maxButtons,
    totalPages,
    handlePageChange,
    renderEllipsis,
    size,
  ]);

  // 处理分页条位置
  const positionClass = useMemo(() => {
    switch (position) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  }, [position]);

  // 渲染布局组件
  const renderLayout = useCallback(() => {
    return layout.map((block) => {
      switch (block) {
        case 'total': {
          if (!showTotal) return null;
          const from = total === 0 ? 0 : (pageNo - 1) * pageSize + 1;
          const to = Math.min(pageNo * pageSize, total);
          return (
            <PaginationItem key="total" className="eas-pagination-text">
              {t('pagination.totalInfo', { total, from, to })}
            </PaginationItem>
          );
        }

        case 'pager':
          return (
            <React.Fragment key="pager">
              <PaginationItem>
                {/* 📌 边界禁用用 `cursor-not-allowed`，不得用 `pointer-events-none`
                    （规范 css-standard.md §4.9：鼠标穿透会让禁止光标永不生效） */}
                {/* 📌 边界禁用用 `cursor-not-allowed`，不得用 `pointer-events-none`
                    （规范 css-standard.md §4.9：鼠标穿透会让禁止光标永不生效）。
                    📌 另需压掉 hover 反馈：`PaginationLink` 是 `<a>`，没有原生 `:disabled`，
                    `buttonVariants` 的 hover 对它恒生效 —— 所以用 `!` 强制透明，
                    否则「禁用」的上一页悬停仍浮出 `bg-accent`。 */}
                <PaginationPrevious
                  onClick={() => handlePageChange(pageNo - 1)}
                  aria-disabled={pageNo <= 1 || undefined}
                  className={cn('eas-pagination-button', pageNo <= 1 ? 'cursor-not-allowed opacity-50 hover:bg-transparent! hover:text-current!' : 'cursor-pointer')}
                >
                  &nbsp;
                </PaginationPrevious>
              </PaginationItem>
              {renderPager()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pageNo + 1)}
                  aria-disabled={pageNo >= totalPages || undefined}
                  className={cn('eas-pagination-button', pageNo >= totalPages ? 'cursor-not-allowed opacity-50 hover:bg-transparent! hover:text-current!' : 'cursor-pointer')}
                >
                  &nbsp;
                </PaginationNext>
              </PaginationItem>
            </React.Fragment>
          );

        case 'perPage':
          if (!showSizeChanger) return null;
          return (
            <React.Fragment key="perPage">
              <PaginationItem className="eas-pagination-text">{t('pagination.perPagePrefix')}</PaginationItem>
              <PaginationItem>
                <Select
                  value={String(pageSize)}
                  options={pageSizeOptions.map((opt) => ({
                    label: String(opt),
                    value: String(opt),
                    key: String(opt),
                  }))}
                  onValueChange={handlePageSizeChange}
                  className="eas-pagination-select"
                  size="default"
                />
              </PaginationItem>
              <PaginationItem className="eas-pagination-text">{t('pagination.perPageSuffix')}</PaginationItem>
            </React.Fragment>
          );

        case 'go':
          if (!showQuickJumper || simple) return null;
          return (
            <React.Fragment key="go">
              <PaginationItem className="eas-pagination-text">{t('pagination.goto')}</PaginationItem>
              <PaginationItem className="flex items-center gap-1">
                <Input
                  ref={pageInputRef}
                  type="text"
                  min={1}
                  max={totalPages}
                  className="eas-pagination-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = Number((e.target as HTMLInputElement).value);
                      if (value >= 1 && value <= totalPages) {
                        handlePageChange(value);
                      }
                    }
                  }}
                  suffix={
                    // 📌 跳页图标改用原生 button：裸 SVG 带独立 onClick 时
                    //    键盘不可达（`tabIndex` / Enter / Space 全无），与全库
                    //    「配合图标用 IconButton / button」的契约不一致。
                    <button
                      type="button"
                      aria-label={t('pagination.goto')}
                      className="inline-flex cursor-pointer items-center justify-center"
                      onClick={() => {
                        const input = pageInputRef.current;
                        const value = Number(input?.value);
                        if (value >= 1 && value <= totalPages) {
                          handlePageChange(value);
                        }
                      }}
                    >
                      <Icon name="arrow-right" className="eas-pagination-icon text-primary" />
                    </button>
                  }
                />
              </PaginationItem>
              <PaginationItem className="eas-pagination-text">{t('pagination.pageClassifier')}</PaginationItem>
            </React.Fragment>
          );

        default:
          return null;
      }
    });
  }, [layout, showTotal, pageNo, pageSize, total, totalPages, renderPager, handlePageChange, showSizeChanger, pageSizeOptions, handlePageSizeChange, showQuickJumper, simple, t]);

  if (!show) {
    return null;
  }

  return (
    <div className={cn('eas-table-pagination', `eas-table-pagination-${size}`, 'shrink-0 py-2', className)}>
      <Pagination>
        <PaginationContent className={cn('w-full gap-2', positionClass)}>{renderLayout()}</PaginationContent>
      </Pagination>
    </div>
  );
};
