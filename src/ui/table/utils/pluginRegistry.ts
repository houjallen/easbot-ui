/**
 * 表格插件注册表
 * 管理所有表格插件的注册、卸载和获取
 */

import type { TablePlugin } from '../types';

/**
 * 插件注册表实现
 */
class TablePluginRegistry {
  private plugins = new Map<string, TablePlugin>();

  // 实现索引签名
  [name: string]: TablePlugin | any;

  /**
   * 注册插件
   */
  register(plugin: TablePlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered. Overwriting...`);
    }

    this.plugins.set(plugin.name, plugin);

    if (process.env.NODE_ENV === 'development') {
      console.debug(`Plugin "${plugin.name}" (v${plugin.version}) registered successfully.`);
    }
  }

  /**
   * 卸载插件
   */
  unregister(name: string): void {
    if (!this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is not registered.`);
      return;
    }

    this.plugins.delete(name);

    if (process.env.NODE_ENV === 'development') {
      console.debug(`Plugin "${name}" unregistered successfully.`);
    }
  }

  /**
   * 获取插件
   */
  get(name: string): TablePlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取所有插件
   */
  getAll(): TablePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 检查插件是否已注册
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * 获取已注册插件列表
   */
  getRegisteredNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear();
  }

  /**
   * 批量注册插件
   */
  registerMultiple(plugins: TablePlugin[]): void {
    // 注意：回调用块体 —— 箭头函数简写会返回 register 的返回值，违反 `lint/suspicious/useIterableCallbackReturn`
    plugins.forEach((plugin) => {
      this.register(plugin);
    });
  }

  /**
   * 批量卸载插件
   */
  unregisterMultiple(names: string[]): void {
    names.forEach((name) => {
      this.unregister(name);
    });
  }
}

/**
 * 全局插件注册表实例
 */
export const pluginRegistry = new TablePluginRegistry();

/**
 * 注册插件的便捷函数
 */
export const registerPlugin = (plugin: TablePlugin): void => {
  pluginRegistry.register(plugin);
};

/**
 * 卸载插件的便捷函数
 */
export const unregisterPlugin = (name: string): void => {
  pluginRegistry.unregister(name);
};

/**
 * 获取插件的便捷函数
 */
export const getPlugin = (name: string): TablePlugin | undefined => {
  return pluginRegistry.get(name);
};

/**
 * 检查插件是否存在的便捷函数
 */
export const hasPlugin = (name: string): boolean => {
  return pluginRegistry.has(name);
};

/**
 * 获取所有已注册插件的便捷函数
 */
export const getAllPlugins = (): TablePlugin[] => {
  return pluginRegistry.getAll();
};

/**
 * 获取已注册插件名称列表的便捷函数
 */
export const getRegisteredPluginNames = (): string[] => {
  return pluginRegistry.getRegisteredNames();
};
