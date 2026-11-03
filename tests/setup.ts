/**
 * Vitest 测试全局设置
 *
 * 职责：
 * 1. 注册 `@testing-library/jest-dom` 的自定义 matcher（toBeInTheDocument / toHaveClass 等）。
 *    v7 提供专门的 `/vitest` 子入口以适配 Vitest 的 matcher 扩展机制
 *    （旧的 `/extend-expect` 子路径已在 v6 移除）。
 * 2. 清理 React Testing Library 在每个用例之间遗留的 DOM，避免用例间相互污染。
 * 3. 全局安装 jsdom 缺失的浏览器 API polyfill（`ResizeObserver` / `scrollIntoView`）——
 *    这些是**环境级**能力，不是单个测试文件的诉求，统一在此安装，
 *    避免每个测试文件各自 import（Radix 的 Select / Command / Checkbox 等组件
 *    都会在内部调用这些 API）。
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import './polyfills';

// 每个用例结束后卸载已渲染组件，避免 DOM 残留影响后续断言
afterEach(() => {
  cleanup();
});
