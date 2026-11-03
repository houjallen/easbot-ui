/**
 * 改进后的表格组件示例
 * 展示与设计系统更好兼容的结构和实际支持的功能
 */

import { cn } from '../../../utils/classnames';
import { BaseTable } from '../';
import type { TableColumn } from '../';

// 示例数据类型
interface Invoice {
  readonly id: number;
  readonly invoice: string;
  readonly customer: string;
  readonly paymentStatus: 'paid' | 'pending' | 'failed';
  readonly totalAmount: string;
  readonly createTime: string;
  readonly department?: string;
  readonly [key: string]: any;
}

// 示例数据
const invoices: Invoice[] = [
  {
    id: 1,
    invoice: 'INV001',
    customer: '张三',
    paymentStatus: 'paid',
    totalAmount: '¥250.00',
    createTime: '2024-01-15',
    department: '销售部',
  },
  {
    id: 2,
    invoice: 'INV002',
    customer: '李四',
    paymentStatus: 'pending',
    totalAmount: '¥150.00',
    createTime: '2024-01-20',
    department: '技术部',
  },
  {
    id: 3,
    invoice: 'INV003',
    customer: '王五',
    paymentStatus: 'paid',
    totalAmount: '¥350.00',
    createTime: '2024-01-25',
    department: '市场部',
  },
  {
    id: 4,
    invoice: 'INV004',
    customer: '赵六',
    paymentStatus: 'failed',
    totalAmount: '¥450.00',
    createTime: '2024-02-01',
    department: '财务部',
  },
  {
    id: 5,
    invoice: 'INV005',
    customer: '钱七',
    paymentStatus: 'pending',
    totalAmount: '¥120.00',
    createTime: '2024-02-05',
    department: '人事部',
  },
];

// 列配置（展示实际支持的功能）
const columns: TableColumn[] = [
  {
    name: 'invoice',
    title: '发票编号',
    dataIndex: 'invoice',
    width: 150,
    ellipsis: true, // ✅ 支持的功能
  },
  {
    name: 'customer',
    title: '客户',
    dataIndex: 'customer',
    width: 120,
    align: 'left', // ✅ 使用Schema兼容的对齐方式
  },
  {
    name: 'department',
    title: '部门',
    dataIndex: 'department',
    width: 100,
    align: 'center',
    render: (value) => <span className="rounded bg-blue-50 px-2 py-1 text-blue-600 text-xs">{(value as string) || '未分配'}</span>,
  },
  {
    name: 'paymentStatus',
    title: '支付状态',
    dataIndex: 'paymentStatus',
    width: 120,
    align: 'center',
    render: (value) => {
      const statusMap = {
        paid: { label: '已支付', className: 'bg-green-100 text-green-800' },
        pending: {
          label: '待支付',
          className: 'bg-yellow-100 text-yellow-800',
        },
        failed: { label: '支付失败', className: 'bg-red-100 text-red-800' },
      };

      const status = statusMap[value as keyof typeof statusMap];

      return <span className={cn('rounded-full px-2 py-1 font-medium text-xs ', status.className)}>{status.label}</span>;
    },
  },
  {
    name: 'totalAmount',
    title: '金额',
    dataIndex: 'totalAmount',
    width: 120,
    align: 'right', // ✅ 使用Schema兼容的对齐方式
    className: 'font-mono', // ✅ 支持自定义类名
  },
  {
    name: 'createTime',
    title: '创建时间',
    dataIndex: 'createTime',
    width: 120,
    ellipsis: true,
    render: (value) => <span className="text-gray-600 text-xs">{value as string}</span>,
  },
];

/**
 * 基础改进示例
 * 展示最常用的功能配置
 */
export function ImprovedTableExample() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">改进后的表格组件</h2>
        <p className="text-muted-foreground text-sm">展示与设计系统兼容的表格结构和实际支持的功能。</p>
      </div>

      <div className="mb-4 rounded-lg bg-blue-50 p-4 ">
        <h3 className="mb-2 font-medium text-blue-900 ">✅ 实际支持的功能：</h3>
        <div className="grid grid-cols-1 gap-2 space-y-1 text-blue-800 text-sm md:grid-cols-2">
          <div>
            • <code>data-slot</code> 属性，与设计系统保持一致
          </div>
          <div>• 简化的单元格内容结构</div>
          <div>• Schema兼容的字段命名（name, align, visible）</div>
          <div>• 文本截断功能（ellipsis）</div>
          <div>• 自定义渲染函数</div>
          <div>• 自定义CSS类名和样式</div>
          <div>• 嵌套属性访问支持</div>
          <div>• 行点击和双击事件</div>
        </div>
      </div>

      <div className="rounded-md border">
        <BaseTable
          columns={columns}
          data={invoices}
          rowKey="id"
          bordered
          size="md"
          density="comfortable"
          onRowClick={(record, index) => {
            console.log('Row clicked:', record, index);
          }}
        />
      </div>
    </div>
  );
}

/**
 * 不同尺寸和密度示例
 */
export function SizeAndDensityExample() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">尺寸和密度示例</h2>
        <p className="text-muted-foreground text-sm">展示不同的表格尺寸和密度配置。</p>
      </div>

      {/* 小尺寸紧凑密度 */}
      <div>
        <h3 className="mb-2 font-medium">小尺寸 + 紧凑密度</h3>
        <div className="rounded-md border">
          <BaseTable columns={columns} data={invoices.slice(0, 3)} rowKey="id" size="sm" density="compact" bordered />
        </div>
      </div>

      {/* 大尺寸舒适密度 */}
      <div>
        <h3 className="mb-2 font-medium">大尺寸 + 舒适密度</h3>
        <div className="rounded-md border">
          <BaseTable columns={columns} data={invoices.slice(0, 3)} rowKey="id" size="lg" density="comfortable" bordered />
        </div>
      </div>
    </div>
  );
}

/**
 * 状态展示示例
 */
export function TableStatesExample() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">表格状态示例</h2>
        <p className="text-muted-foreground text-sm">展示加载、空数据、错误等状态。</p>
      </div>

      {/* 加载状态 */}
      <div>
        <h3 className="mb-2 font-medium">加载状态</h3>
        <BaseTable columns={columns} data={[]} rowKey="id" loading bordered />
      </div>

      {/* 空数据状态 */}
      <div>
        <h3 className="mb-2 font-medium">空数据状态</h3>
        <BaseTable columns={columns} data={[]} rowKey="id" empty="暂无发票数据" bordered />
      </div>

      {/* 错误状态 */}
      <div>
        <h3 className="mb-2 font-medium">错误状态</h3>
        <BaseTable columns={columns} data={[]} rowKey="id" error="数据加载失败，请刷新重试" bordered />
      </div>
    </div>
  );
}

/**
 * 滚动和粘性表头示例
 */
export function ScrollAndStickyExample() {
  // 生成更多数据用于滚动演示
  const moreData = Array.from({ length: 20 }, (_, i) => ({
    ...invoices[i % invoices.length],
    id: i + 1,
    invoice: `INV${String(i + 1).padStart(3, '0')}`,
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">滚动和粘性表头示例</h2>
        <p className="text-muted-foreground text-sm">展示水平/垂直滚动和粘性表头功能。</p>
      </div>

      <div className="rounded-md border">
        <BaseTable
          columns={columns}
          data={moreData}
          rowKey="id"
          scroll={{ x: 800, y: 300 }} // ✅ 支持的滚动配置
          stickyHeader // ✅ 支持的粘性表头
          bordered
          striped // ✅ 支持的条纹样式
        />
      </div>
    </div>
  );
}

/**
 * 完整的改进示例集合
 */
export function AllImprovedExamples() {
  return (
    <div className="space-y-12">
      <ImprovedTableExample />
      <SizeAndDensityExample />
      <TableStatesExample />
      <ScrollAndStickyExample />
    </div>
  );
}

export default AllImprovedExamples;
