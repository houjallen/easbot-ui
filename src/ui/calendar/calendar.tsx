'use client';

import { Calendar as DsCalendar } from '../../design-system/components/ui/calendar';
import React from 'react';

export const Calendar = DsCalendar;

// 类型导出，带中文注释
export type CalendarProps = React.ComponentProps<typeof Calendar>; // 日历组件属性
