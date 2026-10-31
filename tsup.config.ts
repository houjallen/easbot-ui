import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

/**
 * tsup 构建配置（组件库模式）
 *
 * 设计要点（详见 .easbot/knowledge/docs/dev/ui-library-hardening/design.md §2.2）：
 *
 * 1. **platform: 'browser'** —— 组件库跑在浏览器，原 `platform: 'node'` 会让 esbuild
 *    按 Node 语义处理依赖（如注入 node 内置模块解析），对纯 React 组件是错误的。
 *
 * 2. **external = 全部运行时依赖** —— 组件库不打包 react / radix / lucide 等，
 *    否则消费方会拿到重复的 React 实例（Hooks 报错）。这些依赖由消费方提供。
 *
 * 3. **不压缩、不混淆** —— 组件库消费方用自己的 bundler 做 tree-shake 与压缩；
 *    本包保留可读产物 + sourcemap，便于消费方断点调试与错误栈定位。
 *
 * 4. **CSS 单独产出** —— Tailwind 是构建期工具，运行时无意义。
 *    样式在构建期全量编译成纯 CSS 交付（见 package.json#build:css），
 *    消费方 `import '@easbot/ui/styles.css'` 即得完整组件样式 + 主题变量。
 */
export default defineConfig((options: Options) => {
  /** 入口：单 barrel 文件 */
  const input: string[] = ['src/index.ts'];

  /**
   * 不打进 bundle 的依赖。
   *
   * 与 package.json 的 dependencies / peerDependencies 保持一致：
   * - dependencies（clsx / cva / tailwind-merge / cmdk / react-hook-form / lucide-react）
   *   走 external，消费方安装 @easbot/ui 时 pnpm 会一并装上，无需重复打包。
   * - peerDependencies（react / react-dom / @radix-ui/*）必须 external，
   *   否则会出现双 React 实例。
   */
  const external: string[] = [
    // React 运行时
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    // Radix UI primitives（peer）
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-avatar',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-label',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-scroll-area',
    '@radix-ui/react-select',
    '@radix-ui/react-separator',
    '@radix-ui/react-slider',
    '@radix-ui/react-slot',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toast',
    '@radix-ui/react-toggle',
    '@radix-ui/react-tooltip',
    // 样式 / 变体工具链
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    'cmdk',
    'react-hook-form',
    'lucide-react',
  ];

  return {
    entry: input,
    // 配置输出文件名后缀：CJS 用 .cjs，ESM 用 .mjs
    outExtension: ({ format }: { format: 'cjs' | 'esm' | 'iife' }) => ({
      js: format === 'cjs' ? '.cjs' : format === 'esm' ? '.mjs' : '.js',
    }),
    // 输出文件目录
    outDir: './dist',
    // 双格式：ESM（现代打包器 / Next.js）+ CJS（老工具链兜底）
    format: ['esm', 'cjs'],
    // 组件库跑在浏览器
    platform: 'browser', // 选择目标模块解析策略, 或根据需要设置为 'node' 或 'neutral'
    // 编译目标
    target: 'es2020',
    // 分文件夹兼容输出
    legacyOutput: false,
    tsconfig: './tsconfig.json',
    // 是否进行拆分
    splitting: true,
    // 忽略监听的文件
    ignoreWatch: ['assets', 'public'],
    // 类型声明
    dts: {
      compilerOptions: {
        ignoreDeprecations: '6.0',
      },
    },
    /** 消费方负责压缩与 tree-shake，这里保留可读产物  */
    // 是否生成对应的调试源文件 —— 保留 sourcemap，便于消费方断点调试与错误栈定位
    sourcemap: true,
    // 打包之前是否先清空dist文件
    clean: true,
    // 是否压缩代码 —— 组件库不压缩（见文件头注释第 3 条），保留可读产物便于消费方调试
    minify: false,
    // 摇树优化
    treeshake: true,
    external,
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.ttf': 'file',
      '.css': 'file',
    },
    esbuildOptions: (buildOptions) => {
      buildOptions.assetNames = 'assets/[ext]/[name]-[hash]';
      buildOptions.chunkNames = 'chunks/[name]-[hash]';
    },
    /**
     * 构建成功后复制主题 CSS 到 dist/。
     *
     * 说明：主样式 `dist/styles.css` 由 `pnpm build:css`（@tailwindcss/cli）生成，
     * 因为 Tailwind 需要在构建期扫描 src/ 才能产出正确的原子类。
     * 主题变量（light / dark）是纯 CSS 变量声明，直接复制即可。
     */
    async onSuccess() {
      const outDir = join(process.cwd(), 'dist');
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }

      for (const file of ['theme-light.css', 'theme-dark.css']) {
        const source = join(process.cwd(), 'src', file);
        if (existsSync(source)) {
          cpSync(source, join(outDir, file));
        }
      }

      console.log(`[tsup] Build completed successfully (external: ${external.length} packages)`);
    },
  };
});
