import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Vitest 配置（组件库模式）
 *
 * 设计要点：
 *
 * 1. **environment: 'jsdom'** —— 组件是 React DOM 组件，需要 DOM 环境。
 *    原配置为 `'node'`，且 jsdom 未安装 → 所有测试无法渲染。
 *
 * 2. **include 匹配真实布局** —— 测试文件与组件源码同目录（`src/<component>/<component>.test.tsx`），
 *    原配置的 `src/**\/__tests__/**` 永远匹配不到 → `No test files found`。
 *
 * 3. **globals: true** —— 提供 `describe` / `it` / `expect` 等全局，
 *    配合 tsconfig 的 `vitest/globals` 类型让 TypeScript 也能识别。
 *
 * 4. **css: false** —— 组件样式完全靠 className 断言，测试环境无需处理 CSS，
 *    关闭可显著加快测试速度。
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/storybook-static/**'],
    setupFiles: ['./tests/setup.ts'],
    // 组件样式通过 className 断言，不需要在测试环境处理 CSS
    css: false,
    reporters: ['verbose'],
    // 线程池：组件测试无共享状态，并行更快
    pool: 'threads',
    // 默认 30 秒；涉及定时器/动画的用例留足余量
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules/', 'dist/', 'tests/', '**/*.stories.tsx', '**/*.test.tsx', 'src/index.ts', 'src/styles.css'],
    },
  },
  resolve: {
    alias: {
      '@': join(import.meta.dirname, 'src'),
    },
  },
});
