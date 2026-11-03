'use client';

import { useTheme } from '../../providers/theme-provider';
import React from 'react';
import type { ToasterProps } from 'sonner';
import { Toaster as Sonner } from 'sonner';

/**
 * Toast 容器
 *
 * @description
 * 自动跟随当前主题 —— 使用本库自实现的 `useTheme`（不依赖 `next-themes`），
 * 保证在纯 React 应用中同样可用。
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
