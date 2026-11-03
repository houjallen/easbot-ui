import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../design-system/components/ui/resizable';
import React from 'react';

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

// 类型导出，便于 IDE 智能提示
export type ResizablePanelGroupProps = React.ComponentProps<typeof ResizablePanelGroup>;
export type ResizablePanelProps = React.ComponentProps<typeof ResizablePanel>;
export type ResizableHandleProps = React.ComponentProps<typeof ResizableHandle>;
