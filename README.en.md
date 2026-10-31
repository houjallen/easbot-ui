[中文](./README.md) | English

# @easbot/ui — React Component Library

> A React component library built on **Radix UI** + **Tailwind CSS v4**, with 34 ready-to-use accessible components.

## Version

v0.3.31

## Introduction

`@easbot/ui` is a component library reusable by any React project (including Next.js App Router).

**Highlights**:

- **34 components** — covering forms, overlays, navigation, and data display
- **Accessibility first** — all built on Radix UI primitives with ARIA semantics and keyboard navigation
- **Zero-config styling** — Tailwind is fully compiled at build time; consumers just `import` the CSS
- **Dual-format output** — ESM + CJS + TypeScript declarations
- **Themeable** — CSS-variable driven; light / dark switch at runtime without rebuilding
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

## Component List (34)

| Category     | Components                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Forms**    | `Button` `Checkbox` `Form` `Input` `Label` `RadioGroup` `Select` `Slider` `Switch` `Textarea` `Toggle`                     |
| **Overlays** | `AlertDialog` `Command` `Dialog` `DropdownMenu` `HoverCard` `Menubar` `NavigationMenu` `Popover` `Sheet` `Toast` `Tooltip` |
| **Display**  | `Alert` `Avatar` `Badge` `Card` `Progress` `Skeleton` `Spinner` `Table` `Tabs` `ScrollArea` `Separator`                    |
| **Hooks**    | `useToast`                                                                                                                 |

Each component directory (`src/<component>/`) contains:

```
<component>.tsx          implementation
<component>.test.tsx     Vitest unit test
<component>.stories.tsx  Storybook CSF3 story
index.ts                 public exports
```

## Theming

Theming is driven by CSS variables — roughly 200 `--xxx` custom properties.

```html
<!-- Light (default) -->
<html data-theme="light" />

<!-- Dark -->
<html data-theme="dark" />
```

Theme files live in `src/theme-light.css` / `src/theme-dark.css` and ship as
`dist/theme-light.css` / `dist/theme-dark.css`, so they can be imported separately to override.

## Tech Stack

| Category    | Choice                                    |
| ----------- | ----------------------------------------- |
| Framework   | React 19                                  |
| A11y        | Radix UI primitives                       |
| Styling     | Tailwind CSS v4 + CSS-variable theming    |
| Variants    | class-variance-authority (cva)            |
| Class merge | clsx + tailwind-merge                     |
| Build       | tsup (esbuild)                            |
| Testing     | Vitest 4 + @testing-library/react + jsdom |
| Docs        | Storybook 10 (react-vite builder)         |
| Linting     | Biome 2                                   |
| Types       | TypeScript 6                              |
| Package mgr | pnpm                                      |

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

## Development Commands

```bash
# Install dependencies
pnpm install

# Build (JS + d.ts + CSS)
pnpm build
pnpm build:css        # compile Tailwind CSS only

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

# Storybook
pnpm storybook        # dev preview (http://localhost:6006)
pnpm storybook:build  # static site → storybook-static/

# Versioning
pnpm version:patch
pnpm version:minor
pnpm version:major

# Publish
pnpm publish:list     # list published npm versions
pnpm publish:npm      # publish to npm
```

## Dependency Strategy

| Category           | Members                                                                                    | Rationale                                             |
| ------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `dependencies`     | `class-variance-authority` `clsx` `cmdk` `lucide-react` `react-hook-form` `tailwind-merge` | Imported directly by source — must resolve at runtime |
| `peerDependencies` | `react` `react-dom`                                                                        | Provided by the host app; avoids duplicate React      |
| `peerDependencies` | `@radix-ui/react-*` (22 packages, optional)                                                | Version alignment avoids Radix internal state drift   |

**Tailwind CSS** lives in `devDependencies` (build time) and is optional for consumers who
want to customize the theme.

## Testing Conventions

- **Framework**: Vitest 4 + jsdom
- **Location**: `src/<component>/<component>.test.tsx` (next to the component source)
- **Naming**: `<component>.test.tsx`
- **API**: use `vi.*` (not `jest.*`); matchers are registered globally via `@testing-library/jest-dom/vitest`
- **Coverage**: every component needs a unit test covering render / state / interaction / a11y

```bash
# Single file
pnpm vitest run src/button/button.test.tsx

# Single directory
pnpm vitest run src/button
```

## Development Standards (`spec/`)

`spec/` is this library's **development constitution** — 7 documents, each carrying **8–12 re-runnable
scanning dimensions** (command + decision rule + fix pattern). **Run them before committing.**

| Document                                                                 | Covers                                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [`spec/spec-index.md`](./spec/spec-index.md)                             | index + scenario-based navigation + full-repo self-check commands             |
| [`spec/component-standard.md`](./spec/component-standard.md)             | 4-piece component directory / naming / exports / encapsulation / cva / `cn()` |
| [`spec/css-standard.md`](./spec/css-standard.md)                         | CSS variables / dual theme files / `@theme inline` / `dark` variant           |
| [`spec/testing-guidelines.md`](./spec/testing-guidelines.md)             | test config / case structure / assertion choice / polyfills                   |
| [`spec/storybook-standard.md`](./spec/storybook-standard.md)             | CSF3 / meta / story / argTypes / decorators                                   |
| [`spec/code-annotation-standard.md`](./spec/code-annotation-standard.md) | comment & JSDoc conventions                                                   |
| [`spec/code-quality.md`](./spec/code-quality.md)                         | Biome / TypeScript / build / dependency partitioning / release checklist      |

> **Read [`spec/spec-index.md`](./spec/spec-index.md) first** — it tells you which document to read per scenario.

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
│   ├── <component>/          # 34 component directories
│   ├── utils/classnames.ts   # cn() class-name merge helper
│   ├── styles.css            # Tailwind v4 entry (scans src/ at build time)
│   ├── theme-light.css       # light theme variables
│   ├── theme-dark.css        # dark theme variables
│   └── index.ts              # barrel exports
├── tests/setup.ts            # Vitest global setup (jest-dom matcher registration)
├── spec/                     # development standards (7 docs, see spec/spec-index.md)
├── scripts/                  # versioning / CHANGELOG / publish scripts
├── .storybook/               # Storybook configuration
├── tsup.config.ts            # build configuration
└── vitest.config.ts          # test configuration
```

## License

MIT License
