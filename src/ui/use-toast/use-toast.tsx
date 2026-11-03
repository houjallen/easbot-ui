import * as React from 'react';
import type { ToastProps } from '../toast/toast';
import type { ToastPosition } from '../toast/types';

type ToastActionElement = React.ReactElement;

const TOAST_LIMIT = 1;

/**
 * 通知**默认展示时长**（毫秒）
 *
 * @description
 * 与 Radix `ToastProvider` 的默认值一致（5000ms）。
 *
 * 📌 **在此集中定义** —— `use-toast` 是所有通知的**唯一入口**，
 *    `variant` / `duration` / `position` 三项默认值都在这里收口，
 *    避免「Provider 层一份、组件层一份」的双轨。
 */
const TOAST_DEFAULT_DURATION = 5000;

/**
 * 通知**关闭后延迟移除**的时长（毫秒）
 *
 * @description
 * 通知关闭（自动超时 / 手动关闭 / 手势滑动）后，
 * 仍需在 DOM 中保留一小段时间，让 Radix 的退出动画播完，
 * 否则会出现「瞬间消失」的生硬观感。
 *
 * 📌 **仅是动画时长，与展示时长无关** ——
 *    展示时长由 `duration` 控制（见 `TOAST_DEFAULT_DURATION`）。
 */
const TOAST_REMOVE_DELAY = 300;

// 支持 CSS 自定义属性的样式类型
// （`React.CSSProperties` 不含 `--xxx` 索引签名，直接索引会报 TS7053；
//   这里用显式的 key 列表而非 `Record<`--${string}`, ...>` 模板字面量索引 ——
//   后者会产生过大的联合类型，导致 TS2590「union type too complex」）
type ToastStyleVars = {
  '--toast-background'?: string;
  '--toast-foreground'?: string;
  '--toast-border'?: string;
  '--toast-shadow'?: string;
  '--toast-max-width'?: string;
  '--toast-z-index'?: string;
  '--toast-gap'?: string;
  '--toast-padding'?: string;
  '--toast-destructive-background'?: string;
  '--toast-destructive-foreground'?: string;
  '--toast-destructive-border'?: string;
  '--toast-success-background'?: string;
  '--toast-success-foreground'?: string;
  '--toast-success-border'?: string;
  '--toast-warning-background'?: string;
  '--toast-warning-foreground'?: string;
  '--toast-warning-border'?: string;
  '--toast-info-background'?: string;
  '--toast-info-foreground'?: string;
  '--toast-info-border'?: string;
};

/** Toast 的样式类型（标准 CSS 属性 + Toast 专属 CSS 变量） */
export type ToastStyle = React.CSSProperties & ToastStyleVars;

/** 通知条目类型（`ToastProps` + 运行时状态） */
export type ToasterToast = ToastProps & {
  id: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  onPause?: (event: React.SyntheticEvent) => void;
  onResume?: (event: React.SyntheticEvent) => void;
  style?: ToastStyle;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

/** 通知状态（模块级 `memoryState` 的结构） */
export interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

/**
 * 触发一条通知
 *
 * @description
 * 所有通知的**唯一入口** —— `variant` / `duration` / `position`
 * 三项的默认值与覆盖优先级都在此收口：
 *
 * | 参数      | 优先级（高 → 低）                                     |
 * | --------- | ---------------------------------------------------- |
 * | `variant` | 调用方显式传值 → `default`                          |
 * | `duration`| 调用方显式传值 → `TOAST_DEFAULT_DURATION`（5000ms） |
 * | `position`| 调用方显式传值 → 保持 `undefined`（由 `Toaster` 回退到自身默认） |
 *
 * 📌 **`position` 刻意不设默认值** —— 保持 `undefined`，
 *    让 `Toaster` 能回退到自己的 `position`；
 *    若在此写死 `'bottom-right'`，则 `Toaster position="top-center"` 这类
 *    全局配置将完全失效。
 *
 * 📌 **`duration` 在此兜底** —— `Infinity` 表示**不自动关闭**，
 *    由消费方显式传入（Radix 支持 `Infinity` 语义）。
 */
function toast({ position, variant, duration, ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
      // 📌 **不设默认值** —— 保持 `undefined` 以便 `Toaster` 回退到自己的
      //    `position`（全局默认位置）。
      //    若在此写死 `'bottom-right'`，则 `toastPosition ?? position` 永远取不到
      //    `Toaster` 的默认值，`Toaster position="top-center"` 这类配置将完全失效。
      position,
      // 📌 **variant 在此兜底为 `default`** —— `Toaster` 依此推导默认标题
      //    （`default` → 内置「提示」文案）。
      variant: variant ?? 'default',
      // 📌 **duration 在此兜底** —— `Infinity` 表示不自动关闭。
      duration: duration ?? TOAST_DEFAULT_DURATION,
      // 📌 **不注入内联 `maxWidth` / `gap` / `padding`** ——
      //    这三项已由 `Toast` 组件的 class 用 token 表达
      //    （`w-[var(--toast-min-width)] max-w-[var(--toast-max-width)]`、
      //      `gap-[var(--eas-gap-sm)]`、`px-[var(--eas-gap-lg)] py-[var(--eas-gap-sm)] pt-9`）。
      //
      //    内联 style 优先级**高于** class，一旦注入就会**静默覆盖**组件样式
      //    （此前 `padding: 1rem` 覆盖了 `pt-9`，导致关闭按钮压住标题）。
      //
      //    消费方仍可通过 `style` 传自定义值覆盖（内联优先级最高）。
      style: props.style,
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss,
  };
}

/**
 * 关闭通知
 *
 * @description
 * 模块级函数，可在**任意位置**调用（事件回调、非组件函数）——
 * 供 `NotifyProvider` 的 `close()` 等场景使用。
 *
 * @param toastId 目标通知 id；缺省时关闭全部通知
 */
function dismiss(toastId?: string) {
  dispatch({ type: 'DISMISS_TOAST', toastId });
}

export { useToast, toast, dismiss };

/**
 * 通知的可选参数
 *
 * @description
 * `toast()` 支持的**全部可选参数** —— 是通知参数的唯一类型来源。
 *
 * 📌 从 `ToasterToast` 中 `Pick` 而非 `ToastProps` ——
 *    `style` 只存在于 `ToasterToast`（`ToastProps` 不含该字段）。
 *
 * 📌 继承 `title` / `description` 等字段 ——
 *    不重复定义标题，标题**只有一处来源**。
 *
 * 📌 `notify-provider` 的 `NotifyOptions` **直接复用本类型**，
 *    不再另起一份 —— 避免「两份定义、两套字段」的漂移。
 */
export type ToastOptions = Pick<ToasterToast, 'title' | 'description' | 'duration' | 'className' | 'position' | 'variant' | 'style'>;

export type { ToastPosition };
