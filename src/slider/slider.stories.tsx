import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './slider';
import React from 'react';

const meta: Meta<typeof Slider> = {
  title: 'EASAI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => (
    <div className="w-[500px] p-6">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div className="w-[500px] p-6 space-y-2">
      <Slider defaultValue={[50]} max={100} step={1} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[500px] p-6">
      <Slider defaultValue={[30]} max={100} step={1} disabled />
    </div>
  ),
};

export const RangeSlider: Story = {
  render: () => (
    <div className="w-[500px] p-6 space-y-2">
      <Slider defaultValue={[20, 80]} max={100} step={1} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="h-64 w-[500px] p-6 flex items-center justify-center">
      <div className="h-full w-24 flex items-center justify-center bg-muted/10 rounded-md">
        <Slider defaultValue={[50]} orientation="vertical" className="h-full" />
      </div>
    </div>
  ),
};

export const WithInput: Story = {
  render: () => {
    const [value, setValue] = React.useState([50]);
    return (
      <div className="w-[500px] p-6 space-y-4">
        <Slider value={value} onValueChange={setValue} max={100} />
        <input type="number" value={value[0]} onChange={(e) => setValue([Number(e.target.value)])} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md" />
      </div>
    );
  },
};
