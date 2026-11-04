# Carousel 轮播

> 基于 `embla-carousel-react` 的轮播容器，支持横向 / 纵向滑动、指示器与自定义导航。

---

**导入**

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@easbot/ui';
```

## 基础用法

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@easbot/ui';

export default function App() {
  return (
    <div className="w-full max-w-2xl">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              幻灯片 1
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              幻灯片 2
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
```

纵向轮播：

```tsx
<div className="h-[400px] w-64">
  <Carousel orientation="vertical">
    <CarouselContent>
      <CarouselItem>
        <div className="flex h-full items-center justify-center rounded-lg bg-muted">幻灯片 1</div>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</div>
```

通过 `setApi` 获取 Embla 实例以驱动指示器：

```tsx
import { useState } from 'react';
import type { CarouselApi } from '@easbot/ui';

const [api, setApi] = useState<CarouselApi>();

<Carousel setApi={setApi}>{/* ... */}</Carousel>;
```

`CarouselProps` / `CarouselContentProps` / `CarouselItemProps` / `CarouselPreviousProps` / `CarouselNextProps` 均为 `React.ComponentProps<typeof 对应组件>` 的类型别名 —— **无自有成员**。

> ⚠️ **props 来源说明**：`Carousel` 的核心能力来自第三方库 **`embla-carousel-react`**，`opts`（Embla 选项，如 `loop` / `align` / `slidesToScroll` / `dragFree`）、`plugins`（Embla 插件）以及 `setApi`（拿到 Embla 实例）均直接对应 Embla 的 API；`CarouselPrevious` / `CarouselNext` 的 `variant` / `size` 来自本库设计系统层的 `Button`。本库**未新增**任何自有属性，具体语义请参考 [`embla-carousel` 官方文档](https://www.embla-carousel.com/get-started/)。

## 无障碍

- 根容器渲染为 `<section role="region">`，并注入 `aria-roledescription`（走内置 `carousel` 文案域，zh-CN「轮播图」/ en-US `carousel`）。源码注释说明：`section` 无隐式角色，需显式声明 `role="region"` 以支持 `aria-roledescription`。
- `CarouselItem` 渲染为 `<div role="group">`，并注入 `aria-roledescription`（zh-CN「幻灯片」/ en-US `slide`）。
- 导航按钮是设计系统层的 `Button`（原生 `<button>`），内部带 `sr-only` 的文本：zh-CN「上一张幻灯片」/「下一张幻灯片」，en-US `Previous slide` / `Next slide`。
- 到达首 / 末张时，对应的导航按钮被 `disabled`，元素不可聚焦，屏幕阅读器播报「不可用」。
- 键盘操作：根容器监听 `ArrowLeft` / `ArrowRight` 切换上一张 / 下一张（纵向时也生效）。
- 导航按钮内的箭头图标由 `Button` 组件统一设为 `size-4` 且 `pointer-events-none`，是纯装饰。

## 注意事项

- **`src/ui` 层做了 i18n 透传**：`Carousel` / `CarouselItem` / `CarouselPrevious` / `CarouselNext` 是薄封装，把 `locale` / `messages` 透传给设计系统层；`CarouselContent` 是纯 re-export。
- **`orientation` 会被翻译成 Embla 的 `axis`**：`horizontal` → `axis: 'x'`，`vertical` → `axis: 'y'`；即使 `opts` 里传了 `axis`，也会被 `orientation` 覆盖。
- **`opts` 的展开顺序**：`{...opts, axis}` —— 传入的 `opts` 会被展开后再覆盖 `axis`，因此 `opts` 中的其他项（`loop` / `align` / `slidesToScroll` 等）正常生效。
- **根容器渲染的是 `<section>` 而不是 `<div>`**：因此 `role="region"` 是显式声明的；`className` 合并到末位（`relative` 为基础类）。
- **`CarouselContent` 渲染两层 div**：外层 `overflow-hidden` 承载 Embla 的 ref，内层是 `flex` 容器；横向时内层带 `-ml-4`，纵向时带 `-mt-4 flex-col` —— 与 `CarouselItem` 的 `pl-4` / `pt-4` 配对形成间距。
- **`CarouselItem` 独占整屏宽度**：基础类为 `min-w-0 shrink-0 grow-0 basis-full`。
- **导航按钮是绝对定位的**：横向时位于左右两侧（`-left-12` / `-right-12`），纵向时位于上下两侧（`-top-12` / `-bottom-12`）并旋转 90°；需要更靠近内容请用 `className` 覆盖。
- **导航按钮默认样式是 `outline` + `icon`**：`variant="outline"`、`size="icon"`（`size-8` 圆形），可自行覆盖。
- **`canScrollPrev` / `canScrollNext` 依赖 Embla 事件**：组件订阅 `select` 与 `reInit` 事件来更新按钮禁用态。
- **卸载时只解绑了 `select`**：清理函数中调用了 `api.off('select', onSelect)`，**没有**解绑 `reInit` —— 多次挂载 / 卸载时 `reInit` 监听会残留，属源码现状。
- **内置文案只有四条**：`prevSlide` / `nextSlide` / `carouselRoleDescription` / `slideRoleDescription`，均来自内置 `carousel` 文案域，可通过 `messages` 覆盖。
- **不消费任何主题 CSS 变量。**

## 导出

### 组件

| 导出名                  | 说明 |
| ----------------------- | ---- |
| `Carousel`              |      |
| `CarouselApi`           |      |
| `CarouselContent`       |      |
| `CarouselContentProps`  |      |
| `CarouselItem`          |      |
| `CarouselItemProps`     |      |
| `CarouselNext`          |      |
| `CarouselNextProps`     |      |
| `CarouselPrevious`      |      |
| `CarouselPreviousProps` |      |
| `CarouselProps`         |      |
