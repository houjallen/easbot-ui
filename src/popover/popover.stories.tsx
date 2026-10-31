import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from '../button';
import { Input } from '../input';

const meta: Meta<typeof Popover> = {
  title: 'EASAI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">点击查看</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">尺寸</h4>
            <p className="text-sm text-muted-foreground">设置您的尺寸偏好。</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="width" className="text-sm">
                宽度
              </label>
              <Input id="width" defaultValue="100%" className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="height" className="text-sm">
                高度
              </label>
              <Input id="height" defaultValue="25px" className="col-span-2" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">禁用状态的浮层触发器无法点击，下面是示例展示：</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled>
              禁用浮层
            </Button>
          </PopoverTrigger>
          <PopoverContent>无法触发的浮层内容</PopoverContent>
        </Popover>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">正常状态的浮层对比：</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">可点击浮层</Button>
          </PopoverTrigger>
          <PopoverContent>正常状态的浮层内容</PopoverContent>
        </Popover>
      </div>
    </div>
  ),
};

export const PositionDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">顶部浮层</Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-48">
          顶部显示内容
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">右侧浮层</Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-48">
          右侧显示内容
        </PopoverContent>
      </Popover>
    </div>
  ),
};
