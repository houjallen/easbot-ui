/**
 * 表格国际化Hook
 * 提供表格国际化功能的完整实现
 */

import { getLocaleOnClient, isSupportedLocale, setLocaleOnClient } from '../../../utils/locale';
import { useCallback, useEffect, useMemo } from 'react';
import { useState } from 'react';
import type { UseTableI18nOptions, UseTableI18nReturn } from '../types';

/**
 * 表格国际化Hook
 * 提供完整的表格国际化功能
 */
export function useTableI18n({
  locale,
  messages,
  onLocaleChange = (locale) => {
    // 仅写入受支持的语言标识 —— setLocaleOnClient 只接受 Locale 类型，
    // 且 getLocaleOnClient 读取时同样会校验，不受支持的语言写入后也不会生效
    if (isSupportedLocale(locale)) {
      setLocaleOnClient(locale, false);
    }
  },
}: UseTableI18nOptions = {}): UseTableI18nReturn {
  // 获取客户端当前语言环境，优先使用传入的locale参数
  const getInitialLocale = useCallback(() => {
    if (locale) return locale;
    try {
      return getLocaleOnClient() || 'zh-CN';
    } catch (error) {
      // 在服务端渲染时可能会出错，使用默认值
      return 'zh-CN';
    }
  }, [locale]);

  // 当前语言状态
  const [currentLocale, setCurrentLocale] = useState<string>(getInitialLocale);

  // 监听客户端语言变化，同步更新状态
  useEffect(() => {
    if (!locale) {
      // 只有在没有明确指定locale时才监听客户端变化
      try {
        const clientLocale = getLocaleOnClient();
        if (clientLocale && clientLocale !== currentLocale) {
          setCurrentLocale(clientLocale);
        }
      } catch (error) {
        // 忽略服务端渲染时的错误
      }
    }
  }, [locale, currentLocale]);

  // 默认国际化文本
  const defaultMessages = useMemo(
    () => ({
      'zh-CN': {
        // 表格操作
        selectAll: '全选',
        selectRow: '选择第 {index} 行',
        expandRow: '展开行',
        collapseRow: '收起行',
        selectNone: '取消全选',
        expandAll: '展开全部',
        collapseAll: '收起全部',

        // 排序
        sortText: '排序',
        sortAscending: '升序',
        sortDescending: '降序',
        cancelSort: '取消排序',
        clickSortAsc: '点击升序排序',
        clickSortDesc: '点击降序排序',
        clickCancelSort: '点击清除排序',

        // 筛选
        filterText: '筛选',
        filterConfirm: '确定',
        filterReset: '重置',
        filterEmptyText: '无筛选项',
        filterCheckAll: '全选',
        filterSearchPlaceholder: '在筛选项中搜索',
        filterApplied: '已应用筛选，点击编辑',
        clickSetFilter: '点击设置筛选',
        dragResizeColumn: '拖拽调整列宽',
        clearFilter: '清除筛选',
        filterPlaceholder: '筛选{title}...',
        resizeColumn: '拖拽调整列宽',

        // 列管理
        columnSettings: '列设置',
        showColumn: '显示列',
        hideColumn: '隐藏列',
        resetColumns: '重置列',

        // 分页相关
        pagination: {
          total: '共 {total} 条',
          page: '第 {current} 页，共 {total} 页',
          pageSize: '每页 {pageSize} 条',
          showTotal: '共 {total} 条记录',
          showSizeChanger: '每页条数',
          showQuickJumper: '跳转到',
          prevText: '上一页',
          nextText: '下一页',
          jumpPrevText: '向前 5 页',
          jumpNextText: '向后 5 页',
          itemsPerPage: '条/页',
          jumpTo: '跳至',
          goto: '跳至',
          go: '确定',
          totalCount: '共 {total} 条',
          totalPage: '共 {lastPage} 页',
          select: '每页 {count} 条',
          current: '第',
          pageClassifier: '页',
          comma: '，',
          totalPrefix: '共',
          totalSuffix: '条',
          perPagePrefix: '每页',
          perPageSuffix: '条',
          totalInfo: '共 {total} 条，第 {from}-{to} 条',
          prev5: '向前 5 页',
          next5: '向后 5 页',
          itemRender: {
            page: '第 {page} 页',
            prev: '上一页',
            next: '下一页',
            jumpPrev: '向前 5 页',
            jumpNext: '向后 5 页',
          },
        },

        // 过滤器相关
        filter: {
          operators: {
            eq: '等于',
            ne: '不等于',
            gt: '大于',
            ge: '大于等于',
            lt: '小于',
            le: '小于等于',
            like: '包含',
            notlike: '不包含',
            startwith: '开头是',
            endwith: '结尾是',
            between: '介于',
            notbetween: '不介于',
            in: '包含于',
            notin: '不包含于',
            isnull: '为空',
            isnotnull: '不为空',
          },
          placeholders: {
            text: '请输入文本',
            number: '请输入数值',
            date: '请选择日期',
            select: '请选择',
            list: '请输入值',
            endValue: '结束值',
            endDate: '结束日期',
            minValue: '最小值',
            maxValue: '最大值',
            selectMultiple: '请选择多项',
            listInput: '请输入值，多个值用逗号分隔',
          },
          options: {
            true: '是',
            false: '否',
          },
          labels: {
            condition: '条件',
            value: '值',
            startValue: '开始值',
            endValue: '结束值',
            apply: '确定',
            clear: '清除',
            filterTitle: '筛选 {column}',
          },
          messages: {
            selectedCount: '已选择 {count} 项',
          },
          actions: {
            selectAll: '全选',
            deselectAll: '取消全选',
          },
        },

        // 状态
        emptyText: '暂无数据',
        loadingText: '加载中...',
        errorText: '加载失败',
        noData: '暂无数据',
        loading: '加载中...',
        error: '加载失败',
        retry: '重试',
        reload: '重新加载',

        // 错误页
        errorPage: {
          title: '加载失败',
        },

        // 特殊值
        nullValue: 'null',
        undefinedValue: 'undefined',
        booleanTrue: '是',
        booleanFalse: '否',

        // 操作
        edit: '编辑',
        delete: '删除',
        view: '查看',
        copy: '复制',
        export: '导出',
        import: '导入',
        refresh: '刷新',

        // 列设置
        columnSetting: '列设置',
        columnDisplay: '列展示',
        columnFixed: '固定列',
        columnSort: '列排序',

        // 密度设置
        densityLarge: '宽松',
        densityMiddle: '中等',
        densitySmall: '紧凑',

        // 全屏
        fullscreen: '全屏',
        exitFullscreen: '退出全屏',

        // 高级表格特有
        print: '打印',
        columnManager: '列管理',
        totalItems: '共 {count} 条数据',
        cached: '已缓存',
        statePersistence: '状态持久化',
        serverMode: '服务端模式',
        cacheEnabled: '缓存已启用 (TTL: {ttl}s)',
        persistenceKey: '状态持久化: {key}',
        pluginsEnabled: '插件: {count} 个已启用',
        tableData: '表格数据',
        printTitle: '表格打印',
        printButton: '打印',
        cannotOpenPrintWindow: '无法打开打印窗口',
        selectAllRows: '全选所有行',

        // 操作列
        actions: '操作',
        operation: '操作',

        // 行操作
        rowAction: {
          title: '操作',
          edit: '编辑',
          delete: '删除',
          view: '查看',
          more: '更多',
        },

        // 搜索相关
        search: {
          title: '搜索',
          search: '搜索',
          reset: '重置',
          all: '全部',
          activeFilters: '个筛选条件',
          clearAll: '清空全部',
          addCondition: '添加搜索条件',
          add: '添加',
          placeholders: {
            text: '请输入文本',
            number: '请输入数字',
            date: '请选择日期',
            select: '请选择',
            list: '请输入值',
            endValue: '结束值',
            endDate: '结束日期',
            minValue: '最小值',
            maxValue: '最大值',
            selectMultiple: '请选择多项',
            listInput: '请输入值，用逗号分隔',
            enterField: '请输入{field}',
          },
        },

        // 字段编辑相关
        fieldEdit: {
          placeholders: {
            text: '请输入内容',
            number: '请输入数字',
            date: '请选择日期',
            select: '请选择',
            list: '请输入值',
            endValue: '结束值',
            endDate: '结束日期',
            minValue: '最小值',
            maxValue: '最大值',
            selectMultiple: '请选择多项',
            listInput: '请输入值，用逗号分隔',
          },
        },
      },
      'en-US': {
        // Table operations
        selectAll: 'Select All',
        selectRow: 'Select Row {index}',
        expandRow: 'Expand Row',
        collapseRow: 'Collapse Row',
        selectNone: 'Deselect All',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All',

        // Sort
        sortText: 'Sort',
        sortAscending: 'Sort Ascending',
        sortDescending: 'Sort Descending',
        cancelSort: 'Cancel Sort',

        // Filter
        filterText: 'Filter',
        filterConfirm: 'OK',
        filterReset: 'Reset',
        filterEmptyText: 'No filters',
        filterCheckAll: 'Select All',
        filterSearchPlaceholder: 'Search in filters',
        filterApplied: 'Filters applied, click to edit',
        clickSetFilter: 'Click to set filter',
        dragResizeColumn: 'Drag to resize column',
        clearFilter: 'Clear filter',
        filterPlaceholder: 'Filter {title}...',
        resizeColumn: 'Drag to resize column',

        // Column settings
        columnSettings: 'Column Settings',
        showColumn: 'Show Column',
        hideColumn: 'Hide Column',
        resetColumns: 'Reset Columns',

        // Pagination
        pagination: {
          total: 'Total {total} items',
          page: 'Page {current} of {total}',
          pageSize: '{pageSize} items per page',
          showTotal: 'Total {total} records',
          showSizeChanger: 'Items per page',
          showQuickJumper: 'Go to',
          prevText: 'Previous',
          nextText: 'Next',
          jumpPrevText: 'Previous 5 Pages',
          jumpNextText: 'Next 5 Pages',
          itemsPerPage: 'items per page',
          jumpTo: 'Go to',
          goto: 'Go to',
          go: 'Go',
          totalCount: 'Total {total} items',
          totalPage: 'Total {lastPage} pages',
          select: '{count} items per page',
          current: 'Page',
          pageClassifier: '',
          comma: ', ',
          totalPrefix: 'Total',
          totalSuffix: 'items',
          perPagePrefix: '',
          perPageSuffix: 'items per page',
          totalInfo: 'Total {total} items, showing {from}-{to}',
          prev5: 'Previous 5 Pages',
          next5: 'Next 5 Pages',
          itemRender: {
            page: 'Page {page}',
            prev: 'Previous',
            next: 'Next',
            jumpPrev: 'Previous 5 Pages',
            jumpNext: 'Next 5 Pages',
          },
        },

        // Status
        emptyText: 'No Data',
        loadingText: 'Loading...',
        errorText: 'Load Failed',
        noData: 'No Data',
        loading: 'Loading...',
        error: 'Load Failed',
        retry: 'Retry',
        reload: 'Reload',

        // Error page
        errorPage: {
          title: 'Load Failed',
        },

        // Special values
        nullValue: 'null',
        undefinedValue: 'undefined',
        booleanTrue: 'Yes',
        booleanFalse: 'No',

        // Actions
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        copy: 'Copy',
        export: 'Export',
        import: 'Import',
        refresh: 'Refresh',

        // Column settings
        columnSetting: 'Column Settings',
        columnDisplay: 'Column Display',
        columnFixed: 'Fixed Columns',
        columnSort: 'Column Sort',

        // Density
        densityLarge: 'Large',
        densityMiddle: 'Middle',
        densitySmall: 'Small',

        // Fullscreen
        fullscreen: 'Fullscreen',
        exitFullscreen: 'Exit Fullscreen',

        // Filter related
        filter: {
          operators: {
            eq: 'Equals',
            ne: 'Not Equals',
            gt: 'Greater Than',
            ge: 'Greater Than or Equal',
            lt: 'Less Than',
            le: 'Less Than or Equal',
            like: 'Contains',
            notlike: 'Does Not Contain',
            startwith: 'Starts With',
            endwith: 'Ends With',
            between: 'Between',
            notbetween: 'Not Between',
            in: 'In',
            notin: 'Not In',
            isnull: 'Is Null',
            isnotnull: 'Is Not Null',
          },
          placeholders: {
            text: 'Enter text',
            number: 'Enter number',
            date: 'Select date',
            select: 'Please select',
            list: 'Enter value',
            endValue: 'End value',
            endDate: 'End date',
            minValue: 'Min value',
            maxValue: 'Max value',
            selectMultiple: 'Select multiple',
            listInput: 'Enter values, separated by commas',
          },
          options: {
            true: 'Yes',
            false: 'No',
          },
          labels: {
            condition: 'Condition',
            value: 'Value',
            startValue: 'Start value',
            endValue: 'End value',
            apply: 'Apply',
            clear: 'Clear',
            filterTitle: 'Filter {column}',
          },
          messages: {
            selectedCount: 'Selected {count} items',
          },
          actions: {
            selectAll: 'Select All',
            deselectAll: 'Deselect All',
          },
        },

        // Advanced table specific
        print: 'Print',
        columnManager: 'Column Manager',
        totalItems: 'Total {count} items',
        cached: 'Cached',
        statePersistence: 'State Persistence',
        serverMode: 'Server Mode',
        cacheEnabled: 'Cache Enabled (TTL: {ttl}s)',

        // Row actions
        rowAction: {
          title: 'Actions',
          edit: 'Edit',
          delete: 'Delete',
          view: 'View',
          more: 'More',
        },
        persistenceKey: 'State Persistence: {key}',
        pluginsEnabled: 'Plugins: {count} enabled',
        tableData: 'Table Data',
        printTitle: 'Table Print',
        printButton: 'Print',
        cannotOpenPrintWindow: 'Cannot open print window',
        selectAllRows: 'Select all rows',

        // 操作列
        actions: 'Actions',
        operation: 'Operation',

        // 搜索相关
        search: {
          title: 'Search',
          search: 'Search',
          reset: 'Reset',
          all: 'All',
          activeFilters: 'active filters',
          clearAll: 'Clear All',
          addCondition: 'Add Search Condition',
          add: 'Add',
          placeholders: {
            text: 'Enter text',
            number: 'Enter number',
            date: 'Select date',
            select: 'Please select',
            list: 'Enter value',
            endValue: 'End value',
            endDate: 'End date',
            minValue: 'Min value',
            maxValue: 'Max value',
            selectMultiple: 'Select multiple',
            listInput: 'Enter values, separated by commas',
            enterField: 'Enter {field}',
          },
        },

        // 编辑相关
        fieldEdit: {
          placeholders: {
            text: 'Enter content',
            number: 'Enter number',
            date: 'Select date',
            select: 'Please select',
            list: 'Enter value',
            endValue: 'End value',
            endDate: 'End date',
            minValue: 'Min value',
            maxValue: 'Max value',
            selectMultiple: 'Select multiple',
            listInput: 'Enter values, separated by commas',
          },
        },
      },
    }),
    [],
  );

  // 合并后的国际化文本
  const mergedMessages = useMemo<Record<string, any>>(() => {
    const baseMessages = defaultMessages[currentLocale as keyof typeof defaultMessages] || defaultMessages['zh-CN'];
    const customMessages = messages?.[currentLocale] || {};
    return { ...baseMessages, ...customMessages };
  }, [currentLocale, messages, defaultMessages]);

  // 辅助函数：通过点号路径获取嵌套对象的值
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }, []);

  // 获取国际化文本
  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      // 首先尝试直接获取
      let message = mergedMessages[key];

      // 如果直接获取失败，尝试通过点号路径获取嵌套值
      if (message === undefined && key.includes('.')) {
        message = getNestedValue(mergedMessages, key);
      }

      // 如果仍然没有找到，使用 key 作为默认值
      if (message === undefined) {
        message = key;
      }

      // 如果提供了参数，进行插值替换
      if (params && typeof message === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{${paramKey}}`;
          message = message.replace(new RegExp(placeholder, 'g'), String(params[paramKey]));
        });
      }

      return String(message);
    },
    [mergedMessages, getNestedValue],
  );

  // 获取本地化文本（简化版的 t 方法）
  const getLocalizedText = useCallback(
    (key: string): string => {
      return mergedMessages[key] || key;
    },
    [mergedMessages],
  );

  // 通用工具方法：支持传入自定义messages参数
  const translateWithMessages = useCallback(
    (key: string, customMessages: Record<string, any>, params?: Record<string, any>): string => {
      // 首先尝试直接获取
      let message = customMessages[key];

      // 如果直接获取失败，尝试通过点号路径获取嵌套值
      if (message === undefined && key.includes('.')) {
        message = getNestedValue(customMessages, key);
      }

      // 如果仍然没有找到，使用 key 作为默认值
      if (message === undefined) {
        message = key;
      }

      // 如果提供了参数，进行插值替换
      if (params && typeof message === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{${paramKey}}`;
          message = message.replace(new RegExp(placeholder, 'g'), String(params[paramKey]));
        });
      }

      return String(message);
    },
    [getNestedValue],
  );

  // 设置语言
  const setLocale = useCallback(
    (newLocale: string) => {
      setCurrentLocale(newLocale);
      onLocaleChange?.(newLocale);
    },
    [onLocaleChange],
  );

  // 获取支持的语言列表
  const getSupportedLocales = useCallback(() => {
    const defaultLocales = Object.keys(defaultMessages);
    const customLocales = messages ? Object.keys(messages) : [];
    return Array.from(new Set([...defaultLocales, ...customLocales]));
  }, [defaultMessages, messages]);

  // 检查是否支持某个语言
  const isLocaleSupported = useCallback(
    (locale: string): boolean => {
      return getSupportedLocales().includes(locale);
    },
    [getSupportedLocales],
  );

  // 返回值
  return useMemo(
    () => ({
      // 状态
      locale: currentLocale,
      messages: mergedMessages,

      // 操作方法
      t,
      setLocale,
      getLocalizedText,
      translateWithMessages,

      // 工具方法
      getSupportedLocales,
      isLocaleSupported,
    }),
    [currentLocale, mergedMessages, t, setLocale, getLocalizedText, translateWithMessages, getSupportedLocales, isLocaleSupported],
  );
}
