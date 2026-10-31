import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../utils/classnames';
import { cva, type VariantProps } from 'class-variance-authority';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--dialog-overlay-bg)_var(--dialog-overlay-opacity),transparent)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-[var(--dialog-content-gap)] border-[var(--dialog-content-border)] bg-[var(--dialog-content-bg)] text-[var(--dialog-content-fg)] p-[var(--dialog-content-padding)] shadow-[var(--dialog-content-shadow)] rounded-[var(--dialog-content-radius)] transition-all [transition-duration:var(--dialog-transition-duration)]',
  {
    variants: {
      size: {
        sm: 'max-w-[var(--dialog-sm-max-width)]',
        md: 'max-w-[var(--dialog-md-max-width)]',
        lg: 'max-w-[var(--dialog-lg-max-width)]',
      },
      variant: {
        default: '',
        dark: 'bg-[var(--dialog-dark-bg)] text-[var(--dialog-dark-fg)]',
      },
      maximized: {
        true: 'fixed inset-4 !max-w-none !w-auto !translate-x-0 !translate-y-0 !top-0 !left-0',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      maximized: false,
    },
  },
);

// 更新 DialogContent 的属性接口
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof dialogContentVariants> {
  maximizable?: boolean;
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(({ className, size, variant, maximizable = false, ...props }, ref) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogContentVariants({ size, variant, maximized: isMaximized }), 'data-[state=open]:animate-in data-[state=closed]:animate-out', className)}
        {...props}
      >
        {props.children}
        <div className="absolute right-4 top-4 flex gap-2">
          {maximizable && (
            <button
              type="button"
              className="rounded-[2px] opacity-[var(--dialog-close-opacity)] transition-opacity hover:opacity-[var(--dialog-close-hover-opacity)] focus:outline-none focus:ring-2 focus:ring-[var(--dialog-close-focus-ring)] focus:ring-offset-[var(--dialog-close-focus-ring-offset)] disabled:pointer-events-none"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="sr-only">{isMaximized ? '还原' : '最大化'}</span>
            </button>
          )}
          <DialogPrimitive.Close className="rounded-[2px] opacity-[var(--dialog-close-opacity)] transition-opacity hover:opacity-[var(--dialog-close-hover-opacity)] focus:outline-none focus:ring-2 focus:ring-[var(--dialog-close-focus-ring)] focus:ring-offset-[var(--dialog-close-focus-ring-offset)] disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">关闭</span>
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col', 'space-y-[var(--dialog-content-gap)]', 'text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end', 'sm:space-x-[var(--dialog-content-gap)]', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[var(--dialog-title-font-size)] font-[var(--dialog-title-font-weight)] leading-[var(--dialog-title-line-height)] tracking-[var(--dialog-title-tracking)]', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-[var(--dialog-description-color)]', 'text-[length:var(--dialog-description-font-size)]', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;
type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
type DialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export type { DialogProps, DialogContentProps, DialogTitleProps, DialogDescriptionProps, DialogHeaderProps, DialogFooterProps };

export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
