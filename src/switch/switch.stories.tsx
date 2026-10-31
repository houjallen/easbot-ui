import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './switch';
import { Label } from '../label';

const meta: Meta<typeof Switch> = {
  title: 'EASAI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">飞行模式</Label>
    </div>
  ),
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
  render: () => (
    <div className="grid gap-4">
      <div className="flex items-start space-x-2">
        <Switch id="notifications" />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="notifications">推送通知</Label>
          <p className="text-sm text-muted-foreground">接收来自系统的重要通知和更新提醒。</p>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch id="small" size="sm" />
        <Label htmlFor="small" className="text-sm">
          小尺寸
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="medium" size="md" />
        <Label htmlFor="medium">默认尺寸</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="large" size="lg" />
        <Label htmlFor="large" className="text-lg">
          大尺寸
        </Label>
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Switch id="primary" data-state="checked" className="data-[state=checked]:bg-primary" />
        <Label htmlFor="primary">主色</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="destructive" data-state="checked" className="data-[state=checked]:bg-destructive" />
        <Label htmlFor="destructive">警示色</Label>
      </div>
    </div>
  ),
};
