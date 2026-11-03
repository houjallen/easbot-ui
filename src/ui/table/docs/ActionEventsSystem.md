# 表格Action事件系统文档

## 概述

表格Action事件系统是一个基于事件驱动的架构，用于统一管理表格中的各种操作行为。它将内部插件和外部业务逻辑通过标准化的action key进行解耦，提供了类型安全、可扩展的事件处理机制。

## 核心特性

- **统一的事件标识**: 基于schema定义的标准action type
- **类型安全**: 完整的TypeScript类型支持
- **灵活的交互模式**: 支持modal、drawer、menu、page等多种UI交互
- **高级功能**: 防抖节流、条件检查、优先级控制、一次性监听
- **完整的生命周期**: 事件发射、监听、管理和清理
- **调试友好**: 详细的日志和错误处理

## 架构设计

### 职责分离

- **useTableBusiness**: 专注于查询交互能力（分页、排序、筛选、搜索）
- **useTableActions**: 专门处理action事件系统（操作行为的事件发射和监听）

### 事件流程

```
用户操作 -> 插件/组件 -> emitAction -> 事件监听器 -> 业务逻辑处理 -> 返回结果
```

## API 文档

### useTableActions Hook

```typescript
const {
  emitAction,
  onAction,
  offAction,
  offAllActions,
  getRegisteredActionKeys,
  hasActionListeners,
  getActionListenerCount,
} = useTableActions(tableContext);
```

#### emitAction

发射action事件，支持所有交互类型和完整的结果返回。

```typescript
const result = await emitAction(
  actionKey: string,
  data: ActionEventData,
  context?: TableContextValue,
  action?: ActionConfig
): Promise<ActionEmitResult>
```

**参数说明:**

- `actionKey`: action标识符，建议使用schema定义的标准类型
- `data`: 事件数据，包含记录、选中行、自定义数据等
- `context`: 可选的表格上下文，默认使用当前context
- `action`: 可选的action配置信息

**返回值:**

```typescript
interface ActionEmitResult {
  success: boolean;
  results: Array<{
    listenerId: string;
    success: boolean;
    result?: any;
    error?: Error;
  }>;
  totalListeners: number;
}
```

#### onAction

监听action事件，支持泛型、条件检查、防抖节流等高级功能。

```typescript
const unsubscribe = onAction<T extends ActionEventData>(
  actionKey: string,
  handler: (data: T, context: TableContextValue, action: ActionConfig) => Promise<any> | any,
  options?: ActionListenerOptions
): UnsubscribeFunction
```

**选项说明:**

```typescript
interface ActionListenerOptions {
  once?: boolean; // 是否只执行一次
  priority?: number; // 优先级（数字越小优先级越高）
  condition?: (data: T, context: TableContextValue, action: ActionConfig) => boolean; // 条件检查
  debounce?: number; // 防抖延迟（毫秒）
  throttle?: number; // 节流间隔（毫秒）
}
```

#### offAction

移除指定action的监听器。

```typescript
const removed = offAction(
  actionKey: string,
  listenerId?: string  // 可选，不提供则移除所有监听器
): boolean
```

#### offAllActions

批量移除监听器，支持过滤条件。

```typescript
const result = offAllActions(
  filter?: (actionKey: string, listeners: ListenerInfo[]) => boolean
): { removedKeys: string[]; totalRemoved: number }
```

#### 查询方法

```typescript
// 获取已注册的action信息
const actionInfo = getRegisteredActionKeys(): Record<string, RegisteredActionInfo>

// 检查是否有监听器
const hasListeners = hasActionListeners(actionKey: string): boolean

// 获取监听器数量
const count = getActionListenerCount(actionKey: string): number
```

## 事件数据结构

### ActionEventData

```typescript
interface ActionEventData {
  record?: Record<string, any>; // 触发的记录数据（行操作时）
  selectedRows?: Record<string, any>[]; // 选中的行数据（工具栏操作时）
  rowIndex?: number; // 行索引（行操作时）
  originalEvent?: React.MouseEvent; // 原始事件对象
  payload?: any; // 自定义数据
  timestamp?: number; // 事件时间戳
  source?: 'plugin' | 'user' | 'system'; // 事件来源
  interactionType?:
    'confirm' | 'prompt' | 'modal' | 'drawer' | 'menu' | 'page' | 'direct' | 'custom'; // 交互类型
  result?: {
    // 操作结果（after事件时）
    success: boolean;
    data?: any;
    error?: Error;
  };
}
```

## 标准Action类型

基于schema定义的标准action类型：

### 表格级别操作

- `table-refresh`: 刷新表格数据
- `table-export`: 导出表格数据
- `table-print`: 打印表格
- `table-fullscreen`: 全屏显示
- `table-columnSetting`: 列设置

### 行级别操作

- `table-row-edit`: 编辑行
- `table-row-delete`: 删除行
- `table-row-view`: 查看行详情
- `table-row-copy`: 复制行
- `table-row-move`: 移动行

## 交互模式

### Modal模式

```typescript
const action: ActionConfig = {
  key: 'table-row-edit',
  type: 'table-row-edit',
  interaction: {
    type: 'modal',
    modal: {
      title: '编辑记录',
      width: 600,
      height: 400,
      closable: true,
      maskClosable: false,
    },
  },
};
```

### Drawer模式

```typescript
const action: ActionConfig = {
  key: 'table-row-edit',
  type: 'table-row-edit',
  interaction: {
    type: 'drawer',
    drawer: {
      title: '编辑记录',
      placement: 'right',
      width: 480,
      closable: true,
    },
  },
};
```

### Menu模式

```typescript
const action: ActionConfig = {
  key: 'table-export',
  type: 'table-export',
  interaction: {
    type: 'menu',
    menu: {
      items: [
        { key: 'excel', label: '导出Excel' },
        { key: 'csv', label: '导出CSV' },
        { key: 'pdf', label: '导出PDF' },
      ],
      placement: 'bottomLeft',
    },
  },
};
```

### Page模式

```typescript
const action: ActionConfig = {
  key: 'table-row-edit',
  type: 'table-row-edit',
  interaction: {
    type: 'page',
    page: {
      url: '/edit/{id}',
      target: '_blank',
      params: { mode: 'edit' },
    },
  },
};
```

## 使用示例

### 基础使用

```typescript
import { useTableActions } from '@/components/ui/table/hooks';

function MyTableComponent({ tableContext }) {
  const { emitAction, onAction } = useTableActions(tableContext);

  useEffect(() => {
    // 监听编辑事件
    const unsubscribe = onAction('table-row-edit', async (data, context, action) => {
      console.log('编辑事件:', data);

      // 处理编辑逻辑
      if (data.record) {
        const result = await editRecord(data.record);
        return { success: true, updatedRecord: result };
      }
    });

    return unsubscribe;
  }, [onAction]);

  const handleEdit = (record, rowIndex) => {
    emitAction('table-row-edit', {
      record,
      rowIndex,
      source: 'user',
    });
  };

  return (
    <button onClick={() => handleEdit(record, index)}>
      编辑
    </button>
  );
}
```

### 高级功能

```typescript
// 带条件检查的监听器
onAction('table-row-edit', handler, {
  condition: (data) => data.record?.editable !== false,
  priority: 1,
});

// 防抖监听器
onAction('table-search', handler, {
  debounce: 300,
});

// 一次性监听器
onAction('table-init', handler, {
  once: true,
});

// 节流监听器
onAction('table-scroll', handler, {
  throttle: 100,
});
```

### 插件开发

```typescript
function createCustomPlugin(tableContext) {
  const { onAction, emitAction } = useTableActions(tableContext);

  // 注册事件监听器
  const unsubscribe = onAction('custom-action', async (data, context, action) => {
    // 插件逻辑
    return { success: true, message: '插件处理完成' };
  });

  return {
    name: 'CustomPlugin',
    cleanup: unsubscribe,
    triggerAction: (data) => emitAction('custom-action', data),
  };
}
```

## 最佳实践

### 1. Action Key命名规范

- 使用schema定义的标准类型
- 采用kebab-case命名风格
- 包含操作层级：`table-*` 或 `table-row-*`

### 2. 事件数据结构

- 提供完整的上下文信息
- 包含必要的元数据（timestamp、source等）
- 使用payload传递自定义数据

### 3. 错误处理

- 监听器中使用try-catch处理异常
- 返回标准化的结果格式
- 记录详细的错误信息

### 4. 性能优化

- 合理使用防抖节流
- 及时清理不需要的监听器
- 避免在监听器中执行重复操作

### 5. 调试支持

- 使用console.debug记录事件流程
- 利用getRegisteredActionKeys查看注册状态
- 监控事件执行结果

## 迁移指南

### 从旧版本迁移

如果你之前使用的是集成在`useTableBusiness`中的action功能，需要进行以下迁移：

1. **更新导入**

```typescript
// 旧版本
import { useTableBusiness } from '@/components/ui/table/hooks';

// 新版本
import { useTableBusiness, useTableActions } from '@/components/ui/table/hooks';
```

2. **分离功能调用**

```typescript
// 旧版本
const { emitAction, onAction, ...businessLogic } = useTableBusiness(tableContext);

// 新版本
const businessLogic = useTableBusiness(tableContext);
const { emitAction, onAction } = useTableActions(tableContext);
```

3. **更新类型导入**

```typescript
import type {
  ActionEventData,
  ActionEventHandler,
  UnsubscribeFunction,
} from '@/components/ui/table/hooks';
```

## 故障排除

### 常见问题

1. **监听器没有被触发**
   - 检查action key是否正确
   - 确认监听器注册时机
   - 验证条件检查逻辑

2. **类型错误**
   - 确保导入了正确的类型定义
   - 检查ActionEventData接口使用
   - 验证泛型参数

3. **内存泄漏**
   - 确保组件卸载时清理监听器
   - 检查useEffect的依赖数组
   - 验证unsubscribe函数调用

4. **事件执行顺序**
   - 使用priority控制执行顺序
   - 检查异步处理逻辑
   - 验证条件检查影响

### 调试工具

```typescript
// 查看所有注册的action
console.log('已注册的actions:', getRegisteredActionKeys());

// 检查特定action的监听器
console.log('编辑action监听器数量:', getActionListenerCount('table-row-edit'));

// 监控事件执行结果
const result = await emitAction('test-action', data);
console.log('事件执行结果:', result);
```

## 总结

表格Action事件系统提供了一个强大、灵活、类型安全的事件处理架构。通过标准化的action类型和丰富的交互模式，它能够满足各种复杂的业务场景需求，同时保持代码的可维护性和可扩展性。

合理使用这个系统，可以让你的表格组件更加模块化，业务逻辑更加清晰，用户体验更加流畅。
