// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { XCircle } from 'lucide-react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Icon, getGlobalIconRegistry, registerIcon } from '../';

// 示例注册自定义 SVG Icon
registerIcon('custom-check', CheckCircle);
registerIcon('custom-alert', AlertTriangle);

const meta: Meta<typeof Icon> = {
  title: 'EASAI/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Icon 组件支持三种模式：name（全局注册）、url（图片/SVG）、class（iconfont），支持 5 种变体颜色，支持全局注册方法 registerIcon，支持事件交互。',
      },
    },
  },
  argTypes: {
    type: { control: 'select', options: ['name', 'url', 'class'] },
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning', 'info'],
    },
  },
};
export default meta;

// 展示所有已注册的 name 模式图标
export const AllRegisteredIcons: StoryObj<typeof Icon> = {
  /**
   * 展示所有已全局注册的 name 模式图标，便于开发和查阅。
   */
  render: () => {
    // 获取全局注册的图标对象
    const easIcons = getGlobalIconRegistry();
    // 将所有图标条目转换为数组，便于遍历渲染
    const iconEntries = Array.from(easIcons.entries());
    if (iconEntries.length === 0) {
      return <div style={{ padding: 32, color: '#aaa' }}>暂无已注册图标</div>;
    }
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          alignItems: 'center',
          marginBottom: 16,
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {/* 遍历所有已注册图标并渲染 */}
        {iconEntries.map(([name]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 72,
            }}
          >
            {/* 图标本身 */}
            <Icon type="name" name={name} size={24} />
            {/* 图标名称 */}
            <span
              style={{
                fontSize: 12,
                marginTop: 8,
                wordBreak: 'break-all',
                textAlign: 'center',
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    );
  },
  name: '全部已注册 name 图标',
  parameters: {
    docs: {
      description: {
        story: '展示所有已全局注册的 name 图标，直接通过 <Icon name="xxx" /> 使用。',
      },
    },
  },
};

// 所有已全局注册的 lucide 图标 name 列表
const lucideNames = [
  'info',
  'check-circle',
  'alert-triangle',
  'x-circle',
  'alert-circle',
  'terminal',
  'edit',
  'plus',
  'minus',
  'search',
  'user',
  'settings',
  'eye',
  'eye-off',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'chevron-right',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'trash',
  'copy',
  'file',
  'folder',
  'lock',
  'unlock',
  'home',
  'bell',
  'calendar',
  'star',
  'heart',
  'filter',
  'upload',
  'download',
  'link',
  'globe',
  'help-circle',
];

// 展示所有 name 模式注册图标
export const LucideRegisteredIcons: StoryObj<typeof Icon> = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        alignItems: 'center',
      }}
    >
      {lucideNames.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 64,
          }}
        >
          <Icon name={name} size={24} />
          <span style={{ fontSize: 12, marginTop: 4 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
  name: '全部已注册 lucide name 图标',
  parameters: {
    docs: {
      description: {
        story: '展示所有已全局注册的 lucide-react 图标，直接通过 <Icon name="xxx" /> 使用。',
      },
    },
  },
};

/**
 * IconButton 组件演示
 * 展示圆形、方形、变体色、禁用、事件等典型用法
 */
import { IconButton } from '../icon-button';

export const IconButtonDemo: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {/* 圆形按钮，默认变体 */}
      <IconButton icon="edit" variant="default" onClick={() => alert('编辑')} size={36} />
      {/* 成功变体 */}
      <IconButton icon="check-circle" variant="success" size={36} />
      {/* 警告变体 */}
      <IconButton icon="alert-triangle" variant="warning" size={36} />
      {/* 错误变体 */}
      <IconButton icon="x-circle" variant="destructive" size={36} />
      {/* info 变体，禁用 */}
      <IconButton icon="info" variant="info" size={36} disabled />
      {/* 方形按钮 */}
      <IconButton icon="settings" shape="square" variant="default" size={36} />
      {/* 自定义内容（带角标） */}
      <IconButton icon="bell" variant="info" size={36}>
        <span
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            background: 'red',
            borderRadius: 4,
          }}
        />
      </IconButton>
    </div>
  ),
  name: 'IconButton 图标按钮演示',
  parameters: {
    docs: {
      description: {
        story: '演示 IconButton 组件的各种典型用法，包括圆形、方形、变体色、禁用、事件和角标等场景。',
      },
    },
  },
};

type Story = StoryObj<typeof Icon>;

/**
 * name 模式图标演示（lucide + 变体色 + 事件 + 尺寸）
 */
export const NameIcon: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32 }}>
      {/* 默认变体 */}
      <Icon name="info" variant="default" size={32} onClick={() => alert('info icon clicked!')} />
      {/* 成功变体 */}
      <Icon name="check-circle" variant="success" size={32} onClick={() => alert('success icon!')} />
      {/* 警告变体 */}
      <Icon name="alert-triangle" variant="warning" size={32} />
      {/* 错误变体 */}
      <Icon name="x-circle" variant="destructive" size={32} />
      {/* info 变体 */}
      <Icon name="help-circle" variant="info" size={32} />
      {/* 自定义 name（已注册） */}
      <Icon name="custom-check" variant="success" size={32} />
    </div>
  ),
  name: 'name 模式（全局注册）图标演示',
  parameters: {
    docs: {
      description: {
        story: '演示 name 模式下各变体颜色、事件与尺寸效果，全部通过 <Icon name="xxx" variant="..." /> 实现。',
      },
    },
  },
};

/**
 * Url 模式图标演示（带旋转动画，warning 变体）
 * 该图标为刷新(refresh)图标，通过 style 添加 CSS 动画实现无限旋转。
 */
export const UrlIcon: Story = {
  render: (args) => (
    <Icon
      {...args}
      variant="warning"
      style={{
        animation: 'icon-spin 1s linear infinite',
        ...args.style,
      }}
    />
  ),
  args: {
    type: 'url',
    url: '/images/svg/refresh.svg',
    size: 32,
    onClick: () => alert('点击了 url 图标'),
  },
};

/**
 * 全局注入旋转动画 keyframes
 * 由于 Storybook 环境下可直接插入 style 标签实现
 */
if (typeof window !== 'undefined' && !document.getElementById('icon-spin-style')) {
  const style = document.createElement('style');
  style.id = 'icon-spin-style';
  style.innerHTML = `
    @keyframes icon-spin {
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Class 模式（iconfont/officefont/fontawesome等）图标演示
 *
 * ⚠️ iconfont.css / officefont.css 由 `.storybook/preview.tsx` **全局引入**
 * （源文件路径），字形由 Vite 的字体管线处理 —— 消费方则需自行
 * `import '@easbot/ui/iconfont.css'`（opt-in 产物，不在 `styles.css` 内）。
 */
/**
 * Class 模式字体图标分类演示
 * 上方为图标预览，下方为可直接拷贝的完整类名，便于开发者直接使用
 */
/**
 * iconfont 字体图标示例
 * 上方为图标，下方为可直接拷贝的类名
 */
// 图标类名清单（796 个）+ officefont 演示类
import iconfontClassNames from '../font/iconfont-classnames';
import '../font/officefont-demo.css';

export const IconfontClassIcon: Story = {
  render: () => (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          alignItems: 'center',
          marginBottom: 16,
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {iconfontClassNames.map((clazz: string) => (
          <div
            key={clazz}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 64,
              marginBottom: 8,
            }}
          >
            <Icon type="class" clazzName={`iconfont ${clazz}`} size={32} />
            <span style={{ fontSize: 12, marginTop: 4 }}>{clazz}</span>
          </div>
        ))}
      </div>
      <pre
        style={{
          background: '#f6f8fa',
          padding: 8,
          borderRadius: 4,
          fontSize: 13,
          margin: 0,
          maxHeight: 200,
          overflow: 'auto',
        }}
      >
        {iconfontClassNames.map((clazz: string) => `iconfont ${clazz}`).join('\n')}
      </pre>
    </div>
  ),
  name: 'iconfont 字体图标示例',
  parameters: {
    docs: {
      description: {
        story: '演示 iconfont 字体图标常见用法。下方提供可直接拷贝的完整类名，方便开发者直接使用。',
      },
    },
  },
};

/**
 * officefont 字体图标示例
 * 上方为图标，下方为可直接拷贝的类名
 */
export const OfficefontClassIcon: Story = {
  render: () => (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Icon type="class" clazzName="officefont icon-excel" size={32} variant="success" />
        <Icon type="class" clazzName="officefont icon-word" size={32} variant="info" />
        <Icon type="class" clazzName="officefont icon-ppt" size={32} variant="warning" />
        <Icon type="class" clazzName="officefont icon-pdf" size={32} variant="destructive" />
      </div>
      <pre
        style={{
          background: '#f6f8fa',
          padding: 8,
          borderRadius: 4,
          fontSize: 14,
          margin: 0,
        }}
      >
        {'officefont icon-excel\nofficefont icon-word\nofficefont icon-ppt\nofficefont icon-pdf'}
      </pre>
      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
        如需更多 officefont 图标，请在 <code>icon/font/officefont-demo.css</code> 中补充定义。
      </div>
    </div>
  ),
  name: 'officefont 字体图标示例',
  parameters: {
    docs: {
      description: {
        story: '演示 officefont 字体图标常见用法。下方提供可直接拷贝的完整类名，方便开发者直接使用。',
      },
    },
  },
};

/**
 * Font Awesome 字体图标示例
 * 上方为图标，下方为可直接拷贝的类名
 */
export const FontawesomeClassIcon: Story = {
  render: () => (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Icon type="class" clazzName="fa fa-user" size={32} variant="info" />
        <Icon type="class" clazzName="fa fa-cog" size={32} variant="default" />
      </div>
      <pre
        style={{
          background: '#f6f8fa',
          padding: 8,
          borderRadius: 4,
          fontSize: 14,
          margin: 0,
        }}
      >
        {`fa fa-user
fa fa-cog`}
      </pre>
    </div>
  ),
  name: 'Font Awesome 字体图标示例',
  parameters: {
    docs: {
      description: {
        story: '演示 Font Awesome 字体图标常见用法。下方提供可直接拷贝的完整类名，方便开发者直接使用。',
      },
    },
  },
};

const radixNames = [
  'radix-accessibility',
  'radix-activity-log',
  'radix-arrow-down',
  'radix-arrow-left',
  'radix-arrow-right',
  'radix-arrow-up',
  'radix-backpack',
  'radix-bell',
  'radix-calendar',
  'radix-check-circled',
  'radix-chevron-down',
  'radix-chevron-left',
  'radix-chevron-right',
  'radix-chevron-up',
  'radix-clipboard',
  'radix-cross-circled',
  'radix-dots-horizontal',
  'radix-dots-vertical',
  'radix-download',
  'radix-exclamation-triangle',
  'radix-eye-closed',
  'radix-eye-open',
  'radix-file',
  'radix-gear',
  'radix-heart-filled',
  'radix-info-circled',
  'radix-lock-closed',
  'radix-lock-open',
  'radix-person',
  'radix-plus-circled',
  'radix-reload',
  'radix-star-filled',
  'radix-trash',
  'radix-upload',
  'radix-sun',
  'radix-moon',
];

export const AllRadixIcons: Story = {
  name: '全部 Radix 图标批量展示',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {radixNames.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 72,
          }}
        >
          <Icon name={name} size={32} />
          <span style={{ fontSize: 12, marginTop: 4 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '展示所有已全局注册的 Radix Icons，便于开发/查阅/设计。',
      },
    },
  },
};

export const CustomNodeIcon: Story = {
  render: () => (
    <IconButton variant="destructive" size="icon">
      <XCircle />
    </IconButton>
  ),
  name: '自定义 SVG 节点（IconButton）',
};

// 所有已全局注册的 eas 自定义图标 name 列表
const easNames = ['eas-language', 'eas-refresh', 'eas-moon', 'eas-sun', 'eas-system'];

export const AllEasIcons: Story = {
  name: '全部 EAS 自定义图标批量展示',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {easNames.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 72,
          }}
        >
          <Icon name={name} size={16} />
          <span style={{ fontSize: 12, marginTop: 4 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '展示所有已全局注册的 EAS 自定义图标，便于开发/查阅/设计。',
      },
    },
  },
};

/**
 * 排序状态图标演示
 */
export const SortIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Icon name="sort-asc" size={24} />
      <Icon name="sort-desc" size={24} />
      <Icon name="sort" size={24} />
    </div>
  ),
  name: '排序状态图标',
  parameters: {
    docs: {
      description: {
        story: '演示升序、降序、默认三种排序状态的图标。',
      },
    },
  },
};
