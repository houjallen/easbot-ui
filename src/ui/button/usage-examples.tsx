import { Download, Edit, Eye, Plus, Settings, Trash } from 'lucide-react';
import { Button } from './button';

/**
 * 表格操作按钮示例
 * 场景：数据表格中的行操作按钮
 */
export const TableActionExample = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">表格操作按钮 (推荐使用 xs/sm)</h3>

      {/* 紧凑型表格 - 使用 xs */}
      <div className="rounded border">
        <div className="border-b bg-muted/50 px-4 py-2 font-medium text-sm">紧凑型表格 - 使用 xs 尺寸</div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">用户数据行</div>
          <div className="flex gap-1">
            <Button size="xs" variant="ghost">
              <Eye className="size-3" />
            </Button>
            <Button size="xs" variant="ghost">
              <Edit className="size-3" />
            </Button>
            <Button size="xs" variant="ghost">
              <Trash className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 标准表格 - 使用 sm */}
      <div className="rounded border">
        <div className="border-b bg-muted/50 px-4 py-2 font-medium text-sm">标准表格 - 使用 sm 尺寸 (与 Menu Item 一致)</div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">用户数据行</div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">
              <Eye className="size-4" />
              查看
            </Button>
            <Button size="sm" variant="ghost">
              <Edit className="size-4" />
              编辑
            </Button>
            <Button size="sm" variant="ghost">
              <Trash className="size-4" />
              删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 表单操作按钮示例
 * 场景：表单底部的操作按钮
 */
export const FormActionExample = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">表单操作按钮 (推荐使用 md/lg)</h3>

      {/* 标准表单 */}
      <div className="rounded border p-6">
        <div className="mb-4 space-y-4">
          <div>
            <label htmlFor="usage-username" className="mb-1 block font-medium text-sm">
              用户名
            </label>
            <input id="usage-username" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="请输入用户名" />
          </div>
          <div>
            <label htmlFor="usage-email" className="mb-1 block font-medium text-sm">
              邮箱
            </label>
            <input id="usage-email" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="请输入邮箱" />
          </div>
        </div>

        {/* 表单按钮 - 与 Input 高度一致 */}
        <div className="flex justify-end gap-3">
          <Button size="md" variant="outline">
            取消
          </Button>
          <Button size="md" variant="default">
            保存
          </Button>
        </div>
      </div>

      {/* 重要表单 - 使用更大的按钮 */}
      <div className="rounded border p-6">
        <div className="mb-4 text-center">
          <h4 className="font-semibold text-lg">重要操作确认</h4>
          <p className="mt-1 text-muted-foreground text-sm">此操作不可撤销，请谨慎操作</p>
        </div>

        <div className="flex justify-center gap-4">
          <Button size="lg" variant="outline">
            取消
          </Button>
          <Button size="lg" variant="destructive">
            确认删除
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 导航和工具栏示例
 * 场景：页面顶部的导航和工具栏
 */
export const NavigationExample = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">导航和工具栏 (推荐使用 sm/md)</h3>

      {/* 页面工具栏 */}
      <div className="flex items-center justify-between rounded border bg-background p-4">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg">用户管理</h2>
          <div className="text-muted-foreground text-sm">共 1,234 条记录</div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Download className="size-4" />
            导出
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="size-4" />
            设置
          </Button>
          <Button size="md" variant="default">
            <Plus className="size-4" />
            新增用户
          </Button>
        </div>
      </div>

      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm">
        <Button size="sm" variant="ghost">
          首页
        </Button>
        <span className="text-muted-foreground">/</span>
        <Button size="sm" variant="ghost">
          用户管理
        </Button>
        <span className="text-muted-foreground">/</span>
        <span>用户列表</span>
      </div>
    </div>
  );
};

/**
 * 移动端适配示例
 * 场景：移动设备上的按钮使用
 */
export const MobileExample = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">移动端适配 (推荐使用 mobile/xl)</h3>

      {/* 移动端底部操作栏 */}
      <div className="rounded border">
        <div className="border-b bg-muted/50 px-4 py-2 font-medium text-sm">移动端底部操作栏</div>
        <div className="flex gap-3 p-4">
          <Button size="mobile" variant="outline" className="flex-1">
            取消
          </Button>
          <Button size="mobile" variant="default" className="flex-1">
            确认
          </Button>
        </div>
      </div>

      {/* 移动端卡片操作 */}
      <div className="rounded border">
        <div className="border-b bg-muted/50 px-4 py-2 font-medium text-sm">移动端卡片操作</div>
        <div className="p-4">
          <div className="mb-4 rounded border p-4">
            <h4 className="font-medium">产品标题</h4>
            <p className="mt-1 text-muted-foreground text-sm">产品描述信息</p>
            <div className="mt-4 flex gap-2">
              <Button size="xl" variant="outline" className="flex-1">
                收藏
              </Button>
              <Button size="xl" variant="default" className="flex-1">
                立即购买
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 响应式设计示例
 * 场景：根据屏幕尺寸自适应按钮大小
 */
export const ResponsiveExample = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">响应式设计</h3>

      <div className="rounded border p-4">
        <p className="mb-4 text-muted-foreground text-sm">这些按钮会根据屏幕尺寸自动调整大小</p>

        <div className="flex flex-wrap gap-3">
          {/* 响应式主按钮 */}
          <Button size="sm" className="md:h-9 md:px-4 md:py-2 md:text-sm lg:h-10 lg:px-5 lg:py-2.5 lg:text-base" variant="default">
            响应式主按钮
          </Button>

          {/* 响应式次按钮 */}
          <Button size="sm" className="md:h-9 md:px-4 md:py-2 md:text-sm" variant="outline">
            响应式次按钮
          </Button>

          {/* 移动端优化按钮 */}
          <Button size="md" className="sm:hidden" variant="default">
            桌面端
          </Button>

          <Button size="mobile" className="hidden sm:block md:hidden" variant="default">
            移动端
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 完整的使用示例组合
 */
export const CompleteExample = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="mb-2 font-bold text-2xl">Button 统一尺寸系统示例</h1>
        <p className="text-muted-foreground">展示如何在不同场景下正确使用统一的按钮尺寸系统，确保与其他组件的一致性。</p>
      </div>

      <TableActionExample />
      <FormActionExample />
      <NavigationExample />
      <MobileExample />
      <ResponsiveExample />

      <div className="rounded border bg-muted/50 p-4">
        <h3 className="mb-2 font-semibold">核心原则</h3>
        <ul className="space-y-1 text-muted-foreground text-sm">
          <li>
            • <strong>xs</strong>: 紧凑场景，如表格操作按钮
          </li>
          <li>
            • <strong>sm</strong>: 次要操作，与 Menu Item 保持一致 (14px)
          </li>
          <li>
            • <strong>md</strong>: 标准按钮，与 Input 高度一致
          </li>
          <li>
            • <strong>lg</strong>: 主要操作，突出重要性
          </li>
          <li>
            • <strong>xl</strong>: CTA 按钮，最高优先级
          </li>
          <li>
            • <strong>mobile</strong>: 移动端优化，符合触摸标准
          </li>
        </ul>
      </div>
    </div>
  );
};
