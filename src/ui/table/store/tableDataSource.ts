import type { DataStorePage, DataStoreSorting, FilterRule } from '../../../models/index';

/**
 * 表格远端数据 —— 请求参数契约
 *
 * @description
 * 与 `DataStorePage`（分页契约）保持同构，但**只保留发起请求必需的字段**，
 * 避免消费方误把 `list` / `fields` / `total` 当作请求参数回传。
 */
export interface TableFetchParams {
  /** 页码，从 1 开始 */
  pageNo: number;
  /** 每页条数 */
  pageSize: number;
  /** 排序规则 */
  sorting?: DataStoreSorting[];
  /** 过滤规则树 */
  filter?: FilterRule;
  /** 额外查询参数 */
  params?: Record<string, unknown>;
}

/**
 * 表格远端数据 —— 响应契约
 *
 * @description
 * 消费方需在自己的 `fetcher` 内把后端响应解包成这个形状
 * （组件库不假定 `{ code, data, msg }` 这类包裹格式）。
 */
export interface TableFetchResult {
  /** 当前页数据 */
  list?: Array<Record<string, unknown>>;
  /** 总条数 */
  total?: number;
  /** 当前页码（后端回传时以回传值为准） */
  pageNo?: number;
  /** 每页条数（后端回传时以回传值为准） */
  pageSize?: number;
  /** 其他透传字段 */
  [key: string]: unknown;
}

/**
 * 表格远端数据 —— 请求发起函数
 *
 * @param params 请求参数
 * @param context 上下文（`signal` 用于主动中止在途请求）
 */
export type TableFetcher = (params: TableFetchParams, context?: { signal?: AbortSignal }) => Promise<TableFetchResult>;

/**
 * 表格远端数据 —— 状态快照
 */
export interface TableDataSourceState {
  /** 当前页数据 */
  data: Array<Record<string, unknown>>;
  /** 加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 总条数 */
  total: number;
  /** 当前页码 */
  pageNo: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 表格远端数据 —— 配置项
 */
export interface TableDataSourceOptions {
  /** 请求发起函数（消费方注入，内部需把响应解包为 `TableFetchResult`） */
  fetcher: TableFetcher;
  /** 默认每页条数，默认 10 */
  defaultPageSize?: number;
  /** 初始总条数，默认 0 */
  defaultTotal?: number;
  /** 请求成功回调 */
  onSuccess?: (result: TableFetchResult, params: TableFetchParams) => void;
  /** 请求失败回调（消费方可在此接入 toast 提示） */
  onError?: (error: Error, params: TableFetchParams) => void;
}

/**
 * 表格远端数据 —— 操作接口
 */
export interface TableDataSourceApi {
  /** 当前状态快照 */
  getState: () => TableDataSourceState;
  /** 订阅状态变更，返回取消订阅函数 */
  subscribe: (listener: (state: TableDataSourceState) => void) => () => void;
  /** 发起请求（内部处理竞态：后发先至，过期响应丢弃） */
  fetch: (params: Partial<TableFetchParams>) => Promise<TableFetchResult | null>;
  /** 复用上次查询条件重新请求 */
  reload: () => Promise<TableFetchResult | null>;
  /** 仅更新本地数据（不发起请求） */
  setData: (data: Array<Record<string, unknown>>) => void;
  /** 仅更新总条数（不发起请求） */
  setTotal: (total: number) => void;
  /** 销毁（中止在途请求并清理监听器） */
  destroy: () => void;
}

/**
 * 创建表格远端数据源
 *
 * @description
 * 借鉴 hxsoft-js `DataStoreBase` 的核心设计，但**不绑定任何 HTTP 客户端**：
 *
 * 1. **请求参数先于请求落地** —— 发请求前就把参数写入内部 `page`，
 *    保证 `reload()` 能复用上次查询条件，不依赖后端回传。
 * 2. **竞态保护** —— 每次请求递增序号，响应回来时校验序号，
 *    过期响应直接丢弃（旧响应不会覆盖新数据）。
 *    同时通过 `AbortController` 主动中止上一次在途请求。
 * 3. **四态统一管理** —— `data` / `loading` / `error` / `total` 由本容器统一维护。
 *
 * 与 hxsoft-js 的差异（有意为之）：
 * - 不绑定 axios / defHttp，请求由消费方通过 `fetcher` 注入
 * - 不做 local/session 持久化
 * - 不做本地增删改合并（`localAdds` / `localEdits` / `localDeletes`）
 * - 不内置 CRUDL 动作集
 *
 * @param options 配置项
 * @returns 数据源操作接口
 */
export function createTableDataSource(options: TableDataSourceOptions): TableDataSourceApi {
  const { fetcher, defaultPageSize = 10, defaultTotal = 0 } = options;

  let state: TableDataSourceState = {
    data: [],
    loading: false,
    error: null,
    total: defaultTotal,
    pageNo: 1,
    pageSize: defaultPageSize,
  };

  /** 最近一次请求的参数（供 `reload` 复用） */
  let lastParams: Partial<TableFetchParams> = {};

  const listeners = new Set<(state: TableDataSourceState) => void>();

  /** 请求序号 —— 用于丢弃过期响应 */
  let requestSeq = 0;
  /** 在途请求的中止控制器 */
  let abortController: AbortController | null = null;

  const setState = (patch: Partial<TableDataSourceState>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => {
      listener(state);
    });
  };

  const destroy = () => {
    abortController?.abort();
    abortController = null;
    listeners.clear();
  };

  const fetch = async (params: Partial<TableFetchParams>): Promise<TableFetchResult | null> => {
    // 中止上一次在途请求，避免无谓的网络占用
    abortController?.abort();
    const controller = new AbortController();
    abortController = controller;

    const seq = ++requestSeq;

    const mergedParams: TableFetchParams = {
      pageNo: params.pageNo ?? state.pageNo ?? 1,
      pageSize: params.pageSize ?? state.pageSize ?? defaultPageSize,
      sorting: params.sorting,
      filter: params.filter,
      params: params.params,
    };

    // 请求参数先落地，保证 reload 能复用本次查询条件
    lastParams = mergedParams;
    setState({ loading: true, error: null, pageNo: mergedParams.pageNo, pageSize: mergedParams.pageSize });

    try {
      const result = await fetcher(mergedParams, { signal: controller.signal });

      // 序号校验 —— 过期响应直接丢弃
      if (seq !== requestSeq) {
        return null;
      }

      setState({
        data: result?.list ?? [],
        total: typeof result?.total === 'number' ? result.total : state.total,
        loading: false,
        error: null,
      });

      options.onSuccess?.(result, mergedParams);
      return result;
    } catch (error) {
      // 已被新请求取代，或被主动中止 —— 一律忽略
      if (seq !== requestSeq || controller.signal.aborted) {
        return null;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      setState({ loading: false, error: err.message });
      options.onError?.(err, mergedParams);
      return null;
    } finally {
      if (seq === requestSeq) {
        abortController = null;
      }
    }
  };

  const reload = () => fetch(lastParams);

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    fetch,
    reload,
    setData: (data) => {
      setState({ data });
    },
    setTotal: (total) => {
      setState({ total });
    },
    destroy,
  };
}

/**
 * 把表格分页契约转换为远端请求参数
 *
 * @description
 * 复用 `useTableStorePage` 产出的 `DataStorePage`，
 * 剔除仅属于响应侧的字段（`list` / `total` / `fields` / `context`）。
 *
 * @param page 分页契约
 * @returns 请求参数
 */
export function toFetchParams(page: DataStorePage): TableFetchParams {
  return {
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    sorting: page.sorting,
    filter: page.filter,
    params: page.params,
  };
}
