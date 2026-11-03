# Table组件重构架构方案

## 一、组件分层架构

### 第一层：原子组件（Atoms）- 最基础的UI元素

```
atoms/
├── TableContainer.tsx      # 表格容器，处理滚动、样式
├── TableGrid.tsx          # 基础表格网格，纯HTML table
├── TableCell.tsx          # 单元格组件，支持对齐、截断等
├── TableRow.tsx           # 行组件，支持选中、悬停状态
├── TableHeader.tsx        # 表头容器
└── TableBody.tsx          # 表体容器
```

### 第二层：分子组件（Molecules）- 功能组件

```
molecules/
├── TableSort.tsx          # 排序功能组件
├── TableFilter.tsx        # 筛选功能组件
├── TableSelection.tsx     # 行选择功能组件
├── TableExpansion.tsx     # 行展开功能组件
├── TableResize.tsx        # 列宽调整组件
└── TablePagination.tsx    # 分页组件（占位传入）
```

### 第三层：有机体组件（Organisms）- 组合组件

```
organisms/
├── BaseTable.tsx          # 基础表格（原子组件组合）
├── EnhancedTable.tsx      # 增强表格（添加常用分子组件）
└── AdvancedTable.tsx      # 高级表格（支持插件系统）
```

### 第四层：插件系统（Plugins）- 高级功能

```
plugins/
├── VirtualScrollPlugin.tsx    # 虚拟滚动插件
├── InlineEditPlugin.tsx      # 行内编辑插件
├── ColumnDragPlugin.tsx      # 列拖拽插件
├── RowDragPlugin.tsx         # 行拖拽插件
└── ExportPlugin.tsx          # 导出功能插件
```

## 二、状态管理架构

### Context + Hooks 模式

```
context/
├── TableContext.tsx          # 表格主上下文
├── TableStateContext.tsx     # 状态管理上下文
└── TableConfigContext.tsx    # 配置上下文

hooks/
├── useTableState.ts          # 表格状态管理
├── useTableSort.ts           # 排序状态管理
├── useTableFilter.ts         # 筛选状态管理
├── useTableSelection.ts      # 选择状态管理
├── useTableExpansion.ts      # 展开状态管理
└── useTablePlugin.ts         # 插件系统钩子
```

## 三、使用方式设计

### 基础使用（原子组件组合）

```tsx
import {
  TableContainer,
  TableGrid,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

<TableContainer>
  <TableGrid>
    <TableHeader>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Age</TableCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.age}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </TableGrid>
</TableContainer>;
```

### 增强使用（功能组合）

```tsx
import { BaseTable, TableSort, TableFilter, TableSelection } from '@/components/ui/table';

<BaseTable columns={columns} data={data}>
  <TableSort sortable={['name', 'age']} />
  <TableFilter filterable={['name', 'department']} />
  <TableSelection type="checkbox" />
</BaseTable>;
```

### 高级使用（插件模式）

```tsx
import { AdvancedTable } from '@/components/ui/table';

<AdvancedTable
  columns={columns}
  data={data}
  plugins={['virtualScroll', 'inlineEdit', 'columnDrag']}
  pluginConfigs={{
    virtualScroll: { itemHeight: 50 },
    inlineEdit: { trigger: 'dblclick' },
  }}
/>;
```

### Schema配置使用（业务层）

```tsx
// 这是schema层的使用方式，基础UI层不涉及
<TableDataRenderer
  schema={{
    type: 'table',
    columns: [...],
    features: ['sort', 'filter', 'selection'],
    plugins: ['virtualScroll']
  }}
/>
```

## 四、性能优化策略

### 1. 组件优化

- 使用React.memo包装所有组件
- 精确的依赖数组管理
- 状态分片，减少不必要渲染

### 2. 状态优化

- 使用useCallback和useMemo
- 状态分离，避免全局重渲染
- 懒加载插件

### 3. 数据优化

- 虚拟滚动处理大数据
- 分页减少DOM节点
- 按需加载功能模块

## 五、插件系统设计

### 插件接口定义

```typescript
interface TablePlugin {
  name: string;
  version: string;
  install: (table: TableInstance) => void;
  uninstall?: (table: TableInstance) => void;
  config?: Record<string, any>;
}
```

### 插件注册机制

```typescript
const tablePluginRegistry = new Map<string, TablePlugin>();

// 注册插件
registerPlugin('virtualScroll', VirtualScrollPlugin);

// 使用插件
<AdvancedTable plugins={['virtualScroll']} />
```

## 六、兼容性考虑

### 渐进式迁移

1. 保持现有API的兼容性
2. 提供新旧组件并存期
3. 逐步迁移指南

### 向后兼容

```tsx
// 旧的使用方式仍然支持
<Table columns={columns} dataSource={data} />

// 新的使用方式
<EnhancedTable columns={columns} data={data} />
```

## 七、文件组织结构

```
components/ui/table/
├── index.ts                    # 统一导出
├── atoms/                      # 原子组件
│   ├── TableContainer.tsx
│   ├── TableGrid.tsx
│   ├── TableCell.tsx
│   ├── TableRow.tsx
│   ├── TableHeader.tsx
│   └── TableBody.tsx
├── molecules/                  # 分子组件
│   ├── TableSort.tsx
│   ├── TableFilter.tsx
│   ├── TableSelection.tsx
│   ├── TableExpansion.tsx
│   ├── TableResize.tsx
│   └── TablePagination.tsx
├── organisms/                  # 有机体组件
│   ├── BaseTable.tsx
│   ├── EnhancedTable.tsx
│   └── AdvancedTable.tsx
├── plugins/                    # 插件系统
│   ├── VirtualScrollPlugin.tsx
│   ├── InlineEditPlugin.tsx
│   ├── ColumnDragPlugin.tsx
│   ├── RowDragPlugin.tsx
│   └── ExportPlugin.tsx
├── hooks/                      # 自定义hooks
│   ├── useTableState.ts
│   ├── useTableSort.ts
│   ├── useTableFilter.ts
│   ├── useTableSelection.ts
│   ├── useTableExpansion.ts
│   └── useTablePlugin.ts
├── context/                    # 上下文
│   ├── TableContext.tsx
│   ├── TableStateContext.tsx
│   └── TableConfigContext.tsx
├── types/                      # 类型定义
│   ├── table.types.ts
│   ├── plugin.types.ts
│   └── index.ts
├── utils/                      # 工具函数
│   ├── tableUtils.ts
│   ├── pluginUtils.ts
│   └── index.ts
├── styles/                     # 样式文件
│   ├── table.styles.ts
│   └── plugin.styles.ts
├── README.md                   # 组件文档
└── table.stories.tsx           # Storybook示例
```

## 八、实施计划

### 阶段一：基础重构（1-2周）

1. 实现原子组件
2. 实现基础状态管理
3. 实现BaseTable组件
4. 保证基本功能可用

### 阶段二：功能增强（2-3周）

1. 实现分子组件
2. 实现EnhancedTable组件
3. 完善状态管理
4. 添加常用功能

### 阶段三：插件系统（2-3周）

1. 设计插件架构
2. 实现核心插件
3. 实现AdvancedTable组件
4. 完善插件注册机制

### 阶段四：优化完善（1-2周）

1. 性能优化
2. 文档完善
3. 测试用例
4. 迁移指南

## 九、预期收益

### 开发体验

- 降低使用复杂度：从70+属性降低到10-20个核心属性
- 提高开发效率：组合式开发，按需使用功能
- 减少学习成本：分层设计，渐进式学习

### 维护体验

- 降低维护成本：模块化设计，职责清晰
- 提高测试覆盖：小组件易于测试
- 增强扩展性：插件化架构，功能可插拔

### 性能体验

- 减少包体积：按需加载，不用的功能不打包
- 提高渲染性能：精确控制重渲染
- 优化大数据场景：虚拟滚动等高级功能

这个方案既解决了当前的复杂度问题，又为未来的扩展留下了空间，完全符合基础UI组件的定位要求。
