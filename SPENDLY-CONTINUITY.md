# Spendly Project Continuity

**Document purpose:** This file records the current Spendly project state so development can continue safely in a fresh ChatGPT or Perplexity conversation.

**Current milestone:** Phase 9 — Savings goals and contributions — COMPLETE

**Next milestone:** Phase 10 — Recurring expenses — NEXT

**Important:** Phase 10 implementation must not begin from this document alone. The next conversation must first inspect the existing recurring-expense implementation and then prepare a plan for approval.

---

## 1. Project Overview

### Purpose

Spendly is a personal finance application for recording and reviewing income and expenses, monitoring budgets, managing savings goals and contributions, viewing combined transactions, and tracking recurring expenses.

### Technology stack

The current project uses the following technologies and libraries in the existing application:

- Next.js App Router.
- TypeScript.
- React.
- Prisma ORM.
- A database accessed through Prisma.
- NextAuth/Auth.js-style authentication through `auth` and `signOut` imported from `@/auth`.
- Tailwind CSS utility classes.
- `lucide-react` for icons.
- `date-fns` for date calculations and formatting.
- Prisma `Decimal` values for monetary database fields.

### Authentication

Authenticated pages obtain the current session through `auth()`. The Dashboard checks `session?.user?.id` and redirects unauthenticated users to `/login`. Server actions use the authenticated session and must not trust a client-provided `userId`.

### Database and Prisma

Application data is accessed through the shared Prisma client imported from `@/lib/prisma`. User-owned records are queried using the authenticated user ID. Monetary values are stored and processed as Prisma `Decimal` values, with conversion to numbers only when preparing values for display or chart/component serialization.

### UI and design system

The application uses a glassmorphism-style interface with classes such as `glass-panel-strong`, rounded cards, muted borders, primary/accent colors, and responsive Tailwind layouts. Existing Toast patterns and visual conventions must be preserved. Icons are supplied by `lucide-react`.

### Architectural patterns

- Server-rendered App Router pages perform authentication and database reads on the server.
- User ownership is enforced in Prisma `where` clauses using the authenticated session user ID.
- Server actions are used for mutations such as sign-out and other existing CRUD flows.
- Prisma `Decimal` values are serialized before passing data to client components.
- Reusable dashboard UI is split into components, including charts, budget carousel, and goal carousel components.
- Dashboard data is assembled server-side and passed to presentation components through typed props.
- Existing functionality must be preserved through small, isolated changes.

---

## 2. Project Structure

Only files and folders currently established by the project context are listed below. Do not assume that additional files exist without inspecting the repository.

### `app/`

The Next.js App Router application directory. The known Dashboard page is:

- `app/dashboard/page.tsx` — authenticated financial overview page. It loads current-month income and expenses, six-month chart data, budgets, category spending, recent transactions, active goals, and upcoming recurring expenses.

The Dashboard also links to routes including:

- `/login`
- `/dashboard/expenses`
- `/dashboard/expenses/new`
- `/dashboard/income`
- `/dashboard/transactions`
- `/dashboard/budgets`
- `/dashboard/goals`
- `/dashboard/recurring`

The existence and implementation of every route must be verified in the repository before modification.

### `actions/`

Contains existing server-side action modules for application mutations. Exact files and exports must be inspected before future implementation. Do not invent action filenames, routes, or APIs.

### `components/`

Known Dashboard components:

- `components/dashboard/dashboard-charts` — renders the Dashboard income/expense chart data.
- `components/dashboard/budget-carousel` — renders active serialized budgets as a carousel.
- `components/dashboard/goal-carousel` — renders active serialized savings goals as a carousel.

Other component files may exist and must be inspected before changing related UI.

### `lib/`

Known shared files:

- `lib/prisma` — shared Prisma client imported by the Dashboard.
- `lib/format` — contains `formatCurrency`, used throughout the Dashboard for monetary display.

Other utilities must be inspected rather than assumed.

### `prisma/`

Contains the Prisma schema and database-related project files. The current context establishes models and relations for users, expenses, income, budgets, categories, goals, goal contributions, and recurring expenses, but the exact schema filename and complete model definitions must be inspected before making database changes.

---

## 3. Completed Phases

### Phase 1–5 — COMPLETE

Phases 1 through 5 established the initial Spendly application foundation and the existing personal-finance workflows. The current context does not provide a phase-by-phase historical changelog for these phases, so future conversations must inspect the repository rather than infer undocumented implementation details.

The established foundation includes authenticated user-owned data, Prisma-backed persistence, expense and income records, categories, the Dashboard, shared formatting utilities, and the existing visual design system.

Important rules inherited by all phases:

- User-owned records must be scoped to the authenticated session user.
- Client input must not be allowed to choose another user's records.
- Monetary values must preserve Prisma `Decimal` handling.
- Existing routes and behavior must not be broken by later phases.

### Phase 6 — Income Management — COMPLETE

Implemented income management and integrated income into the Dashboard.

Important behavior currently represented in the Dashboard:

- Current-month income is aggregated separately from expenses.
- Income contributes positively to the current balance.
- Recent income is included in the combined recent-transactions list.
- Income is included in the six-month chart data.
- The Dashboard provides an Add income button linking to `/dashboard/income`.

Security rules:

- Income records are user-owned.
- Reads and mutations must use the authenticated session user ID.
- A client-provided `userId` must never be trusted.

Important Dashboard integration:

- `currentIncomeAggregate` supplies the Monthly income summary.
- `monthlyIncome` supplies chart values.
- `recentIncome` supplies recent transaction rows.
- Income is represented with a positive amount and income styling.

### Phase 7 — Combined Transactions — COMPLETE

The Dashboard combines recent expenses and recent income into one `transactions` array, sorts the combined records by date, and displays the latest six records.

Important behavior:

- Expense records are marked as `type: "expense"`.
- Income records are marked as `type: "income"`.
- Expense and income records use distinct icons and visual treatment.
- Expense amounts display with a minus sign.
- Income amounts display with a plus sign.
- The combined list is sorted by descending transaction date.

Security rules:

- Both expense and income queries are scoped to the authenticated user.
- The combined presentation must not weaken ownership enforcement in either source query.

Important file:

- `app/dashboard/page.tsx`

### Phase 8 — Budgets and Budget Usage — COMPLETE

Implemented active budget loading, budget usage calculations, overall and category budget handling, Dashboard budget summaries, and the Budget Carousel.

Important files:

- `app/dashboard/page.tsx`
- `components/dashboard/budget-carousel`
- The Prisma schema and budget-related actions/routes, which must be inspected before modification.

Important Dashboard integrations:

- Budget usage appears in the summary cards.
- Active budgets appear in the Budget status card through `BudgetCarousel`.
- Budget values are serialized from Prisma `Decimal` values before being passed to the client component.

Security rules:

- Budgets are scoped to the authenticated user.
- Budget-related reads and mutations must verify ownership through the session user ID.

### Phase 9 — Savings Goals and Contributions — COMPLETE

Implemented savings goals and goal contributions, including Dashboard support for multiple active goals through the Goal Carousel.

Important files:

- `app/dashboard/page.tsx`
- `components/dashboard/goal-carousel`
- Goal and contribution actions/routes/schema files, which must be inspected before future changes rather than assumed.

Important Dashboard integrations:

- Active, incomplete goals are loaded with `completedAt: null`.
- Goals are ordered by target date and then creation date.
- Goal categories are supported through the optional category relation.
- Goal data is serialized before being passed to `GoalCarousel`.
- The Dashboard displays an empty state when there are no active goals.

Security rules:

- Goals and contributions are user-owned.
- Goal CRUD and contribution CRUD must verify that the authenticated user owns the target goal or contribution.
- Client-provided user IDs must never be trusted.

---

## 4. Budget System

### Overall budget versus category budget

An overall budget has `categoryId: null`. It measures all expenses for the budget's active date range, independently of expense categories.

A category budget has a non-null `categoryId`. It measures only expenses whose `categoryId` matches that budget's category and whose dates fall within the budget's active date range.

### Usage rules

- Overall budget usage measures all matching expenses.
- Category budget usage measures only matching-category expenses.
- Category budgets must never be added into overall budget usage.
- The Dashboard's overall budget summary must use the selected overall budget only.
- Multiple overall budgets are not combined.
- Budget usage is calculated independently for each serialized budget.
- `spent` is the sum of matching expenses.
- `remaining` is `Math.max(amount - spent, 0)`.
- `usage` is `(spent / amount) * 100` when the budget amount is greater than zero.
- `exceededAmount` is the amount spent above the budget, never below zero.

### Active dates

Active budgets are loaded when:

- `periodStart` is less than or equal to the current date.
- `periodEnd` is greater than or equal to the current date.

The Dashboard uses UTC date-only handling for the current-day boundary so active budget selection is not shifted unexpectedly by local time-zone conversions.

### Multiple overall budgets

Multiple active overall budgets are not summed. The current Dashboard selects one overall budget using the established behavior: the more recent `periodStart` wins; when period starts are equal, the budget with the greater amount wins.

This selection behavior must be preserved unless a future approved change explicitly replaces it.

### Budget Carousel

The Dashboard serializes ordered budgets into `SerializedBudget` objects and passes them to `BudgetCarousel`.

The serialized fields are:

- `id`
- `name`
- `typeLabel`
- `amount`
- `spent`
- `remaining`
- `usage`
- `exceededAmount`

The carousel displays active overall and category budgets without combining category budgets into the overall summary.

---

## 5. Goal System

### Goal model

The current application has a goal model with at least the following Dashboard-used fields:

- `id`
- `name`
- `targetAmount`
- `targetDate`
- optional category relation
- `completedAt`
- `createdAt`
- related contributions

The complete model definition must be inspected in the Prisma schema before future database changes.

### GoalContribution model

Goals have related contribution records. The Dashboard reads contribution amounts and totals them to calculate the amount saved for each goal.

The complete contribution model and action details must be inspected before changing contribution behavior.

### CRUD and ownership

Goal CRUD and contribution CRUD are complete in the current project context. Every read, create, update, and delete operation must verify ownership through the authenticated session user.

A contribution must not be created, edited, or deleted for a goal owned by another user. The application must never trust a client-provided `userId`.

### Completion behavior

The Dashboard treats goals with `completedAt: null` as active. Goals with a non-null `completedAt` are excluded from the active-goal query.

Changing completion behavior requires inspecting the existing goal actions and schema first.

### Calculations

For each active goal:

- `saved` is the sum of all related contribution amounts.
- `targetAmount` is the Prisma amount converted for serialization.
- `remaining` is `Math.max(targetAmount - saved, 0)`.
- `progress` is `(saved / targetAmount) * 100` when `targetAmount > 0`; otherwise it is `0`.

The Dashboard passes these serialized values to the Goal Carousel.

### Goal category support

A goal may have an optional category. The serialized value is `categoryName`, which is either the category name or `null`.

### Goal Carousel

`components/dashboard/goal-carousel` displays multiple active goals and supports navigating between them. The Dashboard passes:

```tsx
<GoalCarousel goals={serializedGoals} currency={currency} />
```

When no active goals exist, the Dashboard displays an empty state linking to `/dashboard/goals`.

---

## 6. Current Dashboard

The main Dashboard is `app/dashboard/page.tsx`.

Current functionality includes:

- Monthly income summary.
- Monthly expense summary.
- Current balance, calculated as monthly income minus monthly expenses.
- Savings-rate display.
- Overall budget usage summary.
- Budget Carousel for active overall and category budgets.
- Six-month income and expense charts through `DashboardCharts`.
- Top spending categories for the current month.
- Combined recent income and expense transactions.
- Goal Carousel for active savings goals.
- Upcoming active recurring payments.
- View expenses button.
- Add income button linking to `/dashboard/income`.
- Add expense button linking to `/dashboard/expenses/new`.
- Sign-out server action.

Important Dashboard data sources include:

- `currentExpenseAggregate`
- `currentIncomeAggregate`
- `currentExpenses`
- `monthlyExpenses`
- `monthlyIncome`
- `budgets`
- `categorySpendGroups`
- `recentExpenses`
- `recentIncome`
- `activeGoals`
- `upcomingRecurring`

Future phases must not accidentally change:

- Authenticated-user checks and `/login` redirect behavior.
- Monthly income and expense date ranges.
- Balance and savings-rate calculations.
- Overall versus category budget rules.
- Combined transaction sorting and signs.
- Goal saved, remaining, and progress calculations.
- Dashboard chart input shape.
- Existing links and routes.
- Recurring-payment display behavior while implementing Phase 10.
- Existing glassmorphism styling and responsive layout.

---

## 7. Current Verification Status

The project context reports the latest local verification as successful for:

```text
npm run lint
npx tsc --noEmit
npm run build
```

The reported status is:

- 0 ESLint errors.
- 0 ESLint warnings.
- TypeScript passing.
- Production build passing.

Phase 9 was also reported as manually tested, with the Goal Carousel working.

A new conversation must not represent these checks as freshly verified unless actual terminal output is provided for the current code state. If the code changes after the reported verification, run the commands again before claiming that verification passes.

---

## 8. Phase Roadmap

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

---

## 9. Phase 10 — Next Phase

# PHASE 10 — RECURRING EXPENSES

Recurring expenses are the next planned phase.

Do not design or implement Phase 10 from this document alone. The next conversation must first inspect the existing recurring-expense implementation, including the current Prisma schema, existing routes, actions, components, and Dashboard integration.

The current Dashboard already reads upcoming active recurring expenses through `prisma.recurringExpense.findMany`, filtering by:

- authenticated `userId`
- `isActive: true`
- `nextDueDate >= now`

It displays up to five upcoming records ordered by `nextDueDate`, including description, category, amount, and next due date. This existing behavior must be preserved while the Phase 10 plan is developed.

No Phase 10 implementation is included in this continuity document.

---

## 10. Important Development Rules

- Do not immediately start coding.
- Inspect existing files before implementation.
- Do not invent files, routes, database models, or APIs.
- Preserve existing functionality.
- Prefer the smallest safe changes.
- Do not modify unrelated modules.
- Do not claim local verification unless actual terminal output is provided.
- Use authenticated session ownership for all user-owned data.
- Never trust client-provided `userId`.
- Preserve Prisma `Decimal` for monetary values.
- Preserve existing Toast patterns.
- Preserve the existing glassmorphism/design system.
- Test before marking a phase complete.

---

## 11. Phase Completion Process

The development workflow is:

```text
INSPECT → PLAN → USER APPROVAL → IMPLEMENT → LOCAL VERIFICATION → MANUAL TESTING → COMPLETE → UPDATE CONTINUITY FILE
```

The continuity file must be updated after each major phase so the next conversation has an accurate project state.

---

## 12. Important Recent Fixes

The following fixes were made during Phase 8 and Phase 9:

- UTC date-only handling for active budgets.
- Multiple overall budget selection behavior.
- Budget Carousel implementation and Dashboard integration.
- Goal Carousel implementation and Dashboard integration.
- Dashboard Add Income button.
- Removal of unused imports and warnings.

These fixes should be preserved in future work.

---

## CONTINUATION INSTRUCTIONS FOR NEW CHAT

Read this file completely before responding to any new Spendly request.

Treat this file as the project continuity source, while recognizing that the repository itself is the source of truth for exact current implementation details.

Do not assume anything that is not documented here. Inspect the repository before making factual claims about files, routes, models, actions, or APIs.

Begin with Phase 10, but do not immediately implement it.

First inspect the existing recurring-expense files, Prisma schema, actions, routes, components, and Dashboard integration.

Do not modify anything until an implementation plan has been prepared and approved by the user.

Preserve all completed phases, especially income management, combined transactions, budgets, budget usage rules, savings goals, contributions, Budget Carousel behavior, Goal Carousel behavior, ownership checks, Prisma Decimal handling, Toast patterns, and the existing glassmorphism design system.

Follow the required workflow:

```text
INSPECT → PLAN → USER APPROVAL → IMPLEMENT → LOCAL VERIFICATION → MANUAL TESTING → COMPLETE → UPDATE CONTINUITY FILE
```
