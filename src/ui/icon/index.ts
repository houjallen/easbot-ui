import {
  AlertCircle,
  AlertTriangle,
  AppWindow,
  ArrowDown,
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRight,
  ArrowUp,
  Bell,
  BookOpen,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  Cog,
  Copy,
  Cpu,
  Download,
  Edit,
  Eye,
  EyeOff,
  File,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  Fullscreen,
  Globe,
  GripVertical,
  Heart,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  Link,
  Lock,
  LogIn,
  LogOut,
  Luggage,
  Menu,
  Minus,
  MinusCircle,
  Monitor,
  MoreHorizontal,
  MoreVertical,
  Move,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  PlusCircle,
  Printer,
  Save,
  Search,
  Settings,
  Settings2,
  Shield,
  ShieldCheck,
  SquareFunction,
  Star,
  Terminal,
  ToggleLeft,
  ToggleRight,
  Trash,
  Unlock,
  Upload,
  User,
  UserCheck,
  UserCircle,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import React from 'react';
import { registerIcon, registerI18nIcon } from './icon';
import type { EasIconComponentProps } from './icon';
import { EasLanguageIcon, EasMoonIcon, EasRefreshIcon, EasSunIcon, EasSystemIcon } from './svg/eas-icon';

/**
 * 全局注册 lucide-react 常用图标，便于统一调用
 * 可在应用中直接通过 <Icon name="info" /> 等方式使用
 */
const lucideIcons = {
  info: Info,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  'alert-circle': AlertCircle,
  terminal: Terminal,
  edit: Edit,
  plus: Plus,
  minus: Minus,
  search: Search,
  user: User,
  settings: Settings,
  settings2: Settings2,
  eye: Eye,
  'eye-off': EyeOff,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  trash: Trash,
  copy: Copy,
  file: File,
  folder: Folder,
  lock: Lock,
  unlock: Unlock,
  home: Home,
  bell: Bell,
  calendar: Calendar,
  clock: Clock,
  star: Star,
  heart: Heart,
  filter: Filter,
  'sort-asc': ArrowUp,
  'sort-desc': ArrowDown,
  sort: ChevronsUpDown,
  upload: Upload,
  download: Download,
  link: Link,
  globe: Globe,
  'help-circle': HelpCircle,
  login: LogIn,
  logout: LogOut,
  luggage: Luggage,
  'book-open': BookOpen,
  'panel-right-close': PanelRightClose,
  'panel-right-open': PanelRightOpen,
  'layout-dashboard': LayoutDashboard,
  users: Users,
  shield: Shield,
  building: Building,
  cpu: Cpu,
  'app-window': AppWindow,
  'file-text': FileText,
  'file-spreadsheet': FileSpreadsheet,
  save: Save,
  cancel: X,
  delete: Trash,
  back: ArrowLeftCircle,
  permissions: Shield,
  model: Cpu,
  tenant: Building,
  role: Shield,
  'user-check': UserCheck,
  'shield-check': ShieldCheck,
  'building-2': Building2,
  'cpu-icon': Cpu,
  monitor: Monitor,
  cog: Cog,
  'user-circle': UserCircle,
  'arrow-left-circle': ArrowLeftCircle,
  check: Check,
  x: X,
  'plus-circle': PlusCircle,
  'minus-circle': MinusCircle,
  menu: Menu,
  'more-vertical': MoreVertical,
  'more-horizontal': MoreHorizontal,
  print: Printer,
  'toggle-left': ToggleLeft,
  'toggle-right': ToggleRight,
  function: SquareFunction,

  // 表格专用图标
  loader: Clock, // 使用 Clock 作为加载指示器
  'table-settings': Settings, // 表格设置
  expand: ChevronRight, // 展开
  collapse: ChevronDown, // 收起
  'column-resize': Menu, // 列宽调整，使用Menu作为拖拽手柄
  'row-drag': Menu, // 行拖拽
  'column-sort': ChevronsUpDown, // 列排序
  'table-refresh': EasRefreshIcon, // 表格刷新
  'table-export': Download, // 导出
  'table-print': Printer, // 打印
  'table-fullscreen': Fullscreen, // 全屏
  'table-add': Plus, // 新增
  'table-delete': Trash, // 删除
  'table-edit': Edit, // 编辑
  'table-view': Eye, // 查看
  'table-copy': Copy, // 复制
  'row-enable': Check, // 启用
  'row-disable': X, // 禁用
  'table-filter-clear': XCircle, // 清除筛选
  'table-sort-asc': ArrowUp, // 升序
  'table-sort-desc': ArrowDown, // 降序
  'table-sort-none': ChevronsUpDown, // 无排序
  'table-filter': Filter, // 筛选
  'table-filter-active': Filter, // 活跃的筛选
  'table-expand': ChevronRight, // 表格行展开
  'table-collapse': ChevronDown, // 表格行收起
  'table-more': MoreVertical, // 更多操作
  'table-checkbox': Check, // 复选框
  'table-radio': Check, // 单选框
  'table-loading': Clock, // 加载状态

  // 新增缺少的图标
  move: Move, // 移动
  'grip-vertical': GripVertical, // 垂直拖拽手柄
};

for (const [name, Comp] of Object.entries(lucideIcons)) {
  registerIcon(name, Comp as React.ComponentType<React.SVGProps<SVGSVGElement>>);
}

// 1. 导入 Radix Icons（推荐常用的，全部导入会非常多）
import {
  AccessibilityIcon,
  ActivityLogIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BackpackIcon,
  BellIcon,
  CalendarIcon,
  CheckCircledIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClipboardIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  DotsVerticalIcon,
  DownloadIcon,
  ExclamationTriangleIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  FileIcon,
  GearIcon,
  HeartFilledIcon,
  InfoCircledIcon,
  LockClosedIcon,
  LockOpen1Icon,
  MoonIcon,
  PersonIcon,
  PlusCircledIcon,
  ReloadIcon,
  StarFilledIcon,
  SunIcon,
  TrashIcon,
  UploadIcon,
} from '@radix-ui/react-icons';

// 2. 注册（名称加 radix- 前缀）
const radixIcons = {
  'radix-sun': SunIcon,
  'radix-moon': MoonIcon,
  'radix-accessibility': AccessibilityIcon,
  'radix-activity-log': ActivityLogIcon,
  'radix-arrow-down': ArrowDownIcon,
  'radix-arrow-left': ArrowLeftIcon,
  'radix-arrow-right': ArrowRightIcon,
  'radix-arrow-up': ArrowUpIcon,
  'radix-backpack': BackpackIcon,
  'radix-bell': BellIcon,
  'radix-calendar': CalendarIcon,
  'radix-check-circled': CheckCircledIcon,
  'radix-chevron-down': ChevronDownIcon,
  'radix-chevron-left': ChevronLeftIcon,
  'radix-chevron-right': ChevronRightIcon,
  'radix-chevron-up': ChevronUpIcon,
  'radix-clipboard': ClipboardIcon,
  'radix-cross-circled': CrossCircledIcon,
  'radix-dots-horizontal': DotsHorizontalIcon,
  'radix-dots-vertical': DotsVerticalIcon,
  'radix-download': DownloadIcon,
  'radix-exclamation-triangle': ExclamationTriangleIcon,
  'radix-eye-closed': EyeClosedIcon,
  'radix-eye-open': EyeOpenIcon,
  'radix-file': FileIcon,
  'radix-gear': GearIcon,
  'radix-heart-filled': HeartFilledIcon,
  'radix-info-circled': InfoCircledIcon,
  'radix-lock-closed': LockClosedIcon,
  'radix-lock-open': LockOpen1Icon,
  'radix-person': PersonIcon,
  'radix-plus-circled': PlusCircledIcon,
  'radix-reload': ReloadIcon,
  'radix-star-filled': StarFilledIcon,
  'radix-trash': TrashIcon,
  'radix-upload': UploadIcon,
};

for (const [name, Comp] of Object.entries(radixIcons)) {
  registerIcon(name, Comp as React.ComponentType<React.SVGProps<SVGSVGElement>>);
}

// 注册自定义 EAS 图标
const easIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'eas-language': EasLanguageIcon,
  'eas-refresh': EasRefreshIcon,
  'eas-moon': EasMoonIcon,
  'eas-sun': EasSunIcon,
  'eas-system': EasSystemIcon,
};

for (const [name, Comp] of Object.entries(easIcons)) {
  registerIcon(name, Comp as React.ComponentType<React.SVGProps<SVGSVGElement>>);
}

// 注册带 i18n 文案的主题图标（`aria-label` / `<title>` 来自内置文案表）
const easI18nIcons: Record<string, React.FC<EasIconComponentProps>> = {
  'eas-moon': EasMoonIcon,
  'eas-sun': EasSunIcon,
  'eas-system': EasSystemIcon,
};

for (const [name, Comp] of Object.entries(easI18nIcons)) {
  registerI18nIcon(name, Comp);
}

export * from './icon';
export type { IconProps } from './icon';
export { IconButton } from './icon-button';
export type { IconButtonProps } from './icon-button';

/**
 * 图标字体类名清单（796 个）
 *
 * ⚠️ **需先引入 `@easbot/ui/iconfont.css`** —— 该清单只是类名字符串，
 * 字形由 iconfont 字体提供，未引入时渲染为空白。
 */
export { default as iconfontClassNames } from './font/iconfont-classnames';
