/**
 * AlertDialogModal 组件的 Storybook 示例文件
 *
 * 展示了AlertDialogModal组件的各种使用场景和交互方式
 */

// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '../../button';
import { AlertDialogModal } from '../alert-dialog-modal';

const meta = {
  title: 'EASAI/AlertDialogModal',
  component: AlertDialogModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialogModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    variant: 'default',
    title: '默认变体',
    content: '这是默认变体的提示内容。',
    showCloseButton: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [variant, setVariant] = React.useState<'default' | 'destructive' | 'success' | 'warning' | 'info'>('default');
    return (
      <>
        <Button
          onClick={() => {
            setVariant('default');
            setOpen(true);
          }}
        >
          默认
        </Button>
        <AlertDialogModal {...args} open={open} variant={variant} onOpenChange={setOpen} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>
    );
  },
};

export const Destructive: Story = {
  args: {
    open: false,
    variant: 'destructive',
    title: '错误变体',
    content: '这是错误变体的提示内容。',
    showCloseButton: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [variant, setVariant] = React.useState<'default' | 'destructive' | 'success' | 'warning' | 'info'>('destructive');
    return (
      <>
        <Button
          variant="destructive"
          onClick={() => {
            setVariant('destructive');
            setOpen(true);
          }}
        >
          错误
        </Button>
        <AlertDialogModal {...args} open={open} variant={variant} onOpenChange={setOpen} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>
    );
  },
};

export const Success: Story = {
  args: {
    open: false,
    variant: 'success',
    title: '成功变体',
    content: '这是成功变体的提示内容。',
    showCloseButton: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [variant, setVariant] = React.useState<'default' | 'destructive' | 'success' | 'warning' | 'info'>('success');
    return (
      <>
        <Button
          variant="success"
          onClick={() => {
            setVariant('success');
            setOpen(true);
          }}
        >
          成功
        </Button>
        <AlertDialogModal {...args} open={open} variant={variant} onOpenChange={setOpen} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>
    );
  },
};

export const Warning: Story = {
  args: {
    open: false,
    variant: 'warning',
    title: '警告变体',
    content: '这是警告变体的提示内容。',
    showCloseButton: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [variant, setVariant] = React.useState<'default' | 'destructive' | 'success' | 'warning' | 'info'>('warning');
    return (
      <>
        <Button
          variant="warning"
          onClick={() => {
            setVariant('warning');
            setOpen(true);
          }}
        >
          警告
        </Button>
        <AlertDialogModal {...args} open={open} variant={variant} onOpenChange={setOpen} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>
    );
  },
};

export const Info: Story = {
  args: {
    open: false,
    variant: 'info',
    title: '信息变体',
    content: '这是信息变体的提示内容。',
    showCloseButton: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [variant, setVariant] = React.useState<'default' | 'destructive' | 'success' | 'warning' | 'info'>('info');
    return (
      <>
        <Button
          variant="default"
          onClick={() => {
            setVariant('info');
            setOpen(true);
          }}
        >
          信息
        </Button>
        <AlertDialogModal {...args} open={open} variant={variant} onOpenChange={setOpen} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </>
    );
  },
};
