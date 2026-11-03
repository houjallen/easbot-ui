/**
 * 测试环境浏览器 API polyfill 共享 helper
 *
 * @description
 * jsdom **未实现**部分浏览器 API，依赖它们的组件在测试中会直接抛错。
 * 本文件把这些 stub 集中抽取，供多个测试文件复用
 * （依据 `spec/testing-guidelines.md` §6.2 规则 4：同一 API 被多个测试文件需要时必须抽到 `tests/` 下的共享 helper）。
 *
 * 使用方式：在测试文件**顶部**导入并调用 —— 副作用即完成 polyfill。
 *
 * ```ts
 * import '@easbot/ui/tests/polyfills';
 * ```
 */

/**
 * ResizeObserver 桩
 *
 * @description
 * jsdom 未实现 `ResizeObserver`，而 Radix 的 `useSize`（Checkbox / Switch 的
 * 表单气泡输入框依赖它）在 layout effect 中会调用 `new ResizeObserver(...)`，
 * 缺失时会抛 `ReferenceError: ResizeObserver is not defined`。
 * 尺寸测量在 jsdom 中无实际意义，保持空实现即可。
 */
class ResizeObserverStub implements ResizeObserver {
  observe(): void {
    // 尺寸测量在 jsdom 中无实际意义，保持空实现
  }
  unobserve(): void {}
  disconnect(): void {}
}

/**
 * 元素滚动方法桩
 *
 * @description
 * jsdom 未实现 `Element.scrollIntoView`，Radix 的 Select / Command 等组件
 * 在选中项滚动到可视区域时会调用它，缺失时抛 `TypeError`。
 */
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView(): void {
    // 滚动行为在 jsdom 中无实际意义，保持空实现
  };
}

/**
 * `Element.scrollTo` 桩
 *
 * @description
 * jsdom 未实现 `Element.scrollTo`，而 `TableContainer` 在滚动容器复位时会调用它，
 * 缺失时抛 `TypeError: element.scrollTo is not a function`。
 */
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo(): void {
    // 滚动行为在 jsdom 中无实际意义，保持空实现
  };
}

/**
 * 指针捕获 API 桩
 *
 * @description
 * jsdom 未实现 `Element.hasPointerCapture` / `setPointerCapture` / `releasePointerCapture`，
 * 而 Radix 的 `DropdownMenuTrigger` / `SelectTrigger` / `DialogTrigger` 等
 * 在 `onPointerDown` 路径里会调用它们 —— 缺失时直接抛错，
 * 导致「点击触发器打不开浮层」这类用例全部失败。
 *
 * 补上这三个方法后，测试可以用真实鼠标路径（`fireEvent.pointerDown`）驱动浮层，
 * 不必绕道键盘路径。
 */
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function hasPointerCapture(): boolean {
    // jsdom 无指针捕获概念，统一返回 false（等同于「未捕获」）
    return false;
  };
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function setPointerCapture(): void {
    // jsdom 无指针捕获概念，空实现即可
  };
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function releasePointerCapture(): void {
    // jsdom 无指针捕获概念，空实现即可
  };
}

/**
 * PointerEvent 构造器桩
 *
 * @description
 * jsdom 未实现 `PointerEvent`。Radix 的触发器依赖 `event.pointerType` 区分
 * 鼠标 / 触摸 / 键盘路径 —— 缺失时事件对象上读不到 `pointerType`，
 * 浮层打不开。用 `MouseEvent` 兜底并补上 `pointerType` 字段即可。
 */
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEventStub extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.pointerType = params.pointerType ?? 'mouse';
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
    }
  }
  globalThis.PointerEvent = PointerEventStub as unknown as typeof PointerEvent;
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);

/**
 * `window.matchMedia` 桩
 *
 * @description
 * jsdom 未实现 `window.matchMedia`，而 embla-carousel（Carousel 的底层实现）
 * 在初始化时会调用 `window.matchMedia(query)` 查询断点，缺失时直接抛
 * `TypeError: window.matchMedia is not a function`。
 * 媒体查询在 jsdom 中无实际意义，统一返回「不匹配」即可。
 */
if (typeof globalThis.matchMedia !== 'function') {
  globalThis.matchMedia = function matchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {
        // jsdom 不支持媒体查询监听，空实现即可
      },
      removeListener: () => {
        // jsdom 不支持媒体查询监听，空实现即可
      },
      addEventListener: () => {
        // jsdom 不支持媒体查询监听，空实现即可
      },
      removeEventListener: () => {
        // jsdom 不支持媒体查询监听，空实现即可
      },
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
}

/**
 * `URL.createObjectURL` / `URL.revokeObjectURL` 桩
 *
 * @description
 * jsdom 未实现 `URL.createObjectURL`，而 `InputImage` 的本地预览、`FileList`
 * 的图片卡片渲染都会调用它生成 blob 地址，缺失时抛
 * `TypeError: URL.createObjectURL is not a function`。
 * 返回固定占位地址即可 —— 测试只关心「是否调用」，不关心真实 blob。
 */
if (typeof globalThis.URL.createObjectURL !== 'function') {
  globalThis.URL.createObjectURL = function createObjectURL(): string {
    return 'blob:easbot-ui/mock-object-url';
  };
}
if (typeof globalThis.URL.revokeObjectURL !== 'function') {
  globalThis.URL.revokeObjectURL = function revokeObjectURL(): void {
    // jsdom 无真实 blob 需要释放，空实现即可
  };
}

export { ResizeObserverStub };
