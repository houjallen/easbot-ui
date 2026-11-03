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

export const Basic: Story = {
  render: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <Drawer>
        <DrawerTrigger>
          <button type="button" className="rounded-md px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-100">
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
            <DrawerClose>
              <button type="button" className="rounded-md px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-100">
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
        <DrawerTrigger>
          <button type="button" className="rounded-md px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-100">
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
                <label htmlFor="drawer-username" className="block font-medium text-gray-700 text-sm">
                  用户名
                </label>
                <input id="drawer-username" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="drawer-password" className="block font-medium text-gray-700 text-sm">
                  密码
                </label>
                <input id="drawer-password" type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <div className="flex justify-end space-x-3">
              <DrawerClose>
                <button type="button" className="rounded-md px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-100">
                  取消
                </button>
              </DrawerClose>
              <button type="button" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-sm text-white hover:bg-indigo-700">
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
        <DrawerTrigger>
          <button type="button" className="rounded-md px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-100">
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
              <DrawerClose>
                <button type="button" className="rounded-md px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-100">
                  取消
                </button>
              </DrawerClose>
              <button type="button" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-sm text-white hover:bg-indigo-700">
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
        <DrawerTrigger>
          <button type="button" className="rounded-md px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-100">
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
