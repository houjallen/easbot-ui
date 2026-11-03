# EAS Table 插件开发完整规范

## 目录

1. [插件系统概述](#插件系统概述)
2. [插件类型](#插件类型)
3. [插件基础结构](#插件基础结构)
4. [插件开发步骤](#插件开发步骤)
5. [国际化支持](#国际化支持)
6. [状态管理](#状态管理)
7. [UI渲染规范](#ui渲染规范)
8. [生命周期管理](#生命周期管理)
9. [最佳实践](#最佳实践)
10. [示例插件](#示例插件)

## 插件系统概述

EAS Table 插件系统是一个高度可扩展的架构，允许开发者通过插件的方式为表格添加功能。插件系统支持：

- **模块化开发**：每个插件独立开发和维护
- **热插拔**：插件可以动态注册和注销
- **状态隔离**：每个插件拥有独立的状态空间
- **统一接口**：所有插件遵循相同的接口规范
- **国际化支持**：内置多语言支持机制

## 插件类型

### 1. Action 插件

提供用户交互功能，通常显示为按钮或菜单项。

**特点：**

- 有明确的用户交互入口
- 可以触发具体的操作
- 支持工具栏和更多菜单显示

**示例：** 导出、打印、刷新、全屏等

### 2. Filter 插件

提供数据过滤和筛选功能。

**特点：**

- 影响数据显示结果
- 通常有UI控件供用户操作
- 可以与其他过滤器组合使用

### 3. Transform 插件

对表格数据或列进行转换处理。

**特点：**

- 在数据渲染前进行处理
- 不直接提供用户交互
- 影响表格的显示结果

### 4. Hybrid 插件

综合型插件，可能包含多种功能。

**特点：**

- 功能复杂，可能同时具备多种特性
- 可能同时影响数据、UI和交互

**示例：** 虚拟滚动、列管理等

## 插件基础结构

### 插件接口定义

```typescript
interface TablePlugin {
  // 基础信息
  id: string; // 插件唯一标识
  name: string; // 插件名称
  type: 'action' | 'filter' | 'transform' | 'hybrid';
  version: string; // 插件版本
  description: string; // 插件描述
  messages: PluginMessages; // 国际化消息

  // 状态管理
  defaultState?: any; // 默认状态

  // 生命周期
  init?: (context: TablePluginContext) => void;
  destroy?: (context: TablePluginContext) => void;

  // 功能定义
  actions?: TableAction[]; // 动作定义
  transformColumns?: (columns: any[], context: TablePluginContext) => any[];
  transformData?: (data: any[], context: TablePluginContext) => any[];
}
```

### 插件上下文接口

```typescript
interface TablePluginContext {
  // 插件基础信息
  pluginId: string;
  tableContext: TableContext;

  // 状态管理
  state: any;
  updateState: (newState: any) => void;
  getState: () => any;

  // 工具函数
  processMessage: (key: string, messages?: PluginMessages, params?: Record<string, any>) => string;

  // 配置
  config?: any;
}
```

## 插件开发步骤

### 1. 创建插件文件

```typescript
// MyPlugin.tsx
import React from 'react';
import type { TablePlugin } from '../types';

const MyPlugin: TablePlugin = {
  id: 'myPlugin',
  name: 'myPlugin',
  type: 'action',
  version: '1.0.0',
  description: 'My custom plugin',
  messages: {
    // 国际化消息
  },

  // 实现插件逻辑
};

export default MyPlugin;
```

### 2. 定义国际化消息

```typescript
const myPluginMessages = {
  'zh-CN': {
    title: '我的插件',
    description: '这是我的自定义插件',
    tooltip: '点击执行我的功能',
    // 其他消息...
  },
  'en-US': {
    title: 'My Plugin',
    description: 'This is my custom plugin',
    tooltip: 'Click to execute my function',
    // 其他消息...
  },
};
```

### 3. 实现插件状态（可选）

```typescript
interface MyPluginState {
  isActive: boolean;
  data?: any;
}

const defaultState: MyPluginState = {
  isActive: false,
  data: undefined,
};
```

### 4. 实现生命周期方法

```typescript
const MyPlugin: TablePlugin = {
  // ... 其他配置

  init: (context: TablePluginContext) => {
    // 插件初始化逻辑
    context.updateState?.(defaultState);

    // 可以添加事件监听器等
    console.log(`Plugin ${context.pluginId} initialized`);
  },

  destroy: (context: TablePluginContext) => {
    // 清理资源
    // 移除事件监听器等
    console.log(`Plugin ${context.pluginId} destroyed`);
  },
};
```

### 5. 定义插件动作

```typescript
const MyPlugin: TablePlugin = {
  // ... 其他配置

  actions: [
    {
      key: 'myAction',
      label: 'title', // 使用国际化key
      icon: 'my-icon', // 图标名称
      position: 'toolbar.right', // 显示位置
      priority: 1, // 优先级
      group: 'custom', // 分组
      isPluginAction: true, // 标记为插件动作
      messages: myPluginMessages, // 国际化消息

      when: (context) => {
        // 显示条件判断
        return true;
      },

      onClick: (selectedRows, context, tableLogic, event) => {
        // 阻止事件向上传递
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        // 执行插件逻辑
        console.log('Plugin action executed');
      },

      render: (selectedRows, context, tableLogic) => {
        // 自定义渲染
        const processMessage = context?.processMessage || ((key: string) => key);
        const { Button } = require('@/components/ui/button');
        const { Icon } = require('@/components/ui/icon');

        return React.createElement(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: (event) => {
            // 阻止事件向上传递
            event?.preventDefault?.();
            event?.stopPropagation?.();
            // 处理点击事件
          },
          title: processMessage('tooltip', myPluginMessages),
          leftIcon: React.createElement(Icon, {
            name: 'my-icon',
            size: 16,
          }),
          children: processMessage('title', myPluginMessages),
        });
      },
    },
  ],
};
```

## 国际化支持

### 消息结构规范

```typescript
const pluginMessages = {
  'zh-CN': {
    // 标准字段（必须）
    title: '插件标题',
    description: '插件描述',
    tooltip: '提示信息',

    // 功能相关
    action: '动作',
    success: '成功',
    failed: '失败',
    loading: '加载中...',

    // 自定义字段
    customMessage: '自定义消息',
  },
  'en-US': {
    // 对应的英文翻译
    title: 'Plugin Title',
    description: 'Plugin Description',
    tooltip: 'Tooltip',

    action: 'Action',
    success: 'Success',
    failed: 'Failed',
    loading: 'Loading...',

    customMessage: 'Custom Message',
  },
};
```

### 使用国际化消息

```typescript
// 在插件中使用
const processMessage = context?.processMessage || ((key: string) => key);
const message = processMessage('title', pluginMessages);

// 带参数的消息
const messageWithParams = processMessage('userCount', pluginMessages, { count: 10 });
```

## 状态管理

### 状态更新规范

```typescript
// ✅ 正确的状态更新方式
context.updateState?.({
  ...currentState,
  newField: newValue,
});

// ❌ 错误的方式 - 不要直接修改状态
context.state.newField = newValue;
```

### 状态初始化

```typescript
init: (context: TablePluginContext) => {
  // 检查是否已初始化，避免重复初始化
  const currentState = context?.getState?.();
  if (currentState?.initialized) {
    return;
  }

  // 初始化状态
  context.updateState?.({
    initialized: true,
    // 其他初始状态...
  });
},
```

## UI渲染规范

### 使用统一组件

```typescript
// ✅ 使用项目统一的UI组件
const { Button } = require('@/components/ui/button');
const { Icon } = require('@/components/ui/icon');

// ❌ 不要直接使用第三方图标库
import { Download } from 'lucide-react'; // 避免
```

### onClick事件统一处理规范

**重要：** 所有插件必须遵循统一的onClick事件处理模式，确保按钮和菜单项都能正确触发插件逻辑。

#### 统一处理模式

```typescript
// ✅ 正确的onClick事件处理模式
render: (selectedRows, context, tableLogic) => {
  const processMessage = context?.processMessage || ((key: string) => key);
  const { Button } = require('@/components/ui/button');
  const { Icon } = require('@/components/ui/icon');

  // 统一的点击处理函数
  const handleClick = (event?: React.MouseEvent) => {
    // 直接调用插件的onClick方法，实现统一的事件处理
    const action = MyPlugin.actions?.[0];
    if (action?.onClick) {
      action.onClick(selectedRows, context, tableLogic, event);
    }
  };

  return React.createElement(Button, {
    variant: 'outline',
    size: 'sm',
    onClick: handleClick,  // 调用统一处理函数
    className: 'shrink-0',
    title: processMessage('tooltip', pluginMessages),
    leftIcon: React.createElement(Icon, {
      name: 'icon-name',
      size: 16,
    }),
    children: processMessage('title', pluginMessages),
  });
},
```

#### 菜单项事件处理

对于包含下拉菜单的插件，菜单项也必须调用插件的onClick方法：

```typescript
// 菜单组件中的统一事件处理
const MyMenuComponent: React.FC<{
  selectedRows: any[];
  context: TablePluginContext;
  tableLogic: any;
}> = ({ selectedRows, context, tableLogic }) => {

  // 统一调用插件onClick方法的函数
  const callPluginAction = useCallback((actionType?: string) => {
    const action = MyPlugin.actions?.[0];
    if (action?.onClick) {
      action.onClick(selectedRows, context, tableLogic);
    }
  }, [selectedRows, context, tableLogic]);

  return (
    <DropdownMenuContent>
      <DropdownMenuItem
        onClick={() => {
          callPluginAction('menu-action');
          // 执行菜单项特定逻辑
          handleMenuAction();
        }}
      >
        菜单项
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};
```

#### 事件处理最佳实践

1. **统一入口**：所有用户交互（按钮点击、菜单选择）都应调用插件的onClick方法
2. **事件阻止**：在onClick方法中阻止事件冒泡
3. **状态管理**：在onClick方法中统一管理插件状态
4. **错误处理**：在onClick方法中集中处理错误情况

```typescript
onClick: async (selectedRows, context, tableLogic, event) => {
  // 1. 阻止事件向上传递
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // 2. 状态检查和更新
  const currentState = context?.state;
  if (currentState?.isProcessing) {
    return; // 防止重复执行
  }

  context?.updateState?.({
    isProcessing: true,
  });

  try {
    // 3. 执行插件核心逻辑
    await executePluginLogic();

    // 4. 更新成功状态
    context?.updateState?.({
      isProcessing: false,
      lastExecuteTime: new Date(),
    });

  } catch (error) {
    // 5. 错误处理
    console.error('Plugin execution failed:', error);
    context?.updateState?.({
      isProcessing: false,
    });
  }
},
```

#### 常见错误避免

```typescript
// ❌ 错误：直接在render中处理业务逻辑
render: () => {
  return React.createElement(Button, {
    onClick: () => {
      // 不要在这里写业务逻辑
      performBusinessLogic();
    },
  });
};

// ❌ 错误：菜单和按钮使用不同的处理逻辑
// 按钮使用一套逻辑，菜单使用另一套逻辑

// ✅ 正确：统一调用插件onClick方法
render: () => {
  const handleClick = (event?: React.MouseEvent) => {
    const action = MyPlugin.actions?.[0];
    if (action?.onClick) {
      action.onClick(selectedRows, context, tableLogic, event);
    }
  };

  return React.createElement(Button, {
    onClick: handleClick,
  });
};
```

### 按钮渲染标准

```typescript
render: (selectedRows, context, tableLogic) => {
  const processMessage = context?.processMessage || ((key: string) => key);
  const { Button } = require('@/components/ui/button');
  const { Icon } = require('@/components/ui/icon');

  return React.createElement(Button, {
    variant: 'outline',           // 统一样式
    size: 'sm',                   // 统一大小
    className: 'shrink-0',        // 防止收缩
    title: processMessage('tooltip', pluginMessages),
    leftIcon: React.createElement(Icon, {
      name: 'icon-name',          // 使用统一图标
      size: 16,
    }),
    onClick: (event) => {
      // 阻止事件向上传递
      event?.preventDefault?.();
      event?.stopPropagation?.();
      handleClick();
    },
    disabled: isLoading,
    children: processMessage('title', pluginMessages),
  });
},
```

### 下拉菜单渲染

```typescript
render: (selectedRows, context, tableLogic) => {
  const { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } = require('@/components/ui/dropdown-menu');

  return React.createElement(
    DropdownMenu,
    {},
    React.createElement(
      DropdownMenuTrigger,
      { asChild: true },
      // 触发按钮
    ),
    React.createElement(
      DropdownMenuContent,
      { align: 'end', className: 'p-0' },
      // 菜单内容
    ),
  );
},
```

## 生命周期管理

### 初始化最佳实践

```typescript
init: (context: TablePluginContext) => {
  // 1. 检查重复初始化
  const currentState = context?.getState?.();
  if (currentState?.initialized) {
    return;
  }

  // 2. 获取必要的上下文
  const tableContext = context?.tableContext;
  if (!tableContext) {
    console.warn(`Plugin ${context.pluginId}: tableContext not available`);
    return;
  }

  // 3. 初始化状态
  context.updateState?.({
    initialized: true,
    // 其他初始状态
  });

  // 4. 添加事件监听器（如需要）
  const handleKeyDown = (event: KeyboardEvent) => {
    // 处理键盘事件
  };
  document.addEventListener('keydown', handleKeyDown);

  // 5. 保存清理函数引用
  context.cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
},
```

### 销毁最佳实践

```typescript
destroy: (context: TablePluginContext) => {
  // 1. 执行自定义清理函数
  if (context.cleanup) {
    context.cleanup();
    delete context.cleanup;
  }

  // 2. 清理事件监听器
  // 移除所有添加的事件监听器

  // 3. 清理定时器
  const pluginState = context.state;
  if (pluginState?.timerId) {
    clearInterval(pluginState.timerId);
  }

  // 4. 重置状态
  context.updateState?.({
    initialized: false,
  });
},
```

## 最佳实践

### 1. 依赖管理

```typescript
// ✅ 使用空依赖数组避免无限循环
const registerPlugin = useCallback((pluginId: string) => {
  // 注册逻辑
}, []); // 空依赖数组

const unregisterPlugin = useCallback((pluginId: string) => {
  // 注销逻辑
}, []); // 空依赖数组
```

### 2. 数据处理

```typescript
// ✅ 数组深拷贝使用 JSON 方式
const copiedArray = JSON.parse(JSON.stringify(originalArray));

// ✅ 对象深拷贝使用 deepMerge
const copiedObject = deepMerge({}, originalObject);
```

### 3. 错误处理

```typescript
onClick: async (selectedRows, context, tableLogic) => {
  try {
    // 执行操作
    await performAction();
    console.log(processMessage('success', pluginMessages));
  } catch (error) {
    console.error(processMessage('failed', pluginMessages), error);
    // 可以显示用户友好的错误信息
  }
},
```

### 4. 性能优化

```typescript
// ✅ 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependencies]);

// ✅ 使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### 5. 类型安全

```typescript
// 定义明确的类型接口
interface MyPluginConfig {
  enabled?: boolean;
  customOption?: string;
}

interface MyPluginState {
  isActive: boolean;
  data?: any[];
}

// 使用类型断言确保类型安全
const pluginState = context.state as MyPluginState;
const config = context.config as MyPluginConfig;
```

## 示例插件

### 简单动作插件示例

```typescript
import React from 'react';
import type { TablePlugin } from '../types';

// 国际化消息
const simpleActionMessages = {
  'zh-CN': {
    title: '简单动作',
    description: '这是一个简单的动作插件示例',
    tooltip: '点击执行简单动作',
    success: '动作执行成功',
    failed: '动作执行失败',
  },
  'en-US': {
    title: 'Simple Action',
    description: 'This is a simple action plugin example',
    tooltip: 'Click to execute simple action',
    success: 'Action executed successfully',
    failed: 'Action execution failed',
  },
};

// 插件状态接口
interface SimpleActionState {
  isExecuting: boolean;
  lastExecuteTime?: Date;
}

// 插件定义
const SimpleActionPlugin: TablePlugin = {
  id: 'simpleAction',
  name: 'simpleAction',
  type: 'action',
  version: '1.0.0',
  description: 'Simple action plugin example',
  messages: simpleActionMessages,

  // 默认状态
  defaultState: {
    isExecuting: false,
    lastExecuteTime: undefined,
  } as SimpleActionState,

  // 初始化
  init: (context) => {
    context.updateState?.({
      isExecuting: false,
      lastExecuteTime: undefined,
    });
  },

  // 销毁
  destroy: (context) => {
    // 清理资源
  },

  // 动作定义
  actions: [
    {
      key: 'simpleAction',
      label: 'title',
      icon: 'action',
      position: 'toolbar.right',
      priority: 1,
      group: 'custom',
      isPluginAction: true,
      messages: simpleActionMessages,

      when: (context) => true,

      onClick: async (selectedRows, context, tableLogic, event) => {
        // 阻止事件向上传递
        event?.preventDefault?.();
        event?.stopPropagation?.();

        const processMessage = context?.processMessage || ((key: string) => key);

        try {
          // 更新状态
          context.updateState?.({
            isExecuting: true,
          });

          // 执行动作逻辑
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // 更新完成状态
          context.updateState?.({
            isExecuting: false,
            lastExecuteTime: new Date(),
          });

          console.log(processMessage('success', simpleActionMessages));
        } catch (error) {
          context.updateState?.({
            isExecuting: false,
          });
          console.error(processMessage('failed', simpleActionMessages), error);
        }
      },

      render: (selectedRows, context, tableLogic) => {
        const processMessage = context?.processMessage || ((key: string) => key);
        const pluginState = context.state as SimpleActionState;
        const { Button } = require('@/components/ui/button');
        const { Icon } = require('@/components/ui/icon');

        // 统一的点击处理函数
        const handleClick = (event?: React.MouseEvent) => {
          // 直接调用插件的onClick方法，实现统一的事件处理
          const action = SimpleActionPlugin.actions?.[0];
          if (action?.onClick) {
            action.onClick(selectedRows, context, tableLogic, event);
          }
        };

        return React.createElement(Button, {
          variant: 'outline',
          size: 'sm',
          disabled: pluginState?.isExecuting,
          onClick: handleClick, // 使用统一处理函数
          className: 'shrink-0',
          title: processMessage('tooltip', simpleActionMessages),
          leftIcon: React.createElement(Icon, {
            name: 'action',
            size: 16,
          }),
          children: processMessage('title', simpleActionMessages),
        });
      },
    },
  ],
};

export default SimpleActionPlugin;
```

## 插件注册和使用

### 注册插件

```typescript
// 在表格配置中注册插件
const tableConfig = {
  plugins: [
    SimpleActionPlugin,
    // 其他插件...
  ],
};
```

### 插件配置

```typescript
// 带配置的插件使用
const tableConfig = {
  plugins: [
    {
      plugin: SimpleActionPlugin,
      config: {
        enabled: true,
        customOption: 'value',
      },
    },
  ],
};
```

## 调试和测试

### 调试技巧

1. **使用 console.log 跟踪插件生命周期**
2. **检查插件状态变化**
3. **验证国际化消息显示**
4. **测试错误处理逻辑**

### 测试清单

- [ ] 插件初始化正常
- [ ] 插件销毁清理完整
- [ ] 国际化消息显示正确
- [ ] 用户交互响应正常
- [ ] **onClick事件统一处理正常**
  - [ ] 工具栏按钮点击触发插件onClick方法
  - [ ] 下拉菜单项点击触发插件onClick方法
  - [ ] 按钮和菜单触发相同的插件逻辑
  - [ ] 事件冒泡正确阻止
- [ ] 错误处理机制有效
- [ ] 性能表现良好
- [ ] 与其他插件兼容

---

**注意：** 本规范基于 EAS Table 插件系统的当前实现，随着系统演进可能会有更新。开发插件时请参考最新的类型定义和示例代码。
