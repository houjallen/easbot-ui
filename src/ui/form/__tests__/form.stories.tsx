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

import { zodResolver } from '@hookform/resolvers/zod';
// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../button/button';
import { Checkbox } from '../../checkbox/checkbox';
import { Combobox } from '../../combobox/combobox';
import { Input } from '../../input/input';
import { RadioGroup, RadioGroupItem } from '../../radio-group/radio-group';
import { Select } from '../../select/select';
import { Slider } from '../../slider/slider';
import { Switch } from '../../switch/switch';
import { Textarea } from '../../textarea/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../form';

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
                  <Input type="email" placeholder="请输入邮箱" {...field} />
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
                  <Input type="password" placeholder="请再次输入密码" {...field} />
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
        <form className="w-[400px] space-y-6">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>年龄</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="请输入年龄" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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

// 综合所有常用表单控件类型示例
const allFieldsSchema = z.object({
  text: z.string().min(1, '请输入文本'),
  textarea: z.string().min(1, '请输入内容'),
  select: z.string().min(1, '请选择一个选项'),
  combobox: z.string().min(1, '请选择一个选项'),
  comboboxMulti: z.array(z.string()).min(1, '请至少选择一项'),
  radio: z.string().min(1, '请选择一个选项'),
  checkbox: z.boolean().refine((v) => v, { message: '请勾选同意' }),
  switch: z.boolean(),
  slider: z.number().min(1, '请拖动滑块'),
});

export const AllFieldsForm: Story = {
  render: () => {
    const form = useForm<z.infer<typeof allFieldsSchema>>({
      resolver: zodResolver(allFieldsSchema),
      defaultValues: {
        text: '',
        textarea: '',
        select: '',
        combobox: '',
        comboboxMulti: [],
        radio: '',
        checkbox: false,
        switch: false,
        slider: 1,
      },
    });

    const onSubmit = (values: z.infer<typeof allFieldsSchema>) => {
      alert(JSON.stringify(values, null, 2));
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[480px] space-y-6">
          {/* 文本输入 */}
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>文本输入</FormLabel>
                <FormControl>
                  <Input placeholder="请输入文本" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 多行文本 */}
          <FormField
            control={form.control}
            name="textarea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>多行文本</FormLabel>
                <FormControl>
                  <Textarea placeholder="请输入内容" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 下拉选择 */}
          <FormField
            control={form.control}
            name="select"
            render={({ field }) => (
              <FormItem>
                <FormLabel>下拉选择</FormLabel>
                <FormControl>
                  <Select
                    options={[
                      { label: '选项A', value: 'A' },
                      { label: '选项B', value: 'B' },
                    ]}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="请选择"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 组合选择（单选） */}
          <FormField
            control={form.control}
            name="combobox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>组合选择（单选）</FormLabel>
                <FormControl>
                  <Combobox
                    options={[
                      { label: '苹果', value: 'apple' },
                      { label: '香蕉', value: 'banana' },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="请选择"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 组合选择（多选） */}
          <FormField
            control={form.control}
            name="comboboxMulti"
            render={({ field }) => (
              <FormItem>
                <FormLabel>组合选择（多选）</FormLabel>
                <FormControl>
                  <Combobox
                    options={[
                      { label: '苹果', value: 'apple' },
                      { label: '香蕉', value: 'banana' },
                      { label: '橙子', value: 'orange' },
                    ]}
                    multiple
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="请选择"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 单选框组 */}
          <FormField
            control={form.control}
            name="radio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>单选框组</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                    {[
                      { label: '男', value: 'male' },
                      { label: '女', value: 'female' },
                    ].map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} />
                        <label htmlFor={`radio-${opt.value}`}>{opt.label}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 复选框 */}
          <FormField
            control={form.control}
            name="checkbox"
            render={({ field }) => (
              <FormItem>
                <FormLabel>同意协议</FormLabel>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 开关 */}
          <FormField
            control={form.control}
            name="switch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>开关</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 滑块 */}
          <FormField
            control={form.control}
            name="slider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>滑块</FormLabel>
                <FormControl>
                  <Slider value={[field.value]} onValueChange={(val) => field.onChange(val[0])} min={1} max={100} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            提交
          </Button>
        </form>
      </Form>
    );
  },
};
