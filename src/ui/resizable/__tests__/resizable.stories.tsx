import type { Meta, StoryObj } from '@storybook/react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'EASAI/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

// 横向拖拽面板组
export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" style={{ height: 200 }}>
      <ResizablePanel defaultSize={40}>左侧面板</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60}>右侧面板</ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// 纵向拖拽面板组
export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup orientation="vertical" style={{ height: 300 }}>
      <ResizablePanel defaultSize={50}>上面板</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>下面板</ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// 嵌套面板组合
export const NestedPanels: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" style={{ height: 240 }}>
      <ResizablePanel defaultSize={30}>左侧</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup orientation="vertical" style={{ height: '100%' }}>
          <ResizablePanel defaultSize={50}>上</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>下</ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// 不同最小/最大尺寸的面板
export const MinMax: Story = {
  render: () => (
    <ResizablePanelGroup orientation="horizontal" style={{ height: 200 }}>
      <ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
        最小20% 最大30%
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60} minSize={40} maxSize={80}>
        最小40% 最大80%
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={20}>默认</ResizablePanel>
    </ResizablePanelGroup>
  ),
};

// 暗色模式下的拖拽演示
export const DarkMode: Story = {
  render: () => (
    <div style={{ background: '#222', padding: 24 }}>
      <ResizablePanelGroup orientation="horizontal" style={{ height: 200 }}>
        <ResizablePanel defaultSize={40} style={{ color: '#fff' }}>
          左侧面板
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60} style={{ color: '#fff' }}>
          右侧面板
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

// 默认示例
export const Default: Story = {
  render: () => (
    <div style={{ height: 240, width: 480 }}>
      <ResizablePanelGroup orientation="horizontal" style={{ height: '100%' }}>
        <ResizablePanel defaultSize={50} minSize={10} maxSize={90} style={{ background: '#f6f6f6' }}>
          面板1
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={10} maxSize={90} style={{ background: '#e0e0e0' }}>
          面板2
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};
