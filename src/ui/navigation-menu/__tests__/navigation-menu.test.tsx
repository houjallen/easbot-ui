import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from '../navigation-menu';

/**
 * NavigationMenu 组件测试
 *
 * @description
 * NavigationMenu 的子菜单由 Radix `onPointerDown` 路径展开，
 * 因此使用 `@testing-library/user-event` 的 `user.click` 打开菜单；
 * 键盘导航同样走 `user.keyboard`，保证事件序列与真实浏览器一致。
 */
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
    const user = userEvent.setup();
    render(
      <NavigationMenu>
        <NavigationMenuItem>
          <NavigationMenuTrigger>产品</NavigationMenuTrigger>
          <NavigationMenuContent data-testid="content">
            <ul>
              <li>功能列表</li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenu>,
    );

    await user.click(screen.getByText('产品'));
    expect(await screen.findByTestId('content')).toBeVisible();
  });

  test('应处理键盘导航', async () => {
    const user = userEvent.setup();
    render(
      <NavigationMenu>
        <NavigationMenuItem>
          <NavigationMenuTrigger>帮助</NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenu>,
    );

    const trigger = screen.getByText('帮助');
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('data-state', 'open');
  });
});
