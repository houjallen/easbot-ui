/**
 * RadioGroup 组件单元测试
 *
 * @description
 * 断言以组件真实 DOM 结构为准：
 * 1. 单选项为原生 `<button role="radio">`，**仅在关联了标签时**才有可访问名称；
 * 2. `RadioGroupItem` 必须位于 `RadioGroup` 内部（Radix 依赖上下文提供选中状态）。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe } from 'vitest';
import { Label } from '../../label';
import { RadioGroup, RadioGroupItem } from '../radio-group';

describe('RadioGroup 组件', () => {
  test('应正确处理选项切换', () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    );

    const options = screen.getAllByRole('radio');
    const optionA = options[0]!;
    const optionB = options[1]!;
    expect(optionB).toHaveAttribute('value', 'b');

    fireEvent.click(optionB);
    expect(optionB).toBeChecked();
    expect(optionA).not.toBeChecked();
  });

  test('应处理禁用状态', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="disabled" id="disabled" disabled />
      </RadioGroup>,
    );

    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
  });

  test('应正确关联标签', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="test" id="test" label="测试标签" />
      </RadioGroup>,
    );

    // label 的 htmlFor 指向单选项 id —— 单选项因此获得可访问名称
    const radio = screen.getByRole('radio', { name: '测试标签' });
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute('id', 'test');
  });

  test('应支持外部 Label 关联', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="external" id="external" />
        <Label htmlFor="external">外部标签</Label>
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', { name: '外部标签' })).toBeInTheDocument();
  });
});
