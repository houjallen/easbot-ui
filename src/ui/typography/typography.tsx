import { Tag } from '../tag';
import { cn } from '../../utils/classnames';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';
import React from 'react';

/**
 * Typography组件库
 * 基于Shadcn UI风格实现的排版组件集合
 */

// 标题组件 (h1-h6)
function H1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn('scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl', className)} {...props} />;
}

function H2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0', className)} {...props} />;
}

function H3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('scroll-m-20 font-semibold text-2xl tracking-tight', className)} {...props} />;
}

function H4({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn('scroll-m-20 font-semibold text-xl tracking-tight', className)} {...props} />;
}

function H5({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('scroll-m-20 font-semibold text-lg tracking-tight', className)} {...props} />;
}

function H6({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h6 className={cn('scroll-m-20 font-semibold text-base tracking-tight', className)} {...props} />;
}

// 段落组件
function P({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />;
}

// 大号段落
function Large({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('font-semibold text-lg', className)} {...props} />;
}

// 小号段落
function Small({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('font-medium text-sm leading-none', className)} {...props} />;
}

// 次要文本
function Muted({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

// 引用块
function Blockquote({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) {
  return <blockquote className={cn('mt-6 border-primary border-l-2 pl-6 italic', className)} {...props} />;
}

// 内联代码
function InlineCode({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <code className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm', className)} {...props} />;
}

// 代码块
function CodeBlock({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return <pre className={cn('mt-6 mb-4 overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm', className)} {...props} />;
}

// 列表组件
function List({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)} {...props} />;
}

function OrderedList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return <ol className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', className)} {...props} />;
}

function ListItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props} />;
}

// 分隔线
function Separator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('my-4 md:my-8', className)} {...props} />;
}

// 强调文本
function Strong({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <strong className={cn('font-semibold', className)} {...props} />;
}

// 斜体文本
function Em({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <em className={cn('italic', className)} {...props} />;
}

// 链接
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
}

function Link({ className, external, ...props }: LinkProps) {
  return <a className={cn('font-medium underline underline-offset-4 hover:text-primary', className)} {...(external && { target: '_blank', rel: 'noopener noreferrer' })} {...props} />;
}

// 表格组件
function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn('w-full', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...props} />;
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b transition-colors hover:bg-muted/50', className)} {...props} />;
}

function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)} {...props} />;
}

function TableCell({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />;
}

// 静态字段显示组件
export interface StaticProps extends React.HTMLAttributes<HTMLDivElement>, UiMessageProps {
  /**
   * 是否为空值
   */
  isEmpty?: boolean;
  /**
   * 空值显示的文本
   */
  emptyText?: string;
  /**
   * 展现类型：控制如何展示内容
   */
  displayType?: 'text' | 'image' | 'link' | 'list' | 'json' | 'object' | 'tag' | 'html' | 'textarea';
  /**
   * 图片URL（当displayType为image时使用）
   */
  imageUrl?: string;
  /**
   * 图片名称（当displayType为image时使用）
   */
  imageName?: string;
  /**
   * 基础URL（用于拼接相对路径）
   */
  baseUrl?: string;
  /**
   * 选项列表（用于tag类型）
   */
  options?: Array<{ label: string; value: string; disabled?: boolean }>;
  /**
   * 固定高度（用于内容较多的类型）
   */
  fixedHeight?: number;
  /**
   * 是否显示滚动条
   */
  scrollable?: boolean;
  /**
   * tag 最大展示数量（多余以 +n 展示）。不传则默认 3。
   */
  maxTags?: number;
}

/**
 * 静态字段显示组件
 * 用于统一处理表单字段在静态模式下的显示样式
 */
export function Static({
  className,
  isEmpty = false,
  emptyText = '-',
  displayType = 'text',
  imageUrl,
  imageName,
  baseUrl = '',
  options,
  fixedHeight,
  scrollable = true,
  maxTags,
  children,
  locale,
  messages,
  ...props
}: StaticProps) {
  // 定义统一的字体大小样式
  const textSizeClass = 'text-sm';
  const { t } = useComponentMessage('typography', { locale, messages });

  // 如果是空值，显示占位符
  if (isEmpty) {
    return (
      <div className={cn(textSizeClass, 'py-1.5 text-muted-foreground', className)} {...props}>
        {emptyText}
      </div>
    );
  }

  // 根据展现类型处理内容
  switch (displayType) {
    case 'image': {
      // 处理图片类型
      const imageSrc = imageUrl || (typeof children === 'string' ? children : '');
      if (imageSrc) {
        // 处理URL，如果是相对路径且提供了baseUrl，则拼接完整URL
        const fullImageUrl = imageSrc.startsWith('http') || imageSrc.startsWith('data:') ? imageSrc : `${baseUrl}${imageSrc}`;

        return (
          <div className={cn('relative w-[120px] min-w-[120px] max-w-[120px] shrink-0 overflow-hidden rounded-lg border bg-muted', className)} {...props}>
            {/* 使用 AspectRatio 确保 1:1 比例 */}
            <div className="aspect-square w-full">
              <img src={fullImageUrl} alt={imageName || t('imageAlt')} className="h-full w-full object-cover" />
            </div>

            {/* 文件名（如果提供） */}
            {imageName && (
              <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-2">
                <p className="truncate text-white text-xs">{imageName}</p>
              </div>
            )}
          </div>
        );
      }
      return (
        <div className={cn(textSizeClass, 'py-1.5 text-muted-foreground', className)} {...props}>
          -
        </div>
      );
    }

    case 'link':
      // 处理链接类型
      if (typeof children === 'string' && children) {
        const fileUrl = children.startsWith('http') || children.startsWith('data:') ? children : `${baseUrl}${children}`;
        const fileName = children.split('/').pop() || t('fileFallbackName');

        return (
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={cn(textSizeClass, 'flex items-center gap-1 py-1.5 text-primary underline hover:text-primary/80', className)}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {/* 文件图标为装饰图形，文件名已作为可读文本紧随其后 */}
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {fileName}
          </a>
        );
      }
      return (
        <div className={cn(textSizeClass, 'py-1.5 text-muted-foreground', className)} {...props}>
          -
        </div>
      );

    case 'list': {
      // 处理列表类型
      const listItems = Array.isArray(children) ? children : [];
      return (
        <ul
          className={cn(textSizeClass, 'list-disc py-1.5 pl-5', fixedHeight && `h-[${fixedHeight}px]`, scrollable && fixedHeight && 'overflow-y-auto', className)}
          style={fixedHeight ? { height: `${fixedHeight}px` } : undefined}
          {...(props as React.HTMLAttributes<HTMLUListElement>)}
        >
          {listItems.map((item, index) => (
            <li key={index} className="mt-1">
              {typeof item === 'object'
                ? // 如果是对象，尝试更友好地显示
                  item.label || item.name || item.title || JSON.stringify(item)
                : String(item)}
            </li>
          ))}
        </ul>
      );
    }

    case 'json':
    case 'object': {
      // 处理JSON/对象类型
      let content = children;
      if (typeof children === 'object' && children !== null) {
        try {
          content = JSON.stringify(children, null, 2);
        } catch (e) {
          content = String(children);
        }
      }

      return (
        <pre
          className={cn(textSizeClass, 'max-w-full rounded-md bg-muted/50 p-2 font-mono', fixedHeight && `h-[${fixedHeight}px]`, scrollable && fixedHeight && 'overflow-y-auto', className)}
          style={fixedHeight ? { height: `${fixedHeight}px` } : undefined}
          {...(props as React.HTMLAttributes<HTMLPreElement>)}
        >
          {String(content)}
        </pre>
      );
    }

    case 'tag': {
      // 处理标签类型（布尔/枚举/多值显示）
      // 统一规格：高度 h-6、size=sm，单个标签内容截断，最多展示 maxTags（默认3），多余以 +n 显示，并提供 title 提示
      const MAX_TAGS = typeof maxTags === 'number' ? maxTags : 3;

      // 计算标签变体（布尔/状态友好色）
      const getTagVariant = (val: string): 'default' | 'success' | 'warning' | 'info' | 'error' | 'secondary' | 'outline' => {
        if (val === '1' || val === 'true' || val === '是' || val === '启用' || val === '开启') return 'success';
        if (val === '0' || val === 'false' || val === '否' || val === '禁用' || val === '关闭') return 'error';
        return 'default';
      };

      // 归一化 children -> string[]
      const raw = children as any;
      let items: string[] = [];
      if (Array.isArray(raw)) {
        items = raw.map((it) => (typeof it === 'object' ? String(it?.value ?? it?.label ?? it) : String(it))).filter(Boolean);
      } else if (typeof raw === 'string') {
        items = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (items.length === 0) items = [raw];
      } else if (raw != null) {
        items = [String(raw)];
      }

      // options 映射 value -> label
      const mapToLabel = (val: string): string => {
        if (options && Array.isArray(options)) {
          const hit = options.find((opt) => (typeof opt === 'object' ? String(opt.value) : String(opt)) === val);
          return hit ? (typeof hit === 'object' ? String(hit.label) : String(hit)) : val;
        }
        return val;
      };

      const labels = items.map(mapToLabel);
      const display = labels.slice(0, MAX_TAGS);
      const extra = labels.length - display.length;

      return (
        <div className={cn('flex flex-wrap items-center gap-1 py-0.5', className)} {...props}>
          {display.map((label, idx) => (
            <Tag key={`${label}-${idx}`} size="md" variant={getTagVariant(String(items[idx] ?? label))} className="max-h-6 [&>span]:max-w-24 [&>span]:truncate" title={label}>
              {label}
            </Tag>
          ))}
          {extra > 0 && (
            <Tag size="md" variant="secondary" className="max-h-6" title={labels.slice(MAX_TAGS).join(', ')}>
              +{extra}
            </Tag>
          )}
        </div>
      );
    }

    case 'html': {
      // 处理富文本类型
      const htmlContent = typeof children === 'string' ? children : String(children);
      return (
        <div
          className={cn(textSizeClass, 'py-1.5', fixedHeight && `h-[${fixedHeight}px]`, scrollable && fixedHeight && 'overflow-y-auto', className)}
          style={fixedHeight ? { height: `${fixedHeight}px` } : undefined}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          {...props}
        />
      );
    }

    case 'textarea': {
      // 处理多行文本类型
      const textContent = String(children);
      return (
        <div
          className={cn(textSizeClass, 'whitespace-pre-wrap py-1.5', fixedHeight && `h-[${fixedHeight}px]`, scrollable && fixedHeight && 'overflow-y-auto', className)}
          style={fixedHeight ? { height: `${fixedHeight}px` } : undefined}
          {...props}
        >
          {textContent}
        </div>
      );
    }
    default:
      // 默认文本类型
      return (
        <div className={cn(textSizeClass, 'py-1.5', className)} {...props}>
          {String(children)}
        </div>
      );
  }
}

// 导出所有组件作为Typography对象
export const Typography = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Large,
  Small,
  Muted,
  Blockquote,
  InlineCode,
  CodeBlock,
  List,
  OrderedList,
  ListItem,
  Separator,
  Strong,
  Em,
  Link,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  Static,
};
