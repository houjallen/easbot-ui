/**
 * Form 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证表单项、标签、控件、描述与错误信息的基本渲染与类名
 * 2. 状态测试 - 验证校验错误态、data-error 与 aria-invalid
 * 3. 交互测试 - 验证输入提交、校验触发与错误提示渲染
 * 4. 无障碍测试 - 验证 label 关联、aria-describedby 与 aria-invalid
 * 5. 边界测试 - 验证无错误时不渲染错误信息、多个字段与属性透传
 *
 * @remarks
 * 基于 `react-hook-form` —— `Form` 即 `FormProvider`，`FormField` 基于 `Controller`。
 * 校验规则使用 `register` 的内建 `required` 校验，避免引入额外的 resolver 依赖。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { vi } from 'vitest';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../form';

/** 表单字段类型 */
type FormValues = {
  name: string;
};

/**
 * 表单测试壳组件
 *
 * @description
 * 封装 `useForm` + `Form` + `FormField` 的标准组合，供各用例复用。
 *
 * @param props 组件属性
 * @returns 表单组件
 */
const FormHarness = ({ defaultValues = { name: '' }, onSubmit = () => undefined }: { defaultValues?: FormValues; onSubmit?: (values: FormValues) => void }) => {
  const form = useForm<FormValues>({ defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: '名称不能为空' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <input {...field} />
              </FormControl>
              <FormDescription>请输入名称</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">提交</button>
      </form>
    </Form>
  );
};

describe('Form 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染表单项容器', () => {
      render(<FormHarness />);

      const item = document.querySelector('[data-slot="form-item"]');
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('grid');
      expect(item).toHaveClass('gap-2');
    });

    it('应该正确渲染表单标签', () => {
      render(<FormHarness />);

      const label = screen.getByText('名称');
      expect(label).toHaveAttribute('data-slot', 'form-label');
      expect(label).toHaveClass('data-[error=true]:text-destructive');
    });

    it('应该正确渲染表单控件', () => {
      render(<FormHarness />);

      const control = document.querySelector('[data-slot="form-control"]');
      expect(control).toBeInTheDocument();
      expect(control?.tagName).toBe('INPUT');
    });

    it('应该正确渲染表单描述', () => {
      render(<FormHarness />);

      const description = screen.getByText('请输入名称');
      expect(description).toHaveAttribute('data-slot', 'form-description');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveClass('text-sm');
    });

    it('应该在没有错误时不渲染错误信息', () => {
      render(<FormHarness />);

      expect(document.querySelector('[data-slot="form-message"]')).not.toBeInTheDocument();
    });

    it('应该正确合并自定义类名', () => {
      render(
        <FormItem className="custom-item">
          <span>内容</span>
        </FormItem>,
      );

      expect(document.querySelector('[data-slot="form-item"]')).toHaveClass('custom-item');
    });
  });

  describe('状态测试', () => {
    it('应该在没有错误时渲染 data-error 为 false', () => {
      render(<FormHarness />);

      expect(screen.getByText('名称')).toHaveAttribute('data-error', 'false');
    });

    it('应该在校验失败时渲染 data-error 为 true', async () => {
      render(<FormHarness />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(screen.getByText('名称')).toHaveAttribute('data-error', 'true');
      });
    });

    it('应该在校验失败时渲染错误信息', async () => {
      render(<FormHarness />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        const message = document.querySelector('[data-slot="form-message"]');
        expect(message).toBeInTheDocument();
        expect(message).toHaveTextContent('名称不能为空');
        expect(message).toHaveClass('text-destructive');
      });
    });

    it('应该在校验失败时渲染 aria-invalid 为 true', async () => {
      render(<FormHarness />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(document.querySelector('[data-slot="form-control"]')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('应该在没有错误时渲染 aria-invalid 为 false', () => {
      render(<FormHarness />);

      expect(document.querySelector('[data-slot="form-control"]')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('交互测试', () => {
    it('应该在提交时触发 onSubmit 回调并携带表单值', async () => {
      const handleSubmit = vi.fn();
      render(<FormHarness onSubmit={handleSubmit} />);

      fireEvent.change(screen.getByRole('textbox'), { target: { value: '易博' } });
      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
      expect(handleSubmit.mock.calls[0]?.[0]).toEqual({ name: '易博' });
    });

    it('应该在校验失败时不触发 onSubmit 回调', async () => {
      const handleSubmit = vi.fn();
      render(<FormHarness onSubmit={handleSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(screen.getByText('名称不能为空')).toBeInTheDocument();
      });
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('应该在输入后清除错误信息', async () => {
      render(<FormHarness />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));
      await waitFor(() => {
        expect(screen.getByText('名称不能为空')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole('textbox'), { target: { value: '易博' } });

      await waitFor(() => {
        expect(screen.queryByText('名称不能为空')).not.toBeInTheDocument();
      });
    });

    it('应该在输入时同步字段值', () => {
      render(<FormHarness />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '测试值' } });

      expect(input).toHaveValue('测试值');
    });
  });

  describe('无障碍测试', () => {
    it('应该通过 htmlFor 关联标签与控件', () => {
      render(<FormHarness />);

      const label = screen.getByText('名称');
      const control = document.querySelector('[data-slot="form-control"]');
      expect(label).toHaveAttribute('for', control?.id);
    });

    it('应该为控件设置 id', () => {
      render(<FormHarness />);

      const control = document.querySelector('[data-slot="form-control"]');
      expect(control?.id).toBeTruthy();
    });

    it('应该通过 aria-describedby 关联表单描述', () => {
      render(<FormHarness />);

      const control = document.querySelector('[data-slot="form-control"]');
      const describedBy = control?.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent('请输入名称');
    });

    it('应该在校验失败时同时关联描述与错误信息', async () => {
      render(<FormHarness />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        const control = document.querySelector('[data-slot="form-control"]');
        const describedBy = control?.getAttribute('aria-describedby');
        expect(describedBy?.split(' ')).toHaveLength(2);
        expect(document.getElementById(describedBy?.split(' ')[1] as string)).toHaveTextContent('名称不能为空');
      });
    });

    it('应该通过标签为输入框提供可访问名称', () => {
      render(<FormHarness />);

      expect(screen.getByRole('textbox', { name: '名称' })).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染多个表单字段', () => {
      const MultiFieldHarness = () => {
        const form = useForm<{ first: string; second: string }>({
          defaultValues: { first: '', second: '' },
        });

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="first"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>第一项</FormLabel>
                    <FormControl>
                      <input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="second"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>第二项</FormLabel>
                    <FormControl>
                      <input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      };

      render(<MultiFieldHarness />);

      expect(screen.getByRole('textbox', { name: '第一项' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: '第二项' })).toBeInTheDocument();
      expect(document.querySelectorAll('[data-slot="form-item"]')).toHaveLength(2);
    });

    it('应该允许渲染没有描述与错误信息的表单项', () => {
      const MinimalHarness = () => {
        const form = useForm<{ name: string }>({ defaultValues: { name: '' } });

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      };

      render(<MinimalHarness />);

      expect(document.querySelector('[data-slot="form-description"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-slot="form-message"]')).not.toBeInTheDocument();
    });

    it('应该透传额外的 data-* 属性到表单项容器', () => {
      render(
        <FormItem data-custom="value">
          <span>内容</span>
        </FormItem>,
      );

      expect(document.querySelector('[data-slot="form-item"]')).toHaveAttribute('data-custom', 'value');
    });
  });
});
