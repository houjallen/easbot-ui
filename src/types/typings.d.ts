/**
 * JSON文件模块声明
 */
declare module '*.json' {
  const content: Record<string, any>;
  export default content;
}

/**
 * Text文件模块声明
 */
declare module '*.txt' {
  const content: string;
  export default content;
}

/**
 * css样式文件模块声明
 */
declare module '*.css' {
  const content: string;
  export default content;
}

/**
 * Less样式文件模块声明
 */
declare module '*.less' {
  const content: Record<string, any>;
  export default content;
}

/**
 * Scss样式文件模块声明
 */
declare module '*.scss' {
  const content: Record<string, any>;
  export default content;
}

/**
 * Sass样式文件模块声明
 */
declare module '*.sass' {
  const content: Record<string, any>;
  export default content;
}

/**
 * Emotion JSX运行时模块声明
 */
declare module '@emotion/react/jsx-runtime' {
  const content: any;
  export default content;
}

/**
 * SVG文件模块声明(带查询参数)
 */
declare module '*.svg?' {
  const publicPath: string;
  export default publicPath;
}

/**
 * SVG文件模块声明 - 默认导出模式
 * 配置: { exportType: "default" }
 */
declare module '*.svg' {
  import type { ReactElement, SVGProps } from 'react';
  const content: (props: SVGProps<SVGElement>) => ReactElement;
  export default content;
}

/**
 * SVG文件模块声明 - 命名导出模式
 * 配置: { exportType: "named" }
 */
declare module '*.svg' {
  import type { ReactElement, SVGProps } from 'react';
  const ReactComponent: (props: SVGProps<SVGElement>) => ReactElement;
  export { ReactComponent };
}

/**
 * SVG文件模块声明 - 自定义命名导出模式
 * 配置: { exportType: "named", namedExport: "Svg" }
 */
declare module '*.svg' {
  import type { ReactElement, SVGProps } from 'react';
  const Svg: (props: SVGProps<SVGElement>) => ReactElement;
  export { Svg };
}
