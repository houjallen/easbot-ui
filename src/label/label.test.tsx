import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Label } from './label';

describe('Label 组件', () => {
  // 基础渲染测试
  test('应正确渲染标签文本', () => {
    render(<Label>测试标签</Label>);
    expect(screen.getByText('测试标签')).toBeInTheDocument();
  });

  // 必填标记测试
  test('应显示必填星号', () => {
    render(<Label required>必填项</Label>);
    // Tailwind v4：语义类已替换为 CSS 变量任意值
    expect(screen.getByText('*')).toHaveClass('text-[var(--label-required)]');
  });

  // 禁用状态测试
  test('应正确处理禁用状态', () => {
    render(<Label disabled>禁用标签</Label>);
    const label = screen.getByText('禁用标签');
    expect(label).toHaveClass('opacity-50');
    expect(label).toHaveClass('cursor-not-allowed');
    expect(label).toHaveAttribute('data-disabled', 'true');
  });

  // 关联输入框测试
  test('应正确关联输入元素', async () => {
    render(
      <div>
        <Label htmlFor="test-input">测试输入</Label>
        <input id="test-input" type="text" />
      </div>,
    );

    const input = screen.getByRole('textbox');
    const label = screen.getByText('测试输入');

    // 标签通过 htmlFor 与输入框关联
    expect(label).toHaveAttribute('for', 'test-input');

    // 点击标签应聚焦输入框
    // 注意：jsdom 未实现 <label> 点击聚焦控件的原生行为，
    // 因此使用 userEvent 模拟真实浏览器交互。
    await userEvent.click(label);
    expect(input).toHaveFocus();
  });

  // 自定义类名测试
  test('应应用自定义类名', () => {
    render(<Label className="custom-class">自定义标签</Label>);
    expect(screen.getByText('自定义标签')).toHaveClass('custom-class');
  });

  // 组合状态测试
  test('应处理禁用+必填状态', () => {
    render(
      <Label disabled required>
        组合状态
      </Label>,
    );

    const label = screen.getByText('组合状态');
    expect(label).toHaveClass('opacity-50');
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  // 无障碍测试
  test('应包含正确的无障碍属性', () => {
    render(
      <>
        <Label htmlFor="a11y-input" required>
          无障碍标签
        </Label>
        <input id="a11y-input" />
      </>,
    );

    const label = screen.getByText('无障碍标签');
    const input = screen.getByRole('textbox');

    // 检查关联关系
    expect(label).toHaveAttribute('for', 'a11y-input');
    expect(input).toHaveAttribute('id', 'a11y-input');

    // 检查必填标记的隐藏属性
    const asterisk = screen.getByText('*');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });
});
