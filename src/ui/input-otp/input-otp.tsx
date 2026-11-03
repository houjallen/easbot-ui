'use client';

import { InputOTP as DSInputOTP } from '../../design-system/components/ui/input-otp';
import { InputOTPGroup as DSInputOTPGroup, InputOTPSeparator as DSInputOTPSeparator, InputOTPSlot as DSInputOTPSlot } from '../../design-system/components/ui/input-otp';
import type { ComponentProps } from 'react';

export const InputOTP = DSInputOTP;
export const InputOTPGroup = DSInputOTPGroup;
export const InputOTPSeparator = DSInputOTPSeparator;
export const InputOTPSlot = DSInputOTPSlot;
export type InputOTPProps = ComponentProps<typeof InputOTP>;
