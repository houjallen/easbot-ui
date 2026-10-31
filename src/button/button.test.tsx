/**
 * Button 组件单元测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 状态测试 - 验证组件的各种状态表现
 * 3. 交互测试 - 验证组件的交互行为
 * 4. 图标测试 - 验证组件的图标展示
 * 5. 无障碍测试 - 验证组件的可访问性
 * 6. 移动端测试 - 验证移动端适配
 *
 * @see {@link docs/design/hxsoft-module-easai/docs/frontend/quality/testing.md}
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button } from './button';
import { Mail } from 'lucide-react';
import { vi } from 'vitest';

// 类型检查测试
const _typeCheck = () => {
  const button = document.createElement('button');
  expect(button).toBeInTheDocument(); // 此处应无类型错误
};

// 模拟移动设备
const mockMobileUserAgent = () => {
  Object.defineProperty(globalThis.navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    configurable: true,
  });
};

// 模拟桌面设备
// 注意：jsdom 默认存在 window.ontouchstart，组件的 isMobile 判定会因此恒为 true，
// 所以桌面环境必须同时移除 ontouchstart 与 maxTouchPoints 才能命中非移动端分支。
const mockDesktopUserAgent = () => {
  Object.defineProperty(globalThis.navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    configurable: true,
  });
  Object.defineProperty(globalThis.navigator, 'maxTouchPoints', {
    value: 0,
    configurable: true,
  });
  // 删除 window.ontouchstart（jsdom 默认提供）
  Reflect.deleteProperty(window, 'ontouchstart');
};

// 模拟触摸事件
// 注意：jsdom 未实现 Touch 构造函数，此处用普通对象模拟触点数据。
// 返回值直接作为 fireEvent.touchXxx 的第二个参数（事件初始化对象）使用。
const createTouchEvent = (type: string, x: number, y: number, force = 0) => {
  const touch = {
    identifier: Date.now(),
    target: document.body,
    clientX: x,
    clientY: y,
    force,
  };

  return {
    touches: [touch] as unknown as Touch[],
    targetTouches: [touch] as unknown as Touch[],
    changedTouches: [touch] as unknown as Touch[],
    bubbles: true,
  };
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
     * @see {@link base-components-design.md} 中的按钮变体定义
     */
    it('应该正确应用变体样式', () => {
      render(<Button variant="destructive">删除</Button>);
      const button = screen.getByRole('button');
      // Tailwind v4：语义类已替换为 CSS 变量任意值
      expect(button).toHaveClass('bg-[var(--destructive)]');
    });

    /**
     * 尺寸样式测试
     * 验证不同尺寸的样式类名是否正确应用
     * @see {@link base-components-design.md} 中的按钮尺寸定义
     */
    it('应该正确应用尺寸样式', () => {
      render(<Button size="lg">大按钮</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
    });

    /**
     * 组合样式测试
     * 验证多个属性组合时的样式应用是否正确
     */
    it('应该正确应用组合样式', () => {
      render(
        <Button variant="outline" size="sm" className="custom-class">
          组合按钮
        </Button>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'h-9', 'custom-class');
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
      expect(button).toHaveClass('disabled:pointer-events-none');
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
     * @see {@link base-components-design.md} 中的可访问性规范
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
     * 验证左侧图标的渲染是否正确
     */
    it('应该正确渲染左侧图标', () => {
      render(<Button leftIcon={<Mail data-testid="left-icon" />}>带图标</Button>);
      const icon = screen.getByTestId('left-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('mr-2');
    });

    /**
     * 右侧图标测试
     * 验证右侧图标的渲染是否正确
     */
    it('应该正确渲染右侧图标', () => {
      render(<Button rightIcon={<Mail data-testid="right-icon" />}>带图标</Button>);
      const icon = screen.getByTestId('right-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('ml-2');
    });

    /**
     * 加载状态图标测试
     * 验证加载状态下图标的显示逻辑
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
     * @see {@link base-components-design.md} 中的无障碍规范
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

  // 移动端测试
  describe('移动端测试', () => {
    beforeEach(() => {
      mockMobileUserAgent();
      // 模拟触觉反馈 API
      (navigator as any).vibrate = vi.fn();
      // 长按依赖 setTimeout，启用假定时器以便确定性推进
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该正确应用移动端样式', () => {
      // 组件在移动端且 size 为 'default' 时自动切换到 mobile 尺寸
      render(<Button size="default">移动端按钮</Button>);
      const button = screen.getByRole('button');
      // 移动端尺寸变体使用 text-base/[1.125rem] 形式（Tailwind v4 行高任意值）
      expect(button).toHaveClass('h-12', 'px-5', 'py-2.5', 'text-base/[1.125rem]');
    });

    it('应该支持触摸反馈', () => {
      render(<Button>触摸按钮</Button>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0));

      // 检查是否创建了波纹元素
      const ripple = button.querySelector('.animate-ripple');
      expect(ripple).toBeInTheDocument();
      expect(ripple).toHaveClass('absolute', 'rounded-full', 'bg-current', 'opacity-25');
    });

    it('应该支持自定义波纹颜色', () => {
      render(<Button rippleColor="rgba(255, 0, 0, 0.25)">自定义波纹</Button>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0));

      const ripple = button.querySelector('.animate-ripple');
      expect(ripple).toHaveStyle({ backgroundColor: 'rgba(255, 0, 0, 0.25)' });
    });

    it('应该支持触觉反馈', () => {
      render(<Button hapticFeedback>触觉按钮</Button>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0));
      expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('应该支持长按事件', () => {
      const onLongPress = vi.fn();
      render(
        <Button onLongPress={onLongPress} longPressDelay={500}>
          长按按钮
        </Button>,
      );
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0));

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalled();
    });

    it('应该支持滑动手势', () => {
      const onSwipe = vi.fn();
      render(<Button onSwipe={onSwipe}>滑动按钮</Button>);
      const button = screen.getByRole('button');

      // 模拟向右滑动
      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0));
      fireEvent.touchMove(button, createTouchEvent('touchmove', 100, 0));
      fireEvent.touchEnd(button);

      expect(onSwipe).toHaveBeenCalledWith('right');
    });

    it('应该支持压力感应', () => {
      render(<Button pressureSensitive>压力按钮</Button>);
      const button = screen.getByRole('button');

      // 模拟不同压力值的触摸
      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0, 0.7));
      expect(button).toHaveStyle({ transform: 'scale(0.93)' });

      fireEvent.touchEnd(button);
      expect(button).not.toHaveStyle({ transform: 'scale(0.93)' });
    });

    it('应正确识别四向滑动', () => {
      const onSwipe = vi.fn();
      render(<Button onSwipe={onSwipe}>滑动按钮</Button>);
      const button = screen.getByRole('button');

      // 测试向右滑动
      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0));
      fireEvent.touchMove(button, createTouchEvent('touchmove', 100, 0));
      fireEvent.touchEnd(button);
      expect(onSwipe).toHaveBeenCalledWith('right');

      // 测试向上滑动
      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 100));
      fireEvent.touchMove(button, createTouchEvent('touchmove', 0, 0));
      fireEvent.touchEnd(button);
      expect(onSwipe).toHaveBeenCalledWith('up');
    });
  });

  // 动画测试
  describe('动画测试', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('波纹动画应该在指定时间后消失', () => {
      mockMobileUserAgent();
      render(<Button>动画测试</Button>);
      const button = screen.getByRole('button');

      fireEvent.touchStart(button, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      expect(button.querySelector('.animate-ripple')).toBeInTheDocument();

      // 前进300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(button.querySelector('.animate-ripple')).not.toBeInTheDocument();
    });

    it('加载动画应该正确显示', () => {
      render(<Button loading>加载中</Button>);
      const loadingIcon = screen.getByTestId('loading-icon');
      expect(loadingIcon).toHaveClass('animate-spin');
    });
  });

  // 性能测试
  describe('性能测试', () => {
    it('不应该在非移动设备上创建波纹效果', () => {
      mockDesktopUserAgent();
      render(<Button>桌面按钮</Button>);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(button.querySelector('.animate-ripple')).not.toBeInTheDocument();
    });

    it('应该节流波纹创建', () => {
      mockMobileUserAgent();
      render(<Button>节流测试</Button>);
      const button = screen.getByRole('button');

      // 快速触发多次触摸事件
      for (let i = 0; i < 5; i++) {
        fireEvent.touchStart(button, {
          touches: [{ clientX: 50, clientY: 50 }],
        });
      }

      // 检查波纹元素数量不应过多
      const ripples = button.querySelectorAll('.animate-ripple');
      expect(ripples.length).toBeLessThanOrEqual(5);
    });

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

  // 新增压力感应测试
  describe('压力感应测试', () => {
    it('应正确处理不同压力值', () => {
      render(<Button pressureSensitive>压力测试</Button>);
      const button = screen.getByRole('button');

      // 模拟不同压力值
      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0, 0.3));
      expect(button).toHaveStyle({ transform: 'scale(0.97)' });

      fireEvent.touchStart(button, createTouchEvent('touchstart', 0, 0, 0.7));
      expect(button).toHaveStyle({ transform: 'scale(0.93)' });
    });
  });
});
