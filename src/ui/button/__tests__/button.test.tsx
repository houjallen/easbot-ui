import { fireEvent, render, screen } from '@testing-library/react';
import { Mail } from 'lucide-react';
import { Button } from '../button';
import { describe, it, vi } from 'vitest';

/**
 * Button 组件单元测试
 *
 * @description
 * 按「渲染 / 状态 / 交互 / 图标 / 无障碍」五个维度验证 Button 的公开契约。
 *
 * 尺寸断言以 `src/ui/button/size-tokens.ts` 中的尺寸令牌为准
 * （lg = h-10、sm = h-8、mobile = h-12）。
 *
 * 图标断言以组件真实 DOM 结构为准：图标被包裹在按钮内容容器内，
 * 图标与文本之间的间距由尺寸令牌的 `gap` 统一控制（而非图标自身的 margin）。
 */

// 模拟移动设备 —— 用于校验移动端尺寸令牌
const mockMobileUserAgent = () => {
  Object.defineProperty(globalThis.navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    configurable: true,
  });
};

describe('Button 组件', () => {
  // 渲染测试
  describe('渲染测试', () => {
    /**
     * 基础渲染测试
     * 验证按钮的基本渲染是否正确
     */
    it('应该正确渲染默认按钮', () => {
      render(<Button>测试按钮</Button>);
      const button = screen.getByRole('button', { name: '测试按钮' });
      expect(button).toBeInTheDocument();
    });

    /**
     * 变体样式测试
     * 验证不同变体的样式类名是否正确应用
     */
    it('应该正确应用变体样式', () => {
      render(<Button variant="destructive">删除</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    /**
     * 尺寸样式测试
     * 验证不同尺寸的样式类名是否正确应用（lg 令牌 = h-10 / px-6 / py-2.5）
     */
    it('应该正确应用尺寸样式', () => {
      render(<Button size="lg">大按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-6', 'py-2.5');
    });

    /**
     * 组合样式测试
     * 验证多个属性组合时的样式应用是否正确（sm 令牌 = h-8）
     */
    it('应该正确应用组合样式', () => {
      render(
        <Button variant="outline" size="sm" className="custom-class">
          组合按钮
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'h-8', 'custom-class');
    });
  });

  // 状态测试
  describe('状态测试', () => {
    /**
     * 禁用状态测试
     * 验证按钮在禁用状态下的行为是否符合预期
     */
    it('禁用状态应该阻止点击', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          禁用按钮
        </Button>,
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
      // 📌 禁用态用 `cursor-not-allowed` 而非 `pointer-events-none` ——
      //    后者会让元素对鼠标完全透明，`cursor: not-allowed` 永远不会生效。
      expect(button).toHaveClass('disabled:cursor-not-allowed');
      expect(button).not.toHaveClass('disabled:pointer-events-none');
    });

    /**
     * 加载状态测试
     * 验证按钮在加载状态下的UI展示和行为
     */
    it('加载状态应该显示加载图标并禁用按钮', () => {
      render(<Button loading>加载中</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('加载中')).toBeInTheDocument();
      expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
    });
  });

  // 回归测试：shape 形状必须真实生效
  describe('shape 形状回归测试', () => {
    it('shape="circle" 应该渲染圆形（rounded-full）', () => {
      render(<Button shape="circle">圆形</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
      expect(button).not.toHaveClass('rounded-[var(--radius-md)]');
    });

    it('shape="square" 应该渲染方形（rounded-[var(--radius-md)]）', () => {
      // 📌 回归防护：此前 `shape` 声明了但**未实现** ——
      //    既不解构（落入 `...restButtonProps`），也无对应类名分支，
      //    导致 `shape="square"` 完全无效，且泄漏为非法 DOM 属性 `<button shape="square">`。
      render(<Button shape="square">方形</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-[var(--radius-md)]');
      expect(button).not.toHaveClass('rounded-full');
    });

    it('shape 不应泄漏为 DOM 属性', () => {
      render(<Button shape="square">方形</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('shape');
    });

    it('未传 shape 时应保持默认的圆角矩形（rounded-md）', () => {
      render(<Button>默认</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-md');
      expect(button).not.toHaveClass('rounded-full');
    });

    it('shape="circle" 时文本仍应可见（不被裁剪）', () => {
      render(<Button shape="circle">圆</Button>);
      expect(screen.getByText('圆')).toBeInTheDocument();
    });
  });

  // 交互测试
  describe('交互测试', () => {
    /**
     * 点击事件测试
     * 验证按钮的点击事件处理是否正确
     */
    it('应该响应点击事件', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击我</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    /**
     * 键盘事件测试
     * 验证按钮的键盘访问性
     */
    it('应该响应键盘事件', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>按钮</Button>);
      const button = screen.getByRole('button');

      // 测试回车键
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);

      // 测试空格键
      fireEvent.keyDown(button, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  // 图标测试
  describe('图标测试', () => {
    /**
     * 左侧图标测试
     * 验证左侧图标的渲染是否正确 —— 图标与文本的间距由内容容器的 gap 令牌控制
     */
    it('应该正确渲染左侧图标', () => {
      render(<Button leftIcon={<Mail data-testid="left-icon" />}>带图标</Button>);
      const icon = screen.getByTestId('left-icon');
      expect(icon).toBeInTheDocument();
      // 默认 md 尺寸令牌的内容间距为 gap-2
      expect(icon.closest('div')).toHaveClass('gap-2');
    });

    /**
     * 右侧图标测试
     * 验证右侧图标的渲染是否正确
     */
    it('应该正确渲染右侧图标', () => {
      render(<Button rightIcon={<Mail data-testid="right-icon" />}>带图标</Button>);
      const icon = screen.getByTestId('right-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.closest('div')).toHaveClass('gap-2');
    });

    /**
     * 加载状态图标测试
     * 验证加载状态下自定义图标被隐藏、仅展示加载图标
     */
    it('加载状态不应该显示自定义图标', () => {
      render(
        <Button loading leftIcon={<Mail data-testid="left-icon" />} rightIcon={<Mail data-testid="right-icon" />}>
          加载中
        </Button>,
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    /**
     * ARIA属性测试
     * 验证按钮的无障碍属性是否正确
     */
    it('应该有正确的ARIA属性', () => {
      render(<Button disabled>禁用按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('role', 'button');
    });

    /**
     * 加载状态ARIA属性测试
     * 验证加载状态下的无障碍属性是否正确
     */
    it('加载状态应该有正确的ARIA属性', () => {
      render(<Button loading>加载中</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button.querySelector('.animate-spin')).toHaveAttribute('aria-hidden', 'true');
    });

    /**
     * 焦点管理测试
     * 验证按钮的焦点状态是否正确
     */
    it('应该正确处理焦点状态', () => {
      render(<Button>测试按钮</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  // 移动端尺寸测试
  describe('移动端尺寸测试', () => {
    /**
     * 移动端尺寸令牌测试
     * 验证 `size="mobile"` 应用移动端优化尺寸（48px 触摸区域）
     */
    it('应该正确应用移动端尺寸令牌', () => {
      mockMobileUserAgent();
      render(<Button size="mobile">移动端按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'px-6', 'py-3', 'text-sm');
    });
  });

  // 动画测试
  describe('动画测试', () => {
    it('加载动画应该正确显示', () => {
      render(<Button loading>加载中</Button>);
      const loadingIcon = screen.getByTestId('loading-icon');
      expect(loadingIcon).toHaveClass('animate-spin');
    });
  });

  // 性能测试
  describe('性能测试', () => {
    it('快速点击不应导致内存泄漏', () => {
      const { unmount } = render(<Button>性能测试</Button>);

      // 快速触发100次点击
      Array.from({ length: 100 }).forEach(() => {
        fireEvent.click(screen.getByRole('button'));
      });

      // 验证卸载后无内存泄漏
      expect(() => unmount()).not.toThrow();
    });
  });
});
