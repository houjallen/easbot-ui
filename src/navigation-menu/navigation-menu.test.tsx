import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuList } from './navigation-menu';

// jsdom 未实现 ResizeObserver，而 Radix NavigationMenu 的 Viewport 依赖它来测量尺寸，
// 因此在测试文件内局部补充一个最小可用的 polyfill。
class ResizeObserverStub implements ResizeObserver {
  observe(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  unobserve(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  disconnect(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);

describe('NavigationMenu 组件', () => {
  test('应正确渲染菜单项', () => {
    render(
      <NavigationMenu>
        <NavigationMenuItem>
          <NavigationMenuTrigger>文档</NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenu>,
    );
    expect(screen.getByText('文档')).toBeInTheDocument();
  });

  test('应展开子菜单', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="content">
              <ul>
                <li>功能列表</li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    // Radix NavigationMenuTrigger 通过 onClick（onItemSelect）切换展开状态
    fireEvent.click(screen.getByText('产品'));
    expect(await screen.findByTestId('content')).toBeVisible();
  });

  test('应处理键盘导航', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>帮助</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByText('帮助');
    // 展开后 trigger 上会带 data-state="open"
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-state', 'open');
    });

    // 展开状态下按 ArrowDown 可进入内容区（entry key）
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
