Spendly Permanent Technical Handoff
This document is the technical continuity prompt for future AI coding sessions. The actual local VS Code project is the source of truth. The Perplexity sandbox is not the source of truth.

1. Project Overview
   Project name: Spendly

Spendly is a personal finance and expense-tracking SaaS application. It is designed to help users manage expenses, income, budgets, savings goals, recurring expenses, combined transactions, categories, analytics, reports, notifications, and account settings.

Architecture:

One Next.js App Router full-stack application.

Server Components for database-backed reads.

Server Actions for mutations.

Prisma ORM connected to Neon PostgreSQL.

Auth.js v5 Credentials authentication.

No separate backend.

No separate frontend.

No Express, Flask, Django, MongoDB, Firebase, or Supabase.

GitHub is used for persistent source control and backup.

The developer maintains the actual implementation locally in VS Code.

Current development status:

Phases 1–4 are complete.

Phase 5, Expenses, is in progress and mostly implemented.

The immediate unfinished task is making successful expense notifications disappear after two seconds.

Income and later modules are not implemented yet.

2. Exact Technology Stack
   Technology Current status/version
   Next.js 15.5.23 confirmed from local build output
   React Package range ^19.0.0; exact installed version not separately confirmed
   React DOM Package range ^19.0.0; exact installed version not separately confirmed
   TypeScript 5.9.3 confirmed locally
   Tailwind CSS Package range ^4.0.0; exact tailwindcss package version not separately confirmed
   @tailwindcss/postcss 4.3.3 confirmed from npm resolution
   PostCSS 8.5.26 resolved through npm overrides
   shadcn/ui components.json configured; generated shadcn components are NOT CONFIRMED — VERIFY IN LOCAL PROJECT
   Prisma Client 6.19.3 generated locally
   Prisma CLI Package range ^6.19.3
   Neon PostgreSQL Connected and working
   Auth.js / next-auth 5.0.0-beta.32
   React Hook Form 7.85.0
   @hookform/resolvers 5.7.1
   Zod 4.4.3
   Recharts 3.10.1
   Framer Motion Package range ^11.15.0; exact installed version not separately confirmed
   Lucide React Package range ^0.468.0; exact installed version not separately confirmed
   date-fns 4.4.0
   Resend 6.12.4
   bcryptjs 3.0.2
   next-themes Package range ^0.4.4
   geist Package range ^1.3.1
   clsx Package range ^2.1.1
   tailwind-merge Package range ^2.6.0
   dotenv Package range ^16.4.7
   tsx Package range ^4.19.2
   tw-animate-css Package range ^1.0.1
   sharp 0.35.3 resolved through npm overrides
   PDF library @react-pdf/renderer is not installed
   CSV library No separate CSV library is installed
   Current npm overrides:

json
"overrides": {
"postcss": "^8.5.23",
"sharp": "^0.35.3"
}
Security dependency status at the last confirmed check:

text
npm audit: found 0 vulnerabilities
Do not run npm audit fix --force without a deliberate upgrade plan. It previously attempted to upgrade Next.js to version 16.

3. Current Project Structure
   Important current files and directories:

text
app/
├── api/
│ └── auth/
│ └── [...nextauth]/
│ └── route.ts
├── dashboard/
│ ├── expenses/
│ │ ├── error.tsx
│ │ ├── loading.tsx
│ │ └── page.tsx
│ ├── error.tsx
│ ├── layout.tsx
│ ├── loading.tsx
│ └── page.tsx
├── forgot-password/
│ └── page.tsx
├── reset-password/
│ ├── page.tsx
│ └── reset-password-form.tsx
├── login/
│ └── page.tsx
├── register/
│ └── page.tsx
├── globals.css
├── layout.tsx
└── page.tsx

actions/
├── auth-actions.ts
├── expense-actions.ts
└── password-reset-actions.ts

components/
├── dashboard/
│ └── dashboard-charts.tsx
├── expenses/
│ └── expense-manager.tsx
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
└── expense.ts

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
public/ contents: NOT CONFIRMED — VERIFY IN LOCAL PROJECT.

Generated/ignored directories include node_modules/, .next/, and .vercel/; they must not be committed.

middleware.ts was removed intentionally and should not be recreated without a specific reason.

4. Database Architecture
   Prisma schema file:

text
prisma/schema.prisma
Datasource:

text
datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
directUrl = env("DIRECT_URL")
}
Generator:

text
generator client {
provider = "prisma-client-js"
}
Enums
text
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
User
Fields:

text
id String @id @default(cuid())
name String?
email String @unique
passwordHash String
image String?
currency String @default("INR")
theme String @default("system")
dateFormat String @default("DD/MM/YYYY")
emailVerified DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations:

text
passwordResetTokens PasswordResetToken[]
categories Category[]
expenses Expense[]
incomes Income[]
budgets Budget[]
goals Goal[]
goalContributions GoalContribution[]
recurringExpenses RecurringExpense[]
notifications Notification[]
Index:

text
@@index([createdAt])
PasswordResetToken
Fields:

text
id String @id @default(cuid())
tokenHash String @unique
userId String
expiresAt DateTime
usedAt DateTime?
createdAt DateTime @default(now())
Relation:

text
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
Indexes:

text
@@index([userId])
@@index([expiresAt])
Only the hash is stored. Raw reset tokens are not stored in the database.

Category
Fields:

text
id String @id @default(cuid())
userId String
name String
icon String @default("Tag")
color String @default("#8B5CF6")
type CategoryType @default(BOTH)
isDefault Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations:

text
user User
expenses Expense[]
incomes Income[]
budgets Budget[]
recurringExpenses RecurringExpense[]
goals Goal[]
Constraints/indexes:

text
@@unique([userId, name])
@@index([userId, type])
Default categories currently created:

text
Food & Dining
Transport
Shopping
Bills & Utilities
Entertainment
Health
Education
Travel
Rent
Other
Expense
Fields:

text
id String @id @default(cuid())
userId String
categoryId String
amount Decimal @db.Decimal(12, 2)
description String
paymentMethod PaymentMethod
date DateTime @db.Date
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations:

text
user User
category Category
Foreign keys:

text
user onDelete: Cascade
category onDelete: Restrict
Indexes:

text
@@index([userId, date])
@@index([userId, categoryId])
@@index([userId, paymentMethod])
@@index([userId, createdAt])
Income
Fields:

text
id String @id @default(cuid())
userId String
categoryId String?
amount Decimal @db.Decimal(12, 2)
description String
source IncomeSource
date DateTime @db.Date
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations: User and optional Category.

Foreign keys: User cascades; Category uses SetNull.

Indexes:

text
@@index([userId, date])
@@index([userId, categoryId])
@@index([userId, source])
@@index([userId, createdAt])
Budget
Fields:

text
id String @id @default(cuid())
userId String
categoryId String?
name String
amount Decimal @db.Decimal(12, 2)
periodStart DateTime @db.Date
periodEnd DateTime @db.Date
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations: User and optional Category.

Foreign keys: User cascades; Category restricts deletion.

Indexes/constraints:

text
@@index([userId, periodStart, periodEnd])
@@index([userId, categoryId])
@@unique([userId, name, periodStart])
Goal
Fields:

text
id String @id @default(cuid())
userId String
categoryId String?
name String
description String?
targetAmount Decimal @db.Decimal(12, 2)
targetDate DateTime? @db.Date
completedAt DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations: User, optional Category, and GoalContribution[].

Foreign keys: User cascades; Category uses SetNull.

Indexes:

text
@@index([userId, targetDate])
@@index([userId, completedAt])
GoalContribution
Fields:

text
id String @id @default(cuid())
userId String
goalId String
amount Decimal @db.Decimal(12, 2)
date DateTime @db.Date
note String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations: User and Goal.

Foreign keys: User cascades; Goal cascades.

Indexes:

text
@@index([userId, goalId, date])
@@index([userId, date])
RecurringExpense
Fields:

text
id String @id @default(cuid())
userId String
categoryId String
amount Decimal @db.Decimal(12, 2)
description String
paymentMethod PaymentMethod
frequency RecurringFrequency
nextDueDate DateTime @db.Date
isActive Boolean @default(true)
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations: User and required Category.

Foreign keys: User cascades; Category restricts deletion.

Indexes:

text
@@index([userId, nextDueDate])
@@index([userId, isActive])
@@index([userId, categoryId])
Notification
Fields:

text
id String @id @default(cuid())
userId String
type NotificationType
title String
message String
link String?
readAt DateTime?
createdAt DateTime @default(now())
Relation: User with cascade deletion.

Indexes:

text
@@index([userId, readAt])
@@index([userId, createdAt])
@@index([userId, type])
All monetary values use PostgreSQL Decimal/Numeric with Decimal(12,2). No financial database field uses JavaScript floating-point storage.

5. Authentication
   Auth.js files:

text
auth.ts
auth.config.ts
app/api/auth/[...nextauth]/route.ts
Auth.js version: next-auth@5.0.0-beta.32.

Implemented authentication:

Credentials provider only.

Registration at /register.

Login at /login.

Logout through Auth.js signOut.

JWT sessions.

bcryptjs password hashing.

Session user ID extension through types/next-auth.d.ts.

Protected dashboard through app/dashboard/layout.tsx.

Forgot password at /forgot-password.

Reset password at /reset-password.

Resend email delivery.

Secure random reset tokens.

SHA-256 token hashes.

One-hour expiry.

Single-use tokens.

Used tokens marked with usedAt.

Other active tokens removed after successful reset.

Generic forgot-password response.

middleware.ts was removed because it caused an Edge Runtime warning involving Auth.js and jose. Route protection currently happens through the server-side dashboard layout.

6. Security Architecture
   The authentication pattern is:

ts
const session = await auth();

if (!session?.user?.id) {
// reject or redirect
}

const userId = session.user.id;
Never trust userId supplied by the client.

Expense Server Actions:

Obtain the authenticated user ID from auth().

Validate input server-side with Zod.

Verify category ownership using the authenticated user ID.

Query expenses using both the record ID and authenticated user ID for updates/deletes.

Create records with the server-derived user ID.

Revalidate dashboard and expense routes after mutations.

Dashboard reads:

Obtain user ID from the server session.

Scope all Prisma queries by userId.

Convert Decimal values to regular numbers only at the server-to-client display boundary.

Default categories:

ensureDefaultCategories(userId) uses a server-derived user ID.

Registration creates categories nested under the newly created user.

Existing users receive missing defaults when opening Expenses.

Cross-user access prevention:

Every user-owned query includes userId.

Update/delete operations verify ownership before changing data.

Required category relations restrict unsafe deletion.

Client-provided IDs are never treated as proof of ownership.

7. Routes
   Route Visibility Status Purpose
   / Public Implemented Spendly landing page
   /login Public Implemented Credentials login
   /register Public Implemented Account registration
   /forgot-password Public Implemented Password reset request
   /reset-password Public Implemented Password replacement
   /dashboard Protected Implemented Data-driven financial dashboard
   /dashboard/expenses Protected Implemented Expense CRUD and filtering
   /api/auth/[...nextauth] Auth route Implemented Auth.js GET/POST handlers
   /dashboard/income Protected Not implemented Planned income module
   /dashboard/transactions Protected Not implemented Planned combined transactions
   /dashboard/budgets Protected Not implemented Planned budget module
   /dashboard/goals Protected Not implemented Planned goals module
   /dashboard/recurring Protected Not implemented Planned recurring module
   /dashboard/analytics Protected Not implemented Planned analytics module
   /dashboard/reports Protected Not implemented Planned reports module
   /dashboard/categories Protected Not implemented Planned category management
   /dashboard/settings Protected Not implemented Planned settings module
   Known dead/planned links may currently point to routes that do not exist yet, including /dashboard/expenses/new, /dashboard/transactions, /dashboard/budgets, /dashboard/goals, and /dashboard/recurring.

8. Completed Development Phases
   Phase 1 — Project foundation
   COMPLETE

Implemented:

Next.js App Router.

TypeScript strict configuration.

Tailwind CSS v4.

Glassmorphism design tokens.

Dark/light/system theme support.

Theme persistence.

Geist fonts.

Framer Motion.

Lucide icons.

Initial landing page.

shadcn configuration.

Phase 2 — Prisma + Neon
COMPLETE

Implemented:

Prisma schema.

Neon PostgreSQL connection.

Prisma migration.

Prisma seed script.

Decimal financial fields.

Relationships.

Foreign keys.

Cascades/restrictions.

Indexes.

Reusable Prisma client.

Phase 3 — Authentication
COMPLETE

Includes both the former Phase 3A and Phase 3B work:

Auth.js Credentials authentication.

Registration.

Login.

Logout.

JWT session handling.

bcrypt password hashing.

Protected dashboard layout.

Forgot password.

Reset password.

Resend.

Secure hashed reset tokens.

Expiration and single-use invalidation.

Phase 4 — Dashboard
COMPLETE

Implemented:

Current-month income.

Current-month expenses.

Balance.

Budget usage.

Expense trend chart.

Income versus expenses chart.

Top spending categories.

Recent transactions.

Budget status.

Goal progress.

Upcoming recurring payments.

Loading/error states.

Empty states.

Responsive charts.

Empty-chart visual polish.

Phase 5 — Expenses
IN PROGRESS / PARTIALLY COMPLETE

Implemented:

Expense listing.

Add expense.

Edit expense.

Delete expense.

Delete confirmation.

Search.

Category filtering.

Payment-method filtering.

Sorting.

Pagination.

React Hook Form.

Zod validation.

Server Actions.

Ownership checks.

Desktop table.

Mobile cards.

Loading state.

Empty state.

Error state.

Success/error feedback.

Default categories for new users.

Backfill of missing defaults for existing users.

Remaining:

Successful feedback must auto-dismiss after two seconds.

Final manual test checklist must be completed.

Phase 5 commit must be made after final tests.

Shared dashboard navigation is not yet implemented.

Custom category management is not yet implemented.

Phase 6 — Income
NOT STARTED

Phase 7 — Combined Transactions
NOT STARTED

Phase 8 — Budgets
NOT STARTED

Phase 9 — Savings Goals and Contributions
NOT STARTED

Phase 10 — Recurring Expenses
NOT STARTED

Phase 11 — Analytics and Charts
NOT STARTED as a dedicated module. Dashboard charts exist, but /dashboard/analytics does not.

Phase 12 — Reports, PDF download, and CSV export
NOT STARTED. @react-pdf/renderer is not installed.

Phase 13 — Categories and safe category deletion
PARTIALLY COMPLETE only because default categories and the helper exist. The full category management module is not implemented.

Not implemented:

/dashboard/categories.

Custom category creation.

Custom category editing.

Icon/color management UI.

Safe category deletion UI.

Reassignment workflow.

Phase 14 — Notifications and alerts
NOT STARTED. The Prisma model and seed notifications exist, but notification generation and UI do not.

Phase 15 — Account settings and preferences
NOT STARTED. User preference fields exist, but settings pages/actions do not.

Phase 16 — Final UI/UX, responsive, and accessibility polish
PARTIALLY COMPLETE. Glassmorphism, themes, responsive charts/cards, and empty states exist. Shared sidebar, navbar, mobile drawer, and complete accessibility review do not.

Phase 17 — Security, performance, testing, and production-quality review
NOT STARTED.

9. Current Phase
   Current phase:

text
Phase 5 — Expenses
Last completed task:

Added default categories for new users and existing users.

Upgraded @hookform/resolvers to version 5.7.1 for Zod 4 compatibility.

Confirmed TypeScript, lint, build, and audit pass.

Current task:

text
Auto-dismiss successful expense notifications after two seconds.
Likely file:

text
components/expenses/expense-manager.tsx
Expected behavior:

text
Expense added successfully → disappears after 2 seconds
Expense updated successfully → disappears after 2 seconds
Expense deleted successfully → disappears after 2 seconds
Errors → remain visible until another action or dismissal
Remaining work:

Implement the success feedback timeout with cleanup.

Run local TypeScript/lint/build checks.

Manually test add/edit/delete and timeout behavior.

Commit Phase 5.

Recommended next task after Phase 5 confirmation:

Build the shared dashboard shell/navigation before or during Phase 6 so users no longer need to type routes manually.

10. UI/UX Design System
    The supplied Spendly dashboard reference is the visual source of truth.

Implemented visual direction:

Dark midnight navy background.

Violet/purple primary accents.

Blue/cyan secondary accents.

Glassmorphic translucent surfaces.

Backdrop blur.

Thin borders.

Soft shadows.

Rounded cards.

Restrained neon glow.

Clean Geist typography.

Spacious layouts.

High-contrast financial values.

CSS design tokens and utilities are in:

text
app/globals.css
Important classes:

text
.glass-panel
.glass-panel-strong
.glow-primary
Current styles include:

Dark theme as the primary theme.

A separately designed light theme, not a simple inversion.

System theme support.

Violet gradient primary buttons.

Green success state.

Red destructive state.

Blue accent state.

Rounded corners based on CSS custom properties.

Tailwind v4 @theme inline variables.

@custom-variant dark.

Responsive cards and charts.

Mobile expense cards instead of a horizontally overflowing table.

Not yet implemented:

Fixed/collapsible sidebar.

Mobile drawer navigation.

Shared dashboard navbar.

Notification panel.

Profile menu.

Global search header.

11. Reusable Components
    components/theme-provider.tsx
    Wraps next-themes and enables persisted light/dark/system themes.

components/theme-toggle.tsx
Cycles through light, dark, and system themes.

components/dashboard/dashboard-charts.tsx
Client component using Recharts for:

Expense trend.

Income versus expense comparison.

Responsive chart sizing.

Currency formatting.

Empty chart states.

components/expenses/expense-manager.tsx
Client component responsible for:

Expense listing.

Desktop table.

Mobile cards.

Add/edit form.

React Hook Form.

Zod resolver.

Search controls.

Filters.

Sorting.

Pagination.

Delete confirmation.

Success/error feedback.

Known pending change: successful feedback should automatically disappear after two seconds.

12. Server Actions and Route Handlers
    actions/auth-actions.ts
    registerUser(formData)
    Validates name, email, and password with Zod.

Normalizes email to lowercase.

Rejects duplicate email.

Hashes password with bcryptjs.

Creates User.

Creates default Category records.

Returns { error?: string; success?: string }.

loginUser(formData)
Reads email, password, and callback URL.

Normalizes email.

Delegates to Auth.js signIn.

Redirects to dashboard on success.

Redirects to login on authentication failure.

actions/password-reset-actions.ts
requestPasswordReset(formData)
Validates email with Zod.

Returns a generic message.

Finds the user server-side.

Deletes previous active reset tokens.

Creates a secure random token.

Stores only a SHA-256 hash.

Sends a Resend email.

Deletes the token if email delivery fails.

resetPassword(formData)
Validates token, new password, and confirmation.

Hashes the submitted token.

Checks token existence, expiry, and used status.

Updates the password with bcryptjs.

Marks the token as used.

Deletes other reset tokens for that user.

actions/expense-actions.ts
createExpense(input)
Input:

text
amount
description
categoryId
paymentMethod
date
notes
Calls auth().

Gets userId from the session.

Validates input with expenseSchema.

Verifies the category belongs to the user.

Accepts only EXPENSE or BOTH categories.

Creates the expense with Decimal amount.

Revalidates dashboard and expenses pages.

updateExpense(id, input)
Authenticates with auth().

Validates input.

Verifies category ownership.

Finds the expense by both id and userId.

Updates only the authenticated user’s record.

Revalidates relevant pages.

deleteExpense(id)
Authenticates with auth().

Finds the expense by both id and userId.

Deletes only the authenticated user’s record.

Revalidates relevant pages.

app/api/auth/[...nextauth]/route.ts
Exports Auth.js GET and POST handlers.

13. Validation
    Expense validation file:

text
lib/validators/expense.ts
Current Expense schema fields:

text
amount
description
categoryId
paymentMethod
date
notes
Validation includes:

Amount must be numeric with up to two decimal places.

Amount must be greater than zero.

Description must be 2–120 characters.

Category is required.

Payment method must be an allowed enum value.

Date must use YYYY-MM-DD format.

Notes are optional and limited in length.

Payment methods:

text
CASH
UPI
CREDIT_CARD
DEBIT_CARD
BANK_TRANSFER
OTHER
React Hook Form uses:

ts
zodResolver(expenseSchema)
Current compatible versions:

text
zod@4.4.3
@hookform/resolvers@5.7.1 14. Current Dependencies
Relevant current package.json content:

json
{
"name": "spendly",
"version": "0.1.0",
"private": true,
"engines": {
"node": ">=20.11.0"
},
"overrides": {
"postcss": "^8.5.23",
"sharp": "^0.35.3"
},
"scripts": {
"dev": "next dev --turbopack",
"build": "next build",
"start": "next start",
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"db:generate": "prisma generate",
"db:validate": "prisma validate",
"db:migrate": "prisma migrate dev",
"db:push": "prisma db push",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"
},
"prisma": {
"seed": "tsx prisma/seed.ts"
},
"dependencies": {
"@hookform/resolvers": "^5.7.1",
"@prisma/client": "^6.19.3",
"bcryptjs": "^3.0.2",
"clsx": "^2.1.1",
"date-fns": "^4.4.0",
"framer-motion": "^11.15.0",
"geist": "^1.3.1",
"lucide-react": "^0.468.0",
"next": "^15.5.23",
"next-auth": "5.0.0-beta.32",
"next-themes": "^0.4.4",
"react": "^19.0.0",
"react-dom": "^19.0.0",
"react-hook-form": "^7.85.0",
"recharts": "^3.10.1",
"resend": "^6.12.4",
"tailwind-merge": "^2.6.0",
"zod": "^4.4.3"
},
"devDependencies": {
"@eslint/eslintrc": "^3.2.0",
"@tailwindcss/postcss": "^4.0.0",
"@types/node": "^22.10.2",
"@types/react": "^19.0.2",
"@types/react-dom": "^19.0.2",
"dotenv": "^16.4.7",
"eslint": "^9.17.0",
"eslint-config-next": "^15.5.23",
"prisma": "^6.19.3",
"tailwindcss": "^4.0.0",
"tsx": "^4.19.2",
"tw-animate-css": "^1.0.1",
"typescript": "^5.9.3"
}
} 15. Environment Variables
Names only; never include values:

text
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
.env must remain ignored and untracked. .env.example may be committed.

16. Current Known Issues
    Actual unfinished issues
    Successful Expense notifications remain visible permanently and need a two-second timeout.

Shared dashboard navigation is not implemented.

Users must type routes manually for modules that do not exist yet.

Some dashboard links point to future/nonexistent routes.

Custom category management is not implemented.

Income is not implemented.

Combined transactions are not implemented.

Budgets are not implemented.

Goals are not implemented as a dedicated UI module.

Recurring expenses are not implemented as a dedicated UI module.

Analytics is not implemented as a dedicated route.

Reports, PDF, and CSV exports are not implemented.

Notification generation/UI is not implemented.

Settings are not implemented.

Final accessibility/performance/security review is not complete.

Warnings
Prisma prints a non-blocking warning that package.json#prisma is deprecated and will be removed in Prisma 7. The project currently uses Prisma 6.19.3.

Resolved errors/issues
CSS side-effect TypeScript error.

Unnecessary @ts-ignore ESLint error.

Auth.js Edge Runtime warning caused by middleware.

Windows Prisma EPERM generation error.

Zod 4 and old resolver compatibility problem.

PostCSS vulnerability.

Sharp vulnerability.

Missing default categories for existing/new users.

Undefined paymentMethod TypeScript error.

Unused Link warning.

Dashboard zero-data chart axis issue.

Tailwind IntelliSense
Tailwind-specific warnings such as unknown @theme, @custom-variant, or @apply in the VS Code CSS language service are editor warnings, not necessarily application errors. The project currently builds successfully. Do not treat IntelliSense warnings as build failures without confirming with npx tsc --noEmit, npm run lint, or npm run build.

17. Development Workflow
    The actual project is maintained locally in VS Code.

Perplexity is used as the coding assistant.

The developer manually copies complete files from Perplexity into VS Code.

The Perplexity sandbox is not the source of truth.

No ZIP files are required.

GitHub is persistent source control and backup.

Neon is the persistent database.

Local PowerShell is used for commands.

Do not claim commands passed unless the developer provides local output showing success.

18. Coding Rules
    Future AI sessions must:

Never rebuild the project from scratch.

Never regenerate completed modules unnecessarily.

Never unnecessarily rewrite existing files.

Preserve the current architecture.

Preserve the existing database schema unless a genuine change is required.

Preserve Auth.js and session-derived ownership patterns.

Preserve the existing UI design system.

Reuse existing components and utilities.

Provide complete files for every created/modified file.

Never provide partial snippets.

Never provide pseudocode.

Never use ...rest of code....

Ask the developer to paste an existing file when its current contents are unknown.

Never guess an unknown file’s contents.

Clearly identify created and modified files.

Provide exact install commands.

Provide exact database commands.

Provide exact TypeScript/lint/build commands.

Provide browser-level manual tests.

Work module-by-module.

Wait for confirmation before moving to the next major phase.

Never include credentials, API keys, database URLs, passwords, or secret values.

Never create ZIP files.

19. Local Verification
    Recommended commands:

powershell
npm install
npm run dev
npm run lint
npx tsc --noEmit
npx prisma validate
npx prisma generate
npm run build
Database commands when schema changes are intentionally made:

powershell
npx prisma validate
npx prisma generate
npx prisma migrate dev --name descriptive_migration_name
npx prisma db seed
npx prisma studio
Do not claim any command passed unless the developer supplies successful local output.

20. Git Workflow
    Before changes:

powershell
git status
After testing:

powershell
git add .
git commit -m "Describe the completed change"
git push
Recommended current Phase 5 commit after the toast fix and functional testing:

powershell
git add .
git commit -m "Phase 5: add complete expenses management"
git push
GitHub is the persistent code backup and source-control location.

21. INSTRUCTIONS FOR A NEW AI SESSION
    This is an existing Spendly project. Do not create a new project, do not rebuild it, and do not initialize a second architecture.

Read SPENDLY-CONTINUITY.md first and use it as the technical context. The actual local VS Code project is the source of truth. Do not rely on the previous Perplexity sandbox.

Continue from:

text
Phase 5 — Expenses is in progress and mostly implemented.
The immediate task is:

text
Make successful Expense notifications disappear automatically after 2 seconds.
Before modifying any existing file:

Ask the developer to paste the current file if its exact contents are not available.

Provide complete replacement contents for every modified file.

Do not provide partial code.

Do not rewrite unrelated completed modules.

Preserve the current Prisma schema.

Preserve Auth.js Credentials authentication.

Preserve session-derived ownership checks.

Preserve the glassmorphic Spendly UI.

Preserve the current dependency versions unless a change is genuinely required.

After implementing the toast fix, provide:

Files created.

Files modified.

Complete source code.

Dependencies.

Environment variables.

Database commands, if any.

TypeScript, lint, and build commands.

Manual browser test checklist.

Recommended Git commit message.

Do not start Phase 6 until the developer explicitly confirms Phase 5 is complete.
