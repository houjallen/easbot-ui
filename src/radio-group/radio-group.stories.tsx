import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from '../label';

const meta: Meta<typeof RadioGroup> = {
  title: 'EASAI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">选项一</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 h-6 w-6"
              aria-hidden="true"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold">卡片标题一</h3>
              <p className="text-sm text-muted-foreground">这是卡片一的详细描述信息。</p>
            </div>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="card-2" id="card-2" className="peer sr-only" />
          <Label
            htmlFor="card-2"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 h-6 w-6"
              aria-hidden="true"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold">卡片标题二</h3>
              <p className="text-sm text-muted-foreground">这是卡片二的详细描述信息。</p>
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
