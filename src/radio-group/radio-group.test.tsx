import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from '../label';

describe('RadioGroup 组件', () => {
  test('应正确处理选项切换', () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    );

    // 注意：RadioGroupItem 渲染为 button[role="radio"]，其可访问名来自关联的 <label>，
    // 此处未提供 label，因此按 value 属性定位
    const optionB = screen.getAllByRole('radio').find((el) => el.getAttribute('value') === 'b');
    expect(optionB).toBeDefined();
    fireEvent.click(optionB!);
    expect(optionB).toHaveAttribute('aria-checked', 'true');
    expect(optionB).toHaveAttribute('data-state', 'checked');
  });

  test('应处理禁用状态', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="disabled" id="disabled" disabled />
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
    expect(radio).toHaveAttribute('data-disabled');
  });

  test('应正确关联标签', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" id="test" />
        <Label htmlFor="test">测试标签</Label>
      </RadioGroup>,
    );

    // 注意：RadioGroupItem 必须包裹在 RadioGroup 内（Radix 上下文要求）
    const radio = screen.getByRole('radio', { name: '测试标签' });
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute('id', 'test');
  });
});
