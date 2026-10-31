import { render, screen, fireEvent } from '@testing-library/react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from './menubar';

describe('Menubar 组件', () => {
  test('应正确渲染菜单项', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>文件</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>新建</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByText('文件')).toBeInTheDocument();
  });

  test('应展开子菜单', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>编辑</MenubarTrigger>
          <MenubarContent data-testid="content">
            <MenubarItem>复制</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    // Radix MenubarTrigger 通过 onPointerDown（button === 0）展开菜单
    fireEvent.pointerDown(screen.getByText('编辑'), { button: 0, ctrlKey: false });
    expect(await screen.findByTestId('content')).toBeVisible();
  });

  test('应处理禁用状态', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>设置</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled>禁用项</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    // 注意：MenubarContent 只有在菜单展开后才会挂载，因此需要先展开菜单
    fireEvent.pointerDown(screen.getByText('设置'), { button: 0, ctrlKey: false });

    const item = await screen.findByText('禁用项');
    expect(item).toHaveAttribute('data-disabled');
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });
});
