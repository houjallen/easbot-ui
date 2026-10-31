#!/bin/bash
# @easbot/ui 发布脚本（Unix / macOS / Git Bash）
#
# 前置条件：已执行 npm login（凭据存于 ~/.npmrc，pnpm 与 npm 共用）
#
# 全程使用 pnpm：
# - 登录态检查走 `pnpm whoami`（与 npm whoami 读同一份凭据）
# - 构建走 `pnpm build`（tsup + Tailwind CSS 编译）
# - 发布走 `pnpm publish`（自动执行 prepublishOnly 生命周期脚本，遵循 workspace 依赖解析）
set -euo pipefail

PKG_NAME="@easbot/ui"
echo "Publishing ${PKG_NAME}"
echo "================================"
echo ""

echo "Checking npm login..."
NPM_USER="$(pnpm whoami 2>/dev/null || true)"
if [ -z "${NPM_USER}" ]; then
  echo "❌ Not logged in to npm, run: npm login" >&2
  exit 1
fi
echo "Logged in as: ${NPM_USER}"
echo ""

echo "Building to dist..."
pnpm run build

echo ""
echo "Publishing to npm..."
# --no-git-checks：跳过 pnpm 的 git 检查（当前分支 / 工作区是否干净）。
# 发布前已由 CI 与人工确认过版本与产物，此处不再重复拦截。
pnpm publish --access public --no-git-checks --registry https://registry.npmjs.org

echo ""
echo "✅ Publish successful!"
echo "Package: https://www.npmjs.com/package/${PKG_NAME}"
