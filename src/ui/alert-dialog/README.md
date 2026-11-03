# AlertDialog 警告对话框组件

AlertDialog 组件用于展示重要的警告信息或确认操作，需要用户明确的操作反馈。

基于 Radix UI 的 AlertDialog 组件实现，提供了完善的无障碍支持。

## 特性

- 基于 Radix UI 的 AlertDialog 组件，提供了完善的无障碍支持
- 支持多种尺寸和样式变体
- 提供自定义操作按钮和取消按钮
- 支持右上角关闭按钮
- 可配置点击遮罩层是否关闭对话框
- 遵循 WAI-ARIA 设计模式，确保无障碍性

## 安装

```bash
pnpm add @radix-ui/react-alert-dialog
```

## 用法

### 基础用法

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>打开</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认操作</AlertDialogTitle>
          <AlertDialogDescription>这是一个重要操作，请确认后继续。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>确认</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 带关闭按钮的对话框

```tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  // ... 其他组件
} from '@/components/ui/alert-dialog';

export default function AlertDialogWithCloseButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>打开带关闭按钮的对话框</AlertDialogTrigger>
      <AlertDialogContent showCloseButton={true} closeAriaLabel="关闭对话框">
        <AlertDialogHeader>
          <AlertDialogTitle>带关闭按钮的对话框</AlertDialogTitle>
          {/* ... 其他内容 */}
        </AlertDialogHeader>
        {/* ... 其他内容 */}
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 禁止点击遮罩层关闭

```tsx
import {
  AlertDialog,
  AlertDialogContent,
  // ... 其他组件
} from '@/components/ui/alert-dialog';

export default function AlertDialogPreventOverlayClose() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>打开不可通过点击背景关闭的对话框</AlertDialogTrigger>
      <AlertDialogContent closeOnOverlayClick={false} showCloseButton={true}>
        <AlertDialogHeader>
          <AlertDialogTitle>重要操作确认</AlertDialogTitle>
          <AlertDialogDescription>
            此对话框禁止点击背景关闭，必须通过按钮明确操作。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* ... 其他内容 */}
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 不同变体样式

```tsx
<AlertDialogContent variant="default">
  {/* 默认样式 */}
</AlertDialogContent>

<AlertDialogContent variant="destructive">
  {/* 危险操作样式 */}
</AlertDialogContent>

<AlertDialogContent variant="success">
  {/* 成功提示样式 */}
</AlertDialogContent>
```

### 不同尺寸

```tsx
<AlertDialogContent size="sm">
  {/* 小尺寸对话框 */}
</AlertDialogContent>

<AlertDialogContent size="default">
  {/* 默认尺寸对话框 */}
</AlertDialogContent>

<AlertDialogContent size="lg">
  {/* 大尺寸对话框 */}
</AlertDialogContent>
```

### 加载状态的操作按钮

```tsx
<AlertDialogAction loading={true}>处理中...</AlertDialogAction>
```

## 封装的AlertDialogModal组件

AlertDialogModal是基于AlertDialog封装的模态对话框组件，提供了标准的警告对话框界面和交互，支持不同类型的图标和自定义内容。

### 基本用法

```tsx
import { AlertDialogModal } from '@/components/ui/alert-dialog/alert-dialog-modal';
import { useState } from 'react';

export default function AlertDialogModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>打开对话框</button>
      <AlertDialogModal
        title="操作确认"
        content="您确定要执行此操作吗？"
        iconType="warning"
        open={open}
        onOpenChange={setOpen}
        okText="确认"
        cancelText="取消"
      />
    </>
  );
}
```

### 不同类型的图标

```tsx
// 信息类型
<AlertDialogModal iconType="info" ... />

// 成功类型
<AlertDialogModal iconType="success" ... />

// 警告类型
<AlertDialogModal iconType="warning" ... />

// 错误类型
<AlertDialogModal iconType="error" ... />
```

### 隐藏关闭按钮

```tsx
<AlertDialogModal
  title="重要提示"
  content="此对话框没有右上角关闭按钮"
  showCloseButton={false}
  // ... 其他属性
/>
```

## API

### AlertDialog

| 属性           | 类型                      | 默认值 | 说明                           |
| -------------- | ------------------------- | ------ | ------------------------------ |
| `defaultOpen`  | `boolean`                 | -      | 对话框的默认打开状态           |
| `open`         | `boolean`                 | -      | 控制对话框的打开状态           |
| `onOpenChange` | `(open: boolean) => void` | -      | 对话框打开状态变化时的回调函数 |

### AlertDialogContent

| 属性                  | 类型                                      | 默认值         | 说明                     |
| --------------------- | ----------------------------------------- | -------------- | ------------------------ |
| `variant`             | `'default' \| 'destructive' \| 'success'` | `'default'`    | 对话框的样式变体         |
| `size`                | `'sm' \| 'default' \| 'lg'`               | `'default'`    | 对话框的尺寸             |
| `showCloseButton`     | `boolean`                                 | `true`         | 是否显示右上角关闭按钮   |
| `closeAriaLabel`      | `string`                                  | `'关闭对话框'` | 关闭按钮的无障碍标签     |
| `closeOnOverlayClick` | `boolean`                                 | `true`         | 点击遮罩层是否关闭对话框 |
| `className`           | `string`                                  | -              | 自定义类名               |

### AlertDialogAction

| 属性        | 类型                                      | 默认值  | 说明             |
| ----------- | ----------------------------------------- | ------- | ---------------- |
| `loading`   | `boolean`                                 | `false` | 是否显示加载状态 |
| `variant`   | `'default' \| 'destructive' \| 'success'` | -       | 按钮的样式变体   |
| `className` | `string`                                  | -       | 自定义类名       |

### AlertDialogModal

| 属性              | 类型                                          | 默认值   | 说明                         |
| ----------------- | --------------------------------------------- | -------- | ---------------------------- |
| `title`           | `string`                                      | `''`     | 对话框标题                   |
| `content`         | `React.ReactNode \| string`                   | -        | 对话框内容                   |
| `onOk`            | `() => void`                                  | -        | 点击确认按钮的回调函数       |
| `onCancel`        | `() => void`                                  | -        | 点击取消按钮的回调函数       |
| `iconType`        | `'success' \| 'info' \| 'error' \| 'warning'` | `'info'` | 图标类型                     |
| `open`            | `boolean`                                     | `false`  | 对话框的打开状态             |
| `onOpenChange`    | `(open: boolean) => void`                     | -        | 对话框打开状态变化的回调函数 |
| `okText`          | `string`                                      | `'确认'` | 确认按钮文本                 |
| `cancelText`      | `string`                                      | `'取消'` | 取消按钮文本                 |
| `showCloseButton` | `boolean`                                     | `true`   | 是否显示右上角关闭按钮       |

### 其他组件

其他子组件（`AlertDialogTrigger`、`AlertDialogCancel`、`AlertDialogHeader`、`AlertDialogFooter`、`AlertDialogTitle`、`AlertDialogDescription`）接受其各自 HTML 元素的所有标准属性。
