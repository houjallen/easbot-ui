export * from './button';
export type {
  ButtonProps,
  // 导出类型增强
  SwipeDirection,
  PressureSensitiveConfig,
} from './button';

// 新增类型声明
declare module './button' {
  interface ButtonProps {
    /** 自定义滑动检测阈值（像素） */
    swipeThreshold?: number;
    /** 压力感应配置 */
    pressureConfig?: {
      min?: number;
      max?: number;
      sensitivity?: number;
    };
  }
}
