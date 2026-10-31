import * as React from 'react';
import { type ToastProps } from '../toast';
import type { ToastPosition } from '../toast/types';

type ToastActionElement = React.ReactElement;

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 10000;

// 从 CSS 变量中获取 Toast 配置
const getToastStyles = () => {
  const styles = getComputedStyle(document.documentElement);
  return {
    maxWidth: styles.getPropertyValue('--toast-max-width'),
    zIndex: Number.parseInt(styles.getPropertyValue('--toast-z-index'), 10),
    gap: styles.getPropertyValue('--toast-gap'),
    padding: styles.getPropertyValue('--toast-padding'),
  };
};

type ToasterToast = ToastProps & {
  id: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  onPause?: (event: React.SyntheticEvent) => void;
  onResume?: (event: React.SyntheticEvent) => void;
  style?: React.CSSProperties & {
    '--toast-background'?: string;
    '--toast-foreground'?: string;
    '--toast-border'?: string;
    '--toast-shadow'?: string;
  };
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

interface State {
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

function toast({ position = 'bottom-right', ...props }: Toast) {
  const id = genId();
  const styles = getToastStyles();

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
      position,
      style: {
        ...props.style,
        maxWidth: styles.maxWidth,
        zIndex: styles.zIndex,
        gap: styles.gap,
        padding: styles.padding,
      },
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

  // 注册 / 注销状态订阅监听器 —— 与 state 无关，无需把 state 放进依赖数组
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
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };

export type ToastOptions = {
  /** 持续时间（毫秒） */
  duration?: number;
  /** 自定义类名 */
  className?: string;
  /** 显示位置 */
  position?: ToastPosition;
  /** 样式变体 */
  variant?: 'default' | 'destructive' | 'success';
  /** 自定义样式，支持主题变量 */
  style?: React.CSSProperties & {
    '--toast-background'?: string;
    '--toast-foreground'?: string;
    '--toast-border'?: string;
    '--toast-shadow'?: string;
  };
};

export type { ToastPosition };
