import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as UiBarrel from '../../index';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable';

/**
 * Resizable 组件单元测试
 *
 * 📌 回归重点：`resizable` 必须能从**包根 barrel**（`src/ui/index.ts`）导出。
 *
 * ⚠️ **历史缺陷**：
 *    `src/ui/index.ts` 缺 `export * from './resizable'`，
 *    消费方 `import { ResizablePanel } from '@easbot/ui'` 直接失败。
 */
describe('Resizable', () => {
  describe('导出面回归测试', () => {
    it('应该从包根导出 ResizablePanelGroup', () => {
      expect(UiBarrel.ResizablePanelGroup).toBeDefined();
    });

    it('应该从包根导出 ResizablePanel', () => {
      expect(UiBarrel.ResizablePanel).toBeDefined();
    });

    it('应该从包根导出 ResizableHandle', () => {
      expect(UiBarrel.ResizableHandle).toBeDefined();
    });

    it('包根导出的应该是同一份实现（不是副本）', () => {
      expect(UiBarrel.ResizablePanel).toBe(ResizablePanel);
      expect(UiBarrel.ResizablePanelGroup).toBe(ResizablePanelGroup);
      expect(UiBarrel.ResizableHandle).toBe(ResizableHandle);
    });
  });

  describe('渲染测试', () => {
    it('应该渲染面板组', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右</ResizablePanel>
        </ResizablePanelGroup>,
      );
      expect(screen.getByText('左')).toBeInTheDocument();
      expect(screen.getByText('右')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('拖拽手柄应该暴露 separator 语义', () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>左</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>右</ResizablePanel>
        </ResizablePanelGroup>,
      );
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });
});
