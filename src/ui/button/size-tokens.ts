/**
 * Button 尺寸设计令牌
 *
 * 基于 Tailwind CSS 和设计系统最佳实践，定义统一的按钮尺寸规范
 * 参考：Ant Design, Chakra UI, Material UI 的尺寸映射策略
 */

export interface ButtonSizeToken {
  /** 按钮高度 */
  height: string;
  /** 水平内边距 */
  paddingX: string;
  /** 垂直内边距 */
  paddingY: string;
  /** 文本尺寸 */
  fontSize: string;
  /** 图标尺寸 */
  iconSize: string;
  /** 内容间距 */
  gap: string;
  /** 最小宽度（可选） */
  minWidth?: string;
}

/**
 * 统一的按钮尺寸令牌映射
 *
 * 设计原则：
 * 1. 遵循 Design System 的字体大小策略：统一使用 text-sm (14px)
 * 2. 保持与 Tailwind CSS 和 DS 的完全一致性
 * 3. 符合无障碍访问标准（最小触摸区域44px）
 * 4. 支持响应式设计
 *
 * 重要：所有尺寸都使用 text-sm，与 Design System 保持一致！
 */
export const buttonSizeTokens: Record<string, ButtonSizeToken> = {
  // 超小尺寸 - 用于紧凑场景，如表格操作按钮
  xs: {
    height: 'h-6', // 24px
    paddingX: 'px-2', // 8px
    paddingY: 'py-1', // 4px
    fontSize: 'text-sm', // 14px - 与 DS 保持一致
    iconSize: 'size-3', // 12px
    gap: 'gap-1', // 4px
    minWidth: 'min-w-6', // 24px
  },

  // 小尺寸 - 用于次要操作，与 Menu Item 和 DS 保持一致
  sm: {
    height: 'h-8', // 32px
    paddingX: 'px-3', // 12px
    paddingY: 'py-1.5', // 6px
    fontSize: 'text-sm', // 14px - 与 DS 和 Menu Item 一致
    iconSize: 'size-4', // 16px
    gap: 'gap-1.5', // 6px
    minWidth: 'min-w-8', // 32px
  },

  // 默认尺寸 - 标准按钮尺寸，与 DS 完全一致
  default: {
    height: 'h-9', // 36px
    paddingX: 'px-4', // 16px
    paddingY: 'py-2', // 8px
    fontSize: 'text-sm', // 14px - 与 DS 保持一致
    iconSize: 'size-4', // 16px
    gap: 'gap-2', // 8px
    minWidth: 'min-w-9', // 36px
  },

  // 中等尺寸 - 与 default 等价，保持一致性
  md: {
    height: 'h-9', // 36px
    paddingX: 'px-4', // 16px
    paddingY: 'py-2', // 8px
    fontSize: 'text-sm', // 14px - 与 DS 保持一致
    iconSize: 'size-4', // 16px
    gap: 'gap-2', // 8px
    minWidth: 'min-w-9', // 36px
  },

  // 大尺寸 - 用于主要操作，与 DS 保持一致
  lg: {
    height: 'h-10', // 40px
    paddingX: 'px-6', // 24px - 与 DS 一致
    paddingY: 'py-2.5', // 10px
    fontSize: 'text-sm', // 14px - 与 DS 保持一致，不使用 text-base
    iconSize: 'size-4', // 16px - 与 DS 的 [&_svg]:size-4 一致
    gap: 'gap-2', // 8px - 与 DS 的 gap-2 一致
    minWidth: 'min-w-10', // 40px
  },

  // 超大尺寸 - 扩展尺寸，但仍保持 DS 的字体大小原则
  xl: {
    height: 'h-11', // 44px - 符合无障碍最小触摸区域
    paddingX: 'px-8', // 32px
    paddingY: 'py-3', // 12px
    fontSize: 'text-sm', // 14px - 保持与 DS 一致，不使用 text-lg
    iconSize: 'size-4', // 16px - 保持一致
    gap: 'gap-2', // 8px - 保持一致
    minWidth: 'min-w-11', // 44px
  },

  // 图标按钮 - 正方形按钮，用于纯图标场景，与 icon-button.tsx 保持一致
  icon: {
    height: 'h-8', // 32px - 与 icon-button.tsx 默认尺寸一致
    paddingX: 'px-0', // 0px
    paddingY: 'py-0', // 0px
    fontSize: 'text-sm', // 14px（用于 aria-label）
    iconSize: 'size-4', // 16px
    gap: 'gap-0', // 0px
    minWidth: 'w-8', // 32px（固定宽度）- 与 icon-button.tsx 一致
  },

  // 移动端优化尺寸
  mobile: {
    height: 'h-12', // 48px - 移动端推荐最小触摸区域
    paddingX: 'px-6', // 24px
    paddingY: 'py-3', // 12px
    fontSize: 'text-sm', // 14px - 与 DS 保持一致，移动端也统一字体
    iconSize: 'size-5', // 20px
    gap: 'gap-2.5', // 10px
    minWidth: 'min-w-12', // 48px
  },
};

/**
 * 获取按钮尺寸令牌
 * @param size 尺寸标识
 * @returns 尺寸令牌对象
 */
export function getButtonSizeToken(size: keyof typeof buttonSizeTokens): ButtonSizeToken {
  // `noUncheckedIndexedAccess` 下索引访问可能为 undefined，
  // 但 `md` 是常量键、其值必然存在，故用非空断言收窄类型
  return buttonSizeTokens[size] || buttonSizeTokens.md!;
}

/**
 * 生成按钮尺寸类名
 * @param size 尺寸标识
 * @returns Tailwind CSS 类名字符串
 */
export function generateButtonSizeClasses(size: keyof typeof buttonSizeTokens): string {
  const token = getButtonSizeToken(size);

  return [token.height, token.paddingX, token.paddingY, token.fontSize, token.minWidth].filter(Boolean).join(' ');
}

/**
 * 按钮尺寸映射表 - 用于向后兼容
 */
export const buttonSizeMapping = {
  xs: 'xs',
  sm: 'sm',
  small: 'sm',
  default: 'default', // 保持 default 定义
  md: 'md', // md 等价于 default
  medium: 'md',
  lg: 'lg',
  large: 'lg',
  xl: 'xl',
  icon: 'icon',
  mobile: 'mobile',
} as const;

export type ButtonSize = keyof typeof buttonSizeMapping;
