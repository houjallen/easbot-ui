/**
 * 组件库内置文案表
 *
 * @description
 * 组件库**自带**用户可见文案的默认文案，按组件域分组。
 * 每个域同时提供 `zh-CN` 与 `en-US` 两种语言，**不允许**只有一种。
 *
 * 设计约束（见 `spec/i18n-standard.md`）：
 * 1. **只走内置模式** —— 统一经 `src/utils/ui-message.ts` 处理，不引入外部 i18n 库。
 * 2. **语言由消费方注入** —— 组件库不持有全局语言状态。
 * 3. **文案可被覆盖** —— 消费方传入的 `messages` 优先于内置文案。
 * 4. **key 命名 camelCase** —— 语义化命名，不暴露实现细节。
 * 5. **占位符用 `{param}`** —— 同一 key 在两种语言中的占位符名称必须一致。
 */

import type { UiMessages } from './ui-message';

/**
 * 表格插件消息表
 *
 * @description
 * 与表格插件的 `messages` 契约对齐：每个 locale 下均为「扁平 key → 字符串」，
 * 且必须存在 `title` 键（见 `TablePluginStandardMessages`）。
 */
export interface TablePluginMessageTable {
  [locale: string]: Record<string, string> & { title: string };
}

/** 组件文案域 */
export type ComponentMessageDomain =
  | 'alert'
  | 'breadcrumb'
  | 'button'
  | 'carousel'
  | 'command'
  | 'date'
  | 'dialog'
  | 'drawer'
  | 'edit'
  | 'file'
  | 'icon'
  | 'locale'
  | 'pagination'
  | 'select'
  | 'sheet'
  | 'sidebar'
  | 'table'
  | 'theme'
  | 'toast'
  | 'tree'
  | 'typography';

/** 提醒 / 确认弹窗文案 */
export const alertMessages = {
  'zh-CN': {
    closeLabel: '关闭',
    dismissLabel: '知道了',
    cancelLabel: '取消',
    confirmLabel: '确认',
    deleteTitle: '确认删除',
    deleteDescription: '删除后不可恢复，确定继续吗？',
    errorTitle: '操作失败',
    errorDescription: '操作未能完成，请稍后重试。',
    closeAriaLabel: '关闭提示',
  },
  'en-US': {
    closeLabel: 'Close',
    dismissLabel: 'Got it',
    cancelLabel: 'Cancel',
    confirmLabel: 'Confirm',
    deleteTitle: 'Confirm Delete',
    deleteDescription: 'This action cannot be undone. Are you sure you want to continue?',
    errorTitle: 'Operation Failed',
    errorDescription: 'The operation could not be completed. Please try again later.',
    closeAriaLabel: 'Dismiss alert',
  },
} satisfies UiMessages;

/** 按钮文案 */
export const buttonMessages = {
  'zh-CN': {
    loading: '加载中…',
    retry: '重试',
    submit: '提交',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    unknownSize: '未知的按钮尺寸 {size}，已回退为 md',
  },
  'en-US': {
    loading: 'Loading…',
    retry: 'Retry',
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    unknownSize: 'Unknown button size {size}, falling back to md',
  },
} satisfies UiMessages;

/** 日期选择器文案 */
export const dateMessages = {
  'zh-CN': {
    selectDate: '请选择日期',
    selectDateRange: '请选择日期范围',
    selectTime: '请选择时间',
    selectTimeRange: '请选择时间范围',
    selectDateTime: '请选择日期时间',
    selectDateTimeRange: '请选择日期时间范围',
    startDate: '开始日期',
    endDate: '结束日期',
    startTime: '开始时间',
    endTime: '结束时间',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    clear: '清除',
    confirm: '确定',
    cancel: '取消',
    invalidDate: '日期格式无效',
    invalidTime: '时间格式无效',
    invalidTimezone: '无效的时区：{timezone}',
    invalidTimezoneComparison: '无效的时区对比：{timezone1} 与 {timezone2}',
    timezoneDetectFailed: '时区探测失败，已回退到 UTC',
    emptyDate: '日期不能为空',
    emptyDateString: '日期字符串为空',
    invalidDateValue: '无效的日期',
    dateFormatMismatch: '日期格式不正确，期望格式：{format}',
    dateParseFailed: '日期解析失败',
    dateFormatFailed: '日期格式化失败',
    unrecognizedDateFormat: '无法识别的日期格式',
    dateBeforeMin: '日期不能早于 {date}',
    dateAfterMax: '日期不能晚于 {date}',
    dateRequired: '请输入日期',
    dateDisabled: '此日期不可选择',
    startTimePrefix: '开始时间：{error}',
    endTimePrefix: '结束时间：{error}',
    startDatePrefix: '开始日期：{error}',
    endDatePrefix: '结束日期：{error}',
    startTimeAfterEndTime: '开始时间不能晚于结束时间',
    startDateAfterEndDate: '开始日期不能晚于结束日期',
    formatHint: '格式：{format}',
    formatPatterns: {
      year: 'YYYY年',
      yearMonth: 'YYYY年MM月',
      yearMonthDay: 'YYYY年MM月DD日',
    },
    mobileFormats: {
      'YYYY-MM-DD HH:mm:ss': 'MM/DD HH:mm',
      'YYYY-MM-DD HH:mm': 'MM/DD HH:mm',
      'YYYY-MM-DD': 'MM/DD',
      YYYY年MM月DD日: 'MM月DD日',
      'YYYY年MM月DD日 HH时mm分ss秒': 'MM月DD日 HH:mm',
    },
    formatExamples: {
      'YYYY-MM-DD': '例如：2024-01-01',
      YYYY年MM月DD日: '例如：2024年01月01日',
      'YYYY/MM/DD': '例如：2024/01/01',
      'YYYY.MM.DD': '例如：2024.01.01',
      'HH:mm:ss': '例如：14:30:00',
      'HH:mm': '例如：14:30',
      'YYYY-MM-DD HH:mm:ss': '例如：2024-01-01 14:30:00',
      'YYYY-MM-DD HH:mm': '例如：2024-01-01 14:30',
      'YYYY年MM月DD日 HH时mm分ss秒': '例如：2024年01月01日 14时30分00秒',
      'YYYY-MM': '例如：2024-01',
      YYYY年MM月: '例如：2024年01月',
      YYYY: '例如：2024',
      YYYY年: '例如：2024年',
      'YYYY-[Q]Q': '例如：2024-Q1',
      YYYY年第Q季度: '例如：2024年第1季度',
    },
    timezoneLabels: {
      utc: '协调世界时 (UTC)',
      shanghai: '中国标准时间 (CST)',
      tokyo: '日本标准时间 (JST)',
      seoul: '韩国标准时间 (KST)',
      hongKong: '香港时间 (HKT)',
      taipei: '台北时间 (CST)',
      singapore: '新加坡时间 (SGT)',
      london: '格林威治标准时间 (GMT)',
      paris: '中欧时间 (CET)',
      berlin: '中欧时间 (CET)',
      newYork: '美国东部时间 (EST)',
      losAngeles: '美国太平洋时间 (PST)',
      chicago: '美国中部时间 (CST)',
      denver: '美国山地时间 (MST)',
    },
  },
  'en-US': {
    selectDate: 'Select date',
    selectDateRange: 'Select date range',
    selectTime: 'Select time',
    selectTimeRange: 'Select time range',
    selectDateTime: 'Select date and time',
    selectDateTimeRange: 'Select date and time range',
    startDate: 'Start date',
    endDate: 'End date',
    startTime: 'Start time',
    endTime: 'End time',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    clear: 'Clear',
    confirm: 'OK',
    cancel: 'Cancel',
    invalidDate: 'Invalid date format',
    invalidTime: 'Invalid time format',
    invalidTimezone: 'Invalid timezone: {timezone}',
    invalidTimezoneComparison: 'Invalid timezone comparison: {timezone1} vs {timezone2}',
    timezoneDetectFailed: 'Failed to detect timezone, falling back to UTC',
    emptyDate: 'Date cannot be empty',
    emptyDateString: 'Date string is empty',
    invalidDateValue: 'Invalid date',
    dateFormatMismatch: 'Incorrect date format, expected format: {format}',
    dateParseFailed: 'Failed to parse date',
    dateFormatFailed: 'Failed to format date',
    unrecognizedDateFormat: 'Unrecognized date format',
    dateBeforeMin: 'Date cannot be earlier than {date}',
    dateAfterMax: 'Date cannot be later than {date}',
    dateRequired: 'Please enter a date',
    dateDisabled: 'This date is not selectable',
    startTimePrefix: 'Start time: {error}',
    endTimePrefix: 'End time: {error}',
    startDatePrefix: 'Start date: {error}',
    endDatePrefix: 'End date: {error}',
    startTimeAfterEndTime: 'Start time cannot be later than end time',
    startDateAfterEndDate: 'Start date cannot be later than end date',
    formatHint: 'Format: {format}',
    formatPatterns: {
      year: 'YYYY',
      yearMonth: 'MMMM YYYY',
      yearMonthDay: 'MMM D, YYYY',
    },
    mobileFormats: {
      'YYYY-MM-DD HH:mm:ss': 'MM/DD HH:mm',
      'YYYY-MM-DD HH:mm': 'MM/DD HH:mm',
      'YYYY-MM-DD': 'MM/DD',
      YYYY年MM月DD日: 'MM/DD',
      'YYYY年MM月DD日 HH时mm分ss秒': 'MM/DD HH:mm',
    },
    formatExamples: {
      'YYYY-MM-DD': 'e.g. 2024-01-01',
      YYYY年MM月DD日: 'e.g. 2024年01月01日',
      'YYYY/MM/DD': 'e.g. 2024/01/01',
      'YYYY.MM.DD': 'e.g. 2024.01.01',
      'HH:mm:ss': 'e.g. 14:30:00',
      'HH:mm': 'e.g. 14:30',
      'YYYY-MM-DD HH:mm:ss': 'e.g. 2024-01-01 14:30:00',
      'YYYY-MM-DD HH:mm': 'e.g. 2024-01-01 14:30',
      'YYYY年MM月DD日 HH时mm分ss秒': 'e.g. 2024年01月01日 14时30分00秒',
      'YYYY-MM': 'e.g. 2024-01',
      YYYY年MM月: 'e.g. 2024年01月',
      YYYY: 'e.g. 2024',
      YYYY年: 'e.g. 2024年',
      'YYYY-[Q]Q': 'e.g. 2024-Q1',
      YYYY年第Q季度: 'e.g. 2024年第1季度',
    },
    timezoneLabels: {
      utc: 'Coordinated Universal Time (UTC)',
      shanghai: 'China Standard Time (CST)',
      tokyo: 'Japan Standard Time (JST)',
      seoul: 'Korea Standard Time (KST)',
      hongKong: 'Hong Kong Time (HKT)',
      taipei: 'Taipei Time (CST)',
      singapore: 'Singapore Time (SGT)',
      london: 'Greenwich Mean Time (GMT)',
      paris: 'Central European Time (CET)',
      berlin: 'Central European Time (CET)',
      newYork: 'Eastern Time (EST)',
      losAngeles: 'Pacific Time (PST)',
      chicago: 'Central Time (CST)',
      denver: 'Mountain Time (MST)',
    },
  },
} satisfies UiMessages;

/** 文件上传下载文案 */
export const fileMessages = {
  'zh-CN': {
    upload: '上传文件',
    uploadImage: '上传图片',
    download: '下载文件',
    preview: '预览',
    remove: '移除',
    replace: '替换',
    maxSizeExceeded: '文件大小超出限制（最大 {max}）',
    typeNotAllowed: '不支持的文件类型：{type}',
    typeNotSupported: '不支持的文件类型，仅支持：{types}',
    minSizeNotReached: '文件大小不能小于 {minSize}',
    uploadFailed: '上传失败',
    uploadFailedWithReason: '上传失败：{error}',
    httpClientMissing: '未注入 HTTP 客户端，无法上传文件',
    downloadFailed: '下载失败',
    downloadFailedWithReason: '下载失败：{error}',
    noFileSelected: '未选择文件',
    uploading: '上传中…',
    uploadSuccess: '上传成功',
    validationFailed: '上传前验证失败',
    maxCountExceeded: '最多只能上传 {max} 个文件',
    selectFile: '请选择文件',
    selectFileButton: '选择文件',
    addFile: '添加文件',
    addImage: '添加图片',
    dropzoneText: '点击或拖拽文件到此区域上传',
    dropzoneHint: '支持单个或批量上传',
    dropzoneRelease: '释放文件开始上传',
    onlyImageFiles: '只能上传图片文件',
    clickOrDragImage: '点击或拖拽图片到此区域上传',
    supportFormats: '支持 JPG、PNG、GIF 等格式，单个文件不超过 {maxSize}MB',
    cropTitle: '裁剪图片',
    cropPending: '裁剪功能待实现',
    confirmCrop: '确认裁剪',
    close: '关闭',
    cancel: '取消',
  },
  'en-US': {
    upload: 'Upload file',
    uploadImage: 'Upload image',
    download: 'Download file',
    preview: 'Preview',
    remove: 'Remove',
    replace: 'Replace',
    maxSizeExceeded: 'File size exceeds the limit (max {max})',
    typeNotAllowed: 'Unsupported file type: {type}',
    typeNotSupported: 'Unsupported file type, only supports: {types}',
    minSizeNotReached: 'File size cannot be less than {minSize}',
    uploadFailed: 'Upload failed',
    uploadFailedWithReason: 'Upload failed: {error}',
    httpClientMissing: 'HTTP client is not provided, cannot upload the file',
    downloadFailed: 'Download failed',
    downloadFailedWithReason: 'Download failed: {error}',
    noFileSelected: 'No file selected',
    uploading: 'Uploading…',
    uploadSuccess: 'Upload successful',
    validationFailed: 'Validation failed before upload',
    maxCountExceeded: 'At most {max} files can be uploaded',
    selectFile: 'Please select a file',
    selectFileButton: 'Select file',
    addFile: 'Add file',
    addImage: 'Add image',
    dropzoneText: 'Click or drag files to this area to upload',
    dropzoneHint: 'Supports single or batch upload',
    dropzoneRelease: 'Release to start uploading',
    onlyImageFiles: 'Only image files can be uploaded',
    clickOrDragImage: 'Click or drag images to this area to upload',
    supportFormats: 'Supports JPG, PNG, GIF formats, single file no more than {maxSize}MB',
    cropTitle: 'Crop Image',
    cropPending: 'Crop function to be implemented',
    confirmCrop: 'Confirm Crop',
    close: 'Close',
    cancel: 'Cancel',
  },
} satisfies UiMessages;

/** 分页文案 */
export const paginationMessages = {
  'zh-CN': {
    total: '共 {total} 条',
    page: '第 {current} 页，共 {total} 页',
    pageSize: '每页 {pageSize} 条',
    prev: '上一页',
    next: '下一页',
    jumpPrev: '向前 5 页',
    jumpNext: '向后 5 页',
    itemsPerPage: '条/页',
    jumpTo: '跳至',
    go: '确定',
    prevAriaLabel: '转到上一页',
    nextAriaLabel: '转到下一页',
    morePages: '更多页',
    navLabel: '分页导航',
  },
  'en-US': {
    total: 'Total {total} items',
    page: 'Page {current} of {total}',
    pageSize: '{pageSize} items per page',
    prev: 'Previous',
    next: 'Next',
    jumpPrev: 'Previous 5 Pages',
    jumpNext: 'Next 5 Pages',
    itemsPerPage: 'items per page',
    jumpTo: 'Go to',
    go: 'Go',
    prevAriaLabel: 'Go to previous page',
    nextAriaLabel: 'Go to next page',
    morePages: 'More pages',
    navLabel: 'pagination',
  },
} satisfies UiMessages;

/** 选择器文案（select / combobox） */
export const selectMessages = {
  'zh-CN': {
    placeholder: '请选择',
    searchPlaceholder: '搜索选项',
    noOptions: '暂无选项',
    clear: '清除',
    selectAll: '全选',
    deselectAll: '取消全选',
    selectedCount: '已选择 {count} 项',
    loading: '加载中…',
    noResults: '未找到匹配结果',
    removeOption: '移除选项',
  },
  'en-US': {
    placeholder: 'Please select',
    searchPlaceholder: 'Search options',
    noOptions: 'No options',
    clear: 'Clear',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selectedCount: 'Selected {count} items',
    loading: 'Loading…',
    noResults: 'No results found.',
    removeOption: 'Remove option',
  },
} satisfies UiMessages;

/** 表格文案（状态 / 交互 / 插件） */
export const tableMessages = {
  'zh-CN': {
    // 状态
    loading: '加载中…',
    noData: '暂无数据',
    error: '加载失败',
    retry: '重试',
    reload: '重新加载',
    // 交互
    reloadFailed: '表格重新加载失败：{error}',
    loadFailed: '表格数据加载失败：{error}',
    submitFailed: '表格参数提交失败：{error}',
    exportFailed: '导出失败：{error}',
    exportSuccess: '导出成功',
    noDataToExport: '没有可导出的数据',
    noSelectedData: '没有选中的数据',
    importFailed: '导入失败：{error}',
    fullscreenFailed: '进入全屏失败：{error}',
    // 选择 / 展开
    selectAll: '全选',
    deselectAll: '取消全选',
    expandAll: '展开全部',
    collapseAll: '收起全部',
    // 排序 / 筛选
    sortAscending: '升序',
    sortDescending: '降序',
    cancelSort: '取消排序',
    filter: '筛选',
    clearFilter: '清除筛选',
    // 固定信息
    actions: '操作',
    more: '更多',
    // 状态栏
    serverMode: '服务器模式',
    localMode: '本地模式',
    cache: '缓存：{status}',
    persistence: '持久化：{status}',
    enabled: '启用',
    disabled: '禁用',
    totalRows: '总计：{count} 行',
    selectedRows: '已选：{count} 行',
    pluginCount: '插件：{count}',
    // 工具栏 / 行操作
    moreActions: '更多操作',
    // 筛选面板
    betweenRequiresTwoValues: '区间操作符需要填写两个值',
    applyFilterFailed: '筛选条件应用失败：{error}',
    // 搜索
    search: '搜索',
    reset: '重置',
    all: '全部',
    // 编辑弹窗
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    saving: '保存中…',
    editTitle: '编辑',
    editDescription: '编辑当前行数据',
    viewTitle: '查看',
    viewDescription: '查看当前行数据',
    noEditableFields: '没有可编辑的字段',
    fieldPlaceholder: '请输入{field}',
    confirmFailed: '确认操作失败：{error}',
    validationFailed: '表单验证失败',
    // 工具层错误
    dateParseFailed: '日期解析失败：{value} 不符合格式 {format}',
    dateConvertFailed: '日期转换失败：{error}',
    invalidTimestamp: '{value} 不是有效的时间戳',
    dateFormatFailed: '日期格式化失败：{error}',
    numberFormatFailed: '数字格式化失败：{error}',
    staticRenderFailed: '静态渲染失败：{error}',
    rangeTypeNotSupported: 'range 类型不支持数据类型 {type}，已回退为单值输入',
    // 字段渲染
    editModeOnly: '仅编辑模式支持',
    addFile: '添加文件',
    addImage: '添加图片',
    defaultImageName: '图片',
    defaultFileName: '文件',
    customContent: '[自定义内容]',
    booleanTrue: '是',
    booleanFalse: '否',
    /** 布尔值可识别取值（数据解析用，非展示文案） */
    booleanTrueWords: ['是', '启用', '开启'],
    booleanFalseWords: ['否', '禁用', '关闭'],
    // 字段占位符（filter / search / edit 场景）
    fieldPlaceholders: {
      filter: {
        text: '请输入文本',
        number: '请输入数字',
        select: '请选择',
        minValue: '最小值',
        maxValue: '最大值',
      },
      options: {
        true: '是',
        false: '否',
      },
      edit: {
        text: '请输入内容',
        number: '请输入数字',
        select: '请选择',
      },
    },
    // 事件 / 插件
    pluginActionNotFound: '未找到动作 {action}',
    pluginActionFailed: '动作 {action} 执行失败：{error}',
    contextMenuColumnResolveFailed: '右键菜单解析列信息失败：{error}',
    // 插件
    pluginInitFailed: '插件初始化失败：{plugin}：{error}',
    pluginDestroyFailed: '插件销毁失败：{plugin}：{error}',
    pluginMissingDependencies: '插件 {plugin} 缺少依赖：{dependencies}',
    pluginConditionFailed: '插件 {plugin} 显示条件执行失败：{error}',
    actionNotFound: '未找到动作 {action}',
    actionExecutionFailed: '动作 {action} 执行失败：{error}',
    pluginAlreadyRegistered: '插件 {plugin} 已注册，将覆盖原有实现',
    pluginNotRegistered: '插件 {plugin} 未注册',
    actionHandlerFailed: 'Action 事件处理器执行失败 [{action}] - {listener}：{error}',
    actionStoppedByInteraction: '由于交互类型为 {interactionType}，停止执行后续监听器',
    listenerConditionFailed: '监听器条件检查出错 [{action}] - {listener}：{error}',
    // 插件：新增
    'plugin.add.title': '新增数据',
    'plugin.add.add': '新增',
    'plugin.add.description': '新增表格数据',
    'plugin.add.tooltip': '新增一行数据',
    // 插件：批量删除
    'plugin.batchDelete.title': '批量删除',
    'plugin.batchDelete.description': '批量删除选中的数据',
    'plugin.batchDelete.tooltip': '删除选中的行',
    'plugin.batchDelete.delete': '删除',
    'plugin.batchDelete.batchDelete': '批量删除',
    'plugin.batchDelete.deleteSelected': '删除选中',
    'plugin.batchDelete.deleteTooltip': '删除选中的行数据',
    'plugin.batchDelete.deleting': '正在删除…',
    'plugin.batchDelete.deleteSuccess': '删除成功',
    'plugin.batchDelete.deleteFailed': '删除失败：{error}',
    'plugin.batchDelete.deleteAll': '删除全部',
    'plugin.batchDelete.deleteAllTooltip': '删除所有数据',
    'plugin.batchDelete.confirmDelete': '确认删除',
    'plugin.batchDelete.confirmDeleteText': '确定要删除选中的 {count} 条记录吗？',
    'plugin.batchDelete.confirmDeleteAllText': '确定要删除所有记录吗？此操作不可撤销！',
    'plugin.batchDelete.noSelectedRows': '请先选择要删除的行',
    'plugin.batchDelete.deleteNotAllowed': '当前数据不允许删除',
    // 插件：列管理
    'plugin.columnManager.title': '列管理',
    'plugin.columnManager.description': '提供表格列显示隐藏和排序功能',
    'plugin.columnManager.tooltip': '管理表格列',
    'plugin.columnManager.enabled': '列管理功能已启用',
    'plugin.columnManager.disabled': '列管理功能已禁用',
    'plugin.columnManager.loading': '正在加载列设置…',
    'plugin.columnManager.error': '列管理操作失败',
    'plugin.columnManager.success': '列设置已更新',
    'plugin.columnManager.columnManager': '列管理',
    'plugin.columnManager.columnSettings': '列设置',
    'plugin.columnManager.showColumn': '显示列',
    'plugin.columnManager.hideColumn': '隐藏列',
    'plugin.columnManager.resetColumns': '重置列',
    'plugin.columnManager.columnDisplay': '列展示',
    'plugin.columnManager.columnSort': '列排序',
    'plugin.columnManager.dragToSort': '拖拽排序',
    'plugin.columnManager.visibleColumns': '显示的列',
    'plugin.columnManager.hiddenColumns': '隐藏的列',
    'plugin.columnManager.emitToggleAllFailed': '列全选事件派发失败：{error}',
    'plugin.columnManager.emitResetFailed': '列重置事件派发失败：{error}',
    // 插件：导出
    'plugin.export.title': '导出数据',
    'plugin.export.description': '导出表格数据',
    'plugin.export.tooltip': '导出表格数据',
    'plugin.export.export': '导出',
    'plugin.export.exportCsv': '导出 CSV',
    'plugin.export.exportJson': '导出 JSON',
    'plugin.export.exportExcel': '导出 Excel',
    'plugin.export.exportAll': '导出全部数据',
    'plugin.export.exportSelected': '导出选中数据',
    'plugin.export.exporting': '正在导出…',
    'plugin.export.exportFailed': '导出失败：{error}',
    'plugin.export.csvDescription': 'CSV 格式，适用于 Excel 等表格软件',
    'plugin.export.jsonDescription': 'JSON 格式，适用于程序处理',
    'plugin.export.excelDescription': 'Excel 格式，保持完整格式',
    // 插件：全屏
    'plugin.fullscreen.title': '全屏',
    'plugin.fullscreen.description': '全屏显示表格',
    'plugin.fullscreen.tooltip': '全屏显示表格',
    'plugin.fullscreen.exitTooltip': '退出全屏显示 (ESC)',
    'plugin.fullscreen.exitTitle': '退出全屏',
    'plugin.fullscreen.success': '已进入全屏模式',
    'plugin.fullscreen.failed': '全屏模式切换失败：{error}',
    'plugin.fullscreen.overlayTitle': '表格全屏显示',
    // 插件：导入
    'plugin.import.title': '导入数据',
    'plugin.import.description': '从文件导入表格数据',
    'plugin.import.tooltip': '从Excel或CSV文件导入数据',
    'plugin.import.import': '导入',
    'plugin.import.importData': '导入数据',
    'plugin.import.importFile': '导入文件',
    'plugin.import.importTooltip': '从Excel或CSV文件导入数据',
    'plugin.import.importing': '正在导入…',
    'plugin.import.importSuccess': '导入成功',
    'plugin.import.importFailed': '导入失败：{error}',
    'plugin.import.selectFile': '选择文件',
    'plugin.import.uploadFile': '上传文件',
    'plugin.import.fileFormat': '文件格式',
    'plugin.import.supportedFormats': '支持的格式：{formats}',
    'plugin.import.fileSizeLimit': '文件大小限制：{size}MB',
    'plugin.import.invalidFileFormat': '不支持的文件格式',
    'plugin.import.fileTooLarge': '文件过大，请选择小于 {size}MB 的文件',
    'plugin.import.fileReadError': '文件读取失败',
    'plugin.import.dataPreview': '数据预览',
    'plugin.import.importedRecords': '已导入 {count} 条记录',
    'plugin.import.duplicateRecords': '发现 {count} 条重复记录',
    'plugin.import.invalidRecords': '发现 {count} 条无效记录',
    'plugin.import.fieldMapping': '字段映射',
    'plugin.import.appendMode': '追加模式',
    'plugin.import.replaceMode': '替换模式',
    'plugin.import.appendModeDesc': '将导入的数据追加到现有数据后',
    'plugin.import.replaceModeDesc': '用导入的数据替换所有现有数据',
    'plugin.import.excelNotSupported': 'Excel文件导入功能需要额外的库支持，请先转换为CSV格式',
    // 插件：打印
    'plugin.print.title': '打印表格',
    'plugin.print.description': '打印表格数据',
    'plugin.print.tooltip': '打印表格数据',
    'plugin.print.print': '打印',
    'plugin.print.printTable': '打印表格',
    'plugin.print.printTooltip': '打印当前表格数据',
    'plugin.print.printSelected': '打印选中',
    'plugin.print.printSelectedTooltip': '只打印选中的行',
    'plugin.print.printAll': '打印全部',
    'plugin.print.printAllTooltip': '打印所有数据',
    'plugin.print.preparing': '正在准备打印…',
    'plugin.print.printSuccess': '打印任务已发送',
    'plugin.print.printFailed': '打印失败：{error}',
    'plugin.print.cannotOpenPrintWindow': '无法打开打印窗口',
    'plugin.print.noDataToPrint': '没有数据可打印',
    'plugin.print.noSelectedData': '没有选中的数据',
    'plugin.print.printSettings': '打印设置',
    'plugin.print.includeHeaders': '包含表头',
    'plugin.print.orientation': '页面方向',
    'plugin.print.portrait': '纵向',
    'plugin.print.landscape': '横向',
    'plugin.print.paperSize': '纸张大小',
    'plugin.print.printTime': '打印时间：{time}',
    'plugin.print.totalRecords': '共 {count} 条记录',
    // 插件：刷新
    'plugin.refresh.title': '刷新数据',
    'plugin.refresh.description': '刷新表格数据',
    'plugin.refresh.tooltip': '刷新表格数据',
    'plugin.refresh.refresh': '刷新',
    'plugin.refresh.refreshData': '刷新数据',
    'plugin.refresh.refreshTooltip': '重新加载表格数据（保持当前页码）',
    'plugin.refresh.refreshing': '正在刷新…',
    'plugin.refresh.refreshSuccess': '刷新成功',
    'plugin.refresh.refreshFailed': '刷新失败：{error}',
    'plugin.refresh.refreshAndReset': '刷新并重置',
    'plugin.refresh.refreshAndResetTooltip': '重新加载数据并回到第一页',
    'plugin.refresh.lastRefreshTime': '最后刷新：{time}',
    'plugin.refresh.refreshedJustNow': '刚刚刷新',
    'plugin.refresh.refreshedMinutesAgo': '{minutes} 分钟前',
    'plugin.refresh.refreshedHoursAgo': '{hours} 小时前',
    'plugin.refresh.autoRefresh': '自动刷新',
    'plugin.refresh.autoRefreshEnabled': '自动刷新已启用',
    'plugin.refresh.autoRefreshDisabled': '自动刷新已禁用',
    'plugin.refresh.autoRefreshInterval': '刷新间隔：{interval}秒',
    // 插件：复制行
    'plugin.copyRow.title': '复制行',
    'plugin.copyRow.description': '复制行数据',
    'plugin.copyRow.tooltip': '复制这行数据',
    'plugin.copyRow.copy': '复制',
    'plugin.copyRow.copyRow': '复制行',
    'plugin.copyRow.copyData': '复制数据',
    'plugin.copyRow.copyTooltip': '复制这行数据',
    'plugin.copyRow.copying': '正在复制…',
    'plugin.copyRow.copySuccess': '复制成功',
    'plugin.copyRow.copyFailed': '复制失败：{error}',
    'plugin.copyRow.copyToClipboard': '复制到剪贴板',
    'plugin.copyRow.copyAsNewRow': '复制为新行',
    'plugin.copyRow.copyAsJson': '复制为JSON',
    'plugin.copyRow.copyAsText': '复制为文本',
    'plugin.copyRow.copyAsCsv': '复制为CSV',
    'plugin.copyRow.copiedToClipboard': '已复制到剪贴板',
    'plugin.copyRow.newRowCreated': '已创建新行',
    'plugin.copyRow.clipboardNotSupported': '浏览器不支持剪贴板操作',
    // 插件：删除行
    'plugin.deleteRow.title': '删除',
    'plugin.deleteRow.description': '删除当前行数据',
    'plugin.deleteRow.tooltip': '点击删除此行',
    'plugin.deleteRow.success': '删除成功',
    'plugin.deleteRow.failed': '删除失败：{error}',
    'plugin.deleteRow.confirmTitle': '确认删除',
    'plugin.deleteRow.confirmContent': '确定要删除这条记录吗？此操作不可撤销。',
    'plugin.deleteRow.confirmOk': '确定',
    'plugin.deleteRow.confirmCancel': '取消',
    // 插件：编辑行
    'plugin.editRow.title': '编辑数据',
    'plugin.editRow.edit': '编辑',
    'plugin.editRow.description': '编辑当前行数据',
    'plugin.editRow.tooltip': '点击编辑此行',
    // 插件：移动行
    'plugin.moveRow.title': '移动行',
    'plugin.moveRow.description': '移动行数据位置',
    'plugin.moveRow.tooltip': '移动这行数据的位置',
    'plugin.moveRow.move': '移动',
    'plugin.moveRow.moveRow': '移动行',
    'plugin.moveRow.moveUp': '上移',
    'plugin.moveRow.moveDown': '下移',
    'plugin.moveRow.moveToTop': '移到顶部',
    'plugin.moveRow.moveToBottom': '移到底部',
    'plugin.moveRow.moveTooltip': '移动这行数据的位置',
    'plugin.moveRow.moving': '正在移动…',
    'plugin.moveRow.moveSuccess': '移动成功',
    'plugin.moveRow.moveFailed': '移动失败：{error}',
    'plugin.moveRow.cannotMoveUp': '已经是第一行，无法上移',
    'plugin.moveRow.cannotMoveDown': '已经是最后一行，无法下移',
    'plugin.moveRow.moveNotAllowed': '当前数据不允许移动',
    'plugin.moveRow.chooseOption': '请输入选项编号 (1-4):',
    'plugin.moveRow.recordNotFound': '未在表格数据中找到该记录',
    // 插件：切换启用状态
    'plugin.toggleRow.title': '切换状态',
    'plugin.toggleRow.description': '切换行数据状态',
    'plugin.toggleRow.tooltip': '切换行状态',
    'plugin.toggleRow.enable': '启用',
    'plugin.toggleRow.enableTooltip': '启用此行数据',
    'plugin.toggleRow.enabling': '正在启用…',
    'plugin.toggleRow.enableSuccess': '启用成功',
    'plugin.toggleRow.enableFailed': '启用失败：{error}',
    'plugin.toggleRow.confirmEnableText': '确定要启用此行数据吗？',
    'plugin.toggleRow.alreadyEnabled': '数据已经是启用状态',
    'plugin.toggleRow.disable': '禁用',
    'plugin.toggleRow.disableTooltip': '禁用此行数据',
    'plugin.toggleRow.disabling': '正在禁用…',
    'plugin.toggleRow.disableSuccess': '禁用成功',
    'plugin.toggleRow.disableFailed': '禁用失败：{error}',
    'plugin.toggleRow.confirmDisableText': '确定要禁用此行数据吗？',
    'plugin.toggleRow.alreadyDisabled': '数据已经是禁用状态',
    'plugin.toggleRow.operationFailed': '操作失败：{error}',
    'plugin.toggleRow.invalidStatus': '无效的状态值',
    // 插件：查看行
    'plugin.viewRow.title': '查看详情',
    'plugin.viewRow.description': '查看行数据详情',
    'plugin.viewRow.tooltip': '查看这行数据的详细信息',
    'plugin.viewRow.view': '查看',
    'plugin.viewRow.viewDetail': '查看详情',
    'plugin.viewRow.viewData': '查看数据',
    'plugin.viewRow.viewTooltip': '查看这行数据的详细信息',
    'plugin.viewRow.viewing': '正在加载…',
    'plugin.viewRow.viewSuccess': '查看成功',
    'plugin.viewRow.viewFailed': '查看失败：{error}',
    'plugin.viewRow.detailInfo': '详细信息',
    'plugin.viewRow.basicInfo': '基本信息',
    'plugin.viewRow.allFields': '所有字段',
    'plugin.viewRow.fieldName': '字段名',
    'plugin.viewRow.fieldValue': '字段值',
    'plugin.viewRow.close': '关闭',
    // 插件：复制单元格
    'plugin.cellCopy.title': '复制单元格',
    'plugin.cellCopy.description': '复制单元格内容到剪贴板',
    'plugin.cellCopy.tooltip': '复制此单元格内容',
    'plugin.cellCopy.copy': '复制单元格',
    'plugin.cellCopy.copying': '复制中…',
    'plugin.cellCopy.copySuccess': '复制成功',
    'plugin.cellCopy.copyFailed': '复制失败：{error}',
    'plugin.cellCopy.copiedToClipboard': '已复制到剪贴板',
    'plugin.cellCopy.noContent': '无内容可复制',
    'plugin.cellCopy.missingData': '缺少列或行数据',
    // 插件：编辑单元格
    'plugin.cellEdit.title': '编辑单元格',
    'plugin.cellEdit.description': '编辑单元格内容',
    'plugin.cellEdit.tooltip': '编辑此单元格内容',
    'plugin.cellEdit.edit': '编辑单元格',
    'plugin.cellEdit.editing': '编辑中…',
    'plugin.cellEdit.editSuccess': '编辑成功',
    'plugin.cellEdit.editFailed': '编辑失败：{error}',
    // 插件：列头筛选
    'plugin.filter.title': '筛选',
    'plugin.filter.description': '点击筛选列数据',
    'plugin.filter.tooltip': '点击筛选',
    'plugin.filter.applyFilter': '应用筛选',
    'plugin.filter.resetFilter': '重置筛选',
    'plugin.filter.failed': '筛选失败：{error}',
    // 插件：列头排序
    'plugin.sort.title': '排序',
    'plugin.sort.description': '点击排序列数据',
    'plugin.sort.tooltip': '点击排序',
    'plugin.sort.clickSortAsc': '点击升序排列',
    'plugin.sort.clickSortDesc': '点击降序排列',
    'plugin.sort.clickCancelSort': '点击取消排序',
    'plugin.sort.failed': '排序失败：{error}',
    // 组件：编辑表单 / 模态
    'form.noEditableFields': '没有可编辑的字段',
    'form.fieldPlaceholder': '请输入{field}',
    'form.confirmFailed': '确认操作失败：{error}',
    'form.validationFailedLog': '表单验证失败',
    // 组件：Toggle 字段
    'search.optionsMissing': '该字段不支持选择模式（缺少 options 配置）',
  },
  'en-US': {
    // Status
    loading: 'Loading…',
    noData: 'No Data',
    error: 'Load Failed',
    retry: 'Retry',
    reload: 'Reload',
    // Interactions
    reloadFailed: 'Failed to reload table: {error}',
    loadFailed: 'Failed to load table data: {error}',
    submitFailed: 'Failed to submit table params: {error}',
    exportFailed: 'Export failed: {error}',
    exportSuccess: 'Export succeeded',
    noDataToExport: 'No data to export',
    noSelectedData: 'No data selected',
    importFailed: 'Import failed: {error}',
    fullscreenFailed: 'Failed to enter fullscreen: {error}',
    // Selection / expansion
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    // Sorting / filtering
    sortAscending: 'Sort Ascending',
    sortDescending: 'Sort Descending',
    cancelSort: 'Cancel Sort',
    filter: 'Filter',
    clearFilter: 'Clear filter',
    // Fixed labels
    actions: 'Actions',
    more: 'More',
    // Status bar
    serverMode: 'Server Mode',
    localMode: 'Local Mode',
    cache: 'Cache: {status}',
    persistence: 'Persistence: {status}',
    enabled: 'Enabled',
    disabled: 'Disabled',
    totalRows: 'Total: {count} rows',
    selectedRows: 'Selected: {count} rows',
    pluginCount: 'Plugins: {count}',
    // Toolbar / row actions
    moreActions: 'More Actions',
    // Filter panel
    betweenRequiresTwoValues: 'Range operator requires two values',
    applyFilterFailed: 'Failed to apply filter: {error}',
    // Search
    search: 'Search',
    reset: 'Reset',
    all: 'All',
    // Edit modal
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving…',
    editTitle: 'Edit',
    editDescription: 'Edit current row data',
    viewTitle: 'View',
    viewDescription: 'View current row data',
    noEditableFields: 'No editable fields',
    fieldPlaceholder: 'Please enter {field}',
    confirmFailed: 'Failed to confirm operation: {error}',
    validationFailed: 'Form validation failed',
    // Utility layer errors
    dateParseFailed: 'Failed to parse date: {value} does not match format {format}',
    dateConvertFailed: 'Failed to convert date: {error}',
    invalidTimestamp: '{value} is not a valid timestamp',
    dateFormatFailed: 'Failed to format date: {error}',
    numberFormatFailed: 'Failed to format number: {error}',
    staticRenderFailed: 'Static render failed: {error}',
    rangeTypeNotSupported: 'Range type does not support data type {type}, falling back to single value input',
    // Field rendering
    editModeOnly: 'Supported in edit mode only',
    addFile: 'Add file',
    addImage: 'Add image',
    defaultImageName: 'Image',
    defaultFileName: 'File',
    customContent: '[Custom content]',
    booleanTrue: 'Yes',
    booleanFalse: 'No',
    /** Recognized boolean values (data parsing only, not display copy) */
    booleanTrueWords: ['是', '启用', '开启'],
    booleanFalseWords: ['否', '禁用', '关闭'],
    // Field placeholders (filter / search / edit scenarios)
    fieldPlaceholders: {
      filter: {
        text: 'Enter text',
        number: 'Enter number',
        select: 'Please select',
        minValue: 'Min value',
        maxValue: 'Max value',
      },
      options: {
        true: 'Yes',
        false: 'No',
      },
      edit: {
        text: 'Enter content',
        number: 'Enter number',
        select: 'Please select',
      },
    },
    // Events / plugins
    pluginActionNotFound: 'Action {action} not found',
    pluginActionFailed: 'Action {action} execution failed: {error}',
    contextMenuColumnResolveFailed: 'Failed to resolve column from context menu event: {error}',
    // Plugins
    pluginInitFailed: 'Failed to initialize plugin {plugin}: {error}',
    pluginDestroyFailed: 'Failed to destroy plugin {plugin}: {error}',
    pluginMissingDependencies: 'Plugin {plugin} is missing dependencies: {dependencies}',
    pluginConditionFailed: 'Plugin {plugin} display condition failed: {error}',
    actionNotFound: 'Action {action} not found',
    actionExecutionFailed: 'Action {action} execution failed: {error}',
    pluginAlreadyRegistered: 'Plugin {plugin} is already registered, overwriting the previous implementation',
    pluginNotRegistered: 'Plugin {plugin} is not registered',
    actionHandlerFailed: 'Action event handler failed [{action}] - {listener}: {error}',
    actionStoppedByInteraction: 'Stopped executing remaining listeners because the interaction type is {interactionType}',
    listenerConditionFailed: 'Listener condition check failed [{action}] - {listener}: {error}',
    // Plugins: Add
    'plugin.add.title': 'Add Data',
    'plugin.add.add': 'Add',
    'plugin.add.description': 'Add table data',
    'plugin.add.tooltip': 'Add a new row',
    // Plugins: Batch delete
    'plugin.batchDelete.title': 'Batch Delete',
    'plugin.batchDelete.description': 'Batch delete selected data',
    'plugin.batchDelete.tooltip': 'Delete selected rows',
    'plugin.batchDelete.delete': 'Delete',
    'plugin.batchDelete.batchDelete': 'Batch Delete',
    'plugin.batchDelete.deleteSelected': 'Delete Selected',
    'plugin.batchDelete.deleteTooltip': 'Delete selected row data',
    'plugin.batchDelete.deleting': 'Deleting…',
    'plugin.batchDelete.deleteSuccess': 'Delete successful',
    'plugin.batchDelete.deleteFailed': 'Delete failed: {error}',
    'plugin.batchDelete.deleteAll': 'Delete All',
    'plugin.batchDelete.deleteAllTooltip': 'Delete all data',
    'plugin.batchDelete.confirmDelete': 'Confirm Delete',
    'plugin.batchDelete.confirmDeleteText': 'Are you sure you want to delete {count} selected records?',
    'plugin.batchDelete.confirmDeleteAllText': 'Are you sure you want to delete all records? This action cannot be undone!',
    'plugin.batchDelete.noSelectedRows': 'Please select rows to delete first',
    'plugin.batchDelete.deleteNotAllowed': 'Current data cannot be deleted',
    // Plugins: Column manager
    'plugin.columnManager.title': 'Column Manager',
    'plugin.columnManager.description': 'Provides table column show/hide and sorting functionality',
    'plugin.columnManager.tooltip': 'Manage table columns',
    'plugin.columnManager.enabled': 'Column manager function enabled',
    'plugin.columnManager.disabled': 'Column manager function disabled',
    'plugin.columnManager.loading': 'Loading column settings…',
    'plugin.columnManager.error': 'Column management operation failed',
    'plugin.columnManager.success': 'Column settings updated',
    'plugin.columnManager.columnManager': 'Column Manager',
    'plugin.columnManager.columnSettings': 'Column Settings',
    'plugin.columnManager.showColumn': 'Show Column',
    'plugin.columnManager.hideColumn': 'Hide Column',
    'plugin.columnManager.resetColumns': 'Reset Columns',
    'plugin.columnManager.columnDisplay': 'Column Display',
    'plugin.columnManager.columnSort': 'Column Sort',
    'plugin.columnManager.dragToSort': 'Drag to Sort',
    'plugin.columnManager.visibleColumns': 'Visible Columns',
    'plugin.columnManager.hiddenColumns': 'Hidden Columns',
    'plugin.columnManager.emitToggleAllFailed': 'Failed to emit column toggle-all event: {error}',
    'plugin.columnManager.emitResetFailed': 'Failed to emit column reset event: {error}',
    // Plugins: Export
    'plugin.export.title': 'Export Data',
    'plugin.export.description': 'Export table data',
    'plugin.export.tooltip': 'Export table data',
    'plugin.export.export': 'Export',
    'plugin.export.exportCsv': 'Export CSV',
    'plugin.export.exportJson': 'Export JSON',
    'plugin.export.exportExcel': 'Export Excel',
    'plugin.export.exportAll': 'Export All Data',
    'plugin.export.exportSelected': 'Export Selected Data',
    'plugin.export.exporting': 'Exporting…',
    'plugin.export.exportFailed': 'Export failed: {error}',
    'plugin.export.csvDescription': 'CSV format, suitable for Excel and other spreadsheet software',
    'plugin.export.jsonDescription': 'JSON format, suitable for program processing',
    'plugin.export.excelDescription': 'Excel format, maintains complete formatting',
    // Plugins: Fullscreen
    'plugin.fullscreen.title': 'Fullscreen',
    'plugin.fullscreen.description': 'Display table in fullscreen',
    'plugin.fullscreen.tooltip': 'Display table in fullscreen',
    'plugin.fullscreen.exitTooltip': 'Exit fullscreen display (ESC)',
    'plugin.fullscreen.exitTitle': 'Exit Fullscreen',
    'plugin.fullscreen.success': 'Entered fullscreen mode',
    'plugin.fullscreen.failed': 'Failed to toggle fullscreen mode: {error}',
    'plugin.fullscreen.overlayTitle': 'Table Fullscreen View',
    // Plugins: Import
    'plugin.import.title': 'Import Data',
    'plugin.import.description': 'Import table data from file',
    'plugin.import.tooltip': 'Import data from Excel or CSV file',
    'plugin.import.import': 'Import',
    'plugin.import.importData': 'Import Data',
    'plugin.import.importFile': 'Import File',
    'plugin.import.importTooltip': 'Import data from Excel or CSV file',
    'plugin.import.importing': 'Importing…',
    'plugin.import.importSuccess': 'Import successful',
    'plugin.import.importFailed': 'Import failed: {error}',
    'plugin.import.selectFile': 'Select File',
    'plugin.import.uploadFile': 'Upload File',
    'plugin.import.fileFormat': 'File Format',
    'plugin.import.supportedFormats': 'Supported formats: {formats}',
    'plugin.import.fileSizeLimit': 'File size limit: {size}MB',
    'plugin.import.invalidFileFormat': 'Unsupported file format',
    'plugin.import.fileTooLarge': 'File too large, please select a file smaller than {size}MB',
    'plugin.import.fileReadError': 'File read error',
    'plugin.import.dataPreview': 'Data Preview',
    'plugin.import.importedRecords': 'Imported {count} records',
    'plugin.import.duplicateRecords': 'Found {count} duplicate records',
    'plugin.import.invalidRecords': 'Found {count} invalid records',
    'plugin.import.fieldMapping': 'Field Mapping',
    'plugin.import.appendMode': 'Append Mode',
    'plugin.import.replaceMode': 'Replace Mode',
    'plugin.import.appendModeDesc': 'Append imported data to existing data',
    'plugin.import.replaceModeDesc': 'Replace all existing data with imported data',
    'plugin.import.excelNotSupported': 'Excel import requires additional library support, please convert to CSV format first',
    // Plugins: Print
    'plugin.print.title': 'Print Table',
    'plugin.print.description': 'Print table data',
    'plugin.print.tooltip': 'Print table data',
    'plugin.print.print': 'Print',
    'plugin.print.printTable': 'Print Table',
    'plugin.print.printTooltip': 'Print current table data',
    'plugin.print.printSelected': 'Print Selected',
    'plugin.print.printSelectedTooltip': 'Print selected rows only',
    'plugin.print.printAll': 'Print All',
    'plugin.print.printAllTooltip': 'Print all data',
    'plugin.print.preparing': 'Preparing to print…',
    'plugin.print.printSuccess': 'Print job sent',
    'plugin.print.printFailed': 'Print failed: {error}',
    'plugin.print.cannotOpenPrintWindow': 'Cannot open print window',
    'plugin.print.noDataToPrint': 'No data to print',
    'plugin.print.noSelectedData': 'No selected data',
    'plugin.print.printSettings': 'Print Settings',
    'plugin.print.includeHeaders': 'Include Headers',
    'plugin.print.orientation': 'Orientation',
    'plugin.print.portrait': 'Portrait',
    'plugin.print.landscape': 'Landscape',
    'plugin.print.paperSize': 'Paper Size',
    'plugin.print.printTime': 'Print time: {time}',
    'plugin.print.totalRecords': 'Total {count} records',
    // Plugins: Refresh
    'plugin.refresh.title': 'Refresh Data',
    'plugin.refresh.description': 'Refresh table data',
    'plugin.refresh.tooltip': 'Refresh table data',
    'plugin.refresh.refresh': 'Refresh',
    'plugin.refresh.refreshData': 'Refresh Data',
    'plugin.refresh.refreshTooltip': 'Reload table data (keep current page)',
    'plugin.refresh.refreshing': 'Refreshing…',
    'plugin.refresh.refreshSuccess': 'Refresh successful',
    'plugin.refresh.refreshFailed': 'Refresh failed: {error}',
    'plugin.refresh.refreshAndReset': 'Refresh & Reset',
    'plugin.refresh.refreshAndResetTooltip': 'Reload data and go to first page',
    'plugin.refresh.lastRefreshTime': 'Last refresh: {time}',
    'plugin.refresh.refreshedJustNow': 'Just now',
    'plugin.refresh.refreshedMinutesAgo': '{minutes} minutes ago',
    'plugin.refresh.refreshedHoursAgo': '{hours} hours ago',
    'plugin.refresh.autoRefresh': 'Auto Refresh',
    'plugin.refresh.autoRefreshEnabled': 'Auto refresh enabled',
    'plugin.refresh.autoRefreshDisabled': 'Auto refresh disabled',
    'plugin.refresh.autoRefreshInterval': 'Refresh interval: {interval}s',
    // Plugins: Copy row
    'plugin.copyRow.title': 'Copy Row',
    'plugin.copyRow.description': 'Copy row data',
    'plugin.copyRow.tooltip': 'Copy this row data',
    'plugin.copyRow.copy': 'Copy',
    'plugin.copyRow.copyRow': 'Copy Row',
    'plugin.copyRow.copyData': 'Copy Data',
    'plugin.copyRow.copyTooltip': 'Copy this row data',
    'plugin.copyRow.copying': 'Copying…',
    'plugin.copyRow.copySuccess': 'Copy successful',
    'plugin.copyRow.copyFailed': 'Copy failed: {error}',
    'plugin.copyRow.copyToClipboard': 'Copy to Clipboard',
    'plugin.copyRow.copyAsNewRow': 'Copy as New Row',
    'plugin.copyRow.copyAsJson': 'Copy as JSON',
    'plugin.copyRow.copyAsText': 'Copy as Text',
    'plugin.copyRow.copyAsCsv': 'Copy as CSV',
    'plugin.copyRow.copiedToClipboard': 'Copied to clipboard',
    'plugin.copyRow.newRowCreated': 'New row created',
    'plugin.copyRow.clipboardNotSupported': 'Clipboard operation not supported by browser',
    // Plugins: Delete row
    'plugin.deleteRow.title': 'Delete',
    'plugin.deleteRow.description': 'Delete current row data',
    'plugin.deleteRow.tooltip': 'Click to delete this row',
    'plugin.deleteRow.success': 'Delete successful',
    'plugin.deleteRow.failed': 'Delete failed: {error}',
    'plugin.deleteRow.confirmTitle': 'Confirm Delete',
    'plugin.deleteRow.confirmContent': 'Are you sure you want to delete this record? This action cannot be undone.',
    'plugin.deleteRow.confirmOk': 'OK',
    'plugin.deleteRow.confirmCancel': 'Cancel',
    // Plugins: Edit row
    'plugin.editRow.title': 'Edit Data',
    'plugin.editRow.edit': 'Edit',
    'plugin.editRow.description': 'Edit current row data',
    'plugin.editRow.tooltip': 'Click to edit this row',
    // Plugins: Move row
    'plugin.moveRow.title': 'Move Row',
    'plugin.moveRow.description': 'Move row data position',
    'plugin.moveRow.tooltip': 'Move the position of this row',
    'plugin.moveRow.move': 'Move',
    'plugin.moveRow.moveRow': 'Move Row',
    'plugin.moveRow.moveUp': 'Move Up',
    'plugin.moveRow.moveDown': 'Move Down',
    'plugin.moveRow.moveToTop': 'Move to Top',
    'plugin.moveRow.moveToBottom': 'Move to Bottom',
    'plugin.moveRow.moveTooltip': 'Move the position of this row',
    'plugin.moveRow.moving': 'Moving…',
    'plugin.moveRow.moveSuccess': 'Move successful',
    'plugin.moveRow.moveFailed': 'Move failed: {error}',
    'plugin.moveRow.cannotMoveUp': 'Already at the top, cannot move up',
    'plugin.moveRow.cannotMoveDown': 'Already at the bottom, cannot move down',
    'plugin.moveRow.moveNotAllowed': 'Current data cannot be moved',
    'plugin.moveRow.chooseOption': 'Please enter the option number (1-4):',
    'plugin.moveRow.recordNotFound': 'Record not found in table data',
    // Plugins: Toggle row status
    'plugin.toggleRow.title': 'Toggle Status',
    'plugin.toggleRow.description': 'Toggle row data status',
    'plugin.toggleRow.tooltip': 'Toggle row status',
    'plugin.toggleRow.enable': 'Enable',
    'plugin.toggleRow.enableTooltip': 'Enable this row',
    'plugin.toggleRow.enabling': 'Enabling…',
    'plugin.toggleRow.enableSuccess': 'Enable successful',
    'plugin.toggleRow.enableFailed': 'Enable failed: {error}',
    'plugin.toggleRow.confirmEnableText': 'Are you sure you want to enable this row?',
    'plugin.toggleRow.alreadyEnabled': 'Data is already enabled',
    'plugin.toggleRow.disable': 'Disable',
    'plugin.toggleRow.disableTooltip': 'Disable this row',
    'plugin.toggleRow.disabling': 'Disabling…',
    'plugin.toggleRow.disableSuccess': 'Disable successful',
    'plugin.toggleRow.disableFailed': 'Disable failed: {error}',
    'plugin.toggleRow.confirmDisableText': 'Are you sure you want to disable this row?',
    'plugin.toggleRow.alreadyDisabled': 'Data is already disabled',
    'plugin.toggleRow.operationFailed': 'Operation failed: {error}',
    'plugin.toggleRow.invalidStatus': 'Invalid status value',
    // Plugins: View row
    'plugin.viewRow.title': 'View Details',
    'plugin.viewRow.description': 'View row data details',
    'plugin.viewRow.tooltip': 'View detailed information of this row',
    'plugin.viewRow.view': 'View',
    'plugin.viewRow.viewDetail': 'View Details',
    'plugin.viewRow.viewData': 'View Data',
    'plugin.viewRow.viewTooltip': 'View detailed information of this row',
    'plugin.viewRow.viewing': 'Loading…',
    'plugin.viewRow.viewSuccess': 'View successful',
    'plugin.viewRow.viewFailed': 'View failed: {error}',
    'plugin.viewRow.detailInfo': 'Detail Information',
    'plugin.viewRow.basicInfo': 'Basic Information',
    'plugin.viewRow.allFields': 'All Fields',
    'plugin.viewRow.fieldName': 'Field Name',
    'plugin.viewRow.fieldValue': 'Field Value',
    'plugin.viewRow.close': 'Close',
    // Plugins: Copy cell
    'plugin.cellCopy.title': 'Copy Cell',
    'plugin.cellCopy.description': 'Copy cell content to clipboard',
    'plugin.cellCopy.tooltip': 'Copy this cell content',
    'plugin.cellCopy.copy': 'Copy Cell',
    'plugin.cellCopy.copying': 'Copying…',
    'plugin.cellCopy.copySuccess': 'Copy Success',
    'plugin.cellCopy.copyFailed': 'Copy failed: {error}',
    'plugin.cellCopy.copiedToClipboard': 'Copied to clipboard',
    'plugin.cellCopy.noContent': 'No content to copy',
    'plugin.cellCopy.missingData': 'Missing column or record data',
    // Plugins: Edit cell
    'plugin.cellEdit.title': 'Edit Cell',
    'plugin.cellEdit.description': 'Edit cell content',
    'plugin.cellEdit.tooltip': 'Edit this cell content',
    'plugin.cellEdit.edit': 'Edit Cell',
    'plugin.cellEdit.editing': 'Editing…',
    'plugin.cellEdit.editSuccess': 'Edit Success',
    'plugin.cellEdit.editFailed': 'Edit failed: {error}',
    // Plugins: Column filter
    'plugin.filter.title': 'Filter',
    'plugin.filter.description': 'Click to filter column data',
    'plugin.filter.tooltip': 'Click to filter',
    'plugin.filter.applyFilter': 'Apply Filter',
    'plugin.filter.resetFilter': 'Reset Filter',
    'plugin.filter.failed': 'Filter failed: {error}',
    // Plugins: Column sort
    'plugin.sort.title': 'Sort',
    'plugin.sort.description': 'Click to sort column data',
    'plugin.sort.tooltip': 'Click to sort',
    'plugin.sort.clickSortAsc': 'Click to sort ascending',
    'plugin.sort.clickSortDesc': 'Click to sort descending',
    'plugin.sort.clickCancelSort': 'Click to cancel sort',
    'plugin.sort.failed': 'Sort failed: {error}',
    // Components: Edit form / modal
    'form.noEditableFields': 'No editable fields',
    'form.fieldPlaceholder': 'Please enter {field}',
    'form.confirmFailed': 'Failed to confirm operation: {error}',
    'form.validationFailedLog': 'Form validation failed',
    // Components: Toggle field
    'search.optionsMissing': 'This field does not support selection mode (missing options config)',
  },
} satisfies UiMessages;

/**
 * 提取表格插件专属文案（扁平、仅字符串）
 *
 * @description
 * 插件的 `messages` 字段要求「locale → key → string」的扁平结构，
 * 而内置 `tableMessages` 内含数组 / 嵌套对象（如 `booleanTrueWords`、`formatPatterns`），
 * 直接赋给插件的 `messages` 会类型不兼容。
 *
 * 本函数按 `plugin.<命名空间>.` 前缀从 `tableMessages` 中筛出插件专属文案，
 * 并剔除值为数组 / 对象的条目，得到可直接挂到插件 `messages` 上的扁平字符串表。
 * 完整文案（含通用 key）仍经 `processMessage(key, tableMessages)` 取用。
 *
 * @param namespace 插件命名空间，如 `'add'`、`'batchDelete'`
 * @returns locale → key → string 的扁平文案表
 */
export function getTablePluginMessages(namespace: string): TablePluginMessageTable {
  const prefix = `plugin.${namespace}.`;
  const result: Record<string, Record<string, string>> = {};

  for (const locale of Object.keys(tableMessages)) {
    const source = tableMessages[locale as keyof typeof tableMessages] as Record<string, unknown>;
    const picked: Record<string, string> = {};

    for (const [key, value] of Object.entries(source)) {
      if (!key.startsWith(prefix)) continue;
      if (typeof value !== 'string') continue;
      picked[key] = value;
    }

    result[locale] = picked;
  }

  // 插件消息契约要求存在 `title` 键（见 TablePluginStandardMessages），
  // 缺省取命名空间下的 `title` 条目。
  for (const locale of Object.keys(result)) {
    const bucket = result[locale];
    if (!bucket) continue;
    if (bucket.title === undefined) {
      bucket.title = bucket[`${prefix}title`] ?? namespace;
    }
  }

  return result as TablePluginMessageTable;
}

/** 通知文案 */
export const toastMessages = {
  'zh-CN': {
    info: '提示',
    success: '成功',
    warning: '警告',
    error: '错误',
    close: '关闭',
    closeAriaLabel: '关闭通知',
  },
  'en-US': {
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    close: 'Close',
    closeAriaLabel: 'Dismiss notification',
  },
} satisfies UiMessages;

/** 树组件文案 */
export const treeMessages = {
  'zh-CN': {
    expand: '展开',
    collapse: '收起',
    expandAll: '展开全部',
    collapseAll: '收起全部',
    noData: '暂无数据',
    selectNode: '选择节点',
    expandAriaLabel: '展开节点',
    collapseAriaLabel: '收起节点',
  },
  'en-US': {
    expand: 'Expand',
    collapse: 'Collapse',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    noData: 'No Data',
    selectNode: 'Select node',
    expandAriaLabel: 'Expand node',
    collapseAriaLabel: 'Collapse node',
  },
} satisfies UiMessages;

/** 对话框文案（dialog / sheet / drawer） */
export const dialogMessages = {
  'zh-CN': {
    closeAriaLabel: '关闭',
    maximize: '最大化',
    restore: '还原',
  },
  'en-US': {
    closeAriaLabel: 'Close',
    maximize: 'Maximize',
    restore: 'Restore',
  },
} satisfies UiMessages;

/** 编辑器文案（ListEditor / ObjectEditor） */
export const editMessages = {
  'zh-CN': {
    listPlaceholder: '请输入内容',
    listAddItem: '添加项目',
    listItemUnit: '项',
    listItemsUnit: '项',
    listMoreItemsUnit: '项…',
    objectPlaceholder: '点击编辑对象',
    objectKeyPlaceholder: '键',
    objectValuePlaceholder: '值',
    objectAddProperty: '添加属性',
    propertyUnit: '个属性',
    confirm: '确定',
  },
  'en-US': {
    listPlaceholder: 'Please enter content',
    listAddItem: 'Add item',
    listItemUnit: 'item',
    listItemsUnit: 'items',
    listMoreItemsUnit: 'items…',
    objectPlaceholder: 'Click to edit object',
    objectKeyPlaceholder: 'Key',
    objectValuePlaceholder: 'Value',
    objectAddProperty: 'Add property',
    propertyUnit: 'properties',
    confirm: 'Confirm',
  },
} satisfies UiMessages;

/** 排版组件文案（typography） */
export const typographyMessages = {
  'zh-CN': {
    imageAlt: '图片',
    fileFallbackName: '文件',
  },
  'en-US': {
    imageAlt: 'Image',
    fileFallbackName: 'File',
  },
} satisfies UiMessages;

/** 图标文案（theme 图标的 aria-label / title） */
export const iconMessages = {
  'zh-CN': {
    darkMode: '深色模式',
    lightMode: '浅色模式',
    systemMode: '跟随系统',
  },
  'en-US': {
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    systemMode: 'System Mode',
  },
} satisfies UiMessages;

/** 命令面板文案（command） */
export const commandMessages = {
  'zh-CN': {
    dialogTitle: '命令面板',
    dialogDescription: '搜索要执行的命令…',
  },
  'en-US': {
    dialogTitle: 'Command Palette',
    dialogDescription: 'Search for a command to run…',
  },
} satisfies UiMessages;

/** 轮播图文案（carousel） */
export const carouselMessages = {
  'zh-CN': {
    prevSlide: '上一张幻灯片',
    nextSlide: '下一张幻灯片',
    carouselRoleDescription: '轮播图',
    slideRoleDescription: '幻灯片',
  },
  'en-US': {
    prevSlide: 'Previous slide',
    nextSlide: 'Next slide',
    carouselRoleDescription: 'carousel',
    slideRoleDescription: 'slide',
  },
} satisfies UiMessages;

/** 面包屑文案（breadcrumb） */
export const breadcrumbMessages = {
  'zh-CN': {
    more: '更多',
    navLabel: '面包屑导航',
  },
  'en-US': {
    more: 'More',
    navLabel: 'breadcrumb',
  },
} satisfies UiMessages;

/** 抽屉文案（drawer） */
export const drawerMessages = {
  'zh-CN': {
    closeLabel: '关闭',
  },
  'en-US': {
    closeLabel: 'Close',
  },
} satisfies UiMessages;

/** 侧边栏文案（sidebar） */
export const sidebarMessages = {
  'zh-CN': {
    toggleLabel: '切换侧边栏',
    mobileTitle: '侧边栏',
    mobileDescription: '展示移动端侧边栏。',
  },
  'en-US': {
    toggleLabel: 'Toggle Sidebar',
    mobileTitle: 'Sidebar',
    mobileDescription: 'Displays the mobile sidebar.',
  },
} satisfies UiMessages;

/** 侧边抽屉文案（sheet） */
export const sheetMessages = {
  'zh-CN': {
    closeLabel: '关闭',
  },
  'en-US': {
    closeLabel: 'Close',
  },
} satisfies UiMessages;

/**
 * 主题切换文案（mode-toggle）
 */
export const themeMessages = {
  'zh-CN': {
    toggleLabel: '切换主题',
    lightMode: '浅色模式',
    darkMode: '深色模式',
    systemMode: '跟随系统',
  },
  'en-US': {
    toggleLabel: 'Toggle theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemMode: 'System Mode',
  },
} satisfies UiMessages;

/**
 * 语言切换文案（locale-toggle）
 *
 * @description
 * `toggleLabel` 是按钮的无障碍名称；`zhCN` / `enUS` 是语言项的显示名 ——
 * **始终以各自语言的本名显示**（简体中文显示「简体中文」，而非「Chinese」），
 * 这是语言选择器的通行做法，用户能一眼认出母语。
 */
export const localeMessages = {
  'zh-CN': {
    toggleLabel: '切换语言',
    zhCN: '简体中文',
    enUS: 'English',
  },
  'en-US': {
    toggleLabel: 'Switch language',
    zhCN: '简体中文',
    enUS: 'English',
  },
} satisfies UiMessages;

/**
 * 内置文案表 —— 域 → 消息表
 */
export const componentMessages = {
  alert: alertMessages,
  breadcrumb: breadcrumbMessages,
  button: buttonMessages,
  carousel: carouselMessages,
  command: commandMessages,
  date: dateMessages,
  dialog: dialogMessages,
  drawer: drawerMessages,
  edit: editMessages,
  file: fileMessages,
  icon: iconMessages,
  locale: localeMessages,
  pagination: paginationMessages,
  select: selectMessages,
  sheet: sheetMessages,
  sidebar: sidebarMessages,
  table: tableMessages,
  theme: themeMessages,
  toast: toastMessages,
  tree: treeMessages,
  typography: typographyMessages,
} satisfies Record<ComponentMessageDomain, UiMessages>;
