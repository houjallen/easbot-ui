/**
 * Avatar 组件单元测试
 *
 * @description
 * 按照 EASAI 组件规范进行测试，包含以下测试类别：
 * 1. 渲染测试 - 验证头像容器、图片与兜底文本的渲染
 * 2. 状态测试 - 验证图片加载状态与延迟加载
 * 3. 交互测试 - 验证属性透传与事件回调
 * 4. 无障碍测试 - 验证可访问名称与 aria 属性
 * 5. 边界测试 - 验证图片加载失败回退、空 children 等场景
 *
 * @remarks
 * Radix 的 `AvatarImage` 通过 `new Image()` 探测加载状态，
 * **只有状态为 `Loaded` 时才渲染 `<img>`**。
 * jsdom 不会真正加载图片，因此本文件在**文件顶部局部 stub** `HTMLImageElement`
 * 的 `complete` / `naturalWidth`，让 Radix 判定为「已加载」，
 * 从而覆盖 `<img>` 的渲染分支。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

/**
 * 图片加载状态桩
 *
 * @description
 * jsdom 不实现图片加载，`image.complete` 恒为 `false` 且 `naturalWidth` 为 `0`，
 * Radix 因此永远判定为「加载中」而不渲染 `<img>`。
 * 这里把两者改为「已加载」的值，使 Radix 进入 `Loaded` 分支。
 */
class LoadedImageStub {
  complete = true;
  naturalWidth = 100;
  naturalHeight = 100;
  onload: ((this: GlobalEventHandlers, event: Event) => unknown) | null = null;
  onerror: ((this: GlobalEventHandlers, event: Event) => unknown) | null = null;

  private _src = '';

  set src(value: string) {
    this._src = value;
  }

  get src(): string {
    return this._src;
  }

  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true;
  }
}

// 局部 polyfill：让 Radix 判定图片「已加载」
globalThis.Image = LoadedImageStub as unknown as typeof Image;

describe('Avatar 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染头像容器', () => {
      render(<Avatar>头像</Avatar>);

      const avatar = screen.getByText('头像');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-slot', 'avatar');
    });

    it('应该正确应用头像容器类名', () => {
      render(<Avatar>头像</Avatar>);

      const avatar = screen.getByText('头像');
      expect(avatar).toHaveClass('relative');
      expect(avatar).toHaveClass('flex');
      expect(avatar).toHaveClass('size-8');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('应该正确渲染图片元素', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.png" alt="头像图片" />
        </Avatar>,
      );

      const image = screen.getByRole('img', { name: '头像图片' });
      expect(image).toHaveAttribute('data-slot', 'avatar-image');
      expect(image).toHaveClass('aspect-square');
    });

    it('应该正确渲染兜底文本', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      );

      const fallback = screen.getByText('AB');
      expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
      expect(fallback).toHaveClass('rounded-full');
      expect(fallback).toHaveClass('bg-muted');
    });

    it('应该正确合并自定义类名', () => {
      render(<Avatar className="custom-avatar">头像</Avatar>);

      const avatar = screen.getByText('头像');
      expect(avatar).toHaveClass('custom-avatar');
      expect(avatar).toHaveClass('size-8');
    });
  });

  describe('状态测试', () => {
    it('应该在图片加载完成后隐藏兜底文本', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.png" alt="头像图片" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      );

      // 图片状态为 Loaded 时，Radix 不再渲染 fallback
      expect(screen.queryByText('AB')).not.toBeInTheDocument();
    });

    it('应该在 delayMs 延迟期间仅展示兜底文本', () => {
      // 模拟图片「尚未加载」：complete 为 false，Radix 判定为 Loading
      const LoadingImage = class extends LoadedImageStub {
        override complete = false;
        override naturalWidth = 0;
      };
      const originalImage = globalThis.Image;
      globalThis.Image = LoadingImage as unknown as typeof Image;

      try {
        render(
          <Avatar>
            <AvatarImage src="/avatar.png" alt="头像图片" />
            <AvatarFallback delayMs={1000}>AB</AvatarFallback>
          </Avatar>,
        );

        // Radix 的 `AvatarFallback` 在传入 `delayMs` 时会延迟渲染兜底文本，
        // 因此延时未到之前兜底文本不应出现在 DOM 中。
        expect(screen.queryByText('AB')).not.toBeInTheDocument();
      } finally {
        globalThis.Image = originalImage;
      }
    });

    it('应该在 delayMs 延时结束后展示兜底文本', async () => {
      // 模拟图片「尚未加载」：complete 为 false，Radix 判定为 Loading
      const LoadingImage = class extends LoadedImageStub {
        override complete = false;
        override naturalWidth = 0;
      };
      const originalImage = globalThis.Image;
      globalThis.Image = LoadingImage as unknown as typeof Image;

      try {
        render(
          <Avatar>
            <AvatarImage src="/avatar.png" alt="头像图片" />
            <AvatarFallback delayMs={10}>AB</AvatarFallback>
          </Avatar>,
        );

        // 等待 delayMs 计时结束，兜底文本才被渲染
        expect(await screen.findByText('AB')).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: '头像图片' })).not.toBeInTheDocument();
      } finally {
        globalThis.Image = originalImage;
      }
    });

    it('应该正确透传 avatar 的 data-state 状态属性', () => {
      render(<Avatar data-state="loaded">头像</Avatar>);

      expect(screen.getByText('头像')).toHaveAttribute('data-state', 'loaded');
    });
  });

  describe('交互测试', () => {
    it('应该在点击时触发 onClick 回调', () => {
      const handleClick = vi.fn();
      render(<Avatar onClick={handleClick}>头像</Avatar>);

      fireEvent.click(screen.getByText('头像'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该在更新后渲染新的兜底文本', () => {
      const { rerender } = render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByText('AB')).toBeInTheDocument();

      rerender(
        <Avatar>
          <AvatarFallback>CD</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByText('CD')).toBeInTheDocument();
    });
  });

  describe('无障碍测试', () => {
    it('应该通过 alt 提供图片的可访问名称', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.png" alt="头像图片" />
        </Avatar>,
      );

      expect(screen.getByRole('img', { name: '头像图片' })).toBeInTheDocument();
    });

    it('应该透传 aria-label 属性', () => {
      render(<Avatar aria-label="用户头像">头像</Avatar>);

      expect(screen.getByLabelText('用户头像')).toBeInTheDocument();
    });

    it('应该透传 data-* 属性', () => {
      render(<Avatar data-testid="custom-avatar">头像</Avatar>);

      expect(screen.getByTestId('custom-avatar')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('应该允许渲染空的头像容器', () => {
      render(<Avatar aria-label="空头像" />);

      expect(screen.getByLabelText('空头像')).toHaveAttribute('data-slot', 'avatar');
    });

    it('应该允许渲染空的兜底文本', () => {
      render(
        <Avatar>
          <AvatarFallback />
        </Avatar>,
      );

      expect(document.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument();
    });

    it('应该在图片加载失败时展示兜底文本', () => {
      // 模拟加载失败：`complete` 为 true 但 `naturalWidth` 为 0
      const FailedImage = class extends LoadedImageStub {
        override naturalWidth = 0;
      };
      const originalImage = globalThis.Image;
      globalThis.Image = FailedImage as unknown as typeof Image;

      try {
        render(
          <Avatar>
            <AvatarImage src="/broken.png" alt="损坏图片" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>,
        );

        expect(screen.getByText('AB')).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: '损坏图片' })).not.toBeInTheDocument();
      } finally {
        globalThis.Image = originalImage;
      }
    });
  });
});
