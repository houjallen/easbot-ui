import { isEmpty } from '../../../utils/object';
import dayjs from 'dayjs';
import type { DataModeConfig, DataType, FilterOperator, FilterValue, PaginationState, SearchCondition, SortState, TableColumn } from '../types';

/**
 * 表格业务数据处理工具函数
 * 分离过滤(filter)、搜索(search)、排序(sort)功能
 */

/**
 * 执行单个过滤条件的匹配
 * @param recordValue 记录中的字段值
 * @param operator 操作符
 * @param value 过滤值数组
 * @param dataType 数据类型
 * @returns 是否匹配
 */
export function executeFilterCondition(recordValue: any, operator: FilterOperator, value: any[], dataType: DataType): boolean {
  // 对于空值操作符，不需要检查 value
  if (operator === 'isnull' || operator === 'isnotnull') {
    switch (operator) {
      case 'isnull':
        return recordValue == null || recordValue === '';
      case 'isnotnull':
        return recordValue != null && recordValue !== '';
    }
  }

  // 其他操作符需要有效的 value
  if (isEmpty(value)) {
    return true; // 没有值则跳过筛选
  }

  // 根据数据类型转换值
  // date 必须为时间戳类型需要转换为 dayjs 对象
  const convertValue = (val: any) => {
    switch (dataType) {
      case 'number':
        return Number(val);
      case 'date':
        return dayjs(val).toDate();
      case 'boolean':
        return Boolean(val);
      default:
        return String(val);
    }
  };

  const convertedRecordValue = convertValue(recordValue);
  const convertedValues = value.map(convertValue);

  // isEmpty 守卫保证 value 非空，故首个比较值必定存在
  const firstValue = convertedValues[0] as ReturnType<typeof convertValue>;

  // 根据操作符执行不同的筛选逻辑
  switch (operator) {
    case 'eq':
      return convertedRecordValue === firstValue;
    case 'ne':
      return convertedRecordValue !== firstValue;
    case 'gt':
      return convertedRecordValue > firstValue;
    case 'ge':
      return convertedRecordValue >= firstValue;
    case 'lt':
      return convertedRecordValue < firstValue;
    case 'le':
      return convertedRecordValue <= firstValue;
    case 'like':
      return String(convertedRecordValue).toLowerCase().includes(String(firstValue).toLowerCase());
    case 'notlike':
      return !String(convertedRecordValue).toLowerCase().includes(String(firstValue).toLowerCase());
    case 'between':
      if (convertedValues.length >= 2) {
        return convertedRecordValue >= firstValue && convertedRecordValue <= (convertedValues[1] as ReturnType<typeof convertValue>);
      }
      return true;
    case 'notbetween':
      if (convertedValues.length >= 2) {
        return !(convertedRecordValue >= firstValue && convertedRecordValue <= (convertedValues[1] as ReturnType<typeof convertValue>));
      }
      return true;
    case 'in':
      return convertedValues.includes(convertedRecordValue);
    case 'notin':
      return !convertedValues.includes(convertedRecordValue);
    case 'startwith':
      return String(convertedRecordValue).toLowerCase().startsWith(String(firstValue).toLowerCase());
    case 'endwith':
      return String(convertedRecordValue).toLowerCase().endsWith(String(firstValue).toLowerCase());
    default:
      return true;
  }
}

/**
 * 应用筛选条件到数据记录
 * @param record 数据记录
 * @param filterState 筛选状态
 * @param getFieldValue 获取字段值的函数
 * @param customFilterer 自定义筛选函数
 * @returns 是否通过筛选
 */
export function applyFilterConditions(
  record: Record<string, any>,
  filterState: Record<string, FilterValue>,
  getFieldValue?: (record: Record<string, any>, field: string) => any,
  customFilterer?: (filterValue: FilterValue, record: Record<string, any>) => boolean,
): boolean {
  return Object.entries(filterState).every(([field, filterValue]) => {
    if (!filterValue) return true;

    // 使用自定义筛选函数
    if (customFilterer) {
      const customResult = customFilterer(filterValue, record);
      // 如果自定义筛选函数返回 false，直接返回 false
      // 如果返回 true，继续使用默认筛选逻辑
      if (customResult === false) {
        return false;
      }
    }

    // 获取记录值 - 使用 filterValue.field（dataIndex）获取数据
    const fieldName = filterValue.field || field;
    const recordValue = getFieldValue ? getFieldValue(record, filterValue.field || field) : record[fieldName];

    const { op, value, type = 'string' } = filterValue;

    return executeFilterCondition(recordValue, op, value, type);
  });
}

/**
 * 应用搜索条件到数据记录
 * @param record 数据记录
 * @param searchState 搜索状态
 * @param getFieldValue 获取字段值的函数
 * @returns 是否通过搜索
 */
export function applySearchConditions(record: Record<string, any>, searchState: Record<string, SearchCondition>, getFieldValue?: (record: Record<string, any>, field: string) => any): boolean {
  return Object.entries(searchState).every(([fieldKey, condition]) => {
    if (!condition) return true;

    const { field, operator = 'eq', value, type = 'string' } = condition;

    // 多字段搜索：任意一个字段匹配即可（OR逻辑）
    // 注意：这里的逻辑是正确的
    // - every(): 所有搜索条件都必须满足（多个搜索条件之间是AND关系）
    // - some(): 单个搜索条件的多个字段中任意一个匹配即可（单个条件内是OR关系）
    return field.some((dataIndex) => {
      // field 数组中存储的是 dataIndex，直接传递给 getFieldValue
      const recordValue = getFieldValue ? getFieldValue(record, dataIndex) : record[dataIndex];

      return executeFilterCondition(recordValue, operator, value, type);
    });
  });
}

/**
 * 应用筛选条件过滤数据
 * @param data 原始数据
 * @param filterState 筛选状态
 * @param options 配置选项
 * @returns 筛选后的数据
 */
export function applyTableFilter(
  data: Record<string, any>[],
  filterState?: Record<string, FilterValue>,
  options?: {
    getFieldValue?: (record: Record<string, any>, field: string) => any;
    customFilterer?: (filterValue: FilterValue, record: Record<string, any>) => boolean;
  },
): Record<string, any>[] {
  if (!filterState || isEmpty(filterState)) {
    return data;
  }

  return data.filter((record) => applyFilterConditions(record, filterState, options?.getFieldValue, options?.customFilterer));
}

/**
 * 应用搜索条件过滤数据
 * @param data 原始数据
 * @param searchState 搜索状态
 * @param options 配置选项
 * @returns 搜索后的数据
 */
export function applyTableSearch(
  data: Record<string, any>[],
  searchState?: Record<string, SearchCondition>,
  options?: {
    getFieldValue?: (record: Record<string, any>, field: string) => any;
  },
): Record<string, any>[] {
  if (!searchState || isEmpty(searchState)) {
    return data;
  }

  return data.filter((record) => applySearchConditions(record, searchState, options?.getFieldValue));
}

/**
 * 应用排序条件到数据
 * @param data 原始数据
 * @param sortState 排序状态
 * @param columns 列配置，用于获取 dataIndex
 * @returns 排序后的数据
 */
export function applyTableSort(data: Record<string, any>[], sortState?: SortState, columns?: TableColumn[]): Record<string, any>[] {
  if (!sortState?.columnName || !sortState?.order) {
    return data;
  }

  // 通过 columnName 查找列对象
  const column = columns?.find((col) => col.name === sortState.columnName);

  // 使用 column.dataIndex 作为实际的数据字段名
  const fieldName = column?.dataIndex || sortState.columnName;

  return [...data].sort((a, b) => {
    const aValue = a[fieldName];
    const bValue = b[fieldName];
    const order = sortState.order === 'asc' ? 1 : -1;

    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  });
}

/**
 * 应用分页条件到数据
 * @param data 原始数据
 * @param paginationState 分页状态
 * @returns 分页后的数据
 */
export function applyTablePagination(data: Record<string, any>[], paginationState?: PaginationState): Record<string, any>[] {
  const { pageNo = 1, pageSize = 10 } = paginationState as PaginationState;
  const startIndex = (pageNo - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

/**
 * 综合处理表格数据（支持4个业务参数和 dataMode 配置）
 * @param data 原始数据
 * @param options 处理选项
 * @returns 处理后的数据
 */
export function processTableData(
  data: Record<string, any>[],
  options?: {
    /** 筛选状态 */
    filterState?: Record<string, FilterValue>;
    /** 搜索状态 */
    searchState?: Record<string, SearchCondition>;
    /** 排序状态 */
    sortState?: SortState;
    /** 分页状态 */
    paginationState?: PaginationState;
    /** 数据处理模式配置 */
    dataMode?: DataModeConfig;
    /** 列配置 */
    columns?: TableColumn[];
    /** 字段值获取函数 */
    getFieldValue?: (record: Record<string, any>, field: string) => any;
    /** 自定义筛选函数 */
    customFilterer?: (filterValue: FilterValue, record: Record<string, any>) => boolean;
  },
): Record<string, any>[] {
  let result = data;
  const { filterState, searchState, sortState, paginationState, dataMode, columns, getFieldValue, customFilterer } = options || {};

  // 1. 应用搜索条件（仅在本地模式下）
  if (!isEmpty(searchState) && dataMode?.search === 'local') {
    result = applyTableSearch(result, searchState, { getFieldValue });
  }

  // 2. 应用筛选条件（仅在本地模式下）
  if (!isEmpty(filterState) && dataMode?.filter === 'local') {
    result = applyTableFilter(result, filterState, {
      getFieldValue,
      customFilterer,
    });
  }

  // 3. 应用排序（仅在本地模式下）
  if (sortState?.columnName && sortState?.order && dataMode?.sort === 'local') {
    result = applyTableSort(result, sortState, columns);
  }

  // 4. 应用分页（仅在本地模式下）
  if (paginationState && dataMode?.pagination === 'local') {
    result = applyTablePagination(result, paginationState);
  }

  return result;
}

/**
 * @deprecated 使用 processTableData 替代
 * 保持向后兼容
 */
export const filterData = processTableData;
