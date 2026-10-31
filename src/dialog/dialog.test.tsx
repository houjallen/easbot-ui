import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from '../button';

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
      // 关闭按钮通过 sr-only 文本提供可访问名
      fireEvent.click(screen.getByRole('button', { name: '关闭' }));
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
      // 注意：Radix Dialog v1.3 不输出 aria-modal，可访问性通过 role="dialog" + 焦点管理实现
      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('data-state', 'open');
      expect(dialog).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
    });
  });

  test('应支持不同尺寸', async () => {
    const { rerender } = render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>打开</Button>
        </DialogTrigger>
        <DialogContent size="sm" data-testid="content" />
      </Dialog>,
    );

    fireEvent.click(screen.getByText('打开'));
    // Tailwind v4：尺寸使用 CSS 变量任意值
    expect(await screen.findByTestId('content')).toHaveClass('max-w-[var(--dialog-sm-max-width)]');

    rerender(
      <Dialog>
        <DialogTrigger>触发</DialogTrigger>
        <DialogContent size="lg" data-testid="content" />
      </Dialog>,
    );
    expect(await screen.findByTestId('content')).toHaveClass('max-w-[var(--dialog-lg-max-width)]');
  });

  test('应支持主题切换', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>打开</Button>
        </DialogTrigger>
        <DialogContent variant="dark" data-testid="content">
          暗色主题
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByText('打开'));
    const content = await screen.findByTestId('content');
    // Tailwind v4：暗色主题使用 CSS 变量任意值
    expect(content).toHaveClass('bg-[var(--dialog-dark-bg)]');
    expect(content).toHaveClass('text-[var(--dialog-dark-fg)]');
  });
});
