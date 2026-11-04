# Chart 图表容器

> 基于 `recharts` 的图表容器与提示框 / 图例封装，把配置、配色与主题打通。

---

**导入**

```tsx
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@easbot/ui';
```

## 基础用法

```tsx
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@easbot/ui';

const data = [
  { name: '一月', uv: 4000, pv: 2400 },
  { name: '二月', uv: 3000, pv: 1398 },
];

export default function App() {
  return (
    <ChartContainer
      config={{
        uv: { label: '访问量', color: '#8884d8' },
        pv: { label: '页面浏览量', color: '#82ca9d' },
      }}
      className="h-[400px] w-[700px]"
    >
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
      </LineChart>
    </ChartContainer>
  );
}
```

带图例：

```tsx
import { ChartLegend, ChartLegendContent } from '@easbot/ui';

<ChartLegend content={<ChartLegendContent />} />;
```

`ChartContainerProps` / `ChartTooltipProps` / `ChartTooltipContentProps` / `ChartLegendProps` / `ChartLegendContentProps` 均为 `React.ComponentProps<typeof 对应组件>` 的类型别名 —— **无自有成员**。

> ⚠️ **props 来源说明**：`ChartContainer` / `ChartTooltip` / `ChartLegend` 分别是 `recharts` 的 `ResponsiveContainer` / `Tooltip` / `Legend` 的再封装，**图表能力（`LineChart` / `BarChart` / `AreaChart` / `XAxis` / `YAxis` 等）全部来自 `recharts`**，本库**未重新导出** `recharts` 的任何符号，需要时请自行从 `recharts` 引入。本库提供的是容器、提示框内容与图例内容三件套的样式与配置打通。

## 无障碍

- `ChartContainer` 渲染为普通 `<div>`，**不注入** `role` 与 `aria-*` 属性；图表的可访问性由 `recharts` 自身的 SVG 输出与消费方补充的说明文本承担。
- `ChartContainer` 会在根元素上写入 `data-chart="chart-<id>"` 属性，供内部注入的 `<style>` 精确匹配该实例的配色变量。
- `ChartTooltipContent` / `ChartLegendContent` 渲染为普通 `<div>`，**不注入** `role`；提示框的可见信息（系列名 + 数值）由文本承载。
- 提示框中的指示色块是纯装饰（无 `aria-hidden`，但不含可读文本）；若数据对读屏有意义，请另行提供数据表或文字摘要。
- `ChartLegendContent` 中的图例项同样是纯装饰色块 + 文本。
- 组件**不可聚焦**，不提供键盘交互。

## 注意事项

- **`src/ui` 层是纯 re-export**：`ChartContainer` / `ChartTooltip` / `ChartTooltipContent` / `ChartLegend` / `ChartLegendContent` 直接等于设计系统层 `src/design-system/components/ui/chart.tsx` 的实现；`ChartConfig` 类型也直接来自设计系统层。
- **`config` 是必填项**：`ChartContainer` 要求传入 `config`（形状为 `{ [数据键]: { label?, icon?, color? | theme? } }`），它同时充当**配色表**与**文案表** —— 提示框与图例的系列名都从 `config` 里取。
- **`color` 与 `theme` 二选一**：`ChartConfig` 的类型约束是 `{ color?: string; theme?: never } | { color?: never; theme: { light: string; dark: string } }`，即同一个数据键不能同时给两者。
- **`theme` 只支持 `light` / `dark` 两档**：组件内部定义了 `THEMES = { light: '', dark: '.dark' }`，为两套主题分别注入 `--color-<key>` 变量；没有第三档。
- **配色以 CSS 变量方式注入**：组件渲染一个内联 `<style>`，为每个带 `color` / `theme` 的配置项写入 `--color-<key>`；这些变量可直接在 `recharts` 的 `stroke` / `fill` 中使用（如 `stroke="var(--color-uv)"`）。
- **`config` 全为空时不注入样式**：若没有任何配置项带 `color` 或 `theme`，内联的 `<style>` 组件返回 `null`。
- **`ChartContainer` 内部自带一层 `ResponsiveContainer`**：因此 `children` 必须是 `recharts` 的图表元素，且容器需要确定的高度（否则图表不可见）—— 根容器默认 `aspect-video`，可用 `className` 覆盖。
- **根容器的类名里带有 recharts 内部选择器**：组件通过 `[&_.recharts-*]` 系列选择器统一设置了坐标轴文字、网格线、tooltip 光标等颜色（如 `fill-muted-foreground`、`stroke-border/50`），避免逐个图表重复配置。
- **`ChartTooltipContent` 的 `payload` / `label` 是自定义类型**：`payload` 为 `ReadonlyArray<RechartsPrimitive.TooltipPayloadEntry>`，`label` 为 `React.ReactNode`；其余属性（`formatter` / `labelFormatter` / `color` / `nameKey` / `labelKey` / `indicator` / `hideLabel` / `hideIndicator`）继承自 `recharts` 的 `Tooltip`。
- **`indicator` 决定指示样式**：`dot`（默认，小方块）/ `line`（竖线）/ `dashed`（虚线边框）。
- **单条目时标签位置会变化**：当 `payload` 只有一项且 `indicator` 不是 `dot` 时，标签会内联到条目下方（`nestLabel` 逻辑）。
- **`hideLabel` / `hideIndicator` 只影响渲染**：不影响数据来源。
- **`ChartTooltipContent` 在无激活数据时返回 `null`**：`active` 为假或 `payload` 为空时不渲染任何 DOM。
- **`ChartLegendContent` 在无 payload 时返回 `null`**。
- **数值会走 `toLocaleString()` 格式化**：提示框中的数值默认带千分位分隔符。
- **`ChartLegendContent` 的 `verticalAlign`** 支持 `top` / `bottom` / `middle`（默认 `bottom`），影响容器的上下内边距。
- **不消费本库的主题 CSS 变量**（配色由 `config` 自行提供，或走 Tailwind 语义类）。

## 导出

### 组件

| 导出名                     | 说明 |
| -------------------------- | ---- |
| `ChartConfig`              |      |
| `ChartContainer`           |      |
| `ChartContainerProps`      |      |
| `ChartLegend`              |      |
| `ChartLegendContent`       |      |
| `ChartLegendContentProps`  |      |
| `ChartLegendProps`         |      |
| `ChartTooltip`             |      |
| `ChartTooltipContent`      |      |
| `ChartTooltipContentProps` |      |
| `ChartTooltipProps`        |      |
