/**
 * 原子组件表格示例
 * 展示如何使用表格原子组件构建完整的表格功能
 * 遵循组合式设计规范，通过原子组件组合实现复杂功能
 */

import { TableBody, TableCell, TableContainer, TableGrid, TableHeader, TableRow } from '../atoms';
import { cn } from '../../../utils/classnames';
import React, { useCallback, useMemo, useState } from 'react';

// 示例数据类型
interface ExampleData {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly status: 'active' | 'inactive' | 'pending';
  readonly amount: number;
  readonly date: string;
  readonly department: string;
}

// 初始测试数据
const initialData: ExampleData[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    status: 'active',
    amount: 1200.5,
    date: '2024-01-15',
    department: '技术部',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    status: 'pending',
    amount: 980.0,
    date: '2024-01-20',
    department: '销售部',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    status: 'inactive',
    amount: 1580.75,
    date: '2024-01-25',
    department: '市场部',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    status: 'active',
    amount: 2100.0,
    date: '2024-02-01',
    department: '技术部',
  },
  {
    id: 5,
    name: '钱七',
    email: 'qianqi@example.com',
    status: 'pending',
    amount: 750.25,
    date: '2024-02-05',
    department: '财务部',
  },
];

/**
 * 删除模式
 *
 * @description
 * 组件库**不内置**删除动作 —— 表格数据归消费方所有，
 * 删除必须由消费方落地（详见 `src/ui/table/README.md` 的「删除」章节）。
 *
 * - `local` —— **本地删除**：消费方直接改自己的 `data` state，行立即消失。
 * - `remote` —— **远程删除**：先调后端接口，成功后再改 `data` state；
 *   失败则保持原样并提示用户。
 */
export type DeleteMode = 'local' | 'remote';

// 组件参数接口
export interface AtomicTableExampleProps {
  /** 表格大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 表格密度 */
  density?: 'compact' | 'comfortable';
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否启用选择功能 */
  selectable?: boolean;
  /** 是否启用悬停效果 */
  hoverable?: boolean;
  /** 表头是否粘性定位 */
  stickyHeader?: boolean;
  /** 是否启用加载状态 */
  loading?: boolean;
  /** 是否显示空状态 */
  showEmpty?: boolean;
  /** 是否启用滚动 */
  scrollable?: boolean;
  /** 是否启用可调整大小 */
  resizeable?: boolean;
  /** 是否启用截断文本 */
  ellipsis?: boolean;
  /**
   * 删除模式
   *
   * @defaultValue 'local'
   */
  deleteMode?: DeleteMode;
}

/**
 * 原子组件表格示例
 * 展示原子组件的组合使用和各种配置选项
 */
export function AtomicTableExample({
  size = 'md',
  density = 'comfortable',
  bordered = true,
  selectable = true,
  hoverable = true,
  stickyHeader = false,
  loading = false,
  showEmpty = false,
  scrollable = false,
  resizeable = false,
  ellipsis = false,
  deleteMode = 'local',
}: AtomicTableExampleProps = {}) {
  // 状态管理
  //
  // 📌 **数据必须是 state** —— 组件库不持有数据（数据归消费方所有），
  //    删除行只能通过改这里的 `data` 落地。
  //    原实现把数据放在模块级常量 `testData` 上，导致删除按钮改不到数据。
  const [data, setData] = useState<ExampleData[]>(initialData);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // 全选逻辑
  const isAllSelected = selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((item) => item.id));
    }
  }, [isAllSelected, data]);

  const handleSelectRow = useCallback((id: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((key) => key !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleRowClick = useCallback((id: number) => {
    setExpandedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((key) => key !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleColumnResize = useCallback((column: string, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [column]: width,
    }));
  }, []);

  /**
   * 删除一行
   *
   * @description
   * 本地 / 远程两种模式的唯一差别是**何时改数据**：
   * - `local` —— 立即从 `data` 中移除；
   * - `remote` —— 先模拟后端请求（约 300ms），成功后再移除；
   *   若请求失败则保持数据不变。
   *
   * 两种模式最终都要落到 `setData` —— 组件库不会替你删数据。
   */
  const handleDelete = useCallback(
    async (row: ExampleData) => {
      if (deleteMode === 'remote') {
        // 远程删除：先调后端，成功后才改本地数据
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch {
          // 请求失败 → 保持数据不变，由消费方在此提示用户
          return;
        }
      }

      setData((prev) => prev.filter((item) => item.id !== row.id));
      // 同步清理已删除行相关的选中 / 展开状态
      setSelectedRows((prev) => prev.filter((id) => id !== row.id));
      setExpandedRows((prev) => prev.filter((id) => id !== row.id));
    },
    [deleteMode],
  );

  /**
   * 表格总列数
   *
   * @description
   * 展开行的 `<td>` 必须用 `colSpan` 覆盖**全部**列数，
   * 否则在 `table-fixed` 布局下会被压成第一列的宽度 → 内容挤压换行。
   */
  const columnCount = useMemo(() => (selectable ? 7 : 6), [selectable]);

  // 状态徽章组件
  const StatusBadge = ({ status }: { status: ExampleData['status'] }) => {
    const statusConfig = {
      active: { label: '活跃', className: 'bg-green-100 text-green-800' },
      inactive: { label: '不活跃', className: 'bg-red-100 text-red-800' },
      pending: { label: '待处理', className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status];
    return <span className={cn('rounded-full px-2 py-1 font-medium text-xs', config.className)}>{config.label}</span>;
  };

  // 展开行内容
  const renderExpandedContent = (row: ExampleData) => (
    <TableRow key={`${row.id}-expanded`}>
      {/*
       * 📌 `colSpan={columnCount}` —— 跨列展开。
       *    缺了它，这个单元格只占第 1 列（选择列，宽 50px），
       *    `grid-cols-2` 的两列内容会被挤在一起（表现为文字重叠）。
       */}
      <TableCell as="td" colSpan={columnCount} className="whitespace-normal">
        <div className="py-4">
          <h4 className="mb-2 font-medium text-sm">详细信息</h4>
          {/*
           * 📌 `grid-cols-2` 改成 `sm:grid-cols-2` + `grid-cols-1` ——
           *    窄屏下退化为单列，避免两项挤在同一行。
           *    同时用 `gap-x-6 gap-y-2` 拉开间距。
           */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-muted-foreground text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium">用户ID:</span> {row.id}
            </div>
            <div>
              <span className="font-medium">部门:</span> {row.department}
            </div>
            <div>
              <span className="font-medium">注册日期:</span> {row.date}
            </div>
            <div>
              <span className="font-medium">当前状态:</span> <StatusBadge status={row.status} />
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  // 如果显示空状态
  if (showEmpty) {
    return (
      <div className="space-y-4 p-6">
        <h3 className="font-semibold text-lg">原子组件表格示例 - 空状态</h3>
        <TableContainer size={size} density={density} bordered={bordered} empty={true} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h3 className="mb-2 font-semibold text-lg">原子组件表格示例</h3>
        <p className="mb-4 text-muted-foreground text-sm">使用 TableContainer、TableGrid、TableHeader、TableBody、TableRow、TableCell 原子组件构建的完整表格</p>

        {/* 状态显示 */}
        <div className="mb-4 grid grid-cols-4 gap-4 rounded-lg bg-blue-50 p-4">
          <div className="text-center">
            <div className="font-bold text-2xl text-blue-600">{data.length}</div>
            <div className="text-blue-600 text-sm">总数据</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-green-600">{selectedRows.length}</div>
            <div className="text-green-600 text-sm">已选择</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-purple-600">{expandedRows.length}</div>
            <div className="text-purple-600 text-sm">已展开</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-orange-600">{Object.keys(columnWidths).length}</div>
            <div className="text-orange-600 text-sm">调整列数</div>
          </div>
        </div>

        {/* 删除模式说明 */}
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-amber-800 text-sm">
          删除模式：<strong className="font-semibold">{deleteMode === 'local' ? '本地删除' : '远程删除'}</strong>
          {deleteMode === 'local' ? '（点击删除后行立即消失）' : '（点击删除后模拟请求，约 300ms 后行消失）'}
          <div className="mt-1 text-xs opacity-80">组件库不内置删除动作 —— 数据归消费方所有，删除必须由消费方改自己的 data。</div>
        </div>
      </div>

      <TableContainer size={size} density={density} bordered={bordered} loading={loading} scroll={scrollable ? { x: 800, y: 400 } : undefined}>
        <TableGrid fixedLayout>
          <TableHeader stickyHeader={stickyHeader}>
            <TableRow>
              {/* 选择列 */}
              {selectable && (
                <TableCell as="th" style={{ width: '50px' }} resizeable={resizeable} onResize={(width) => handleColumnResize('select', width)}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isIndeterminate;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 cursor-pointer"
                  />
                </TableCell>
              )}

              {/* 数据列 */}
              <TableCell as="th" style={{ width: columnWidths.name || 120 }} resizeable={resizeable} onResize={(width) => handleColumnResize('name', width)}>
                姓名
              </TableCell>
              <TableCell as="th" style={{ width: columnWidths.email || 200 }} resizeable={resizeable} onResize={(width) => handleColumnResize('email', width)}>
                邮箱
              </TableCell>
              <TableCell as="th" align="center" style={{ width: columnWidths.status || 100 }} resizeable={resizeable} onResize={(width) => handleColumnResize('status', width)}>
                状态
              </TableCell>
              <TableCell as="th" align="right" style={{ width: columnWidths.amount || 120 }} resizeable={resizeable} onResize={(width) => handleColumnResize('amount', width)}>
                金额
              </TableCell>
              <TableCell as="th" style={{ width: columnWidths.department || 100 }} resizeable={resizeable} onResize={(width) => handleColumnResize('department', width)}>
                部门
              </TableCell>
              <TableCell as="th" align="center" style={{ width: 80 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row, index) => {
              const isSelected = selectedRows.includes(row.id);
              const isExpanded = expandedRows.includes(row.id);

              return (
                <React.Fragment key={row.id}>
                  <TableRow selected={isSelected} expanded={isExpanded} hoverable={hoverable} clickable index={index} onClick={() => handleRowClick(row.id)}>
                    {/* 选择列 */}
                    {selectable && (
                      <TableCell>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(row.id)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 cursor-pointer" />
                      </TableCell>
                    )}

                    {/* 数据列 */}
                    <TableCell ellipsis={ellipsis}>
                      <div className="font-medium">{row.name}</div>
                    </TableCell>
                    <TableCell ellipsis={ellipsis}>
                      <span className="text-muted-foreground">{row.email}</span>
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-mono">¥{row.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell ellipsis={ellipsis}>{row.department}</TableCell>
                    <TableCell align="center">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          className="rounded p-1 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`编辑 ${row.name}`);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="rounded p-1 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            // 📌 真正删除该行 —— 数据由消费方持有，组件库不会自动删
                            void handleDelete(row);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* 展开行 */}
                  {isExpanded && renderExpandedContent(row)}
                </React.Fragment>
              );
            })}
          </TableBody>
        </TableGrid>
      </TableContainer>

      {/* 功能说明 */}
      <div className="mt-6 rounded-lg bg-green-50 p-4">
        <h4 className="mb-2 font-medium text-green-900">✅ 原子组件功能展示：</h4>
        <div className="grid grid-cols-1 gap-2 text-green-800 text-sm md:grid-cols-2">
          <div>
            • <strong>TableContainer</strong>: 容器管理、滚动、状态显示
          </div>
          <div>
            • <strong>TableGrid</strong>: 基础表格结构和布局
          </div>
          <div>
            • <strong>TableHeader</strong>: 表头容器和粘性定位
          </div>
          <div>
            • <strong>TableBody</strong>: 表体容器和最小高度
          </div>
          <div>
            • <strong>TableRow</strong>: 行状态和交互管理
          </div>
          <div>
            • <strong>TableCell</strong>: 单元格对齐、截断、调整大小
          </div>
          <div>
            • <strong>组合设计</strong>: 通过原子组件组合实现复杂功能
          </div>
          <div>
            • <strong>状态管理</strong>: 选择、展开、调整等交互状态
          </div>
          <div>
            • <strong>展开行</strong>: 用 <code>colSpan</code> 跨列，避免内容被压窄
          </div>
          <div>
            • <strong>删除</strong>: 由消费方改自己的 <code>data</code>（本地 / 远程两种模式）
          </div>
        </div>
      </div>
    </div>
  );
}
