# Date 工具函数与 Hook

> `src/ui/date/` 的工具层 —— 格式化 / 解析 / 校验 / 计算 / 禁用规则、快捷选择工厂、时区与移动端适配、国际ization 配置与性能优化 Hook。

---

**导入**

```tsx
import {
  safeDateFormat,
  safeDateParse,
  smartDateParse,
  validateDateRange,
  detectDateFormat,
  combineDisabledDate,
  commonDisabledDates,
  dateCalculations,
  dateComparisons,
  DATE_FORMATS,
  getDateFormats,
  createDateShortcuts,
  createDateRangeShortcuts,
  createTimeShortcuts,
  useDatePickerLocale,
  useDatePickerFormatters,
  useDateCache,
  useDateValidation,
} from '@easbot/ui';
```

> 本篇是 [Date 总览页](./date.md) 的子页。视图组件见 [视图组件篇](./date-views.md)。

## 基础用法

安全的格式化与解析：

```tsx
import { safeDateFormat, safeDateParse, smartDateParse } from '@easbot/ui';

const fmt = safeDateFormat(new Date(), 'YYYY年MM月DD日');
if (fmt.isValid) {
  console.log(fmt.formatted); // "2026年11月04日"
} else {
  console.log(fmt.error); // 内置文案（zh-CN / en-US）
}

const parsed = safeDateParse('2024-01-01', 'YYYY-MM-DD');
if (parsed.isValid && parsed.date) {
  console.log(parsed.date);
}

// 自动探测格式
const smart = smartDateParse('2024/01/01');
```

组合禁用规则：

```tsx
import { combineDisabledDate, commonDisabledDates } from '@easbot/ui';

const disabledDate = combineDisabledDate(
  commonDisabledDates.disablePast,
  commonDisabledDates.disableWeekends,
  (date) => date.getDate() === 13,
);

<InputDate disabledDate={disabledDate} />;
```

## 格式化 / 解析工具（`date-utils.ts`）

### `safeDateFormat(date, format?, fallback?, locale?)`

安全格式化，**永不抛错**。

| 参数       | 默认值         | 说明                                     |
| ---------- | -------------- | ---------------------------------------- |
| `date`     | —              | `string \| Date \| undefined`            |
| `format`   | `'YYYY-MM-DD'` | `dayjs` 格式串                           |
| `fallback` | `''`           | 失败时 `formatted` 的取值                |
| `locale`   | —              | 文案语言（错误提示用），缺省回退 `zh-CN` |

返回 `FormatResult`：`{ formatted: string; isValid: boolean; error?: string }`。

- `date` 为空 → `{ formatted: fallback, isValid: false }`（**无 `error`**）。
- 日期非法 → `error` 为「无效的日期值」。
- 抛错 → `error` 为「日期格式化失败」。

### `safeDateParse(dateStr, format?, strict?, locale?)`

安全解析，**永不抛错**。返回 `ParseResult`：`{ date?: Date; isValid: boolean; error?: string }`。

| 参数      | 默认值         | 说明                         |
| --------- | -------------- | ---------------------------- |
| `dateStr` | —              | 待解析字符串                 |
| `format`  | `'YYYY-MM-DD'` | `dayjs` 格式串               |
| `strict`  | `true`         | 严格模式（格式必须完全匹配） |
| `locale`  | —              | 文案语言，缺省回退 `zh-CN`   |

- 空串 → `error` 为「日期字符串为空」。
- 格式不匹配 → `error` 为「日期格式不匹配：{format}」。
- 抛错 → `error` 为「日期解析失败」。

### `smartDateParse(dateStr, locale?)`

自动探测格式后解析。返回 `ParseResult`。

1. 先用 `detectDateFormat` 探测候选格式，命中则用**第一个**命中的格式严格解析。
2. 全部未命中 → 退回 `dayjs(dateStr)` 宽松解析。
3. 仍失败 → `error` 为「无法识别的日期格式」。

### `detectDateFormat(dateStr)`（`date-utils.ts` 版本）

返回**所有**能严格解析该字符串的格式数组（按内置候选表顺序）。候选表共 12 项：

`YYYY-MM-DD` / `YYYY/MM/DD` / `YYYY.MM.DD` / `DD/MM/YYYY` / `MM/DD/YYYY` / `YYYY-M-D` / `YYYY/M/D` / `M/D/YYYY` / `D/M/YYYY` / `YYYY年MM月DD日` / `YYYY-MM-DD HH:mm:ss` / `YYYY-MM-DD HH:mm`

> ⚠️ **包根导出的 `detectDateFormat` 是 `date-utils.ts` 的版本**（返回 `string[]`）。`validation.ts` 里还有一个同名函数（返回 `string | null`，候选表不同）—— **但 `validation.ts` 未从包根导出**，消费方拿不到那个版本。

### `validateDateRange(date, minDate?, maxDate?, locale?)`

校验单个日期是否落在区间内。返回 `{ isValid: boolean; error?: string }`。

- 早于 `minDate` → `error` 为「日期不能早于 {date}」。
- 晚于 `maxDate` → `error` 为「日期不能晚于 {date}」。
- 比较粒度为**天**（`isBefore(min, 'day')`）。

### `DATE_FORMATS` 与 `getDateFormats(locale?)`

`getDateFormats(locale?)` 返回按语言解析的格式表（`as const`）：

| 键            | 取值                                     |
| ------------- | ---------------------------------------- |
| `DATE`        | `'YYYY-MM-DD'`                           |
| `DATE_CN`     | 随语言：`YYYY年MM月DD日` / `MMM D, YYYY` |
| `DATETIME`    | `'YYYY-MM-DD HH:mm:ss'`                  |
| `DATETIME_CN` | `'YYYY年MM月DD日 HH:mm:ss'`              |
| `TIME`        | `'HH:mm:ss'`                             |
| `TIME_SHORT`  | `'HH:mm'`                                |
| `MONTH`       | `'YYYY-MM'`                              |
| `MONTH_CN`    | 随语言：`YYYY年MM月` / `MMMM YYYY`       |
| `YEAR`        | `'YYYY'`                                 |
| `YEAR_CN`     | 随语言：`YYYY年` / `YYYY`                |
| `QUARTER`     | `'YYYY-[Q]Q'`                            |
| `ISO`         | `'YYYY-MM-DDTHH:mm:ss.SSS[Z]'`           |

`DATE_FORMATS` 是 `getDateFormats()`（**缺省 zh-CN**）的常量快照 —— 因此它的中文格式**不会随语言变化**，需要按语言取请用 `getDateFormats(locale)`。

> ⚠️ **`validation.ts` 还有一个同名 `DATE_FORMATS`**，字段完全不同（`DATE_SLASH` / `DATE_DOT` / `DATETIME_SHORT` / `QUARTER_CN` 等）。包根导出的是 `date-utils.ts` 的那一份。

## 禁用规则（`commonDisabledDates` / `combineDisabledDate`）

### `combineDisabledDate(...fns)`

把多个禁用函数合成一个（**任一命中即禁用**）。参数可以是 `undefined`（会被跳过）。

```tsx
const disabled = combineDisabledDate(
  commonDisabledDates.disableFuture,
  (date) => date.getDate() === 13,
);
```

### `commonDisabledDates`

| 成员                              | 行为                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| `disableFuture(date)`             | 禁用今天之后的日期                                                 |
| `disablePast(date)`               | 禁用今天之前的日期                                                 |
| `disableWeekends(date)`           | 禁用周六 / 周日（`day()` 为 0 或 6）                               |
| `disableWeekdays(date)`           | 禁用周一至周五                                                     |
| `disableSpecificDates(dates)`     | 工厂：禁用给定日期数组中的日期（按天比较）                         |
| `disableDateRange(start, end)`    | 工厂：禁用给定区间内的日期（**不含**两端，`isAfter` / `isBefore`） |
| `disableMonthDates(month, dates)` | 工厂：禁用指定月份（**1 起算**）的指定几号                         |
| `disableWeekDays(weekDays)`       | 工厂：禁用指定的星期几（`day()` 索引，0 = 周日）                   |

> ⚠️ `disableDateRange` 是**开区间**（不含起止日）；`disableMonthDates` 的 `month` 参数是 **1-12**，而内部 `dayDate.month()` 是 **0-11**，源码已做 `- 1` 换算。

## 日期计算与比较

### `dateCalculations`

| 方法                                            | 说明                                         |
| ----------------------------------------------- | -------------------------------------------- |
| `getDateRange(start, end)`                      | 返回区间内的**所有**日期（`Date[]`，含两端） |
| `getDaysDifference(start, end)`                 | 天数差（`end - start`）                      |
| `getWorkingDays(start, end)`                    | 区间内的工作日数量（不含周末）               |
| `getMonthStart(date)` / `getMonthEnd(date)`     | 月初 / 月末                                  |
| `getQuarterStart(date)` / `getQuarterEnd(date)` | 季度首 / 末                                  |
| `getYearStart(date)` / `getYearEnd(date)`       | 年初 / 年末                                  |
| `getNextWorkingDay(date)`                       | 下一个工作日（跳过周末）                     |
| `getPreviousWorkingDay(date)`                   | 上一个工作日                                 |

### `dateComparisons`

| 方法                 | 说明                                                    |
| -------------------- | ------------------------------------------------------- |
| `isToday(date)`      | 是否今天                                                |
| `isYesterday(date)`  | 是否昨天                                                |
| `isTomorrow(date)`   | 是否明天                                                |
| `isThisWeek(date)`   | 是否本周（按 `dayjs` 的 `week` 单位）                   |
| `isThisMonth(date)`  | 是否本月                                                |
| `isThisYear(date)`   | 是否今年                                                |
| `isWorkingDay(date)` | 是否工作日（周一至周五）                                |
| `isWeekend(date)`    | 是否周末                                                |
| `isLeapYear(date)`   | 是否闰年（能被 4 整除且不被 100 整除，或能被 400 整除） |

## 快捷选择工厂（`shortcuts.ts`）

```tsx
import {
  createDateShortcuts,
  createDateRangeShortcuts,
  createTimeShortcuts,
  zhCN,
} from '@easbot/ui';

const dateShortcuts = createDateShortcuts(zhCN);
const rangeShortcuts = createDateRangeShortcuts(zhCN);
const timeShortcuts = createTimeShortcuts(zhCN);
```

三个工厂都接收一份 `DatePickerLocale` 配置，**返回的 `label` 是配置里的文案** —— 因此语言不同则文案不同。

| 工厂                               | 数量 | 内容                                                                                                          |
| ---------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------- |
| `createDateShortcuts(locale)`      | 7    | 今天 / 昨天 / 明天 / 本周开始 / 本月开始 / 本季度开始 / 今年开始                                              |
| `createDateRangeShortcuts(locale)` | 13   | 今天 / 昨天 / 本周 / 上周 / 本月 / 上月 / 本季度 / 上季度 / 今年 / 去年 / 最近 7 天 / 最近 30 天 / 最近 90 天 |
| `createTimeShortcuts(locale)`      | 4    | 现在 / 早上 9 点 / 下午 2 点 / 下午 6 点                                                                      |

- **「今天」等单日快捷项的值是 `startOf('day')`**（零点整）—— 不含当前时刻。
- **「最近 N 天」是含今天的 N 天**：`last7Days` = `subtract(6, 'day').startOf('day')` → `endOf('day')`；`last30Days` = `subtract(29, 'day')`；`last90Days` = `subtract(89, 'day')`。
- **范围项的结束时间是 `endOf('day')`**（当天最后一刻）。

### 类型

```tsx
import type { DateShortcut, DateRangeShortcut } from '@easbot/ui';

interface DateShortcut {
  label: string;
  value: () => Date;
}

interface DateRangeShortcut {
  label: string;
  value: () => [Date, Date];
}
```

> 📌 包根导出清单里记录的是 `type DateShortcut` —— 属于**类型导出**，需用 `import type`。

## 国际化（`locale/` 与 `hooks/`）

### `DatePickerLocale` 与语言包

```tsx
import { getDatePickerLocale, localeMap, zhCN, enUS } from '@easbot/ui';

const config = getDatePickerLocale('en-US'); // 等价于 localeMap['en-US']
```

- `localeMap` 的键是受支持的 `Locale`：`'zh-CN'` / `'en-US'`。
- `getDatePickerLocale(locale?)` 传入不支持的语言时**回退到 `zhCN`**（不会抛错）。
- `DatePickerLocale` 是一个**大而全**的配置接口 —— 基础文案、`tabs`、`shortcuts`、`viewModes`、`months` / `weekdays`（`short` / `long` / `min`）、`quarters`、`quarterDescriptions`、`timeUnits` / `timeLabels`、`timeRangeLabels`、`formats`、`relative`、`errors`、`validation`、`status`、`actions`、`rangeLabels`、`selectionHints`、`rangeMarkers` 共 17 个分组。

> 📌 该配置**不是**从内置 `date` 文案域（`src/utils/component-messages.ts`）派生的 —— 它是一份**独立维护**的常量表。内置文案域负责「错误提示」「格式模板」等，而 `DatePickerLocale` 负责「界面标签」。两者内容有重叠但**不共享**。

### `useDatePickerLocale(curLocale?)`

返回当前语言的 `DatePickerLocale`。语言来源优先级：**prop > `LocaleProvider` > 默认 `zh-CN`**。

```tsx
const locale = useDatePickerLocale();
// locale.placeholder → '请选择日期' / 'Select date'
```

### `useDatePickerFormatters(curLocale?)`

返回一组**格式化函数**（全部随语言变化）：

| 函数                                       | 说明                                                          |
| ------------------------------------------ | ------------------------------------------------------------- |
| `formatMonth(month, type?)`                | 月份名（`month` 为 **0-11** 索引）                            |
| `formatWeekday(weekday, type?)`            | 星期名（`weekday` 为 **0-6** 索引，0 = 周日）                 |
| `formatQuarter(quarter, withDescription?)` | 季度名（`quarter` 为 **1-4**）                                |
| `formatTimeUnit(unit)`                     | 时间单位（`hour` / `minute` / `second` / `millisecond`）      |
| `formatTimeLabel(unit)`                    | 时间标签（`hour` → 「小时」/ `minute` → 「分钟」）            |
| `formatRelativeTime(key)`                  | 相对时间文案                                                  |
| `formatRangeLabel(labelType)`              | 范围标签（`startYear` / `endMonth` 等）                       |
| `formatSelectionHint(hintType)`            | 选择提示（`selectStartDate` / `selectEndDate`）               |
| `formatRangeMarker(markerType)`            | 范围角标（`start` / `end`）                                   |
| `formatViewMode(mode)`                     | 视图模式标签（`year` / `month` / `quarter` / `day` / `time`） |
| `formatValidation(validationType)`         | 验证文案                                                      |
| `formatStatus(status)`                     | 状态文案                                                      |
| `formatAction(action)`                     | 操作文案                                                      |
| `formatShortcut(shortcut)`                 | 快捷项文案                                                    |
| `formatNavigation(direction)`              | 导航文案（`previous` / `next` / `previousYear` …）            |
| `formatTimeRangeLabel(type)`               | 时间范围标签（`startTime` / `endTime`）                       |
| `formatPeriod(period)`                     | `am` / `pm`                                                   |

> ⚠️ `formatMonth` / `formatWeekday` / `formatQuarter` 用**数字索引**取值，索引越界返回**空字符串**（源码用 `|| ''` 兜底）—— 传错索引会得到空白而不是报错。

## 性能优化 Hook（`hooks/use-date-optimization.ts`）

### `useDebouncedDateInput(callback, options?)`

防抖日期输入。

```tsx
const { debouncedCallback, cancelDebounce } = useDebouncedDateInput((value) => setDate(value), {
  delay: 300,
});
```

| 选项        | 默认值  | 说明                                                  |
| ----------- | ------- | ----------------------------------------------------- |
| `delay`     | `300`   | 防抖延迟（毫秒）                                      |
| `immediate` | `false` | 为 `true` 时，**间隔超过 `delay`** 的首次调用立即执行 |

返回值：`{ debouncedCallback, cancelDebounce }`。

### `useDateCache(options?)`

日期格式化 / 解析的**带容量上限的缓存**。

| 选项           | 默认值 | 说明                   |
| -------------- | ------ | ---------------------- |
| `maxCacheSize` | `100`  | 每张缓存表的最大条目数 |
| `enableCache`  | `true` | 是否启用缓存           |

返回值：

| 成员                           | 说明                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| `cachedFormat(date, format)`   | 带缓存的格式化（等价 `safeDateFormat(...).formatted`）           |
| `cachedParse(dateStr, format)` | 带缓存的解析（返回 `Date \| undefined`）                         |
| `clearCache()`                 | 清空两张缓存表                                                   |
| `getCacheStats()`              | `{ formatCacheSize, parseCacheSize, maxCacheSize, enableCache }` |

- 缓存键分别是 `${date.toString()}-${format}` 与 `${dateStr}-${format}`。
- **淘汰策略是「删最旧」**（`Map.keys().next().value`）—— 容量满时移除最早插入的条目。

### `useDateComparisons(dates)`

批量计算日期的比较结果。返回与入参数组**等长**的数组，每项含 `date` / `isToday` / `isYesterday` / `isTomorrow` / `isThisWeek` / `isThisMonth` / `isThisYear` / `isWorkingDay` / `isWeekend` / `isLeapYear`。

> ⚠️ 结果用 `useMemo([dates])` 记忆化 —— **`dates` 数组是引用比较**，每次渲染都新建数组会导致缓存失效（结果仍正确，只是白白重算）。

### `useDateVirtualization(startDate, endDate, itemHeight, containerHeight)`

日期区间虚拟滚动（用于长列表）。

返回值：

| 成员                         | 说明                                               |
| ---------------------------- | -------------------------------------------------- |
| `totalDays`                  | 区间总天数（含首尾）                               |
| `visibleCount`               | 可见条目数（`ceil(containerHeight / itemHeight)`） |
| `getVisibleItems(scrollTop)` | `{ items, totalHeight, startIndex, endIndex }`     |

`items` 中每项为 `{ index, date, top }`（`top` = `index * itemHeight`）。

### `useDateSuggestions(inputValue, maxSuggestions?)`

输入建议。

- 输入长度 **< 2** 时返回**空数组**。
- 先匹配「今天 / 昨天 / 明天」三个相对日期建议（`type: 'relative'`），再尝试按 `'YYYY-MM-DD'` / `'YYYY/MM/DD'` / `'MM-DD'` / `'MM/DD'` 解析（`type: 'parsed'`）。
- 最终按 `maxSuggestions`（默认 `5`）截断。

### `useDateValidation(value, rules?)`

日期输入校验。返回 `{ isValid, error?, date? }`。

| 规则              | 默认值         | 说明                                 |
| ----------------- | -------------- | ------------------------------------ |
| `required`        | `false`        | 为空时是否报错                       |
| `format`          | `'YYYY-MM-DD'` | 解析用的格式                         |
| `minDate`         | —              | 最小日期                             |
| `maxDate`         | —              | 最大日期                             |
| `customValidator` | —              | 自定义校验，返回错误文案即视为不通过 |

校验顺序：空值 → 格式 → 范围 → 自定义。

## 未从包根导出的模块

`src/ui/date/` 下有 3 个模块**未**在 `src/ui/date/index.ts` 中 re-export，因此**不能**从 `@easbot/ui` import：

| 模块                | 主要导出                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validation.ts`     | `parseDate` / `validateDate` / `formatDate` / `validateTimeRange` / `validateDateRange` / `normalizeInput` / `getFormatHint` / `formatInputOnType` / `detectDateFormat`（另一个版本） / `DATE_FORMATS`（另一个版本） / `ValidationResult` / `FormatOptions` / `ValidationOptions`                                                                                                        |
| `timezone-utils.ts` | `convertToTimezone` / `convertToUTC` / `convertFromUTC` / `formatWithTimezone` / `parseWithTimezone` / `getTimezoneInfo` / `getTimezoneOffset` / `getTimezoneDifference` / `isValidTimezone` / `detectUserTimezone` / `getSystemTimezone` / `getCommonTimezones` / `COMMON_TIMEZONES` / `TimezoneConverter` / `useTimezone` / `TimezoneConfig` / `TimezoneInfo` / `TimezoneLabelOptions` |
| `mobile-utils.ts`   | `useIsMobile` / `useIsTouchDevice` / `detectMobileDevice` / `useBreakpoint` / `getMobileOptimizedConfig` / `useTouchGestures` / `getMobileFriendlyFormat` / `useMobileKeyboard` / `BREAKPOINTS`                                                                                                                                                                                          |

此外 `hooks/use-date-fns-locale.ts` 的 `useDateFnsLocale` / `getSupportedLocales` / `isSupportedLocale` 也**未导出**。

> ⚠️ 组件库自带的 `src/ui/date/README.md` 中大量示例 import 自 `@/components/ui/date-picker`（旧路径别名），且示范了 `useIsMobile` / `useTimezone` / `validateDate` 等**未导出**的 API —— **这些示例无法直接运行**，请以本篇与 [总览页](./date.md) 为准。

## 无障碍

- 本模块的函数与 Hook **全部不产生 DOM**，不涉及 `role` / `aria-*` / 焦点管理。
- **错误文案是纯文本**：由 `processUiMessage` 解析内置 `date` 文案域得到，**不含任何 `aria-live` 语义** —— 消费方把它渲染到输入框下方时，需自行补充 `role="alert"` 才能让读屏播报。
- `useDateSuggestions` 返回的建议**没有内置列表语义**（无 `role="listbox"` / `option`）—— 需消费方自行实现 combobox 模式。
- `useDebouncedDateInput` 的 `immediate` 选项只影响**回调时机**，不影响键盘 / 读屏行为。

## 注意事项

- **`dayjs` 插件由模块自行 `extend`**：`customParseFormat` / `utc` / `timezone` / `isSameOrBefore` / `isSameOrAfter` / `quarterOfYear` / `advancedFormat` 都在各模块顶层注册 —— 消费方**无需**手动 `extend`。
- **文案语言与数据语言是两回事**：`safeDateFormat` 等函数的 `locale` 参数只影响**错误提示**的语言；日期**显示格式**由 `format` 参数（`dayjs` 格式串）决定。
- **`getDateFormats(locale)` 里的中文格式随语言变化**：`DATE_CN` / `MONTH_CN` / `YEAR_CN` 三个键来自内置文案表的 `formatPatterns.*`，因此**不能**在模块加载时固化为常量 —— 这正是 `getDateFormats` 存在的原因（源码注释已说明）。
- **`DATE_FORMATS` 是 zh-CN 快照**：不随 `LocaleProvider` 变化；需要随语言变化请用 `getDateFormats(locale)`。
- **`detectDateFormat` 有两个同名实现**：包根导出的是 `date-utils.ts` 版本（返回**数组**）；`validation.ts` 版本返回**单个字符串或 `null`**，但未导出。
- **`commonDisabledDates` 的比较粒度是「天」**：`disableFuture` / `disablePast` 用 `isAfter(now, 'day')` / `isBefore(now, 'day')` —— **今天本身永远不禁用**。
- **`dateCalculations.getDateRange` 是死循环风险点**：区间过大（如跨年）会生成海量数组，消费方需自行限制。
- **`useDateCache` 的缓存不区分语言**：缓存键只含 `date` + `format`，若 `locale` 变化且格式化结果依赖语言，可能命中过期结果（当前 `safeDateFormat` 的 `format` 不依赖语言，故暂无实际影响）。
- **`useDateCache` 的 `cachedFormat` 在 `enableCache === false` 或 `date` 为空时返回 `''`**（不返回 `fallback`）。
- **`useDateValidation` 的 `required` 只在值为空时生效**：非空但格式错误时返回的是格式错误文案。
- **组件库不消费任何主题 CSS 变量**（`src/ui/date/` 下无 `var(--*)` 引用）。

## 导出

### 组件

| 导出名                      | 说明 |
| --------------------------- | ---- |
| `BaseRangeViewProps`        |      |
| `BaseShortcutViewProps`     |      |
| `BaseViewProps`             |      |
| `CombinedShortcutView`      |      |
| `CombinedShortcutViewProps` |      |
| `DATE_FORMATS`              |      |
| `DatePicker`                |      |
| `DatePickerLocale`          |      |
| `DatePickerProps`           |      |
| `DateRangeShortcut`         |      |
| `DateShortcut`              |      |
| `DayRangeView`              |      |
| `DayView`                   |      |
| `EmbeddedDatePicker`        |      |
| `EmbeddedDatePickerProps`   |      |
| `EnhancedDatePicker`        |      |
| `EnhancedDatePickerProps`   |      |
| `FormatResult`              |      |
| `InputDate`                 |      |
| `InputDateProps`            |      |
| `InputDateRange`            |      |
| `InputDateRangeProps`       |      |
| `InputDateTime`             |      |
| `InputDateTimeProps`        |      |
| `InputDateTimeRange`        |      |
| `InputTime`                 |      |
| `InputTimeProps`            |      |
| `InputTimeRange`            |      |
| `InputTimeRangeProps`       |      |
| `MonthRangeView`            |      |
| `MonthView`                 |      |
| `ParseResult`               |      |
| `QuarterRangeView`          |      |
| `QuarterView`               |      |
| `ShortcutRangeView`         |      |
| `ShortcutRangeViewProps`    |      |
| `ShortcutView`              |      |
| `ShortcutViewProps`         |      |
| `TimeConstraints`           |      |
| `TimeRangeView`             |      |
| `TimeRangeViewProps`        |      |
| `TimeView`                  |      |
| `TimeViewProps`             |      |
| `ViewComponentStructure`    |      |
| `ViewMode`                  |      |
| `ViewSelectorHeader`        |      |
| `ViewSelectorHeaderProps`   |      |
| `YearRangeView`             |      |
| `YearView`                  |      |

### 类型与工具函数

| 导出名                     | 说明 |
| -------------------------- | ---- |
| `combineDisabledDate`      |      |
| `commonDisabledDates`      |      |
| `createDateRangeShortcuts` |      |
| `createDateShortcuts`      |      |
| `createTimeShortcuts`      |      |
| `dateCalculations`         |      |
| `dateComparisons`          |      |
| `detectDateFormat`         |      |
| `enUS`                     |      |
| `getDateFormats`           |      |
| `getDatePickerLocale`      |      |
| `localeMap`                |      |
| `safeDateFormat`           |      |
| `safeDateParse`            |      |
| `smartDateParse`           |      |
| `useDateCache`             |      |
| `useDateComparisons`       |      |
| `useDatePickerFormatters`  |      |
| `useDatePickerLocale`      |      |
| `useDateSuggestions`       |      |
| `useDateValidation`        |      |
| `useDateVirtualization`    |      |
| `useDebouncedDateInput`    |      |
| `validateDateRange`        |      |
| `zhCN`                     |      |
