import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../input-otp';

export default {
  title: 'EASAI/InputOTP',
  component: InputOTP,
};

export const Basic = () => (
  <InputOTP maxLength={6}>
    <InputOTPGroup>
      {Array.from({ length: 6 }).map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <InputOTPSeparator />}
          <InputOTPSlot index={i} />
        </React.Fragment>
      ))}
    </InputOTPGroup>
  </InputOTP>
);

Basic.storyName = '基础用法';
