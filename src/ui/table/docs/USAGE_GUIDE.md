# 现代化Table组件完整使用指南

## 🎯 设计理念

这是一个全新设计的现代化Table组件系统，采用最新的React模式和TypeScript特性：

- **类型安全**：完整的TypeScript泛型支持，编译时类型检查
- **组合式设计**：原子→有机体的分层架构，最大化灵活性
- **现代化API**：简洁直观的使用方式，符合React最佳实践
- **性能优化**：React.memo、精确依赖管理、不可变状态
- **无兼容包袱**：全新设计，不包含任何历史兼容性代码

## 🏗️ 架构层次

```
层级           组件              职责
─────────────────────────────────────────
原子组件       TableContainer    容器和状态管理
(Atoms)       TableGrid         HTML table元素
              TableCell         单元格
              TableRow          表格行
              TableHeader       表头容器
              TableBody         表体容器

有机体组件     BaseTable         基础表格
(Organisms)

上下文系统     TableProvider     状态管理提供者
              TableContext      全局状态
```

## 📋 完整API参考

### BaseTable<T> 属性

| 属性                 | 类型                                                    | 默认值          | 说明           |
| -------------------- | ------------------------------------------------------- | --------------- | -------------- |
| `columns`            | `readonly TableColumn<T>[]`                             | -               | 列配置（必需） |
| `data`               | `readonly T[]`                                          | -               | 数据源（必需） |
| `rowKey`             | `keyof T`                                               | `'id'`          | 行键字段       |
| `size`               | `'sm' \| 'md' \| 'lg'`                                  | `'md'`          | 表格大小       |
| `density`            | `'compact' \| 'comfortable'`                            | `'comfortable'` | 表格密度       |
| `bordered`           | `boolean`                                               | `false`         | 是否显示边框   |
| `striped`            | `boolean`                                               | `false`         | 是否显示条纹   |
| `showHeader`         | `boolean`                                               | `true`          | 是否显示表头   |
| `stickyHeader`       | `boolean`                                               | `false`         | 表头是否固定   |
| `stickyHeaderOffset` | `number`                                                | `0`             | 固定表头偏移量 |
| `scroll`             | `ScrollConfig`                                          | -               | 滚动配置       |
| `loading`            | `boolean`                                               | `false`         | 加载状态       |
| `error`              | `ReactNode`                                             | -               | 错误信息       |
| `empty`              | `ReactNode`                                             | `'暂无数据'`    | 空数据提示     |
| `onRowClick`         | `(record: T, index: number, event: MouseEvent) => void` | -               | 行点击事件     |
| `onRowDoubleClick`   | `(record: T, index: number, event: MouseEvent) => void` | -               | 行双击事件     |

### TableColumn<T> 配置（与Schema保持一致）

| 属性         | 类型                                                      | 说明                                 |
| ------------ | --------------------------------------------------------- | ------------------------------------ |
| `name`       | `string`                                                  | 列唯一标识（必需，与Schema保持一致） |
| `title`      | `ReactNode`                                               | 列标题（必需）                       |
| `dataIndex`  | `keyof T \| string`                                       | 数据字段路径，支持嵌套如'user.name'  |
| `width`      | `number \| string`                                        | 列宽                                 |
| `minWidth`   | `number`                                                  | 最小宽度                             |
| `maxWidth`   | `number`                                                  | 最大宽度                             |
| `align`      | `'left' \| 'center' \| 'right'`                           | 对齐方式（与Schema保持一致）         |
| `fixed`      | `'left' \| 'right'`                                       | 固定位置（与Schema保持一致）         |
| `visible`    | `boolean`                                                 | 是否显示（与Schema保持一致）         |
| `sortable`   | `boolean`                                                 | 是否可排序                           |
| `filterable` | `boolean`                                                 | 是否可筛选                           |
| `resizeable` | `boolean`                                                 | 是否可调整大小                       |
| `ellipsis`   | `boolean`                                                 | 是否截断文本                         |
| `render`     | `(value: unknown, record: T, index: number) => ReactNode` | 自定义渲染                           |
| `className`  | `string`                                                  | CSS类名                              |
| `style`      | `CSSProperties`                                           | 内联样式                             |

## 🚀 快速开始

### 1. 基础用法

```tsx
import { BaseTable, type TableColumn } from '@/components/ui/table';

// 1. 定义数据类型
interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly status: 'active' | 'inactive';
}

// 2. 配置列（与Schema字段名保持一致）
const columns: TableColumn<User>[] = [
  {
    name: 'name', // 使用name而不key
    title: '姓名',
    dataIndex: 'name',
  },
  {
    name: 'email',
    title: '邮箱',
    dataIndex: 'email',
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    align: 'center', // 使用Schema的对齐方式
    render: (value) => (
      <span className={value === 'active' ? 'text-green-600' : 'text-gray-400'}>
        {value === 'active' ? '活跃' : '禁用'}
      </span>
    ),
  },
];

// 3. 准备数据
const users: User[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' },
];

// 4. 使用组件
function UserTable() {
  return <BaseTable<User> columns={columns} data={users} rowKey="id" />;
}
```

### 2. 高级功能

```tsx
function AdvancedTable() {
  return (
    <BaseTable<User>
      columns={columns}
      data={users}
      rowKey="id"
      // 样式配置
      size="sm"
      density="compact"
      bordered
      striped
      // 滚动配置
      scroll={{ x: 800, y: 400 }}
      stickyHeader
      stickyHeaderOffset={64}
      // 事件处理
      onRowClick={(record, index) => {
        console.log('点击行:', record);
      }}
      onRowDoubleClick={(record, index) => {
        console.log('双击行:', record);
      }}
    />
  );
}
```

### 3. 嵌套属性访问

```tsx
interface User {
  readonly id: number;
  readonly profile: {
    readonly name: string;
    readonly avatar: string;
  };
}

const columns: TableColumn<User>[] = [
  {
    name: 'name',
    title: '姓名',
    dataIndex: 'profile.name', // 嵌套属性
  },
  {
    name: 'avatar',
    title: '头像',
    dataIndex: 'profile.avatar',
    align: 'center', // 使用Schema对齐方式
    render: (value) => <img src={value as string} className="w-8 h-8 rounded-full" />,
  },
];
```

### 4. 原子组件组合

```tsx
import {
  TableContainer,
  TableGrid,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

function CustomTable() {
  return (
    <TableContainer bordered size="md">
      <TableGrid>
        <TableHeader sticky>
          <TableRow>
            <TableCell as="th">商品</TableCell>
            <TableCell as="th" align="center">
              价格
            </TableCell>
            <TableCell as="th">状态</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>苹果</TableCell>
            <TableCell align="center">¥5.00</TableCell>
            <TableCell>有库存</TableCell>
          </TableRow>
          <TableRow selected>
            <TableCell>香蕉</TableCell>
            <TableCell align="center">¥3.00</TableCell>
            <TableCell>有库存</TableCell>
          </TableRow>
        </TableBody>
      </TableGrid>
    </TableContainer>
  );
}
```

### 5. 状态管理系统

```tsx
import { TableProvider, useTableContext, useSelectedRows } from '@/components/ui/table';

function TableWithState() {
  return (
    <TableProvider columns={columns} data={data} rowKey="id" size="md" density="comfortable">
      <CustomTableContent />
      <SelectedRowsInfo />
    </TableProvider>
  );
}

function CustomTableContent() {
  const { state, actions } = useTableContext();

  const handleRowClick = (record: User) => {
    actions.toggleRowSelection(record.id);
  };

  // 自定义表格实现...
}

function SelectedRowsInfo() {
  const selectedRows = useSelectedRows<User>();

  return <div className="mt-4">已选择 {selectedRows.length} 项</div>;
}
```

## 🎨 样式定制

### CSS 类名

所有组件使用标准的BEM命名：

```css
.eas-table-container {
  /* 表格容器 */
}
.eas-table-grid {
  /* 表格网格 */
}
.eas-table-cell {
  /* 单元格 */
}
.eas-table-row {
  /* 表格行 */
}
.eas-table-header {
  /* 表头 */
}
.eas-table-body {
  /* 表体 */
}
```

### 主题定制

```css
.eas-table-container {
  --table-border-color: theme('colors.border');
  --table-bg-color: theme('colors.background');
  --table-hover-color: theme('colors.muted.DEFAULT / 50%');
  --table-selected-color: theme('colors.primary.DEFAULT / 10%');
}
```

## ⚡ 性能优化

### 内置优化

- **React.memo**：所有组件都使用memo包装
- **精确依赖**：useCallback和useMemo的精确依赖管理
- **不可变状态**：使用ReadonlySet和readonly数组
- **类型安全**：编译时类型检查避免运行时错误

### 使用建议

```tsx
// ✅ 好的做法
const columns: TableColumn<User>[] = useMemo(
  () => [
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name',
    },
  ],
  [],
);

const handleRowClick = useCallback((record: User) => {
  // 处理点击
}, []);

// ❌ 避免的做法
const columns = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    render: (value) => <span>{value}</span>, // 每次渲染都创建新函数
  },
];
```

## 🔧 类型安全开发

### 严格类型约束

```tsx
// 定义只读数据类型
interface User {
  readonly id: number;
  readonly name: string;
  readonly profile?: {
    readonly avatar: string;
  };
}

// 类型安全的列配置
const columns: TableColumn<User>[] = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name', // TypeScript会检查这个字段
  },
  {
    key: 'avatar',
    title: '头像',
    dataIndex: 'profile.avatar', // 支持嵌套属性
    render: (value, record) => {
      // value和record都有正确的类型
      return <img src={value as string} alt={record.name} />;
    },
  },
];
```

### 自定义Hooks

```tsx
function useTableSelection<T extends TableRowData>(data: T[]) {
  const { state, actions } = useTableContext<T>();

  const selectedRows = useSelectedRows<T>();

  const selectAll = useCallback(() => {
    const allKeys = data.map((item) => item.id);
    actions.setSelectedRowKeys(allKeys);
  }, [data, actions]);

  return {
    selectedRows,
    selectedCount: selectedRows.length,
    isAllSelected: selectedRows.length === data.length,
    selectAll,
  };
}
```

## 🚧 即将推出

### 增强表格 (EnhancedTable)

- 内置排序、筛选、选择功能
- 行展开支持
- 列拖拽重排序

### 高级表格 (AdvancedTable)

- 完整的插件系统
- 虚拟滚动支持
- 行内编辑功能

### 核心插件

- `VirtualScrollPlugin` - 虚拟滚动
- `InlineEditPlugin` - 行内编辑
- `ColumnDragPlugin` - 列拖拽
- `RowDragPlugin` - 行拖拽
- `ExportPlugin` - 数据导出

## 📝 总结

这个现代化Table组件系统提供了：

1. **完整的类型安全** - 从数据定义到UI渲染的全链路类型保护
2. **灵活的组合能力** - 原子组件可以自由组合满足各种需求
3. **优异的性能** - 内置多种性能优化措施
4. **现代化API** - 符合React最新最佳实践
5. **零兼容包袱** - 全新设计，专注于未来

这是一个面向未来的Table组件解决方案，专为现代React应用而设计。
