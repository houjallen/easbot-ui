import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './scroll-area';
import { Textarea } from '../textarea/textarea';

const meta: Meta<typeof ScrollArea> = {
  title: 'EASAI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

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
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 50 }, (_, i) => (
          <div key={`item-${i}`} className="w-40 shrink-0 rounded-md border border-gray-200 p-4">
            <div className="text-sm">项目 {i + 1}</div>
            <div className="text-sm text-muted-foreground">这是一个可以水平滚动的项目</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const WithBorder: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">标签</h4>
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
    <ScrollArea className="h-72 w-48 [&>div>div]:!bg-blue-500 [&>div>div]:!w-3">
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
          <h3 className="mb-2 text-base font-medium">使用ScrollArea的文本区域</h3>
          <ScrollArea className="h-[200px] w-[400px] rounded-md border">
            <Textarea
              value={longText}
              className="border-none focus:ring-0 h-full"
              useScrollArea={false} // 因为已经在ScrollArea内部，所以禁用内部的ScrollArea
            />
          </ScrollArea>
        </div>

        <div>
          <h3 className="mb-2 text-base font-medium">使用内置ScrollArea的文本区域</h3>
          <Textarea value={longText} className="w-[400px] rounded-md border" useScrollArea={true} autoSize={false} maxHeight={200} />
        </div>
      </div>
    );
  },
};
