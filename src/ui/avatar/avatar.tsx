import { cn } from '../../utils/classnames';
import { Avatar as DSAvatar } from '../../design-system/components/ui/avatar';
import { AvatarFallback as dsAvatarFallback, AvatarImage as dsAvatarImage } from '../../design-system/components/ui/avatar';
/**
 * Avatar 头像组件（EAS UI Next 封装版）
 *
 * @description
 * 基于 design-system Avatar 组件实现，主题样式与尺寸全部交由 ds 控制。
 * 支持自定义形状（shape）、状态指示（status）等扩展功能。
 */
import * as React from 'react';

// 扩展 props 类型
export interface AvatarProps extends React.ComponentProps<typeof DSAvatar> {
  /** 头像形状，默认圆形 */
  shape?: 'circle' | 'square';
  /** 状态指示点颜色，仅扩展用（如在线、离线等） */
  statusColor?: string;
  /** 状态指示点位置，默认为右下角 */
  statusPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 是否显示状态点 */
  showStatus?: boolean;
}

/**
 * Avatar 头像组件（主题样式由 ds 控制，扩展 shape/status 功能）
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, shape = 'circle', showStatus = false, statusColor = 'var(--success)', statusPosition = 'bottom-right', children, ...props }, ref) => {
    return (
      <span className={cn('relative inline-block align-middle', className)} ref={ref}>
        <DSAvatar {...props} className={cn(shape === 'square' ? 'rounded-[var(--radius-md)]' : 'rounded-full')}>
          {children}
        </DSAvatar>
        {/* 扩展：状态指示点 */}
        {showStatus && (
          <span
            className={cn(
              'absolute block rounded-full border border-[var(--border)]', // 使用 ds 主题变量
              statusPosition === 'top-left' && 'top-0 left-0',
              statusPosition === 'top-right' && 'top-0 right-0',
              statusPosition === 'bottom-left' && 'bottom-0 left-0',
              statusPosition === 'bottom-right' && 'right-0 bottom-0',
            )}
            style={{
              width: '0.6em',
              height: '0.6em',
              backgroundColor: statusColor,
              boxShadow: '0 0 0 2px var(--background)',
            }}
          />
        )}
      </span>
    );
  },
);
Avatar.displayName = 'Avatar';

export const AvatarImage = dsAvatarImage;
export const AvatarFallback = dsAvatarFallback;
