import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Label } from '../../label';
import { Switch } from '../switch';

const meta = {
  title: 'EASAI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Storybook Controls 面板可以控制这个初始值
    // 注意：Switch 组件本身可能不直接使用 defaultChecked prop，
    // 这里的 defaultChecked 是为了方便 Storybook 控制初始状态传递给 useState。
    // Switch 组件应该接收 checked 和 onCheckedChange。
    defaultChecked: false,
  },
  render: (args) => {
    const [checked, setChecked] = React.useState(!!args.defaultChecked);

    return (
      <div className="flex items-center space-x-2">
        <Switch
          // id="airplane-mode" // id 可以通过 args 传递，或者在这里硬编码
          // disabled={args.disabled} // disabled 也可以通过 args 传递
          {...args} // 传递所有 args，包括 id, disabled, className, size 等
          checked={checked} // 关键：受控的 checked state
          onCheckedChange={setChecked} // 关键：更新 state 的回调
        />
        <Label htmlFor={args.id || 'airplane-mode'}>飞行模式</Label>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled" disabled />
      <Label htmlFor="disabled" className="text-muted-foreground">
        禁用状态
      </Label>
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    id: 'notifications',
    defaultChecked: false,
  },
  render: (args) => {
    const [checked, setChecked] = React.useState(!!args.defaultChecked);
    return (
      <div className="grid gap-4">
        <div className="flex items-start space-x-2">
          <Switch
            {...args} // Spreads id, defaultChecked (used by useState), etc.
            checked={checked}
            onCheckedChange={setChecked}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor={args.id}>推送通知</Label>
            <p className="text-muted-foreground text-sm">接收来自系统的重要通知和更新提醒。</p>
          </div>
        </div>
      </div>
    );
  },
};

export const ColorVariants: Story = {
  render: (args) => {
    const [checkedPrimary, setCheckedPrimary] = React.useState(true); // Default to checked to see color
    const [checkedDestructive, setCheckedDestructive] = React.useState(true); // Default to checked to see color

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch
            {...args} // Pass other args like id, disabled, etc.
            id="primary"
            // variant="default" // This is the default, so not strictly necessary to pass
            checked={checkedPrimary}
            onCheckedChange={setCheckedPrimary}
          />
          <Label htmlFor="primary">主色</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            {...args} // Pass other args like id, disabled, etc.
            id="destructive"
            variant="destructive"
            checked={checkedDestructive}
            onCheckedChange={setCheckedDestructive}
          />
          <Label htmlFor="destructive">警示色</Label>
        </div>
      </div>
    );
  },
};
