// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from '../aspect-ratio';

const meta = {
  title: 'EASAI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <div className="w-[320px]">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="relative w-full" style={{ paddingBottom: `${(9 / 16) * 100}%` }}>
          <AspectRatio ratio={16 / 9} className="absolute inset-0">
            <div className="rounded-lg bg-muted">
              <p className="p-4 text-muted-foreground text-sm">16:9 比例</p>
            </div>
          </AspectRatio>
        </div>

        <div className="relative w-full" style={{ paddingBottom: `${(3 / 4) * 100}%` }}>
          <AspectRatio ratio={4 / 3} className="absolute inset-0">
            <div className="rounded-lg bg-muted">
              <p className="p-4 text-muted-foreground text-sm">4:3 比例</p>
            </div>
          </AspectRatio>
        </div>

        <div className="relative w-full" style={{ paddingBottom: `${1 * 100}%` }}>
          <AspectRatio ratio={1 / 1} className="absolute inset-0">
            <div className="rounded-lg bg-muted">
              <p className="p-4 text-muted-foreground text-sm">1:1 比例</p>
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="w-[320px]">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="relative w-full" style={{ paddingBottom: `${(9 / 16) * 100}%` }}>
          <AspectRatio ratio={16 / 9} className="absolute inset-0">
            <img src="https://picsum.photos/800/450" alt="示例图片" className="h-full w-full rounded-lg object-cover" />
          </AspectRatio>
        </div>

        <div className="relative w-full" style={{ paddingBottom: `${(3 / 4) * 100}%` }}>
          <AspectRatio ratio={4 / 3} className="absolute inset-0">
            <img src="https://picsum.photos/400/300" alt="示例图片" className="h-full w-full rounded-lg object-cover" />
          </AspectRatio>
        </div>

        <div className="relative w-full" style={{ paddingBottom: `${1 * 100}%` }}>
          <AspectRatio ratio={1 / 1} className="absolute inset-0">
            <img src="https://picsum.photos/300/300" alt="示例图片" className="h-full w-full rounded-lg object-cover" />
          </AspectRatio>
        </div>
      </div>
    </div>
  ),
};
