/**
 * Switch 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能与类名
 * 2. 状态测试 - 验证开启/关闭状态、禁用态
 * 3. 交互测试 - 验证点击与键盘触发的状态切换与回调
 * 4. 无障碍测试 - 验证 switch 语义角色、aria-checked、焦点管理
 * 5. 边界测试 - 验证受控模式、透传属性、thumb 渲染
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Switch } from '../switch';

describe('Switch 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染开关', () => {
      render(<Switch aria-label="通知开关" />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute('data-slot', 'switch');
    });

    it('应该正确应用默认类名', () => {
      render(<Switch aria-label="通知开关" />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      expect(switchElement).toHaveClass('inline-flex');
      expect(switchElement).toHaveClass('w-8');
      expect(switchElement).toHaveClass('rounded-full');
      expect(switchElement).toHaveClass('border');
    });

    it('应该正确渲染滑块元素', () => {
      render(<Switch aria-label="通知开关" />);

      expect(screen.getByRole('switch', { name: '通知开关' }).querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(<Switch aria-label="通知开关" className="custom-class" />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      expect(switchElement).toHaveClass('custom-class');
      expect(switchElement).toHaveClass('w-8');
    });
  });

  describe('状态测试', () => {
    it('应该默认渲染为关闭状态', () => {
      render(<Switch aria-label="通知开关" />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('应该在受控开启状态下渲染 data-state 为 checked', () => {
      render(<Switch aria-label="通知开关" checked />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      expect(switchElement).toHaveAttribute('data-state', 'checked');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在禁用状态下渲染 data-disabled 与 disabled 属性', () => {
      render(<Switch aria-label="通知开关" disabled />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      expect(switchElement).toBeDisabled();
      expect(switchElement).toHaveAttribute('data-disabled');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('应该在关闭状态下应用 data-[state=unchecked] 状态类名', () => {
      render(<Switch aria-label="通知开关" />);

      // 📌 走 `--switch-unchecked-background` 语义 token ——
      //    该 token 指向 `--input-background`（淡灰背景）。
      //    ⚠️ 不能是 `--input`（已改为不透明**边框色**）——
      //    否则 unchecked 轨道会变成实心边框色，视觉过重。
      expect(screen.getByRole('switch', { name: '通知开关' })).toHaveClass('data-[state=unchecked]:bg-[var(--switch-unchecked-background)]');
    });

    it('应该在关闭状态下应用不透明边框（否则控件在白底上失去边界）', () => {
      render(<Switch aria-label="通知开关" />);

      // 📌 unchecked 背景是**半透明**灰，
      //    若边框也是 `transparent` → 完全没有轮廓（表现为「边框消失」）。
      //    与 Select / Input 的 `--input` 透明边框属同一类根因。
      expect(screen.getByRole('switch', { name: '通知开关' })).toHaveClass('data-[state=unchecked]:border-[var(--input-border-color)]');
    });

    it('应该在开启状态下保持透明边框（背景不透明，无需额外描边）', () => {
      render(<Switch aria-label="通知开关" checked />);

      expect(screen.getByRole('switch', { name: '通知开关' })).toHaveClass('data-[state=checked]:border-transparent');
    });

    it('轨道配色应走 switch 语义 token（light / dark 同一套，无需 dark: 变体）', () => {
      render(<Switch aria-label="通知开关" />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });

      expect(switchElement).toHaveClass('data-[state=checked]:bg-[var(--switch-checked-background)]');
      expect(switchElement).toHaveClass('data-[state=unchecked]:bg-[var(--switch-unchecked-background)]');
    });

    /**
     * **thumb 与 track 必须形成反差**
     *
     * @description
     * 历史缺陷（两轮）：
     * 1. light 态的状态类**缺失** —— 源码只写了 `dark:data-[state=checked]:bg-primary-foreground`，
     *    light 下 thumb 恒为 `bg-background`（白），checked 态（近黑轨道）反差不足。
     * 2. 改用 `bg-background` 修 1 后，**dark 下反而更糟** ——
     *    `--background` 在 dark 是近黑，落在深色轨道上完全看不出滑块。
     *
     * 正确做法（Material Design 1「Switch」）：
     *   Dark 态 Thumb Off = Grey 400 #BDBDBD（**不透明中灰**）
     *   Track Off = #FFFFFF 30%（半透明）
     *   → 靠「实心 thumb + 半透明 track」拉开层次，两种主题都清晰。
     *
     * 故 thumb 配色必须走**独立 token**（`--switch-thumb-*`），
     * 由 light.css / dark.css 分别赋值，组件侧**不得**使用 `bg-background`。
     */
    it('thumb 配色应使用 switch-thumb 语义 token（不得用 bg-background）', () => {
      render(<Switch aria-label="通知开关" />);

      const thumb = screen.getByRole('switch', { name: '通知开关' }).querySelector('[data-slot="switch-thumb"]');

      expect(thumb).not.toBeNull();
      // unchecked thumb：不透明中灰 token
      expect(thumb).toHaveClass('bg-[var(--switch-thumb-unchecked-background)]');
      // checked thumb：与 primary 互为反色
      expect(thumb).toHaveClass('data-[state=checked]:bg-[var(--switch-thumb-checked-background)]');
      // ⚠️ 不得回退到 bg-background（dark 下 = 近黑，与轨道糊在一起）
      expect(thumb?.className).not.toMatch(/(^|\s)bg-background(\s|$)/);
    });

    it('thumb 不应依赖 dark: 变体（避免再次只写 dark 版）', () => {
      render(<Switch aria-label="通知开关" />);

      const thumb = screen.getByRole('switch', { name: '通知开关' }).querySelector('[data-slot="switch-thumb"]');
      const className = thumb?.className ?? '';

      // 📌 light / dark 走**同一套 token**，差异由主题文件承担。
      expect(className).not.toContain('dark:');
    });

    it('应该在开启状态下应用 data-[state=checked] 状态类名', () => {
      render(<Switch aria-label="通知开关" checked />);

      // 📌 走 `--switch-checked-background` 语义 token（= `--primary`）。
      expect(screen.getByRole('switch', { name: '通知开关' })).toHaveClass('data-[state=checked]:bg-[var(--switch-checked-background)]');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 checked 变更回调', () => {
      const handleCheckedChange = vi.fn();
      render(<Switch aria-label="通知开关" onCheckedChange={handleCheckedChange} />);

      fireEvent.click(screen.getByRole('switch', { name: '通知开关' }));

      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('应该在点击后更新开关状态', () => {
      render(<Switch aria-label="通知开关" />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      fireEvent.click(switchElement);

      expect(switchElement).toHaveAttribute('data-state', 'checked');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('应该在再次点击时切回关闭状态', () => {
      const handleCheckedChange = vi.fn();
      render(<Switch aria-label="通知开关" onCheckedChange={handleCheckedChange} />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      fireEvent.click(switchElement);
      fireEvent.click(switchElement);

      expect(handleCheckedChange).toHaveBeenCalledTimes(2);
      expect(handleCheckedChange).toHaveBeenLastCalledWith(false);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('应该在按下空格键时切换开关状态', () => {
      const handleCheckedChange = vi.fn();
      render(<Switch aria-label="通知开关" onCheckedChange={handleCheckedChange} />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      switchElement.focus();
      // Radix 的 Switch 只监听 `click`；真实浏览器在空格键上会合成 click 事件，
      // jsdom 不会合成，因此这里显式模拟浏览器的行为。
      fireEvent.keyDown(switchElement, { key: ' ', code: 'Space' });
      fireEvent.click(switchElement);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it('应该在禁用状态下不触发回调', () => {
      const handleCheckedChange = vi.fn();
      render(<Switch aria-label="通知开关" disabled onCheckedChange={handleCheckedChange} />);

      fireEvent.click(screen.getByRole('switch', { name: '通知开关' }));
      expect(handleCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('无障碍测试', () => {
    it('应该暴露 switch 语义角色', () => {
      render(<Switch aria-label="通知开关" />);

      expect(screen.getByRole('switch', { name: '通知开关' })).toBeInTheDocument();
    });

    it('应该通过 aria-checked 暴露开关状态', () => {
      render(<Switch aria-label="通知开关" checked />);

      expect(screen.getByRole('switch', { name: '通知开关' })).toHaveAttribute('aria-checked', 'true');
    });

    it('应该支持通过键盘获得焦点', () => {
      render(<Switch aria-label="通知开关" />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      switchElement.focus();
      expect(switchElement).toHaveFocus();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Switch aria-label="邮件通知" />);

      expect(screen.getByRole('switch', { name: '邮件通知' })).toBeInTheDocument();
    });

    it('应该透传 name 与 value 属性', () => {
      const { container } = render(
        <form>
          <Switch aria-label="通知开关" name="notify" value="on" />
        </form>,
      );

      // Radix 只在**表单控件场景**（位于 <form> 内）才渲染隐藏的原生
      // <input type="checkbox"> 用于表单提交；value 则同时透传到可访问性主体（button）。
      const hiddenInput = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(hiddenInput).toHaveAttribute('name', 'notify');

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      expect(switchElement).toHaveAttribute('value', 'on');
    });
  });

  describe('边界测试', () => {
    it('应该在受控模式下保持外部传入的状态', () => {
      const handleCheckedChange = vi.fn();
      render(<Switch aria-label="通知开关" checked={false} onCheckedChange={handleCheckedChange} />);

      const switchElement = screen.getByRole('switch', { name: '通知开关' });
      fireEvent.click(switchElement);

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
      // 受控模式下状态由外部决定，组件本身不会自行变更
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('应该透传额外的 data-* 属性', () => {
      render(<Switch aria-label="通知开关" data-custom="value" />);

      expect(screen.getByRole('switch', { name: '通知开关' })).toHaveAttribute('data-custom', 'value');
    });

    it('应该透传 required 必填属性', () => {
      const { container } = render(
        <form>
          <Switch aria-label="通知开关" required />
        </form>,
      );

      // required 在 Radix 中落在隐藏的原生输入框上，
      // 可访问性主体通过 `aria-required` 暴露必填语义。
      const hiddenInput = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(hiddenInput).toBeRequired();

      expect(screen.getByRole('switch', { name: '通知开关' })).toHaveAttribute('aria-required', 'true');
    });
  });
});
