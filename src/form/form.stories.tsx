/**
 * Form 组件 Stories
 *
 * @description
 * Form组件是一个用于构建表单的复合组件，提供了以下功能：
 * - 表单验证
 * - 错误提示
 * - 表单布局
 * - 表单控件组合
 * - 无障碍支持
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from './form';
import { Input } from '../input/input';
import { Button } from '../button/button';

const meta: Meta<typeof Form> = {
  title: 'EASAI/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Form>;

// 基础登录表单示例
const formSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(50),
  password: z.string().min(6, '密码至少6个字符'),
});

export const LoginForm: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        password: '',
      },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
      console.log(values);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[350px] space-y-6">
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="请输入密码" {...field} />
                </FormControl>
                <FormDescription>请输入您的密码</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">登录</Button>
        </form>
      </Form>
    );
  },
};

// 注册表单示例
const registerSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址'),
    username: z.string().min(2, '用户名至少2个字符').max(50),
    password: z.string().min(6, '密码至少6个字符'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export const RegisterForm: Story = {
  render: () => {
    const form = useForm<z.infer<typeof registerSchema>>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      },
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
      console.log(values);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="请输入邮箱"
                    className="bg-[var(--form-input-bg)] border-[var(--form-input-border)] text-[var(--form-input-text)] rounded-[var(--form-input-radius)] focus:border-[var(--form-input-focus-border)] focus:bg-[var(--form-input-focus-bg)] focus:text-[var(--form-input-focus-text)]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>请输入您的邮箱地址</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="请输入密码" {...field} />
                </FormControl>
                <FormDescription>密码长度至少6个字符</FormDescription>
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
                  <Input
                    type="password"
                    placeholder="请再次输入密码"
                    className="bg-[var(--form-input-bg)] border-[var(--form-input-border)] text-[var(--form-input-text)] rounded-[var(--form-input-radius)] focus:border-[var(--form-input-focus-border)] focus:bg-[var(--form-input-focus-bg)] focus:text-[var(--form-input-focus-text)]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>请再次输入密码以确认</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">注册</Button>
        </form>
      </Form>
    );
  },
};

// 表单验证状态示例
export const ValidationStates: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        validField: 'This is valid',
        errorField: '',
      },
    });

    return (
      <Form {...form}>
        <form className="w-[350px] space-y-6">
          <FormField
            control={form.control}
            name="validField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>有效字段</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription className="text-green-600">此字段输入有效</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="errorField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>错误字段</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage>此字段不能为空</FormMessage>
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};

export const ValidationExample: Story = {
  render: () => {
    const formSchema = z.object({
      age: z.number().min(18, '必须年满18岁'),
    });

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: { age: 0 },
    });

    return (
      <Form {...form}>
        <form className="space-y-6 w-[400px]">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>年龄</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="请输入年龄"
                    className="bg-[var(--form-input-bg)] border-[var(--form-input-border)] text-[var(--form-input-text)] rounded-[var(--form-input-radius)] focus:border-[var(--form-input-focus-border)] focus:bg-[var(--form-input-focus-bg)] focus:text-[var(--form-input-focus-text)]"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">提交</Button>
        </form>
      </Form>
    );
  },
};
