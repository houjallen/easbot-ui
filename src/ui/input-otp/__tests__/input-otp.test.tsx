import { render, screen } from '@testing-library/react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../input-otp';

describe('InputOTP', () => {
  it('渲染基本组件', () => {
    render(
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          {[0, 1, 2, 3].map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>,
    );
    // 检查输入框是否存在
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
