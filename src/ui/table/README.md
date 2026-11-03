# 现代化Table组件

## 🎯 设计理念

基于最新React模式和TypeScript特性，采用插件化和组合式设计：

- **类型安全**：完整的TypeScript泛型支持
- **组合式设计**：原子→分子→有机体的分层架构
- **插件化扩展**：高级功能按需加载
- **现代化API**：简洁直观的使用方式
- **性能优化**：精确控制渲染和状态更新

## 🏗️ 架构设计

### 组件分层

```
层级              组件                     职责
────────────────────────────────────────────────
原子组件          TableContainer           容器和状态
(Atoms)          TableGrid                HTML table
                 TableCell                单元格
                 TableRow                 行
                 TableHeader              表头
                 TableBody                表体

有机体组件        BaseTable                基础表格
(Organisms)      EnhancedTable            增强表格（待实现）
                 AdvancedTable            高级表格（待实现）

插件系统          VirtualScrollPlugin      虚拟滚动
(Plugins)        InlineEditPlugin         行内编辑
                 ColumnDragPlugin         列拖拽
                 ...
```

### 类型系统

完全泛型化的类型设计：

```typescript
// 数据类型
type User = {
  id: number;
  name: string;
  email: string;
};

// 列配置（与Schema字段名保持一致）
const columns: TableColumn<User>[] = [
  {
    name: 'name', // 使用name而不是key
    title: '姓名',
    dataIndex: 'name', // 类型安全
  },
  {
    name: 'email',
    title: '邮箱',
    dataIndex: 'email',
    render: (value, record) => (
      <a href={`mailto:${value}`}>{value}</a>
    ),
  },
];

// 表格组件
<BaseTable<User>
  columns={columns}
  data={userData}
  rowKey="id"
/>
```

## 📚 使用指南

### 基础用法

最简单的表格：

```tsx
import { BaseTable, type TableColumn } from '@/components/ui/table';

type Product = {
  id: number;
  name: string;
  price: number;
  status: 'active' | 'inactive';
};

const columns: TableColumn<Product>[] = [
  {
    name: 'name', // 使用name而不是key
    title: '产品名称',
    dataIndex: 'name',
  },
  {
    name: 'price',
    title: '价格',
    dataIndex: 'price',
    align: 'right', // 使用Schema的对齐方式
    render: (value) => `¥${value}`,
  },
  {
    name: 'status',
    title: '状态',
    dataIndex: 'status',
    render: (value) => (
      <span className={value === 'active' ? 'text-green-600' : 'text-gray-400'}>
        {value === 'active' ? '启用' : '禁用'}
      </span>
    ),
  },
];

const products: Product[] = [
  { id: 1, name: '苹果', price: 5, status: 'active' },
  { id: 2, name: '香蕉', price: 3, status: 'inactive' },
];

function ProductTable() {
  return <BaseTable<Product> columns={columns} data={products} rowKey="id" />;
}
```

### 原子组件组合

完全自定义的表格：

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
    <TableContainer bordered>
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

### 状态管理

使用内置的状态管理系统：

```tsx
import { TableProvider, useTableContext, useSelectedRows } from '@/components/ui/table';

function TableWithState() {
  return (
    <TableProvider
      columns={columns}
      data={data}
      rowKey="id"
      size="md"
      density="comfortable"
      bordered={false}
      striped={false}
    >
      <CustomTableContent />
      <SelectedRowsInfo />
    </TableProvider>
  );
}

function CustomTableContent() {
  const { state, actions } = useTableContext();

  const handleRowClick = (record: Product) => {
    actions.toggleRowSelection(record.id);
  };

  // 自定义表格实现...
}

function SelectedRowsInfo() {
  const selectedRows = useSelectedRows<Product>();

  return <div className="mt-4">已选择 {selectedRows.length} 项</div>;
}
```

### 删除数据

> ⚠️ **组件库不内置删除动作** —— 表格数据归消费方所有，
> 删除**必须**由消费方改自己的 `data`，组件库不会替你删任何行。

删除分两种模式，区别只在**何时改 `data`**：

| 模式         | 流程                                | 失败处理                       |
| ------------ | ----------------------------------- | ------------------------------ |
| **本地删除** | 直接改 `data` → 行立即消失          | —                              |
| **远程删除** | 先调后端 → 成功后改 `data` → 行消失 | 保持数据不变，由消费方提示用户 |

```tsx
// 本地删除
const handleDelete = (row: Product) => {
  setData((prev) => prev.filter((item) => item.id !== row.id));
};

// 远程删除
const handleDelete = async (row: Product) => {
  try {
    await api.deleteProduct(row.id);
    setData((prev) => prev.filter((item) => item.id !== row.id));
  } catch (error) {
    toast.error('删除失败，请重试'); // 数据保持不变
  }
};
```

#### 用 `TableProvider` 管理的数据

`TableProvider` 提供了 `actions.removeItem(rowKey)`，可直接用于本地删除：

```tsx
function DeleteButton({ record }: { record: Product }) {
  const { actions } = useTableContext();

  return (
    <button type="button" onClick={() => actions.removeItem(record.id)}>
      删除
    </button>
  );
}
```

#### 用 `DeleteRowPlugin`（远程删除）

内置的 `DeleteRowPlugin` 只负责**发出 `table-row-delete` 事件**，
不直接改数据。消费方监听该事件并在**请求成功后**改数据：

```tsx
const { onAction } = useTableEventActions(tableContext);

useEffect(() => {
  return onAction('table-row-delete', async (data) => {
    const ok = await api.deleteProduct(data.record.id);
    if (!ok) return { success: false };

    // 成功后同步本地数据
    setData((prev) => prev.filter((item) => item.id !== data.record.id));
    return { success: true };
  });
}, [onAction]);
```

### 展开行（跨列）

展开行是**额外的 `<tr>`**，其单元格必须用 `colSpan` 覆盖全部列数，
否则在 `table-fixed` 布局下会被压成第一列宽度 → 内容挤压重叠：

```tsx
const columnCount = selectable ? 7 : 6;

<TableRow key={`${row.id}-expanded`}>
  <TableCell as="td" colSpan={columnCount} className="whitespace-normal">
    {/* 详情内容 —— 注意 `whitespace-normal` 覆盖 TableCell 默认的 nowrap */}
  </TableCell>
</TableRow>;
```

## 🔌 插件系统（即将推出）

### 插件定义

```typescript
import { type TablePlugin } from '@/components/ui/table';

const virtualScrollPlugin: TablePlugin<Product, { itemHeight: number }> = {
  name: 'virtualScroll',
  version: '1.0.0',
  description: '虚拟滚动插件',
  defaultConfig: {
    itemHeight: 40,
  },
  install: (context, config) => {
    // 插件安装逻辑
    return {
      uninstall: () => {
        // 插件卸载逻辑
      },
      features: ['virtualScroll'],
    };
  },
};
```

### 插件使用

```tsx
import { AdvancedTable, registerPlugin } from '@/components/ui/table';

// 注册插件
registerPlugin(virtualScrollPlugin);

// 使用插件
<AdvancedTable<Product>
  columns={columns}
  data={largeDataset}
  plugins={['virtualScroll']}
  pluginConfigs={{
    virtualScroll: { itemHeight: 50 },
  }}
/>;
```

## 📋 API参考

### BaseTable<T> Props

| 属性               | 类型                                                    | 默认值          | 说明           |
| ------------------ | ------------------------------------------------------- | --------------- | -------------- |
| columns            | `TableColumn<T>[]`                                      | -               | 列配置（必需） |
| data               | `T[]`                                                   | -               | 数据源（必需） |
| rowKey             | `keyof T`                                               | `'id'`          | 行键字段       |
| size               | `'sm' \| 'md' \| 'lg'`                                  | `'md'`          | 表格大小       |
| density            | `'compact' \| 'comfortable'`                            | `'comfortable'` | 表格密度       |
| bordered           | `boolean`                                               | `false`         | 是否显示边框   |
| striped            | `boolean`                                               | `false`         | 是否显示条纹   |
| showHeader         | `boolean`                                               | `true`          | 是否显示表头   |
| stickyHeader       | `boolean`                                               | `false`         | 表头是否固定   |
| stickyHeaderOffset | `number`                                                | `0`             | 固定表头偏移量 |
| scroll             | `ScrollConfig`                                          | -               | 滚动配置       |
| loading            | `boolean`                                               | `false`         | 加载状态       |
| error              | `ReactNode`                                             | -               | 错误信息       |
| empty              | `ReactNode`                                             | `'暂无数据'`    | 空数据提示     |
| onRowClick         | `(record: T, index: number, event: MouseEvent) => void` | -               | 行点击事件     |
| onRowDoubleClick   | `(record: T, index: number, event: MouseEvent) => void` | -               | 行双击事件     |

### TableColumn<T> 配置（与Schema保持一致）

| 属性       | 类型                                                      | 说明                                 |
| ---------- | --------------------------------------------------------- | ------------------------------------ |
| name       | `string`                                                  | 列唯一标识（必需，与Schema保持一致） |
| title      | `ReactNode`                                               | 列标题（必需）                       |
| dataIndex  | `keyof T \| string`                                       | 数据字段路径，支持嵌套如'user.name'  |
| width      | `number \| string`                                        | 列宽                                 |
| minWidth   | `number`                                                  | 最小宽度                             |
| maxWidth   | `number`                                                  | 最大宽度                             |
| align      | `'left' \| 'center' \| 'right'`                           | 对齐方式（与Schema保持一致）         |
| fixed      | `'left' \| 'right'`                                       | 固定位置（与Schema保持一致）         |
| visible    | `boolean`                                                 | 是否显示（与Schema保持一致）         |
| sortable   | `boolean`                                                 | 是否可排序                           |
| filterable | `boolean`                                                 | 是否可筛选                           |
| resizeable | `boolean`                                                 | 是否可调整大小                       |
| ellipsis   | `boolean`                                                 | 是否截断文本                         |
| render     | `(value: unknown, record: T, index: number) => ReactNode` | 自定义渲染                           |
| className  | `string`                                                  | CSS类名                              |
| style      | `CSSProperties`                                           | 内联样式                             |

### 原子组件 Props

详细的原子组件属性请参考各组件的TypeScript定义。

## 🎨 样式定制

### CSS类名

所有组件都使用标准的BEM命名：

- `.eas-table-container` - 表格容器
- `.eas-table-grid` - 表格网格
- `.eas-table-cell` - 单元格
- `.eas-table-row` - 表格行
- `.eas-table-header` - 表头
- `.eas-table-body` - 表体

### 主题定制

支持CSS变量和Tailwind CSS：

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

- 为大数据集启用虚拟滚动插件
- 使用合适的rowKey确保React key稳定
- 避免在render函数中创建新对象
- 合理设置列宽避免布局抖动

## 🚀 即将推出

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

## 📞 开发指南

### 类型安全开发

```typescript
// 定义数据类型
interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly profile?: {
    readonly avatar: string;
    readonly bio: string;
  };
}

// 类型安全的列配置
const columns: TableColumn<User>[] = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name', // 类型检查
  },
  {
    key: 'avatar',
    title: '头像',
    dataIndex: 'profile.avatar', // 支持嵌套属性
    render: (value) => (
      <img src={value as string} alt="avatar" className="w-8 h-8 rounded-full" />
    ),
  },
];
```

### 自定义Hooks

```typescript
function useTableSelection<T extends TableRowData>(data: T[]) {
  const { state, actions } = useTableContext<T>();

  const selectedRows = useSelectedRows<T>();

  const selectAll = useCallback(() => {
    actions.setSelectedRowKeys(data.map((item) => item.id));
  }, [data, actions]);

  const clearSelection = useCallback(() => {
    actions.setSelectedRowKeys([]);
  }, [actions]);

  return {
    selectedRows,
    selectedCount: selectedRows.length,
    isAllSelected: selectedRows.length === data.length,
    selectAll,
    clearSelection,
  };
}
```

---

**注意**: 这是全新设计的现代化Table组件，专注于类型安全和最佳开发体验。不包含任何历史兼容性代码。
