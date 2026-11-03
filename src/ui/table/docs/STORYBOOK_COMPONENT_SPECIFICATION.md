# Storybook 组件生成规范

## 概述

本规范定义了在 EAS UI Next 项目中创建 Storybook 组件示例的标准化流程和最佳实践。遵循此规范确保所有组件示例的一致性、可维护性和用户体验。

## 文件结构规范

### 文件命名

- **Stories 文件**：`{ComponentName}Example.stories.tsx`
- **示例组件文件**：`{ComponentName}Example.tsx`（如需要）
- **位置**：`src/components/ui/{category}/examples/`

### 文件组织

```
examples/
├── ComponentNameExample.stories.tsx     # 主 Stories 文件
├── ComponentNameExample.tsx             # 复杂示例组件（可选）
├── fixtures/                           # 测试数据（可选）
│   └── sampleData.ts
└── STORYBOOK_COMPONENT_SPECIFICATION.md # 本规范文件
```

## 代码结构规范

### 1. 文件头部注释

```typescript
/**
 * {ComponentName} 组件 Storybook 示例
 * 展示{组件功能描述}和最佳实践
 */
```

### 2. 导入声明

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { ComponentName } from '../organisms/ComponentName'; // 或相应路径
import type { ComponentProps, OtherTypes } from '../types';
```

### 3. 固定测试数据

根据组件测试规范，必须使用固定的测试数据：

```typescript
// 定义数据接口
interface DataModel {
  id: number;
  // 其他字段...
}

// 固定测试数据
const sampleData: DataModel[] = [
  {
    id: 1,
    // 具体数据...
  },
  // 更多固定数据项...
];

// 列配置（适用于表格类组件）
const columns: ColumnType<DataModel>[] = [
  {
    name: 'fieldName',
    title: '字段标题',
    dataIndex: 'fieldName',
    width: 120,
    sortable: true,
    // 其他配置...
  },
  // 更多列配置...
];
```

### 4. 示例组件结构

#### 基础示例

```typescript
const BasicExample: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">基础示例</h3>
      <ComponentName
        data={sampleData}
        // 基础配置...
      />
    </div>
  );
};
```

#### 功能特性示例

```typescript
const FeatureExample: React.FC = () => {
  const [state, setState] = useState(initialValue);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">功能特性示例</h3>
      <div className="mb-4 text-sm text-gray-600">
        功能说明和当前状态展示
      </div>
      <ComponentName
        // 功能相关配置...
        onStateChange={(newState) => {
          setState(newState);
          console.log('状态变化:', newState);
        }}
      />
    </div>
  );
};
```

#### 可配置示例组件

```typescript
interface ConfigurableExampleProps {
  feature1?: boolean;
  feature2?: boolean;
  size?: 'sm' | 'md' | 'lg';
  // 其他配置属性...
}

const ConfigurableExample: React.FC<ConfigurableExampleProps> = ({
  feature1 = false,
  feature2 = false,
  size = 'md',
  // 其他默认值...
}) => {
  const [dynamicState, setDynamicState] = useState(initialValue);

  return (
    <div className="p-4">
      <div className="mb-4 space-y-2 text-sm text-gray-600">
        <div>功能状态: 特性1({feature1 ? '✓' : '✗'}) 特性2({feature2 ? '✓' : '✗'})</div>
        {/* 动态状态显示 */}
      </div>
      <ComponentName
        feature1={feature1}
        feature2={feature2}
        size={size}
        onStateChange={setDynamicState}
        // 其他配置...
      />
    </div>
  );
};
```

### 5. Meta 配置

```typescript
const meta: Meta<typeof ConfigurableExample> = {
  title: 'EASAI/{Category}/{ComponentName}',
  component: ConfigurableExample,
  parameters: {
    layout: 'fullscreen', // 或 'centered'
    docs: {
      description: {
        component: `
## {组件名称} ({ComponentName})

{组件详细描述}

### 🚀 主要特性
- **特性1**：功能描述
- **特性2**：功能描述
- **特性3**：功能描述

### 🎯 使用场景
- 场景1描述
- 场景2描述
- 场景3描述

### 📈 技术特点
- 技术特点1
- 技术特点2
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfigurableExample>;
```

### 6. Story 定义

```typescript
/**
 * 基础示例
 */
export const Basic: Story = {
  name: '基础示例',
  render: () => <BasicExample />,
  parameters: {
    docs: {
      description: {
        story: '展示组件的基础功能和默认配置。',
      },
    },
  },
};

/**
 * 功能特性
 */
export const Feature: Story = {
  name: '功能特性',
  render: () => <FeatureExample />,
  parameters: {
    docs: {
      description: {
        story: '展示组件的特定功能特性和交互效果。',
      },
    },
  },
};

/**
 * 可配置示例
 */
export const Configurable: Story = {
  name: '可配置示例',
  args: {
    feature1: true,
    feature2: false,
    size: 'md',
    // 其他默认参数...
  },
  argTypes: {
    feature1: {
      control: 'boolean',
      description: '功能1开关',
      table: {
        category: '基础功能',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    feature2: {
      control: 'boolean',
      description: '功能2开关',
      table: {
        category: '基础功能',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '组件尺寸',
      table: {
        category: '外观配置',
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
      },
    },
    // 更多 argTypes 配置...
  },
  parameters: {
    docs: {
      description: {
        story: '通过 Controls 面板实时调整组件的各种配置参数。',
      },
    },
  },
};
```

## 规范要求

### 数据规范

1. **固定测试数据**：必须使用固定的测试数据，避免随机数据导致的不稳定性
2. **数据完整性**：测试数据应覆盖组件的所有使用场景
3. **数据真实性**：数据应尽可能接近真实业务场景

### 交互规范

1. **Controls 面板**：支持实时参数调整和预览
2. **状态反馈**：显示组件当前状态和配置信息
3. **事件日志**：重要交互事件输出到控制台
4. **响应式设计**：确保在不同屏幕尺寸下正常显示

### 文档规范

1. **组件描述**：详细说明组件功能、特性和使用场景
2. **Story 说明**：每个 Story 都应有清晰的功能说明
3. **参数文档**：所有可配置参数都应有详细说明
4. **分类组织**：使用合理的参数分类（基础功能、高级功能、外观配置等）

### 代码质量规范

1. **TypeScript 支持**：完整的类型定义和类型安全
2. **错误处理**：适当的错误边界和异常处理
3. **性能优化**：合理使用 React.memo、useMemo 等优化手段
4. **可访问性**：遵循 WCAG 可访问性指南

### 样式规范

1. **主题兼容**：支持亮色/暗色主题切换
2. **响应式设计**：适配不同屏幕尺寸
3. **一致性**：遵循设计系统的视觉规范
4. **CSS 变量**：使用现有主题系统的 CSS 变量

## Story 类型指南

### 必需的 Story 类型

1. **Basic**：基础功能展示
2. **Configurable**：可配置参数演示（必须包含 Controls 面板）

### 推荐的 Story 类型

1. **功能特性类**：Selection、SortAndFilter、Resize 等
2. **场景类**：Comprehensive、Advanced、Performance 等
3. **样式变体类**：Size、Theme、Density 等

### Story 命名规范

- 使用 PascalCase
- 名称应清晰描述功能
- 中文显示名称通过 `name` 属性指定

## 最佳实践

### 1. 状态管理

```typescript
// 推荐：使用 useState 管理组件状态
const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

// 推荐：提供状态变化的可视化反馈
<div className="mb-4 text-sm text-gray-600">
  已选择 {selectedKeys.size} 项: {Array.from(selectedKeys).join(', ')}
</div>
```

### 2. 事件处理

```typescript
// 推荐：事件处理函数输出日志便于调试
onSelectionChange={(keys, rows) => {
  setSelectedKeys(keys);
  console.log('选择变化:', keys, rows);
}}
```

### 3. 条件渲染

```typescript
// 推荐：根据配置动态调整组件属性
columns={enableResize ? columns.map(col => ({ ...col, resizeable: true })) : columns}
```

### 4. 性能优化

```typescript
// 推荐：对复杂计算使用 useMemo
const processedData = useMemo(() => {
  return data.filter((item) => item.status === 'active');
}, [data]);
```

## 质量检查清单

在创建或更新 Stories 时，请确保：

- [ ] 使用固定的测试数据
- [ ] 包含基础和可配置示例
- [ ] Controls 面板正常工作
- [ ] 所有功能都有相应的 Story
- [ ] 类型定义完整且安全
- [ ] 文档说明详细清晰
- [ ] 遵循项目代码规范
- [ ] 支持主题切换
- [ ] 响应式设计正常
- [ ] 可访问性符合标准

## 示例参考

完整的实现示例可参考：

- `EnhancedTableExample.stories.tsx` - Hook 系统组件示例
- `AdvancedTableExample.stories.tsx` - 插件系统组件示例

这些文件展示了规范的完整实现和最佳实践。

---

_此规范基于 EAS UI Next 项目的实际需求和最佳实践制定，应根据项目发展持续更新和完善。_
