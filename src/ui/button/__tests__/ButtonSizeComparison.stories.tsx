/**
 * Button 尺寸对比测试
 *
 * 用于验证新的统一尺寸系统与其他组件的一致性
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Download, Edit, Eye, Trash } from 'lucide-react';
import { Button } from '../button';

const meta: Meta<typeof Button> = {
  title: 'EASAI/Button/Size Comparison',
  component: Button,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '展示新的统一尺寸系统，确保与 Menu Item 等组件的文本尺寸一致性。',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * 尺寸对比展示
 */
export const SizeComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-lg">按钮尺寸对比</h3>
        <div className="space-y-4">
          {/* 超小尺寸 */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">xs (24px)</div>
            <Button size="xs" variant="default">
              查看
            </Button>
            <Button size="xs" variant="outline">
              编辑
            </Button>
            <Button size="xs" variant="ghost">
              删除
            </Button>
            <Button size="xs" variant="default" leftIcon={<Eye className="size-3" />}>
              查看
            </Button>
            <div className="text-muted-foreground text-sm">text-sm (14px) - 与 DS 一致</div>
          </div>

          {/* 小尺寸 */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">sm (32px)</div>
            <Button size="sm" variant="default">
              查看
            </Button>
            <Button size="sm" variant="outline">
              编辑
            </Button>
            <Button size="sm" variant="ghost">
              删除
            </Button>
            <Button size="sm" variant="default" leftIcon={<Eye className="size-4" />}>
              查看
            </Button>
            <div className="text-muted-foreground text-sm">text-sm (14px) - 与 Menu Item 和 DS 一致</div>
          </div>

          {/* 中等尺寸 */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">md (36px)</div>
            <Button size="md" variant="default">
              查看
            </Button>
            <Button size="md" variant="outline">
              编辑
            </Button>
            <Button size="md" variant="ghost">
              删除
            </Button>
            <Button size="md" variant="default" leftIcon={<Eye className="size-4" />}>
              查看
            </Button>
            <div className="text-muted-foreground text-sm">text-sm (14px) - 与 DS 一致</div>
          </div>

          {/* 大尺寸 */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">lg (40px)</div>
            <Button size="lg" variant="default">
              查看
            </Button>
            <Button size="lg" variant="outline">
              编辑
            </Button>
            <Button size="lg" variant="ghost">
              删除
            </Button>
            <Button size="lg" variant="default" leftIcon={<Eye className="size-4" />}>
              查看
            </Button>
            <div className="text-muted-foreground text-sm">text-sm (14px) - 与 DS 一致</div>
          </div>

          {/* 超大尺寸 */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">xl (44px)</div>
            <Button size="xl" variant="default">
              查看
            </Button>
            <Button size="xl" variant="outline">
              编辑
            </Button>
            <Button size="xl" variant="ghost">
              删除
            </Button>
            <Button size="xl" variant="default" leftIcon={<Eye className="size-4" />}>
              查看
            </Button>
            <div className="text-muted-foreground text-sm">text-sm (14px) - 与 DS 一致</div>
          </div>

          {/* 图标按钮 */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">icon (32px)</div>
            <Button size="icon" variant="default">
              <Eye className="size-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Edit className="size-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Trash className="size-4" />
            </Button>
            <Button size="icon" variant="destructive">
              <Download className="size-4" />
            </Button>
            <div className="text-muted-foreground text-sm">正方形图标按钮 - 与 icon-button.tsx 一致</div>
          </div>

          {/* 移动端尺寸 */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">mobile (48px)</div>
            <Button size="mobile" variant="default">
              查看
            </Button>
            <Button size="mobile" variant="outline">
              编辑
            </Button>
            <Button size="mobile" variant="ghost">
              删除
            </Button>
            <Button size="mobile" variant="default" leftIcon={<Eye className="size-5" />}>
              查看
            </Button>
            <div className="text-base text-muted-foreground">text-base (16px) - 移动端推荐</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-lg">与其他组件的一致性测试</h3>
        <div className="space-y-4">
          {/* 模拟 Menu Item */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">Menu Item</div>
            <div className="flex h-8 items-center rounded-md px-3 py-1.5 text-sm hover:bg-accent">
              <Eye className="mr-2 size-4" />
              查看详情
            </div>
            <Button size="sm" variant="ghost">
              <Eye className="mr-2 size-4" />
              查看详情
            </Button>
            <div className="text-muted-foreground text-sm">两者应该具有相同的文本尺寸 (14px)</div>
          </div>

          {/* 模拟 Input */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">Input</div>
            <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background" placeholder="输入内容..." />
            <Button size="md" variant="outline">
              提交
            </Button>
            <div className="text-muted-foreground text-sm">Input 和 Button 应该高度一致</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-lg">加载状态测试</h3>
        <div className="flex items-center gap-4">
          <Button size="sm" loading>
            加载中
          </Button>
          <Button size="md" loading>
            加载中
          </Button>
          <Button size="lg" loading>
            加载中
          </Button>
          <Button size="icon" loading>
            <Eye />
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-lg">所有变体测试</h3>
        <div className="grid grid-cols-6 gap-4">
          {['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'].map((variant) => (
            <div key={variant} className="space-y-2">
              <div className="font-medium text-sm capitalize">{variant}</div>
              <div className="space-y-2">
                <Button size="sm" variant={variant as any}>
                  小按钮
                </Button>
                <Button size="md" variant={variant as any}>
                  中按钮
                </Button>
                <Button size="lg" variant={variant as any}>
                  大按钮
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * 向后兼容性测试
 */
export const BackwardCompatibility: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-lg">向后兼容性测试</h3>
        <p className="mb-4 text-muted-foreground text-sm">测试旧的 size 属性值是否能正确映射到新的尺寸系统</p>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">small → sm</div>
            <Button size="small" variant="default">
              小按钮
            </Button>
            <Button size="sm" variant="outline">
              对比
            </Button>
            <div className="text-muted-foreground text-sm">应该完全一致</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">default → md</div>
            <Button size="default" variant="default">
              默认按钮
            </Button>
            <Button size="md" variant="outline">
              对比
            </Button>
            <div className="text-muted-foreground text-sm">应该完全一致</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 text-muted-foreground text-sm">large → lg</div>
            <Button size="large" variant="default">
              大按钮
            </Button>
            <Button size="lg" variant="outline">
              对比
            </Button>
            <div className="text-muted-foreground text-sm">应该完全一致</div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * 响应式测试
 */
export const ResponsiveTest: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-lg">响应式尺寸测试</h3>
        <p className="mb-4 text-muted-foreground text-sm">在不同屏幕尺寸下测试按钮的显示效果</p>
        <div className="space-y-4">
          {/* 桌面端 */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium text-sm">桌面端 (推荐 md/lg)</div>
            <div className="flex gap-2">
              <Button size="md">保存</Button>
              <Button size="lg" variant="default">
                主要操作
              </Button>
              <Button size="sm" variant="outline">
                次要操作
              </Button>
            </div>
          </div>

          {/* 平板端 */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium text-sm">平板端 (推荐 lg)</div>
            <div className="flex gap-3">
              <Button size="lg">保存</Button>
              <Button size="lg" variant="outline">
                取消
              </Button>
              <Button size="md" variant="ghost">
                更多
              </Button>
            </div>
          </div>

          {/* 移动端 */}
          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium text-sm">移动端 (推荐 mobile/xl)</div>
            <div className="flex gap-4">
              <Button size="mobile">保存</Button>
              <Button size="xl" variant="outline">
                取消
              </Button>
              <Button size="icon" variant="ghost">
                <Eye />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
