// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { PanelLeftIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../sidebar';

import { cva } from 'class-variance-authority';

const sidebarVariants = cva('flex min-h-svh w-full', {
  variants: {
    variant: {
      sidebar: 'bg-sidebar',
      floating: 'rounded-lg border border-sidebar-border shadow-sm',
    },
    collapsible: {
      offcanvas: 'w-64',
      icon: 'w-12',
    },
  },
  defaultVariants: {
    variant: 'sidebar',
    collapsible: 'offcanvas',
  },
});

// 在 meta 中添加 args
const meta = {
  title: 'EASAI/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'sidebar',
    collapsible: 'offcanvas',
  },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

// 使用 sidebarVariants 的默认变体
export const Default: Story = {
  render: (args) => (
    <div className="flex h-screen w-full bg-background text-foreground">
      <SidebarProvider>
        <Sidebar
          className={sidebarVariants({
            variant: 'floating',
            collapsible: 'offcanvas',
          })}
        >
          <SidebarTrigger>
            <PanelLeftIcon className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Profile</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Settings</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
      <div className="flex-1 p-4">
        <h1 className="mb-4 font-bold text-2xl">Content Area</h1>
        <p className="text-muted-foreground">This is the main content area. The sidebar should be visible on the left.</p>
      </div>
    </div>
  ),
};

// 浮动变体
export const Floating: Story = {
  ...Default,
  args: {
    variant: 'floating',
    collapsible: 'offcanvas',
  },
};

// 图标变体
export const Icon: Story = {
  ...Default,
  args: {
    variant: 'sidebar',
    collapsible: 'icon',
    side: 'right',
  },
};

// export const Default: Story = {
//   render: () => (
//     <div className="flex h-screen w-full bg-background text-foreground">
//       <SidebarProvider>
//         <Sidebar>
//           <SidebarTrigger>
//             <PanelLeftIcon className="w-4 h-4" />
//             <span className="sr-only">Toggle Sidebar</span>
//           </SidebarTrigger>
//           <SidebarContent>
//             <SidebarGroup>
//               <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton>Dashboard</SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton>Profile</SidebarMenuButton>
//                   </SidebarMenuItem>
//                   <SidebarMenuItem>
//                     <SidebarMenuButton>Settings</SidebarMenuButton>
//                   </SidebarMenuItem>
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           </SidebarContent>
//         </Sidebar>
//       </SidebarProvider>
//
//       {/* 添加内容区域 */}
//       <div className="flex-1 p-4">
//         <h1 className="text-2xl font-bold mb-4">Content Area</h1>
//         <p className="text-muted-foreground">
//           This is the main content area. The sidebar should be visible on the left.
//         </p>
//       </div>
//     </div>
//   ),
// };
//
// export const Floating: Story = {
//   args: {
//     side: 'left',
//     variant: 'floating',
//     collapsible: 'icon',
//   },
//   render: () => (
//     <SidebarProvider>
//       <Sidebar>
//         <SidebarTrigger />
//         <SidebarContent>
//           <SidebarGroup>
//             <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 <SidebarMenuItem>
//                   <SidebarMenuButton>Dashboard</SidebarMenuButton>
//                 </SidebarMenuItem>
//                 <SidebarMenuItem>
//                   <SidebarMenuButton>Profile</SidebarMenuButton>
//                 </SidebarMenuItem>
//                 <SidebarMenuItem>
//                   <SidebarMenuButton>Settings</SidebarMenuButton>
//                 </SidebarMenuItem>
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </SidebarContent>
//       </Sidebar>
//     </SidebarProvider>
//   ),
// };

export const Inset: Story = {
  args: {
    side: 'left',
    variant: 'inset',
    collapsible: 'none',
  },
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarTrigger />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Profile</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Settings</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};

export const RightSidebar: Story = {
  args: {
    side: 'right',
    variant: 'sidebar',
    collapsible: 'offcanvas',
  },
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarTrigger />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Profile</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Settings</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};
