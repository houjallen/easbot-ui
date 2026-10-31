# @easbot/ui 发布脚本（Windows PowerShell）
#
# 前置条件：已执行 npm login（凭据存于 ~/.npmrc，pnpm 与 npm 共用）
#
# 全程使用 pnpm：
# - 登录态检查走 `pnpm whoami`（与 npm whoami 读同一份凭据）
# - 构建走 `pnpm build`（tsup + Tailwind CSS 编译）
# - 发布走 `pnpm publish`（自动执行 prepublishOnly 生命周期脚本，遵循 workspace 依赖解析）
$ErrorActionPreference = "Stop"

$pkgName = "@easbot/ui"
Write-Host "Publishing $pkgName" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking npm login..." -ForegroundColor Yellow
# pnpm whoami 与 npm whoami 共用同一份 ~/.npmrc 凭据
$prevEAP = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$npmUser = (& pnpm.cmd whoami *>&1 | Out-String).Trim()
$ErrorActionPreference = $prevEAP
if ([string]::IsNullOrWhiteSpace($npmUser)) {
    Write-Host "❌ Not logged in to npm, run: npm login" -ForegroundColor Red
    exit 1
}
Write-Host "Logged in as: $npmUser" -ForegroundColor Green
Write-Host ""

Write-Host "Building to dist..." -ForegroundColor Cyan
& pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed (exit $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Publishing to npm..." -ForegroundColor Cyan
# --no-git-checks：跳过 pnpm 的 git 检查（当前分支 / 工作区是否干净）。
# 发布前已由 CI 与人工确认过版本与产物，此处不再重复拦截。
& pnpm publish --access public --no-git-checks --registry https://registry.npmjs.org
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publish failed (exit $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "✅ Publish successful!" -ForegroundColor Green
Write-Host "Package: https://www.npmjs.com/package/$pkgName" -ForegroundColor Cyan
