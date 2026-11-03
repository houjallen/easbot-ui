/**
 * 剪贴板工具
 *
 * @description
 * 由 `hxsoft-js-framework/repository/util/utils/clipboard` 移植而来。
 *
 * 优先使用现代 Clipboard API；不可用时降级到 `document.execCommand('copy')`。
 */

/**
 * 将任意值转换为 Error 实例
 *
 * @param err 原始错误值
 * @returns Error 实例
 */
function convertAnyToError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(`Caught: ${String(err)}`);
}

/**
 * 降级方案：借助隐藏 textarea 执行复制
 *
 * @param text 待复制文本
 * @returns 复制完成后 resolve
 */
async function fallbackCopyTextToClipboard(text: string): Promise<void> {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  // 固定定位，避免页面滚动到底部
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) return;
    throw new Error('document.execCommand failed');
  } catch (err) {
    throw convertAnyToError(err);
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * 写入文本到剪贴板
 *
 * @param text 待复制文本
 * @returns 复制完成后 resolve；失败时 reject
 *
 * @example
 * ```ts
 * await writeTextToClipboard('Hello');
 * ```
 */
export async function writeTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  return fallbackCopyTextToClipboard(text);
}

/**
 * 从剪贴板读取文本
 *
 * @returns 读取到的文本；不可用时返回空字符串
 */
export async function readTextFromClipboard(): Promise<string> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
    return '';
  }
  try {
    return await navigator.clipboard.readText();
  } catch {
    return '';
  }
}
