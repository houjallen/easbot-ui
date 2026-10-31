import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '../utils/classnames';
import { cva, type VariantProps } from 'class-variance-authority';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center',
      'rounded-[var(--dropdown-menu-item-radius)]',
      'px-[var(--dropdown-menu-item-padding-x)] py-[var(--dropdown-menu-item-padding-y)]',
      'text-[var(--dropdown-menu-md-font-size)]',
      'outline-none focus:bg-[var(--dropdown-menu-item-hover-bg)] focus:text-[var(--dropdown-menu-item-hover-fg)]',
      'data-[state=open]:bg-[var(--dropdown-menu-item-hover-bg)]',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50',
        'min-w-[var(--dropdown-menu-min-width)]',
        'overflow-hidden',
        'rounded-[var(--dropdown-menu-radius)]',
        'border-[var(--dropdown-menu-border)]',
        'bg-[var(--dropdown-menu-bg)]',
        'text-[var(--dropdown-menu-fg)]',
        'p-[var(--dropdown-menu-padding)]',
        'shadow-[var(--dropdown-menu-sub-content-shadow)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const dropdownMenuVariants = cva(
  cn(
    'z-50',
    'overflow-hidden',
    'rounded-[var(--dropdown-menu-radius)]',
    'border-[var(--dropdown-menu-border)]',
    'bg-[var(--dropdown-menu-bg)]',
    'text-[var(--dropdown-menu-fg)]',
    'p-[var(--dropdown-menu-padding)]',
    'shadow-[var(--dropdown-menu-shadow)]',
  ),
  {
    variants: {
      size: {
        sm: 'min-w-[var(--dropdown-menu-sm-min-width)] text-[var(--dropdown-menu-sm-font-size)]', // 小尺寸
        md: 'min-w-[var(--dropdown-menu-md-min-width)] text-[var(--dropdown-menu-md-font-size)]', // 中尺寸（默认）
        lg: 'min-w-[var(--dropdown-menu-lg-min-width)] text-[var(--dropdown-menu-lg-font-size)]', // 大尺寸
      },
      variant: {
        default: 'bg-popover', // 默认主题
        dark: 'bg-gray-800 text-gray-100', // 暗色主题
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & VariantProps<typeof dropdownMenuVariants>
>(({ className, size, variant, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      className={cn(
        dropdownMenuVariants({ size, variant }),
        'data-[state=open]:animate-in data-[state=closed]:animate-out', // 动画控制
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center',
      'rounded-[var(--dropdown-menu-item-radius)]',
      'px-[var(--dropdown-menu-item-padding-x)] py-[var(--dropdown-menu-item-padding-y)]',
      'text-[var(--dropdown-menu-md-font-size)]',
      'outline-none transition-colors',
      'focus:bg-[var(--dropdown-menu-item-hover-bg)] focus:text-[var(--dropdown-menu-item-hover-fg)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--dropdown-menu-item-disabled-opacity)]',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>>(
  ({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center',
        'rounded-[var(--dropdown-menu-item-radius)]',
        'py-[var(--dropdown-menu-item-padding-y)] pl-8 pr-[var(--dropdown-menu-item-padding-x)]',
        'text-[var(--dropdown-menu-md-font-size)]',
        'outline-none transition-colors',
        'focus:bg-[var(--dropdown-menu-item-hover-bg)] focus:text-[var(--dropdown-menu-item-hover-fg)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--dropdown-menu-item-disabled-opacity)]',
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  ),
);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center',
        'rounded-[var(--dropdown-menu-item-radius)]',
        'py-[var(--dropdown-menu-item-padding-y)] pl-8 pr-[var(--dropdown-menu-item-padding-x)]',
        'text-[var(--dropdown-menu-md-font-size)]',
        'outline-none transition-colors',
        'focus:bg-[var(--dropdown-menu-item-hover-bg)] focus:text-[var(--dropdown-menu-item-hover-fg)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--dropdown-menu-item-disabled-opacity)]',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  ),
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-[var(--dropdown-menu-item-padding-x)] py-[var(--dropdown-menu-item-padding-y)]',
      'text-[var(--dropdown-menu-md-font-size)]',
      'font-[var(--dropdown-menu-label-font-weight)]',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(
  ({ className, ...props }, ref) => <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-[var(--dropdown-menu-separator-bg)]', className)} {...props} />,
);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('ml-auto', 'text-[var(--dropdown-menu-shortcut-font-size)]', 'tracking-widest', 'opacity-[var(--dropdown-menu-shortcut-opacity)]', className)} {...props} />;
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

export type DropdownMenuProps = React.ComponentProps<typeof DropdownMenu>;
export type DropdownMenuTriggerProps = React.ComponentProps<typeof DropdownMenuTrigger>;
export type DropdownMenuContentProps = React.ComponentProps<typeof DropdownMenuContent>;
export type DropdownMenuItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  /**
   * 是否缩进显示
   * @default false
   */
  inset?: boolean;
};
export type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof DropdownMenuCheckboxItem>;
export type DropdownMenuRadioItemProps = React.ComponentProps<typeof DropdownMenuRadioItem>;
export type DropdownMenuLabelProps = React.ComponentProps<typeof DropdownMenuLabel>;
export type DropdownMenuSeparatorProps = React.ComponentProps<typeof DropdownMenuSeparator>;
