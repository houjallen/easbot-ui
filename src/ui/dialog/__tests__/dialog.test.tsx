import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '../../button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../dialog';

describe('Dialog 组件', () => {
  describe('基础功能', () => {
    it('应正确渲染对话框内容', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>打开</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>测试标题</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('测试标题')).toBeVisible();
    });
  });

  describe('交互测试', () => {
    it('应支持关闭对话框', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>打开</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>可关闭测试</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      const dialog = await screen.findByRole('dialog');
      // 关闭按钮通过 `sr-only` 文本提供可访问名（见 design-system/dialog.tsx）
      fireEvent.click(screen.getByText('关闭'));
      expect(dialog).not.toBeVisible();
    });
  });

  describe('无障碍测试', () => {
    it('应有正确的ARIA属性', async () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>打开</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>无障碍测试</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      fireEvent.click(screen.getByText('打开'));
      const dialog = await screen.findByRole('dialog');
      // Radix Dialog 不设置 `aria-modal`（焦点陷阱由 `aria-hidden` + focus scope 实现），
      // 对话框容器通过 `role="dialog"` + `aria-labelledby` 表达语义
      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      // 关闭按钮的可访问名来自 `sr-only` 文本
      expect(screen.getByText('关闭')).toBeInTheDocument();
    });
  });

  test('应支持不同尺寸', async () => {
    const { rerender } = render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>打开</Button>
        </DialogTrigger>
        <DialogContent data-testid="content" />
      </Dialog>,
    );

    fireEvent.click(screen.getByText('打开'));
    // 默认尺寸来自 design-system 的 `sm:max-w-lg`
    expect(await screen.findByTestId('content')).toHaveClass('sm:max-w-lg');

    rerender(
      <Dialog>
        <DialogTrigger>触发</DialogTrigger>
        <DialogContent data-testid="content" className="sm:max-w-3xl" />
      </Dialog>,
    );
    expect(await screen.findByTestId('content')).toHaveClass('sm:max-w-3xl');
  });

  test('应支持主题切换', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>打开</Button>
        </DialogTrigger>
        <DialogContent data-testid="content">暗色主题</DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('打开'));
    const content = await screen.findByTestId('content');
    // 内容区使用语义化主题变量（`bg-background` / `text-foreground`），
    // 具体明暗由 `.dark` 类切换 —— 不再写死 `bg-gray-800` 这类硬编码色值
    expect(content).toHaveClass('bg-background');
  });
});
