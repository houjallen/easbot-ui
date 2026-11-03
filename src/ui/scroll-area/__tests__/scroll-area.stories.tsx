import { Textarea } from '../../textarea';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from '../scroll-area';

const meta = {
  title: 'EASAI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const tags = Array.from({ length: 50 }).map((_, i, a) => `标签 ${i + 1}`);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border p-4">
      <div className="space-y-4">
        {tags.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => {
    const items = Array.from({ length: 50 }, (_, i) => (
      <div key={`item-${i}`} className="w-40 shrink-0 rounded-md border border-gray-200 p-4">
        <div className="text-sm">项目 {i + 1}</div>
        <div className="text-muted-foreground text-sm">这是一个可以水平滚动的项目</div>
      </div>
    ));

    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-2 font-medium text-base">水平滚动 (withHorizontalScrollbar=false - 默认)</h3>
          <p className="mb-2 text-muted-foreground text-sm">内容溢出时，Radix UI 底层可能处理滚动，但 eas-ui-next 不会主动渲染带样式的水平滚动条。</p>
          <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">{items}</div>
          </ScrollArea>
        </div>
        <div>
          <h3 className="mb-2 font-medium text-base">水平滚动 (withHorizontalScrollbar=true)</h3>
          <p className="mb-2 text-muted-foreground text-sm">eas-ui-next 主动渲染带 design-system 样式的水平滚动条。</p>
          <ScrollArea className="w-96 whitespace-nowrap rounded-md border" withHorizontalScrollbar={true}>
            <div className="flex w-max space-x-4 p-4">{items}</div>
          </ScrollArea>
        </div>
      </div>
    );
  },
};

export const WithBorder: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 font-medium text-sm leading-none">标签</h4>
        {tags.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
  },
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border border-gray-700 bg-gray-800">
      <div className="p-4 text-gray-100">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm">
            暗色主题项 {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const CustomScrollbar: Story = {
  render: () => (
    <ScrollArea className="[&>div>div]:!bg-blue-500 [&>div>div]:!w-3 h-72 w-48">
      <div className="space-y-4 p-4">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm">
            自定义滚动条项 {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

// 添加带有文本区域的滚动示例
export const WithTextarea: Story = {
  render: () => {
    const longText = Array.from({ length: 20 })
      .map((_, i) => `这是第 ${i + 1} 段文本内容，用于测试文本区域的滚动效果。这段文本足够长，可以触发滚动条的显示。我们希望只有垂直方向的滚动条，而没有水平方向的滚动条。`)
      .join('\n\n');

    return (
      <div className="space-y-8">
        <div>
          <h3 className="mb-2 font-medium text-base">使用ScrollArea的文本区域</h3>
          <ScrollArea className="h-[200px] w-[400px] rounded-md border">
            <Textarea value={longText} className="h-full border-none focus:ring-0" />
          </ScrollArea>
        </div>

        <div>
          <h3 className="mb-2 font-medium text-base">使用内置ScrollArea的文本区域</h3>
          <Textarea value={longText} className="w-[400px] rounded-md border" />
        </div>
      </div>
    );
  },
};
