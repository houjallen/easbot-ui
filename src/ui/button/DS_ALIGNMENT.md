# Design System 对齐验证

## 🎯 核心原则

**遵循 Design System 的字体大小策略：所有按钮尺寸统一使用 `text-sm` (14px)**

## 📊 对比分析

### Design System 实现

```typescript
// repository/design-system/components/ui/button.tsx
const buttonVariants = cva(
  // 基础样式中固定 text-sm
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm ...',
  {
    variants: {
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5', // 没有覆盖字体大小
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4', // 没有覆盖字体大小
        icon: 'size-9',
      },
    },
  },
);
```

### 我们的实现 (修正后)

```typescript
// packages/eas-ui-next/src/components/ui/button/size-tokens.ts
export const buttonSizeTokens = {
  xs: { fontSize: 'text-sm' }, // 14px - 与 DS 一致 ✅
  sm: { fontSize: 'text-sm' }, // 14px - 与 DS 一致 ✅
  md: { fontSize: 'text-sm' }, // 14px - 与 DS 一致 ✅
  lg: { fontSize: 'text-sm' }, // 14px - 与 DS 一致 ✅
  xl: { fontSize: 'text-sm' }, // 14px - 与 DS 一致 ✅
};
```

## ✅ 一致性验证

### 1. 字体大小一致性

| 组件              | Design System    | 我们的实现       | 状态    |
| ----------------- | ---------------- | ---------------- | ------- |
| Button (所有尺寸) | `text-sm` (14px) | `text-sm` (14px) | ✅ 一致 |
| Menu Item         | `text-sm` (14px) | `text-sm` (14px) | ✅ 一致 |
| Input             | `text-sm` (14px) | `text-sm` (14px) | ✅ 一致 |

### 2. 尺寸映射一致性

| 尺寸       | Design System | 我们的实现  | 状态    |
| ---------- | ------------- | ----------- | ------- |
| sm         | `h-8 px-3`    | `h-8 px-3`  | ✅ 一致 |
| default/md | `h-9 px-4`    | `h-9 px-4`  | ✅ 一致 |
| lg         | `h-10 px-6`   | `h-10 px-6` | ✅ 一致 |

### 3. 图标尺寸一致性

| 属性     | Design System    | 我们的实现 | 状态    |
| -------- | ---------------- | ---------- | ------- |
| 图标尺寸 | `[&_svg]:size-4` | `size-4`   | ✅ 一致 |
| 间距     | `gap-2`          | `gap-2`    | ✅ 一致 |

## 🔧 关键修正

### 修正前的问题

```typescript
// ❌ 错误：不同尺寸使用不同字体大小
sm: { fontSize: 'text-sm' },   // 14px
md: { fontSize: 'text-sm' },   // 14px
lg: { fontSize: 'text-base' }, // 16px - 与 DS 不一致！
xl: { fontSize: 'text-lg' },   // 18px - 与 DS 不一致！
```

### 修正后的实现

```typescript
// ✅ 正确：所有尺寸统一使用 text-sm
xs: { fontSize: 'text-sm' },   // 14px - 与 DS 一致
sm: { fontSize: 'text-sm' },   // 14px - 与 DS 一致
md: { fontSize: 'text-sm' },   // 14px - 与 DS 一致
lg: { fontSize: 'text-sm' },   // 14px - 与 DS 一致
xl: { fontSize: 'text-sm' },   // 14px - 与 DS 一致
```

## 🎨 设计理念对齐

### Design System 的设计理念

1. **统一的字体大小**: 所有按钮使用相同的 `text-sm` (14px)
2. **尺寸通过容器控制**: 通过 `height`、`padding` 区分尺寸
3. **简洁的变体定义**: 避免在 size 变体中重复定义字体大小

### 我们的实现理念

1. **完全遵循 DS**: 所有尺寸都使用 `text-sm` (14px)
2. **令牌化管理**: 通过 Design Token 统一管理尺寸属性
3. **向后兼容**: 支持旧的 API 同时保持 DS 一致性

## 🚀 优势总结

### 1. 避免冲突

- ✅ 与 Design System 完全一致
- ✅ 与 Tailwind CSS 标准对齐
- ✅ 与其他组件 (Menu, Input) 保持统一

### 2. 维护性

- ✅ 单一数据源管理尺寸
- ✅ 易于全局调整和扩展
- ✅ 类型安全的令牌系统

### 3. 用户体验

- ✅ 视觉一致性更好
- ✅ 认知负担更低
- ✅ 符合用户期望

## 📋 验证清单

- [x] 所有按钮尺寸使用 `text-sm` (14px)
- [x] 与 Design System 的 `h-8`, `h-9`, `h-10` 高度一致
- [x] 与 Design System 的 `px-3`, `px-4`, `px-6` 内边距一致
- [x] 图标尺寸使用 `size-4` (16px) 与 DS 一致
- [x] 间距使用 `gap-2` 与 DS 一致
- [x] 向后兼容性保持完整
- [x] TypeScript 类型定义完整
- [x] Storybook 测试覆盖所有场景

## 🔮 未来扩展

如果需要不同的字体大小，应该：

1. **创建新的组件变体** 而不是修改尺寸

```typescript
// ✅ 推荐：创建新的变体
variant: {
  default: '...',
  large: 'text-base',  // 16px 的特殊变体
  small: 'text-xs',    // 12px 的特殊变体
}
```

2. **保持尺寸系统的一致性**

```typescript
// ✅ 尺寸只控制容器大小，不控制字体
size: {
  sm: 'h-8 px-3',
  md: 'h-9 px-4',
  lg: 'h-10 px-6',
}
```

这样既保持了与 Design System 的一致性，又为未来的扩展留下了空间。
