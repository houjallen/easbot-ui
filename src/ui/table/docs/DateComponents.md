# 表格日期组件使用指南

## 概述

表格组件支持多种日期组件的自动渲染，当列的 `dataType` 为 `'date'` 时，可以通过 `dateType` 属性指定使用哪种日期组件。系统会根据配置自动选择合适的日期组件进行渲染。

## 支持的日期组件类型

| dateType         | 组件               | 描述             | 适用场景               |
| ---------------- | ------------------ | ---------------- | ---------------------- |
| `date`           | InputDate          | 单日期选择       | 生日、入职日期等       |
| `date-range`     | InputDateRange     | 日期范围选择     | 工作期间、项目周期等   |
| `datetime`       | InputDateTime      | 日期时间选择     | 创建时间、更新时间等   |
| `datetime-range` | InputDateTimeRange | 日期时间范围选择 | 会议时间、活动时间等   |
| `time`           | InputTime          | 时间选择         | 上班时间、提醒时间等   |
| `time-range`     | InputTimeRange     | 时间范围选择     | 工作时间段、休息时间等 |

## 基本用法

### 1. 单日期选择

```typescript
const columns: TableColumn[] = [
  {
    name: 'birthday',
    title: '生日',
    dataIndex: 'birthday',
    dataType: 'date',
    dateType: 'date',
    dateFormat: 'YYYY-MM-DD',
    dateConfig: {
      placeholder: '请选择生日',
      showShortcuts: true,
      mode: 'day', // 'day' | 'month' | 'year'
    },
  },
];
```

### 2. 日期范围选择

```typescript
const columns: TableColumn[] = [
  {
    name: 'workPeriod',
    title: '工作期间',
    dataIndex: 'workPeriod',
    dataType: 'date',
    dateType: 'date-range',
    dateFormat: 'YYYY-MM-DD',
    dateConfig: {
      separator: ' 至 ',
      mode: 'day',
    },
  },
];
```

### 3. 日期时间选择

```typescript
const columns: TableColumn[] = [
  {
    name: 'lastLogin',
    title: '最后登录',
    dataIndex: 'lastLogin',
    dataType: 'date',
    dateType: 'datetime',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    dateConfig: {
      showShortcuts: true,
    },
  },
];
```

### 4. 时间选择

```typescript
const columns: TableColumn[] = [
  {
    name: 'workTime',
    title: '上班时间',
    dataIndex: 'workTime',
    dataType: 'date',
    dateType: 'time',
    dateFormat: 'HH:mm:ss',
  },
];
```

## 配置选项

### 列配置属性

| 属性         | 类型                | 描述                        | 默认值                 |
| ------------ | ------------------- | --------------------------- | ---------------------- |
| `dataType`   | `'date'`            | 数据类型，必须设置为 'date' | -                      |
| `dateType`   | `DateComponentType` | 日期组件类型                | `'date'`               |
| `dateFormat` | `string`            | 日期格式                    | 根据 dateType 自动选择 |
| `dateConfig` | `DateConfig`        | 日期组件配置                | `{}`                   |

### DateConfig 配置

| 属性            | 类型                         | 描述             | 适用组件         |
| --------------- | ---------------------------- | ---------------- | ---------------- |
| `disabled`      | `boolean`                    | 是否禁用         | 所有             |
| `readOnly`      | `boolean`                    | 是否只读         | 所有             |
| `placeholder`   | `string`                     | 占位符文本       | 所有             |
| `disabledDate`  | `(date: Date) => boolean`    | 禁用日期判断函数 | 所有             |
| `showShortcuts` | `boolean`                    | 是否显示快捷选择 | date, datetime   |
| `mode`          | `'day' \| 'month' \| 'year'` | 选择模式         | date, date-range |
| `separator`     | `string`                     | 分隔符           | 范围类型组件     |

## 默认日期格式

| dateType         | 默认格式              |
| ---------------- | --------------------- |
| `date`           | `YYYY-MM-DD`          |
| `date-range`     | `YYYY-MM-DD`          |
| `datetime`       | `YYYY-MM-DD HH:mm:ss` |
| `datetime-range` | `YYYY-MM-DD HH:mm:ss` |
| `time`           | `HH:mm:ss`            |
| `time-range`     | `HH:mm:ss`            |

## 高级用法

### 1. 月份选择

```typescript
{
  name: 'month',
  title: '月份',
  dataIndex: 'month',
  dataType: 'date',
  dateType: 'date',
  dateFormat: 'YYYY-MM',
  dateConfig: {
    mode: 'month',
    placeholder: '选择月份',
  },
}
```

### 2. 年份选择

```typescript
{
  name: 'year',
  title: '年份',
  dataIndex: 'year',
  dataType: 'date',
  dateType: 'date',
  dateFormat: 'YYYY',
  dateConfig: {
    mode: 'year',
    placeholder: '选择年份',
  },
}
```

### 3. 自定义禁用规则

```typescript
{
  name: 'deadline',
  title: '截止日期',
  dataIndex: 'deadline',
  dataType: 'date',
  dateType: 'date',
  dateConfig: {
    disabledDate: (date: Date) => {
      // 禁用过去的日期
      return date < new Date();
    },
  },
}
```

### 4. 自定义分隔符

```typescript
{
  name: 'period',
  title: '时间段',
  dataIndex: 'period',
  dataType: 'date',
  dateType: 'date-range',
  dateConfig: {
    separator: ' ～ ', // 使用波浪号分隔符
  },
}
```

## 数据格式要求

### 单值类型（date, datetime, time）

- 字符串格式：`'2023-12-01'`、`'2023-12-01 14:30:00'`、`'14:30:00'`
- Date 对象：`new Date()`

### 范围类型（date-range, datetime-range, time-range）

- 数组格式：`['2023-12-01', '2023-12-31']`
- 字符串数组：`['14:00:00', '18:00:00']`

## 注意事项

1. **必须设置 dataType**: 只有当列的 `dataType` 为 `'date'` 时，日期组件功能才会生效。

2. **格式一致性**: 确保数据格式与 `dateFormat` 配置一致，避免显示异常。

3. **范围数据**: 范围类型的数据必须是包含两个元素的数组。

4. **性能考虑**: 在大数据量表格中，建议使用 `readOnly: true` 来提升渲染性能。

5. **自定义渲染**: 如果需要更复杂的渲染逻辑，可以使用 `render` 函数覆盖默认的日期组件渲染。

## 完整示例

```typescript
import { BaseTable } from '@/components/ui/table';
import type { TableColumn } from '@/components/ui/table/types';

const columns: TableColumn[] = [
  {
    name: 'name',
    title: '姓名',
    dataIndex: 'name',
    type: 'text',
  },
  {
    name: 'birthday',
    title: '生日',
    dataIndex: 'birthday',
    dataType: 'date',
    dateType: 'date',
    dateFormat: 'YYYY-MM-DD',
    dateConfig: {
      placeholder: '请选择生日',
      mode: 'day',
      disabledDate: (date: Date) => date > new Date(),
    },
  },
  {
    name: 'workPeriod',
    title: '工作期间',
    dataIndex: 'workPeriod',
    dataType: 'date',
    dateType: 'date-range',
    dateConfig: {
      separator: ' 至 ',
    },
  },
  {
    name: 'lastLogin',
    title: '最后登录',
    dataIndex: 'lastLogin',
    dataType: 'date',
    dateType: 'datetime',
    dateConfig: {
      readOnly: true,
    },
  },
];

const data = [
  {
    id: 1,
    name: '张三',
    birthday: '1990-05-15',
    workPeriod: ['2020-01-01', '2023-12-31'],
    lastLogin: '2023-12-01 14:30:00',
  },
];

function MyTable() {
  return (
    <BaseTable
      columns={columns}
      data={data}
    />
  );
}
```

通过以上配置，表格会自动根据列的 `dateType` 选择合适的日期组件进行渲染，提供一致的用户体验。
