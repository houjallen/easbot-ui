import { render } from '@testing-library/react';
import { Badge } from '../badge';

/**
 * Badge 组件基础渲染测试
 */
describe('Badge', () => {
  it('渲染默认 Badge', () => {
    const { getByText } = render(<Badge>测试徽章</Badge>);
    expect(getByText('测试徽章')).toBeInTheDocument();
  });
});
