// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../pagination';

const meta: Meta<typeof Pagination> = {
  title: 'EASAI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/**
 * 构造「上一页 / 下一页」的禁用态属性
 *
 * @description
 * `PaginationLink` 渲染的是 `<a>` 元素，不支持原生 `disabled` 属性，
 * 因此用 `aria-disabled` 表达语义、用 `className` 表达视觉禁用态。
 */
const disabledNavProps = (disabled: boolean) => ({
  'aria-disabled': disabled,
  className: disabled ? 'pointer-events-none opacity-50' : undefined,
});

// 基础分页
export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(1);
    return (
      <Pagination>
        <PaginationContent>
          <PaginationPrevious onClick={() => setPage(page - 1)} {...disabledNavProps(page === 1)} />
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationNext onClick={() => setPage(page + 1)} {...disabledNavProps(page === 5)} />
        </PaginationContent>
      </Pagination>
    );
  },
};

// 支持 pageSize 切换的分页
export const PageSize: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(1);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [pageSize, setPageSize] = useState(10);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Pagination>
          <PaginationContent>
            <PaginationPrevious onClick={() => setPage(page - 1)} {...disabledNavProps(page === 1)} />
            {[1, 2, 3, 4, 5].map((p) => (
              <PaginationItem key={p}>
                <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext onClick={() => setPage(page + 1)} {...disabledNavProps(page === 5)} />
          </PaginationContent>
        </Pagination>
        <div>
          <span>每页条数：</span>
          {[10, 20, 50].map((size) => (
            <button
              key={size}
              type="button"
              style={{
                marginRight: 8,
                padding: '2px 8px',
                border: pageSize === size ? '1px solid #1677ff' : '1px solid #ccc',
                borderRadius: 4,
              }}
              onClick={() => {
                setPageSize(size);
                setPage(1);
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

// total 较大时的多页省略号演示
export const ManyPages: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(15);
    return (
      <Pagination>
        <PaginationContent>
          <PaginationPrevious onClick={() => setPage(page - 1)} {...disabledNavProps(page === 1)} />
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationEllipsis />
          <PaginationItem>
            <PaginationLink onClick={() => setPage(30)}>30</PaginationLink>
          </PaginationItem>
          <PaginationNext onClick={() => setPage(page + 1)} {...disabledNavProps(page === 30)} />
        </PaginationContent>
      </Pagination>
    );
  },
};

// 自定义渲染 PaginationItem/PaginationLink 组合
export const CustomContent: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(3);
    return (
      <Pagination>
        <PaginationContent>
          <PaginationPrevious onClick={() => setPage(page - 1)} {...disabledNavProps(page === 1)} />
          {[1, 2, 3, 4, 5].map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationEllipsis />
          <PaginationItem>
            <PaginationLink onClick={() => setPage(10)}>10</PaginationLink>
          </PaginationItem>
          <PaginationNext onClick={() => setPage(page + 1)} {...disabledNavProps(page === 10)} />
        </PaginationContent>
      </Pagination>
    );
  },
};

// 暗色模式下的分页演示
export const DarkMode: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [page, setPage] = useState(1);
    return (
      <div style={{ background: '#222', padding: 24 }}>
        <Pagination>
          <PaginationContent>
            <PaginationPrevious onClick={() => setPage(page - 1)} {...disabledNavProps(page === 1)} />
            {[1, 2, 3, 4, 5].map((p) => (
              <PaginationItem key={p}>
                <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext onClick={() => setPage(page + 1)} {...disabledNavProps(page === 5)} />
          </PaginationContent>
        </Pagination>
      </div>
    );
  },
};
