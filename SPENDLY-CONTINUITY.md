# Spendly Permanent Technical Handoff

This document is the technical continuity prompt for future AI coding sessions. The actual local VS Code project is the source of truth. This document and any previous AI conversation are context only; they must never override the current local files.

## 1. Project Overview

Spendly is a personal finance and expense-tracking SaaS application built as one Next.js full-stack application. It currently supports authentication, a dashboard, expense management, income management, and a combined transactions read view.

Current implementation status:

- Phases 1–7 are implemented according to the current project state.
- Phase 7, Combined Transactions, is the latest implemented phase.
- Phase 8, Budgets, has not started.
- The developer maintains the real project locally in VS Code on Windows PowerShell.
- Neon PostgreSQL is the persistent database.
- GitHub is used for source control and backup.
- Do not rebuild the project or initialize another architecture.

## 2. Technology Stack and Versions

Known versions from the local project and previous successful checks:

| Technology | Version/status |
|---|---|
| Next.js | 15.5.23 confirmed from local build output |
| React | Package range `^19.0.0`; exact installed version not separately confirmed |
| React DOM | Package range `^19.0.0`; exact installed version not separately confirmed |
| TypeScript | 5.9.3 confirmed locally |
| Tailwind CSS | Package range `^4.0.0` |
| `@tailwindcss/postcss` | 4.3.3 confirmed from npm resolution |
| PostCSS | 8.5.26 resolved through npm overrides |
| Prisma Client | 6.19.3 generated locally |
| Prisma CLI | Package range `^6.19.3` |
| Neon PostgreSQL | Connected and working |
| Auth.js / next-auth | 5.0.0-beta.32 |
| React Hook Form | 7.85.0 |
| `@hookform/resolvers` | 5.7.1 |
| Zod | 4.4.3 |
| Recharts | 3.10.1 |
| Framer Motion | Package range `^11.15.0`; used by the reusable Toast |
| Lucide React | Package range `^0.468.0` |
| date-fns | 4.4.0 |
| Resend | 6.12.4 |
| bcryptjs | 3.0.2 |
| next-themes | Package range `^0.4.4` |
| Geist | Package range `^1.3.1` |
| clsx | Package range `^2.1.1` |
| tailwind-merge | Package range `^2.6.0` |
| dotenv | Package range `^16.4.7` |
| tsx | Package range `^4.19.2` |
| tw-animate-css | Package range `^1.0.1` |
| sharp | 0.35.3 through npm overrides |

Other dependency facts:

- `@react-pdf/renderer` is not installed.
- No separate CSV library is installed.
- Current npm overrides are PostCSS and sharp.
- The last confirmed `npm audit` result was 0 vulnerabilities.
- Do not run `npm audit fix --force` without a deliberate upgrade plan because it previously attempted to upgrade Next.js to version 16.

## 3. Current Project Structure

Important current files and directories:

```text
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
├── dashboard/
│   ├── expenses/
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── page.tsx
│   │   └── (the Expense UI is rendered by the manager component)
│   ├── income/
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   ├── error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
├── reset-password/
│   ├── page.tsx
│   └── reset-password-form.tsx
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
├── globals.css
├── layout.tsx
└── page.tsx

actions/
├── auth-actions.ts
├── expense-actions.ts
├── income-actions.ts
└── password-reset-actions.ts

components/
├── dashboard/
│   └── dashboard-charts.tsx
├── expenses/
│   └── expense-manager.tsx
├── income/
│   └── income-manager.tsx
├── transactions/
│   └── transactions-manager.tsx
├── ui/
│   └── toast.tsx
├── theme-provider.tsx
└── theme-toggle.tsx

lib/
├── default-categories.ts
├── email.ts
├── format.ts
├── password-reset.ts
├── prisma.ts
├── utils.ts
└── validators/
    ├── expense.ts
    └── income.ts

prisma/
├── schema.prisma
└── seed.ts

types/
└── next-auth.d.ts

auth.config.ts
auth.ts
components.json
eslint.config.mjs
global.d.ts
next-env.d.ts
next.config.ts
package.json
package-lock.json
postcss.config.mjs
README.md
tsconfig.json
.env.example
.gitignore
```

Generated/ignored directories include `node_modules/`, `.next/`, and `.vercel/`. They must not be committed.

`middleware.ts` was intentionally removed and must not be recreated without a specific reason.

There is no shared sidebar, navbar, dashboard navigation, or mobile drawer component. Navigation was intentionally left untouched during Phases 5–7.

## 4. Environment and Configuration

Environment variable names only; never document or expose values:

```text
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
```

Rules:

- `.env` must remain ignored and untracked.
- `.env.example` may be committed with names only.
- Never include credentials, API keys, database URLs, passwords, or secret values in AI responses, commits, or continuity documents.
- Prisma uses `DATABASE_URL` and `DIRECT_URL` for Neon PostgreSQL.
- The application uses `npm run dev` with Turbopack.

## 5. Prisma and Database Architecture

Datasource and generator:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

Actual enums:

```prisma
enum CategoryType {
  EXPENSE
  INCOME
  BOTH
}

enum PaymentMethod {
  CASH
  UPI
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  OTHER
}

enum IncomeSource {
  SALARY
  FREELANCE
  BUSINESS
  INVESTMENT
  INTEREST
  RENTAL_INCOME
  GIFT
  OTHER
}

enum RecurringFrequency {
  WEEKLY
  MONTHLY
  YEARLY
}

enum NotificationType {
  BUDGET_APPROACHING
  BUDGET_EXCEEDED
  RECURRING_UPCOMING
  GOAL_MILESTONE
  FINANCIAL_EVENT
  SYSTEM
}
```

Actual Prisma models:

- `User`: identity, credentials, currency, theme, date format, and relations to all financial entities.
- `PasswordResetToken`: hashed, expiring, single-use password reset records.
- `Category`: user-owned categories with `EXPENSE`, `INCOME`, or `BOTH` type.
- `Expense`: required category, Decimal amount, payment method, date, description, notes, and ownership indexes.
- `Income`: optional `categoryId`, Decimal amount, source enum, date, description, and notes.
- `Budget`: user-owned budget records with optional category and date period.
- `Goal`: savings goal records with optional category and contributions.
- `GoalContribution`: user-owned contributions linked to goals.
- `RecurringExpense`: recurring expense definitions with category, payment method, frequency, and due date.
- `Notification`: notification model exists, but generation/UI is not implemented.

Important Income schema decision:

```prisma
model Income {
  id          String        @id @default(cuid())
  userId      String
  categoryId  String?
  amount      Decimal       @db.Decimal(12, 2)
  description String
  source      IncomeSource
  date        DateTime      @db.Date
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
}
```

`Income.categoryId` and the optional relation remain in Prisma for compatibility and preservation of existing data. Category was removed from the Income UI, filters, validation, actions, types, table, mobile cards, and edit/reset logic. Do not remove the database field casually.

All monetary database values use PostgreSQL Decimal/Numeric, generally `Decimal(12,2)`. Decimal values are converted to regular numbers only at server-to-client display boundaries.

## 6. Auth.js and Security

Authentication files:

```text
auth.ts
auth.config.ts
app/api/auth/[...nextauth]/route.ts
types/next-auth.d.ts
```

Current authentication:

- Auth.js Credentials provider only.
- JWT sessions.
- bcryptjs password hashing.
- Registration, login, logout, forgot password, and reset password are implemented.
- Resend is used for password reset email delivery.
- Reset tokens are cryptographically random, SHA-256 hashed in storage, expiring after one hour, and single-use.
- Generic forgot-password responses are used.
- Dashboard protection occurs in `app/dashboard/layout.tsx` through a server-side session check.
- `middleware.ts` is intentionally absent because it previously caused an Auth.js/jose Edge Runtime warning.

Required ownership pattern:

```ts
const session = await auth();

if (!session?.user?.id) {
  // reject or redirect
}

const userId = session.user.id;
```

Rules:

- Never trust a client-provided `userId`.
- Every user-owned Prisma query must include the authenticated `userId`.
- Update and delete operations must verify both the record ID and authenticated user ID.
- Category ownership must be checked before Expense operations.
- Income actions no longer validate or write category IDs, but the optional Prisma relation remains.
- Combined Transactions scopes both Income and Expense queries to the authenticated user.
- Never expose another user’s records.

## 7. Design System

The current UI uses a dark midnight navy and violet glassmorphism style:

- Dark midnight navy background.
- Violet/purple primary accents.
- Blue/cyan secondary accents.
- Translucent glass panels.
- Backdrop blur.
- Thin borders and soft shadows.
- Rounded cards and controls.
- Restrained neon glow.
- Geist typography.
- High-contrast financial values.
- Responsive desktop tables and mobile cards.
- Green success states and red destructive states.

Primary design styles are in `app/globals.css`. Important existing classes include:

```text
.glass-panel
.glass-panel-strong
.glow-primary
```

Do not replace the design system with a new UI library for a small feature. Reuse the existing tokens, spacing, rounded controls, colors, and responsive patterns.

## 8. Completed Phases

### Phase 1 — Project Foundation

Complete. Includes Next.js App Router, strict TypeScript, Tailwind v4, theme support, Geist fonts, Framer Motion, Lucide, initial landing page, glassmorphism tokens, and shadcn configuration.

### Phase 2 — Prisma and Neon

Complete. Includes the current Prisma schema, Neon PostgreSQL, migrations, seed script, Decimal financial fields, relations, foreign keys, indexes, and reusable Prisma client.

### Phase 3 — Authentication

Complete. Includes Auth.js Credentials authentication, registration, login, logout, JWT sessions, password hashing, protected dashboard, password reset, Resend, secure token hashing, expiration, and single-use invalidation.

### Phase 4 — Dashboard

Complete. Includes current-month income/expenses, balance, budget usage, savings rate, charts, top spending categories, recent transactions, budget status, goal progress, upcoming recurring payments, loading/error states, empty states, and responsive charts.

### Phase 5 — Expenses

Complete and verified. Includes:

- Expense listing.
- Add, edit, and delete Expense.
- Delete confirmation.
- Search.
- Category and payment-method filtering.
- Sorting.
- Pagination.
- React Hook Form and Zod validation.
- Server Actions with ownership checks.
- Desktop table and mobile cards.
- Loading and empty states.
- Success/error feedback.
- Default category creation/backfill.
- Floating Toast feedback with success auto-dismissal and persistent errors.
- Edit form reset behavior restored and manually verified.

Expense categories must remain untouched when working on unrelated modules.

### Phase 6 — Income

Complete and verified. Includes:

- Income listing.
- Add, edit, and delete Income.
- Income sources: Salary, Freelance, Business, Investment, Interest, Rental Income, Gift, and Other.
- Source filtering.
- Search.
- Sorting.
- Pagination.
- React Hook Form and Zod validation.
- Server Actions with authenticated ownership checks.
- Optional category retained only in Prisma for compatibility; removed from Income UI and application logic.
- Desktop table and mobile cards.
- Floating Toast feedback.
- Edit form reset behavior restored and manually verified.
- Dashboard recent-income display uses neutral `Income` rather than the Income category relation.

### Phase 7 — Combined Transactions

Implemented and verified by the developer. Details are documented below.

## 9. Current Implemented Features

Current public/protected features:

- Landing page.
- Credentials registration and login.
- Logout.
- Forgot password and reset password.
- Protected dashboard.
- Current-month financial summaries.
- Six-month income/expense charts.
- Expense CRUD.
- Income CRUD.
- Combined read-only transactions view.
- Responsive desktop and mobile layouts.
- Themes through next-themes.
- Glassmorphism visual system.
- Floating success/error Toast.

The following are planned or incomplete: shared navigation, custom category management, budgets, goals UI, recurring expense UI, analytics route, reports, exports, notifications UI, settings, and final production review.

## 10. Current Routes

| Route | Visibility | Status | Purpose |
|---|---|---|---|
| `/` | Public | Implemented | Landing page |
| `/login` | Public | Implemented | Credentials login |
| `/register` | Public | Implemented | Account registration |
| `/forgot-password` | Public | Implemented | Password reset request |
| `/reset-password` | Public | Implemented | Password replacement |
| `/dashboard` | Protected | Implemented | Data-driven dashboard |
| `/dashboard/expenses` | Protected | Implemented | Expense CRUD and filters |
| `/dashboard/income` | Protected | Implemented | Income CRUD and source filters |
| `/dashboard/transactions` | Protected | Implemented | Combined read-only transactions |
| `/api/auth/[...nextauth]` | Auth route | Implemented | Auth.js GET/POST handlers |

Known planned/nonexistent routes include:

```text
/dashboard/expenses/new
/dashboard/budgets
/dashboard/goals
/dashboard/recurring
/dashboard/analytics
/dashboard/reports
/dashboard/categories
/dashboard/settings
```

`/dashboard/transactions` is now implemented, but the dashboard/navigation still contains links to future routes. Do not build a navigation system unless that is the explicitly approved task.

## 11. Reusable Components

### `components/theme-provider.tsx`

Wraps next-themes and enables persisted light/dark/system themes.

### `components/theme-toggle.tsx`

Cycles through light, dark, and system themes.

### `components/dashboard/dashboard-charts.tsx`

Client Recharts component for Expense trend and Income-versus-Expense data, responsive sizing, currency formatting, and empty chart states.

### `components/expenses/expense-manager.tsx`

Client Expense manager with listing, filters, sorting, pagination, CRUD form, delete confirmation, responsive table/cards, form reset on edit, and floating Toast.

### `components/income/income-manager.tsx`

Client Income manager with listing, source filter, sorting, pagination, CRUD form, responsive table/cards, form reset on edit, and floating Toast. Category is intentionally absent from the Income UI.

### `components/transactions/transactions-manager.tsx`

Client read-only combined transaction view with server-provided records, search/type/sort filter controls, pagination navigation, loading state through `useTransition`, responsive desktop table, mobile cards, empty state, source/category/payment-method labels, and currency formatting.

### `components/ui/toast.tsx`

Reusable client Toast implemented with Framer Motion and Lucide icons. It is fixed to the viewport, has a high z-index, does not occupy document flow, supports success/error variants, includes an optional dismiss button, uses glassmorphism styling, and is responsive on mobile.

## 12. Current Server Actions

### `actions/auth-actions.ts`

- `registerUser(formData)`
- `loginUser(formData)`

Registration validates input, normalizes email, rejects duplicates, hashes passwords, creates the User, and creates default categories.

### `actions/password-reset-actions.ts`

- `requestPasswordReset(formData)`
- `resetPassword(formData)`

Implements generic responses, secure token generation, hashed storage, expiry, email delivery, password replacement, and single-use invalidation.

### `actions/expense-actions.ts`

- `createExpense(input)`
- `updateExpense(id, input)`
- `deleteExpense(id)`

Actions authenticate, validate with Zod, verify category ownership, create Decimal amounts, verify record ownership, revalidate `/dashboard` and `/dashboard/expenses`, and return success/error messages.

### `actions/income-actions.ts`

- `createIncome(input)`
- `updateIncome(id, input)`
- `deleteIncome(id)`

Actions authenticate, validate with Zod, create Decimal amounts, verify record ownership, revalidate `/dashboard` and `/dashboard/income`, and return success/error messages. They no longer validate or write `categoryId` because Category was removed from Income application logic.

### Transactions

There is intentionally no `actions/transaction-actions.ts`. Combined Transactions is read-only and uses server-side Prisma raw SQL in `app/dashboard/transactions/page.tsx`.

## 13. Validators and Utilities

### `lib/validators/expense.ts`

Defines `paymentMethodValues`, `expenseSchema`, and `ExpenseInput`. Expense validation includes amount precision/positivity, description length, required category, payment method, date format, and optional notes.

### `lib/validators/income.ts`

Defines `incomeSourceValues`, `incomeSchema`, and `IncomeInput`. Current source values are:

```text
SALARY
FREELANCE
BUSINESS
INVESTMENT
INTEREST
RENTAL_INCOME
GIFT
OTHER
```

Income validation includes amount precision/positivity, description length, source, date format, and optional notes. It does not include `categoryId`.

### `lib/default-categories.ts`

Defines default Expense/BOTH categories and `ensureDefaultCategories(userId)`. Expense category behavior must not be changed when working on Income or Transactions.

### `lib/format.ts`

Provides `formatCurrency(amount, currency)` and `formatCompactCurrency(amount, currency)`. The user’s stored currency is passed from server components to client display components.

### `lib/prisma.ts`

Provides the reusable Prisma client.

## 14. Income Architecture

Income is implemented as its own protected module:

```text
app/dashboard/income/page.tsx
components/income/income-manager.tsx
actions/income-actions.ts
lib/validators/income.ts
```

The server page authenticates through `auth()`, derives `userId` from the session, parses search/source/sort/page parameters, queries only that user’s Income records, serializes Decimal and Date values, and passes them to the client manager.

Income’s primary classification is `source`, not Category. The UI has:

- Amount.
- Description.
- Source.
- Date.
- Notes.

The Income UI does not show Category in filters, forms, tables, mobile cards, types, or edit/reset logic. The Prisma `categoryId` field and relation remain unchanged for data compatibility.

## 15. Expense Architecture

Expense is implemented as its own protected module:

```text
app/dashboard/expenses/page.tsx
components/expenses/expense-manager.tsx
actions/expense-actions.ts
lib/validators/expense.ts
```

Expense requires a category, supports payment methods, validates ownership server-side, uses Decimal storage, and supports search, category/payment filters, sorting, pagination, CRUD, delete confirmation, desktop tables, and mobile cards.

Do not modify Expense functionality while working on Income, Transactions, Budgets, or other unrelated modules.

## 16. Floating Toast Implementation

File:

```text
components/ui/toast.tsx
```

The Toast uses:

- Framer Motion `AnimatePresence` and `motion.div`.
- Lucide `CheckCircle2`, `AlertCircle`, and `X` icons.
- `position: fixed` through Tailwind classes.
- Top-right desktop placement.
- Responsive mobile width with horizontal margins.
- High z-index.
- Glassmorphism border/background/backdrop blur.
- Accessible `role` and `aria-live` behavior.
- Optional manual dismiss button.

Both managers render it as an overlay:

```tsx
<Toast
  message={feedback?.error ?? feedback?.success ?? null}
  variant={feedback?.error ? "error" : "success"}
  onDismiss={() => setFeedback(null)}
/>
```

Behavior:

- Success messages auto-dismiss after 2 seconds.
- Error messages remain visible until manually dismissed or replaced by another action.
- The timer is created and cleaned up inside the Toast component.
- The Toast never occupies document flow, so tables and filters do not shift.
- The edit reset effects in both managers must be preserved alongside the Toast.

## 17. Combined Transactions Module

Files:

```text
app/dashboard/transactions/page.tsx
components/transactions/transactions-manager.tsx
```

There is no Transaction Prisma model and no transaction server action.

The server page:

- Authenticates using `auth()`.
- Derives `userId` from the Auth.js session.
- Queries Income and Expense records with Prisma raw SQL and `UNION ALL` at the application/query layer.
- Scopes both tables to the authenticated user.
- Does not fetch the complete Income/Expense tables into the client.
- Applies server-side type filtering, search, sorting, count, limit, and offset pagination.
- Uses Expense category and payment method values where relevant.
- Uses Income source values as classification.
- Converts Decimal amounts for client display.
- Uses the stored User currency.

The client manager provides:

- All / Income only / Expenses only filtering.
- Search over description and notes.
- Newest, oldest, highest amount, lowest amount, and description sorting.
- Pagination.
- Desktop table.
- Mobile cards without horizontal overflow.
- Empty state.
- Loading state while changing filters/pages via `useTransition`.
- Positive green Income amounts.
- Negative Expense amounts.
- Source display for Income.
- Category and payment method display for Expenses.

Transaction route:

```text
/dashboard/transactions
```

Phase 7 is read-only. Do not add create/edit/delete actions unless a future phase explicitly requires it.

## 18. Exact Current Phase 7 Status

Phase 7 is implemented and verified by the developer.

The developer confirmed that:

- Income appears.
- Expenses appear.
- Positive and negative amounts display correctly.
- Combined view works.
- The route is protected.
- Filtering, searching, sorting, and pagination were implemented.
- Responsive desktop/mobile layouts were implemented.
- Empty/loading states were implemented.
- Cross-user isolation was implemented.
- The screenshot showed the intended Spendly glassmorphism design and combined records.

Do not proceed to Phase 8 until the developer explicitly asks to continue. If Phase 8 is requested, ask for the current relevant files first.

## 19. Remaining Phases 8–17

### Phase 8 — Budgets

Not started. Planned budget CRUD, period validation, category/overall budgets, usage calculations, ownership checks, and UI.

### Phase 9 — Savings Goals and Contributions

Not started as a dedicated module. Prisma models exist; goals dashboard display exists, but dedicated CRUD/contribution UI is not implemented.

### Phase 10 — Recurring Expenses

Not started as a dedicated module. Prisma model exists and dashboard upcoming-payment display exists, but CRUD UI is not implemented.

### Phase 11 — Analytics and Charts

Not started as a dedicated route/module. Dashboard charts exist, but `/dashboard/analytics` does not.

### Phase 12 — Reports, PDF, and CSV Export

Not started. `@react-pdf/renderer` is not installed and no separate CSV library is installed.

### Phase 13 — Categories and Safe Category Deletion

Partially complete only because default categories and the helper exist. Custom category management, icon/color UI, safe deletion, and reassignment workflow are not implemented.

### Phase 14 — Notifications and Alerts

Not started. Prisma Notification model exists, but notification generation and UI do not.

### Phase 15 — Account Settings and Preferences

Not started. User preference fields exist, but settings pages/actions do not.

### Phase 16 — Final UI/UX, Responsive, and Accessibility Polish

Partially complete. Glassmorphism, themes, responsive charts/cards, mobile cards, and Toast accessibility exist. Shared sidebar, navbar, mobile drawer, complete accessibility review, and final polish do not.

### Phase 17 — Security, Performance, Testing, and Production Review

Not started as a dedicated final review. Some ownership and authentication protections already exist, but a complete production-quality review is pending.

## 20. Known Issues and Safe Warnings

Known issues:

- Shared dashboard navigation is not implemented.
- Some dashboard links point to planned/nonexistent routes, including budgets, goals, recurring, transactions history links in future contexts, and other future modules. `/dashboard/transactions` is now implemented.
- Custom category management is not implemented.
- Budgets, dedicated goals, recurring expenses, analytics, reports, exports, notifications, and settings are not implemented.
- The dashboard still has hard-coded links to future modules.
- The current Prisma `package.json#prisma` seed configuration produces a deprecation warning that will matter in Prisma 7; the project remains on Prisma 6.19.3.
- Tailwind IntelliSense may warn about `@theme`, `@custom-variant`, or `@apply`; confirm with actual TypeScript, lint, and build commands before treating these as failures.

Previously resolved issues that must not be reintroduced:

- CSS side-effect TypeScript error.
- Unnecessary `@ts-ignore` lint error.
- Auth.js Edge Runtime warning caused by middleware.
- Windows Prisma EPERM generation issue.
- Zod 4 and resolver compatibility issue.
- PostCSS and sharp vulnerability issues.
- Missing default categories.
- Undefined payment method TypeScript error.
- Dashboard zero-data chart axis issue.

## 21. Important Architectural Decisions

- One Next.js App Router full-stack app; no separate backend.
- Server Components for database-backed reads.
- Server Actions for CRUD mutations.
- Prisma ORM with Neon PostgreSQL.
- Auth.js Credentials authentication.
- Session-derived ownership checks.
- Decimal storage for financial amounts.
- No Transaction database model; Combined Transactions is a query-level union.
- Income Category remains in Prisma but is intentionally absent from Income application logic/UI.
- Income Source is the primary Income classification.
- Expenses retain their required Category system.
- No middleware unless there is a deliberate, tested reason.
- Fixed Toast overlays must not occupy layout space.
- Existing modules should be changed only when the task genuinely requires it.
- Navigation is currently intentionally untouched.

## 22. Files That Must Not Be Unnecessarily Modified

Do not unnecessarily modify:

```text
prisma/schema.prisma
app/dashboard/layout.tsx
auth.ts
auth.config.ts
actions/expense-actions.ts
lib/validators/expense.ts
components/expenses/expense-manager.tsx
app/dashboard/expenses/page.tsx
components/income/income-manager.tsx
app/dashboard/income/page.tsx
components/ui/toast.tsx
```

The Expense module and category system must remain untouched when working on unrelated features. Do not rewrite the dashboard or completed modules merely to match a preferred style.

## 23. Exact Next Recommended Task

The next recommended task is **Phase 8 — Budgets**.

Before implementing Phase 8:

- Ask the developer for the current exact files relevant to Budgets.
- Inspect the current Budget Prisma model and existing dashboard budget-status logic.
- Confirm the intended budget scope before coding.
- Do not assume the old project structure or this conversation is more accurate than local files.
- Do not modify Income, Expense, Transactions, or Toast files unless the budget feature genuinely requires a shared change.

Likely new files may include a protected budget route, a budget manager component, a budget validator, and budget server actions, but these paths must be confirmed against the local project before creation.

## 24. Safe Development Workflow

Before changes:

```powershell
git status
```

After copying any changes, run:

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

For intentional Prisma schema changes only:

```powershell
npx prisma validate
npx prisma migrate dev --name descriptive_migration_name
npx prisma generate
```

Do not claim a command passed unless the developer supplies successful local output. The AI cannot run commands against the developer’s local VS Code project.

Manual testing should cover authenticated and unauthenticated access, ownership isolation, desktop/mobile behavior, empty/loading/error states, and regression testing of completed modules.

After testing:

```powershell
git status
git add .
git commit -m "Describe the completed change"
git push
```

Do not include `.env`, credentials, secrets, `node_modules`, `.next`, or `.vercel` in commits.

## 25. Coding Rules for Future AI Sessions

- Read this entire document before doing anything.
- Treat the local VS Code project as the source of truth.
- Ask the developer to paste the exact current contents of existing files before modifying them.
- Never reconstruct large existing files from memory.
- Never assume a previous AI-generated file is still the local file.
- Never rebuild the project from scratch.
- Never initialize a second architecture.
- Do not regenerate completed modules unnecessarily.
- Preserve the current architecture, dependencies, schema, security model, and design system.
- Provide complete replacement files when the developer requests complete files.
- Do not provide partial snippets when complete files are required.
- Do not use pseudocode or `...rest of code...`.
- Clearly identify created and modified files.
- Never expose secrets.
- Work module-by-module.
- Wait for explicit confirmation before moving to the next major phase.
- Do not mark a feature complete based only on generated code; require local verification and developer confirmation.

# CONTINUATION INSTRUCTIONS FOR NEW CHAT

1. Read `SPENDLY-CONTINUITY.md` completely before doing anything.
2. Treat the actual local VS Code project as the source of truth.
3. Ask the developer for the current exact contents of relevant existing files before modifying any existing code.
4. Never reconstruct large existing files from memory or from an old conversation.
5. Never rebuild completed modules unnecessarily.
6. Continue from the exact current phase documented here: Phase 7 is complete; Phase 8 — Budgets is next but has not started.
7. Do not assume anything from the previous Perplexity conversation beyond what is documented in this file and confirmed by current local files.
8. Preserve Expense functionality and categories when working on unrelated modules.
9. Preserve the Income Prisma category field while keeping Category out of the Income UI unless the developer explicitly changes that decision.
10. Preserve the fixed floating Toast behavior and edit-form reset effects.
11. Preserve the read-only query-level Combined Transactions architecture.
12. Before Phase 8 implementation, request and inspect the exact current budget-related files and confirm the intended scope.
13. Provide complete files when requested, run no local commands yourself, and never claim local verification without developer-provided output.
