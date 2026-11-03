[中文](./README.md) | English

# @easbot/ui — React Component Library

> A React component library built on **Radix UI** + **Tailwind CSS v4**, with 54 ready-to-use accessible components.

## Version

v0.3.31

## Introduction

`@easbot/ui` is a component library reusable by any React project (including Next.js App Router).

**Highlights**:

- **54 components** — covering forms, overlays, navigation, and data display
- **Accessibility first** — all built on Radix UI primitives with ARIA semantics and keyboard navigation
- **Zero-config styling** — Tailwind is fully compiled at build time; consumers just `import` the CSS
- **Dual-format output** — ESM + CJS + TypeScript declarations
- **Themeable** — CSS-variable driven; light / dark switch at runtime without rebuilding
- **Built-in i18n** — component copy ships in zh-CN / en-US; the locale is injected by the consumer
- **Built-in data contracts** — Zod schemas ship with the package for runtime validation of consumer configs
- **Production-ready tooling** — Vitest unit tests + Storybook docs + Biome linting + CI/CD

## Quick Start

### Install

```bash
npm install @easbot/ui
# or
pnpm add @easbot/ui
```

### Usage

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@easbot/ui';
import '@easbot/ui/styles.css';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click</Button>
      </CardContent>
    </Card>
  );
}
```

> ⚠️ **Styles are required**: `import '@easbot/ui/styles.css';`
> Component styles are pre-compiled into plain CSS at **library build time** — consumers
> need **no** Tailwind installation or configuration.

### Next.js App Router

```tsx
// app/layout.tsx
import '@easbot/ui/styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
```

## Component List (54)

Component implementations live in `src/ui/<component>/`, each with its implementation file + `index.ts` barrel.

| Category      | Components                                                                                                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forms**     | `Button` `Checkbox` `Combobox` `Edit` `Form` `Input` `InputOtp` `Label` `RadioGroup` `Select` `Slider` `Switch` `Textarea` `Toggle` `ToggleGroup`                                                                                                         |
| **Overlays**  | `AlertDialog` `Command` `ContextMenu` `Dialog` `Drawer` `DropdownMenu` `HoverCard` `Menubar` `NavigationMenu` `Popover` `Sheet` `Toast` `Tooltip`                                                                                                         |
| **Display**   | `Accordion` `Alert` `AspectRatio` `Avatar` `Badge` `Breadcrumb` `Calendar` `Card` `Carousel` `Chart` `Collapsible` `Date` `Icon` `Pagination` `Progress` `ScrollArea` `Separator` `Sidebar` `Skeleton` `Spinner` `Table` `Tabs` `Tag` `Tree` `Typography` |
| **Hooks**     | `useToast`                                                                                                                                                                                                                                                |
| **Providers** | `LocaleProvider` `NotifyProvider`                                                                                                                                                                                                                         |

> The table groups **consumer-visible component families**; `src/ui/` contains **54** component
> directories in total — several of which export multiple sub-components (e.g. the `Dialog`,
> `Table`, and `Date` families).

Each component directory (`src/ui/<component>/`) contains:

```
<component>/               # component directory
├── <component>.tsx        # implementation (some components have several files)
├── __tests__/             # tests + stories live here
│   ├── <component>.test.tsx
│   └── <component>.stories.tsx
└── index.ts               # export * from './<component>' + type exports
```

> ⚠️ **Tests and stories always live in the `__tests__/` subdirectory** — kept separate from the
> implementation files to avoid mixing code and test artifacts.

## Theming

Theming is driven by CSS variables — **692** `--xxx` custom properties (the light / dark files
declare exactly the same set).

```html
<!-- Light (default) -->
<html data-theme="light" />

<!-- Dark -->
<html data-theme="dark" />
```

Theme files live in `src/theme/themes/light.css` / `src/theme/themes/dark.css` and ship as
`dist/theme-light.css` / `dist/theme-dark.css`, so they can be imported separately to override.

## Internationalization (i18n)

The library **ships built-in bilingual copy** (`zh-CN` / `en-US`) across **20** component message
domains — buttons, tables, pagination, dates, files, dialogs and every other user-visible
string work **out of the box**. Consumers install **no** i18n library.

- **Message tables**: `src/utils/component-messages.ts` (grouped by component domain, each with `zh-CN` + `en-US`)
- **React-side Hook**: `useComponentMessage(domain, { locale, messages })`
- **Processing engine**: `src/utils/ui-message.ts` (pure `processUiMessage`, supports dot paths and `{param}` interpolation)

### Switching the Locale

Switch globally via `LocaleProvider`, or override per instance with the component's `locale` prop
(higher priority):

```tsx
import { LocaleProvider, Pagination } from '@easbot/ui';

// Chinese (default)
export function ZhApp() {
  return (
    <LocaleProvider locale="zh-CN">
      <Pagination />
    </LocaleProvider>
  );
}

// English — component default copy switches automatically
export function EnApp() {
  return (
    <LocaleProvider locale="en-US">
      <Pagination />
    </LocaleProvider>
  );
}

// Override the locale on a single component (higher priority than LocaleProvider)
export function SingleComponent() {
  return <Pagination locale="en-US" />;
}
```

### Overriding Built-in Copy

Consumers can override built-in copy through the `messages` prop (**shallow merge**, matched by locale):

```tsx
export function CustomCopy() {
  return <Pagination messages={{ 'en-US': { prev: 'Back', next: 'Forward' } }} />;
}
```

### Consumer Hook

```tsx
import { useComponentMessage } from '@easbot/ui';

function TableToolbar() {
  const { t } = useComponentMessage('table');
  return <span>{t('totalRows', { count: 42 })}</span>; // 总计：42 行 / Total: 42 rows
}
```

> ⚠️ **The library holds no global locale state** — the locale is injected by the consumer through
> `LocaleProvider` / the `locale` prop; the library imports **no** external i18n library such as
> `react-i18next` / `i18next`. Full rules: [`spec/i18n-standard.md`](./spec/i18n-standard.md).

## Notifications (Notify)

`NotifyProvider` provides **semantic notifications**, mapping terse calls such as
`notify.success('Saved')` to the library's `toast()` parameters (title / description / variant).

```tsx
import { NotifyProvider, useNotify } from '@easbot/ui';

function SaveButton() {
  const { notify, close } = useNotify();
  return (
    <button
      onClick={() =>
        notify.success('Configuration saved', {
          title: 'Done', // override the semantic default title
          duration: 8000, // override the display duration (ms)
          variant: 'info', // override the Toast variant
          position: 'top-right', // override the display position
        })
      }
    >
      Save
    </button>
  );
}

// Application root
export function App() {
  return (
    <NotifyProvider position="bottom-right" duration={5000}>
      <SaveButton />
    </NotifyProvider>
  );
}
```

### Parameter precedence

| Parameter  | Precedence (high → low)                                                               |
| ---------- | ------------------------------------------------------------------------------------- |
| `title`    | `options.title` → semantic built-in copy (info / success / warning / error)           |
| `variant`  | `options.variant` → semantic variant (`error` → `destructive`)                        |
| `duration` | `options.duration` → `NotifyProvider`'s `duration` → component default 5000ms         |
| `position` | `options.position` → `NotifyProvider`'s `position` → component default `bottom-right` |

> 📌 **Positioning is handled by the component** — every notification positions itself in the
> matching corner according to its own `position`, so consumers pass **no CSS class names**;
> notification width is bounded by `--toast-min-width` (240px) / `--toast-max-width` (350px),
> which keeps it mobile-friendly.

## Tech Stack

| Category    | Choice                                                     |
| ----------- | ---------------------------------------------------------- |
| Framework   | React 19                                                   |
| A11y        | Radix UI primitives                                        |
| Styling     | Tailwind CSS v4 + CSS-variable theming                     |
| Variants    | class-variance-authority (cva)                             |
| Class merge | clsx + tailwind-merge                                      |
| Contracts   | Zod 4 (`z.infer` types + runtime checks)                   |
| i18n        | Built-in bilingual (zh-CN / en-US) + `useComponentMessage` |
| Build       | tsup (esbuild)                                             |
| Testing     | Vitest 4 + @testing-library/react + jsdom                  |
| Docs        | Storybook 10 (react-vite builder)                          |
| Linting     | Biome 2                                                    |
| Types       | TypeScript 6                                               |
| Package mgr | pnpm                                                       |

## Toolchain Rationale (why tsup, not vite)

| Stage              | Tool                                          | Why                                                                    |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------------- |
| npm package build  | **tsup** (esbuild)                            | A component library only needs "source → lib + dts"; esbuild is faster |
| Storybook preview  | `@storybook/react-vite` (bundles Vite itself) | Storybook needs a dev server + HMR + CSS handling — Vite's strength    |
| Unit testing       | Vitest 4 (Vite pipeline built in)             | No project-level `vite.config.ts` needed; reads `vitest.config.ts`     |
| Consumer toolchain | Consumer's own (Vite / Next.js / CRA)         | The library ships a standard npm package                               |

**Conclusion**: this repo does **not** need `vite.config.ts` as a build tool. tsup is the
build source of truth; Vite exists only as Storybook's internal implementation detail.

## Tailwind

Component styling depends entirely on Tailwind utilities plus CSS variables, so **Tailwind is
required**. However:

- Tailwind is a **build-time** tool — it is not a runtime dependency;
- the library **fully compiles** `src/` into `dist/styles.css` (plain CSS) at build time;
- consumers need **no** Tailwind install and **no** content-path configuration.

To override the theme, just override the `:root` custom properties in `dist/styles.css` with your own CSS.

## Font Assets (opt-in)

Styles and font CSS are **shipped together**, but **whether the custom font is enabled is decided by
the application**.

| Artifact          | Contents                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `dist/styles.css` | Theme variables + atomic classes; `--font-sans` carries a **full fallback stack** (system fonts when the custom font is off) |
| `dist/fonts.css`  | 7 `@font-face` rules (Source Han Sans CN, 7 weights) + the `--font-source-han-sans` variable                                 |

> ⚠️ **The font binaries are NOT published in the npm package** (otherwise every consumer would
> install ~60 MB extra) — the package ships CSS only (**1.5 MB**).
> The **application** places them in its own `public/` static asset folder.

### 1. Place the font files

Put them in the application's **`public/font/`** folder (Vite / Next.js etc. deploy `public/` to the
site root):

```
public/
└── font/
    ├── SourceHanSansCN-ExtraLight.otf   # weight 200
    ├── SourceHanSansCN-Light.otf        # weight 300
    ├── SourceHanSansCN-Normal.otf       # weight 400
    ├── SourceHanSansCN-Regular.otf      # weight 450
    ├── SourceHanSansCN-Medium.otf       # weight 500
    ├── SourceHanSansCN-Bold.otf         # weight 700
    ├── SourceHanSansCN-Heavy.otf        # weight 900
    └── LICENSE.txt                       # SIL OFL 1.1 license (must be kept)
```

The `@font-face` rules in `dist/fonts.css` reference the files at the conventional path
`/font/xxx`, which **matches `public/font/` automatically** — no extra configuration needed.

> 📌 **Weights must map one-to-one** — each CSS `font-weight` is taken from the font's own
> `OS/2.usWeightClass` (measured by reading the OTF header table), **not** approximated with CSS
> keywords. Otherwise browsers apply "faux bold" and the glyphs look blurry.
>
> 📌 **Next.js users** — you may host the fonts with `next/font/local` and attach the CSS variable
> to `<html>` instead (**do not** import `fonts.css` as well, to avoid duplicate declarations):
>
> ```tsx
> // app/layout.tsx
> import localFont from 'next/font/local';
>
> const sourceHanSans = localFont({
>   src: [
>     { path: './SourceHanSansCN/SourceHanSansCN-Regular.otf', weight: '400', style: 'normal' },
>   ],
>   display: 'swap',
>   variable: '--font-source-han-sans',
> });
>
> export default function RootLayout({ children }: { children: React.ReactNode }) {
>   return (
>     <html className={sourceHanSans.variable} data-theme="light">
>       <body>{children}</body>
>     </html>
>   );
> }
> ```
>
> The library's `--font-sans` follows `--font-source-han-sans` automatically — no other change needed.

### 2. Import the CSS

```ts
// Option A: no fonts.css — keep system fonts (default)
import '@easbot/ui/styles.css';

// Option B: with fonts.css — enable Source Han Sans (explicit application decision)
import '@easbot/ui/styles.css';
import '@easbot/ui/fonts.css';
```

> ⚠️ **Do not** pull `fonts.css` into your own style entry "as a side effect" —
> each weight is roughly **8 MB**, so loading must be an **explicit** application decision.

### 3. Override the font stack

```css
:root {
  --font-sans: 'MyBrandFont', 'Microsoft YaHei', system-ui, sans-serif;
}
```

> 📌 Override either `--font-sans` or `--font-source-han-sans` — no library source change required.
> See [`spec/css-standard.md`](./spec/css-standard.md) §1.7 and
> [`docs/theming.md`](./docs/theming.md).

## Icon Fonts (opt-in)

`Icon`'s `type="class"` mode needs an icon font for the glyphs — again **the application decides
whether to enable it**.

| Artifact            | Contents                                                    |
| ------------------- | ----------------------------------------------------------- |
| `dist/iconfont.css` | `content` mapping for 796 icon classes + `@font-face` rules |

### 1. Place the font files

The icon font binaries are **NOT published in the npm package** — copy them into the static asset
folder:

```
public/
└── icon/
    ├── iconfont.woff      # primary format (covers IE11+ and all modern browsers)
    ├── iconfont.ttf       # fallback (old Safari)
    ├── symbol.ttf         # officefont's Symbol family
    └── wingding.ttf       # officefont's Wingdings family
```

The `@font-face` rules in `dist/iconfont.css` reference the files at the conventional path
`/icon/xxx`.

### 2. Import the CSS

```ts
import '@easbot/ui/styles.css';
import '@easbot/ui/iconfont.css'; // ← enable the icon font
```

### 3. Use it

```tsx
import { Icon, iconfontClassNames } from '@easbot/ui';

<Icon type="class" clazzName="iconfont icon-search" size={24} />;

// all 796 class names are exported for direct use
console.log(iconfontClassNames.length); // 796
```

> ⚠️ Without `iconfont.css`, `class` mode renders **blank** — `name` / `url` modes are unaffected.
> See [`spec/css-standard.md`](./spec/css-standard.md) §1.8.

## Theme Variables Only (optional)

`dist/styles.css` **already contains** both the light and dark theme variable sets.
If you only want to **override the theme variables** and keep your own atomic classes, import them
separately:

```ts
import '@easbot/ui/theme-light.css'; // or theme-dark.css
```

| Artifact               | Contents                                    |
| ---------------------- | ------------------------------------------- |
| `dist/theme-light.css` | `:root[data-theme='light']` theme variables |
| `dist/theme-dark.css`  | `:root[data-theme='dark']` theme variables  |

> These two files are **specially provided optional** artifacts — the regular usage is just
> `import '@easbot/ui/styles.css';`.

## Development Commands

```bash
# Install dependencies
pnpm install

# Build (JS + d.ts + CSS)
pnpm build
pnpm build:css        # compile Tailwind CSS only
pnpm build:fonts      # emit font CSS only (dist/fonts.css; binaries are not published)
pnpm build:icons      # emit icon-font CSS only (dist/iconfont.css; binaries are not published)

# Test
pnpm test             # single run
pnpm test:watch       # watch mode
pnpm test:coverage    # coverage

# Type check
pnpm type-check

# Lint
pnpm lint             # check
pnpm lint:fix         # auto-fix
pnpm lint:report      # summary report

# i18n standards scan
pnpm check:i18n       # scan hardcoded copy / message-table consistency (0 violations = pass)

# Storybook
pnpm storybook        # dev preview (http://localhost:6006)
pnpm storybook:build  # static site → storybook-static/

# Versioning
pnpm version:patch
pnpm version:minor
pnpm version:major

# Publish
pnpm publish:list     # list published npm versions
pnpm publish:npm      # publish to npm (macOS / Linux / Git Bash)
pnpm publish:npm:win  # publish to npm (Windows PowerShell)
```

## Data Contracts (Zod Schemas)

The library defines every **consumer-supplied config object** as a Zod schema — the schema _is_ the
runtime validator, and types are derived via `z.infer`, so types and validation never drift apart.

```tsx
import { DataStorePageSchema, FilterRuleSchema } from '@easbot/ui';

// Runtime validation — a malformed config fails loudly instead of silently misbehaving
const page = DataStorePageSchema.parse(rawPage);

// Type inference — no hand-written interface needed
type Page = z.infer<typeof DataStorePageSchema>;
```

Schema groups (in `src/models/` and `src/utils/validation-rule.ts`):

| Module                  | Schemas                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `models/table`          | `TableActionTypeSchema` `TableColumnActionTypeSchema` `TableCellActionTypeSchema` `TableRowActionTypeSchema` |
| `models/filter`         | `FilterOperatorSchema` `FilterDataTypeSchema` `FilterExpressionSchema` `FilterRuleSchema` (recursive)        |
| `models/data-store`     | `DataStoreFieldSchema` `DataStoreSortingSchema` `DataStorePageSchema`                                        |
| `models/axios`          | `UploadFileParamsSchema` `UploadRequestConfigSchema`                                                         |
| `utils/validation-rule` | `ValidationFormatSchema` `ValidationRuleSchema`                                                              |

## Dependency Strategy

| Category           | Members                                                                                                                                                                                                                                        | Rationale                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `dependencies`     | `class-variance-authority` `clsx` `cmdk` `date-fns` `dayjs` `embla-carousel-react` `input-otp` `lucide-react` `react-day-picker` `react-hook-form` `react-moveable` `react-resizable-panels` `recharts` `sonner` `tailwind-merge` `vaul` `zod` | Imported directly by source — must resolve at runtime |
| `peerDependencies` | `react` `react-dom`                                                                                                                                                                                                                            | Provided by the host app; avoids duplicate React      |
| `peerDependencies` | `@radix-ui/react-*` (28 packages, **all optional**)                                                                                                                                                                                            | Version alignment avoids Radix internal state drift   |

**Tailwind CSS** lives in `devDependencies` (build time) and is optional for consumers who
want to customize the theme.

> ⚠️ **New dependencies MUST also be added to `tsup.config.ts` `external`** — a missing entry
> bundles the package into the output, inflating the bundle and giving consumers duplicate
> instances (typical symptom: Zod `instanceof` checks failing downstream).

## Testing Conventions

- **Framework**: Vitest 4 + jsdom
- **Location**: `src/ui/<component>/__tests__/<component>.test.tsx` (tests + stories in the `__tests__/` subdirectory)
- **Naming**: `<component>.test.tsx`
- **API**: use `vi.*` (not `jest.*`); matchers are registered globally via `@testing-library/jest-dom/vitest`
- **Polyfills**: browser APIs missing from jsdom (`ResizeObserver` / `scrollIntoView`) are imported from the shared `tests/polyfills.ts`
- **Coverage**: every component needs a unit test covering render / state / interaction / a11y

```bash
# Single file
pnpm vitest run src/ui/button/__tests__/button.test.tsx

# Single directory
pnpm vitest run src/ui/button
```

## Development Standards (`spec/`)

`spec/` is this library's **development constitution** — 8 documents, each carrying **8–12 re-runnable
scanning dimensions** (command + decision rule + fix pattern). **Run them before committing.**

| Document                                                                 | Covers                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [`spec/spec-index.md`](./spec/spec-index.md)                             | index + scenario-based navigation + full-repo self-check commands        |
| [`spec/component-standard.md`](./spec/component-standard.md)             | component directory / naming / exports / encapsulation / cva / `cn()`    |
| [`spec/css-standard.md`](./spec/css-standard.md)                         | CSS variables / dual theme files / `@theme inline` / `dark` variant      |
| [`spec/testing-guidelines.md`](./spec/testing-guidelines.md)             | test config / case structure / assertion choice / polyfills              |
| [`spec/storybook-standard.md`](./spec/storybook-standard.md)             | CSF3 / meta / story / argTypes / decorators                              |
| [`spec/code-annotation-standard.md`](./spec/code-annotation-standard.md) | comment & JSDoc conventions                                              |
| [`spec/code-quality.md`](./spec/code-quality.md)                         | Biome / TypeScript / build / dependency partitioning / release checklist |
| [`spec/i18n-standard.md`](./spec/i18n-standard.md)                       | built-in i18n / three usage modes / message-table rules / exemptions     |

> **Read [`spec/spec-index.md`](./spec/spec-index.md) first** — it tells you which document to read per scenario.

## Consumer Docs (`docs/`)

Aimed at developers **using** the library, as opposed to `spec/` (aimed at developers
**building** it):

| Document                                               | Purpose                                          |
| ------------------------------------------------------ | ------------------------------------------------ |
| [`docs/README.md`](./docs/README.md)                   | docs index                                       |
| [`docs/getting-started.md`](./docs/getting-started.md) | install & first steps                            |
| [`docs/theming.md`](./docs/theming.md)                 | theme customization / CSS var override           |
| [`docs/components/`](./docs/components/)               | per-component usage (forms / overlays / display) |

## Git Workflow

- **commit message**: `<type>(<scope>): <description>`, summary ≤ 72 characters
- **type**: `feat | fix | docs | test | chore | refactor | perf | ci`
- **scope**: component name (`button` / `dialog` / `toast` …) or `build` / `test` / `ci` / `deps` / `docs`
- **Automation**: husky `pre-commit` runs lint-staged (biome check + format); `commit-msg` validates the message
- **Versioning**: `pnpm version:patch|minor|major` bumps the version and tags `easbot-ui@<version>`

## Directory Structure

```
.
├── src/
│   ├── index.ts              # public API entry (the only tsup build input)
│   ├── ui/                   # public component layer (54 component directories)
│   │   └── <component>/      # implementation + __tests__/ + index.ts
│   ├── design-system/        # design-system layer (48 base components + providers + hooks)
│   ├── models/               # data contract layer (Zod schemas)
│   ├── utils/                # shared utilities (cn / object / locale / validation-rule …)
│   │   ├── ui-message.ts         # i18n processing engine (processUiMessage)
│   │   ├── component-messages.ts # built-in message tables (20 domains, bilingual)
│   │   └── use-component-message.ts # React-side message Hook
│   ├── hooks/                # shared React hooks (useDevice / useLocale)
│   ├── providers/            # context providers (LocaleProvider / NotifyProvider)
│   ├── theme/                # theme assets (single CSS entry / fonts / theme CSS / tokens)
│   │   ├── styles.css            # ⭐ the only Tailwind v4 entry (scans src/ at build time)
│   │   └── themes/               #   light.css (702) / dark.css (702) + 5 extra themes
│   └── types/                # type declarations (typings.d.ts)
├── tests/
│   ├── setup.ts              # Vitest global setup (jest-dom matchers + RTL cleanup)
│   └── polyfills.ts          # shared polyfills for browser APIs missing from jsdom
├── public/                   # local static assets (**NOT published in the npm package**)
│   ├── font/                 #   Source Han Sans OTF + SIL OFL license (served at /font/**)
│   └── icon/                 #   icon font woff/ttf (served at /icon/**)
├── docs/                     # consumer-facing docs (component docs / getting-started / theming)
├── spec/                     # development standards (8 docs, see spec/spec-index.md)
├── scripts/                  # versioning / CHANGELOG / publish / i18n scan scripts
├── .storybook/               # Storybook configuration
├── tsup.config.ts            # build configuration
└── vitest.config.ts          # test configuration
```

## License

MIT License
