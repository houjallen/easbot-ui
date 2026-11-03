# 表格右键菜单功能

表格组件支持为行数据提供右键菜单功能，可以通过配置操作和插件操作两种方式来实现丰富的上下文菜单。

## 功能特性

- ✅ 支持配置操作和插件操作
- ✅ 动态显示/隐藏菜单项
- ✅ 支持图标、工具提示和分隔线
- ✅ 按组分类显示菜单项
- ✅ 支持自定义渲染
- ✅ 完整的生命周期回调
- ✅ 类型安全的配置

## 基础用法

### 1. 启用右键菜单

在 `TableConfig` 中同时设置 `contextMenuable: true` 和配置 `contextMenu` 属性：

```typescript
const tableConfig: TableConfig = {
  // 启用右键菜单功能
  contextMenuable: true,
  // 配置右键菜单
  contextMenu: {
    enabled: true,
    actions: [
      {
        key: 'view',
        label: '查看详情',
        icon: 'eye',
        onClick: (record, context) => {
          console.log('查看详情:', record);
        },
      },
      {
        key: 'edit',
        label: '编辑',
        icon: 'edit',
        onClick: (record, context) => {
          console.log('编辑:', record);
        },
      },
    ],
  },
};
```

### 2. 配置操作项

每个操作项支持以下属性：

```typescript
interface ContextMenuActionConfig {
  key: string; // 唯一标识
  label: string | Function; // 标签文本或函数
  icon?: string | Function; // 图标名称或函数
  priority?: number; // 优先级（数字越小越靠前）
  group?: string; // 分组名称
  variant?: string; // 样式变体
  disabled?: boolean | Function; // 是否禁用
  visible?: boolean | Function; // 是否可见
  when?: Function; // 显示条件
  onClick?: Function; // 点击回调
  render?: Function; // 自定义渲染
}
```

### 3. 动态操作项

操作项的属性可以是函数，根据行数据动态计算：

```typescript
const actions: ContextMenuActionConfig[] = [
  {
    key: 'toggle-status',
    label: (record) => (record?.status === '激活' ? '禁用用户' : '激活用户'),
    icon: (record) => (record?.status === '激活' ? 'user-x' : 'user-check'),
    variant: (record) => (record?.status === '激活' ? 'destructive' : 'default'),
    when: (record) => record?.role !== '管理员',
    onClick: (record, context) => {
      const newStatus = record?.status === '激活' ? '禁用' : '激活';
      console.log(`${newStatus}用户:`, record);
    },
  },
];
```

## 高级配置

### 1. 菜单样式配置

```typescript
const contextMenuConfig: ContextMenuConfig = {
  enabled: true,
  actions: [...],
  // 样式配置
  showIcon: true,           // 显示图标
  showSeparator: true,      // 显示分隔线
  align: 'start',           // 菜单对齐方式
  minWidth: 160,            // 最小宽度
  maxHeight: 300,           // 最大高度
};
```

### 2. 生命周期回调

```typescript
const contextMenuConfig: ContextMenuConfig = {
  enabled: true,
  actions: [...],
  // 生命周期回调
  onBeforeOpen: (record, context) => {
    console.log('菜单即将打开:', record);
    // 返回 false 可以阻止菜单打开
    return true;
  },
  onAfterClose: (record, context) => {
    console.log('菜单已关闭:', record);
  },
};
```

### 3. 自定义菜单渲染

```typescript
const contextMenuConfig: ContextMenuConfig = {
  enabled: true,
  render: (record, context) => {
    return (
      <div className="p-2">
        <div className="font-bold">{record?.name}</div>
        <div className="text-sm text-gray-500">{record?.email}</div>
        <hr className="my-2" />
        <button onClick={() => console.log('自定义操作')}>
          自定义操作
        </button>
      </div>
    );
  },
};
```

## 插件集成

### 1. 创建右键菜单插件

```typescript
export const MyContextMenuPlugin: TablePlugin = {
  id: 'my-context-menu-plugin',
  name: 'MyContextMenuPlugin',
  type: 'action',
  version: '1.0.0',
  description: '自定义右键菜单插件',

  actions: [
    {
      key: 'copy-data',
      label: 'copy',
      icon: 'copy',
      position: TablePluginContributionPoint.ROW_CONTEXT_MENU,
      priority: 1,
      group: 'data',
      onClick: async (record, context) => {
        await navigator.clipboard.writeText(JSON.stringify(record));
        console.log('数据已复制');
      },
    },
  ],
};
```

### 2. 注册插件

```typescript
const tableConfig: TableConfig = {
  // 启用插件系统
  pluginable: true,
  plugin: {
    enabled: true,
    plugins: [MyContextMenuPlugin],
  },
  // 启用右键菜单
  contextMenu: {
    enabled: true,
    actions: [...], // 配置操作
  },
};
```

## 操作分组

使用 `group` 属性对操作进行分组，同组操作会显示在一起，不同组之间会有分隔线：

```typescript
const actions: ContextMenuActionConfig[] = [
  // 查看组
  {
    key: 'view',
    label: '查看详情',
    group: 'view',
    priority: 1,
  },

  // 编辑组
  {
    key: 'edit',
    label: '编辑',
    group: 'edit',
    priority: 2,
  },
  {
    key: 'copy',
    label: '复制',
    group: 'edit',
    priority: 3,
  },

  // 危险操作组
  {
    key: 'delete',
    label: '删除',
    group: 'danger',
    priority: 10,
    variant: 'destructive',
  },
];
```

## 最佳实践

### 1. 操作优先级

- 使用 `priority` 属性控制操作顺序
- 常用操作使用较小的优先级值（1-5）
- 危险操作使用较大的优先级值（10+）

### 2. 条件显示

- 使用 `when` 或 `visible` 函数根据数据动态显示操作
- 避免显示不可用的操作，提升用户体验

### 3. 图标使用

- 为操作提供直观的图标
- 使用一致的图标风格
- 危险操作使用警告色图标

### 4. 分组策略

- 按功能类型分组（查看、编辑、管理、危险操作）
- 每组操作数量不宜过多（建议3-5个）
- 使用分隔线区分不同组

### 5. 性能优化

- 避免在 `onClick` 中执行耗时操作
- 使用 `useCallback` 缓存操作函数
- 合理使用 `when` 条件避免不必要的渲染

## 示例代码

完整的使用示例请参考：

- [基础右键菜单示例](../examples/ContextMenuExample.tsx)
- [插件集成示例](../examples/ContextMenuWithPluginExample.tsx)
- [右键菜单插件](../plugins/row/RowContextMenuPlugin.tsx)

## 类型定义

```typescript
// 右键菜单配置
interface ContextMenuConfig {
  enabled?: boolean;
  actions?: ContextMenuActionConfig[];
  align?: 'start' | 'end';
  maxHeight?: number;
  minWidth?: number;
  showIcon?: boolean;
  showSeparator?: boolean;
  render?: (record: Record<string, any>, context?: TableContextValue) => ReactNode;
  onBeforeOpen?: (
    record: Record<string, any>,
    context?: TableContextValue,
  ) => boolean | Promise<boolean>;
  onAfterClose?: (record: Record<string, any>, context?: TableContextValue) => void;
}

// 右键菜单操作配置
interface ContextMenuActionConfig extends ActionConfig {
  priority?: number;
  group?: string;
  when?: (record?: Record<string, any>, context?: TableContextValue) => boolean;
  onClick?: (
    record?: Record<string, any>,
    context?: TableContextValue,
    action?: ActionConfig,
    event?: React.MouseEvent,
  ) => void | Promise<void>;
  render?: (
    record?: Record<string, any>,
    context?: TableContextValue,
    action?: ActionConfig,
  ) => React.ReactNode;
}
```
