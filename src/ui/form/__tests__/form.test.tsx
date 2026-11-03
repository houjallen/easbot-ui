/**
 * Form 组件测试
 *
 * @description
 * 按照EASAI组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证组件的基本渲染功能
 * 2. 表单验证 - 验证表单的验证功能
 * 3. 提交处理 - 验证表单的提交功能
 * 4. 字段交互 - 验证表单字段的交互
 * 5. 无障碍测试 - 验证组件的可访问性
 *
 * 表单统一声明 `noValidate` —— 校验完全交给 react-hook-form，
 * 避免浏览器原生约束校验（如 `type="email"` 的格式校验）拦截提交、
 * 导致 RHF 的错误信息无法呈现。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Input } from '../../input/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../form';
import { zodResolver } from '@hookform/resolvers/zod';
import { describe, it, vi } from 'vitest';
import { z } from 'zod';

// 测试表单组件
const formSchema = z.object({
  username: z.string().min(1, '用户名是必填的'),
  email: z.string().min(1, '邮箱是必填的').email('请输入有效的邮箱地址'),
});

const TestForm = ({ onSubmit = vi.fn() }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder="请输入用户名" {...field} />
              </FormControl>
              <FormDescription>请输入您的用户名</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" placeholder="请输入邮箱" {...field} />
              </FormControl>
              <FormDescription>请输入您的邮箱地址</FormDescription>
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
  // 渲染测试
  describe('渲染测试', () => {
    it('应该正确渲染表单字段', () => {
      render(<TestForm />);
      expect(screen.getByLabelText('用户名')).toBeInTheDocument();
      expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
      expect(screen.getByText('请输入您的用户名')).toBeInTheDocument();
      expect(screen.getByText('请输入您的邮箱地址')).toBeInTheDocument();
    });

    it('应该正确渲染提交按钮', () => {
      render(<TestForm />);
      expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument();
    });
  });

  // 表单验证测试
  describe('表单验证测试', () => {
    it('应该显示必填字段错误', async () => {
      render(<TestForm />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(screen.getByText('用户名是必填的')).toBeInTheDocument();
        expect(screen.getByText('邮箱是必填的')).toBeInTheDocument();
      });
    });

    it('应该验证邮箱格式', async () => {
      render(<TestForm />);

      const emailInput = screen.getByLabelText('邮箱');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
      });
    });
  });

  // 提交处理测试
  describe('提交处理测试', () => {
    it('应该在表单有效时调用onSubmit', async () => {
      const handleSubmit = vi.fn();
      render(<TestForm onSubmit={handleSubmit} />);

      fireEvent.change(screen.getByLabelText('用户名'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByLabelText('邮箱'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          {
            username: 'testuser',
            email: 'test@example.com',
          },
          expect.anything(),
        );
      });
    });
  });

  // 字段交互测试
  describe('字段交互测试', () => {
    it('应该正确更新字段值', () => {
      render(<TestForm />);

      const usernameInput = screen.getByLabelText('用户名');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      expect(usernameInput).toHaveValue('testuser');

      const emailInput = screen.getByLabelText('邮箱');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  // 无障碍测试
  describe('无障碍测试', () => {
    it('应该有正确的ARIA属性', () => {
      render(<TestForm />);

      const usernameInput = screen.getByLabelText('用户名');
      expect(usernameInput).toHaveAttribute('aria-describedby');

      const emailInput = screen.getByLabelText('邮箱');
      expect(emailInput).toHaveAttribute('aria-describedby');
    });

    it('错误状态应该正确设置aria-invalid', async () => {
      render(<TestForm />);

      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(screen.getByLabelText('用户名')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText('邮箱')).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('复杂验证场景', () => {
    it('应处理跨字段验证', async () => {
      const TestComplexForm = () => {
        const form = useForm({
          defaultValues: {
            password: '',
            confirmPassword: '',
          },
          resolver: zodResolver(
            z
              .object({
                password: z.string().min(6),
                confirmPassword: z.string(),
              })
              .refine((data) => data.password === data.confirmPassword, {
                message: '密码不一致',
                path: ['confirmPassword'],
              }),
          ),
        });

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})} noValidate>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button type="submit">提交</button>
            </form>
          </Form>
        );
      };

      render(<TestComplexForm />);

      // 输入不一致的密码
      fireEvent.change(screen.getByLabelText('密码'), {
        target: { value: '123456' },
      });
      fireEvent.change(screen.getByLabelText('确认密码'), {
        target: { value: '654321' },
      });
      fireEvent.click(screen.getByRole('button', { name: '提交' }));

      await waitFor(() => {
        expect(screen.getByText('密码不一致')).toBeInTheDocument();
      });
    });
  });
});
