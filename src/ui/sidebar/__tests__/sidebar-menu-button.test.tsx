import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '../sidebar';

/**
 * Sidebar 样式回归测试
 *
 * 📌 回归重点：`outline` 变体的 1px 描边必须**真的生效**。
 *
 * ⚠️ **历史缺陷**：
 *    `design-system/components/ui/sidebar.tsx` 的 `outline` variant 写成
 *    `shadow-[0_0_0_1px_hsl(var(--sidebar-border))]`，
 *    而 `--sidebar-border` 本身**已经是完整颜色值**（`hsl(240 4% 90%)`），
 *    嵌套 `hsl()` 是非法 CSS 颜色函数 → 浏览器直接丢弃该 `box-shadow` 声明 → 描边失效。
 *
 * 📌 **断言方式**：jsdom 不解析 Tailwind 任意值里的 CSS 变量，
 *    所以这里断言**类名本身**不含嵌套 `hsl(` 包装 —— 那才是根因所在。
 */
describe('Sidebar 菜单按钮样式', () => {
  describe('outline 变体描边', () => {
    it('不应该用 hsl() 包裹已经是完整颜色值的 CSS 变量', () => {
      render(
        <SidebarProvider>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline">项目</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarProvider>,
      );

      const button = screen.getByRole('button', { name: '项目' });
      const className = button.className;

      // 📌 根因断言：不得出现 `hsl(var(--sidebar-*))` 这种嵌套写法
      expect(className).not.toMatch(/hsl\(var\(--sidebar-/);
      // 📌 应当直接引用变量
      expect(className).toContain('var(--sidebar-border)');
    });

    it('hover 态描边也不应该嵌套 hsl()', () => {
      render(
        <SidebarProvider>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline">项目</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarProvider>,
      );

      const className = screen.getByRole('button', { name: '项目' }).className;
      expect(className).not.toMatch(/hsl\(var\(--sidebar-accent\)\)/);
    });
  });

  describe('default 变体', () => {
    it('应该正常渲染', () => {
      render(
        <SidebarProvider>
          <SidebarMenuItem>
            <SidebarMenuButton>默认项</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarProvider>,
      );
      expect(screen.getByRole('button', { name: '默认项' })).toBeInTheDocument();
    });
  });
});
