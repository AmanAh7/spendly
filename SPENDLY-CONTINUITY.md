# Spendly Project Continuity

This document is for transferring Spendly project context into a new AI conversation. It records the latest project state established in the current conversation and must be read completely before continuing development.

## Project Status

- Latest completed phase: **Phase 9 — Savings goals and contributions**.
- Next planned phase: **Phase 10 — Recurring expenses**.
- Phase 10 has not started in this conversation.
- The immediate next action is inspection, not implementation.

## Project Overview

Spendly is a personal-finance application for managing income, expenses, budgets, savings goals, goal contributions, combined transactions, and recurring expenses. The Dashboard provides a consolidated view of the user's current financial activity and progress.

The project uses:

- Next.js App Router.
- React and TypeScript.
- Prisma ORM.
- A Prisma-backed database.
- Auth.js/NextAuth-style authentication through `auth()` and `signOut()` imported from `@/auth`.
- Tailwind CSS utility classes.
- `lucide-react` for icons.
- `date-fns` for date calculations and formatting.
- Prisma `Decimal` values for monetary amounts.

The application uses server-rendered App Router pages for authenticated data loading. User-owned records are queried and mutated using the authenticated session user's ID.

## Architecture Decisions

- Authentication is checked on the server.
- Unauthenticated Dashboard access redirects to `/login`.
- Database access uses the shared Prisma client from `@/lib/prisma`.
- Monetary database values remain Prisma `Decimal` values until they are converted for display or serialized component props.
- Dashboard data is assembled on the server and passed into reusable UI components.
- Existing pages and components use a glassmorphism visual style with rounded panels, muted borders, responsive Tailwind layouts, and existing Toast conventions.
- Ownership is enforced through authenticated session data and Prisma query conditions.
- Client-provided `userId` values must never be trusted.
- Future changes should be small, isolated, and preserve unrelated code.

## Known Project Structure

Only paths established by the current conversation are listed here. The repository must be inspected before assuming additional files or exports.

### `app/`

The Next.js App Router directory.

Known file:

- `app/dashboard/page.tsx` — authenticated Dashboard page. It loads and combines current financial data, serializes budget and goal data, and renders Dashboard sections.

The Dashboard currently links to these routes:

- `/login`
- `/dashboard/expenses`
- `/dashboard/expenses/new`
- `/dashboard/income`
- `/dashboard/transactions`
- `/dashboard/budgets`
- `/dashboard/goals`
- `/dashboard/recurring`

The existence and implementation of all routes must be verified in the repository before modifying them.

### `actions/`

Contains existing server-side mutation logic. Exact filenames and exports were not established in the conversation and must be inspected before implementation.

### `components/`

Known Dashboard components:

- `components/dashboard/dashboard-charts` — renders the Dashboard chart data.
- `components/dashboard/budget-carousel` — renders serialized active budgets.
- `components/dashboard/goal-carousel` — renders serialized active savings goals.

Exact file extensions and component APIs must be verified in the repository before changes.

### `lib/`

Known shared files:

- `lib/prisma` — shared Prisma client.
- `lib/format` — contains `formatCurrency`, used for monetary display.

Other utilities must be inspected rather than invented.

### `prisma/`

Contains the Prisma schema and database-related files. The current application uses user, expense, income, category, budget, goal, goal-contribution, and recurring-expense data. The exact schema filename and complete field definitions must be inspected before any database change.

## Completed Work

### Phases 1–5 — COMPLETE

The early phases established the Spendly foundation, authenticated user-owned finance records, Prisma persistence, categories, the Dashboard, and the existing design system. The conversation does not contain a detailed historical changelog for each individual phase, so the repository remains the source of truth for exact implementation details.

All later features must preserve the foundation's authentication, ownership, monetary-value, routing, and UI conventions.

### Phase 6 — Income Management — COMPLETE

Income management is implemented and integrated into the Dashboard.

Current Dashboard behavior includes:

- Current-month income aggregation.
- Income included positively in the current balance.
- Income included in the six-month chart data.
- Recent income included in the combined recent-transactions list.
- An Add income button linking to `/dashboard/income`.

Income records are user-owned. Reads and mutations must use the authenticated session user ID.

### Phase 7 — Combined Transactions — COMPLETE

The Dashboard combines recent expenses and recent income into one transaction list.

Current behavior:

- Expenses use `type: "expense"`.
- Income uses `type: "income"`.
- The combined list is sorted by descending date.
- The list is limited to the latest six records.
- Expenses display with a minus sign and expense styling.
- Income displays with a plus sign and income styling.

Both source queries remain scoped to the authenticated user.

### Phase 8 — Budgets and Budget Usage — COMPLETE

Budget loading, active-budget selection, usage calculations, Dashboard summary integration, and the Budget Carousel are implemented.

Important files:

- `app/dashboard/page.tsx`
- `components/dashboard/budget-carousel`
- Existing budget schema/actions/routes, which must be inspected before modification.

The Dashboard serializes budget values before passing them to the client component. Serialized budget data includes:

- `id`
- `name`
- `typeLabel`
- `amount`
- `spent`
- `remaining`
- `usage`
- `exceededAmount`

### Phase 9 — Savings Goals and Contributions — COMPLETE

Savings goals and contributions are implemented, including the Dashboard Goal Carousel.

The Dashboard queries active goals with:

```text
completedAt: null
```

Goals are ordered by target date and then creation date. Each goal includes its target amount, optional target date, optional category, and related contribution amounts.

The Dashboard calculates:

- `saved`: sum of all contribution amounts.
- `remaining`: `Math.max(targetAmount - saved, 0)`.
- `progress`: `(saved / targetAmount) * 100` when the target is greater than zero; otherwise `0`.

Serialized goals contain:

- `id`
- `name`
- `categoryName`
- `targetAmount`
- `saved`
- `remaining`
- `progress`
- `targetDate`

The Dashboard passes goals to the carousel with:

```tsx
<GoalCarousel goals={serializedGoals} currency={currency} />
```

When there are no active goals, the Dashboard shows an empty state linking to `/dashboard/goals`.

Goal and contribution CRUD must enforce ownership. A user must not be able to access, modify, or delete another user's goal or contribution.

## Budget Rules

An overall budget has `categoryId: null`. It measures all expenses inside its active date range.

A category budget has a non-null `categoryId`. It measures only expenses with the matching category inside its active date range.

These rules are mandatory:

- Overall budget usage measures all matching expenses independently.
- Category budget usage measures only matching-category expenses.
- Category budgets must never be added into overall budget usage.
- Multiple overall budgets are not combined.
- The Dashboard selects one overall budget using the established behavior: the more recent `periodStart` wins; if periods start at the same time, the larger amount wins.
- Active budgets use `periodStart <= current date` and `periodEnd >= current date`.
- UTC date-only handling was added for active-budget date comparisons and must not be regressed.
- `spent` is the sum of matching expenses.
- `remaining` is clamped to zero when spending exceeds the budget.
- `usage` is calculated only when the budget amount is greater than zero.
- `exceededAmount` is the amount spent above the budget, clamped to zero otherwise.

The Budget Carousel displays active overall and category budgets independently. It must not change the overall-budget calculation or merge category budgets into it.

## Goal Rules

The project has a goal model and a related GoalContribution model. The exact Prisma schema must be inspected before any schema changes.

Current goal behavior:

- Active goals have `completedAt: null`.
- Goals with a non-null `completedAt` are excluded from the active Dashboard list.
- Goals may have an optional category.
- Contributions are summed to calculate saved progress.
- Goal target amounts and contribution amounts use Prisma Decimal in database operations.
- Goal CRUD and contribution CRUD require authenticated ownership checks.
- Client-provided `userId` must never control ownership.
- Goal progress is not allowed to produce negative remaining values.
- A zero target amount produces zero progress rather than a division-by-zero result.

The Goal Carousel supports multiple active goals and must preserve the existing visual design and prop shape.

## Current Dashboard

Known file:

- `app/dashboard/page.tsx`

Known components:

- `components/dashboard/dashboard-charts`
- `components/dashboard/budget-carousel`
- `components/dashboard/goal-carousel`

The current Dashboard includes:

- Greeting and current date.
- Monthly income summary.
- Monthly expense summary.
- Current balance.
- Savings-rate detail.
- Budget usage summary.
- Budget Carousel.
- Six-month income and expense charts.
- Top spending categories for the current month.
- Combined recent income and expense transactions.
- Goal Carousel.
- Upcoming recurring payments.
- View expenses button.
- Add income button.
- Add expense button.
- Sign-out action.

The Dashboard currently loads:

- Current-month expense aggregate.
- Current-month income aggregate.
- Current-month expense records.
- Six-month expense records.
- Six-month income records.
- Active budgets.
- Top expense category groups.
- Recent expenses.
- Recent income.
- Active goals.
- Upcoming active recurring expenses.

The existing recurring-payment Dashboard section queries active recurring expenses using the authenticated `userId`, `isActive: true`, and `nextDueDate >= now`, orders by next due date, and displays up to five records. This existing integration must be inspected and preserved during Phase 10.

Do not accidentally change:

- Session checks and login redirects.
- User ownership conditions.
- Current-month date ranges.
- Balance and savings-rate formulas.
- Overall and category budget separation.
- Combined transaction sorting and signs.
- Goal saved, remaining, and progress calculations.
- Chart data shape.
- Existing links and routes.
- Existing recurring-payment display behavior.
- Glassmorphism classes and responsive layout.

## UI and Design Conventions

Preserve the existing:

- Glassmorphism panels such as `glass-panel-strong`.
- Rounded card and button styling.
- Tailwind responsive layouts.
- Muted border and text colors.
- Primary, accent, success, and destructive color conventions.
- `lucide-react` icons.
- Existing Toast patterns.
- Empty-state patterns with links and `ChevronRight` icons.
- Existing Dashboard spacing and responsive behavior.

Do not replace the design system or introduce a new UI architecture without explicit approval.

## Authentication, Ownership, and Security

- Use `auth()` to obtain the authenticated session on server-rendered pages and server actions.
- Redirect unauthenticated users to `/login` where the existing page does so.
- Scope every user-owned database query to `session.user.id`.
- Verify ownership again for mutations involving an existing record.
- Never trust a client-provided `userId`.
- Do not expose another user's records through IDs supplied by the client.
- Preserve existing authorization behavior when adding recurring-expense functionality.

## Important Fixes That Must Not Regress

Important fixes made during Phases 8 and 9 include:

- UTC date-only handling for active budgets.
- Selection behavior when multiple overall budgets exist.
- Separation of overall and category budget usage.
- Budget Carousel integration.
- Goal Carousel integration.
- Dashboard Add Income button.
- Removal of unused imports and warnings.
- Correct handling of active goals through `completedAt: null`.
- Correct saved, remaining, and progress calculations for goals.

## Verification Status

The conversation reported the following local verification as passing:

```text
npm run lint
npx tsc --noEmit
npm run build
```

The reported results were:

- 0 ESLint errors.
- 0 ESLint warnings.
- TypeScript passing.
- Production build passing.

Phase 9 was also reported as manually tested, and the Goal Carousel was reported as working.

These are the latest reported results, not a fresh verification by the next chat. Do not claim that verification has passed again unless actual current terminal output is available. If any code has changed since those checks, rerun the commands before marking work complete.

## Development Constraints

The following instructions are important and must be followed:

- Do not break existing functionality.
- When modifying an existing file, preserve all unrelated existing code.
- Prefer complete, copy-pastable files or code when code is requested.
- Do not invent files, architecture, routes, APIs, models, or existing functionality.
- Inspect the provided or current code before modifying it.
- Do not immediately start coding when a new phase begins.
- Inspect existing files and schema first.
- Prefer the smallest safe changes.
- Do not modify unrelated modules.
- Preserve Prisma Decimal handling for monetary values.
- Preserve authenticated ownership checks.
- Preserve existing Toast and glassmorphism patterns.
- Test before marking a phase complete.
- Do not claim local verification without actual terminal output.

## Required Phase Workflow

Follow this sequence for future phases:

```text
INSPECT → PLAN → USER APPROVAL → IMPLEMENT → LOCAL VERIFICATION → MANUAL TESTING → COMPLETE → UPDATE CONTINUITY FILE
```

The continuity document should be updated after each major phase.

## Roadmap

- Phase 6 — Income management — COMPLETE
- Phase 7 — Combined transactions — COMPLETE
- Phase 8 — Budgets and budget usage — COMPLETE
- Phase 9 — Savings goals and contributions — COMPLETE
- Phase 10 — Recurring expenses — NEXT
- Phase 11 — Analytics and charts
- Phase 12 — Reports, PDF download, and CSV export
- Phase 13 — Categories and safe category deletion
- Phase 14 — Notifications and alerts
- Phase 15 — Account settings and preferences
- Phase 16 — Final UI/UX, responsive, and accessibility polish
- Phase 17 — Security, performance, testing, and production-quality review

## NEXT TASK

The next task is **Phase 10 — Recurring expenses**.

The immediate next step is to inspect the existing recurring-expense implementation before proposing any changes. Inspect the repository's current Prisma schema, recurring-expense actions, routes, pages, components, and the existing Dashboard integration.

Do not implement Phase 10 yet. After inspection, prepare a concise implementation plan and wait for user approval. Preserve all completed phases and all current Dashboard, budget, goal, authentication, ownership, Decimal, UI, and Toast behavior.

## Continuation Instructions for the New AI Chat

1. Read this entire file before responding.
2. Treat it as the continuity source for the current project context, while treating the repository as the source of truth for exact code.
3. Do not assume anything that is not documented here.
4. Begin with Phase 10, but begin with inspection only.
5. Inspect the existing recurring-expense files and schema before proposing implementation.
6. Do not modify files until the user approves the implementation plan.
7. Preserve all completed phases and unrelated existing code.
8. Use the required workflow: inspect, plan, approval, implement, verify, manually test, complete, and update this file.
