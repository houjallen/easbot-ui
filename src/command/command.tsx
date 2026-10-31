import { Dialog, DialogContent } from '../dialog';
import { Spinner } from '../spinner';
import { cn } from '../utils/classnames';
import type { DialogProps } from '@radix-ui/react-dialog';
import {
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
  Command as CommandPrimitive,
  CommandSeparator as CommandSeparatorPrimitive,
} from 'cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';

/**
 * 命令面板根组件
 *
 * @description
 * 提供命令式交互界面，支持快速搜索和执行操作
 */
type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, CommandProps>(({ className, ...props }, ref) => (
  <CommandPrimitive ref={ref} className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-[var(--command-background)] text-[var(--command-foreground)]', className)} {...props} />
));
Command.displayName = CommandPrimitive.displayName;

/**
 * 命令对话框组件
 *
 * @description
 * 结合对话框的命令面板，支持加载状态显示
 */
interface CommandDialogProps extends DialogProps {
  /** 是否显示加载状态 @default false */
  loading?: boolean;
  /** 自定义加载指示器 */
  loader?: React.ReactNode;
}

const CommandDialog = ({ children, loading = false, loader, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-[var(--command-dialog-content-padding)] shadow-[var(--command-dialog-shadow)]">
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--command-loading-bg)',
              opacity: 'var(--command-loading-bg-opacity)',
            }}
          >
            {loader || <Spinner className="h-8 w-8" />}
          </div>
        )}
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

/**
 * 命令输入框组件
 *
 * @description
 * 提供带搜索图标的输入框，支持过滤命令项
 */
const CommandInput = React.forwardRef<React.ElementRef<typeof CommandInputPrimitive>, React.ComponentPropsWithoutRef<typeof CommandInputPrimitive>>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-[var(--command-border)] px-3" data-cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandInputPrimitive
      ref={ref}
      className={cn(
        'flex h-[var(--command-input-height)] w-full rounded-md bg-[var(--command-input-bg)] px-2 py-2 text-sm outline-none border-none focus:ring-0 placeholder:text-[var(--command-input-placeholder)] disabled:cursor-not-allowed disabled:opacity-[var(--command-item-disabled-opacity)]',
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandInputPrimitive.displayName;

const CommandList = React.forwardRef<React.ElementRef<typeof CommandListPrimitive>, React.ComponentPropsWithoutRef<typeof CommandListPrimitive>>(({ className, ...props }, ref) => (
  <CommandListPrimitive ref={ref} className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)} {...props} />
));

CommandList.displayName = CommandListPrimitive.displayName;

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandEmptyPrimitive>, React.ComponentPropsWithoutRef<typeof CommandEmptyPrimitive>>((props, ref) => (
  <CommandEmptyPrimitive ref={ref} className="py-6 text-center text-sm text-[var(--command-empty-text)]" {...props} />
));

CommandEmpty.displayName = CommandEmptyPrimitive.displayName;

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandGroupPrimitive>, React.ComponentPropsWithoutRef<typeof CommandGroupPrimitive>>(({ className, ...props }, ref) => (
  <CommandGroupPrimitive
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-[var(--command-foreground)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--command-group-heading-color)]',
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandGroupPrimitive.displayName;

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandSeparatorPrimitive>, React.ComponentPropsWithoutRef<typeof CommandSeparatorPrimitive>>(({ className, ...props }, ref) => (
  <CommandSeparatorPrimitive ref={ref} className={cn('-mx-1 h-px bg-[var(--command-separator-color)]', className)} {...props} />
));
CommandSeparator.displayName = CommandSeparatorPrimitive.displayName;

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandItemPrimitive>, React.ComponentPropsWithoutRef<typeof CommandItemPrimitive>>(({ className, onSelect, children, ...props }, ref) => {
  // 使用状态跟踪鼠标是否悬停在元素上
  const [isHovered, setIsHovered] = React.useState(false);

  // 处理选择事件
  const handleSelect = React.useCallback(
    (value: string) => {
      if (onSelect) {
        onSelect(value);
      }
    },
    [onSelect],
  );

  // 直接处理点击事件
  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const value = typeof children === 'string' ? children : '';
      if (onSelect) {
        onSelect(value);
      }
    },
    [children, onSelect],
  );

  return (
    <div className="relative w-full">
      <CommandItemPrimitive
        ref={ref}
        onSelect={handleSelect}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-[var(--command-item-padding)] py-1.5 text-sm outline-none bg-[var(--command-item-bg)]',
          'hover:bg-[var(--command-item-hover-bg)] hover:text-[var(--command-item-hover-fg)] hover:shadow-[var(--command-item-hover-shadow)]',
          'aria-selected:bg-[var(--command-item-hover-bg)] aria-selected:text-[var(--command-item-hover-fg)] aria-selected:shadow-[var(--command-item-hover-shadow)]',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--command-item-disabled-opacity)]',
          'transition-all duration-&lsqb;var(--command-item-transition-duration)&rsqb; ease-&lsqb;var(--command-item-transition-timing)&rsqb;',
          isHovered && 'bg-[var(--command-item-hover-bg)] text-[var(--command-item-hover-fg)] shadow-[var(--command-item-hover-shadow)]',
          className,
        )}
        {...props}
      >
        {children}
      </CommandItemPrimitive>
      {/* 悬停/点击热区覆盖层 —— 纯装饰用途，语义上对辅助技术隐藏 */}
      <div aria-hidden="true" className="absolute inset-0 z-10 cursor-pointer" onClick={handleClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} />
    </div>
  );
});

CommandItem.displayName = CommandItemPrimitive.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('ml-auto text-xs tracking-widest text-[var(--command-group-heading-color)]', className)} {...props} />;
};
CommandShortcut.displayName = 'CommandShortcut';

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut };

export type { CommandDialogProps, CommandProps };
