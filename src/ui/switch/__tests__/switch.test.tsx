import { fireEvent, render } from '@testing-library/react';
import { Switch } from '../switch';
import '@testing-library/jest-dom';

describe('Switch 组件', () => {
  test('应正确切换状态', () => {
    let checked = false;
    const { container } = render(<Switch checked={checked} onCheckedChange={(val) => (checked = val)} />);

    const switchElement = container.querySelector('button');
    fireEvent.click(switchElement!);
    expect(checked).toBe(true);
  });

  test('应禁用交互', () => {
    const { container } = render(<Switch disabled />);
    const switchElement = container.querySelector('button');
    expect(switchElement).toBeDisabled();
  });

  test('应应用自定义类名', () => {
    const { container } = render(<Switch className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('应支持无障碍属性', () => {
    const { container } = render(<Switch aria-label="切换开关" />);
    expect(container.querySelector('[aria-label="切换开关"]')).toBeInTheDocument();
  });

  /**
   * unchecked 状态必须**有可见边框**
   *
   * @description
   * 历史事故：Switch 的根元素写死 `border-transparent`，
   * 而 unchecked 背景是 `--input-background`（**半透明灰**），
   * 两者叠加后在白底上**完全失去边界** ——
   * 表现为「滑块在左边时像没有边框 / 整个消失」。
   *
   * 与 Select / Input 的 `--input` 透明边框是**同一类根因**：
   * 边框颜色本身透明 → 无论背景多淡都看不出轮廓。
   */
  describe('边框可见性', () => {
    it('unchecked 状态应使用不透明边框色', () => {
      const { container } = render(<Switch checked={false} />);
      const switchElement = container.querySelector('button');

      expect(switchElement).toHaveClass('data-[state=unchecked]:border-[var(--input-border-color)]');
    });

    it('checked 状态边框保持透明（背景本身不透明，无需额外描边）', () => {
      const { container } = render(<Switch checked />);
      const switchElement = container.querySelector('button');

      expect(switchElement).toHaveClass('data-[state=checked]:border-transparent');
    });

    it('不应出现无条件的透明边框（否则 unchecked 无边界）', () => {
      const { container } = render(<Switch checked={false} />);
      const switchElement = container.querySelector('button');
      const className = switchElement?.className ?? '';

      // 基础类里的 `border-transparent` 保留（作为 checked 态默认），
      // 但**必须**同时存在 unchecked 态的不透明边框覆盖。
      expect(className).toContain('border-transparent');
      expect(className).toContain('data-[state=unchecked]:border-[var(--input-border-color)]');
    });
  });

  /**
   * **thumb 与 track 必须形成反差**
   *
   * @description
   * 缺陷经过两轮反复：
   * 1. light 态状态类缺失（源码只写了 `dark:` 版）→ light 下 thumb 恒白；
   * 2. 改用 `bg-background` 修 1 → dark 下 `--background` 是近黑，
   *    落在深色轨道上完全看不出滑块。
   *
   * 正确做法（Material Design 1「Switch」）：
   *   Dark 态 Thumb Off = Grey 400 #BDBDBD（不透明中灰），Track Off = #FFFFFF 30%。
   * 故 thumb 走**独立 token**，light / dark 由主题文件分别赋值。
   */
  describe('thumb 反差', () => {
    it('thumb 应使用 switch-thumb 语义 token', () => {
      const { container } = render(<Switch />);
      const thumb = container.querySelector('[data-slot="switch-thumb"]');

      expect(thumb).toHaveClass('bg-[var(--switch-thumb-unchecked-background)]');
      expect(thumb).toHaveClass('data-[state=checked]:bg-[var(--switch-thumb-checked-background)]');
    });

    it('thumb 不得使用 bg-background（dark 下 = 近黑，与轨道无反差）', () => {
      const { container } = render(<Switch />);
      const thumb = container.querySelector('[data-slot="switch-thumb"]');

      expect(thumb?.className).not.toMatch(/(^|\s)bg-background(\s|$)/);
    });

    it('thumb 不得使用 dark: 变体（light / dark 走同一套 token）', () => {
      const { container } = render(<Switch />);
      const thumb = container.querySelector('[data-slot="switch-thumb"]');

      expect(thumb?.className).not.toContain('dark:');
    });
  });
});
