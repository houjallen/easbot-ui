// packages/eas-ui-next/src/components/ui/command/command.tsx
import {
  Command as DsCommand,
  CommandDialog as DsCommandDialog,
  CommandEmpty as DsCommandEmpty,
  CommandGroup as DsCommandGroup,
  CommandInput as DsCommandInput,
  CommandItem as DsCommandItem,
  CommandList as DsCommandList,
  CommandSeparator as DsCommandSeparator,
  CommandShortcut as DsCommandShortcut,
} from '../../design-system/components/ui/command';
import { useComponentMessage } from '../../utils/use-component-message';
import React from 'react';

/** 命令面板主组件 */
export const Command = DsCommand;
export const CommandEmpty = DsCommandEmpty;
export const CommandGroup = DsCommandGroup;
export const CommandInput = DsCommandInput;
export const CommandItem = DsCommandItem;
export const CommandList = DsCommandList;
export const CommandSeparator = DsCommandSeparator;
export const CommandShortcut = DsCommandShortcut;

/**
 * 命令面板对话框
 *
 * @description
 * 完全复用 design-system 的 CommandDialog，仅在**文案层**做国际化包装：
 * 标题与描述的默认文案来自内置文案表（见 `spec/i18n-standard.md`）。
 *
 * 消费方仍可通过 `title` / `description` 覆盖默认文案。
 */
function CommandDialog({ title, description, locale, messages, ...props }: React.ComponentProps<typeof DsCommandDialog>) {
  const { t } = useComponentMessage('command', { locale, messages });
  return <DsCommandDialog title={title ?? t('dialogTitle')} description={description ?? t('dialogDescription')} locale={locale} messages={messages} {...props} />;
}

export { CommandDialog };

/** 类型导出，便于 IDE 智能提示 */
export type CommandProps = React.ComponentProps<typeof Command>;
export type CommandDialogProps = React.ComponentProps<typeof CommandDialog>;
export type CommandInputProps = React.ComponentProps<typeof CommandInput>;
export type CommandListProps = React.ComponentProps<typeof CommandList>;
export type CommandEmptyProps = React.ComponentProps<typeof CommandEmpty>;
export type CommandGroupProps = React.ComponentProps<typeof CommandGroup>;
export type CommandItemProps = React.ComponentProps<typeof CommandItem>;
export type CommandShortcutProps = React.ComponentProps<typeof CommandShortcut>;
export type CommandSeparatorProps = React.ComponentProps<typeof CommandSeparator>;
