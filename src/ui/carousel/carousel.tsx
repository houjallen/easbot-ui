'use client';

import {
  Carousel as DsCarousel,
  CarouselContent as DsCarouselContent,
  CarouselItem as DsCarouselItem,
  CarouselNext as DsCarouselNext,
  CarouselPrevious as DsCarouselPrevious,
} from '../../design-system/components/ui/carousel';
import type { CarouselApi as DsCarouselApi } from '../../design-system/components/ui/carousel';
import type { UiMessageProps } from '../../utils/ui-message';
import React from 'react';

/**
 * 轮播图根组件 —— 透传 `locale` / `messages` 供轮播文案国际化
 */
function Carousel({ locale, messages, ...props }: React.ComponentProps<typeof DsCarousel>) {
  return <DsCarousel locale={locale} messages={messages} {...props} />;
}

/** 轮播图内容容器 */
const CarouselContent = DsCarouselContent;

/** 轮播图项 */
function CarouselItem({ locale, messages, ...props }: React.ComponentProps<typeof DsCarouselItem>) {
  return <DsCarouselItem locale={locale} messages={messages} {...props} />;
}

/** 上一张按钮 */
function CarouselPrevious({ locale, messages, ...props }: React.ComponentProps<typeof DsCarouselPrevious>) {
  return <DsCarouselPrevious locale={locale} messages={messages} {...props} />;
}

/** 下一张按钮 */
function CarouselNext({ locale, messages, ...props }: React.ComponentProps<typeof DsCarouselNext>) {
  return <DsCarouselNext locale={locale} messages={messages} {...props} />;
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };

// 直接导出设计系统 CarouselApi 类型，方便业务使用
export type CarouselApi = DsCarouselApi;
export type CarouselProps = React.ComponentProps<typeof Carousel> & UiMessageProps; // 轮播图根组件属性
export type CarouselContentProps = React.ComponentProps<typeof CarouselContent>; // 轮播图内容容器属性
export type CarouselItemProps = React.ComponentProps<typeof CarouselItem>; // 轮播图项属性
export type CarouselPreviousProps = React.ComponentProps<typeof CarouselPrevious>; // 上一页按钮属性
export type CarouselNextProps = React.ComponentProps<typeof CarouselNext>; // 下一页按钮属性
