import type { Meta, StoryObj } from '@storybook/react';
import React from 'react'; // Import React
import { Label } from '../../label';
import { RadioGroup, RadioGroupItem } from '../radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'EASAI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>; // Adjusted to use typeof meta for better type inference with argTypes

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" variant="default" />
        <Label htmlFor="option-one">选项一</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" variant="default" />
        <Label htmlFor="option-two">选项二</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <RadioGroup defaultValue="card-1">
      <div className="grid gap-4">
        <div>
          <RadioGroupItem value="card-1" id="card-1" className="peer sr-only" />
          <Label
            htmlFor="card-1"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 h-6 w-6">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold">卡片标题一</h3>
              <p className="text-muted-foreground text-sm">这是卡片一的详细描述信息。</p>
            </div>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="card-2" id="card-2" className="peer sr-only" />
          <Label
            htmlFor="card-2"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 h-6 w-6">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold">卡片标题二</h3>
              <p className="text-muted-foreground text-sm">这是卡片二的详细描述信息。</p>
            </div>
          </Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" disabled />
        <Label htmlFor="option-one">禁用选项</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">启用选项</Label>
      </div>
    </RadioGroup>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <RadioGroup defaultValue="left" className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="left" id="left" />
        <Label htmlFor="left">左对齐</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="center" id="center" />
        <Label htmlFor="center">居中</Label>
      </div>
    </RadioGroup>
  ),
};

export const ColorVariants: Story = {
  render: () => {
    const [selectedValue, setSelectedValue] = React.useState('default-1');
    const [destructiveValue, setDestructiveValue] = React.useState('destructive-1');

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-medium text-lg">Default Indicator Group</h3>
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue} className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem variant="default" value="default-1" id="default-1" />
              <Label htmlFor="default-1">默认选项 1 (default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem variant="default" value="default-2" id="default-2" />
              <Label htmlFor="default-2">默认选项 2 (default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem variant="destructive" value="default-destructive-item" id="default-destructive-item" />
              <Label htmlFor="default-destructive-item">特定警示选项 (destructive)</Label>
            </div>
          </RadioGroup>
          <p className="mt-2 text-muted-foreground text-xs">当前选中: {selectedValue}</p>
        </div>

        <div>
          <h3 className="mb-3 font-medium text-lg">Destructive Indicator Group</h3>
          <RadioGroup value={destructiveValue} onValueChange={setDestructiveValue} className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem variant="destructive" value="destructive-1" id="destructive-1" />
              <Label htmlFor="destructive-1">警示选项 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem variant="destructive" value="destructive-2" id="destructive-2" />
              <Label htmlFor="destructive-2">警示选项 2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem variant="destructive" value="destructive-disabled" id="destructive-disabled" disabled />
              <Label htmlFor="destructive-disabled">警示选项 (禁用)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem variant="destructive" value="destructive-error" id="destructive-error" error="这是一个错误提示" />
              <Label htmlFor="destructive-error">警示选项 (带错误)</Label>
            </div>
          </RadioGroup>
          <p className="mt-2 text-muted-foreground text-xs">当前选中: {destructiveValue}</p>
        </div>
      </div>
    );
  },
};
