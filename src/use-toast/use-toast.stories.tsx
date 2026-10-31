import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { useToast } from './use-toast';
import { Toast } from '../toast';

const meta: Meta<typeof Toast> = {
  title: 'EASAI/UseToast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    title: '默认提示',
    description: '这是一条提示消息',
    variant: 'default',
    duration: 3000,
    position: 'top-right',
  },
  argTypes: {
    title: {
      control: 'text',
      description: '提示标题',
    },
    description: {
      control: 'text',
      description: '提示内容',
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success'],
      description: '提示样式',
    },
    duration: {
      control: 'number',
      description: '显示时长（毫秒）',
    },
    position: {
      control: 'select',
      options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
      description: '显示位置',
    },
    action: {
      control: 'boolean',
      description: '是否显示操作按钮',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Playground: Story = {
  render: (args) => {
    const { toast } = useToast();
    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: args.title,
            description: args.description,
            variant: args.variant,
            duration: args.duration,
            position: args.position,
            action: args.action ? (
              <Button variant="outline" size="sm">
                操作按钮
              </Button>
            ) : undefined,
          });
        }}
      >
        显示提示
      </Button>
    );
  },
};

export const Default: Story = {
  args: {
    title: '默认提示',
    position: 'top-right',
  },
  render: (args) => {
    const { toast } = useToast();
    return (
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: args.title,
            description: args.description,
            variant: args.variant,
            duration: args.duration,
            position: args.position,
          })
        }
      >
        显示默认提示
      </Button>
    );
  },
};

export const Success: Story = {
  args: {
    title: '成功提示',
    position: 'top-right',
  },
  render: (args) => {
    const { toast } = useToast();
    return (
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: args.title,
            description: args.description,
            variant: args.variant,
            duration: args.duration,
            position: args.position,
          })
        }
      >
        显示成功提示
      </Button>
    );
  },
};

export const Destructive: Story = {
  args: {
    title: '错误',
    position: 'top-right',
    variant: 'destructive',
  },
  render: (args) => {
    const { toast } = useToast();
    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: '错误',
            description: '操作执行失败',
            variant: 'destructive',
          });
        }}
      >
        显示错误提示
      </Button>
    );
  },
};

export const WithAction: Story = {
  args: {},
  render: () => {
    const { toast } = useToast();
    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: '待处理',
            description: '有一个新的待处理任务',
            action: (
              <Button variant="outline" size="sm">
                查看详情
              </Button>
            ),
          });
        }}
      >
        显示带操作的提示
      </Button>
    );
  },
};

export const WithDuration: Story = {
  args: {
    position: 'top-right',
  },
  render: () => {
    const { toast } = useToast();
    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: '自定义时长',
            description: '这条提示会显示 10 秒钟',
            duration: 10000,
          });
        }}
      >
        显示长时间提示
      </Button>
    );
  },
};

export const WithPosition: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <div className="flex flex-col gap-2">
        <Button
          onClick={() =>
            toast({
              title: '右上角提示',
              position: 'top-right',
            })
          }
        >
          顶部右侧
        </Button>
        <Button
          onClick={() =>
            toast({
              title: '底部居中',
              position: 'bottom-center',
            })
          }
        >
          底部居中
        </Button>
      </div>
    );
  },
};
