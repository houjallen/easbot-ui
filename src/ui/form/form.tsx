/**
 * Form 组件
 *
 * @description
 * Form组件是一个基于react-hook-form的表单组件，提供了以下功能：
 * - 表单验证
 * - 错误提示
 * - 表单布局
 * - 表单控件组合
 * - 无障碍支持
 */

/**
 * EUN Form 组件（直接复用 @repo/design-system）
 * 保持 API、类型、样式与 DS 完全一致，仅做 re-export。
 */

/**
 * EUN Form 组件（直接复用 @repo/design-system）
 * 保持 API、类型、样式与 DS 完全一致，仅做 re-export。
 *
 * 功能简介：
 * - 表单验证
 * - 错误提示
 * - 表单布局
 * - 表单控件组合
 * - 无障碍支持
 *
 * @example
 * <Form {...form}>
 *   <form>...</form>
 * </Form>
 */
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField, useOptionalFormField } from '../../design-system/components/ui/form';

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, useFormField, useOptionalFormField };
