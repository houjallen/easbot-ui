// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../drawer';

const meta = {
  title: 'EASAI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

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
 * ⛔ `DrawerTrigger` / `DrawerClose` **必须**用 `asChild`
 *
 * 📌 Radix 的 `Trigger` / `Close` 自身就渲染一个 `<button>`；
 *    若在其内部再放一个 `<button>`，会形成 **`<button>` 嵌套 `<button>`** 的
 *    非法 DOM 结构 —— React 会抛「In HTML, `<button>` cannot be a descendant of `<button>`」
 *    的 hydration 警告，且点击行为在部分浏览器下异常。
 *
 *    `asChild` 让 Radix 把自己的 props（`onClick` / `aria-*` / `data-*`）
 *    **合并到子元素**上而不额外渲染包裹节点 —— 子元素必须是**单个**可交互元素。
 */
export const Basic: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <button type="button" className={triggerClass}>
            打开抽屉
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>抽屉标题</DrawerTitle>
            <DrawerDescription>这是一个抽屉示例</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p>抽屉内容区域</p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <button type="button" className={triggerClass}>
                关闭
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};

export const WithForm: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <button type="button" className={triggerClass}>
            表单抽屉
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>表单标题</DrawerTitle>
            <DrawerDescription>这是一个包含表单的抽屉</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="drawer-username" className="block font-medium text-foreground text-sm">
                  用户名
                </label>
                <input
                  id="drawer-username"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-input bg-background text-sm shadow-sm focus:border-ring focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2"
                />
              </div>
              <div>
                <label htmlFor="drawer-password" className="block font-medium text-foreground text-sm">
                  密码
                </label>
                <input
                  id="drawer-password"
                  type="password"
                  className="mt-1 block w-full rounded-md border border-input bg-background text-sm shadow-sm focus:border-ring focus-visible:outline-2 focus-visible:outline-ring/70 focus-visible:outline-offset-2"
                />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <div className="flex justify-end space-x-3">
              <DrawerClose asChild>
                <button type="button" className={triggerClass}>
                  取消
                </button>
              </DrawerClose>
              <button type="button" className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90">
                保存
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <button type="button" className={triggerClass}>
            带底部抽屉
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>抽屉标题</DrawerTitle>
            <DrawerDescription>这是一个带底部的抽屉</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p>抽屉内容区域</p>
          </div>
          <DrawerFooter>
            <div className="flex justify-end space-x-3">
              <DrawerClose asChild>
                <button type="button" className={triggerClass}>
                  取消
                </button>
              </DrawerClose>
              <button type="button" className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90">
                确定
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};

export const CustomDirection: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <button type="button" className={triggerClass}>
            自定义方向
          </button>
        </DrawerTrigger>
        <DrawerContent side="left">
          <DrawerHeader>
            <DrawerTitle>左侧抽屉</DrawerTitle>
            <DrawerDescription>这是一个从左侧滑入的抽屉</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p>抽屉内容区域</p>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  ),
};
