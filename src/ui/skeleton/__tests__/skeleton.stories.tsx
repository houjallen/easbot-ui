// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../skeleton';

const meta = {
  title: 'EASAI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础样式
const skeletonBase = 'bg-accent animate-pulse rounded-md';

export const Basic: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className={`${skeletonBase} h-4 w-32`} />
      <Skeleton className={`${skeletonBase} h-4 w-48`} />
      <Skeleton className={`${skeletonBase} h-4 w-64`} />
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="space-y-3">
      <Skeleton className="h-[30px] w-[300px]" />
      <Skeleton className="h-[30px] w-[300px]" />
      <Skeleton className="h-[30px] w-[300px]" />
      <Skeleton className="h-[30px] w-[200px]" />
    </div>
  ),
};

export const TableLoading: Story = {
  render: () => (
    <div className="rounded-lg border p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 border-b p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className={`${skeletonBase} h-24 w-full rounded-lg`} />
        <div className="space-y-2">
          <Skeleton className={`${skeletonBase} h-4 w-2/3`} />
          <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
          <Skeleton className={`${skeletonBase} h-4 w-3/4`} />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className={`${skeletonBase} h-24 w-full rounded-lg`} />
        <div className="space-y-2">
          <Skeleton className={`${skeletonBase} h-4 w-2/3`} />
          <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
          <Skeleton className={`${skeletonBase} h-4 w-3/4`} />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className={`${skeletonBase} h-24 w-full rounded-lg`} />
        <div className="space-y-2">
          <Skeleton className={`${skeletonBase} h-4 w-2/3`} />
          <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
          <Skeleton className={`${skeletonBase} h-4 w-3/4`} />
        </div>
      </div>
    </div>
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-4">
        <Skeleton className={`${skeletonBase} h-32 w-full rounded-lg`} />
        <div className="space-y-2">
          <Skeleton className={`${skeletonBase} h-4 w-2/3`} />
          <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
          <Skeleton className={`${skeletonBase} h-4 w-3/4`} />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className={`${skeletonBase} h-32 w-full rounded-lg`} />
        <div className="space-y-2">
          <Skeleton className={`${skeletonBase} h-4 w-2/3`} />
          <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
          <Skeleton className={`${skeletonBase} h-4 w-3/4`} />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className={`${skeletonBase} h-32 w-full rounded-lg`} />
        <div className="space-y-2">
          <Skeleton className={`${skeletonBase} h-4 w-2/3`} />
          <Skeleton className={`${skeletonBase} h-4 w-1/2`} />
          <Skeleton className={`${skeletonBase} h-4 w-3/4`} />
        </div>
      </div>
    </div>
  ),
};

export const ListLoading: Story = {
  render: () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const CustomShape: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-48 rounded-full" />
      <Skeleton className="h-16 w-32 rounded-lg" />
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
  ),
};
