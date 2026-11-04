# InputOTP 一次性验证码

> 一次性验证码（OTP）输入框，支持分组、槽位与分隔符。

---

**导入**

```tsx
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@easbot/ui';
```

## 基础用法

```tsx
import { Fragment } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@easbot/ui';

export default function App() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, i) => (
          <Fragment key={i}>
            {i > 0 && <InputOTPSeparator />}
            <InputOTPSlot index={i} />
          </Fragment>
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
```

受控用法：

```tsx
import { useState } from 'react';

const [value, setValue] = useState('');

<InputOTP maxLength={6} value={value} onChange={setValue}>
  <InputOTPGroup>
    {Array.from({ length: 6 }).map((_, i) => (
      <InputOTPSlot key={i} index={i} />
    ))}
  </InputOTPGroup>
</InputOTP>;
```

`InputOTPProps` 为 `ComponentProps<typeof InputOTP>` 的类型别名，属性与 `input-otp` 包的 `OTPInput` 一致（`maxLength`（必填）/ `value` / `onChange` / `onComplete` / `pattern` / `inputMode` / `placeholder` / `textAlign` / `disabled` / `autoComplete` / `pasteTransformer` / `containerClassName` / `className` 等），组件仅新增 `containerClassName`（用于包裹槽位容器），其余均透传 `input-otp` 包的原生 `<input>` 属性。

## 无障碍

- 底层渲染为一个真实的 `<input>`（带 `data-input-otp` 标记），通过 `containerClassName` 包裹视觉槽位 —— 输入与读屏均正常。
- 默认 `autoComplete="one-time-code"`，便于系统自动填充短信验证码。
- 默认 `inputMode="numeric"`，移动端会弹出数字键盘。
- 激活的槽位附加 `data-active="true"`，样式为 `border-ring` + `ring-[3px]`；激活槽位带一个 `animate-caret-blink` 的模拟光标。
- `aria-invalid` 状态下槽位边框与焦点环变为 destructive 色。
- 分隔符渲染为语义化 `<hr>` 且不可聚焦 —— 源码注释说明这是纯装饰性元素（聚焦版 separator 需要 `aria-valuenow`，装饰用途不需要）。
- 槽位内的字符由真实 `<input>` 的值渲染，屏幕阅读器读到的是输入框本身而非碎片文本。

## 注意事项

- **`maxLength` 是必填项**：`input-otp` 包的 `OTPInputBaseProps` 中 `maxLength` 为必填，未传会导致类型错误。
- **`InputOTPSlot` 的 `index` 是必填项**：用于从 `OTPInputContext` 读取对应槽位状态（`char` / `hasFakeCaret` / `isActive`），传错 index 会导致字符错位。
- **`src/ui` 层是纯 re-export**：`InputOTP` / `InputOTPGroup` / `InputOTPSeparator` / `InputOTPSlot` 直接等于设计系统层实现，额外仅暴露 `containerClassName`（用于包裹槽位容器）。
- **`containerClassName` 与 `className` 层级不同**：`containerClassName` 作用于外层容器（`flex items-center gap-2 has-disabled:opacity-50`），`className` 作用于真实 `<input>`。
- **槽位边框由 CSS 拼接**：非首尾槽位使用 `border-y border-r`，首槽位补 `first:border-l first:rounded-l-md`，末槽位补 `last:rounded-r-md` —— 因此槽位必须放在同一个 `InputOTPGroup` 内才会正确拼接。
- **`InputOTPSeparator` 不可聚焦**：作为 `<hr>` 渲染，键盘用户会跳过它。
- **`render` 与 `children` 二选一**：`input-otp` 包的类型约束要求提供 `render` 回调或 `children` 之一，本组件使用 `children` 方式。

## 导出

### 组件

| 导出名              | 说明 |
| ------------------- | ---- |
| `InputOTP`          |      |
| `InputOTPGroup`     |      |
| `InputOTPProps`     |      |
| `InputOTPSeparator` |      |
| `InputOTPSlot`      |      |
