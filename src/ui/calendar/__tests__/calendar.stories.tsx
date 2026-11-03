// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { Calendar } from '../calendar';

const meta = {
  title: 'EASAI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Calendar mode="single" selected={new Date()} />
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Calendar mode="range" defaultMonth={new Date()} />
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button>
        <Calendar className="h-6 w-6" mode="single" selected={new Date()} />
        选择日期
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Calendar mode="single" selected={new Date()} disabled={(date) => date.getDay() === 0 || date.getDay() === 6} />
    </div>
  ),
};
