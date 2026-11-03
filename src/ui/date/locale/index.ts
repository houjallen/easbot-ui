import type { Locale } from '../../../utils/locale';

// 日期选择器多语言配置类型
export interface DatePickerLocale {
  // 基础文本
  placeholder: string;
  placeholderTime: string;
  placeholderDateRange: string;
  placeholderTimeRange: string;
  placeholderRange: string;
  selectDate: string;
  selectTime: string;
  selectDateTime: string;
  confirm: string;
  cancel: string;
  clear: string;
  today: string;
  now: string;
  quickSelect: string;
  currentSelection: string;
  notSelected: string;
  dateDisabled: string;
  formatError: string;
  formatExample: string;
  noData: string;
  loading: string;
  previous: string;
  next: string;
  previousYear: string;
  nextYear: string;
  previousMonth: string;
  nextMonth: string;
  previousDecade: string;
  nextDecade: string;
  selectYear: string;
  selectMonth: string;
  selectQuarter: string;
  selectHour: string;
  selectMinute: string;
  selectSecond: string;
  selectAll: string;
  deselectAll: string;
  reset: string;
  apply: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  customRange: string;
  preset: string;
  weekStart: string;
  am: string;
  pm: string;

  // 标签页
  tabs: {
    date: string;
    time: string;
  };

  // 快捷选择
  shortcuts: {
    title: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeekStart: string;
    thisMonthStart: string;
    thisQuarterStart: string;
    thisYearStart: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    lastMonth: string;
    thisQuarter: string;
    lastQuarter: string;
    thisYear: string;
    lastYear: string;
    last7Days: string;
    last30Days: string;
    last90Days: string;
    next7Days: string;
    next30Days: string;
    next90Days: string;
    now: string;
    morning9: string;
    afternoon2: string;
    afternoon6: string;
    dawn: string;
    morning: string;
    noon: string;
    afternoon: string;
    evening: string;
    night: string;
    midnight: string;
  };

  // 视图模式标签
  viewModes: {
    year: string;
    month: string;
    quarter: string;
    day: string;
    time: string;
  };

  // 月份名称
  months: {
    short: string[];
    long: string[];
  };

  // 星期名称
  weekdays: {
    short: string[];
    long: string[];
    min: string[];
  };

  // 季度标签
  quarters: {
    Q1: string;
    Q2: string;
    Q3: string;
    Q4: string;
  };

  // 季度描述
  quarterDescriptions: {
    Q1: string;
    Q2: string;
    Q3: string;
    Q4: string;
  };

  // 时间单位
  timeUnits: {
    hour: string;
    minute: string;
    second: string;
    millisecond: string;
  };

  // 时间单位标签（用于时间选择器）
  timeLabels: {
    hour: string;
    minute: string;
    second: string;
    millisecond: string;
  };

  // 时间范围标签
  timeRangeLabels: {
    startTime: string;
    endTime: string;
  };

  // 日期格式
  formats: {
    date: string;
    time: string;
    datetime: string;
    month: string;
    year: string;
    quarter: string;
    week: string;
  };

  // 相对时间
  relative: {
    yesterday: string;
    today: string;
    tomorrow: string;
    thisWeek: string;
    lastWeek: string;
    nextWeek: string;
    thisMonth: string;
    lastMonth: string;
    nextMonth: string;
    thisYear: string;
    lastYear: string;
    nextYear: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    yearsAgo: string;
    inMinutes: string;
    inHours: string;
    inDays: string;
    inWeeks: string;
    inMonths: string;
    inYears: string;
  };

  // 错误信息
  errors: {
    invalidDate: string;
    dateOutOfRange: string;
    timeOutOfRange: string;
    invalidFormat: string;
    required: string;
    endBeforeStart: string;
    startAfterEnd: string;
    autoAdjusted: string;
  };

  // 验证提示
  validation: {
    required: string;
    minDate: string;
    maxDate: string;
    invalidRange: string;
    futureOnly: string;
    pastOnly: string;
  };

  // 状态文本
  status: {
    selected: string;
    disabled: string;
    unavailable: string;
    weekend: string;
    holiday: string;
    workday: string;
  };

  // 操作文本
  actions: {
    save: string;
    cancel: string;
    confirm: string;
    clear: string;
    reset: string;
    edit: string;
    delete: string;
    copy: string;
    paste: string;
    undo: string;
    redo: string;
  };

  // 范围选择器标签
  rangeLabels: {
    startYear: string;
    endYear: string;
    startQuarter: string;
    endQuarter: string;
    startMonth: string;
    endMonth: string;
    startDate: string;
    endDate: string;
  };

  // 选择提示文本
  selectionHints: {
    selectStartDate: string;
    selectEndDate: string;
  };

  // 范围标记文本
  rangeMarkers: {
    start: string;
    end: string;
  };
}

// 中文配置
export const zhCN: DatePickerLocale = {
  placeholder: '请选择日期',
  placeholderTime: '请选择时间',
  placeholderDateRange: '请选择日期范围',
  placeholderTimeRange: '请选择时间范围',
  placeholderRange: '请选择范围',
  selectDate: '选择日期',
  selectTime: '选择时间',
  selectDateTime: '选择日期时间',
  confirm: '确认',
  cancel: '取消',
  clear: '清除',
  today: '今天',
  now: '现在',
  quickSelect: '快捷选择',
  currentSelection: '当前选择',
  notSelected: '未选择',
  dateDisabled: '此日期不可选择',
  formatError: '日期格式不正确',
  formatExample: '格式示例',
  noData: '暂无数据',
  loading: '加载中...',
  previous: '上一个',
  next: '下一个',
  previousYear: '上一年',
  nextYear: '下一年',
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousDecade: '上一个十年',
  nextDecade: '下一个十年',
  selectYear: '选择年份',
  selectMonth: '选择月份',
  selectQuarter: '选择季度',
  selectHour: '选择小时',
  selectMinute: '选择分钟',
  selectSecond: '选择秒',
  selectAll: '全选',
  deselectAll: '取消全选',
  reset: '重置',
  apply: '应用',
  startDate: '开始日期',
  endDate: '结束日期',
  startTime: '开始时间',
  endTime: '结束时间',
  customRange: '自定义范围',
  preset: '预设',
  weekStart: '周开始',
  am: '上午',
  pm: '下午',

  tabs: {
    date: '日期',
    time: '时间',
  },

  shortcuts: {
    title: '快捷选择',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    thisWeekStart: '本周开始',
    thisMonthStart: '本月开始',
    thisQuarterStart: '本季度开始',
    thisYearStart: '今年开始',
    thisWeek: '本周',
    lastWeek: '上周',
    thisMonth: '本月',
    lastMonth: '上月',
    thisQuarter: '本季度',
    lastQuarter: '上季度',
    thisYear: '今年',
    lastYear: '去年',
    last7Days: '最近7天',
    last30Days: '最近30天',
    last90Days: '最近90天',
    next7Days: '未来7天',
    next30Days: '未来30天',
    next90Days: '未来90天',
    now: '现在',
    morning9: '早上9点',
    afternoon2: '下午2点',
    afternoon6: '下午6点',
    dawn: '凌晨',
    morning: '上午',
    noon: '中午',
    afternoon: '下午',
    evening: '傍晚',
    night: '晚上',
    midnight: '午夜',
  },

  viewModes: {
    year: '年',
    month: '月',
    quarter: '季度',
    day: '日',
    time: '时间',
  },

  months: {
    short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    long: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  },

  weekdays: {
    short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    long: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    min: ['日', '一', '二', '三', '四', '五', '六'],
  },

  quarters: {
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4',
  },

  quarterDescriptions: {
    Q1: '1-3月',
    Q2: '4-6月',
    Q3: '7-9月',
    Q4: '10-12月',
  },

  timeUnits: {
    hour: '时',
    minute: '分',
    second: '秒',
    millisecond: '毫秒',
  },

  timeLabels: {
    hour: '小时',
    minute: '分钟',
    second: '秒',
    millisecond: '毫秒',
  },

  timeRangeLabels: {
    startTime: '开始时间',
    endTime: '结束时间',
  },

  formats: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm:ss',
    datetime: 'YYYY-MM-DD HH:mm:ss',
    month: 'YYYY-MM',
    year: 'YYYY',
    quarter: 'YYYY-[Q]Q',
    week: 'YYYY-[W]ww',
  },

  relative: {
    yesterday: '昨天',
    today: '今天',
    tomorrow: '明天',
    thisWeek: '本周',
    lastWeek: '上周',
    nextWeek: '下周',
    thisMonth: '本月',
    lastMonth: '上月',
    nextMonth: '下月',
    thisYear: '今年',
    lastYear: '去年',
    nextYear: '明年',
    justNow: '刚刚',
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    daysAgo: '天前',
    weeksAgo: '周前',
    monthsAgo: '月前',
    yearsAgo: '年前',
    inMinutes: '分钟后',
    inHours: '小时后',
    inDays: '天后',
    inWeeks: '周后',
    inMonths: '月后',
    inYears: '年后',
  },

  errors: {
    invalidDate: '无效的日期',
    dateOutOfRange: '日期超出范围',
    timeOutOfRange: '时间超出范围',
    invalidFormat: '格式不正确',
    required: '必填项',
    endBeforeStart: '结束时间不能早于开始时间',
    startAfterEnd: '开始时间不能晚于结束时间',
    autoAdjusted: '时间范围已自动调整',
  },

  validation: {
    required: '请选择日期',
    minDate: '日期不能早于最小值',
    maxDate: '日期不能晚于最大值',
    invalidRange: '无效的日期范围',
    futureOnly: '只能选择未来日期',
    pastOnly: '只能选择过去日期',
  },

  status: {
    selected: '已选择',
    disabled: '禁用',
    unavailable: '不可用',
    weekend: '周末',
    holiday: '节假日',
    workday: '工作日',
  },

  actions: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    clear: '清除',
    reset: '重置',
    edit: '编辑',
    delete: '删除',
    copy: '复制',
    paste: '粘贴',
    undo: '撤销',
    redo: '重做',
  },

  rangeLabels: {
    startYear: '开始年份',
    endYear: '结束年份',
    startQuarter: '开始季度',
    endQuarter: '结束季度',
    startMonth: '开始月份',
    endMonth: '结束月份',
    startDate: '开始日期',
    endDate: '结束日期',
  },

  selectionHints: {
    selectStartDate: '请选择开始日期',
    selectEndDate: '请选择结束日期',
  },

  rangeMarkers: {
    start: '始',
    end: '终',
  },
};

// 英文配置
export const enUS: DatePickerLocale = {
  placeholder: 'Select date',
  placeholderTime: 'Select time',
  placeholderDateRange: 'Select date range',
  placeholderTimeRange: 'Select time range',
  placeholderRange: 'Select range',
  selectDate: 'Select Date',
  selectTime: 'Select Time',
  selectDateTime: 'Select Date & Time',
  confirm: 'Confirm',
  cancel: 'Cancel',
  clear: 'Clear',
  today: 'Today',
  now: 'Now',
  quickSelect: 'Quick Select',
  currentSelection: 'Current Selection',
  notSelected: 'Not Selected',
  dateDisabled: 'This date is disabled',
  formatError: 'Incorrect date format',
  formatExample: 'Format example',
  noData: 'No data',
  loading: 'Loading...',
  previous: 'Previous',
  next: 'Next',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousDecade: 'Previous decade',
  nextDecade: 'Next decade',
  selectYear: 'Select year',
  selectMonth: 'Select month',
  selectQuarter: 'Select quarter',
  selectHour: 'Select hour',
  selectMinute: 'Select minute',
  selectSecond: 'Select second',
  selectAll: 'Select all',
  deselectAll: 'Deselect all',
  reset: 'Reset',
  apply: 'Apply',
  startDate: 'Start date',
  endDate: 'End date',
  startTime: 'Start time',
  endTime: 'End time',
  customRange: 'Custom range',
  preset: 'Preset',
  weekStart: 'Week start',
  am: 'AM',
  pm: 'PM',

  tabs: {
    date: 'Date',
    time: 'Time',
  },

  shortcuts: {
    title: 'Shortcuts',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeekStart: 'This Week Start',
    thisMonthStart: 'This Month Start',
    thisQuarterStart: 'This Quarter Start',
    thisYearStart: 'This Year Start',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisQuarter: 'This Quarter',
    lastQuarter: 'Last Quarter',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    last90Days: 'Last 90 Days',
    next7Days: 'Next 7 Days',
    next30Days: 'Next 30 Days',
    next90Days: 'Next 90 Days',
    now: 'Now',
    morning9: '9:00 AM',
    afternoon2: '2:00 PM',
    afternoon6: '6:00 PM',
    dawn: 'Dawn',
    morning: 'Morning',
    noon: 'Noon',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    midnight: 'Midnight',
  },

  viewModes: {
    year: 'Year',
    month: 'Month',
    quarter: 'Quarter',
    day: 'Day',
    time: 'Time',
  },

  months: {
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },

  weekdays: {
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    min: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },

  quarters: {
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4',
  },

  quarterDescriptions: {
    Q1: 'Jan-Mar',
    Q2: 'Apr-Jun',
    Q3: 'Jul-Sep',
    Q4: 'Oct-Dec',
  },

  timeUnits: {
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    millisecond: 'Millisecond',
  },

  timeLabels: {
    hour: 'Hours',
    minute: 'Minutes',
    second: 'Seconds',
    millisecond: 'Milliseconds',
  },

  timeRangeLabels: {
    startTime: 'Start Time',
    endTime: 'End Time',
  },

  formats: {
    date: 'MM/DD/YYYY',
    time: 'HH:mm:ss',
    datetime: 'MM/DD/YYYY HH:mm:ss',
    month: 'MM/YYYY',
    year: 'YYYY',
    quarter: 'YYYY-[Q]Q',
    week: 'YYYY-[W]ww',
  },

  relative: {
    yesterday: 'Yesterday',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    nextMonth: 'Next Month',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    nextYear: 'Next Year',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    weeksAgo: 'weeks ago',
    monthsAgo: 'months ago',
    yearsAgo: 'years ago',
    inMinutes: 'in minutes',
    inHours: 'in hours',
    inDays: 'in days',
    inWeeks: 'in weeks',
    inMonths: 'in months',
    inYears: 'in years',
  },

  errors: {
    invalidDate: 'Invalid date',
    dateOutOfRange: 'Date out of range',
    timeOutOfRange: 'Time out of range',
    invalidFormat: 'Invalid format',
    required: 'Required field',
    endBeforeStart: 'End time cannot be earlier than start time',
    startAfterEnd: 'Start time cannot be later than end time',
    autoAdjusted: 'Time range has been automatically adjusted',
  },

  validation: {
    required: 'Please select a date',
    minDate: 'Date cannot be earlier than minimum value',
    maxDate: 'Date cannot be later than maximum value',
    invalidRange: 'Invalid date range',
    futureOnly: 'Only future dates allowed',
    pastOnly: 'Only past dates allowed',
  },

  status: {
    selected: 'Selected',
    disabled: 'Disabled',
    unavailable: 'Unavailable',
    weekend: 'Weekend',
    holiday: 'Holiday',
    workday: 'Workday',
  },

  actions: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    clear: 'Clear',
    reset: 'Reset',
    edit: 'Edit',
    delete: 'Delete',
    copy: 'Copy',
    paste: 'Paste',
    undo: 'Undo',
    redo: 'Redo',
  },

  rangeLabels: {
    startYear: 'Start Year',
    endYear: 'End Year',
    startQuarter: 'Start Quarter',
    endQuarter: 'End Quarter',
    startMonth: 'Start Month',
    endMonth: 'End Month',
    startDate: 'Start Date',
    endDate: 'End Date',
  },

  selectionHints: {
    selectStartDate: 'Please select start date',
    selectEndDate: 'Please select end date',
  },

  rangeMarkers: {
    start: 'S',
    end: 'E',
  },
};

// 语言配置映射
export const localeMap: Record<Locale, DatePickerLocale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 获取当前语言配置
export const getDatePickerLocale = (locale?: Locale): DatePickerLocale => {
  if (locale && localeMap[locale]) {
    return localeMap[locale];
  }

  // 如果没有指定语言或语言不支持，返回默认语言（中文）
  return zhCN;
};

// 导出默认配置
export default {
  zhCN,
  enUS,
  getDatePickerLocale,
  localeMap,
};
