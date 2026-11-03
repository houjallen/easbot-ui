'use client';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useTheme } from '../providers/theme-provider';
import { useComponentMessage } from '../../utils/use-component-message';
import type { UiMessageProps } from '../../utils/ui-message';

export const ModeToggle = ({ locale, messages }: UiMessageProps) => {
  const { setTheme } = useTheme();
  const { t } = useComponentMessage('theme', { locale, messages });

  const themes = [
    { label: t('lightMode'), value: 'light' },
    { label: t('darkMode'), value: 'dark' },
    { label: t('systemMode'), value: 'system' },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 text-foreground">
          <SunIcon className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('toggleLabel')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map(({ label, value }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
