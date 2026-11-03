// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../carousel';

const meta = {
  title: 'EASAI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 1</p>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 2</p>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 3</p>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="-translate-y-1/2 absolute top-1/2 left-2 z-10" />
        <CarouselNext className="-translate-y-1/2 absolute top-1/2 right-2 z-10" />
      </Carousel>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="h-[400px] w-64">
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>
            <div className="flex h-full items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 1</p>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-full items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 2</p>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-full items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 3</p>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="-translate-x-1/2 absolute top-2 left-1/2 z-10 rotate-90" />
        <CarouselNext className="-translate-x-1/2 -rotate-90 absolute bottom-2 left-1/2 z-10" />
      </Carousel>
    </div>
  ),
};

export const CustomNavigation: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 1</p>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 2</p>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="font-bold text-2xl">幻灯片 3</p>
            </div>
          </CarouselItem>
        </CarouselContent>
        <div className="mt-4 flex justify-center gap-4">
          <CarouselPrevious variant="ghost" size="icon" />
          <CarouselNext variant="ghost" size="icon" />
        </div>
      </Carousel>
    </div>
  ),
};
