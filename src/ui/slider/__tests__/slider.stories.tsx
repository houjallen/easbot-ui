import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Slider } from '../slider';

const meta: Meta<typeof Slider> = {
  title: 'EASAI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'The color variant of the slider.',
      table: {
        type: { summary: 'default | destructive' },
        defaultValue: { summary: 'default' },
      },
    },
    value: {
      control: 'object',
      description: 'The controlled value of the slider. Must be an array of numbers.',
    },
    defaultValue: {
      control: 'object',
      description: 'The default value of the slider when uncontrolled. Must be an array of numbers.',
    },
    max: {
      control: 'number',
      description: 'The maximum value of the slider.',
      defaultValue: 100,
    },
    min: {
      control: 'number',
      description: 'The minimum value of the slider.',
      defaultValue: 0,
    },
    step: {
      control: 'number',
      description: 'The step value for the slider.',
      defaultValue: 1,
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the slider.',
      defaultValue: 'horizontal',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled.',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: [50],
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [currentValue, setCurrentValue] = React.useState(args.value ?? [0]);
    React.useEffect(() => {
      if (args.value !== undefined) {
        setCurrentValue(args.value);
      }
    }, [args.value]);

    return (
      <div className="w-[500px] p-6">
        <Slider
          {...args} // Spreads other args like max, step
          value={currentValue}
          onValueChange={(newValue) => {
            setCurrentValue(newValue);
            if (typeof args.onValueChange === 'function') {
              args.onValueChange(newValue);
            }
          }}
        />
      </div>
    );
  },
};

export const WithLabels: Story = {
  args: {
    value: [50],
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [currentValue, setCurrentValue] = React.useState(args.value ?? [50]); // Default to [50] as per args
    React.useEffect(() => {
      if (args.value !== undefined) {
        setCurrentValue(args.value);
      }
    }, [args.value]);

    return (
      <div className="w-[500px] space-y-2 p-6">
        <Slider
          {...args}
          value={currentValue}
          onValueChange={(newValue) => {
            setCurrentValue(newValue);
            if (typeof args.onValueChange === 'function') {
              args.onValueChange(newValue);
            }
          }}
        />
        <div className="flex justify-between text-muted-foreground text-sm">
          <span>0%</span>
          <span>{currentValue[0]}%</span>
          <span>100%</span>
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[500px] p-6">
      <Slider defaultValue={[30]} max={100} step={1} disabled />
    </div>
  ),
};

export const RangeSlider: Story = {
  args: {
    value: [20, 80],
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [currentValue, setCurrentValue] = React.useState(args.value ?? [20, 80]); // Default to [20, 80] as per args
    React.useEffect(() => {
      if (args.value !== undefined) {
        setCurrentValue(args.value);
      }
    }, [args.value]);

    return (
      <div className="w-[500px] space-y-2 p-6">
        <Slider
          {...args}
          value={currentValue}
          onValueChange={(newValue) => {
            setCurrentValue(newValue);
            if (typeof args.onValueChange === 'function') {
              args.onValueChange(newValue);
            }
          }}
        />
        <div className="flex justify-between text-muted-foreground text-sm">
          <span>0%</span>
          <span>
            {currentValue[0]}% - {currentValue[1]}%
          </span>
          <span>100%</span>
        </div>
      </div>
    );
  },
};

export const Vertical: Story = {
  args: {
    value: [50],
    orientation: 'vertical',
    className: 'h-full',
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [currentValue, setCurrentValue] = React.useState(args.value ?? [50]); // Default to [50] as per args
    React.useEffect(() => {
      if (args.value !== undefined) {
        setCurrentValue(args.value);
      }
    }, [args.value]);

    return (
      <div className="flex h-64 w-[500px] items-center justify-center p-6">
        <div className="flex h-full w-24 items-center justify-center rounded-md bg-muted/10">
          <Slider
            {...args}
            value={currentValue}
            onValueChange={(newValue) => {
              setCurrentValue(newValue);
              if (typeof args.onValueChange === 'function') {
                args.onValueChange(newValue);
              }
            }}
          />
        </div>
      </div>
    );
  },
};

export const WithInput: Story = {
  render: () => {
    const [value, setValue] = React.useState([50]);
    return (
      <div className="w-[500px] space-y-4 p-6">
        <Slider value={value} onValueChange={setValue} max={100} />
        <input type="number" value={value[0]} onChange={(e) => setValue([Number(e.target.value)])} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
    );
  },
};

// Added ColorVariants Story
export const ColorVariants: Story = {
  args: {
    // Common args for both sliders in this story
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [defaultValue, setDefaultValue] = React.useState([30]);
    const [destructiveValue, setDestructiveValue] = React.useState([60]);

    return (
      <div className="w-[500px] space-y-8 p-6">
        <div>
          <p className="mb-2 font-medium text-sm">Default Variant</p>
          <Slider
            {...args} // Spreads common args like max, step
            variant="default"
            value={defaultValue}
            onValueChange={setDefaultValue}
          />
          <span className="text-muted-foreground text-xs">Value: {defaultValue[0]}</span>
        </div>
        <div>
          <p className="mb-2 font-medium text-sm">Destructive Variant</p>
          <Slider
            {...args} // Spreads common args like max, step
            variant="destructive"
            value={destructiveValue}
            onValueChange={setDestructiveValue}
          />
          <span className="text-muted-foreground text-xs">Value: {destructiveValue[0]}</span>
        </div>
      </div>
    );
  },
};
