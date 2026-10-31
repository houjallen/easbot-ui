import { render, screen, fireEvent } from '@testing-library/react';
import { Command, CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem } from './command';

// jsdom 未实现 ResizeObserver，而 cmdk 依赖它来测量列表尺寸，
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

// jsdom 未实现 Element.scrollIntoView，而 cmdk 在渲染选中项时会调用它
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView(): void {
    // jsdom 无滚动容器，空实现即可
  };
}

describe('Command 组件', () => {
  describe('基础功能', () => {
    it('应正确渲染输入框', () => {
      // 注意：cmdk 的 CommandInput 必须位于 Command 根组件内（依赖其 store 上下文）
      render(
        <Command>
          <CommandInput placeholder="搜索..." />
        </Command>,
      );
      expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
    });

    it('应显示加载状态', () => {
      render(
        <CommandDialog open loading>
          <CommandInput />
        </CommandDialog>,
      );
      // 加载态使用 Spinner 组件，其无障碍角色为 status
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应过滤命令项', async () => {
      render(
        <Command>
          <CommandInput />
          <CommandList>
            <CommandGroup heading="测试">
              <CommandItem>苹果</CommandItem>
              <CommandItem>香蕉</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>,
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: '苹果' } });
      expect(screen.getByText('苹果')).toBeVisible();
      expect(screen.queryByText('香蕉')).not.toBeInTheDocument();
    });
  });

  test('应支持加载状态显示', () => {
    render(
      <CommandDialog open loading>
        <CommandInput />
      </CommandDialog>,
    );
    // 加载态使用 Spinner 组件，其无障碍角色为 status
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('应正确过滤命令项', async () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandGroup heading="测试">
            <CommandItem>苹果</CommandItem>
            <CommandItem>香蕉</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '苹果' } });
    expect(screen.getByText('苹果')).toBeVisible();
    expect(screen.queryByText('香蕉')).not.toBeInTheDocument();
  });
});
