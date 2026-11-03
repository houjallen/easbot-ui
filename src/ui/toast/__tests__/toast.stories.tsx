// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { useToast } from '../../use-toast';
import { Toast } from '../toast';
import type { ToastPosition, ToastVariant } from '../types';

const meta = {
  title: 'EASAI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// 可配置的Toast测试组件
const ConfigurableToast = () => {
  const { toast } = useToast();
  const positions: ToastPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  const variants: ToastVariant[] = ['default', 'destructive', 'success', 'warning', 'info'];
  const durations = [3000, 5000, 10000];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-medium">位置</h3>
        <div className="flex flex-wrap gap-4">
          {positions.map((position) => (
            <Button
              key={position}
              variant="outline"
              onClick={() => {
                toast({
                  title: `${position}`,
                  description: '位置测试',
                  position: position,
                });
              }}
            >
              {position}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">样式</h3>
        <div className="flex flex-wrap gap-4">
          {variants.map((variant) => (
            <Button
              key={variant}
              variant="outline"
              onClick={() => {
                toast({
                  title: `${variant} 样式`,
                  description: '样式测试',
                  variant: variant,
                });
              }}
            >
              {variant}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">持续时间</h3>
        <div className="flex flex-wrap gap-4">
          {durations.map((duration) => (
            <Button
              key={duration}
              variant="outline"
              onClick={() => {
                toast({
                  title: `${duration / 1000}秒`,
                  description: '时长测试',
                  duration: duration,
                });
              }}
            >
              {duration / 1000}秒
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">组合测试</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: '组合测试',
                description: '位置+样式+时长',
                position: 'top-right',
                variant: 'success',
                duration: 5000,
                action: (
                  <Button variant="outline" size="sm">
                    操作按钮
                  </Button>
                ),
              });
            }}
          >
            组合测试
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Playground: Story = {
  render: () => <ConfigurableToast />,
};

// 位置测试组件
const PositionTest = () => {
  const { toast } = useToast();
  const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;

  return (
    <div className="flex flex-wrap gap-4">
      {positions.map((position) => (
        <Button
          key={position}
          variant="outline"
          onClick={() => {
            toast({
              title: `${position} 位置`,
              description: '这是一条测试消息',
              position: position,
            });
          }}
        >
          {position}
        </Button>
      ))}
    </div>
  );
};

export const Positions: Story = {
  render: () => <PositionTest />,
};

/**
 * 长文案场景
 *
 * @description
 * 验证「标题 + 多行描述」时，关闭按钮仍在**右侧居中**，
 * 且**不与文字重叠**（内容区 `min-w-0` 可收缩换行）。
 */
export const LongContent: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { toast } = useToast();

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: '这是一条很长的标题，用于验证通知在超长文案下的排版表现',
            description:
              '这是一段很长的描述文案，用于验证关闭按钮在内容换行后依然位于右侧居中位置，且不会与文字发生重叠。通知的宽度由 --toast-min-width（240px）与 --toast-max-width（350px）共同约束，超出部分自动换行。',
            variant: 'warning',
            duration: 10000,
          });
        }}
      >
        显示长文案
      </Button>
    );
  },
};

export const Success: Story = {
  render: () => {
    const { toast } = useToast();

    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: '操作成功',
            description: '数据已保存',
            variant: 'success',
          });
        }}
      >
        显示成功提示
      </Button>
    );
  },
};

export const ErrorToast: Story = {
  render: () => {
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
