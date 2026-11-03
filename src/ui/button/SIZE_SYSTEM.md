# 统一尺寸系统设计方案

## 🎯 问题分析

### 当前问题

1. **字体冲突**: Menu Item 使用 `text-sm` (14px)，但 Button 在 `sm` 尺寸时强制使用 `text-xs` (12px)
2. **不一致性**: 同一个 UI 系统中，相同语义的组件使用不同的文本尺寸
3. **维护困难**: 每个组件都重复定义文本尺寸，缺乏统一管理

### 根本原因

- **设计理念冲突**: DS 采用"基础尺寸 + 尺寸变体调整"，EAS UI 采用"尺寸变体完全控制"
- **缺乏统一规范**: 没有全局的文本尺寸映射规则

## 💡 解决方案

### 核心思路：基于 Design Token 的统一尺寸系统

#### 1. 设计令牌 (Design Tokens)

```typescript
export interface ButtonSizeToken {
  height: string; // 按钮高度
  paddingX: string; // 水平内边距
  paddingY: string; // 垂直内边距
  fontSize: string; // 文本尺寸 - 关键！
  iconSize: string; // 图标尺寸
  gap: string; // 内容间距
  minWidth?: string; // 最小宽度
}
```

#### 2. 统一的尺寸映射

```typescript
export const buttonSizeTokens = {
  xs: { fontSize: 'text-xs' }, // 12px - 紧凑场景
  sm: { fontSize: 'text-sm' }, // 14px - 与 Menu Item 一致 ✅
  md: { fontSize: 'text-sm' }, // 14px - 标准尺寸
  lg: { fontSize: 'text-base' }, // 16px - 主要操作
  xl: { fontSize: 'text-lg' }, // 18px - CTA 按钮
};
```

#### 3. 向后兼容映射

```typescript
export const buttonSizeMapping = {
  small: 'sm', // 旧 API 兼容
  default: 'md', // 旧 API 兼容
  large: 'lg', // 旧 API 兼容
};
```

## 🏗️ 架构设计

### 1. 分离关注点

- **基础样式**: 只包含通用样式，不包含尺寸
- **尺寸令牌**: 独立管理所有尺寸相关属性
- **动态生成**: 运行时根据令牌生成 CSS 类名

### 2. 实现方式

```typescript
// 旧方式：硬编码在 CVA 中
size: {
  sm: 'h-8 px-2 py-1 text-xs', // 强制覆盖
}

// 新方式：基于令牌动态生成
function getSizeClasses(size: ButtonSize): string {
  const token = buttonSizeTokens[size];
  return [token.height, token.paddingX, token.fontSize].join(' ');
}
```

### 3. 组件集成

```typescript
const Button = ({ size = 'md', ...props }) => {
  const sizeClasses = getSizeClasses(size);
  const sizeToken = buttonSizeTokens[size];

  return (
    <button className={cn(baseStyles, sizeClasses)}>
      <div className={sizeToken.gap}>
        {/* 内容 */}
      </div>
    </button>
  );
};
```

## 📏 尺寸规范

### 文本尺寸映射 (遵循 Design System)

| 组件尺寸 | 文本尺寸 | 像素值 | 使用场景               |
| -------- | -------- | ------ | ---------------------- |
| xs       | text-sm  | 14px   | 表格操作按钮           |
| sm       | text-sm  | 14px   | 次要操作，与 Menu 一致 |
| md       | text-sm  | 14px   | 标准按钮，与 DS 一致   |
| lg       | text-sm  | 14px   | 主要操作，与 DS 一致   |
| xl       | text-sm  | 14px   | CTA 按钮，保持一致性   |

**重要**: 所有尺寸都使用 `text-sm` (14px)，与 Design System 保持完全一致！

### 与其他组件的一致性

```typescript
// Menu Item
className = 'h-8 px-3 py-1.5 text-sm'; // 14px

// Button sm
className = 'h-8 px-3 py-1.5 text-sm'; // 14px ✅ 一致

// Input
className = 'h-9 px-3 py-1 text-sm'; // 14px

// Button md
className = 'h-9 px-4 py-2 text-sm'; // 14px ✅ 一致
```

## 🔄 迁移策略

### 1. 向后兼容

- 保持所有现有 API 不变
- 通过映射表支持旧的 size 值
- 渐进式迁移，不破坏现有代码

### 2. 迁移步骤

1. **创建尺寸令牌系统** ✅
2. **重构 Button 组件** ✅
3. **创建测试用例** ✅
4. **更新其他组件** (后续)
5. **统一全局尺寸规范** (后续)

### 3. 验证方式

- Storybook 对比测试
- 视觉回归测试
- 与 Menu Item 等组件的一致性测试

## 🎨 最佳实践

### 1. 设计原则

- **一致性优先**: 相同语义的组件使用相同的文本尺寸
- **语义化命名**: xs/sm/md/lg/xl 清晰表达尺寸层级
- **响应式友好**: 支持不同设备的最佳尺寸选择
- **无障碍兼容**: 符合最小触摸区域标准 (44px)

### 2. 使用建议

```typescript
// ✅ 推荐：语义化使用
<Button size="sm">次要操作</Button>
<Button size="md">标准操作</Button>
<Button size="lg">主要操作</Button>

// ✅ 响应式使用
<Button size="md" className="md:size-lg">响应式按钮</Button>

// ✅ 移动端优化
<Button size="mobile">移动端按钮</Button>
```

### 3. 扩展方式

```typescript
// 添加新尺寸
export const buttonSizeTokens = {
  // 现有尺寸...
  xxl: {
    height: 'h-12',
    fontSize: 'text-xl',
    // ...
  },
};
```

## 🔮 未来规划

### 1. 全局尺寸系统

- 扩展到所有组件 (Input, Select, Menu 等)
- 建立全局 Design Token 库
- 支持主题切换

### 2. 工具链支持

- ESLint 规则检查尺寸一致性
- 设计稿自动生成令牌
- Figma 插件同步

### 3. 性能优化

- CSS-in-JS 优化
- 按需加载尺寸样式
- 构建时预计算

## 📊 对比效果

### 修复前

```typescript
// Menu Item: text-sm (14px)
// Button sm: text-xs (12px) ❌ 不一致
```

### 修复后

```typescript
// Menu Item: text-sm (14px)
// Button sm: text-sm (14px) ✅ 一致
```

这个统一尺寸系统解决了字体冲突问题，确保了组件间的一致性，同时保持了向后兼容性和良好的扩展性。
