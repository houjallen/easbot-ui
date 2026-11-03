# 虚拟列表组件

基于 React 和 TypeScript 的高性能虚拟列表组件，专为大数据量表格渲染优化。

## 功能特性

### 核心功能

- ✅ **虚拟滚动**: 只渲染可见区域的项目，支持大数据量
- ✅ **动态行高**: 支持固定和动态计算的行高
- ✅ **性能优化**: 内置缓存机制和节流处理
- ✅ **固定表头**: 支持粘性表头显示
- ✅ **滚动控制**: 支持滚动到指定索引位置

### 性能优化

- ✅ **尺寸缓存**: 智能缓存已测量的项目尺寸
- ✅ **预估尺寸**: 支持未测量项目的尺寸预估
- ✅ **节流滚动**: 优化滚动事件处理性能
- ✅ **预渲染**: 支持可配置的预渲染项目数量

## 组件结构

```
virtual-list/
├── VirtualList.tsx      # 主组件
├── types.ts            # 类型定义
├── utils.ts            # 工具函数
├── hooks.ts            # 自定义Hooks
└── index.ts            # 统一导出
```

## 使用示例

### 基础用法

```tsx
import { VirtualList } from '@/components/ui/table/atoms/virtual-list';

const MyTable = () => {
  const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  return (
    <VirtualList
      height={400}
      itemCount={data.length}
      itemSize={48}
      renderItem={({ index, style }) => (
        <div key={data[index].id} style={style}>
          {data[index].name}
        </div>
      )}
    />
  );
};
```

### 动态行高

```tsx
<VirtualList
  height={400}
  itemCount={data.length}
  itemSize={(index) => data[index].height || 48}
  estimatedItemSize={48}
  renderItem={({ index, style }) => (
    <div key={data[index].id} style={style}>
      {data[index].content}
    </div>
  )}
/>
```

### 固定表头

```tsx
<VirtualList
  height={400}
  itemCount={data.length}
  itemSize={48}
  stickyHeader={<div style={{ padding: '8px', fontWeight: 'bold' }}>表头内容</div>}
  renderItem={({ index, style }) => (
    <div key={data[index].id} style={style}>
      {data[index].name}
    </div>
  )}
/>
```

## API 参考

### VirtualList Props

| 属性                | 类型                                     | 默认值       | 描述                       |
| ------------------- | ---------------------------------------- | ------------ | -------------------------- |
| `height`            | `number`                                 | -            | 容器高度（必需）           |
| `width`             | `number`                                 | -            | 容器宽度                   |
| `itemCount`         | `number`                                 | -            | 项目总数（必需）           |
| `itemSize`          | `number \| ItemSizeGetter`               | -            | 项目尺寸或计算函数（必需） |
| `estimatedItemSize` | `number`                                 | `50`         | 预估项目尺寸               |
| `overscanCount`     | `number`                                 | `3`          | 预渲染项目数量             |
| `scrollDirection`   | `'vertical' \| 'horizontal'`             | `'vertical'` | 滚动方向                   |
| `scrollToIndex`     | `number`                                 | -            | 滚动到指定索引             |
| `scrollToAlignment` | `VirtualAlignment`                       | `'auto'`     | 滚动对齐方式               |
| `scrollOffset`      | `number`                                 | -            | 滚动偏移量                 |
| `renderItem`        | `ItemRenderer`                           | -            | 项目渲染函数（必需）       |
| `onScroll`          | `(data: ScrollEventData) => void`        | -            | 滚动事件回调               |
| `onItemsRendered`   | `(data: ItemsRenderedEventData) => void` | -            | 项目渲染回调               |
| `stickyHeader`      | `React.ReactNode`                        | -            | 固定表头内容               |
| `className`         | `string`                                 | -            | 自定义类名                 |
| `style`             | `React.CSSProperties`                    | -            | 自定义样式                 |

### 类型定义

```typescript
// 项目尺寸计算函数
type ItemSizeGetter = (index: number) => number;

// 项目渲染函数
type ItemRenderer = (props: {
  index: number;
  style: React.CSSProperties;
  isScrolling?: boolean;
}) => React.ReactNode;

// 滚动对齐方式
type VirtualAlignment = 'auto' | 'start' | 'center' | 'end';

// 滚动事件数据
interface ScrollEventData {
  scrollDirection: VirtualDirection;
  scrollOffset: number;
  scrollUpdateWasRequested: boolean;
}
```

## 性能建议

1. **合理设置预渲染数量**: `overscanCount` 建议设置为 3-10，过大会影响性能
2. **使用 React.memo**: 对渲染的项目组件使用 `React.memo` 优化
3. **避免内联函数**: `renderItem` 函数建议使用 `useCallback` 包装
4. **预估尺寸准确性**: `estimatedItemSize` 越接近实际尺寸，性能越好

## 与表格插件集成

虚拟列表组件已集成到 `VirtualScrollPlugin` 中，可通过表格插件系统使用：

```tsx
import { VirtualScrollPlugin } from '@/components/ui/table/plugins';

const tableConfig = {
  plugins: [
    {
      ...VirtualScrollPlugin,
      config: {
        enabled: true,
        threshold: 100,
        itemHeight: 48,
        overscanCount: 5,
      },
    },
  ],
};
```

## 技术实现

### 核心算法

- **二分查找**: 快速定位可见范围的起始和结束索引
- **尺寸缓存**: 缓存已测量的项目尺寸，避免重复计算
- **增量更新**: 只更新变化的部分，减少不必要的重渲染

### 性能优化

- **节流处理**: 滚动事件使用 16ms 节流，保证 60fps 流畅度
- **内存管理**: 智能清理不再需要的缓存数据
- **硬件加速**: 使用 `transform` 和 `will-change` 启用 GPU 加速
