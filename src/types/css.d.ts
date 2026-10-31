/**
 * CSS 模块类型声明
 *
 * TypeScript 需要显式声明非代码资源的导入类型，否则在 `verbatimModuleSyntax`
 * 开启时会报 `TS2882: Cannot find module or type declarations for side-effect import`。
 *
 * 覆盖的资源类型：`.css` / `.scss` / `.sass` / `.less`
 */

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

declare module '*.less' {
  const content: string;
  export default content;
}
