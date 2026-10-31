import { render, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs 组件', () => {
  test('应正确切换标签内容', () => {
    const { getByText } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">标签1</TabsTrigger>
          <TabsTrigger value="tab2">标签2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">内容1</TabsContent>
        <TabsContent value="tab2">内容2</TabsContent>
      </Tabs>,
    );

    // Radix TabsTrigger 通过 onMouseDown（button === 0）切换选中态，而非 onClick
    fireEvent.mouseDown(getByText('标签2'), { button: 0 });
    expect(getByText('内容2')).toBeInTheDocument();
    expect(getByText('标签2')).toHaveAttribute('aria-selected', 'true');
  });

  test('应禁用交互', () => {
    const { getByText } = render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1" disabled>
            禁用标签
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(getByText('禁用标签')).toHaveAttribute('disabled');
  });

  test('应支持垂直布局', () => {
    const { container } = render(
      <Tabs orientation="vertical">
        <TabsList className="flex-col" />
      </Tabs>,
    );
    expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument();
  });

  test('应包含正确的ARIA属性', () => {
    const { getByRole } = render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="test" />
        </TabsList>
      </Tabs>,
    );
    expect(getByRole('tab')).toHaveAttribute('aria-selected');
  });
});
