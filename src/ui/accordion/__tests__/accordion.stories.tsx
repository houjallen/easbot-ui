// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../accordion';

const meta: Meta<typeof Accordion> = {
  title: 'EASAI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Basic: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>问题1</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案1</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>问题2</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案2</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>问题3</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案3</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger>问题1</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案1</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>问题2</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案2</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>问题3</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案3</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * 多层嵌套 Accordion 示例
 * 用于测试 AccordionItem 内部嵌套 Accordion 的表现
 */
export const Nested: Story = {
  render: () => (
    <Accordion type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger>一级问题</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>一级答案</p>
          {/* 嵌套二级 Accordion */}
          <Accordion type="multiple">
            <AccordionItem value="item-1-1">
              <AccordionTrigger>二级问题A</AccordionTrigger>
              <AccordionContent className="pl-4">
                <p>二级答案A</p>
                {/* 三级嵌套 */}
                <Accordion type="multiple">
                  <AccordionItem value="item-1-1-1">
                    <AccordionTrigger>三级问题A-1</AccordionTrigger>
                    <AccordionContent className="pl-4">
                      <p>三级答案A-1</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-1-2">
              <AccordionTrigger>二级问题B</AccordionTrigger>
              <AccordionContent className="pl-4">
                <p>二级答案B</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>一级问题2</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>一级答案2</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>问题1</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案1</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>禁用的项目</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>这个项目被禁用了</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>问题3</AccordionTrigger>
        <AccordionContent className="pl-4">
          <p>答案3</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
