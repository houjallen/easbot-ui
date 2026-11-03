// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '../chart';

const meta: Meta<typeof ChartContainer> = {
  title: 'EASAI/Chart',
  component: ChartContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ChartContainer>;

const data = [
  { name: '一月', uv: 4000, pv: 2400, amt: 2400 },
  { name: '二月', uv: 3000, pv: 1398, amt: 2210 },
  { name: '三月', uv: 2000, pv: 9800, amt: 2290 },
  { name: '四月', uv: 2780, pv: 3908, amt: 2000 },
  { name: '五月', uv: 1890, pv: 4800, amt: 2181 },
  { name: '六月', uv: 2390, pv: 3800, amt: 2500 },
  { name: '七月', uv: 3490, pv: 4300, amt: 2100 },
];

export const Basic: Story = {
  args: {
    id: 'line-chart',
    // ChartContainer 的 children 由下方 render 显式传入，此处占位以满足必填 props 约束
    children: null,
    config: {
      uv: { label: '访问量', color: '#8884d8' },
      pv: { label: '页面浏览量', color: '#82ca9d' },
    },
  },
  render: ({ children: _children, ...args }) => (
    <ChartContainer {...args} className="h-[400px] w-[700px]">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="uv" name="uv" stroke="#8884d8" />
          <Line type="monotone" dataKey="pv" name="pv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  ),
};

export const WithLegend: Story = {
  args: {
    id: 'line-chart',
    // ChartContainer 的 children 由下方 render 显式传入，此处占位以满足必填 props 约束
    children: null,
    config: {
      uv: { label: '访问量', color: '#8884d8' },
      pv: { label: '页面浏览量', color: '#82ca9d' },
    },
  },
  render: ({ children: _children, ...args }) => (
    <ChartContainer {...args} className="h-[400px] w-[700px]">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="uv" name="uv" stroke="#8884d8" />
          <Line type="monotone" dataKey="pv" name="pv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  ),
};
