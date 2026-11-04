// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../context-menu';

const meta = {
  title: 'EASAI/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 触发器按钮样式
 *
 * 📌 走主题令牌，替代硬编码 `text-gray-700` / `hover:bg-gray-100`
 *    （硬编码灰阶不随暗色主题变化）。
 */
const triggerClass = 'rounded-md border border-input bg-background px-4 py-2 font-medium text-sm text-foreground hover:bg-accent hover:text-accent-foreground';

/**
 * ⛔ `ContextMenuTrigger` **必须**用 `asChild`
 *
 * 📌 Radix 的 `ContextMenuTrigger` 自身渲染一个 `<span>` 包裹层，
 *    若不加 `asChild`，触发区与按钮外观**脱节** ——
 *    `<span>` 没有 `display:inline-block`、无边框内边距、`cursor` 也不是 `context-menu`，
 *    导致右键命中范围明显小于按钮视觉范围。
 *
 *    `asChild` 让 Radix 把自己的 props（`onContextMenu` / `aria-*` / `data-*`）
 *    **合并到子元素**上而不额外渲染包裹节点 —— 子元素必须是**单个**可交互元素。
 *
 * 📌 对齐 `ui/drawer/__tests__/drawer.stories.tsx` 的同类约定。
 */
export const Basic: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            右键菜单
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <span className="mr-2">🔍</span>
            查看
          </ContextMenuItem>
          <ContextMenuItem>
            <span className="mr-2">✏️</span>
            编辑
          </ContextMenuItem>
          <ContextMenuItem>
            <span className="mr-2">🗑️</span>
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            复选菜单
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <span className="mr-2">🔍</span>
            查看
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={false}>
            <span className="mr-2">🔔</span>
            通知
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={true}>
            <span className="mr-2">📧</span>
            邮件
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const WithRadio: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            单选菜单
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <span className="mr-2">🔍</span>
            查看
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value="small">
            <ContextMenuItem>
              <span className="mr-2">⚙️</span>
              设置
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuRadioItem value="small">
              <span className="mr-2">📐</span>小<ContextMenuShortcut>⌘+1</ContextMenuShortcut>
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="medium">
              <span className="mr-2">📏</span>中<ContextMenuShortcut>⌘+2</ContextMenuShortcut>
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="large">
              <span className="mr-2">📏</span>大<ContextMenuShortcut>⌘+3</ContextMenuShortcut>
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            子菜单
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <span className="mr-2">🔍</span>
            查看
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuLabel>排序方式</ContextMenuLabel>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <span className="mr-2">🔄</span>
                排序
              </ContextMenuSubTrigger>
              <ContextMenuPortal>
                <ContextMenuSubContent>
                  <ContextMenuItem>
                    <span className="mr-2">📅</span>
                    按日期
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <span className="mr-2">📊</span>
                    按大小
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <span className="mr-2">🏷️</span>
                    按标签
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuPortal>
            </ContextMenuSub>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  ),
};
